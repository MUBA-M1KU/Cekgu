import { describe, expect, test } from 'bun:test'
import type { Option } from '../../shared/types'
import { verdict } from '../../shared/verdict'
import type { Provenance } from './client'
import { admitReading, solverPrompt } from './reading'

const OPTIONS: Option[] = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' },
  { letter: 'C', text: 'Binary tree' }
]

function verified(content: string, overrides: Partial<Provenance> = {}): Provenance {
  return {
    content,
    requestId: 'req-1',
    devshardId: '70158',
    requestedModel: 'moonshotai/Kimi-K2.6',
    servedModel: 'moonshotai/Kimi-K2.6',
    fallbackHeader: null,
    receiptStatus: 'verified',
    receipt: null,
    httpStatus: 200,
    latencyMs: 1200,
    error: null,
    ...overrides
  }
}

describe('solverPrompt', () => {
  const prompt = solverPrompt(
    { stem: 'Which structure is first in, first out?', options: OPTIONS },
    'Computer Science',
    'en'
  )

  test('it carries the stem, the lettered options, the subject and the language', () => {
    expect(prompt).toContain('Which structure is first in, first out?')
    expect(prompt).toContain('B. Queue')
    expect(prompt).toContain('Computer Science')
    expect(prompt).toContain('en')
  })

  // FR-QUEUE-2. A reader told the key confirms it, which is the whole failure Cekgu exists to catch.
  test('it never contains the supplied key or another reading', () => {
    expect(prompt.toLowerCase()).not.toContain('key')
    expect(prompt.toLowerCase()).not.toContain('correct answer is')
  })
})

describe('admitReading', () => {
  test('a clean verified reading is admitted', () => {
    const result = admitReading(verified('{"answer":"B","defensible":["B"],"reason":"A queue is FIFO."}'), OPTIONS)

    expect(result.admitted).toBe(true)
    if (result.admitted) {
      expect(result.reading.answer).toBe('B')
      expect(result.reading.model).toBe('moonshotai/Kimi-K2.6')
    }
  })

  test('the model on the reading is the served model, not the requested one', () => {
    const provenance = verified('{"answer":"B","defensible":["B"],"reason":"x"}', {
      servedModel: 'MiniMaxAI/MiniMax-M2.7'
    })
    const result = admitReading(provenance, OPTIONS)

    expect(result.admitted && result.reading.model).toBe('MiniMaxAI/MiniMax-M2.7')
  })

  test('an unverified receipt is refused before the content is read', () => {
    const result = admitReading(
      verified('{"answer":"B","defensible":["B"],"reason":"x"}', { receiptStatus: 'mismatch' }),
      OPTIONS
    )

    expect(result.admitted).toBe(false)
    expect(!result.admitted && result.rejectionReason).toContain('receipt')
  })

  test('a gateway error is the rejection reason, verbatim', () => {
    const result = admitReading(verified('', { error: 'The gateway answered 429.' }), OPTIONS)

    expect(!result.admitted && result.rejectionReason).toBe('The gateway answered 429.')
  })

  test('JSON wrapped in prose or a fence is still read', () => {
    const fenced = 'Here is my answer:\n```json\n{"answer":"A","defensible":["A"],"reason":"x"}\n```'
    expect(admitReading(verified(fenced), OPTIONS).admitted).toBe(true)
  })

  test('content that is not JSON is refused', () => {
    const result = admitReading(verified('I think the answer is B.'), OPTIONS)

    expect(!result.admitted && result.rejectionReason).toBe('The model did not return the requested JSON.')
  })

  test('an answer outside the options is refused and named', () => {
    const result = admitReading(verified('{"answer":"F","defensible":["F"],"reason":"x"}'), OPTIONS)

    expect(!result.admitted && result.rejectionReason).toBe('The model answered F, which is not an option.')
  })

  test('a defensible list that omits the answer gains it', () => {
    const result = admitReading(verified('{"answer":"B","defensible":["A"],"reason":"x"}'), OPTIONS)

    expect(result.admitted && result.reading.defensible).toEqual(['B', 'A'])
  })

  test('a defensible letter that is not an option is refused, not dropped', () => {
    const result = admitReading(verified('{"answer":"B","defensible":["B","Z"],"reason":"x"}'), OPTIONS)

    expect(result.admitted).toBe(false)
    expect(!result.admitted && result.rejectionReason).toBe('The model called Z defensible, which is not an option.')
  })

  // Regression, found by dev-b0 on #86. Trimming the invented letter left reader one committed to a
  // single option, and an item both readers hedged on reported Clear instead of Possible Ambiguity.
  test('trimming an invented letter would have downgraded a verdict', () => {
    const one = admitReading(verified('{"answer":"B","defensible":["B","E"],"reason":"x"}'), OPTIONS)
    const two = admitReading(verified('{"answer":"B","defensible":["B","C"],"reason":"x"}'), OPTIONS)

    expect(one.admitted).toBe(false)
    expect(two.admitted).toBe(true)

    // With reader one refused there is one reading, so the rule fails closed rather than clearing it.
    const readings = [one, two].flatMap((result) => (result.admitted ? [result.reading] : []))
    expect(verdict(readings, 'B', OPTIONS).verdict).toBe('unverified')
  })

  test('a reading with no serving model is refused rather than labelled with the requested one', () => {
    const result = admitReading(
      verified('{"answer":"B","defensible":["B"],"reason":"x"}', { servedModel: null }),
      OPTIONS
    )

    expect(!result.admitted && result.rejectionReason).toBe('The receipt named no serving model.')
  })

  test('a missing reason is refused rather than defaulted', () => {
    const result = admitReading(verified('{"answer":"B","defensible":["B"]}'), OPTIONS)

    expect(result.admitted).toBe(false)
  })
})
