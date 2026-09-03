import type { ReceiptStatus } from '../../shared/types'
import { env } from '../env'

// The one code path that talks to GonkaRouter (NFR-SEC-1). Hand-rolled fetch rather than the OpenAI
// SDK, because the SDK returns the parsed body and throws away the headers that carry the request
// id, which is the track's on-chain proof (TRD section 4).

const MAX_TOKENS = 1024
const CALL_TIMEOUT_MS = 90_000
const RECEIPT_BUDGET_MS = 5_000
const RECEIPT_INTERVAL_MS = 250

export type Receipt = {
  x_request_id: string
  x_devshard_id: string
  model: string
  created_at: string
  outcome: string
  status_code: number
  stream: boolean
  total_tokens: number
  ttft_ms: number
  duration_ms: number
}

// TRD section 14's Provenance, plus httpStatus and receipt: the attempts table has columns for both
// and this is the only layer that sees them.
export type Provenance = {
  content: string
  requestId: string | null
  devshardId: string | null
  requestedModel: string
  servedModel: string | null
  fallbackHeader: string | null
  receiptStatus: ReceiptStatus
  receipt: Receipt | null
  httpStatus: number | null
  latencyMs: number
  error: string | null
}

// Gotcha 1 and 2: MiniMax emits raw <think> inside the content and Kimi leaks an orphaned closing
// tag. Comparing an answer against another model's internal monologue is the failure this prevents.
export function stripThinkTags(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\/?think>/gi, '')
    .trim()
}

// Gotcha 8: byte-identical bodies are served from the gateway cache, so two samples of one item
// would be one inference wearing two request ids.
function withNonce(prompt: string): string {
  return `${prompt}\n\n// nonce: ${crypto.randomUUID()}`
}

export async function callGonka(requestedModel: string, prompt: string, now = Date.now): Promise<Provenance> {
  const started = now()
  const blank: Provenance = {
    content: '',
    requestId: null,
    devshardId: null,
    requestedModel,
    servedModel: null,
    fallbackHeader: null,
    receiptStatus: 'missing',
    receipt: null,
    httpStatus: null,
    latencyMs: 0,
    error: null
  }

  let response: Response
  try {
    response = await fetch(`${env.gonkaBaseUrlOpenai}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.gonkaApiKey}`,
        'content-type': 'application/json',
        // NFR-PROV-1. Without it the gateway silently serves another model and says so only in a
        // header, so a two-model pair becomes one model twice.
        'X-Gonka-No-Fallback': 'true'
      },
      body: JSON.stringify({
        model: requestedModel,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: withNonce(prompt) }]
      }),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS)
    })
  } catch (cause) {
    const aborted = cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError')
    return {
      ...blank,
      latencyMs: now() - started,
      error: aborted ? `The call passed the ${CALL_TIMEOUT_MS / 1000} second evidence cutoff.` : String(cause)
    }
  }

  // Headers before the body, always. Reading the body first is how a wrapper loses them.
  const requestId = response.headers.get('x-request-id')
  const devshardId = response.headers.get('x-devshard-id')
  const fallbackHeader = response.headers.get('x-gonka-fallback')
  const httpStatus = response.status

  const raw = await response.text()
  const latencyMs = now() - started
  const base: Provenance = { ...blank, requestId, devshardId, fallbackHeader, httpStatus, latencyMs }

  if (httpStatus !== 200) {
    return { ...base, error: `The gateway answered ${httpStatus}. ${raw.slice(0, 200)}` }
  }

  // NFR-PROV-1. Rejected even though the body is a perfectly good completion.
  if (fallbackHeader) {
    return { ...base, error: `The gateway substituted a model: ${fallbackHeader}` }
  }

  let content = ''
  try {
    const body = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] }
    content = stripThinkTags(body.choices?.[0]?.message?.content ?? '')
  } catch {
    return { ...base, error: 'The gateway returned a body that is not JSON.' }
  }

  if (!requestId) {
    return { ...base, content, error: 'The response carried no x-request-id, so it cannot be verified.' }
  }

  // Guarded, because a rejected call must still return provenance. Letting a DNS blip on the
  // receipt endpoint throw out of here would lose an x-request-id the gateway already issued, and
  // with it the attempts row that NFR-PROV-3 and FR-EVIDENCE-2 need to say what happened.
  let receipt: Receipt | null = null
  try {
    receipt = await fetchReceipt(requestId)
  } catch (cause) {
    return { ...base, content, error: `The receipt for ${requestId} could not be read. ${String(cause)}` }
  }

  if (!receipt) {
    return { ...base, content, error: `No receipt appeared for ${requestId} within ${RECEIPT_BUDGET_MS / 1000}s.` }
  }

  // NFR-PROV-2 and the distinctness rule: the served model is what the receipt says, never what we asked for.
  const receiptStatus: ReceiptStatus = receipt.model === requestedModel ? 'verified' : 'mismatch'
  return {
    ...base,
    content,
    servedModel: receipt.model,
    receipt,
    receiptStatus,
    error:
      receiptStatus === 'mismatch' ? `The receipt names ${receipt.model}, but ${requestedModel} was requested.` : null
  }
}

// Gotcha 11: the receipt is written asynchronously and a single immediate fetch always 404s. One
// fetch here would make every item unverified and no verdict would ever render. Every measured
// call 404'd on the first try, so the wait comes before the first fetch rather than after it.
//
// Each request carries its own abort signal. Without one the budget bounds when an iteration
// starts, not how long it takes, and a single hung receipt request makes callGonka unbounded —
// which is the guarantee the queue sizes its 25 second hedge against.
async function fetchReceipt(requestId: string): Promise<Receipt | null> {
  const deadline = Date.now() + RECEIPT_BUDGET_MS

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, RECEIPT_INTERVAL_MS))

    const response = await fetch(`${env.gonkaBaseUrlOpenai}/receipts/${requestId}`, {
      headers: { authorization: `Bearer ${env.gonkaApiKey}` },
      signal: AbortSignal.timeout(Math.max(RECEIPT_INTERVAL_MS, deadline - Date.now()))
    })

    if (response.status === 200) return (await response.json()) as Receipt
    await response.body?.cancel()
  }

  return null
}
