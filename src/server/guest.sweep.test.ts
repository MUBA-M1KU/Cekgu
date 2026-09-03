import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

// The sweep is a hard delete, so the test that matters is the one that runs against real Postgres
// and watches what survives. It is opt-in rather than skipped in CI by accident:
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/guest.sweep.test.ts
//
// Name the file. ./db exports one pool built at first import, so in a whole-suite run another file
// may construct it against the preloaded placeholder before this one is reached, and every query
// here then dies on a database that is not listening. A dedicated process removes the race.
//
const url = process.env.TEST_DATABASE_URL
const describeDb = url ? describe : describe.skip

// This file truncates the records and user tables in beforeAll, so it refuses to point anywhere
// but a local database. One pasted Neon URL would otherwise destroy production in silence, and a
// skip would hide the mistake rather than report it.
const LOCAL_ONLY = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//
if (url && !LOCAL_ONLY.test(url)) {
  throw new Error('TEST_DATABASE_URL must point at localhost. This suite truncates the database it connects to.')
}

// Overrides the preloaded placeholder before ./db resolves, so the pool points at the real
// test database. new Pool() does not connect, so a skipped run still reaches nothing.
if (url) process.env.DATABASE_URL = url

const { eq } = await import('drizzle-orm')
const { migrate } = await import('drizzle-orm/node-postgres/migrator')
const { db, pool } = await import('./db')
const { user } = await import('./db/auth-schema')
const { attempts, dispositions, items, records } = await import('./db/schema')
const { sweepExpiredGuestRecords } = await import('./guest')

describeDb('sweepExpiredGuestRecords against real Postgres', () => {
  const ids = { expired: '', sample: '', fresh: '', private: '', otherAccount: '' }

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' })
    await db.delete(records)
    await db.delete(user)
    await db.insert(user).values([
      { id: 'guest-user', name: 'Guest', email: 'guest@example.invalid' },
      { id: 'private-user', name: 'An educator', email: 'educator@example.invalid' }
    ])

    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000)
    const base = { userId: 'guest-user', subject: 'Computer Science', language: 'en' }

    const inserted = await db
      .insert(records)
      .values([
        { ...base, title: 'Expired guest record', expiresAt: anHourAgo },
        { ...base, title: 'The protected sample', expiresAt: anHourAgo, isSample: true },
        { ...base, title: 'Guest record still in date', expiresAt: inAnHour },
        { ...base, title: 'A private record', expiresAt: null },
        // The invariant the sweep must not assume: a past expiry on somebody else's row.
        { ...base, userId: 'private-user', title: 'Another account, expired', expiresAt: anHourAgo }
      ])
      .returning({ id: records.id, title: records.title })

    const find = (title: string) => inserted.find((row) => row.title === title)?.id ?? ''
    ids.expired = find('Expired guest record')
    ids.sample = find('The protected sample')
    ids.fresh = find('Guest record still in date')
    ids.private = find('A private record')
    ids.otherAccount = find('Another account, expired')

    const [item] = await db
      .insert(items)
      .values({ recordId: ids.expired, position: 1, stem: 'Which one is first in, first out?', options: [], key: 'A' })
      .returning({ id: items.id })

    await db.insert(attempts).values({ itemId: item?.id ?? '', requestedModel: 'moonshotai/Kimi-K2.6' })
    await db.insert(dispositions).values({ itemId: item?.id ?? '', kind: 'key_confirmed' })
  })

  afterAll(async () => {
    await pool.end()
  })

  test('it removes the expired guest record and nothing else', async () => {
    expect(await sweepExpiredGuestRecords()).toEqual([ids.expired])

    const left = (await db.select({ id: records.id }).from(records)).map((row) => row.id)
    expect(left.sort()).toEqual([ids.sample, ids.fresh, ids.private, ids.otherAccount].sort())
  })

  test('the expired sample survives its own expiry', async () => {
    expect(await db.select().from(records).where(eq(records.id, ids.sample))).toHaveLength(1)
  })

  test('an expired record belonging to another account is not touched', async () => {
    expect(await db.select().from(records).where(eq(records.id, ids.otherAccount))).toHaveLength(1)
  })

  test('its items, attempts and dispositions go with it', async () => {
    expect(await db.select().from(items)).toHaveLength(0)
    expect(await db.select().from(attempts)).toHaveLength(0)
    expect(await db.select().from(dispositions)).toHaveLength(0)
  })

  test('a second sweep finds nothing', async () => {
    expect(await sweepExpiredGuestRecords()).toEqual([])
  })
})
