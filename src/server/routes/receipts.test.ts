import { afterEach, expect, test } from 'bun:test'

// The environment comes from test-env.ts, preloaded by bunfig.toml, because env.ts snapshots
// process.env at first import and one test file cannot own that for the whole suite.

const { receiptRoutes } = await import('./receipts')

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function stub(handler: (url: string) => Response | Promise<Response>) {
  globalThis.fetch = ((input: RequestInfo | URL) => Promise.resolve(handler(String(input)))) as typeof fetch
}

const RECEIPT = {
  x_request_id: 'req-1788426383844621629-410375',
  x_devshard_id: '70340',
  model: 'MiniMaxAI/MiniMax-M2.7',
  created_at: '2026-09-03T09:06:51Z',
  outcome: 'success',
  status_code: 200,
  stream: false,
  total_tokens: 534,
  ttft_ms: 27328,
  duration_ms: 27328
}

test('it hands back the receipt the gateway returned', async () => {
  let asked = ''
  stub((url) => {
    asked = url
    return Response.json(RECEIPT)
  })

  const response = await receiptRoutes.request('/receipts/req-1788426383844621629-410375')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.status).toBe('found')
  expect(body.receipt.model).toBe('MiniMaxAI/MiniMax-M2.7')
  expect(asked).toBe('https://api.gonkarouter.io/v1/receipts/req-1788426383844621629-410375')
})

// The read-through must not carry our key. The endpoint is public, and sending the key would make
// this route hand the caller authority they did not have.
test('it calls the gateway without an authorization header', async () => {
  let headers: HeadersInit | undefined
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
    headers = init?.headers
    return Promise.resolve(Response.json(RECEIPT))
  }) as unknown as typeof fetch

  await receiptRoutes.request('/receipts/req-1788426383844621629-410375')

  expect(new Headers(headers).get('authorization')).toBeNull()
})

// A receipt that was never written and a gateway we could not reach are different facts, and the
// page tells a reader which one it is. Collapsing them would have an outage read as "we made this
// request id up", which is the one thing this screen exists to disprove.
test('a 404 from the gateway is not_found, and an outage is unreachable', async () => {
  stub(() => new Response('{}', { status: 404 }))
  expect(await (await receiptRoutes.request('/receipts/req-1-1')).json()).toMatchObject({ status: 'not_found' })

  stub(() => new Response('nope', { status: 502 }))
  expect(await (await receiptRoutes.request('/receipts/req-1-1')).json()).toMatchObject({ status: 'unreachable' })

  globalThis.fetch = (() => Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch
  expect(await (await receiptRoutes.request('/receipts/req-1-1')).json()).toMatchObject({ status: 'unreachable' })
})

// The id is matched before the call, so a pasted path cannot turn a read-through into an open
// proxy for arbitrary gateway routes.
test('anything that is not a request id is rejected without calling the gateway', async () => {
  let called = false
  stub(() => {
    called = true
    return Response.json(RECEIPT)
  })

  for (const bad of ['hello', 'req-abc-1', '..%2Fmodels', 'req-1']) {
    const body = await (await receiptRoutes.request(`/receipts/${encodeURIComponent(bad)}`)).json()
    expect(body.status).toBe('invalid')
  }

  expect(called).toBe(false)
})

// A gateway that answers 200 with something that is not a receipt is an outage, not a receipt.
test('a 200 that is not an object is unreachable rather than found', async () => {
  stub(() => new Response('<html>', { status: 200 }))

  const body = await (await receiptRoutes.request('/receipts/req-1-1')).json()

  expect(body.status).toBe('unreachable')
  expect(body.receipt).toBeNull()
})
