import { Hono } from 'hono'
import type { Receipt, ReceiptLookup } from '../../shared/types'
import { env } from '../env'
import type { AppEnv } from '../session'

// Public by PUBLIC_PREFIXES in ./index.ts, for the same reason GET /api/sample is: the receipt page
// is what a judge is handed during Q&A and it has to open from a pasted link with no session.
//
// This proxies rather than letting the browser fetch the gateway directly. GonkaRouter serves
// receipts unauthenticated, but sends no access-control-allow-origin, so a fetch from our own
// origin is blocked before the response is readable.
export const receiptRoutes = new Hono<AppEnv>()

// The gateway's own id format. Matching it before the fetch keeps the path segment from being
// anything but an id, so this cannot be pointed at another endpoint on api.gonkarouter.io.
const REQUEST_ID = /^req-\d+-\d+$/

const LOOKUP_TIMEOUT_MS = 5_000

export function receiptUrl(requestId: string): string {
  return `${env.gonkaBaseUrlOpenai}/receipts/${requestId}`
}

receiptRoutes.get('/receipts/:requestId', async (c) => {
  const requestId = c.req.param('requestId')

  if (!REQUEST_ID.test(requestId)) {
    return c.json({ error: { code: 'invalid_request_id', message: 'That is not a Gonka request id.' } }, 400)
  }

  const sourceUrl = receiptUrl(requestId)

  let response: Response
  try {
    response = await fetch(sourceUrl, { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) })
  } catch {
    const body: ReceiptLookup = { requestId, status: 'unreachable', receipt: null, sourceUrl }
    return c.json(body)
  }

  if (response.status !== 200) {
    await response.body?.cancel()
    const body: ReceiptLookup = { requestId, status: 'missing', receipt: null, sourceUrl }
    return c.json(body)
  }

  const receipt = (await response.json()) as Receipt
  const body: ReceiptLookup = { requestId, status: 'found', receipt, sourceUrl }
  return c.json(body)
})
