import { describe, expect, test } from 'bun:test'
import { recordScore, scoreBand, truthScore } from './truth-score'
import type { Reading } from './types'

const read = (model: string, answer: string, defensible: string[] = [answer]): Reading => ({
  model,
  answer,
  defensible,
  reason: 'because'
})

const DEEPSEEK = 'deepseek-ai/DeepSeek-V4-Flash-0731'
const MINIMAX = 'MiniMaxAI/MiniMax-M2.7'

describe('no pair to score', () => {
  test('no readings scores null, not zero', () => {
    expect(truthScore([], 'A')).toBeNull()
  })

  test('one reading scores null', () => {
    expect(truthScore([read(DEEPSEEK, 'A')], 'A')).toBeNull()
  })

  test('two readings from one family score null', () => {
    expect(truthScore([read(DEEPSEEK, 'A'), read(DEEPSEEK, 'A')], 'A')).toBeNull()
  })
})

describe('the score tracks the verdict ladder', () => {
  test('both readers commit to the key and hedge nothing', () => {
    expect(truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A')], 'A')).toBe(100)
  })

  test('one reader hedges across two options', () => {
    expect(truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A', ['A', 'B'])], 'A')).toBe(88)
  })

  test('both readers hedge across two options', () => {
    expect(truthScore([read(DEEPSEEK, 'A', ['A', 'B']), read(MINIMAX, 'A', ['A', 'C'])], 'A')).toBe(75)
  })

  test('a split where neither reader would defend the other answer', () => {
    expect(truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'B')], 'A')).toBe(50)
  })

  test('a split where the dissenter still defends the key', () => {
    expect(truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'B', ['B', 'A'])], 'A')).toBe(63)
  })

  test('both readers agree on a non-key answer', () => {
    expect(truthScore([read(DEEPSEEK, 'B'), read(MINIMAX, 'B')], 'A')).toBe(0)
  })

  test('both agree against the key but each would still defend it', () => {
    expect(truthScore([read(DEEPSEEK, 'B', ['B', 'A']), read(MINIMAX, 'B', ['B', 'A'])], 'A')).toBe(25)
  })
})

describe('the score is bounded and ordered', () => {
  const ladder = [
    truthScore([read(DEEPSEEK, 'B'), read(MINIMAX, 'B')], 'A'),
    truthScore([read(DEEPSEEK, 'B', ['B', 'A']), read(MINIMAX, 'B', ['B', 'A'])], 'A'),
    truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'B')], 'A'),
    truthScore([read(DEEPSEEK, 'A', ['A', 'B']), read(MINIMAX, 'A', ['A', 'C'])], 'A'),
    truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A', ['A', 'B'])], 'A'),
    truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A')], 'A')
  ]

  test('every rung sits between 0 and 100', () => {
    for (const score of ladder) {
      expect(score).not.toBeNull()
      expect(score as number).toBeGreaterThanOrEqual(0)
      expect(score as number).toBeLessThanOrEqual(100)
    }
  })

  test('agreeing against the key never outscores agreeing with it', () => {
    expect(ladder).toEqual([...ladder].sort((a, b) => (a as number) - (b as number)))
  })
})

describe('a reading that omits its own answer from defensible', () => {
  test('is treated as if it included it, matching the verdict rule', () => {
    expect(truthScore([read(DEEPSEEK, 'A', ['B']), read(MINIMAX, 'A', ['A', 'B'])], 'A')).toBe(75)
  })
})

describe('the pair is chosen the way the verdict chooses it', () => {
  test('the first distinct pair scores, and later readings do not move it', () => {
    const readings = [read(DEEPSEEK, 'A'), read(MINIMAX, 'A'), read(MINIMAX, 'C')]
    expect(truthScore(readings, 'A')).toBe(100)
  })
})

describe('the record score', () => {
  test('averages the items that have a score', () => {
    expect(recordScore([100, 50, 0])).toEqual({ score: 50, scored: 3, total: 3 })
  })

  test('unverified items leave the mean alone but are still counted in the total', () => {
    expect(recordScore([100, null, null])).toEqual({ score: 100, scored: 1, total: 3 })
  })

  test('a record nobody could read has no score', () => {
    expect(recordScore([null, null])).toEqual({ score: null, scored: 0, total: 2 })
  })

  test('an empty record has no score', () => {
    expect(recordScore([])).toEqual({ score: null, scored: 0, total: 0 })
  })
})

describe('bands', () => {
  test('the boundaries fall on the stated side', () => {
    expect(scoreBand(100)).toBe('strong')
    expect(scoreBand(75)).toBe('strong')
    expect(scoreBand(74)).toBe('mixed')
    expect(scoreBand(40)).toBe('mixed')
    expect(scoreBand(39)).toBe('weak')
    expect(scoreBand(0)).toBe('weak')
  })
})
