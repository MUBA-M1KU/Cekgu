import type { RecordDetail } from '../../shared/types'

// Two pools rather than two fixed lists. A person who opens the modal twice should not be shown the
// same four questions, and a follow-up that is always the same reads as a script rather than as a
// conversation. Four is the ceiling in both cases because a fifth chip pushes the composer down.

const OPENERS = [
  'Why is question {flagged} flagged?',
  'Which questions did the readers disagree on?',
  'What did each reader say about question {flagged}?',
  'Why is anything Unverified?',
  'Which questions need my attention first?',
  'Did the two readers ever choose different answers?',
  'What is wrong with the key on question {flagged}?',
  'Summarise what you found in this paper.',
  'Which questions came back Clear?',
  'Show me the readings behind question {flagged}.'
]

const FOLLOW_UPS = [
  'Which model read that one?',
  'What was the other reader’s reasoning?',
  'Show me the request id for that reading.',
  'Is any other question affected the same way?',
  'What should I do about it?',
  'Why did the rule fire that verdict?',
  'Were there any attempts that failed?',
  'What did the readers consider defensible?',
  'How confident should I be in that?',
  'Which question should I look at next?'
]

const MAX = 4

/** Fisher-Yates on a copy, then the first n. Not sort(() => Math.random() - 0.5), which is biased. */
function sample(pool: string[], n: number): string[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = copy[i]
    const b = copy[j]
    if (a !== undefined && b !== undefined) {
      copy[i] = b
      copy[j] = a
    }
  }
  return copy.slice(0, n)
}

/**
 * A flagged position to write into the templates, so a suggestion never names a question that came
 * back Clear or does not exist. Falls back to the first item, and to 1 on an empty record.
 */
function flaggedPosition(record: RecordDetail | null): number {
  const flagged = record?.items.find((item) => item.verdict !== 'clear' && item.verdict !== 'pending')
  return flagged?.position ?? record?.items[0]?.position ?? 1
}

function fill(template: string, record: RecordDetail | null): string {
  return template.replace('{flagged}', String(flaggedPosition(record)))
}

export function openingSuggestions(record: RecordDetail | null): string[] {
  return [...new Set(sample(OPENERS, MAX + 2).map((template) => fill(template, record)))].slice(0, MAX)
}

export function followUpSuggestions(): string[] {
  return sample(FOLLOW_UPS, MAX)
}
