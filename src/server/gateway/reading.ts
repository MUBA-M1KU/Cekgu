import type { Option, Reading } from '../../shared/types'
import type { Provenance } from './client'

// The solver prompt and the admission test from TRD section 14. Kept out of client.ts because both
// need the item and the client deliberately does not: it takes a model and a string.

export type SolverItem = { stem: string; options: Option[] }

// FR-QUEUE-2. It carries the stem, the lettered options and the record's subject and language, and
// never the supplied key or another model's output — a reader told the key would confirm it.
export function solverPrompt(item: SolverItem, subject: string, language: string): string {
  const options = item.options.map((option) => `${option.letter}. ${option.text}`).join('\n')

  return `You are reviewing one multiple-choice question before it is published.

Subject: ${subject}
Language: ${language}

Question:
${item.stem}

Options:
${options}

Answer with JSON and nothing else, in this exact shape:
{"answer": "<option letter>", "defensible": ["<option letters>"], "reason": "<two sentences>"}

"answer" is the single option you commit to. "defensible" lists every option a competent reader could
defend, including your answer. "reason" is at most two sentences explaining your choice.`
}

export type Admission = { admitted: true; reading: Reading } | { admitted: false; rejectionReason: string }

// The five conditions in TRD section 14, in order, rejecting with the first that fails.
export function admitReading(provenance: Provenance, options: Option[]): Admission {
  if (provenance.error) return { admitted: false, rejectionReason: provenance.error }
  if (provenance.receiptStatus !== 'verified') {
    return { admitted: false, rejectionReason: 'The receipt did not verify the serving model.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJson(provenance.content))
  } catch {
    return { admitted: false, rejectionReason: 'The model did not return the requested JSON.' }
  }

  // Never fall back to the requested model. Distinctness is proven by receipt (TRD section 14), and
  // a reading labelled with what we asked for rather than what served it would let two calls to one
  // model count as two readers, which makes cross-verification fiction.
  if (!provenance.servedModel) {
    return { admitted: false, rejectionReason: 'The receipt named no serving model.' }
  }

  const reading = asReading(parsed, provenance.servedModel)
  if (!reading) return { admitted: false, rejectionReason: 'The model did not return the requested JSON.' }

  const letters = new Set(options.map((option) => option.letter))
  if (!letters.has(reading.answer)) {
    return { admitted: false, rejectionReason: `The model answered ${reading.answer}, which is not an option.` }
  }

  // Refused rather than trimmed. Dropping a letter that is not an option turns a reader that hedged
  // onto two options into a reader that committed to one, and an item both readers hedged on then
  // reports Clear instead of Possible Ambiguity. Leniency must never remove a flag.
  const invented = reading.defensible.find((letter) => !letters.has(letter))
  if (invented) {
    return { admitted: false, rejectionReason: `The model called ${invented} defensible, which is not an option.` }
  }

  return { admitted: true, reading }
}

// Models wrap the JSON in prose or a fenced block often enough that refusing it would throw away
// good readings. The braces are the contract; the wrapping is not.
function extractJson(content: string): string {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  return start >= 0 && end > start ? content.slice(start, end + 1) : content
}

function asReading(value: unknown, model: string): Reading | null {
  if (typeof value !== 'object' || value === null) return null
  const candidate = value as Record<string, unknown>

  const answer = candidate.answer
  const reason = candidate.reason
  if (typeof answer !== 'string' || typeof reason !== 'string') return null

  const defensible = Array.isArray(candidate.defensible)
    ? candidate.defensible.filter((letter): letter is string => typeof letter === 'string')
    : [answer]

  return { model, answer, defensible: defensible.includes(answer) ? defensible : [answer, ...defensible], reason }
}
