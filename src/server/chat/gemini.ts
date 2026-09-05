import type { RecordDetail } from '../../shared/types'
import { env } from '../env'
import { type AgentAnswer, MAX_ROUNDS, SYSTEM, TOOLS, type ToolReporter } from './prompt'
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

// Gemini wants the JSON Schema types shouted, so the neutral specs in prompt.ts are mapped here
// rather than being duplicated in a shape only this provider accepts.
function shout(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shout)
  if (typeof value !== 'object' || value === null) return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, inner]) => [
      key,
      key === 'type' && typeof inner === 'string' ? inner.toUpperCase() : shout(inner)
    ])
  )
}

const DECLARATIONS = TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  parameters: shout(tool.parameters)
}))

type Part = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> } }
type Content = { role: string; parts: unknown[] }
type GenerateResponse = { candidates?: { content?: { parts?: Part[] } }[]; responseId?: string }

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
export async function askGemini(
  record: RecordDetail,
  question: string,
  history: string[],
  onTool?: ToolReporter
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
