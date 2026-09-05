import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { ACCEPTED_TYPES, MAX_BYTES, transcribe } from './gemini'

// The guards, which are the half of this module that can be tested without a key or a network. The
// call itself is covered by the boundary assertions in ../gateway/only-gonkarouter.test.ts and by
// driving the route against a real upload.

describe('what the transcriber refuses before it spends a call', () => {
  test('an unsupported type is refused rather than sent', async () => {
    const result = await transcribe(new Uint8Array([1, 2, 3]), 'image/gif')
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toContain('not supported')
  })

  test('a file over the cap is refused rather than sent', async () => {
    const result = await transcribe(new Uint8Array(MAX_BYTES + 1), 'image/png')
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toContain('10 MB')
  })

  test('PDF takes the same path as an image, so there is no PDF library to install', () => {
    expect(ACCEPTED_TYPES).toContain('application/pdf')
    expect(ACCEPTED_TYPES).toContain('image/png')
  })
})

describe('the prompt forbids the transcriber from deciding anything', () => {
  // The boundary is only real if the prompt holds it. A transcriber that answered a question, or
  // supplied a key the paper does not print, would be doing the reasoning the track binds to Gonka
  // — and it would do it without a request id, which is worse than doing it slowly.
  const source = readFileSync(new URL('gemini.ts', import.meta.url), 'utf8')

  test.each([
    ['never answer a question', 'Never answer a question'],
    ['never mark an option correct', 'never mark an option correct'],
    ['never supply an absent key', 'never supply a key that is not printed'],
    ['never correct the paper', 'Never correct spelling, grammar, or a factual error'],
    ['flag rather than guess', '[unreadable]']
  ])('the prompt says: %s', (_label, phrase) => {
    expect(source).toContain(phrase)
  })
})
