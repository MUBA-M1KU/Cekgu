import type { ChatProvenance } from '../../shared/chat'
import type { RecordDetail } from '../../shared/types'
import { env } from '../env'
import { runTool } from './tools'

// THE SECOND CALL IN THIS PRODUCT THAT DOES NOT GO TO GONKAROUTER, and it is a more serious
// exemption than the first. src/server/transcribe/ turns pixels into the words already on the page
// and decides nothing; an answer about a record is closer to reasoning, and a strict reading of the
// track's first rule does not permit it. It is here because the team decided it on 4 September, on
// the record in docs/superpowers/specs/2026-09-04-talking-cats-and-record-agent-design.md.
//
// What keeps it honest rather than hidden, and what a reviewer should check still holds:
//
//   1. Every FACT stated here is retrieved by the pure tools in ./tools.ts from readings that two
//      Gonka models produced, each carrying an x-request-id and a public receipt. The model phrases
//      those facts. It is forbidden by the prompt below from adding one.
//   2. It never adjudicates. It may not say which option is correct, confirm a key or solve a
//      question. That is not a safety hedge, it is the product: PRODUCT.md defines Cekgu against
//      "a single general AI chat [that] offers one opaque opinion".
//   3. Its own id is labelled by provider and is never rendered as a Gonka request id, the same
//      rule TranscriptionProvenance follows in ../transcribe/gemini.ts.
//   4. CHAT_PROVIDER=gonka closes the exemption without a code change.

const HOST = 'https://generativelanguage.googleapis.com'
const TIMEOUT_MS = 30_000
const MAX_ROUNDS = 4

const SYSTEM = `You are Cekgu's record assistant.

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

type FunctionDeclaration = {
  name: string
  description: string
  parameters: { type: 'OBJECT'; properties: Record<string, unknown>; required?: string[] }
}

const POSITION = { position: { type: 'INTEGER', description: 'The question number, starting at 1.' } }

const DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'record_summary',
    description: 'Title, subject, status, how many questions there are and how many are flagged.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'list_items',
    description: 'Every question with its verdict and a truncated stem. Optionally filtered to one verdict.',
    parameters: {
      type: 'OBJECT',
      properties: {
        verdict: {
          type: 'STRING',
          description: 'One of clear, possible_key_error, possible_ambiguity, split_opinion, unverified, pending.'
        }
      }
    }
  },
  {
    name: 'get_item',
    description: 'One question in full: stem, options, the supplied key, the verdict and its reason.',
    parameters: { type: 'OBJECT', properties: POSITION, required: ['position'] }
  },
  {
    name: 'get_readings',
    description: 'What each seat read for one question, with the served model and its Gonka request id.',
    parameters: { type: 'OBJECT', properties: POSITION, required: ['position'] }
  },
  {
    name: 'get_attempts',
    description: 'Every attempt on one question including rejected ones. Use this to explain an Unverified verdict.',
    parameters: { type: 'OBJECT', properties: POSITION, required: ['position'] }
  }
]

type Part = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> } }
type Content = { role: string; parts: unknown[] }
type GenerateResponse = { candidates?: { content?: { parts?: Part[] } }[]; responseId?: string }

export type AgentAnswer =
  | { ok: true; text: string; provenance: ChatProvenance }
  | { ok: false; reason: string; provenance: ChatProvenance | null }

export function agentUnavailable(): boolean {
  return env.chat.provider === 'gemini' && env.gemini === null
}

async function generate(model: string, key: string, contents: Content[]): Promise<GenerateResponse | string> {
  let response: Response
  try {
    response = await fetch(`${HOST}/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        tools: [{ functionDeclarations: DECLARATIONS }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 900 }
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (cause) {
    const aborted = cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError')
    return aborted ? `The assistant did not answer within ${TIMEOUT_MS / 1000} seconds.` : String(cause)
  }

  if (!response.ok) return `The assistant is unavailable. The provider answered ${response.status}.`

  try {
    return (await response.json()) as GenerateResponse
  } catch {
    return 'The assistant returned a body that could not be read.'
  }
}

/**
 * One question, answered from the tools. The loop is bounded at MAX_ROUNDS because a model that
 * keeps calling tools is a model that is not answering, and a chat that hangs on stage is worse
 * than one that says it could not find out.
 */
export async function ask(
  record: RecordDetail,
  question: string,
  history: string[],
  onTool?: (name: string, args: Record<string, unknown>) => void
): Promise<AgentAnswer> {
  const config = env.gemini
  if (!config) return { ok: false, reason: 'The assistant is not configured on this deployment.', provenance: null }

  const model = env.chat.model
  const contents: Content[] = [
    ...history.map((text, index) => ({ role: index % 2 === 0 ? 'user' : 'model', parts: [{ text }] })),
    { role: 'user', parts: [{ text: question }] }
  ]

  let responseId: string | null = null

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const result = await generate(model, config.apiKey, contents)
    if (typeof result === 'string') {
      return { ok: false, reason: result, provenance: { provider: 'gemini', responseId, model } }
    }

    responseId = result.responseId ?? responseId
    const parts = result.candidates?.[0]?.content?.parts ?? []
    const calls = parts.filter((part): part is Part & { functionCall: { name: string } } => Boolean(part.functionCall))

    if (calls.length === 0) {
      const text = parts
        .map((part) => part.text ?? '')
        .join('')
        .trim()

      if (!text)
        return {
          ok: false,
          reason: 'The assistant returned nothing.',
          provenance: { provider: 'gemini', responseId, model }
        }
      return { ok: true, text, provenance: { provider: 'gemini', responseId, model } }
    }

    contents.push({ role: 'model', parts })
    contents.push({
      role: 'function',
      parts: calls.map((part) => {
        const args = part.functionCall.args ?? {}
        // Reported before the tool runs, not after, because the point of showing it is that the
        // reader sees the lookup happening rather than a spinner with nothing behind it.
        onTool?.(part.functionCall.name, args)
        return {
          functionResponse: {
            name: part.functionCall.name,
            response: runTool(record, part.functionCall.name, args)
          }
        }
      })
    })
  }

  return {
    ok: false,
    reason: 'The assistant kept looking things up without answering. Try a narrower question.',
    provenance: { provider: 'gemini', responseId, model }
  }
}
