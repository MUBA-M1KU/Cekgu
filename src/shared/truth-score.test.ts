import { describe, expect, test } from 'bun:test'
import { corroboration, recordScore, scoreBand, truthScore } from './truth-score'
import type { Grounding, Reading } from './types'

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

const ground = (reading: Reading, grounding: Grounding): Reading => ({ ...reading, grounding })

describe('live retrieval adjusts confidence, never direction', () => {
  const bothKey = [read(DEEPSEEK, 'A'), read(MINIMAX, 'A')]
  const bothWrong = [read(DEEPSEEK, 'B'), read(MINIMAX, 'B')]

  test('a reading with no grounding field scores exactly as before retrieval existed', () => {
    expect(truthScore(bothKey, 'A')).toBe(100)
    expect(truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A', ['A', 'B'])], 'A')).toBe(88)
  })

  test('absent leaves the score where it was', () => {
    const readings = bothKey.map((reading) => ground(reading, 'absent'))
    expect(truthScore(readings, 'A')).toBe(100)
  })

  test('absent leaves a hedged score where it was, so silence never marks a question down', () => {
    const readings = [ground(read(DEEPSEEK, 'A'), 'absent'), ground(read(MINIMAX, 'A', ['A', 'B']), 'absent')]
    expect(truthScore(readings, 'A')).toBe(88)
  })

  test('support firms up a hedged reading', () => {
    const hedged = truthScore([read(DEEPSEEK, 'A'), read(MINIMAX, 'A', ['A', 'B'])], 'A') as number
    const backed = truthScore(
      [ground(read(DEEPSEEK, 'A'), 'supported'), ground(read(MINIMAX, 'A', ['A', 'B']), 'supported')],
      'A'
    ) as number
    expect(backed).toBeGreaterThan(hedged)
    expect(backed).toBeLessThanOrEqual(100)
  })

  test('contradiction pulls a reading toward neutral rather than flipping it', () => {
    // Both readers agreed against the key, so the key looked wrong. The web not backing them makes
    // that finding weaker, never the opposite finding.
    const score = truthScore(
      bothWrong.map((reading) => ground(reading, 'contradicted')),
      'A'
    ) as number
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(50)
  })

  test('contradicting two readers who chose the key lowers but does not invert the score', () => {
    const score = truthScore(
      bothKey.map((reading) => ground(reading, 'contradicted')),
      'A'
    ) as number
    expect(score).toBeLessThan(100)
    expect(score).toBeGreaterThan(50)
  })

  test('the web can never push a score outside 0 to 100', () => {
    for (const grounding of ['supported', 'contradicted', 'absent'] as Grounding[]) {
      for (const readings of [bothKey, bothWrong]) {
        const score = truthScore(
          readings.map((reading) => ground(reading, grounding)),
          'A'
        ) as number
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }
    }
  })
})

describe('the corroboration tally', () => {
  const pair = (a: Grounding, b: Grounding): Reading[] => [
    ground(read(DEEPSEEK, 'A'), a),
    ground(read(MINIMAX, 'A'), b)
  ]

  test('both readers supported counts as supported', () => {
    expect(corroboration([pair('supported', 'supported')])).toEqual({
      supported: 1,
      contradicted: 0,
      absent: 0,
      retrieved: 1
    })
  })

  test('one reader contradicted is enough to count the item as contradicted', () => {
    expect(corroboration([pair('supported', 'contradicted')]).contradicted).toBe(1)
  })

  test('one reader supporting is not enough to claim the item is supported', () => {
    const tally = corroboration([pair('supported', 'absent')])
    expect(tally.supported).toBe(0)
    expect(tally.absent).toBe(1)
  })

  test('items retrieval never ran on are not counted at all', () => {
    expect(corroboration([[read(DEEPSEEK, 'A'), read(MINIMAX, 'A')]])).toEqual({
      supported: 0,
      contradicted: 0,
      absent: 0,
      retrieved: 0
    })
  })

  test('an unverified item is not counted', () => {
    expect(corroboration([[ground(read(DEEPSEEK, 'A'), 'supported')]]).retrieved).toBe(0)
    expect(corroboration([undefined]).retrieved).toBe(0)
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
