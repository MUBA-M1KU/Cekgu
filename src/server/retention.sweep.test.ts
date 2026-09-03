import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

// Same shape and the same reasons as guest.sweep.test.ts: a hard delete is only really tested
// against real Postgres, so this is opt-in rather than skipped in CI by accident.
//
//   docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
//   TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu' bun test src/server/retention.sweep.test.ts
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
const { RETENTION_DAYS, TRASH_DAYS } = await import('../shared/schemas')
const { db, pool } = await import('./db')
const { user } = await import('./db/auth-schema')
const { attempts, dispositions, items, records } = await import('./db/schema')
const { sweepRetiredRecords } = await import('./retention')

const DAY_MS = 24 * 60 * 60 * 1000

describeDb('sweepRetiredRecords against real Postgres', () => {
  const ids = { trashed: '', justTrashed: '', stale: '', touched: '', sample: '', staleSample: '' }

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' })
    await db.delete(records)
    await db.delete(user)
    await db.insert(user).values({ id: 'private-user', name: 'An educator', email: 'educator@example.invalid' })

    const now = Date.now()
    const base = { userId: 'private-user', subject: 'Computer Science', language: 'en' }
    // A day either side of each boundary, so the test fails if a comparison is flipped rather
    // than only if the window is wrong.
    const pastTrash = new Date(now - (TRASH_DAYS + 1) * DAY_MS)
    const insideTrash = new Date(now - (TRASH_DAYS - 1) * DAY_MS)
    const pastRetention = new Date(now - (RETENTION_DAYS + 1) * DAY_MS)
    const insideRetention = new Date(now - (RETENTION_DAYS - 1) * DAY_MS)

    const inserted = await db
      .insert(records)
      .values([
        { ...base, title: 'Deleted past the trash window', deletedAt: pastTrash, updatedAt: pastTrash },
        { ...base, title: 'Deleted inside the trash window', deletedAt: insideTrash, updatedAt: insideTrash },
        { ...base, title: 'Untouched past retention', updatedAt: pastRetention },
        { ...base, title: 'Untouched inside retention', updatedAt: insideRetention },
        { ...base, title: 'The protected sample', isSample: true },
        // The sample is exempt from retention too, and it is old by construction: it is seeded
        // once at deploy and nobody edits it, so it crosses the window on its own.
        { ...base, title: 'The protected sample, aged out', isSample: true, updatedAt: pastRetention }
      ])
      .returning({ id: records.id, title: records.title })

    const find = (title: string) => inserted.find((row) => row.title === title)?.id ?? ''
    ids.trashed = find('Deleted past the trash window')
    ids.justTrashed = find('Deleted inside the trash window')
    ids.stale = find('Untouched past retention')
    ids.touched = find('Untouched inside retention')
    ids.sample = find('The protected sample')
    ids.staleSample = find('The protected sample, aged out')

    const [item] = await db
      .insert(items)
      .values({ recordId: ids.stale, position: 1, stem: 'Which one is first in, first out?', options: [], key: 'A' })
      .returning({ id: items.id })

    await db.insert(attempts).values({ itemId: item?.id ?? '', requestedModel: 'moonshotai/Kimi-K2.6' })
    await db.insert(dispositions).values({ itemId: item?.id ?? '', kind: 'key_confirmed' })
  })

  afterAll(async () => {
    await pool.end()
  })

  test('it purges the trash past its window and retires the record past retention', async () => {
    const { purged, retired } = await sweepRetiredRecords()
    expect(purged).toEqual([ids.trashed])
    expect(retired).toEqual([ids.stale])
  })

  test('everything inside either window survives', async () => {
    const left = (await db.select({ id: records.id }).from(records)).map((row) => row.id)
    expect(left.sort()).toEqual([ids.justTrashed, ids.touched, ids.sample, ids.staleSample].sort())
  })

  test('the sample is exempt from retention however old it is', async () => {
    expect(await db.select().from(records).where(eq(records.id, ids.staleSample))).toHaveLength(1)
  })

  test('items, attempts and dispositions go with a retired record', async () => {
    expect(await db.select().from(items)).toHaveLength(0)
    expect(await db.select().from(attempts)).toHaveLength(0)
    expect(await db.select().from(dispositions)).toHaveLength(0)
  })

  test('a second sweep finds nothing', async () => {
    expect(await sweepRetiredRecords()).toEqual({ purged: [], retired: [] })
  })
})
