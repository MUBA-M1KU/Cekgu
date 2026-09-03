import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'

// Claim exclusivity is the one part of the queue that cannot be tested without a real database:
// SKIP LOCKED is a Postgres behaviour, and a mock would only assert what the mock was told. Opt in:
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/queue/claim.concurrency.test.ts
//
// Name the file. ./db exports one pool built at first import, so a whole-suite run may construct it
// against the preloaded placeholder before this file is reached.
const url = process.env.TEST_DATABASE_URL
const describeDb = url ? describe : describe.skip

// This file truncates the tables it touches, so it refuses to point anywhere but a local database.
const LOCAL_ONLY = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//
if (url && !LOCAL_ONLY.test(url)) {
  throw new Error('TEST_DATABASE_URL must point at localhost. This suite truncates the database it connects to.')
}

if (url) process.env.DATABASE_URL = url

const { migrate } = await import('drizzle-orm/node-postgres/migrator')
const { Pool } = await import('pg')
const { db, pool } = await import('../db')
const { user } = await import('../db/auth-schema')
const { items, records } = await import('../db/schema')
const { CLAIM_LEASE_MS, claimNextItem, releaseStaleClaims } = await import('./claim')

const OPTIONS = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' }
]

describeDb('claimNextItem under real concurrency', () => {
  let recordId = ''

  async function seed(count: number): Promise<void> {
    await db.delete(records)
    await db.delete(user)
    await db.insert(user).values({ id: 'queue-user', name: 'Q', email: 'q@example.invalid' })

    const [record] = await db
      .insert(records)
      .values({ userId: 'queue-user', title: 'Queue race', subject: 'CS', language: 'en' })
      .returning({ id: records.id })
    recordId = record?.id ?? ''

    await db.insert(items).values(
      Array.from({ length: count }, (_, i) => ({
        recordId,
        position: i + 1,
        stem: `Question ${i + 1}`,
        options: OPTIONS,
        key: 'A'
      }))
    )
  }

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' })
  })

  beforeEach(async () => {
    await seed(8)
  })

  afterAll(async () => {
    await pool.end()
  })

  // The deterministic one. A second connection holds the row the claim would take, so if the
  // locking clause were dropped or SKIP LOCKED lost, this either blocks or hands back the same row.
  test('a row another transaction holds is skipped, not waited on and not double-claimed', async () => {
    const holder = new Pool({ connectionString: url, max: 1 })
    const client = await holder.connect()

    try {
      await client.query('BEGIN')
      const held = await client.query(
        `SELECT id FROM items WHERE status = 'queued' ORDER BY record_id, position FOR UPDATE SKIP LOCKED LIMIT 1`
      )
      const heldId = String(held.rows[0]?.id)

      const claimed = await Promise.race([
        claimNextItem(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('claim blocked on a locked row')), 4000))
      ])

      expect(claimed).not.toBeNull()
      expect((claimed as { id: string }).id).not.toBe(heldId)

      await client.query('ROLLBACK')
    } finally {
      client.release()
      await holder.end()
    }
  })

  test('eight workers racing eight items take eight distinct items', async () => {
    const claims = await Promise.all(Array.from({ length: 8 }, () => claimNextItem()))
    const ids = claims.map((claim) => claim?.id)

    expect(ids.every((id) => typeof id === 'string')).toBe(true)
    expect(new Set(ids).size).toBe(8)
  })

  // Contention above supply is where a naive claim hands the same row to two workers.
  test('twelve workers racing three items produce three claims and nine misses, never a duplicate', async () => {
    await seed(3)

    const claims = await Promise.all(Array.from({ length: 12 }, () => claimNextItem()))
    const taken = claims.filter((claim): claim is NonNullable<typeof claim> => claim !== null)

    expect(taken).toHaveLength(3)
    expect(new Set(taken.map((claim) => claim.id)).size).toBe(3)
    expect(claims.filter((claim) => claim === null)).toHaveLength(9)
  })

  test('a claimed item is no longer queued, so a later sweep of workers cannot see it', async () => {
    const first = await claimNextItem()
    const rest = await Promise.all(Array.from({ length: 8 }, () => claimNextItem()))

    expect(rest.map((claim) => claim?.id)).not.toContain(first?.id)
  })

  test('claims come out in record and position order', async () => {
    const positions: number[] = []
    for (let i = 0; i < 8; i += 1) {
      const claim = await claimNextItem()
      if (claim) positions.push(claim.position)
    }

    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  describe('releaseStaleClaims', () => {
    const pastTheLease = () => new Date(Date.now() + CLAIM_LEASE_MS + 1_000)

    test('returns items stranded in running and lets them be claimed again', async () => {
      const stranded = await Promise.all([claimNextItem(), claimNextItem(), claimNextItem()])
      expect(stranded.every((claim) => claim !== null)).toBe(true)

      expect(await releaseStaleClaims(pastTheLease())).toBe(3)

      const reclaimed = await Promise.all(Array.from({ length: 8 }, () => claimNextItem()))
      expect(reclaimed.filter((claim) => claim !== null)).toHaveLength(8)
    })

    // The half that matters on a deploy: an incoming instance must not re-queue items the outgoing
    // one is still working, or the gateway is called twice for one item and paid for twice.
    test('a claim younger than the lease is left where it is', async () => {
      await Promise.all([claimNextItem(), claimNextItem(), claimNextItem()])

      expect(await releaseStaleClaims()).toBe(0)
    })

    test('it is a no-op when nothing is running', async () => {
      expect(await releaseStaleClaims(pastTheLease())).toBe(0)
    })
  })
})
