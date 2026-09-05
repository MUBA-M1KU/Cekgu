import type { Corroboration, Grounding, Reading, RecordScore } from './types'
import { defensibleOf, firstDistinctPair } from './verdict'

// The track brief asks for a Truth Score from 0 to 100. This computes one from the readings the
// verdict already used, and from nothing else: no extra gateway call, no second opinion, no model
// asked how confident it feels. A number a model reports about itself is not evidence, and paying
// for one would also put a confidence claim on the critical path that no receipt could back.
//
// Where live retrieval ran, each reading also carries what the retrieved pages did to its own
// answer. That is folded in below as a confidence adjustment, never as a vote of its own: the web
// does not get to outrank two receipt-verified readers, it only makes them count for more or less.
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

// How far a reading is moved away from 0.5 by what the web did to it. 0.5 is the neutral point —
// the contribution of a reader who tells you nothing either way — so scaling the DISTANCE from it
// changes how much this reading counts without changing which side it is on.
//
// That asymmetry is the design. Corroboration is not a third reader: a page agreeing with a reader
// makes that reader worth more, and a page disagreeing makes it worth less, but neither can flip a
// reading into meaning its opposite. A web search that could overturn two receipt-verified readings
// would put the verdict somewhere with no receipt behind it.
const CONFIDENCE: Record<Grounding, number> = {
  supported: 1.2,
  // Silence is not doubt. Most exam items have no page that settles them, so "absent" has to leave
  // the score exactly where two readers with no evidence at all would leave it — otherwise every
  // well-written question on an unusual topic is marked down for being unusual.
  absent: 1,
  // Halved rather than zeroed. A page contradicting a reader is a reason to trust that reader less,
  // not a reason to believe the opposite of what it said.
  contradicted: 0.5
}

function grounded(reading: Reading, key: string): number {
  const raw = support(reading, key)
  const scale = CONFIDENCE[reading.grounding ?? 'absent']
  return Math.min(1, Math.max(0, 0.5 + (raw - 0.5) * scale))
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
  return Math.round((100 * (grounded(one, key) + grounded(two, key))) / 2)
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

/**
 * What live retrieval did across a record, counted per item rather than per reading.
 *
 * An item counts as supported only when BOTH readers said the evidence backed them, and as
 * contradicted when EITHER did — the same fail-closed asymmetry the verdict rule uses, because a
 * single reader noticing the web disagrees is worth surfacing and a single reader agreeing is not
 * worth claiming.
 */
export function corroboration(items: (Reading[] | undefined)[]): Corroboration {
  const tally: Corroboration = { supported: 0, contradicted: 0, absent: 0, retrieved: 0 }

  for (const readings of items) {
    const pair = readings ? firstDistinctPair(readings) : null
    if (!pair) continue
    const groundings = pair
      .map((reading) => reading.grounding)
      .filter((value): value is Grounding => value !== undefined)
    if (!groundings.length) continue

    tally.retrieved += 1
    if (groundings.includes('contradicted')) tally.contradicted += 1
    else if (groundings.every((value) => value === 'supported')) tally.supported += 1
    else tally.absent += 1
  }

  return tally
}

/** The band a score falls in. Bands are named, not coloured, so the label survives a greyscale projector. */
export function scoreBand(score: number): 'strong' | 'mixed' | 'weak' {
  if (score >= 75) return 'strong'
  return score >= 40 ? 'mixed' : 'weak'
}
