import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { attempts, items, records } from '../db/schema'
import { env } from '../env'
import { callGonka } from '../gateway/client'
import { solverPrompt } from '../gateway/reading'
import { claimNextItem, releaseStaleClaims } from './claim'
import { healthyOrder, recordOutcome } from './health'
import { type AttemptRow, runRound } from './round'
import { gatewaySemaphore } from './semaphore'

// TRD section 13. WORKER_CONCURRENCY loops inside the server process, each claiming one queued item,
// running its round, and going back for the next. The gateway is never told to do more than four things at once.

const IDLE_POLL_MS = 2_000

export async function processNextItem(): Promise<boolean> {
  const item = await claimNextItem()
  if (!item) return false

  const [record] = await db
    .select({ subject: records.subject, language: records.language })
    .from(records)
    .where(eq(records.id, item.recordId))
    .limit(1)

  if (!record) {
    await db.update(items).set({ status: 'done', verdict: 'unverified' }).where(eq(items.id, item.id))
    return true
  }

  // Before the round, not only after it. FR-RECORD-2 puts a record in `checking` while any item is
  // running, and a round can take minutes — leaving it on `queued` tells an educator nothing has
  // started when the gateway is already working.
  await refreshRecordStatus(item.recordId)

  const prompt = solverPrompt({ stem: item.stem, options: item.options }, record.subject, record.language)

  const result = await runRound(prompt, item.options, item.key, {
    call: async (model, text) => {
      const release = await gatewaySemaphore.acquire()
      try {
        return await callGonka(model, text)
      } finally {
        release()
      }
    },
    order: () => healthyOrder(),
    onOutcome: recordOutcome,
    onAttempt: (attempt: AttemptRow) => writeAttempt(item.id, attempt)
  })

  await db
    .update(items)
    .set({
      status: 'done',
      verdict: result.verdict,
      verdictReason: result.reason,
      attemptsUsed: result.attempts
    })
    .where(eq(items.id, item.id))

  await refreshRecordStatus(item.recordId)
  return true
}

async function writeAttempt(itemId: string, attempt: AttemptRow): Promise<void> {
  await db.insert(attempts).values({ itemId, ...attempt, receiptJson: attempt.receiptJson ?? null })
}

// FR-RECORD-2. `in_review` and `resolved` belong to the disposition route, so the worker only ever
// moves a record between `checking` and `ready` and never overwrites a decision an educator made.
export async function refreshRecordStatus(recordId: string): Promise<void> {
  const [pending] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(items)
    .where(and(eq(items.recordId, recordId), inArray(items.status, ['queued', 'running'])))

  const status = (pending?.count ?? 0) > 0 ? 'checking' : 'ready'

  await db
    .update(records)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(records.id, recordId), inArray(records.status, ['queued', 'checking'])))
}

export async function startWorker(): Promise<void> {
  const loop = async (): Promise<void> => {
    for (;;) {
      try {
        const worked = await processNextItem()
        if (worked) continue

        // Only when there is nothing else to do, so a crashed instance's items come back without
        // waiting for the next deploy, and the sweep never competes with real work.
        const released = await releaseStaleClaims()
        if (released > 0) console.log(`released ${released} items stranded by a previous instance`)

        await new Promise((resolve) => setTimeout(resolve, IDLE_POLL_MS))
      } catch (error) {
        console.error('queue worker round failed', error)
        await new Promise((resolve) => setTimeout(resolve, IDLE_POLL_MS))
      }
    }
  }

  for (let i = 0; i < env.workerConcurrency; i++) {
    void loop()
  }
}
