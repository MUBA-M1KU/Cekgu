import { attentionItems, type Seat, seatedAttempts } from '../../shared/chat'
import type { Attempt, Item, RecordDetail } from '../../shared/types'
import { count } from '../plural'

// What the cats say, and the whole of it. Nothing here is generated: every line is a template
// filled from a stored reading and a stored verdict, so the readers can speak with the gateway
// down, cost no inference, and never say anything the evidence panel does not already show.
//
// The register is two readers reporting, flatly. DESIGN.md: a result is a fact, not an event. No
// line congratulates anybody and none of them uses an exclamation mark.

export type Utterance = {
  seat: Seat
  /** Spoken aloud. Short, because it is heard once and cannot be re-read. */
  text: string
  /** Rendered in the bubble. Carries more than the spoken line where the extra is worth reading. */
  caption: string
  cite: { model: string; requestId: string | null } | null
}

const NOUN: Record<string, [string, string]> = {
  possible_key_error: ['key error', 'key errors'],
  possible_ambiguity: ['ambiguity', 'ambiguities'],
  split_opinion: ['split', 'splits'],
  unverified: ['unverified item', 'unverified items']
}

// Attention verdicts in the order the rail shows them, so the spoken breakdown and the chips read
// the same way round.
const ORDER = ['possible_key_error', 'possible_ambiguity', 'split_opinion', 'unverified']

function list(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${last}`
}

function citeOf(attempt: Attempt | undefined): Utterance['cite'] {
  if (!attempt) return null
  return { model: attempt.servedModel ?? 'unknown', requestId: attempt.requestId }
}

function plain(seat: Seat, text: string, cite: Utterance['cite'] = null): Utterance {
  return { seat, text, caption: text, cite }
}

/**
 * The record-level summary, spoken once when a record is finished. At most two lines: Tororo counts
 * what needs a look, and Hijiki speaks only when the two seats actually disagreed, because that is
 * the one case where a second voice carries information rather than volume.
 */
export function summaryUtterances(record: RecordDetail): Utterance[] {
  if (record.items.length === 0) return []

  const flagged = attentionItems(record)

  if (flagged.length === 0) {
    return [
      plain(0, `Nothing flagged. Both readers agreed with your key on all ${count(record.items.length, 'question')}.`)
    ]
  }

  const breakdown = ORDER.flatMap((verdict) => {
    const n = flagged.filter((item) => item.verdict === verdict).length
    const noun = NOUN[verdict]
    if (n === 0 || !noun) return []
    return [`${n} ${n === 1 ? noun[0] : noun[1]}`]
  })

  const opening = `${count(flagged.length, 'question')} ${flagged.length === 1 ? 'needs' : 'need'} a look. ${list(breakdown)}.`
  const lines = [plain(0, opening)]

  const split = flagged.filter((item) => item.verdict === 'split_opinion').map((item) => item.position)
  if (split.length > 0) {
    const which = split.length === 1 ? `question ${split[0]}` : `questions ${list(split.map(String))}`
    lines.push(plain(1, `We disagree on ${which}.`))
  }

  return lines
}

/**
 * One item's exchange, played on demand from the evidence panel rather than automatically. This is
 * where the two seats actually speak to each other, and it is what the demo replays.
 */
export function itemUtterances(item: Item): Utterance[] {
  if (item.verdict === 'clear' || item.verdict === 'pending') return []

  const seated = seatedAttempts(item)
  const [first, second] = seated
  if (!first?.reading) return []

  const textOf = (letter: string) => item.options.find((option) => option.letter === letter)?.text ?? letter
  const opens = `Question ${item.position}.`
  const a = citeOf(first)
  const b = citeOf(second)

  // The second reader is absent by definition, so the second cat says nothing at all. The silence
  // is the meaning of Unverified, and motions.ts already has Hijiki hold still through it.
  if (item.verdict === 'unverified') {
    return [plain(0, `${opens} Only one reading came back verified.`, a)]
  }

  if (!second?.reading) return [plain(0, `${opens} I read ${textOf(first.reading.answer)}.`, a)]

  if (item.verdict === 'split_opinion') {
    return [
      plain(0, `${opens} I read ${textOf(first.reading.answer)}.`, a),
      {
        seat: 1,
        text: `I read ${textOf(second.reading.answer)}.`,
        caption: `I read ${textOf(second.reading.answer)}. No verdict. This one is yours.`,
        cite: b
      }
    ]
  }

  if (item.verdict === 'possible_ambiguity') {
    const [one, two] = first.reading.defensible
    const both = one && two ? `${textOf(one)} or ${textOf(two)}` : 'more than one option'
    return [plain(0, `${opens} ${both} both work for me.`, a), plain(1, 'Same here. Two defensible answers.', b)]
  }

  return [
    plain(0, `${opens} I read ${textOf(first.reading.answer)}.`, a),
    plain(1, `So did I. The key says ${textOf(item.key)}.`, b)
  ]
}
