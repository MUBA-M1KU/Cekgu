import { describe, expect, test } from 'bun:test'
import type { Attempt, Item, ItemVerdict, RecordDetail } from '../../shared/types'
import { itemUtterances, summaryUtterances } from './speech'

const OPTIONS = [
  { letter: 'A', text: 'Stack' },
  { letter: 'B', text: 'Queue' },
  { letter: 'C', text: 'Heap' },
  { letter: 'D', text: 'Tree' }
]

function attempt(model: string, answer: string, defensible: string[] = [answer], id = `req-${model}`): Attempt {
  return {
    id: `a-${model}-${answer}`,
    requestedModel: model,
    servedModel: model,
    requestId: id,
    devshardId: '65725',
    fallbackHeader: null,
    httpStatus: 200,
    receiptStatus: 'verified',
    reading: { model, answer, defensible, reason: 'because' },
    latencyMs: 1200,
    startedAt: '2026-09-04T00:00:00.000Z',
    finishedAt: '2026-09-04T00:00:01.200Z',
    admitted: true,
    rejectionReason: null
  }
}

function item(position: number, verdict: ItemVerdict, attempts: Attempt[], key = 'A'): Item {
  return {
    id: `i-${position}`,
    position,
    stem: `Question ${position}`,
    options: OPTIONS,
    key,
    status: 'done',
    verdict,
    verdictReason: null,
    truthScore: null,
    attemptsUsed: attempts.length,
    attempts,
    dispositions: []
  }
}

function record(items: Item[]): RecordDetail {
  return {
    id: 'r-1',
    title: 'Paper',
    subject: 'Computer Science',
    language: 'en',
    context: null,
    status: 'ready',
    isSample: false,
    expiresAt: null,
    counts: { clear: 0, possible_key_error: 0, possible_ambiguity: 0, split_opinion: 0, unverified: 0, pending: 0 },
    truthScore: { score: null, scored: 0, total: 0 },
    items
  }
}

const KEY_ERROR = [attempt('kimi', 'B'), attempt('minimax', 'B')]
const SPLIT = [attempt('kimi', 'B'), attempt('minimax', 'D')]
const AMBIGUOUS = [attempt('kimi', 'A', ['A', 'C']), attempt('minimax', 'A', ['A', 'C'])]

describe('summaryUtterances', () => {
  test('an empty record says nothing', () => {
    expect(summaryUtterances(record([]))).toEqual([])
  })

  test('a clean record reports the agreement once, from Tororo alone', () => {
    const clean = record([item(1, 'clear', KEY_ERROR), item(2, 'clear', KEY_ERROR)])
    const lines = summaryUtterances(clean)

    expect(lines).toHaveLength(1)
    expect(lines[0]?.seat).toBe(0)
    expect(lines[0]?.text).toBe('Nothing flagged. Both readers agreed with your key on all 2 questions.')
  })

  test('one flagged item is singular', () => {
    const lines = summaryUtterances(record([item(1, 'possible_key_error', KEY_ERROR), item(2, 'clear', KEY_ERROR)]))

    expect(lines).toHaveLength(1)
    expect(lines[0]?.text).toBe('1 question needs a look. 1 key error.')
  })

  test('a mixed record lists the breakdown in the rail order', () => {
    const lines = summaryUtterances(
      record([
        item(1, 'possible_key_error', KEY_ERROR),
        item(2, 'possible_key_error', KEY_ERROR),
        item(3, 'possible_ambiguity', AMBIGUOUS),
        item(4, 'unverified', [attempt('minimax', 'A')]),
        item(5, 'clear', KEY_ERROR)
      ])
    )

    expect(lines[0]?.text).toBe('4 questions need a look. 2 key errors, 1 ambiguity and 1 unverified item.')
  })

  test('a split adds a second line, and only a split does', () => {
    const one = summaryUtterances(record([item(9, 'split_opinion', SPLIT)]))

    expect(one).toHaveLength(2)
    expect(one[1]?.seat).toBe(1)
    expect(one[1]?.text).toBe('We disagree on question 9.')

    const many = summaryUtterances(
      record([item(9, 'split_opinion', SPLIT), item(11, 'split_opinion', SPLIT), item(13, 'split_opinion', SPLIT)])
    )
    expect(many[1]?.text).toBe('We disagree on questions 9, 11 and 13.')
  })

  test('a decided item leaves the count, because a decision is the educator saying it is handled', () => {
    const decided = item(1, 'possible_key_error', KEY_ERROR)
    decided.dispositions = [
      { id: 'd-1', kind: 'key_corrected', revisedKey: 'B', revisedText: null, note: null, createdAt: '2026-09-04' }
    ]

    expect(summaryUtterances(record([decided, item(2, 'clear', KEY_ERROR)]))[0]?.text).toContain('Nothing flagged')
  })

  test('the summary never cites a reading, because it is a record-level fact', () => {
    for (const line of summaryUtterances(record([item(1, 'possible_key_error', KEY_ERROR)]))) {
      expect(line.cite).toBeNull()
    }
  })
})

describe('itemUtterances', () => {
  test('clear and pending items say nothing at all', () => {
    expect(itemUtterances(item(1, 'clear', KEY_ERROR))).toEqual([])
    expect(itemUtterances(item(1, 'pending', []))).toEqual([])
  })

  test('a key error puts both readers on the same answer and names the key', () => {
    const lines = itemUtterances(item(4, 'possible_key_error', KEY_ERROR))

    expect(lines).toHaveLength(2)
    expect(lines[0]?.text).toBe('Question 4. I read Queue.')
    expect(lines[1]?.text).toBe('So did I. The key says Stack.')
    expect(lines[0]?.cite).toEqual({ model: 'kimi', requestId: 'req-kimi' })
    expect(lines[1]?.cite).toEqual({ model: 'minimax', requestId: 'req-minimax' })
  })

  test('an ambiguity names both defensible options', () => {
    const lines = itemUtterances(item(7, 'possible_ambiguity', AMBIGUOUS))

    expect(lines[0]?.text).toBe('Question 7. Stack or Heap both work for me.')
    expect(lines[1]?.text).toBe('Same here. Two defensible answers.')
  })

  test('a split ends in the caption saying the decision is the educator’s', () => {
    const lines = itemUtterances(item(9, 'split_opinion', SPLIT))

    expect(lines[0]?.text).toBe('Question 9. I read Queue.')
    expect(lines[1]?.text).toBe('I read Tree.')
    expect(lines[1]?.caption).toBe('I read Tree. No verdict. This one is yours.')
  })

  // The second reader is absent by definition, so the second cat is absent too. A line here would
  // be a reader that does not exist saying something.
  test('unverified speaks once and leaves the second seat silent', () => {
    const lines = itemUtterances(item(2, 'unverified', [attempt('minimax', 'A')]))

    expect(lines).toHaveLength(1)
    expect(lines[0]?.seat).toBe(0)
    expect(lines[0]?.text).toBe('Question 2. Only one reading came back verified.')
  })

  test('two readings from one family fill one seat, never two', () => {
    const lines = itemUtterances(
      item(3, 'possible_key_error', [attempt('kimi', 'B'), attempt('kimi', 'B', ['B'], 'req-2')])
    )

    expect(lines).toHaveLength(1)
  })

  test('an item with no admitted reading says nothing', () => {
    const rejected = { ...attempt('kimi', 'B'), admitted: false }
    expect(itemUtterances(item(5, 'possible_key_error', [rejected]))).toEqual([])
  })
})
