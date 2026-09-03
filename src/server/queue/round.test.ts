import { describe, expect, test } from 'bun:test'
import type { Option } from '../../shared/types'
import type { Provenance } from '../gateway/client'
import { type AttemptRow, runRound } from './round'

const DEEPSEEK = 'deepseek-ai/DeepSeek-V4-Flash-0731'
const MINIMAX = 'MiniMaxAI/MiniMax-M2.7'
const KIMI = 'moonshotai/Kimi-K2.6'

const OPTIONS: Option[] = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' },
  { letter: 'C', text: 'Binary tree' }
]

function ok(model: string, answer: string, defensible: string[] = [answer]): Provenance {
  return {
    content: JSON.stringify({ answer, defensible, reason: 'Because.' }),
    requestId: `req-${model}-${Math.random()}`,
    devshardId: '70158',
    requestedModel: model,
    servedModel: model,
    fallbackHeader: null,
    receiptStatus: 'verified',
    receipt: null,
    httpStatus: 200,
    latencyMs: 12_000,
    error: null
  }
}

function failed(model: string, error: string): Provenance {
  return { ...ok(model, 'A'), content: '', receiptStatus: 'missing', httpStatus: 429, error }
}

type Recorded = { attempts: AttemptRow[]; calls: string[] }

function harness(responses: Record<string, Provenance[]>, order = [DEEPSEEK, MINIMAX, KIMI]) {
  const recorded: Recorded = { attempts: [], calls: [] }
  const cursor = new Map<string, number>()

  return {
    recorded,
    deps: {
      call: async (model: string) => {
        recorded.calls.push(model)
        const index = cursor.get(model) ?? 0
        cursor.set(model, index + 1)
        const queued = responses[model]
        return queued?.[Math.min(index, queued.length - 1)] ?? failed(model, 'no stub')
      },
      order: () => order,
      onAttempt: async (attempt: AttemptRow) => {
        recorded.attempts.push(attempt)
      },
      hedgeAfterMs: 10_000,
      sleep: () => new Promise<void>(() => {})
    }
  }
}

describe('runRound', () => {
  test('two healthy families agreeing on the key is Clear', async () => {
    const { deps, recorded } = harness({ [DEEPSEEK]: [ok(DEEPSEEK, 'B')], [MINIMAX]: [ok(MINIMAX, 'B')] })
    const result = await runRound('prompt', OPTIONS, 'B', deps)

    expect(result.verdict).toBe('clear')
    expect(result.readings).toHaveLength(2)
    expect(recorded.attempts).toHaveLength(2)
    expect(recorded.attempts.every((attempt) => attempt.admitted)).toBe(true)
  })

  test('the two seats never take the same family', async () => {
    const { deps, recorded } = harness({ [DEEPSEEK]: [ok(DEEPSEEK, 'B')], [MINIMAX]: [ok(MINIMAX, 'B')] })
    await runRound('prompt', OPTIONS, 'B', deps)

    expect(new Set(recorded.calls).size).toBe(recorded.calls.length)
  })

  test('two readers disagreeing is Split Opinion', async () => {
    const { deps } = harness({ [DEEPSEEK]: [ok(DEEPSEEK, 'A')], [MINIMAX]: [ok(MINIMAX, 'B')] })
    const result = await runRound('prompt', OPTIONS, 'A', deps)

    expect(result.verdict).toBe('split_opinion')
  })

  test('both readers agreeing on a non-key option is Possible Key Error', async () => {
    const { deps } = harness({ [DEEPSEEK]: [ok(DEEPSEEK, 'B')], [MINIMAX]: [ok(MINIMAX, 'B')] })
    const result = await runRound('prompt', OPTIONS, 'A', deps)

    expect(result.verdict).toBe('possible_key_error')
  })

  // FR-QUEUE-3: when one family fails, the seat moves to the third rather than waiting.
  test('a failing family hands its seat to the third', async () => {
    const { deps, recorded } = harness({
      [DEEPSEEK]: [failed(DEEPSEEK, 'The gateway answered 429.')],
      [MINIMAX]: [ok(MINIMAX, 'B')],
      [KIMI]: [ok(KIMI, 'B')]
    })
    const result = await runRound('prompt', OPTIONS, 'B', deps)

    expect(result.verdict).toBe('clear')
    expect(result.readings.map((reading) => reading.model).sort()).toEqual([MINIMAX, KIMI].sort())
    expect(recorded.attempts.filter((attempt) => !attempt.admitted)).toHaveLength(3)
  })

  // The budget is three attempts per family per item. Every family exhausting it ends the round.
  test('budget exhaustion across every family ends the round as Unverified', async () => {
    const { deps, recorded } = harness({
      [DEEPSEEK]: [failed(DEEPSEEK, 'down')],
      [MINIMAX]: [failed(MINIMAX, 'down')],
      [KIMI]: [failed(KIMI, 'down')]
    })
    const result = await runRound('prompt', OPTIONS, 'B', deps)

    expect(result.verdict).toBe('unverified')
    expect(recorded.calls).toHaveLength(9)
    expect(recorded.calls.filter((model) => model === DEEPSEEK)).toHaveLength(3)
  })

  test('one admitted reading is not a consensus', async () => {
    const { deps } = harness({
      [DEEPSEEK]: [ok(DEEPSEEK, 'B')],
      [MINIMAX]: [failed(MINIMAX, 'down')],
      [KIMI]: [failed(KIMI, 'down')]
    })
    const result = await runRound('prompt', OPTIONS, 'B', deps)

    expect(result.verdict).toBe('unverified')
    expect(result.readings).toHaveLength(1)
  })

  test('every call is written as an attempt, admitted or not', async () => {
    const { deps, recorded } = harness({
      [DEEPSEEK]: [failed(DEEPSEEK, 'The gateway answered 429.')],
      [MINIMAX]: [ok(MINIMAX, 'B')],
      [KIMI]: [ok(KIMI, 'B')]
    })
    await runRound('prompt', OPTIONS, 'B', deps)

    expect(recorded.attempts).toHaveLength(recorded.calls.length)
    const rejected = recorded.attempts.find((attempt) => !attempt.admitted)
    expect(rejected?.rejectionReason).toBe('The gateway answered 429.')
    expect(rejected?.readingJson).toBeNull()
  })

  test('a family the health order excludes is never called', async () => {
    const { deps, recorded } = harness({ [MINIMAX]: [ok(MINIMAX, 'B')], [KIMI]: [ok(KIMI, 'B')] }, [MINIMAX, KIMI])
    await runRound('prompt', OPTIONS, 'B', deps)

    expect(recorded.calls).not.toContain(DEEPSEEK)
  })

  test('with one healthy family left there is no second reader and no verdict', async () => {
    const { deps } = harness({ [KIMI]: [ok(KIMI, 'B')] }, [KIMI])
    const result = await runRound('prompt', OPTIONS, 'B', deps)

    expect(result.verdict).toBe('unverified')
  })
})

