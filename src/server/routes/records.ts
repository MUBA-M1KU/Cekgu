import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { createRecordSchema, deleteRecordsSchema, dispositionSchema } from '../../shared/schemas'
import { db } from '../db'
import { dispositions, items, records } from '../db/schema'
import { guestExpiresAt, guestLimitRejection, guestRecordsHeld } from '../guest'
import { itemDetail, listRecords, recordDetail } from '../records/queries'
import { type AppEnv, isGuest, sessionOf } from '../session'

export const recordRoutes = new Hono<AppEnv>()

const SSE_KEEPALIVE_MS = 20_000
const SSE_POLL_MS = 1_500
// A record that never reaches a terminal status would otherwise hold a connection and query every
// 1.5 s forever. The client reconnects, so this bounds one stream rather than the watching; what it
// really bounds is an instance kept alive by a stream that can never finish — on a preview, where
// WORKER_ENABLED is false, nothing advances a record at all.
const SSE_MAX_STREAM_MS = 4 * 60 * 1000

function invalid(message: string, code = 'invalid_request') {
  return { error: { code, message } } as const
}

// FR-CHECK-2 wants the item index and field named, which is what zod's path already carries.
function firstIssue(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0]
  if (!issue) return 'That submission is not valid.'

  const [scope, index, field] = issue.path
  if (scope === 'items' && typeof index === 'number') {
    return `Question ${index + 1}${field ? `, ${String(field)}` : ''}: ${issue.message}`
  }
  return issue.message
}

recordRoutes.post('/records', async (c) => {
  const session = sessionOf(c)
  const parsed = createRecordSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json(invalid(firstIssue(parsed.error), 'validation_failed'), 422)

  const input = parsed.data
  const guest = isGuest(session)

  if (guest) {
    const rejection = guestLimitRejection(input, await guestRecordsHeld(session.user.id))
    if (rejection) return c.json({ error: rejection }, 422)
  }

  // The queue does the work, so this returns as soon as the rows exist (NFR-PERF-1).
  const [record] = await db
    .insert(records)
    .values({
      userId: session.user.id,
      title: input.title,
      subject: input.subject,
      language: input.language,
      context: input.context ?? null,
      expiresAt: guest ? guestExpiresAt() : null
    })
    .returning()

  if (!record) return c.json(invalid('That check could not be created.', 'create_failed'), 500)

  await db.insert(items).values(
    input.items.map((item, index) => ({
      recordId: record.id,
      position: index + 1,
      stem: item.stem,
      options: item.options,
      key: item.key
    }))
  )

  return c.json(
    {
      id: record.id,
      status: record.status,
      itemCount: input.items.length,
      expiresAt: record.expiresAt?.toISOString() ?? null
    },
    201
  )
})

recordRoutes.get('/records', async (c) => {
  const session = sessionOf(c)
  const attention = c.req.query('attention')

  const list = await listRecords(session.user.id, {
    status: c.req.query('status'),
    subject: c.req.query('subject'),
    attention: attention === 'true',
    q: c.req.query('q')
  })

  return c.json({ records: list })
})

recordRoutes.get('/records/:id', async (c) => {
  const owned = await ownedRecord(c.req.param('id'), sessionOf(c).user.id)
  if (!owned) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  const detail = await recordDetail(owned.id)
  if (!detail) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  return c.json(detail)
})

recordRoutes.delete('/records', async (c) => {
  const session = sessionOf(c)
  const parsed = deleteRecordsSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json(invalid(firstIssue(parsed.error), 'validation_failed'), 422)

  const owned = await db
    .select({ id: records.id, isSample: records.isSample })
    .from(records)
    .where(and(eq(records.userId, session.user.id), inArray(records.id, parsed.data.ids), isNull(records.deletedAt)))

  // FR-SAMPLE-2. Named in the response rather than silently ignored, so the confirmation can say so.
  const skipped = owned.filter((row) => row.isSample).map((row) => ({ id: row.id, reason: 'sample' }))
  const deletable = owned.filter((row) => !row.isSample).map((row) => row.id)

  if (deletable.length > 0) {
    // FR-RECORD-7. Guest carries no recovery promise, so it is a hard delete and the cascade takes
    // the items with it; a private record goes to Trash for 30 days.
    if (isGuest(session)) {
      await db.delete(records).where(inArray(records.id, deletable))
    } else {
      await db.update(records).set({ deletedAt: new Date() }).where(inArray(records.id, deletable))
    }
  }

  return c.json({ deleted: deletable, skipped, mode: isGuest(session) ? 'immediate' : 'trash' })
})

