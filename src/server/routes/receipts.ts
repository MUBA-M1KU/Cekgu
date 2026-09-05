import { Hono } from 'hono'
import type { ReceiptLookup } from '../../shared/types'
import { env } from '../env'
import type { AppEnv } from '../session'

export const receiptRoutes = new Hono<AppEnv>()

// The gateway's own format: req-<nanoseconds>-<counter>. Matched before the call so a pasted URL
// cannot turn this route into an open proxy for arbitrary gateway paths.
const REQUEST_ID = /^req-\d{1,25}-\d{1,12}$/

const TIMEOUT_MS = 8000

/**
 * A read-through to `GET /v1/receipts/{id}` on the gateway.
 *
 * The receipt is public and needs no key, so this adds no authority the caller did not have. It
 * exists because the gateway sends no `Access-Control-Allow-Origin`, which means a browser on our
 * origin cannot read the response even though anyone can curl it. Without this route the receipt
 * viewer could only ever show a link, never the receipt.
 *
 * Public by PUBLIC_PATHS in ./index.ts, because the Sample Report is reachable signed out and its
 * request ids are the whole point of it (FR-SAMPLE-4).
 *
 * This is metadata, not inference. No model is called here and no prompt is sent.
 */
receiptRoutes.get('/receipts/:requestId', async (c) => {
  const requestId = c.req.param('requestId')

  if (!REQUEST_ID.test(requestId)) {
    return c.json<ReceiptLookup>({ requestId, status: 'invalid', receipt: null })
  }

  let response: Response
  try {
    response = await fetch(`${env.gonkaBaseUrlOpenai}/receipts/${requestId}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch {
    // The gateway being unreachable is not the same fact as the receipt not existing, and the
    // page says so rather than reporting an outage as an absent receipt.
    return c.json<ReceiptLookup>({ requestId, status: 'unreachable', receipt: null })
  }

  if (response.status === 404) {
    await response.body?.cancel()
    return c.json<ReceiptLookup>({ requestId, status: 'not_found', receipt: null })
  }

  if (!response.ok) {
    await response.body?.cancel()
    return c.json<ReceiptLookup>({ requestId, status: 'unreachable', receipt: null })
  }

  const receipt = await response.json().catch(() => null)
  if (receipt === null || typeof receipt !== 'object') {
    return c.json<ReceiptLookup>({ requestId, status: 'unreachable', receipt: null })
  }

  return c.json<ReceiptLookup>({ requestId, status: 'found', receipt: receipt as ReceiptLookup['receipt'] })
})
