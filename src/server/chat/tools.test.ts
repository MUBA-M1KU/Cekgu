import { describe, expect, test } from 'bun:test'
import type { Attempt, Item, RecordDetail } from '../../shared/types'
import { getAttempts, getItem, getReadings, listItems, recordSummary, runTool, type ToolResult } from './tools'

function data<T>(result: ToolResult): T {
  if (!result.ok) throw new Error(result.error)
  return result.data as T
}

function makeAttempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: 'att-base',
    requestedModel: 'default',
    servedModel: 'default',
    requestId: 'req-base',
    devshardId: null,
    fallbackHeader: null,
    httpStatus: 200,
    receiptStatus: 'verified',
    reading: null,
    latencyMs: 1000,
    startedAt: '2026-09-01T08:00:00Z',
    finishedAt: '2026-09-01T08:00:01Z',
    admitted: false,
    rejectionReason: null,
    ...overrides
  }
}

function makeItem(overrides: Partial<Item> & { position: number }): Item {
  const { position, ...rest } = overrides
  return {
    id: `item-${position}`,
    position,
    stem: 'Question?',
    options: [],
    key: 'A',
    status: 'done',
    verdict: 'pending',
    verdictReason: null,
    attemptsUsed: 0,
    attempts: [],
    dispositions: [],
    ...rest
  }
}

const STEM_160 = 'x'.repeat(160)
const STEM_161 = 'x'.repeat(161)

