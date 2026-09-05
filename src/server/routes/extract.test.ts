import { describe, expect, test } from 'bun:test'
import { extractRoutes } from './extract'

// Every path here is reachable without a key, a network or a database, which is deliberate: the
// route's job is to refuse a bad upload before it spends a gateway call, and that refusal is the
// half worth asserting. The two-step pipeline behind it is covered by ../extract/structure.test.ts
// and ../transcribe/gemini.test.ts.
//
// GEMINI_API_KEY is unset in the test environment, so the 503 below is the real code path rather
// than a simulated one — which is also the assertion that a deployment without the key stays a
// working product with one affordance missing.

const post = (body: BodyInit | null, headers?: HeadersInit) =>
  extractRoutes.request('/extract', { method: 'POST', body, headers })

function multipart(parts: { name: string; value: string | Blob; filename?: string }[]): FormData {
  const form = new FormData()
  for (const part of parts) {
    if (typeof part.value === 'string') form.append(part.name, part.value)
    else form.append(part.name, part.value, part.filename)
  }
  return form
}

describe('POST /api/extract without a transcription key', () => {
  test('answers 503 and names the reason', async () => {
    const response = await post(multipart([{ name: 'file', value: new Blob(['x']), filename: 'a.png' }]))
    expect(response.status).toBe(503)
    const body = (await response.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('uploads_disabled')
    expect(body.error.message).toContain('switched off')
  })

  // The 503 arrives before the body is even read, so an unreadable upload cannot be told apart
  // from a supported one on a deployment with uploads off. That is the right order: the deployment
  // fact is true regardless of what was sent.
  test('answers 503 for a body that is not multipart either', async () => {
    const response = await post('not a form', { 'content-type': 'application/json' })
    expect(response.status).toBe(503)
  })
})

const postUrl = (body: string) =>
  extractRoutes.request('/extract/url', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' }
  })

// The link route needs no transcription key for a web page, so unlike the upload route above these
// paths are the real ones on any deployment. Every case here is refused before a socket is opened,
// which is the half worth asserting: a fetcher that spends a request to find out a link was bad is
// the server-side request forgery primitive this route exists to not be.
describe('POST /api/extract/url', () => {
  test('a body that is not JSON is refused', async () => {
    const response = await postUrl('not json')
    expect(response.status).toBe(400)
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('bad_body')
  })

  test('a body with no url is refused', async () => {
    const response = await postUrl(JSON.stringify({}))
    expect(response.status).toBe(400)
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('no_url')
  })

  test('a blank url is refused', async () => {
    const response = await postUrl(JSON.stringify({ url: '   ' }))
    expect(response.status).toBe(400)
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('no_url')
  })

  test('a url that is not a string is refused', async () => {
    const response = await postUrl(JSON.stringify({ url: 42 }))
    expect(response.status).toBe(400)
  })

  test('an absurdly long url is refused before it is parsed', async () => {
    const response = await postUrl(JSON.stringify({ url: `https://example.com/${'a'.repeat(3000)}` }))
    expect(response.status).toBe(400)
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('url_too_long')
  })

  test('a link into a private network is refused', async () => {
    const response = await postUrl(JSON.stringify({ url: 'http://192.168.0.1/paper' }))
    expect(response.status).toBe(422)
    const body = (await response.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('unfetchable')
    expect(body.error.message).toContain('private network')
  })

  // The one that would matter on Cloud Run, where this address hands out service-account tokens.
  test('the cloud metadata address is refused', async () => {
    const response = await postUrl(JSON.stringify({ url: 'http://169.254.169.254/computeMetadata/v1/' }))
    expect(response.status).toBe(422)
  })

  test('a non-http scheme is refused', async () => {
    const response = await postUrl(JSON.stringify({ url: 'file:///etc/passwd' }))
    expect(response.status).toBe(422)
    expect(((await response.json()) as { error: { message: string } }).error.message).toContain('http and https')
  })
})

describe('the route never creates a record', () => {
  // FR-RECORD-1 belongs to POST /api/records and this route must not reach for it. Asserted on the
  // source because the alternative is a database, and the point is that this file needs none.
  test('the route module imports no record writer', async () => {
    const source = await Bun.file(new URL('extract.ts', import.meta.url)).text()
    for (const forbidden of ['createRecord', 'db/schema', "from '../db'", 'records.ts']) {
      expect(source).not.toContain(forbidden)
    }
  })

  test('the route holds the same gateway semaphore the queue holds', async () => {
    const source = await Bun.file(new URL('extract.ts', import.meta.url)).text()
    expect(source).toContain("from '../queue/semaphore'")
    expect(source).toContain('gatewaySemaphore.acquire()')
  })
})
