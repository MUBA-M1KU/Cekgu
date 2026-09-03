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

// The order the worker picks readers in: healthy first, best success rate, then fastest.
export function healthyOrder(now = Date.now()): string[] {
  return stats(now)
    .filter((model) => model.healthy)
    .sort((a, b) => b.successRate - a.successRate || (a.medianLatencyMs ?? 0) - (b.medianLatencyMs ?? 0))
    .map((model) => model.model)
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

export async function readHealth(): Promise<HealthModel[]> {
  const rows = await db.select().from(modelHealth)
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
