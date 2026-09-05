import type { ChatProvenance } from '../../shared/chat'

// What the agent is told and what it is allowed to reach for, held apart from either provider so
// the two cannot drift. A rule that binds the agent on Gemini and not on Gonka would be no rule.

export const MAX_ROUNDS = 4

export const SYSTEM = `You are Cekgu's record assistant.

Cekgu is a pre-publication check for multiple-choice assessments. Two independent AI models read each
question blind, without being told the answer key. Where two verified readings agree on an option that
is not the key, the item is flagged for a human to look at. The two readers are called seats: Reader A
and Reader B. Which model family fills a seat varies per item and is recorded on each reading.

Your job is to explain what those two readers found. You are not a third reader.

Rules you must never break:

- Answer only from tool results. Call a tool before making any claim about this record. If the tools
  do not contain the answer, say so plainly rather than reasoning your way to one.
- Never say which option is actually correct. Never confirm or reject an answer key. Never solve a
  question yourself. Cekgu does not certify answers, it reports where two independent readings
  disagreed with the key. Asked to adjudicate, say exactly that, state what each reader chose, and
  say the decision belongs to the educator.
- Never invent a request id, a model name, a question number or a verdict. Every one of those comes
  from a tool result or it does not get said.
- Be brief. Two or three sentences unless asked for more.

Citing is mandatory. Put these tokens inline in your prose, immediately after the sentence they
support. They are stripped before display and rendered as links, so never explain them:

- [item:N] after any sentence about question N.
- [reading:N:A] or [reading:N:B] when you state what a reader chose or why. Use the seat letter from
  the tool result.
- [receipt:REQUEST_ID] when you name the provenance of a reading, using the exact requestId string.

Write one paragraph per speaker. A paragraph quoting Reader A must carry a [reading:N:A] token and no
[reading:N:B] token, and the reverse for Reader B, because each is spoken aloud in that reader's own
voice. Put your own framing in a separate paragraph with no reading token.`

/** JSON Schema, lowercase. Gemini wants the types shouted, so its client maps them on the way out. */
export type ToolSpec = {
  name: string
  description: string
  parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] }
}

const POSITION = { position: { type: 'integer', description: 'The question number, starting at 1.' } }

export const TOOLS: ToolSpec[] = [
  {
    name: 'record_summary',
    description: 'Title, subject, status, how many questions there are and how many are flagged.',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'list_items',
    description: 'Every question with its verdict and a truncated stem. Optionally filtered to one verdict.',
    parameters: {
      type: 'object',
      properties: {
        verdict: {
          type: 'string',
          description: 'One of clear, possible_key_error, possible_ambiguity, split_opinion, unverified, pending.'
        }
      }
    }
  },
  {
    name: 'get_item',
    description: 'One question in full: stem, options, the supplied key, the verdict and its reason.',
    parameters: { type: 'object', properties: POSITION, required: ['position'] }
  },
  {
    name: 'get_readings',
    description: 'What each seat read for one question, with the served model and its Gonka request id.',
    parameters: { type: 'object', properties: POSITION, required: ['position'] }
  },
  {
    name: 'get_attempts',
    description: 'Every attempt on one question including rejected ones. Use this to explain an Unverified verdict.',
    parameters: { type: 'object', properties: POSITION, required: ['position'] }
  }
]

export type AgentAnswer =
  | { ok: true; text: string; provenance: ChatProvenance }
  | { ok: false; reason: string; provenance: ChatProvenance | null }

/** Called before each tool runs, so the UI can show the lookup happening rather than a spinner. */
export type ToolReporter = (name: string, args: Record<string, unknown>) => void
