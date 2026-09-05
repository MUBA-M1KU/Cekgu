import type { Reading, RecordScore } from './types'
import { defensibleOf, firstDistinctPair } from './verdict'

// The track brief asks for a Truth Score from 0 to 100. This computes one from the readings the
// verdict already used, and from nothing else: no extra gateway call, no second opinion, no model
// asked how confident it feels. A number a model reports about itself is not evidence, and paying
// for one would also put a confidence claim on the critical path that no receipt could back.
//
// The score answers one question — how much of the verified reader agreement backs the supplied
// key — so it is a property of the key, not a claim that the question is correct. PRODUCT.md is
// explicit that model agreement never certifies an item, and a score that read as certification
// would contradict the product on its own screen.

// What one reading contributes, from 0 to 1. Committing to an answer is worth half, and the other
// half is split across the options that reader was willing to defend: a reader who names the key
// and nothing else gives it 1, and a reader who names the key beside one other gives it 0.75.
// So hedging costs the key something without erasing the commitment, which is the honest reading
// of a reader who answered but would not rule the alternative out.
function support(reading: Reading, key: string): number {
  const defensible = defensibleOf(reading)
  const share = 0.5 / defensible.length

  if (reading.answer === key) return 0.5 + share
  return defensible.includes(key) ? share : 0
}

/**
 * The item's Truth Score, or null when the verdict is Unverified.
 *
 * Null rather than 0 is the whole point: 0 is what two readers agreeing against the key earns, and
 * an item nobody could read has not earned it. Collapsing the two would let a gateway outage read
 * on screen as a paper full of wrong keys.
 */
export function truthScore(readings: Reading[], key: string): number | null {
  const pair = firstDistinctPair(readings)
  if (!pair) return null

  const [one, two] = pair
  return Math.round((100 * (support(one, key) + support(two, key))) / 2)
}

/**
 * The record's Truth Score: the mean of the items that have one.
 *
 * `scored` and `total` travel with it because the mean alone is not reportable. Three verified
 * items out of twelve can average 100, and printing that as the paper's score would describe nine
 * items nobody read. The UI states both numbers.
 */
export function recordScore(itemScores: (number | null)[]): RecordScore {
  const scored = itemScores.filter((score): score is number => score !== null)
  const total = itemScores.length

  if (!scored.length) return { score: null, scored: 0, total }
  return {
    score: Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length),
    scored: scored.length,
    total
  }
}

/** The band a score falls in. Bands are named, not coloured, so the label survives a greyscale projector. */
export function scoreBand(score: number): 'strong' | 'mixed' | 'weak' {
  if (score >= 75) return 'strong'
  return score >= 40 ? 'mixed' : 'weak'
}
