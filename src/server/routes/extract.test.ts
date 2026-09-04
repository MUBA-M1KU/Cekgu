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
