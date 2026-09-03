import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'

// Seeding, protection and reset all move rows, so the test that means anything runs against real
// Postgres. Opt in:
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/sample.test.ts
//
// Name the file. ./db exports one pool built at first import.
const url = process.env.TEST_DATABASE_URL
const describeDb = url ? describe : describe.skip

const LOCAL_ONLY = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//
if (url && !LOCAL_ONLY.test(url)) {
  throw new Error('TEST_DATABASE_URL must point at localhost. This suite truncates the database it connects to.')
}

if (url) process.env.DATABASE_URL = url

const { eq } = await import('drizzle-orm')
const { migrate } = await import('drizzle-orm/node-postgres/migrator')
const { db, pool } = await import('./db')
const { user } = await import('./db/auth-schema')
const { dispositions, records } = await import('./db/schema')
const { sweepExpiredGuestRecords } = await import('./guest')
const { loadPass, readSample, resetSample, sampleRecordId, seedSample } = await import('./sample')
const { sampleRoutes } = await import('./routes/sample')

const OPTIONS = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' },
  { letter: 'C', text: 'Binary search tree' },
  { letter: 'D', text: 'Hash table' }
]

// Deliberately not a committed JSON fixture. FR-SAMPLE-1 forbids a fabricated sample, and a file
// of invented request ids sitting in the repo is exactly what someone would later seed by mistake.
const verified = (model: string, answer: string) => ({
  requestedModel: model,
  servedModel: model,
  requestId: `test-not-a-real-request-id-${model}-${answer}`,
  devshardId: '00000',
  fallbackHeader: null,
  httpStatus: 200,
  receiptStatus: 'verified' as const,
  receiptJson: { model },
  readingJson: { model, answer, defensible: [answer], reason: 'because' },
  latencyMs: 14300,
  admitted: true,
  rejectionReason: null
})

// Two calls the gateway served with one model, whatever was asked for. TRD section 14 proves
// distinctness by the receipt, so this is one reading, not two.
const substituted = (requested: string, served: string, answer: string) => ({
  ...verified(served, answer),
  requestedModel: requested,
  requestId: `test-not-a-real-request-id-${requested}-${answer}`
})

const timedOut = (model: string) => ({
  requestedModel: model,
  servedModel: null,
  requestId: null,
  devshardId: null,
  fallbackHeader: null,
  httpStatus: null,
  receiptStatus: 'missing' as const,
  receiptJson: null,
  readingJson: null,
  latencyMs: 90_000,
  admitted: false,
  rejectionReason: 'The call passed the 90 second evidence cutoff.'
})

const PASS = {
  pass: 'synthetic, for tests only',
  capturedAt: '2026-09-03T00:00:00.000Z',
  record: { title: 'Test paper', subject: 'Computer Science', language: 'en', context: null },
  items: [
    // Two verified readings agreeing on B against a key of A.
    { stem: 'FIFO?', options: OPTIONS, key: 'A', attempts: [verified('m-one', 'B'), verified('m-two', 'B')] },
    // One reading and one timeout: the fail-closed case the benchmark's ambiguous items hit.
    { stem: 'Ambiguous?', options: OPTIONS, key: 'A', attempts: [verified('m-one', 'A'), timedOut('m-two')] },
    // Two receipts naming the same served model. Distinct by what was requested, one reading by
    // what was served, and the served answer is the one that counts.
    {
      stem: 'Substituted?',
      options: OPTIONS,
      key: 'A',
      attempts: [substituted('m-one', 'm-same', 'B'), substituted('m-two', 'm-same', 'B')]
    }
  ]
}

async function writePass(body: unknown): Promise<string> {
  const path = `${process.env.RUNNER_TEMP ?? '/tmp'}/sample-pass-${crypto.randomUUID()}.json`
  await Bun.write(path, JSON.stringify(body))
  return path
}

