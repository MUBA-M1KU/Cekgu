import { beforeEach, describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { Session } from '../auth'
import type { AppEnv } from '../session'

// The records API is almost entirely database behaviour, so it is tested against real Postgres.
// Opt in, local only, the same shape as the other database suites:
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/routes/records.test.ts
//
const url = process.env.TEST_DATABASE_URL
const describeDb = url ? describe : describe.skip

const LOCAL_ONLY = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//
if (url && !LOCAL_ONLY.test(url)) {
  throw new Error('TEST_DATABASE_URL must point at localhost. This suite truncates the database it connects to.')
}
if (url) process.env.DATABASE_URL = url

const { eq } = await import('drizzle-orm')
const { migrate } = await import('drizzle-orm/node-postgres/migrator')
const { createRecordResponseSchema, deleteRecordsResponseSchema, recordDetailSchema, recordListSchema } = await import(
  '../../shared/api'
)
const { db, pool } = await import('../db')
const { user } = await import('../db/auth-schema')
const { attempts, dispositions, items, records } = await import('../db/schema')
const { recordRoutes } = await import('./records')
const { env } = await import('../env')

type Who = 'guest' | 'private'
let who: Who = 'guest'

// The session is injected rather than signed in. These handlers read session.user and nothing else,
// and driving Better Auth here would test Better Auth instead of the contracts in TRD section 15.
const app = new Hono<AppEnv>()
app.use('*', async (c, next) => {
  const id = who === 'guest' ? 'guest-user' : 'private-user'
  const email = who === 'guest' ? env.guestEmail : 'educator@example.invalid'
  c.set('session', { user: { id, email } } as unknown as Session)
  await next()
})
app.route('/', recordRoutes)

const OPTIONS = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' }
]

function body(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Week 4 data structures quiz',
    subject: 'Computer Science',
    language: 'en',
    context: 'First-year practice set',
    items: [
      { stem: 'Which structure is first in, first out?', options: OPTIONS, key: 'A' },
      { stem: 'Which keyword declares a constant?', options: OPTIONS, key: 'B' }
    ],
    ...overrides
  }
}

const post = (path: string, payload?: unknown) =>
  app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  })

