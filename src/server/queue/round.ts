import type { ItemVerdict, Option, Reading, Source } from '../../shared/types'
import { verdict as applyRule } from '../../shared/verdict'
import type { Provenance } from '../gateway/client'
import { admitReading } from '../gateway/reading'

// TRD section 13, one round for one item. The gateway call is injected so the round can be tested
// without the network, and so the semaphore lives at the worker rather than inside the logic.

const ATTEMPTS_PER_FAMILY = 3
// The client aborts at 90 s, so this should never fire. It exists because a round that can wait
// forever holds its claim for the full lease and shows Checking on screen with nothing happening,
// and the round should not depend on another module's timeout being the only thing that ends a call.
const CALL_CEILING_MS = 120_000
// Raised from 25 s on 3 September, measured. At 25 s the hedge fired on nearly every call — Kimi
// answered an eight-token prompt in 24.8 s and a solver prompt in 52.7 s — so almost every reading
// cost two gateway calls and two semaphore slots. That doubling is what produces the account-level
// 429s in gotcha 10, and those failures are what marks a family unhealthy, which is what leaves a
// round with one candidate and no verdict. 45 s still catches the 60-90 s tail from gotcha 9.
const HEDGE_AFTER_MS = 45_000
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
  /** What the readers were shown. Empty when retrieval is off or found nothing. */
  sources?: Source[]
  // Only tests set this; production leaves it at CALL_CEILING_MS.
  callCeilingMs?: number
  sleep?: (ms: number) => Promise<void>
}

export type RoundResult = { verdict: ItemVerdict; reason: string; readings: Reading[]; attempts: number }

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function runRound(prompt: string, options: Option[], key: string, deps: RoundDeps): Promise<RoundResult> {
  const order = deps.order()
  const hedgeAfterMs = deps.hedgeAfterMs ?? HEDGE_AFTER_MS
  const callCeilingMs = deps.callCeilingMs ?? CALL_CEILING_MS
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
  // refuses as non-distinct, but only after a family that was never tried is passed over.
  const nextFamily = (): string | null =>
    order.find(
      (model) =>
        !inUse.has(model) && !readings.some((reading) => reading.model === model) && (budget.get(model) ?? 0) > 0
    ) ?? null

  // Every call resolves, whatever deps.call does. A provenance record that says the call never
  // returned is worth more than a round that never ends: the attempt is still written, the budget
  // is still spent, and the seat moves on to another family.
  const callWithCeiling = async (model: string): Promise<Provenance> => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const ceiling = new Promise<Provenance>((resolve) => {
      timer = setTimeout(
        () =>
          resolve({
            content: '',
            requestId: null,
            devshardId: null,
            requestedModel: model,
            servedModel: null,
            fallbackHeader: null,
            receiptStatus: 'missing',
            receipt: null,
            httpStatus: null,
            latencyMs: callCeilingMs,
            error: `The call did not return within ${callCeilingMs / 1000} seconds and was abandoned.`
          }),
        callCeilingMs
      )
    })

    try {
      return await Promise.race([deps.call(model, prompt), ceiling])
    } catch (cause) {
      return {
        content: '',
        requestId: null,
        devshardId: null,
        requestedModel: model,
        servedModel: null,
        fallbackHeader: null,
        receiptStatus: 'missing',
        receipt: null,
        httpStatus: null,
        latencyMs: 0,
        error: `The call failed before it reached the gateway. ${String(cause)}`
      }
    } finally {
      clearTimeout(timer)
    }
  }

  const record = async (
    model: string,
    provenance: Provenance,
    startedAt: Date,
    discarded = false
  ): Promise<Reading | null> => {
    attempts += 1
    const admission = admitReading(provenance, options, deps.sources ?? [])
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

  // The deferred hedge. Past HEDGE_AFTER_MS a duplicate of the same call goes to the same model;
  // whichever returns first is the candidate and the other is still written as an attempts row,
  // because an attempt nobody used is still evidence of what the gateway did.
  //
  // Note it duplicates the model, not the family. A slow model gets a second concurrent call to
  // itself, so the hedge loads the exact thing already struggling — which is why the threshold has
  // to sit above the measured completion floor rather than below it.
  const callOnce = async (model: string): Promise<Reading | null> => {
    const startedAt = new Date()
    const primary = callWithCeiling(model)
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
    const hedge = callWithCeiling(model)
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
