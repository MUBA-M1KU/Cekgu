import { createHash } from 'node:crypto'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { z } from 'zod'
import type { Option, RecordDetail, VerdictCounts } from '../shared/types'
import { verdict } from '../shared/verdict'
import { db } from './db'
import { user } from './db/auth-schema'
import { attempts, dispositions, items, records } from './db/schema'
import { env } from './env'
import { recordDetail } from './records/queries'

// FR-SAMPLE-1: the sample carries recorded readings and public request ids from a real benchmark
// pass, and nothing in it is fabricated. This module loads the pass from the committed capture and
// refuses to invent any of it. With no file, there is no sample and GET /api/sample says so.

// Written by scripts/capture-benchmark-pass.ts, which ran the twelve-item paper through the product's
// own queue against the live gateway on 3 September. Absent, seeding is a no-op rather than an error.
export const SAMPLE_PASS_PATH = './src/server/fixtures/benchmark-pass.json'

const option = z.object({ letter: z.string().min(1), text: z.string().min(1) })

const source = z.object({ title: z.string().min(1), url: z.url(), snippet: z.string().min(1) })

const reading = z.object({
  model: z.string().min(1),
  answer: z.string().min(1),
  defensible: z.array(z.string()),
  reason: z.string(),
  // Added 6 September, AFTER the 3 September capture, and carrying no `grounding` — which is the
  // whole point. Grounding is a value a Gonka reader reports about evidence it was shown, and these
  // readers were never shown anything: retrieval did not exist when they ran. Sources without
  // grounding is therefore the only shape this record can honestly hold, and it is what makes the
  // evidence panel say the readers did not see these pages. FR-SAMPLE-1 still holds: every page here
  // is a real Tavily result for this question, and nothing about the readings or verdicts moved.
  sources: z.array(source).optional()
})

// One row of the attempts table as the benchmark produced it, including the rejected calls: an
// attempt that timed out is evidence too (FR-EVIDENCE-2, NFR-PROV-3).
const attempt = z.object({
  requestedModel: z.string().min(1),
  servedModel: z.string().nullable().default(null),
  requestId: z.string().nullable().default(null),
  devshardId: z.string().nullable().default(null),
  fallbackHeader: z.string().nullable().default(null),
  httpStatus: z.number().int().nullable().default(null),
  receiptStatus: z.enum(['pending', 'verified', 'mismatch', 'missing']),
  receiptJson: z.unknown().nullable().default(null),
  readingJson: reading.nullable().default(null),
  latencyMs: z.number().int().nullable().default(null),
  // Optional because the 3 September file predates them. When a capture supplies them the sample
  // carries the real instants, which is what makes TRD section 15's "newest first" ordering of the
  // attempts table mean anything; without them every row shares its item's insert time.
  startedAt: z.iso.datetime().nullable().default(null),
  finishedAt: z.iso.datetime().nullable().default(null),
  admitted: z.boolean(),
  rejectionReason: z.string().nullable().default(null)
})

export const passFile = z.object({
  pass: z.string().min(1),
  capturedAt: z.string().min(1),
  record: z.object({
    title: z.string().min(1),
    subject: z.string().min(1),
    language: z.string().min(1),
    context: z.string().nullable().default(null)
  }),
  items: z
    .array(
      z.object({
        stem: z.string().min(1),
        options: z.array(option).min(2),
        key: z.string().min(1),
        attempts: z.array(attempt)
      })
    )
    .min(1)
})

export type PassFile = z.infer<typeof passFile>

export async function loadPass(path: string): Promise<PassFile | null> {
  const file = Bun.file(path)
  if (!(await file.exists())) return null

  return passFile.parse(await file.json())
}

async function guestUserId(): Promise<string | null> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, env.guestEmail)).limit(1)
  return row?.id ?? null
}

export async function sampleRecordId(): Promise<string | null> {
  const [row] = await db.select({ id: records.id }).from(records).where(eq(records.isSample, true)).limit(1)
  return row?.id ?? null
}

