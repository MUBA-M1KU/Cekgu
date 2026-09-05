import type { RecordDetail } from '../../shared/types'
import { env } from '../env'
import { stripThinkTags, withNonce } from '../gateway/client'
import { type AgentAnswer, MAX_ROUNDS, SYSTEM, TOOLS, type ToolReporter } from './prompt'
import { runTool } from './tools'

// The compliant path, and the one CHAT_PROVIDER=gonka selects: the assistant's own inference runs on
// GonkaRouter like every other reasoning step in the product, and its turn carries a real
// x-request-id with a public receipt instead of a provider response id.
//
// It is slower. Issue #200 measured MiniMax at 33.7 s for one call and this loop makes up to four,
// which is why it is not the default. It is also the only path that survives the Gemini key being
// rate limited, so it is not a hypothetical.
//
// MiniMax is requested because it is the family the gateway flags for agents and stable long-chain
// tool calling (TRD section 3). No fallback header is sent for the same reason the reading path
// sends it: a substituted model is a different reader wearing the requested one's name.

const TIMEOUT_MS = 90_000

type ToolCall = { id?: string; function?: { name?: string; arguments?: string } }
type Message = { role: string; content?: string | null; tool_calls?: ToolCall[]; tool_call_id?: string; name?: string }
type Completion = { choices?: { message?: Message }[] }

const FUNCTIONS = TOOLS.map((tool) => ({
  type: 'function' as const,
  function: { name: tool.name, description: tool.description, parameters: tool.parameters }
}))

function readArguments(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    // A model that emits unparseable arguments gets an empty object, and runTool answers with a
    // readable error it can act on. Throwing here would lose the turn instead.
    return {}
  }
}

type Round = { completion: Completion; requestId: string | null; servedModel: string | null } | string

async function complete(model: string, messages: Message[]): Promise<Round> {
  let response: Response
  try {
    response = await fetch(`${env.gonkaBaseUrlOpenai}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.gonkaApiKey}`,
        'content-type': 'application/json',
        'X-Gonka-No-Fallback': 'true'
      },
      body: JSON.stringify({ model, max_tokens: 1024, messages, tools: FUNCTIONS }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (cause) {
    const aborted = cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError')
    return aborted ? `The assistant did not answer within ${TIMEOUT_MS / 1000} seconds.` : String(cause)
  }

  // Headers before the body, always. Reading the body first is how a wrapper loses them.
  const requestId = response.headers.get('x-request-id')
  const fallback = response.headers.get('x-gonka-fallback')
  if (fallback) return `The gateway substituted a model: ${fallback}`
  if (!response.ok) return `The assistant is unavailable. The gateway answered ${response.status}.`

  try {
    const completion = (await response.json()) as Completion & { model?: string }
    return { completion, requestId, servedModel: completion.model ?? null }
  } catch {
    return 'The gateway returned a body that could not be read.'
  }
}

export async function askGonka(
  record: RecordDetail,
  question: string,
  history: string[],
  onTool?: ToolReporter
): Promise<AgentAnswer> {
  const model = env.chat.model
  const messages: Message[] = [
    // Gotcha 8 reaches this path too: an identical question about an identical record is a
    // byte-identical body, and the gateway serves it from cache. On the system line rather than
    // the question, so the model still reads what the visitor typed.
    { role: 'system', content: withNonce(SYSTEM) },
    ...history.map((text, index) => ({ role: index % 2 === 0 ? 'user' : 'assistant', content: text })),
    { role: 'user', content: question }
  ]

  let requestId: string | null = null
  let servedModel: string | null = null

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const result = await complete(model, messages)
    if (typeof result === 'string') {
      return { ok: false, reason: result, provenance: { provider: 'gonka', responseId: requestId, model: servedModel } }
    }

    requestId = result.requestId ?? requestId
    servedModel = result.servedModel ?? servedModel

    const reply = result.completion.choices?.[0]?.message
    const calls = reply?.tool_calls ?? []
    const provenance = { provider: 'gonka' as const, responseId: requestId, model: servedModel }

    if (calls.length === 0) {
      // Gotcha 1 and 2: MiniMax emits raw <think> inside the content and Kimi leaks a closing tag.
      const text = stripThinkTags(reply?.content ?? '')
      if (!text) return { ok: false, reason: 'The assistant returned nothing.', provenance }
      return { ok: true, text, provenance }
    }

    messages.push({ role: 'assistant', content: reply?.content ?? '', tool_calls: calls })

    for (const call of calls) {
      const name = call.function?.name ?? ''
      const args = readArguments(call.function?.arguments)
      onTool?.(name, args)
      messages.push({
        role: 'tool',
        tool_call_id: call.id ?? name,
        name,
        content: JSON.stringify(runTool(record, name, args))
      })
    }
  }

  return {
    ok: false,
    reason: 'The assistant kept looking things up without answering. Try a narrower question.',
    provenance: { provider: 'gonka', responseId: requestId, model: servedModel }
  }
}
