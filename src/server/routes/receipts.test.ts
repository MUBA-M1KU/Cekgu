import { afterEach, expect, test } from 'bun:test'

// The environment comes from test-env.ts, preloaded by bunfig.toml, because env.ts snapshots
// process.env at first import and one test file cannot own that for the whole suite.

const { receiptRoutes } = await import('./receipts')

const RECEIPT = {
  x_request_id: 'req-1788426475140384999-410759',
  x_devshard_id: '70335',
  model: 'moonshotai/Kimi-K2.6',
  created_at: '2026-09-03T09:08:09Z',
  outcome: 'success',
  status_code: 200,
  stream: false,
  total_tokens: 768,
  ttft_ms: 14640,
  duration_ms: 14640
}

const realFetch = globalThis.fetch

// The route's only dependency is fetch, so the gateway's four answers are stubbed rather than
// called. Nothing in this file spends a GonkaRouter request.
function stubFetch(impl: (url: string) => Promise<Response>): void {
  globalThis.fetch = impl as unknown as typeof fetch
}

afterEach(() => {
  globalThis.fetch = realFetch
})

test('a path segment that is not a request id never reaches the gateway', async () => {
  const asked: string[] = []
  stubFetch((url) => {
    asked.push(url)
    return Promise.resolve(new Response('{}'))
  })

  const response = await receiptRoutes.request('/receipts/..%2Fmodels')
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body.error.code).toBe('invalid_request_id')
  expect(asked).toEqual([])
})

test('a receipt the gateway has is returned with the url it came from', async () => {
  const asked: string[] = []
  stubFetch((url) => {
    asked.push(url)
    return Promise.resolve(Response.json(RECEIPT))
  })

  const response = await receiptRoutes.request('/receipts/req-1788426475140384999-410759')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(asked[0]).toBe('https://api.gonkarouter.io/v1/receipts/req-1788426475140384999-410759')
  expect(body.status).toBe('found')
  expect(body.receipt.model).toBe('moonshotai/Kimi-K2.6')
  expect(body.sourceUrl).toBe('https://api.gonkarouter.io/v1/receipts/req-1788426475140384999-410759')
})

// Gotcha 11: the gateway writes a receipt after the call it belongs to finishes, so a 404 is an
// ordinary answer for a request id that is only seconds old. The page says so in a sentence.
test('a receipt that has not been written yet is missing, not an error', async () => {
  stubFetch(() => Promise.resolve(new Response('not found', { status: 404 })))

  const response = await receiptRoutes.request('/receipts/req-1788426475140384999-410759')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.status).toBe('missing')
  expect(body.receipt).toBeNull()
})

test('a gateway we cannot reach leaves the page a link rather than a stack trace', async () => {
  stubFetch(() => Promise.reject(new Error('timed out')))

  const response = await receiptRoutes.request('/receipts/req-1788426475140384999-410759')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.status).toBe('unreachable')
  expect(body.sourceUrl).toBe('https://api.gonkarouter.io/v1/receipts/req-1788426475140384999-410759')
})
