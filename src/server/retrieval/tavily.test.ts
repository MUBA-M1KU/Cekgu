import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { evidenceQuery, retrievalUnavailable, searchEvidence } from './tavily'

// TAVILY_API_KEY is unset in the test environment, so the empty results below are the real code
// path rather than a simulated one — and that is also the assertion that a deployment without the
// key stays a working product with one enrichment missing.

describe('without a retrieval key', () => {
  test('retrieval reports itself unavailable', () => {
    expect(retrievalUnavailable()).toBe(true)
  })

  test('a search returns nothing rather than throwing', async () => {
    expect(await searchEvidence('anything at all')).toEqual([])
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
