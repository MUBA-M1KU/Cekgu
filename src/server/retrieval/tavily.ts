import { env } from '../env'

// Live retrieval for the cross-verification step. This module fetches text other people published
// and returns it verbatim. It runs no model, forms no opinion and reaches no conclusion — the two
// Gonka readers do all of that, over the snippets this hands them.
//
// THE LINE THAT KEEPS THIS COMPLIANT IS `include_answer: false`. Tavily will happily return an
// LLM-written answer to the query, and taking it would put reasoning on a provider that is not the
// gateway, which is the track's one fatal rule. We ask for search results and nothing else, and
// only-gonkarouter.test.ts asserts that flag is still false.

const ENDPOINT = 'https://api.tavily.com/search'
const TIMEOUT_MS = 8_000
const MAX_RESULTS = 4
// A snippet is context, not a document. Four of these have to sit inside a solver prompt beside the
// question without crowding it out, and a reader that has to wade through a page of scraped text
// answers the page rather than the question.
const MAX_SNIPPET_CHARS = 500

export type Source = { title: string; url: string; snippet: string }

export function retrievalUnavailable(): boolean {
  return env.tavily === null
}

/**
 * Injected so the tests are hermetic.
 *
 * They used to assert the no-key path by assuming `TAVILY_API_KEY` was absent from the environment,
 * which Bun's automatic `.env` loading made false on any machine that had one — and the assertion
 * then made a real network call and failed on what Tavily happened to return (#290). `env` is read
 * at module load, so no `beforeEach` can undo it; the seam has to be a parameter. It is the same
 * shape runRound and structurePaper already use for the gateway.
 */
export type RetrievalDeps = { apiKey?: string | null; fetch?: typeof globalThis.fetch }

/**
 * Public text relevant to one question, or an empty list.
 *
 * Never throws and never blocks a reading. Retrieval is an enrichment: a round that could not reach
 * the web still produces a verdict from two Gonka readings, exactly as it did before this existed.
 * Returning `[]` and carrying on is the whole failure policy.
 */
export async function searchEvidence(query: string, deps: RetrievalDeps = {}): Promise<Source[]> {
  // `undefined` means "ask the environment"; an explicit null means "there is no key", which is what
  // a test asserting the no-key path passes.
  const apiKey = deps.apiKey === undefined ? (env.tavily?.apiKey ?? null) : deps.apiKey
  if (!apiKey) return []

  const send = deps.fetch ?? fetch

  let response: Response
  try {
    response = await send(ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        query: query.slice(0, 380),
        max_results: MAX_RESULTS,
        search_depth: 'basic',
        // Both false on purpose. See the note at the top of this file: an answer written by
        // Tavily's own model is reasoning, and reasoning belongs on GonkaRouter.
        include_answer: false,
        include_raw_content: false
      })
    })
  } catch {
    return []
  }

  if (!response.ok) return []

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return []
  }

  return asSources(body)
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function asSources(body: unknown): Source[] {
  if (typeof body !== 'object' || body === null) return []
  const results = (body as { results?: unknown }).results
  if (!Array.isArray(results)) return []

  const sources: Source[] = []
  for (const entry of results) {
    if (typeof entry !== 'object' || entry === null) continue
    const row = entry as Record<string, unknown>
    const url = row.url
    const snippet = row.content
    if (typeof url !== 'string' || typeof snippet !== 'string' || !snippet.trim()) continue
    // Validated here because this is the boundary. The value is persisted, returned by the API and
    // rendered into an href the viewer can click, and ExternalLink hands it to window.open — which,
    // unlike React's href, will happily run a javascript: URL.
    if (!isHttpUrl(url)) continue
    // The same page can rank twice. Two identical entries buy the readers nothing and give the
    // evidence list a duplicate React key.
    if (sources.some((existing) => existing.url === url)) continue

    sources.push({
      title: typeof row.title === 'string' && row.title.trim() ? row.title : url,
      url,
      snippet: snippet.trim().slice(0, MAX_SNIPPET_CHARS)
    })
    if (sources.length === MAX_RESULTS) break
  }

  return sources
}

/**
 * The query for one item: the question, then its options.
 *
 * The supplied key is never part of it, for the same reason it is never in the solver prompt — a
 * search for the key returns pages that agree with the key, and the reader would then be shown
 * evidence selected to confirm what we are trying to test.
 */
export function evidenceQuery(stem: string, options: { text: string }[], subject: string): string {
  const choices = options
    .map((option) => option.text)
    .join(' ')
    .slice(0, 200)
  return `${subject}: ${stem} ${choices}`.replace(/\s+/g, ' ').trim()
}
