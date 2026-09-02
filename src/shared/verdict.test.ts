import { describe, expect, test } from 'bun:test'
import type { Option, Reading } from './types'
import { verdict } from './verdict'

const OPTIONS: Option[] = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' },
  { letter: 'C', text: 'Binary tree' },
  { letter: 'D', text: 'Hash table' }
]

const read = (model: string, answer: string, defensible: string[] = [answer]): Reading => ({
  model,
  answer,
  defensible,
  reason: 'because'
})

const KIMI = 'moonshotai/Kimi-K2.6'
const MINIMAX = 'MiniMaxAI/MiniMax-M2.1'

describe('fewer than two distinct readings', () => {
  test('no readings at all', () => {
    expect(verdict([], 'A', OPTIONS)).toEqual({
      verdict: 'unverified',
      reason: 'Fewer than two distinct, receipt-verified readings survived, so no verdict is given.'
    })
  })

  test('one reading', () => {
    expect(verdict([read(KIMI, 'A')], 'A', OPTIONS).verdict).toBe('unverified')
  })

  // The named edge case: distinctness is by the receipt model, so the same model twice is one reading.
  test('two readings served by the same model', () => {
    expect(verdict([read(KIMI, 'B'), read(KIMI, 'B')], 'A', OPTIONS).verdict).toBe('unverified')
  })
})

describe('the five verdicts, in the order the checks fire', () => {
  test('answers differ is Split Opinion', () => {
    const result = verdict([read(MINIMAX, 'A'), read(KIMI, 'B')], 'A', OPTIONS)

    expect(result.verdict).toBe('split_opinion')
    expect(result.reason).toBe(
      'Reader one chose "Stack" and reader two chose "Queue". Rule: two verified readings commit to different answers, so Split Opinion.'
    )
  })

  test('both defensible lists longer than one is Possible Ambiguity', () => {
    const result = verdict([read(MINIMAX, 'A', ['A', 'B']), read(KIMI, 'A', ['A', 'B'])], 'A', OPTIONS)

    expect(result.verdict).toBe('possible_ambiguity')
    expect(result.reason).toBe(
      'Both readers found more than one defensible option. Rule: two verified readings each identify more than one defensible option, so Possible Ambiguity.'
    )
  })

  test('shared answer equals the key is Clear', () => {
    const result = verdict([read(MINIMAX, 'A'), read(KIMI, 'A')], 'A', OPTIONS)

    expect(result).toEqual({ verdict: 'clear', reason: 'Both readers chose the key.' })
  })

  test('otherwise is Possible Key Error', () => {
    const result = verdict([read(MINIMAX, 'B'), read(KIMI, 'B')], 'A', OPTIONS)

    expect(result.verdict).toBe('possible_key_error')
    expect(result.reason).toBe(
      'Both readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error.'
    )
  })
})

describe('the order is a decision, not an accident', () => {
  // Disagreement before ambiguity: two readers who both hedge but commit differently are a split.
  test('differing answers beat both hedging', () => {
    const result = verdict([read(MINIMAX, 'A', ['A', 'C']), read(KIMI, 'B', ['B', 'C'])], 'A', OPTIONS)

    expect(result.verdict).toBe('split_opinion')
  })

  // Ambiguity before the key: an item both answered "correctly" while each saw two options is still flagged.
  test('both hedging beats agreeing with the key', () => {
    const result = verdict([read(MINIMAX, 'A', ['A', 'B']), read(KIMI, 'A', ['A', 'B'])], 'A', OPTIONS)

    expect(result.verdict).toBe('possible_ambiguity')
  })
})

describe('a defensible list that omits answer is treated as if it included it', () => {
  test('an empty list does not read as zero options', () => {
    const result = verdict([read(MINIMAX, 'A', []), read(KIMI, 'A', [])], 'A', OPTIONS)

    expect(result.verdict).toBe('clear')
  })

  test('a list naming only another option still counts the answer', () => {
    // 'B' plus the implied 'A' is two defensible options for both readers, so this is ambiguity.
    const result = verdict([read(MINIMAX, 'A', ['B']), read(KIMI, 'A', ['B'])], 'A', OPTIONS)

    expect(result.verdict).toBe('possible_ambiguity')
  })
})

describe('only one reader lists a second defensible option', () => {
  test('falls through to Clear and names that reader second option', () => {
    const result = verdict([read(MINIMAX, 'A'), read(KIMI, 'A', ['A', 'D'])], 'A', OPTIONS)

    expect(result.verdict).toBe('clear')
    expect(result.reason).toBe(
      'Both readers chose the key. Reader two also considered "Hash table" defensible; a single opinion never decides.'
    )
  })

  test('falls through to Possible Key Error and names it there too', () => {
    const result = verdict([read(MINIMAX, 'B', ['B', 'D']), read(KIMI, 'B')], 'A', OPTIONS)

    expect(result.verdict).toBe('possible_key_error')
    expect(result.reason).toBe(
      'Both readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error. Reader one also considered "Hash table" defensible; a single opinion never decides.'
    )
  })
})

describe('exactly the first two distinct readings decide', () => {
  test('a third reading is ignored', () => {
    const readings = [read(MINIMAX, 'A'), read(KIMI, 'A'), read('deepseek-ai/DeepSeek-V3.2', 'B')]

    expect(verdict(readings, 'A', OPTIONS).verdict).toBe('clear')
  })

  test('a repeated model is skipped to reach the first distinct pair', () => {
    const readings = [read(MINIMAX, 'B'), read(MINIMAX, 'B'), read(KIMI, 'B')]

    expect(verdict(readings, 'A', OPTIONS).verdict).toBe('possible_key_error')
  })
})

describe('a letter with no matching option falls back to the letter', () => {
  test('an unknown key letter still produces a sentence', () => {
    const result = verdict([read(MINIMAX, 'B'), read(KIMI, 'B')], 'Z', OPTIONS)

    expect(result.reason).toBe(
      'Both readers chose Queue. The supplied key is Z. Rule: two verified readings agree on a non-key option, so Possible Key Error.'
    )
  })
})
