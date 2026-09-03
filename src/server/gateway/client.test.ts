import { afterEach, describe, expect, test } from 'bun:test'
import { callGonka, type Provenance, stripThinkTags } from './client'

const MODEL = 'moonshotai/Kimi-K2.6'
const OTHER = 'MiniMaxAI/MiniMax-M2.7'
const REQUEST_ID = 'req-1788416980465962869-369929'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

function completion(content: string) {
  return JSON.stringify({ choices: [{ message: { content } }] })
}

function receiptFor(model: string) {
  return {
    x_request_id: REQUEST_ID,
    x_devshard_id: '70158',
    model,
    created_at: '2026-09-03T06:29:40Z',
    outcome: 'success',
    status_code: 200,
    stream: false,
    total_tokens: 19,
    ttft_ms: 4,
    duration_ms: 4
  }
}

type Stub = {
  status?: number
  body?: string
  headers?: Record<string, string>
  receipt?: { model: string } | null
  receiptMissesFirst?: number
  throws?: Error
}

const bodies: string[] = []

function stubGateway(stub: Stub) {
  let receiptCalls = 0
  bodies.length = 0

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url)

    if (href.includes('/receipts/')) {
      receiptCalls += 1
      if (stub.receipt === null || receiptCalls <= (stub.receiptMissesFirst ?? 0)) {
        return new Response('not found', { status: 404 })
      }
      return new Response(JSON.stringify(receiptFor(stub.receipt?.model ?? MODEL)), { status: 200 })
    }

    if (stub.throws) throw stub.throws
    bodies.push(String(init?.body))
    return new Response(stub.body ?? completion('{"answer":"B","defensible":["B"],"reason":"Because."}'), {
      status: stub.status ?? 200,
      headers: { 'x-request-id': REQUEST_ID, 'x-devshard-id': '70158', ...stub.headers }
    })
  }) as typeof fetch

  return { receiptCalls: () => receiptCalls }
}

describe('stripThinkTags', () => {
  test('removes a full reasoning block', () => {
    expect(stripThinkTags('<think>weighing options</think>{"answer":"A"}')).toBe('{"answer":"A"}')
  })

  test('removes an orphaned closing tag, which is what Kimi leaks', () => {
    expect(stripThinkTags(' p </think> pong')).toBe('p  pong')
  })

  test('leaves clean content alone', () => {
    expect(stripThinkTags('{"answer":"A"}')).toBe('{"answer":"A"}')
  })
})

describe('callGonka', () => {
  test('a clean 200 verifies against its receipt', async () => {
    stubGateway({ receipt: { model: MODEL } })
    const result = await callGonka(MODEL, 'Which one is first in, first out?')

    expect(result.httpStatus).toBe(200)
    expect(result.requestId).toBe(REQUEST_ID)
    expect(result.devshardId).toBe('70158')
    expect(result.receiptStatus).toBe('verified')
    expect(result.servedModel).toBe(MODEL)
    expect(result.error).toBeNull()
  })

  test('every call sends X-Gonka-No-Fallback', async () => {
    let sent: Headers | undefined
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (String(url).includes('/receipts/')) {
        return new Response(JSON.stringify(receiptFor(MODEL)), { status: 200 })
      }
      sent = new Headers(init?.headers)
      return new Response(completion('{"answer":"A","defensible":["A"],"reason":"x"}'), {
        status: 200,
        headers: { 'x-request-id': REQUEST_ID }
      })
    }) as typeof fetch

    await callGonka(MODEL, 'prompt')
    expect(sent?.get('x-gonka-no-fallback')).toBe('true')
  })

  test('a fallback header is rejected even though the body is a good completion', async () => {
    stubGateway({ headers: { 'x-gonka-fallback': `${MODEL} -> ${OTHER}` }, receipt: { model: OTHER } })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.error).toContain('substituted a model')
    expect(result.error).toContain(OTHER)
    expect(result.receiptStatus).not.toBe('verified')
    expect(result.requestId).toBe(REQUEST_ID)
  })

  test('a receipt naming another model is a mismatch, not a pass', async () => {
    stubGateway({ receipt: { model: OTHER } })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.receiptStatus).toBe('mismatch')
    expect(result.servedModel).toBe(OTHER)
    expect(result.error).toContain(`The receipt names ${OTHER}`)
  })

  test('a 429 is recorded with its body and never verified', async () => {
    stubGateway({
      status: 429,
      body: '{"error":{"message":"rate limit exceeded: too many concurrent requests"}}',
      receipt: { model: MODEL }
    })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.httpStatus).toBe(429)
    expect(result.error).toContain('429')
    expect(result.error).toContain('rate limit exceeded')
    expect(result.receiptStatus).toBe('missing')
  })

  test('a timeout leaves no request id and says so', async () => {
    const timeout = new Error('timed out')
    timeout.name = 'TimeoutError'
    stubGateway({ throws: timeout, receipt: { model: MODEL } })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.requestId).toBeNull()
    expect(result.httpStatus).toBeNull()
    expect(result.error).toBe('The call passed the 90 second evidence cutoff.')
  })

  // Gotcha 11, measured 2026-09-03: the receipt 404s immediately and appears about a second later.
  // A client that fetched once would mark every call unverified and no verdict would ever render.
  test('it polls past the receipt 404s the gateway returns first', async () => {
    const stub = stubGateway({ receiptMissesFirst: 3, receipt: { model: MODEL } })
    const result = await callGonka(MODEL, 'prompt')

    expect(stub.receiptCalls()).toBe(4)
    expect(result.receiptStatus).toBe('verified')
  })

  test('a receipt that never appears is not verified', async () => {
    stubGateway({ receipt: null })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.receiptStatus).toBe('missing')
    expect(result.error).toContain('No receipt appeared')
  }, 15_000)

  test('each call carries max_tokens 1024 and its own nonce', async () => {
    stubGateway({ receipt: { model: MODEL } })
    await callGonka(MODEL, 'prompt')
    await callGonka(MODEL, 'prompt')

    const [first, second] = bodies.map((body) => JSON.parse(body))
    expect(first.max_tokens).toBe(1024)
    expect(first.messages[0].content).toContain('// nonce: ')
    expect(first.messages[0].content).not.toBe(second.messages[0].content)
  })

  test('reasoning tags are stripped from the content it returns', async () => {
    stubGateway({ body: completion('<think>hmm</think>{"answer":"B"}'), receipt: { model: MODEL } })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.content).toBe('{"answer":"B"}')
  })

  test('a body that is not JSON is refused', async () => {
    stubGateway({ body: 'upstream returned html', receipt: { model: MODEL } })
    const result = await callGonka(MODEL, 'prompt')

    expect(result.error).toBe('The gateway returned a body that is not JSON.')
  })

  test('a 200 with no request id cannot be verified', async () => {
    globalThis.fetch = (async (_url: string | URL | Request) =>
      new Response(completion('{"answer":"A","defensible":["A"],"reason":"x"}'), { status: 200 })) as typeof fetch
    const result = await callGonka(MODEL, 'prompt')

    expect(result.requestId).toBeNull()
    expect(result.error).toContain('no x-request-id')
  })
})

test('latency is measured across the call', async () => {
  stubGateway({ receipt: { model: MODEL } })
  let clock = 1000
  const result: Provenance = await callGonka(MODEL, 'prompt', () => {
    clock += 1400
    return clock
  })

  expect(result.latencyMs).toBe(1400)
})
