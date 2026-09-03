import type { ItemVerdict, Option, Reading } from '../../shared/types'
import { verdict as applyRule } from '../../shared/verdict'
import type { Provenance } from '../gateway/client'
import { admitReading } from '../gateway/reading'

// TRD section 13, one round for one item. The gateway call is injected so the round can be tested
// without the network, and so the semaphore lives at the worker rather than inside the logic.

const ATTEMPTS_PER_FAMILY = 3
const HEDGE_AFTER_MS = 25_000
const SEATS = 2

export type AttemptRow = {
  requestedModel: string
  servedModel: string | null
  requestId: string | null
  devshardId: string | null
  fallbackHeader: string | null
  httpStatus: number | null
  receiptStatus: Provenance['receiptStatus']
  receiptJson: unknown
  readingJson: Reading | null
  latencyMs: number
  startedAt: Date
  finishedAt: Date
  admitted: boolean
  rejectionReason: string | null
}

export type RoundDeps = {
  call: (model: string, prompt: string) => Promise<Provenance>
  order: () => string[]
  onAttempt: (attempt: AttemptRow) => Promise<void>
  onOutcome?: (model: string, ok: boolean, latencyMs: number) => void
  hedgeAfterMs?: number
  sleep?: (ms: number) => Promise<void>
}

export type RoundResult = { verdict: ItemVerdict; reason: string; readings: Reading[]; attempts: number }

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function runRound(prompt: string, options: Option[], key: string, deps: RoundDeps): Promise<RoundResult> {
  const order = deps.order()
  const hedgeAfterMs = deps.hedgeAfterMs ?? HEDGE_AFTER_MS
  const sleep = deps.sleep ?? defaultSleep

  const budget = new Map(order.map((model) => [model, ATTEMPTS_PER_FAMILY]))
  const inUse = new Set<string>()
  const readings: Reading[] = []
  const pending: Promise<void>[] = []
  let attempts = 0

  const spend = (model: string): boolean => {
    const left = budget.get(model) ?? 0
    if (left <= 0) return false
    budget.set(model, left - 1)
    return true
  }

  // A seat never takes a family another seat holds, nor one that has already produced a reading.
  // Without the second condition a family that succeeded could fill both seats once the others
  // failed, and the round would end with two readings from one model — which the rule correctly
  // refuses as non-distinct, but only after the third family was never tried.
  const nextFamily = (): string | null =>
    order.find(
      (model) =>
        !inUse.has(model) && !readings.some((reading) => reading.model === model) && (budget.get(model) ?? 0) > 0
    ) ?? null

  const record = async (
    model: string,
    provenance: Provenance,
    startedAt: Date,
    discarded = false
  ): Promise<Reading | null> => {
    attempts += 1
    const admission = admitReading(provenance, options)
    deps.onOutcome?.(model, admission.admitted, provenance.latencyMs)

    // A hedge that lost its race is evidence of what the gateway did, but it did not enter the
    // verdict. Writing it as admitted would show two readings from one model in the evidence view
    // where the rule used one, which misstates the provenance the whole product rests on.
    const used = admission.admitted && !discarded

    await deps.onAttempt({
      requestedModel: model,
      servedModel: provenance.servedModel,
      requestId: provenance.requestId,
      devshardId: provenance.devshardId,
      fallbackHeader: provenance.fallbackHeader,
      httpStatus: provenance.httpStatus,
      receiptStatus: provenance.receiptStatus,
      receiptJson: provenance.receipt,
      readingJson: admission.admitted ? admission.reading : null,
      latencyMs: provenance.latencyMs,
      startedAt,
      finishedAt: new Date(startedAt.getTime() + provenance.latencyMs),
      admitted: used,
      rejectionReason: admission.admitted
        ? discarded
          ? 'A hedge of this call returned first, so this reading was recorded and discarded.'
          : null
        : admission.rejectionReason
    })

    return used ? (admission as { admitted: true; reading: Reading }).reading : null
  }

  // The deferred hedge. At 25 s a duplicate of the same call goes to the same model; whichever
  // returns first is the candidate and the other is still written as an attempts row, because an
  // attempt nobody used is still evidence of what the gateway did.
  const callOnce = async (model: string): Promise<Reading | null> => {
    const startedAt = new Date()
    const primary = deps.call(model, prompt)
    let done = false
    void primary.then(
      () => {
        done = true
      },
      () => {
        done = true
      }
    )

    await Promise.race([primary.then(() => undefined), sleep(hedgeAfterMs)])

    if (done || !spend(model)) return record(model, await primary, startedAt)

    const hedgeStartedAt = new Date()
    const hedge = deps.call(model, prompt)
    const candidate = await Promise.race([
      primary.then((provenance) => ({ provenance, startedAt, other: hedge, otherStartedAt: hedgeStartedAt })),
      hedge.then((provenance) => ({
        provenance,
        startedAt: hedgeStartedAt,
        other: primary,
        otherStartedAt: startedAt
      }))
    ])

    pending.push(
      candidate.other.then(
        (provenance) => void record(model, provenance, candidate.otherStartedAt, true),
        () => undefined
      )
    )

    return record(model, candidate.provenance, candidate.startedAt)
  }

  const seat = async (): Promise<void> => {
    while (readings.length < SEATS) {
      const model = nextFamily()
      if (!model) return

      inUse.add(model)
      try {
        while (readings.length < SEATS && spend(model)) {
          const reading = await callOnce(model)
          if (reading) {
            readings.push(reading)
            return
          }
        }
      } finally {
        inUse.delete(model)
      }
    }
  }

  await Promise.all(Array.from({ length: SEATS }, () => seat()))
  await Promise.all(pending)

  const decided = applyRule(readings, key, options)
  return { verdict: decided.verdict, reason: decided.reason, readings, attempts }
}