describeDb('the sample record', () => {
  let passPath = ''

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' })
    passPath = await writePass(PASS)
  })

  beforeEach(async () => {
    await db.delete(records)
    await db.delete(user)
    await db
      .insert(user)
      .values({ id: 'guest-user', name: 'Guest', email: process.env.GUEST_EMAIL ?? 'guest@example.invalid' })
  })

  afterAll(async () => {
    await pool.end()
  })

  test('seeding inserts a protected record owned by the guest user', async () => {
    const id = await seedSample(passPath)
    expect(id).not.toBeNull()

    const [record] = await db.select().from(records).where(eq(records.isSample, true))
    expect(record?.userId).toBe('guest-user')
    expect(record?.status).toBe('ready')
    // Null expiry is the second protection: the sweep's comparison never matches it.
    expect(record?.expiresAt).toBeNull()
  })

  test('the guest sweep cannot delete it even with every guest record expired', async () => {
    await seedSample(passPath)
    await db
      .update(records)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(records.isSample, true))

    expect(await sweepExpiredGuestRecords()).toEqual([])
    expect(await sampleRecordId()).not.toBeNull()
  })

  test('verdicts are computed by the rule over the recorded readings, not copied from the file', async () => {
    await seedSample(passPath)
    const sample = await readSample()

    const [keyError, unverified] = sample?.items ?? []
    expect(keyError?.verdict).toBe('possible_key_error')
    expect(keyError?.verdictReason).toBe(
      'Both readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error.'
    )
    // One admitted reading is one opinion, so the rule refuses to decide.
    expect(unverified?.verdict).toBe('unverified')
  })

  test('two readings the gateway served with one model are not two readers', async () => {
    await seedSample(passPath)
    const sample = await readSample()

    // Both answered B against a key of A. Counting them as distinct would report a key error on
    // one model's opinion twice, which is the failure the receipt check exists to prevent.
    expect(sample?.items[2]?.verdict).toBe('unverified')
  })

  test('a rejected attempt is stored as evidence, with its reason', async () => {
    await seedSample(passPath)
    const sample = await readSample()

    const rejected = sample?.items[1]?.attempts.find((attempt) => !attempt.admitted)
    expect(rejected?.requestId).toBeNull()
    expect(rejected?.receiptStatus).toBe('missing')
    expect(rejected?.rejectionReason).toBe('The call passed the 90 second evidence cutoff.')
  })

  test('counts summarise the loaded pass', async () => {
    await seedSample(passPath)
    const sample = await readSample()

    expect(sample?.counts.possible_key_error).toBe(1)
    expect(sample?.counts.unverified).toBe(2)
    expect(sample?.isSample).toBe(true)
  })

  test('seeding twice does not make a second sample', async () => {
    const first = await seedSample(passPath)
    const second = await seedSample(passPath)

    expect(second).toBe(first as string)
    expect(await db.select().from(records).where(eq(records.isSample, true))).toHaveLength(1)
  })

  // The route a judge hits signed out. The session gate lives in routes/index.ts, which leaves
  // GET /sample public; POST /sample/reset sits behind it and is covered through resetSample.
  describe('GET /sample', () => {
    test('serves the record with its evidence', async () => {
      await seedSample(passPath)

      const response = await sampleRoutes.request('/sample')
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.isSample).toBe(true)
      expect(body.items).toHaveLength(3)
      expect(body.items[0].attempts[0].requestId).toContain('test-not-a-real-request-id')
    })

    test('says the sample is not loaded rather than answering empty', async () => {
      const response = await sampleRoutes.request('/sample')

      expect(response.status).toBe(404)
      expect((await response.json()).error.code).toBe('sample_not_loaded')
    })
  })

  describe('reset', () => {
    test('clears dispositions and returns the record to ready', async () => {
      await seedSample(passPath)
      const sample = await readSample()
      const itemId = sample?.items[0]?.id ?? ''

      await db.insert(dispositions).values({ itemId, kind: 'key_confirmed' })
      await db.update(records).set({ status: 'in_review' }).where(eq(records.isSample, true))

      expect(await resetSample()).toBe(true)

      const after = await readSample()
      expect(after?.items[0]?.dispositions).toHaveLength(0)
      expect(after?.status).toBe('ready')
      // The evidence itself is untouched.
      expect(after?.items[0]?.verdict).toBe('possible_key_error')
      expect(after?.items[0]?.attempts).toHaveLength(2)
    })

    test('reports false when no sample is loaded', async () => {
      expect(await resetSample()).toBe(false)
    })
  })

  describe('with no pass file', () => {
    test('loadPass returns null rather than throwing', async () => {
      expect(await loadPass('/tmp/definitely-not-here.json')).toBeNull()
    })

    test('seeding is a no-op, so a deployment without the benchmark simply has no sample', async () => {
      expect(await seedSample('/tmp/definitely-not-here.json')).toBeNull()
      expect(await sampleRecordId()).toBeNull()
    })

    test('a malformed pass file is rejected rather than half-seeded', async () => {
      const bad = await writePass({ pass: 'broken', capturedAt: 'now', record: {}, items: [] })

      expect(seedSample(bad)).rejects.toThrow()
      expect(await sampleRecordId()).toBeNull()
    })
  })
})