type PassAttempt = PassFile['items'][number]['attempts'][number]

// The verdict is computed by the rule over the readings the pass recorded, never copied from the
// file. A sample whose verdicts were written by hand would prove nothing about the rule.
function verdictFor(admitted: PassAttempt[], key: string, options: Option[]) {
  const readings = admitted.flatMap((row) =>
    row.readingJson && row.servedModel ? [{ ...row.readingJson, model: row.servedModel }] : []
  )

  return verdict(readings, key, options)
}

// Real instants when the pass recorded them. Otherwise the row is stamped now and finished by its
// measured latency: the absolute time is unknown for such a file and inventing one would be a
// fabrication, but the duration is a number the capture actually measured. The previous code took
// a fresh `new Date()` for finishedAt while letting startedAt default in the database, which landed
// microseconds later and gave every attempt a negative duration.
function attemptTimes(row: PassAttempt): { startedAt: Date; finishedAt: Date } {
  const startedAt = row.startedAt ? new Date(row.startedAt) : new Date()
  const finishedAt = row.finishedAt ? new Date(row.finishedAt) : new Date(startedAt.getTime() + (row.latencyMs ?? 0))

  return { startedAt, finishedAt }
}

/**
 * JSON with object keys sorted, at every depth.
 *
 * Postgres normalises `jsonb` key order on the way in, so a reading read back out does not stringify
 * to the same bytes as the one in the file even when nothing about it changed. Comparing raw
 * `JSON.stringify` output would therefore report a difference on every boot and re-seed forever.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`
}

/**
 * A fingerprint of everything the sample renders from, independent of row order.
 *
 * Sorted before hashing because the database makes no promise about the order it returns rows in,
 * and an order-sensitive fingerprint would re-seed on a whim.
 */
function fingerprint(parts: string[]): string {
  return createHash('sha256')
    .update([...parts].sort().join('\u0000'))
    .digest('hex')
}

export function passFingerprint(pass: PassFile): string {
  return fingerprint([
    ...pass.items.map((item) => `i:${stableStringify([item.stem, item.key, item.options])}`),
    ...pass.items.flatMap((item) =>
      item.attempts.map((row) => `a:${row.requestId ?? ''}:${stableStringify(row.readingJson)}`)
    )
  ])
}

async function storedFingerprint(recordId: string): Promise<string> {
  const itemRows = await db
    .select({ id: items.id, stem: items.stem, key: items.key, options: items.options })
    .from(items)
    .where(eq(items.recordId, recordId))

  const ids = itemRows.map((row) => row.id)
  const attemptRows = ids.length
    ? await db
        .select({ requestId: attempts.requestId, readingJson: attempts.readingJson })
        .from(attempts)
        .where(inArray(attempts.itemId, ids))
    : []

  return fingerprint([
    ...itemRows.map((row) => `i:${stableStringify([row.stem, row.key, row.options])}`),
    ...attemptRows.map((row) => `a:${row.requestId ?? ''}:${stableStringify(row.readingJson)}`)
  ])
}

/**
 * Seed the sample, and re-seed it when the committed fixture no longer matches the stored row.
 *
 * The early return on "a sample already exists" was the whole of this function's guard, which meant
 * an updated fixture never reached a deployment that had ever booted — #299 added 24 real retrieved
 * pages and production kept serving a row seeded weeks earlier ([#301]).
 *
 * Every branch below is written so a failure leaves the existing sample untouched, because the
 * sample is the demo surface and a half-replaced one is worse than a stale one:
 *
 * - the fixture is loaded and validated BEFORE anything is deleted, and an unreadable file keeps
 *   whatever is already stored
 * - a missing Guest user aborts rather than deleting a record it could not re-insert
 * - the delete and the re-insert share one transaction, so a throw halfway rolls the delete back
 */
