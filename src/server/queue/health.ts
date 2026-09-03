import type { HealthModel } from '../../shared/types'
import { db } from '../db'
import { modelHealth } from '../db/schema'
import { MODELS } from '../gateway/models'

// TRD section 13. A ring of the last 15 minutes per model, in memory, mirrored to model_health so
// GET /api/health survives a restart with the last known picture rather than an empty one.

const WINDOW_MS = 15 * 60 * 1000
const MIRROR_INTERVAL_MS = 30_000

// A model is excluded from the healthy set at three failures with nothing successful behind them.
// Two failures could be one bad minute; three with no success is a family that is down.
const EXCLUSION_FAILURES = 3

type Outcome = { model: string; ok: boolean; latencyMs: number; at: number }

const outcomes: Outcome[] = []

export function recordOutcome(model: string, ok: boolean, latencyMs: number, now = Date.now()): void {
  outcomes.push({ model, ok, latencyMs, at: now })
  prune(now)
}

export function resetHealth(): void {
  outcomes.length = 0
}

function prune(now: number): void {
  const cutoff = now - WINDOW_MS
  while (outcomes.length > 0 && (outcomes[0]?.at ?? 0) < cutoff) outcomes.shift()
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle] ?? null
  return Math.round(((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2)
}

export type ModelStats = HealthModel & { successes: number; failures: number }

export function stats(now = Date.now()): ModelStats[] {
  prune(now)

  return MODELS.map((model) => {
    const mine = outcomes.filter((outcome) => outcome.model === model)
    const successes = mine.filter((outcome) => outcome.ok)
    const failures = mine.length - successes.length

    return {
      model,
      successes: successes.length,
      failures,
      // No data reads as healthy. A family nobody has called yet is not a family known to be down.
      successRate: mine.length === 0 ? 1 : successes.length / mine.length,
      medianLatencyMs: median(successes.map((outcome) => outcome.latencyMs)),
      healthy: !(successes.length === 0 && failures >= EXCLUSION_FAILURES)
    }
  })
}

// A round needs two distinct readers, so an order shorter than this guarantees Unverified.
const MINIMUM_READERS = 2

// The order the worker picks readers in: healthy first, best success rate, then fastest.
// An unknown latency sorts last rather than first — a family nobody has called yet is not the
// fastest one, and at equal success rate the reader we have measured is the better bet.
//
// A family that is down is demoted rather than removed. Removing it is right while two healthy
// families remain, and wrong the moment fewer do: with one candidate the round cannot produce two
// distinct readings, so every item returns Unverified without a single call being attempted. Trying
// a struggling family is strictly better than a certain failure, and FR-QUEUE-3 asks the queue to
// pair the remaining families rather than wait. Measured 3 September: MiniMax alone was healthy
// while DeepSeek and Kimi both answered ordinary prompts in under 25 seconds.
export function healthyOrder(now = Date.now()): string[] {
  const latency = (model: ModelStats) => model.medianLatencyMs ?? Number.POSITIVE_INFINITY
  const byQuality = (a: ModelStats, b: ModelStats) => b.successRate - a.successRate || latency(a) - latency(b)

  const ranked = stats(now)
  const healthy = ranked.filter((model) => model.healthy).sort(byQuality)
  if (healthy.length >= MINIMUM_READERS) return healthy.map((model) => model.model)

  const demoted = ranked.filter((model) => !model.healthy).sort(byQuality)
  return [...healthy, ...demoted].map((model) => model.model)
}

export async function mirrorHealth(now = new Date()): Promise<void> {
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  for (const model of stats(now.getTime())) {
    await db
      .insert(modelHealth)
      .values({
        model: model.model,
        windowStart,
        successes: model.successes,
        failures: model.failures,
        medianLatencyMs: model.medianLatencyMs,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: modelHealth.model,
        set: {
          windowStart,
          successes: model.successes,
          failures: model.failures,
          medianLatencyMs: model.medianLatencyMs,
          updatedAt: now
        }
      })
  }
}

// GET /api/health is public and is what the client's availability display reads, so it degrades to
// "no data yet" rather than 500ing when the database is briefly out of reach.
export async function readHealth(): Promise<HealthModel[]> {
  let rows: (typeof modelHealth.$inferSelect)[] = []
  try {
    rows = await db.select().from(modelHealth)
  } catch (error) {
    console.error('health read failed', error)
  }

  const byModel = new Map(rows.map((row) => [row.model, row]))

  return MODELS.map((model) => {
    const row = byModel.get(model)
    const total = (row?.successes ?? 0) + (row?.failures ?? 0)

    return {
      model,
      successRate: total === 0 ? 1 : (row?.successes ?? 0) / total,
      medianLatencyMs: row?.medianLatencyMs ?? null,
      healthy: !((row?.successes ?? 0) === 0 && (row?.failures ?? 0) >= EXCLUSION_FAILURES)
    }
  })
}

export function startHealthMirror(intervalMs: number = MIRROR_INTERVAL_MS): Timer {
  const timer = setInterval(() => {
    mirrorHealth().catch((error) => console.error('health mirror failed', error))
  }, intervalMs)

  timer.unref()
  return timer
}

export const HEALTH_WINDOW_MINUTES = WINDOW_MS / 60_000
