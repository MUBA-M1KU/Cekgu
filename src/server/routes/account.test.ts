import { beforeEach, describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { Session } from '../auth'
import type { AppEnv } from '../session'

// Opt in, local only, the same shape as the other database suites:
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/routes/account.test.ts
//
const url = process.env.TEST_DATABASE_URL
const describeDb = url ? describe : describe.skip

const LOCAL_ONLY = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//
if (url && !LOCAL_ONLY.test(url)) {
  throw new Error('TEST_DATABASE_URL must point at localhost. This suite truncates the database it connects to.')
}
if (url) process.env.DATABASE_URL = url

const { migrate } = await import('drizzle-orm/node-postgres/migrator')
const { deleteRecordsResponseSchema } = await import('../../shared/api')
const { db } = await import('../db')
const { user } = await import('../db/auth-schema')
const { attempts, dispositions, items, records } = await import('../db/schema')
const { accountRoutes } = await import('./account')
const { env } = await import('../env')

type Who = 'guest' | 'private'
let who: Who = 'guest'

const app = new Hono<AppEnv>()
app.use('*', async (c, next) => {
  const id = who === 'guest' ? 'guest-user' : 'private-user'
  const email = who === 'guest' ? env.guestEmail : 'educator@example.invalid'
  c.set('session', { user: { id, email } } as unknown as Session)
  await next()
})
app.route('/', accountRoutes)

const erase = () => app.request('/account/records', { method: 'DELETE' })

describeDb('DELETE /account/records', () => {
  const ids = { guestLive: '', guestSample: '', privateLive: '', privateTrashed: '' }

  beforeEach(async () => {
    who = 'guest'
    await migrate(db, { migrationsFolder: './drizzle' })
    await db.delete(records)
    await db.delete(user)
    await db.insert(user).values([
      { id: 'guest-user', name: 'Guest', email: env.guestEmail },
      { id: 'private-user', name: 'An educator', email: 'educator@example.invalid' }
    ])

    const base = { subject: 'Computer Science', language: 'en' }
    const inserted = await db
      .insert(records)
      .values([
        { ...base, userId: 'guest-user', title: 'A guest record' },
        { ...base, userId: 'guest-user', title: 'The protected sample', isSample: true },
        { ...base, userId: 'private-user', title: 'A private record' },
        { ...base, userId: 'private-user', title: 'A private record in Trash', deletedAt: new Date() }
      ])
      .returning({ id: records.id, title: records.title })

    const find = (title: string) => inserted.find((row) => row.title === title)?.id ?? ''
    ids.guestLive = find('A guest record')
    ids.guestSample = find('The protected sample')
    ids.privateLive = find('A private record')
    ids.privateTrashed = find('A private record in Trash')

    const [item] = await db
      .insert(items)
      .values({ recordId: ids.privateLive, position: 1, stem: 'First in, first out?', options: [], key: 'A' })
      .returning({ id: items.id })

    await db.insert(attempts).values({ itemId: item?.id ?? '', requestedModel: 'moonshotai/Kimi-K2.6' })
    await db.insert(dispositions).values({ itemId: item?.id ?? '', kind: 'key_confirmed' })
  })

  test('it answers the same shape the per-record delete does, always immediate', async () => {
    who = 'private'
    const response = await erase()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(deleteRecordsResponseSchema.safeParse(json).success).toBe(true)
    expect(json.mode).toBe('immediate')
  })

  test('a private account loses its live records and its Trash together', async () => {
    who = 'private'
    const json = await (await erase()).json()

    expect(json.deleted.sort()).toEqual([ids.privateLive, ids.privateTrashed].sort())
    // FR-RECORD-8 is erasure, so the Trash copy a single deletion would have kept goes too.
    const left = (await db.select({ id: records.id }).from(records)).map((row) => row.id)
    expect(left.sort()).toEqual([ids.guestLive, ids.guestSample].sort())
  })

  test('items, attempts and dispositions go with the record', async () => {
    who = 'private'
    await erase()

    expect(await db.select().from(items)).toHaveLength(0)
    expect(await db.select().from(attempts)).toHaveLength(0)
    expect(await db.select().from(dispositions)).toHaveLength(0)
  })

  test('the sample survives and is named in the response', async () => {
    const json = await (await erase()).json()

    expect(json.deleted).toEqual([ids.guestLive])
    expect(json.skipped).toEqual([{ id: ids.guestSample, reason: 'sample' }])
    expect(await db.select({ id: records.id }).from(records).limit(3)).toContainEqual({ id: ids.guestSample })
  })

  test('another account is not touched', async () => {
    await erase()

    const left = (await db.select({ id: records.id }).from(records)).map((row) => row.id)
    expect(left.sort()).toEqual([ids.guestSample, ids.privateLive, ids.privateTrashed].sort())
  })

  test('a second call deletes nothing and still answers 200', async () => {
    who = 'private'
    await erase()
    const json = await (await erase()).json()

    expect(json.deleted).toEqual([])
    expect(json.skipped).toEqual([])
  })
})