const record: RecordDetail = {
  id: 'record-1',
  title: 'Ujian Matematik Percubaan SPM',
  subject: 'Matematik',
  language: 'ms',
  context: null,
  status: 'ready',
  isSample: false,
  expiresAt: null,
  counts: {
    clear: 3,
    possible_key_error: 2,
    possible_ambiguity: 0,
    split_opinion: 0,
    unverified: 1,
    pending: 1
  },
  items: [
    makeItem({
      position: 1,
      stem: 'What is 2 + 2?',
      options: [
        { letter: 'A', text: '3' },
        { letter: 'B', text: '4' },
        { letter: 'C', text: '5' }
      ],
      key: 'B',
      verdict: 'clear',
      verdictReason: 'Both readers chose B.',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-1',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-001',
          admitted: true,
          reading: {
            model: 'moonshotai/Kimi-K2.6',
            answer: 'B',
            defensible: ['B'],
            reason: 'Basic arithmetic.'
          }
        }),
        makeAttempt({
          id: 'att-2',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-001',
          admitted: true,
          reading: {
            model: 'MiniMaxAI/MiniMax-M2.1',
            answer: 'B',
            defensible: ['B'],
            reason: 'Two plus two is four.'
          }
        })
      ]
    }),
    makeItem({
      position: 2,
      stem: 'Which word is a noun?',
      options: [
        { letter: 'A', text: 'Run' },
        { letter: 'B', text: 'Quickly' },
        { letter: 'C', text: 'Table' }
      ],
      key: 'C',
      verdict: 'possible_key_error',
      verdictReason: 'Both readers chose A.',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-3',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-002',
          admitted: true,
          reading: {
            model: 'moonshotai/Kimi-K2.6',
            answer: 'A',
            defensible: ['A'],
            reason: 'A table is a noun.'
          }
        }),
        makeAttempt({
          id: 'att-4',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-002',
          admitted: true,
          reading: {
            model: 'MiniMaxAI/MiniMax-M2.1',
            answer: 'A',
            defensible: ['A'],
            reason: 'Table is a noun.'
          }
        })
      ]
    }),
    makeItem({
      position: 3,
      stem: 'What is the speed of light?',
      options: [
        { letter: 'A', text: '300 km/s' },
        { letter: 'B', text: '300,000 km/s' },
        { letter: 'C', text: '3 m/s' }
      ],
      key: 'B',
      status: 'done',
      verdict: 'unverified',
      verdictReason: 'No reading survived verification.',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-5',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-003',
          httpStatus: 500,
          receiptStatus: 'missing',
          latencyMs: null,
          admitted: false,
          rejectionReason: 'The receipt could not be verified.'
        }),
        makeAttempt({
          id: 'att-6',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-003',
          receiptStatus: 'mismatch',
          latencyMs: 1400,
          admitted: false,
          rejectionReason: 'The receipt named a different model.'
        })
      ]
    }),
    makeItem({
      position: 4,
      stem: 'Solve for x.',
      options: [
        { letter: 'A', text: '1' },
        { letter: 'B', text: '2' },
        { letter: 'C', text: '3' }
      ],
      key: 'B',
      status: 'running',
      verdict: 'pending',
      verdictReason: null,
      attemptsUsed: 0,
      attempts: []
    }),
    makeItem({
      position: 5,
      stem: 'Identify the verb.',
      options: [
        { letter: 'A', text: 'Happy' },
        { letter: 'B', text: 'Run' },
        { letter: 'C', text: 'Table' }
      ],
      key: 'C',
      verdict: 'possible_key_error',
      verdictReason: 'Both readers chose B.',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-7',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-004',
          admitted: true,
          reading: {
            model: 'moonshotai/Kimi-K2.6',
            answer: 'B',
            defensible: ['B'],
            reason: 'Run is a verb.'
          }
        }),
        makeAttempt({
          id: 'att-8',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-004',
          admitted: true,
          reading: {
            model: 'MiniMaxAI/MiniMax-M2.1',
            answer: 'B',
            defensible: ['B'],
            reason: 'Running is an action.'
          }
        })
      ],
      dispositions: [
        {
          id: 'disp-1',
          kind: 'key_confirmed',
          revisedKey: null,
          revisedText: null,
          note: 'Confirmed by panel.',
          createdAt: '2026-09-01T10:00:00Z'
        }
      ]
    }),
    makeItem({
      position: 6,
      stem: STEM_160,
      options: [{ letter: 'A', text: 'Short' }],
      key: 'A',
      verdict: 'clear',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-9',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-005',
          admitted: true,
          reading: { model: 'moonshotai/Kimi-K2.6', answer: 'A', defensible: ['A'], reason: 'It fits.' }
        }),
        makeAttempt({
          id: 'att-10',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-005',
          admitted: true,
          reading: { model: 'MiniMaxAI/MiniMax-M2.1', answer: 'A', defensible: ['A'], reason: 'Agreed.' }
        })
      ]
    }),
    makeItem({
      position: 7,
      stem: STEM_161,
      options: [{ letter: 'A', text: 'Long' }],
      key: 'A',
      verdict: 'clear',
      attemptsUsed: 2,
      attempts: [
        makeAttempt({
          id: 'att-11',
          requestedModel: 'moonshotai/Kimi-K2.6',
          servedModel: 'moonshotai/Kimi-K2.6',
          requestId: 'req-kimi-006',
          admitted: true,
          reading: { model: 'moonshotai/Kimi-K2.6', answer: 'A', defensible: ['A'], reason: 'It fits.' }
        }),
        makeAttempt({
          id: 'att-12',
          requestedModel: 'MiniMaxAI/MiniMax-M2.1',
          servedModel: 'MiniMaxAI/MiniMax-M2.1',
          requestId: 'req-minimax-006',
          admitted: true,
          reading: { model: 'MiniMaxAI/MiniMax-M2.1', answer: 'A', defensible: ['A'], reason: 'Agreed.' }
        })
      ]
    })
  ]
}

describe('record_summary', () => {
  test('returns the record overview', () => {
    const result = recordSummary(record)
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(result.data).toEqual({
      title: record.title,
      subject: record.subject,
      language: record.language,
      status: record.status,
      itemCount: 7,
      attentionCount: 2,
      counts: record.counts
    })
  })
})