recordRoutes.post('/records/:id/duplicate', async (c) => {
  const session = sessionOf(c)
  const source = await recordDetail(c.req.param('id'))

  // The sample may be duplicated by anyone; the copy is an ordinary record (TRD section 15).
  if (!source || (!source.isSample && !(await ownedRecord(source.id, session.user.id)))) {
    return c.json(invalid('That record does not exist.', 'not_found'), 404)
  }

  const guest = isGuest(session)
  if (guest) {
    const asInput = {
      title: source.title,
      subject: source.subject,
      language: source.language,
      context: source.context,
      items: source.items.map((item) => ({ stem: item.stem, options: item.options, key: item.key }))
    }
    const rejection = guestLimitRejection(asInput, await guestRecordsHeld(session.user.id))
    if (rejection) return c.json({ error: rejection }, 422)
  }

  const [copy] = await db
    .insert(records)
    .values({
      userId: session.user.id,
      title: source.title,
      subject: source.subject,
      language: source.language,
      context: source.context,
      expiresAt: guest ? guestExpiresAt() : null
    })
    .returning()

  if (!copy) return c.json(invalid('That record could not be copied.', 'duplicate_failed'), 500)

  await db.insert(items).values(
    source.items.map((item) => ({
      recordId: copy.id,
      position: item.position,
      stem: item.stem,
      options: item.options,
      key: item.key
    }))
  )

  return c.json(
    {
      id: copy.id,
      status: copy.status,
      itemCount: source.items.length,
      expiresAt: copy.expiresAt?.toISOString() ?? null
    },
    201
  )
})

recordRoutes.post('/records/:id/items/:itemId/disposition', async (c) => {
  const session = sessionOf(c)
  const record = await dispositionTarget(c.req.param('id'), session.user.id)
  if (!record) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  const parsed = dispositionSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json(invalid(firstIssue(parsed.error), 'validation_failed'), 422)

  const input = parsed.data
  if (input.kind === 'key_corrected' && !input.revisedKey) {
    return c.json(invalid('Choose the corrected key.', 'validation_failed'), 422)
  }
  if (input.kind === 'wording_revised' && !input.revisedText) {
    return c.json(invalid('Write the revised wording.', 'validation_failed'), 422)
  }

  const itemId = c.req.param('itemId')
  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.recordId, record.id)))
    .limit(1)

  if (!item) return c.json(invalid('That question does not exist.', 'not_found'), 404)

  // FR-RECORD-4. Append only: a disposition never overwrites the machine verdict or an earlier one.
  await db.insert(dispositions).values({
    itemId,
    kind: input.kind,
    revisedKey: input.revisedKey ?? null,
    revisedText: input.revisedText ?? null,
    note: input.note ?? null
  })

  // FR-QUEUE-5. retry_requested is a round boundary, so it re-queues exactly as the retry route does.
  if (input.kind === 'retry_requested') await requeue(itemId)

  const recordStatus = await refreshReviewStatus(record.id)
  return c.json({ item: await itemDetail(itemId), recordStatus })
})

recordRoutes.post('/records/:id/items/:itemId/retry', async (c) => {
  const session = sessionOf(c)
  const record = await dispositionTarget(c.req.param('id'), session.user.id)
  if (!record) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  const itemId = c.req.param('itemId')
  const [item] = await db
    .select({ id: items.id, verdict: items.verdict })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.recordId, record.id)))
    .limit(1)

  if (!item) return c.json(invalid('That question does not exist.', 'not_found'), 404)
  if (item.verdict !== 'unverified') {
    return c.json(invalid('Only an unverified question can be checked again.', 'not_retryable'), 409)
  }

  // The disposition is what makes the round boundary visible: the rule only considers attempts
  // started after the latest retry_requested, so an earlier reading is never counted twice.
  await db.insert(dispositions).values({ itemId, kind: 'retry_requested' })
  await requeue(itemId)
  await db.update(records).set({ status: 'checking', updatedAt: new Date() }).where(eq(records.id, record.id))

  return c.json({ item: await itemDetail(itemId), recordStatus: 'checking' })
})