describeDb('the records API', () => {
  beforeEach(async () => {
    who = 'guest'
    await migrate(db, { migrationsFolder: './drizzle' })
    await db.delete(records)
    await db.delete(user)
    await db.insert(user).values([
      { id: 'guest-user', name: 'Guest', email: env.guestEmail },
      { id: 'private-user', name: 'An educator', email: 'educator@example.invalid' }
    ])
  })

  describe('POST /records', () => {
    test('it creates the record queued and answers the section 15 shape', async () => {
      const response = await post('/records', body())
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(createRecordResponseSchema.safeParse(json).success).toBe(true)
      expect(json.status).toBe('queued')
      expect(json.itemCount).toBe(2)
    })

    test('the items land in position order, queued and pending', async () => {
      const { id } = await (await post('/records', body())).json()
      const rows = await db.select().from(items).where(eq(items.recordId, id)).orderBy(items.position)

      expect(rows.map((row) => row.position)).toEqual([1, 2])
      expect(rows.every((row) => row.status === 'queued' && row.verdict === 'pending')).toBe(true)
    })

    test('a guest record carries a 24 hour expiry and a private one does not', async () => {
      const guest = await (await post('/records', body())).json()
      expect(guest.expiresAt).not.toBeNull()

      who = 'private'
      const priv = await (await post('/records', body())).json()
      expect(priv.expiresAt).toBeNull()
    })

    // FR-CHECK-2: a validation failure names the item index and the field.
    test('a bad item is refused by its position', async () => {
      const response = await post('/records', body({ items: [{ stem: '', options: OPTIONS, key: 'A' }] }))
      const json = await response.json()

      expect(response.status).toBe(422)
      expect(json.error.message).toStartWith('Question 1, stem')
    })

    test('a key that matches no option is refused', async () => {
      const response = await post('/records', body({ items: [{ stem: 'Which one?', options: OPTIONS, key: 'F' }] }))
      expect(response.status).toBe(422)
    })

    // FR-AUTH-5, enforced on the server rather than only in the form.
    test('a guest check past the item limit is refused', async () => {
      const many = Array.from({ length: 13 }, () => ({ stem: 'Which one?', options: OPTIONS, key: 'A' }))
      const response = await post('/records', body({ items: many }))
      const json = await response.json()

      expect(response.status).toBe(422)
      expect(json.error.code).toBe('guest_item_limit')
    })
  })

  describe('GET /records', () => {
    test('it lists newest first in the section 15 shape', async () => {
      await post('/records', body({ title: 'Older' }))
      await post('/records', body({ title: 'Newer' }))

      const json = await (await app.request('/records')).json()

      expect(recordListSchema.safeParse(json).success).toBe(true)
      expect(json.records[0].title).toBe('Newer')
      expect(json.records[0].itemCount).toBe(2)
      expect(json.records[0].attentionCount).toBe(0)
    })

    test('it never shows another account its records', async () => {
      await post('/records', body({ title: 'Guest paper' }))
      who = 'private'

      const json = await (await app.request('/records')).json()
      expect(json.records).toHaveLength(0)
    })

    test('search matches a stem, not only the title', async () => {
      await post(
        '/records',
        body({ title: 'Untitled', items: [{ stem: 'What is a semaphore?', options: OPTIONS, key: 'A' }] })
      )

      const hit = await (await app.request('/records?q=semaphore')).json()
      const miss = await (await app.request('/records?q=photosynthesis')).json()

      expect(hit.records).toHaveLength(1)
      expect(miss.records).toHaveLength(0)
    })

    test('the attention filter keeps only records with a non-clear verdict', async () => {
      const { id } = await (await post('/records', body())).json()
      const before = await (await app.request('/records?attention=true')).json()
      expect(before.records).toHaveLength(0)

      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db
        .update(items)
        .set({ verdict: 'possible_key_error' })
        .where(eq(items.id, item?.id ?? ''))

      const after = await (await app.request('/records?attention=true')).json()
      expect(after.records).toHaveLength(1)
      expect(after.records[0].attentionCount).toBe(1)
    })

    test('a soft-deleted record leaves the list', async () => {
      const { id } = await (await post('/records', body())).json()
      await db.update(records).set({ deletedAt: new Date() }).where(eq(records.id, id))

      const json = await (await app.request('/records')).json()
      expect(json.records).toHaveLength(0)
    })
  })

  describe('GET /records/:id', () => {
    test('it returns items, attempts and dispositions in the section 15 shape', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id)).orderBy(items.position)

      await db.insert(attempts).values([
        {
          itemId: item?.id ?? '',
          requestedModel: 'MiniMaxAI/MiniMax-M2.7',
          servedModel: 'MiniMaxAI/MiniMax-M2.7',
          requestId: 'req-1788416980465962869-369929',
          receiptStatus: 'verified',
          admitted: true,
          readingJson: { model: 'MiniMaxAI/MiniMax-M2.7', answer: 'B', defensible: ['B'], reason: 'Because.' },
          startedAt: new Date('2026-09-03T01:00:00Z')
        },
        {
          itemId: item?.id ?? '',
          requestedModel: 'moonshotai/Kimi-K2.6',
          receiptStatus: 'missing',
          admitted: false,
          rejectionReason: 'The call passed the 90 second evidence cutoff.',
          startedAt: new Date('2026-09-03T01:05:00Z')
        }
      ])

      const json = await (await app.request(`/records/${id}`)).json()

      expect(recordDetailSchema.safeParse(json).success).toBe(true)
      expect(json.items).toHaveLength(2)
      expect(json.counts.pending).toBe(2)
      // Newest first, per TRD section 15.
      expect(json.items[0].attempts[0].requestedModel).toBe('moonshotai/Kimi-K2.6')
      expect(json.items[0].attempts[1].reading.answer).toBe('B')
    })

    test('a timed-out attempt keeps its row and reports a null request id', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db.insert(attempts).values({
        itemId: item?.id ?? '',
        requestedModel: 'moonshotai/Kimi-K2.6',
        receiptStatus: 'missing',
        admitted: false,
        rejectionReason: 'The call passed the 90 second evidence cutoff.'
      })

      const json = await (await app.request(`/records/${id}`)).json()
      const attempt = json.items.flatMap((each: { attempts: unknown[] }) => each.attempts)[0]

      expect(attempt.requestId).toBeNull()
      expect(attempt.reading).toBeNull()
      expect(attempt.rejectionReason).toContain('90 second')
    })

    test('another account cannot read it', async () => {
      const { id } = await (await post('/records', body())).json()
      who = 'private'

      expect((await app.request(`/records/${id}`)).status).toBe(404)
    })
  })

  describe('DELETE /records', () => {
    test('a guest deletion is immediate and cascades', async () => {
      const { id } = await (await post('/records', body())).json()
      const response = await app.request('/records', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      const json = await response.json()

      expect(deleteRecordsResponseSchema.safeParse(json).success).toBe(true)
      expect(json.mode).toBe('immediate')
      expect(json.deleted).toEqual([id])
      expect(await db.select().from(records)).toHaveLength(0)
      expect(await db.select().from(items)).toHaveLength(0)
    })

    test('a private deletion is a soft delete', async () => {
      who = 'private'
      const { id } = await (await post('/records', body())).json()
      const json = await (
        await app.request('/records', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [id] })
        })
      ).json()

      expect(json.mode).toBe('trash')
      const [row] = await db.select().from(records).where(eq(records.id, id))
      expect(row?.deletedAt).not.toBeNull()
    })

    // FR-SAMPLE-2: skipped and named, not silently ignored.
    test('the sample refuses deletion and says so', async () => {
      const ordinary = await (await post('/records', body())).json()
      const sample = await (await post('/records', body({ title: 'Sample' }))).json()
      await db.update(records).set({ isSample: true }).where(eq(records.id, sample.id))

      const json = await (
        await app.request('/records', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids: [ordinary.id, sample.id] })
        })
      ).json()

      expect(json.deleted).toEqual([ordinary.id])
      expect(json.skipped).toEqual([{ id: sample.id, reason: 'sample' }])
      expect(await db.select().from(records)).toHaveLength(1)
    })
  })

  describe('POST /records/:id/duplicate', () => {
    test('it copies the questions and carries no evidence over', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db.insert(attempts).values({ itemId: item?.id ?? '', requestedModel: 'MiniMaxAI/MiniMax-M2.7' })

      const copy = await (await post(`/records/${id}/duplicate`)).json()
      const detail = await (await app.request(`/records/${copy.id}`)).json()

      expect(copy.status).toBe('queued')
      expect(detail.items).toHaveLength(2)
      expect(detail.items.flatMap((each: { attempts: unknown[] }) => each.attempts)).toHaveLength(0)
      expect(detail.isSample).toBe(false)
    })
  })

  describe('dispositions', () => {
    test('a disposition appends and never overwrites the machine verdict', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db
        .update(items)
        .set({ verdict: 'possible_key_error', verdictReason: 'Both readers chose Queue.', status: 'done' })
        .where(eq(items.id, item?.id ?? ''))
      await db.update(items).set({ status: 'done', verdict: 'clear' }).where(eq(items.position, 2))

      const json = await (
        await post(`/records/${id}/items/${item?.id}/disposition`, { kind: 'key_corrected', revisedKey: 'B' })
      ).json()

      expect(json.item.verdict).toBe('possible_key_error')
      expect(json.item.verdictReason).toBe('Both readers chose Queue.')
      expect(json.item.dispositions).toHaveLength(1)
      expect(json.recordStatus).toBe('resolved')
    })

    test('key_corrected without a revised key is refused', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))

      const response = await post(`/records/${id}/items/${item?.id}/disposition`, { kind: 'key_corrected' })
      expect(response.status).toBe(422)
    })

    test('one decision of two leaves the record in review', async () => {
      const { id } = await (await post('/records', body())).json()
      const rows = await db.select().from(items).where(eq(items.recordId, id)).orderBy(items.position)
      await db.update(items).set({ status: 'done', verdict: 'possible_ambiguity' }).where(eq(items.recordId, id))

      const json = await (
        await post(`/records/${id}/items/${rows[0]?.id}/disposition`, { kind: 'key_confirmed' })
      ).json()

      expect(json.recordStatus).toBe('in_review')
    })
  })

  describe('retry', () => {
    test('an unverified item is re-queued with a retry_requested boundary', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db
        .update(items)
        .set({ status: 'done', verdict: 'unverified', attemptsUsed: 3 })
        .where(eq(items.id, item?.id ?? ''))

      const json = await (await post(`/records/${id}/items/${item?.id}/retry`)).json()

      expect(json.recordStatus).toBe('checking')
      expect(json.item.status).toBe('queued')
      expect(json.item.verdict).toBe('pending')
      expect(json.item.attemptsUsed).toBe(0)

      const marks = await db
        .select()
        .from(dispositions)
        .where(eq(dispositions.itemId, item?.id ?? ''))
      expect(marks.map((mark) => mark.kind)).toEqual(['retry_requested'])
    })

    test('a decided item cannot be retried', async () => {
      const { id } = await (await post('/records', body())).json()
      const [item] = await db.select().from(items).where(eq(items.recordId, id))
      await db
        .update(items)
        .set({ status: 'done', verdict: 'clear' })
        .where(eq(items.id, item?.id ?? ''))

      const response = await post(`/records/${id}/items/${item?.id}/retry`)
      expect(response.status).toBe(409)
    })
  })

  describe('GET /sample', () => {
    test('it answers 404 until a sample is loaded', async () => {
      expect((await app.request('/sample')).status).toBe(404)
    })

    test('it returns the sample in the same shape as a record', async () => {
      const { id } = await (await post('/records', body({ title: 'The sample' }))).json()
      await db.update(records).set({ isSample: true }).where(eq(records.id, id))

      const json = await (await app.request('/sample')).json()

      expect(recordDetailSchema.safeParse(json).success).toBe(true)
      expect(json.isSample).toBe(true)
      await pool.end()
    })
  })
})
