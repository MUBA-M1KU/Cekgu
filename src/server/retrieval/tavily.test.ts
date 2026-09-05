import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { evidenceQuery, retrievalUnavailable, searchEvidence } from './tavily'

// #290. These used to assume TAVILY_API_KEY was absent from the environment. Bun loads .env
// automatically, so on any machine that had a key the assumption was false, the assertion made a
// real network call, and the suite failed on whatever Tavily returned that day. The key is injected
// now, so every case below is hermetic and none of them opens a socket.

const never = (() => {
  throw new Error('the network must not be reached')
}) as unknown as typeof globalThis.fetch

const replies = (body: unknown, init: ResponseInit = {}) =>
  (async () => new Response(JSON.stringify(body), { status: 200, ...init })) as unknown as typeof globalThis.fetch

describe('without a retrieval key', () => {
  test('a search returns nothing, and does not reach the network to find that out', async () => {
    expect(await searchEvidence('anything at all', { apiKey: null, fetch: never })).toEqual([])
  })

  test('an empty key counts as no key', async () => {
    expect(await searchEvidence('anything at all', { apiKey: '', fetch: never })).toEqual([])
  })

  // The deployment fact this stands for: absent the key, the product still works with one
  // enrichment missing. retrievalUnavailable() reads the environment, so it is asserted against the
  // environment rather than pinned to a value that depends on whose laptop this is.
  test('retrievalUnavailable agrees with whether a key is configured', () => {
    expect(retrievalUnavailable()).toBe(!process.env.TAVILY_API_KEY)
  })
})

describe('reading a reply', () => {
  const ok = { results: [{ title: 'A page', url: 'https://example.com/a', content: '  the snippet  ' }] }

  test('title, url and trimmed snippet come through', async () => {
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(ok) })).toEqual([
      { title: 'A page', url: 'https://example.com/a', snippet: 'the snippet' }
    ])
  })

  test('a non-200 yields nothing rather than throwing', async () => {
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(ok, { status: 500 }) })).toEqual([])
  })

  test('a body that is not the expected shape yields nothing', async () => {
    for (const body of [null, {}, { results: 'nope' }, { results: [null, 7] }]) {
      expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })).toEqual([])
    }
  })

  test('a throwing fetch yields nothing, so retrieval never fails a round', async () => {
    const boom = (async () => {
      throw new Error('network down')
    }) as unknown as typeof globalThis.fetch
    expect(await searchEvidence('q', { apiKey: 'k', fetch: boom })).toEqual([])
  })

  test('a result with no snippet is dropped', async () => {
    const body = { results: [{ title: 'T', url: 'https://example.com/', content: '   ' }] }
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })).toEqual([])
  })

  test('a non-http url is dropped, because it reaches an href and window.open', async () => {
    const body = { results: [{ title: 'T', url: 'javascript:alert(1)', content: 'text enough' }] }
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })).toEqual([])
  })

  test('the same page returned twice is kept once', async () => {
    const body = {
      results: [
        { title: 'T', url: 'https://example.com/a', content: 'first' },
        { title: 'T again', url: 'https://example.com/a', content: 'second' }
      ]
    }
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })).toHaveLength(1)
  })

  test('a missing title falls back to the url rather than rendering blank', async () => {
    const body = { results: [{ url: 'https://example.com/a', content: 'text enough' }] }
    const [source] = await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })
    expect(source?.title).toBe('https://example.com/a')
  })

  test('at most four results are kept', async () => {
    const body = {
      results: Array.from({ length: 9 }, (_, i) => ({
        title: `T${i}`,
        url: `https://example.com/${i}`,
        content: 'x y z'
      }))
    }
    expect(await searchEvidence('q', { apiKey: 'k', fetch: replies(body) })).toHaveLength(4)
  })

  test('the request never asks for a generated answer', async () => {
    let sent: unknown
    const capture = (async (_url: unknown, init?: { body?: unknown }) => {
      sent = JSON.parse(String(init?.body))
      return new Response(JSON.stringify(ok))
    }) as unknown as typeof globalThis.fetch
    await searchEvidence('q', { apiKey: 'k', fetch: capture })
    expect(sent).toMatchObject({ include_answer: false, include_raw_content: false })
  })
})

describe('the query built for an item', () => {
  const options = [
    { letter: 'A', text: 'Stack' },
    { letter: 'B', text: 'Queue' }
  ]

  test('carries the subject, the stem and the options', () => {
    const query = evidenceQuery('Which structure is first in, first out?', options, 'Computer Science')
    expect(query).toContain('Computer Science')
    expect(query).toContain('first in, first out')
    expect(query).toContain('Stack')
    expect(query).toContain('Queue')
  })

  test('collapses whitespace so a pasted stem does not become a ragged query', () => {
    expect(evidenceQuery('What  is\n\n  2 + 2?', [], 'Maths')).toBe('Maths: What is 2 + 2?')
  })

  // The supplied key is not a parameter here, and that is the point: a search containing the key
  // returns pages that agree with the key, and the reader would be shown evidence selected to
  // confirm the very thing under test.
  test('takes no key, so it cannot leak one into the search', () => {
    expect(evidenceQuery.length).toBe(3)
  })
})

// The track's fatal rule is that reasoning runs on GonkaRouter. Tavily will return an LLM-written
// answer to the query if asked, and taking it would be reasoning on a provider that is not the
// gateway. Asserted on the source because the alternative is trusting that nobody flips it back.
describe('retrieval never asks anyone else to reason', () => {
  const source = readFileSync(new URL('./tavily.ts', import.meta.url), 'utf8')

  test('the request disables the generated answer', () => {
    expect(source).toContain('include_answer: false')
    expect(source).not.toContain('include_answer: true')
  })

  test('no generated answer is ever read off the response', () => {
    // asSources reads results[].url, results[].content and results[].title, and nothing else.
    expect(source).not.toMatch(/\.\s*answer\b/)
    expect(source).not.toContain("'answer'")
  })

  test('raw page content is not requested either, so a prompt cannot be filled with a scrape', () => {
    expect(source).toContain('include_raw_content: false')
  })
})