export async function seedSample(path: string): Promise<string | null> {
  const existing = await sampleRecordId()

  const pass = await loadPass(path)
  if (!pass) {
    // Nothing is destroyed for a file we cannot read: a bad deploy must not take the sample with it.
    if (existing) {
      console.log(`no readable benchmark pass at ${path}; keeping the sample already stored`)
      return existing
    }
    console.log(`no benchmark pass at ${path}; GET /api/sample will report the sample is not loaded`)
    return null
  }

  if (existing) {
    if ((await storedFingerprint(existing)) === passFingerprint(pass)) return existing
    console.log('the benchmark pass differs from the stored sample; re-seeding it from the fixture')
  }

  const userId = await guestUserId()
  if (!userId) return existing

  return db.transaction(async (tx) => {
    // Cascades from records to items to attempts and dispositions, so one delete clears the lot.
    if (existing) await tx.delete(records).where(eq(records.id, existing))

    // expires_at stays null so the Guest sweep's expiry comparison never matches it, which is the
    // second of the two protections is_sample already gives it.
    const [record] = await tx
      .insert(records)
      .values({ ...pass.record, userId, isSample: true, status: 'ready', expiresAt: null })
      .returning({ id: records.id })

    const recordId = record?.id
    if (!recordId) throw new Error('the sample record could not be inserted')

    await insertPassItems(tx, recordId, pass)
    return recordId
  })
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function insertPassItems(tx: Tx, recordId: string, pass: PassFile): Promise<void> {
  for (const [index, source] of pass.items.entries()) {
    const decided = verdictFor(
      source.attempts.filter((row) => row.admitted),
      source.key,
      source.options
    )

    const [item] = await tx
      .insert(items)
      .values({
        recordId,
        position: index + 1,
        stem: source.stem,
        options: source.options,
        key: source.key,
        status: 'done',
        verdict: decided.verdict,
        verdictReason: decided.reason,
        attemptsUsed: source.attempts.length
      })
      .returning({ id: items.id })

    const itemId = item?.id
    if (!itemId || source.attempts.length === 0) continue

    await tx.insert(attempts).values(
      source.attempts.map((row) => ({
        itemId,
        requestedModel: row.requestedModel,
        servedModel: row.servedModel,
        requestId: row.requestId,
        devshardId: row.devshardId,
        fallbackHeader: row.fallbackHeader,
        httpStatus: row.httpStatus,
        receiptStatus: row.receiptStatus,
        receiptJson: row.receiptJson,
        readingJson: row.readingJson,
        latencyMs: row.latencyMs,
        ...attemptTimes(row),
        admitted: row.admitted,
        rejectionReason: row.rejectionReason
      }))
    )
  }
}

// FR-SAMPLE-3. Clears every disposition on the sample and returns it to ready, so a rehearsal
// starts from Unreviewed. It never touches the readings or the verdicts.
export async function resetSample(): Promise<boolean> {
  const recordId = await sampleRecordId()
  if (!recordId) return false

  const owned = await db.select({ id: items.id }).from(items).where(eq(items.recordId, recordId))
  const itemIds = owned.map((row) => row.id)
  if (itemIds.length > 0) await db.delete(dispositions).where(inArray(dispositions.itemId, itemIds))

  await db.update(records).set({ status: 'ready', updatedAt: new Date() }).where(eq(records.id, recordId))
  return true
}

const _EMPTY_COUNTS: VerdictCounts = {
  clear: 0,
  possible_key_error: 0,
  possible_ambiguity: 0,
  split_opinion: 0,
  unverified: 0,
  pending: 0
}

export async function readSample(): Promise<RecordDetail | null> {
  const [record] = await db
    .select({ id: records.id })
    .from(records)
    .where(and(eq(records.isSample, true), isNull(records.deletedAt)))
    .limit(1)

  if (!record) return null

  // Through recordDetail rather than a second builder. TRD section 15 says the sample answers in the
  // same shape as GET /api/records/:id, and one function is the only way that stays true — the
  // duplicate here ordered attempts oldest first, where section 15 asks for newest first.
  return recordDetail(record.id)
}
