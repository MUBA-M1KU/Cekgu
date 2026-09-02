import { describe, expect, test } from 'bun:test'
import type { Disposition, Item, ItemVerdict, RecordDetail, RecordStatus, VerdictCounts } from '../../shared/types'
import { deriveMascotState } from './state'

type ItemSpec = { id: string; verdict: ItemVerdict; dispositions?: number }

function disposition(index: number): Disposition {
  return {
    id: `disposition-${index}`,
    kind: 'key_confirmed',
    revisedKey: null,
    revisedText: null,
    note: null,
    createdAt: '2026-09-03T01:00:00Z'
  }
}

function item({ id, verdict, dispositions = 0 }: ItemSpec, position: number): Item {
  return {
    id,
    position,
    stem: 'Which data structure processes elements in first in, first out order?',
    options: [],
    key: 'A',
    status: verdict === 'pending' ? 'running' : 'done',
    verdict,
    verdictReason: null,
    attemptsUsed: 0,
    attempts: [],
    dispositions: Array.from({ length: dispositions }, (_, index) => disposition(index))
  }
}

function record(status: RecordStatus, specs: ItemSpec[]): RecordDetail {
  const items = specs.map(item)
  const counts: VerdictCounts = {
    clear: 0,
    possible_key_error: 0,
    possible_ambiguity: 0,
    split_opinion: 0,
    unverified: 0,
    pending: 0
  }
  for (const entry of items) counts[entry.verdict] += 1

  return {
    id: 'rec-1',
    title: 'Introductory Computer Science practice set',
    subject: 'Computer Science',
    language: 'en',
    context: null,
    status,
    isSample: false,
    expiresAt: null,
    counts,
    items
  }
}

const PENDING: ItemSpec[] = [
  { id: 'a', verdict: 'pending' },
  { id: 'b', verdict: 'pending' },
  { id: 'c', verdict: 'pending' }
]

describe('the record status decides before any item is compared', () => {
  test('a resolved record is resolved', () => {
    const previous = record('in_review', [{ id: 'a', verdict: 'clear' }])
    expect(deriveMascotState(previous, record('resolved', [{ id: 'a', verdict: 'clear' }]))).toBe('resolved')
  })

  test('a queued record is checking', () => {
    expect(deriveMascotState(null, record('queued', PENDING))).toBe('checking')
  })

  test('a checking record is checking', () => {
    const previous = record('queued', PENDING)
    expect(deriveMascotState(previous, record('checking', PENDING))).toBe('checking')
  })
})

describe('a verdict landing on an item that was pending', () => {
  const previous = record('checking', PENDING)

  const landed = (verdict: ItemVerdict) =>
    record('ready', [
      { id: 'a', verdict },
      { id: 'b', verdict: 'pending' },
      { id: 'c', verdict: 'pending' }
    ])

  test('split opinion', () => {
    expect(deriveMascotState(previous, landed('split_opinion'))).toBe('split')
  })

  test('possible key error', () => {
    expect(deriveMascotState(previous, landed('possible_key_error'))).toBe('attention')
  })

  test('possible ambiguity', () => {
    expect(deriveMascotState(previous, landed('possible_ambiguity'))).toBe('attention')
  })

  test('unverified', () => {
    expect(deriveMascotState(previous, landed('unverified'))).toBe('unverified')
  })

  test('clear', () => {
    expect(deriveMascotState(previous, landed('clear'))).toBe('agreement')
  })
})

describe('precedence when several verdicts land in the same snapshot', () => {
  const previous = record('checking', PENDING)

  test('split opinion beats an attention verdict', () => {
    const next = record('ready', [
      { id: 'a', verdict: 'possible_key_error' },
      { id: 'b', verdict: 'split_opinion' },
      { id: 'c', verdict: 'clear' }
    ])
    expect(deriveMascotState(previous, next)).toBe('split')
  })

  test('an attention verdict beats unverified', () => {
    const next = record('ready', [
      { id: 'a', verdict: 'unverified' },
      { id: 'b', verdict: 'possible_ambiguity' },
      { id: 'c', verdict: 'clear' }
    ])
    expect(deriveMascotState(previous, next)).toBe('attention')
  })

  test('unverified beats clear', () => {
    const next = record('ready', [
      { id: 'a', verdict: 'clear' },
      { id: 'b', verdict: 'unverified' },
      { id: 'c', verdict: 'clear' }
    ])
    expect(deriveMascotState(previous, next)).toBe('unverified')
  })
})

describe('a record opened cold never replays its history', () => {
  test('a ready record full of landed verdicts is idle', () => {
    const next = record('ready', [
      { id: 'a', verdict: 'split_opinion' },
      { id: 'b', verdict: 'possible_key_error' },
      { id: 'c', verdict: 'clear' }
    ])
    expect(deriveMascotState(null, next)).toBe('idle')
  })

  test('a record under review is idle', () => {
    expect(deriveMascotState(null, record('in_review', [{ id: 'a', verdict: 'clear', dispositions: 1 }]))).toBe('idle')
  })

  test('a queued record still reports the work in progress', () => {
    expect(deriveMascotState(null, record('queued', PENDING))).toBe('checking')
  })
})

describe('everything else is idle', () => {
  test('two identical snapshots', () => {
    const snapshot = record('ready', [{ id: 'a', verdict: 'clear' }])
    expect(deriveMascotState(snapshot, record('ready', [{ id: 'a', verdict: 'clear' }]))).toBe('idle')
  })

  test('a disposition recorded on a record still under review', () => {
    const previous = record('ready', [{ id: 'a', verdict: 'possible_key_error' }])
    const next = record('in_review', [{ id: 'a', verdict: 'possible_key_error', dispositions: 1 }])
    expect(deriveMascotState(previous, next)).toBe('idle')
  })

  test('a disposition that finishes the record is resolved', () => {
    const previous = record('in_review', [{ id: 'a', verdict: 'possible_key_error' }])
    const next = record('resolved', [{ id: 'a', verdict: 'possible_key_error', dispositions: 1 }])
    expect(deriveMascotState(previous, next)).toBe('resolved')
  })

  test('an item the previous snapshot did not carry has not landed', () => {
    const previous = record('ready', [{ id: 'a', verdict: 'clear' }])
    const next = record('ready', [
      { id: 'a', verdict: 'clear' },
      { id: 'b', verdict: 'split_opinion' }
    ])
    expect(deriveMascotState(previous, next)).toBe('idle')
  })

  test('a verdict that moved between two settled values has not landed', () => {
    const previous = record('ready', [{ id: 'a', verdict: 'unverified' }])
    const next = record('ready', [{ id: 'a', verdict: 'split_opinion' }])
    expect(deriveMascotState(previous, next)).toBe('idle')
  })
})
