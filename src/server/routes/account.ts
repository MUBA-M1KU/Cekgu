import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { records } from '../db/schema'
import { type AppEnv, sessionOf } from '../session'

export const accountRoutes = new Hono<AppEnv>()

// FR-RECORD-8. A hard delete for both account kinds, including anything already in Trash, rather
// than the soft delete DELETE /api/records performs. A control labelled Delete All that left a
// recoverable copy behind for thirty days would not be telling the truth, and this is the erasure
// route a person exercising their PDPA rights reaches for. Items, attempts and dispositions go
// with the record through the cascade.
//
// The sample is refused and named in the response, as it is on every other mutating route
// (FR-SAMPLE-2). On Guest that matters: the sample is owned by the Guest user, so without this
// the first person to press the button would take the demo record with them.
accountRoutes.delete('/account/records', async (c) => {
  const session = sessionOf(c)

  const owned = await db
    .select({ id: records.id, isSample: records.isSample })
    .from(records)
    .where(eq(records.userId, session.user.id))

  const skipped = owned.filter((row) => row.isSample).map((row) => ({ id: row.id, reason: 'sample' }))

  const deleted = await db
    .delete(records)
    .where(and(eq(records.userId, session.user.id), eq(records.isSample, false)))
    .returning({ id: records.id })

  return c.json({ deleted: deleted.map((row) => row.id), skipped, mode: 'immediate' as const })
})