recordRoutes.get('/records/:id/events', async (c) => {
  const owned = await ownedRecord(c.req.param('id'), sessionOf(c).user.id)
  if (!owned) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  return streamSSE(c, async (stream) => {
    let previous = ''
    let lastKeepalive = Date.now()
    const deadline = Date.now() + SSE_MAX_STREAM_MS

    // A client that disconnects mid-write is an ordinary end to a stream, not an error path.
    try {
      while (!stream.closed && Date.now() < deadline) {
        const detail = await recordDetail(owned.id)
        if (!detail) return

        const snapshot = JSON.stringify(detail)
        if (snapshot !== previous) {
          previous = snapshot
          for (const item of detail.items) {
            await stream.writeSSE({ event: 'item', data: JSON.stringify(item) })
          }
          await stream.writeSSE({
            event: 'record',
            data: JSON.stringify({ id: detail.id, status: detail.status, counts: detail.counts })
          })
        }

        // Wall clock rather than a count of iterations. Each pass is the poll interval plus a full
        // recordDetail round trip, so an accumulator under-counts and the keepalive meant to defeat
        // an idle timeout fires late — and later the slower the database gets, which is when it matters.
        if (Date.now() - lastKeepalive >= SSE_KEEPALIVE_MS) {
          lastKeepalive = Date.now()
          await stream.write(': keepalive\n\n')
        }

        if (detail.status === 'ready' || detail.status === 'resolved') return
        await stream.sleep(SSE_POLL_MS)
      }
    } catch {
      return
    }
  })
})

async function ownedRecord(recordId: string, userId: string) {
  const [row] = await db
    .select({ id: records.id, isSample: records.isSample })
    .from(records)
    .where(and(eq(records.id, recordId), eq(records.userId, userId), isNull(records.deletedAt)))
    .limit(1)

  return row ?? null
}

// A disposition is allowed on the sample even though nobody owns it (TRD section 15), which is what
// makes the demo's Key Corrected beat work from the Guest workspace.
async function dispositionTarget(recordId: string, userId: string) {
  const owned = await ownedRecord(recordId, userId)
  if (owned) return owned

  const [sample] = await db
    .select({ id: records.id, isSample: records.isSample })
    .from(records)
    .where(and(eq(records.id, recordId), eq(records.isSample, true), isNull(records.deletedAt)))
    .limit(1)

  return sample ?? null
}

async function requeue(itemId: string): Promise<void> {
  await db
    .update(items)
    .set({ status: 'queued', verdict: 'pending', verdictReason: null, attemptsUsed: 0, claimedAt: null })
    .where(eq(items.id, itemId))
}

// FR-RECORD-2. in_review once any non-clear item has a decision, resolved when they all do.
export async function refreshReviewStatus(recordId: string): Promise<string> {
  const [row] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${items.status} in ('queued','running'))::int`,
      attention: sql<number>`count(*) filter (where ${items.verdict} not in ('clear','pending'))::int`,
      decided: sql<number>`count(*) filter (where ${items.verdict} not in ('clear','pending') and exists (
        select 1 from dispositions d where d.item_id = items.id
      ))::int`
    })
    .from(items)
    .where(eq(items.recordId, recordId))

  const pending = row?.pending ?? 0
  const attention = row?.attention ?? 0
  const decided = row?.decided ?? 0

  const status = pending > 0 ? 'checking' : decided === 0 ? 'ready' : decided >= attention ? 'resolved' : 'in_review'

  await db
    .update(records)
    .set({ status: status as (typeof records.status.enumValues)[number], updatedAt: new Date() })
    .where(eq(records.id, recordId))

  return status
}