// Found on production, 3 September: a record sat on Checking for eight minutes with three rate-limited
// attempts recorded and nothing else. One seat's call never returned, so the round never ended, the
// claim was held for the whole lease and the screen said Checking with nothing happening.
describe('a call that never returns', () => {
  test('does not hang the round', async () => {
    const recorded: AttemptRow[] = []

    const result = await Promise.race([
      runRound('prompt', OPTIONS, 'A', {
        call: async (model) => {
          if (model === DEEPSEEK) return failed(DEEPSEEK, 'The gateway answered 429.')
          return new Promise<Provenance>(() => {})
        },
        order: () => [DEEPSEEK, MINIMAX],
        onAttempt: async (attempt) => {
          recorded.push(attempt)
        },
        hedgeAfterMs: 50,
        callCeilingMs: 300
      }),
      new Promise<'hung'>((resolve) => setTimeout(() => resolve('hung'), 5_000))
    ])

    expect(result).not.toBe('hung')
    expect(typeof result === 'object' && result.verdict).toBe('unverified')
  }, 10_000)

  test('is written as an attempt saying so, rather than vanishing', async () => {
    const recorded: AttemptRow[] = []

    await runRound('prompt', OPTIONS, 'A', {
      call: async (model) => (model === MINIMAX ? new Promise<Provenance>(() => {}) : failed(model, 'down')),
      order: () => [MINIMAX],
      onAttempt: async (attempt) => {
        recorded.push(attempt)
      },
      hedgeAfterMs: 50,
      callCeilingMs: 200
    })

    const abandoned = recorded.filter((attempt) => attempt.rejectionReason?.includes('did not return'))
    expect(abandoned.length).toBeGreaterThan(0)
    expect(abandoned[0]?.requestId).toBeNull()
    expect(abandoned[0]?.admitted).toBe(false)
  }, 10_000)
})

describe('the deferred hedge', () => {
  test('a call that passes the hedge point fires a duplicate and both are recorded', async () => {
    const recorded: AttemptRow[] = []
    const calls: string[] = []
    let slowResolve: ((value: Provenance) => void) | undefined

    const result = await runRound('prompt', OPTIONS, 'B', {
      call: async (model) => {
        calls.push(model)
        if (model === DEEPSEEK && calls.filter((each) => each === DEEPSEEK).length === 1) {
          return new Promise<Provenance>((resolve) => {
            slowResolve = resolve
          })
        }
        return ok(model, 'B')
      },
      order: () => [DEEPSEEK, MINIMAX],
      onAttempt: async (attempt) => {
        recorded.push(attempt)
      },
      hedgeAfterMs: 1,
      // Resolve the stalled primary once the hedge has had its turn, so the round can finish.
      sleep: async (ms) => {
        await new Promise((resolve) => setTimeout(resolve, ms))
        setTimeout(() => slowResolve?.(ok(DEEPSEEK, 'B')), 5)
      }
    })

    expect(calls.filter((model) => model === DEEPSEEK)).toHaveLength(2)
    expect(recorded.filter((attempt) => attempt.requestedModel === DEEPSEEK)).toHaveLength(2)
    expect(result.verdict).toBe('clear')

    // Both are written, but only the one that entered the verdict is admitted. Two admitted rows
    // from one model would tell the evidence view there were two readers when there was one.
    const deepseek = recorded.filter((attempt) => attempt.requestedModel === DEEPSEEK)
    expect(deepseek.filter((attempt) => attempt.admitted)).toHaveLength(1)
    expect(deepseek.find((attempt) => !attempt.admitted)?.rejectionReason).toContain('recorded and discarded')
    expect(result.readings).toHaveLength(2)
  })
})