describe('list_items', () => {
  test('returns every item when no verdict is given', () => {
    const items = data<Array<{ position: number; stem: string; verdict: string; decided: boolean }>>(listItems(record))
    expect(items.length).toBe(7)
  })

  test('filters to a valid verdict', () => {
    const clear = data<Array<{ position: number; verdict: string }>>(listItems(record, 'clear'))
    expect(clear.map((item) => item.position)).toEqual([1, 6, 7])
  })

  test('returns an empty list when the verdict has no matches', () => {
    const result = listItems(record, 'possible_ambiguity')
    expect(result.ok).toBe(true)
    expect(data<unknown[]>(result).length).toBe(0)
  })

  test('returns an error for an invalid verdict', () => {
    const result = listItems(record, 'not_a_verdict')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('Invalid verdict')
  })

  test('leaves a 160-character stem untouched', () => {
    const items = data<Array<{ position: number; stem: string }>>(listItems(record))
    const item = items.find((i) => i.position === 6)
    if (!item) throw new Error('expected item at position 6')
    expect(item.stem.length).toBe(160)
    expect(item.stem.endsWith('…')).toBe(false)
  })

  test('truncates a 161-character stem to 160 with an ellipsis', () => {
    const items = data<Array<{ position: number; stem: string }>>(listItems(record))
    const item = items.find((i) => i.position === 7)
    if (!item) throw new Error('expected item at position 7')
    expect(item.stem.length).toBe(160)
    expect(item.stem.endsWith('…')).toBe(true)
  })

  test('marks an item with dispositions as decided', () => {
    const items = data<Array<{ position: number; decided: boolean }>>(listItems(record))
    expect(items.find((i) => i.position === 5)?.decided).toBe(true)
    expect(items.find((i) => i.position === 2)?.decided).toBe(false)
  })
})

describe('get_item', () => {
  test('returns one item in full', () => {
    const item = data<{
      position: number
      stem: string
      options: Array<{ letter: string; text: string }>
      key: string
      verdict: string
      dispositions: unknown[]
    }>(getItem(record, 2))
    expect(item.position).toBe(2)
    expect(item.stem).toBe('Which word is a noun?')
    expect(item.options.length).toBe(3)
    expect(item.key).toBe('C')
    expect(item.verdict).toBe('possible_key_error')
  })

  test('passes dispositions through', () => {
    const item = data<{ dispositions: unknown[] }>(getItem(record, 5))
    expect(item.dispositions.length).toBe(1)
  })
})

describe('get_readings', () => {
  test('returns the two seated readings with seat labels', () => {
    const readings = data<
      Array<{
        seat: number
        seatLabel: string
        model: string
        requestId: string
        answer: string
        defensible: string[]
        reason: string
      }>
    >(getReadings(record, 1))
    const [first, second] = readings
    if (!first || !second) throw new Error('expected two readings')
    expect(first.seat).toBe(0)
    expect(first.seatLabel).toBe('Reader A')
    expect(first.model).toBe('moonshotai/Kimi-K2.6')
    expect(first.requestId).toBe('req-kimi-001')
    expect(second.seat).toBe(1)
    expect(second.seatLabel).toBe('Reader B')
    expect(second.model).toBe('MiniMaxAI/MiniMax-M2.1')
    expect(second.requestId).toBe('req-minimax-001')
  })

  test('returns an empty array when no readings were admitted', () => {
    const readings = data<unknown[]>(getReadings(record, 3))
    expect(readings.length).toBe(0)
  })
})

describe('get_attempts', () => {
  test('passes through every attempt including rejected ones', () => {
    const attempts = data<
      Array<{
        requestedModel: string
        servedModel: string
        requestId: string
        admitted: boolean
        rejectionReason: string | null
      }>
    >(getAttempts(record, 3))
    const [first, second] = attempts
    if (!first || !second) throw new Error('expected two attempts')
    expect(attempts.every((a) => !a.admitted)).toBe(true)
    expect(first.rejectionReason).toBe('The receipt could not be verified.')
    expect(second.rejectionReason).toBe('The receipt named a different model.')
    expect(first.requestId).toBe('req-kimi-003')
    expect(second.requestId).toBe('req-minimax-003')
  })
})

describe('runTool', () => {
  test('routes record_summary', () => {
    const result = runTool(record, 'record_summary', {})
    expect(result.ok).toBe(true)
  })

  test('returns an error for an unknown tool', () => {
    const result = runTool(record, 'unknown_tool', {})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('Unknown tool: unknown_tool.')
  })

  test('returns an error when position is missing', () => {
    const result = runTool(record, 'get_item', {})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('Position is required')
  })

  test('returns an error when position is not a number', () => {
    const result = runTool(record, 'get_item', { position: 'abc' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('must be a number')
  })

  test('returns an error when the position does not match an item', () => {
    const result = runTool(record, 'get_item', { position: 99 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('No item at position 99 in this record.')
  })
})
