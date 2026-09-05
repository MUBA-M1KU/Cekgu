import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm'
import { corroboration, recordScore, truthScore } from '../../shared/truth-score'
import type { Attempt, Disposition, Item, RecordDetail, RecordSummary, VerdictCounts } from '../../shared/types'
import { db } from '../db'
import { attempts, dispositions, items, records } from '../db/schema'

// The read side of TRD section 15. Kept out of the route file because the same shapes are needed by
// GET /api/records/:id, GET /api/sample, the disposition and retry responses, and the events stream.

function emptyCounts(): VerdictCounts {
  return {
    clear: 0,
    possible_key_error: 0,
    possible_ambiguity: 0,
    split_opinion: 0,
    unverified: 0,
    pending: 0
  }
}

/* The Truth Score is derived here rather than stored, so there is no column that can disagree with
   the attempts underneath it. It is read off the same admitted readings the verdict used, in the
   order the round produced them — attempts arrive newest first for the evidence view, and a score
   built in that order would pick a different pair from the rule and could then contradict the
   verdict printed beside it. Sorting on finishedAt puts them back in completion order. */
function admittedReadings(attemptsForItem: Attempt[]) {
  return attemptsForItem
    .filter((attempt) => attempt.admitted && attempt.reading)
    .slice()
    .sort((a, b) => (a.finishedAt ?? '').localeCompare(b.finishedAt ?? ''))
    .map((attempt) => attempt.reading as NonNullable<Attempt['reading']>)
}

export type ListFilters = { status?: string; subject?: string; attention?: boolean; q?: string }

export async function listRecords(userId: string, filters: ListFilters): Promise<RecordSummary[]> {
  const conditions = [eq(records.userId, userId), isNull(records.deletedAt)]
  if (filters.status) conditions.push(eq(records.status, filters.status as (typeof records.status.enumValues)[number]))
  if (filters.subject) conditions.push(eq(records.subject, filters.subject))

  // Search covers the title and the stems, which is what FR-RECORD-5 asks for: an educator looks
  // for the paper by name or by a question they remember typing.
  if (filters.q) {
    const pattern = `%${filters.q}%`
    conditions.push(
      or(
        ilike(records.title, pattern),
        // Aliased and written out rather than interpolated. Drizzle renders ${items.recordId} inside
        // a raw subquery as a bare "record_id", which then resolves against the subquery's own table
        // — and "records.id" becomes "id", which items also has. The comparison silently never matches.
        sql`exists (select 1 from items i where i.record_id = records.id and i.stem ilike ${pattern})`
      ) as ReturnType<typeof eq>
    )
  }

  const rows = await db
    .select({
      id: records.id,
      title: records.title,
      subject: records.subject,
      status: records.status,
      isSample: records.isSample,
      expiresAt: records.expiresAt,
      updatedAt: records.updatedAt,
      itemCount: sql<number>`(select count(*)::int from items i where i.record_id = records.id)`,
      /* An item needs attention while it is flagged AND nobody has decided what to do about it.
         Recording a decision is the educator saying they have dealt with it, so it leaves this
         count — while the machine verdict it carries never changes, because that is a finding
         rather than a task. Without the second clause the number never moves and the screen asks
         for work that is already done. */
      attentionCount: sql<number>`(
        select count(*)::int from items i
        where i.record_id = records.id
          and i.verdict not in ('clear', 'pending')
          and not exists (select 1 from dispositions d where d.item_id = i.id)
      )`
    })
    .from(records)
    .where(and(...conditions))
    .orderBy(desc(records.updatedAt))

  return rows
    .filter((row) => (filters.attention ? row.attentionCount > 0 : true))
    .map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      status: row.status,
      itemCount: row.itemCount,
      attentionCount: row.attentionCount,
      isSample: row.isSample,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString()
    }))
}

export async function recordDetail(recordId: string): Promise<RecordDetail | null> {
  const [record] = await db.select().from(records).where(eq(records.id, recordId)).limit(1)
  if (!record || record.deletedAt) return null

  const itemRows = await db.select().from(items).where(eq(items.recordId, recordId)).orderBy(asc(items.position))
  const itemIds = itemRows.map((row) => row.id)

  // Attempts newest first and dispositions oldest first, per TRD section 15: the most recent
  // evidence is what an educator wants to see, and a decision history reads forward. Ties in startedAt break on id.
  const attemptRows = itemIds.length
    ? await db
        .select()
        .from(attempts)
        .where(inArray(attempts.itemId, itemIds))
        .orderBy(desc(attempts.startedAt), asc(attempts.id))
    : []
  const dispositionRows = itemIds.length
    ? await db
        .select()
        .from(dispositions)
        .where(inArray(dispositions.itemId, itemIds))
        .orderBy(asc(dispositions.createdAt))
    : []

  const counts = emptyCounts()
  for (const row of itemRows) counts[row.verdict] += 1

  const built: Item[] = itemRows.map((row) => {
    const itemAttempts = attemptRows.filter((attempt) => attempt.itemId === row.id).map(toAttempt)
    return {
      id: row.id,
      position: row.position,
      stem: row.stem,
      options: row.options,
      key: row.key,
      status: row.status,
      verdict: row.verdict,
      verdictReason: row.verdictReason,
      truthScore: truthScore(admittedReadings(itemAttempts), row.key),
      attemptsUsed: row.attemptsUsed,
      attempts: itemAttempts,
      dispositions: dispositionRows.filter((disposition) => disposition.itemId === row.id).map(toDisposition)
    }
  })

  return {
    id: record.id,
    title: record.title,
    subject: record.subject,
    language: record.language,
    context: record.context,
    status: record.status,
    isSample: record.isSample,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    counts,
    truthScore: recordScore(built.map((item) => item.truthScore)),
    corroboration: corroboration(built.map((item) => admittedReadings(item.attempts))),
    items: built
  }
}

export async function itemDetail(itemId: string): Promise<Item | null> {
  const [row] = await db.select({ recordId: items.recordId }).from(items).where(eq(items.id, itemId)).limit(1)
  if (!row) return null

  const detail = await recordDetail(row.recordId)
  return detail?.items.find((item) => item.id === itemId) ?? null
}

function toAttempt(row: typeof attempts.$inferSelect): Attempt {
  return {
    id: row.id,
    requestedModel: row.requestedModel,
    servedModel: row.servedModel,
    requestId: row.requestId,
    devshardId: row.devshardId,
    fallbackHeader: row.fallbackHeader,
    httpStatus: row.httpStatus,
    receiptStatus: row.receiptStatus,
    reading: row.readingJson,
    latencyMs: row.latencyMs,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
    admitted: row.admitted,
    rejectionReason: row.rejectionReason
  }
}

function toDisposition(row: typeof dispositions.$inferSelect): Disposition {
  return {
    id: row.id,
    kind: row.kind,
    revisedKey: row.revisedKey,
    revisedText: row.revisedText,
    note: row.note,
    createdAt: row.createdAt.toISOString()
  }
}
