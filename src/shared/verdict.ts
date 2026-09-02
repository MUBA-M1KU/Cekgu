import type { Option, Reading, Verdict } from './types'

// TRD section 14. The checks below run in a fixed order and the order is a decision:
// disagreement before ambiguity, so two readers who both hedge but commit to different
// answers are a split; ambiguity before the key, so an item both answered "correctly"
// while each saw two defensible options is still flagged.

const UNVERIFIED = 'Fewer than two distinct, receipt-verified readings survived, so no verdict is given.'

// A reading that omits its own answer from defensible is treated as if it included it.
const defensibleOf = (reading: Reading): string[] =>
  reading.defensible.includes(reading.answer)
    ? [...new Set(reading.defensible)]
    : [...new Set([reading.answer, ...reading.defensible])]

// Distinctness is by the receipt model carried on the reading, never by the model requested.
const firstDistinctPair = (readings: Reading[]): [Reading, Reading] | null => {
  const [first, ...rest] = readings
  if (!first) return null

  const second = rest.find((reading) => reading.model !== first.model)
  return second ? [first, second] : null
}

export function verdict(readings: Reading[], key: string, options: Option[]): { verdict: Verdict; reason: string } {
  const pair = firstDistinctPair(readings)
  if (!pair) return { verdict: 'unverified', reason: UNVERIFIED }

  const [one, two] = pair
  const textOf = (letter: string) => options.find((option) => option.letter === letter)?.text ?? letter

  if (one.answer !== two.answer) {
    return {
      verdict: 'split_opinion',
      reason: `Reader one chose "${textOf(one.answer)}" and reader two chose "${textOf(two.answer)}". Rule: two verified readings commit to different answers, so Split Opinion.`
    }
  }

  const defensibleOne = defensibleOf(one)
  const defensibleTwo = defensibleOf(two)

  if (defensibleOne.length > 1 && defensibleTwo.length > 1) {
    return {
      verdict: 'possible_ambiguity',
      reason:
        'Both readers found more than one defensible option. Rule: two verified readings each identify more than one defensible option, so Possible Ambiguity.'
    }
  }

  // Exactly one reader hedged, which PRODUCT.md's table does not cover. It falls through on the
  // shared answer, and the reason names that reader's other option so the educator sees it.
  const hedger =
    defensibleOne.length > 1
      ? { ordinal: 'one', defensible: defensibleOne }
      : defensibleTwo.length > 1
        ? { ordinal: 'two', defensible: defensibleTwo }
        : null

  const aside = hedger
    ? ` Reader ${hedger.ordinal} also considered "${textOf(
        hedger.defensible.find((letter) => letter !== one.answer) ?? ''
      )}" defensible; a single opinion never decides.`
    : ''

  if (one.answer === key) return { verdict: 'clear', reason: `Both readers chose the key.${aside}` }

  return {
    verdict: 'possible_key_error',
    reason: `Both readers chose ${textOf(one.answer)}. The supplied key is ${textOf(key)}. Rule: two verified readings agree on a non-key option, so Possible Key Error.${aside}`
  }
}
