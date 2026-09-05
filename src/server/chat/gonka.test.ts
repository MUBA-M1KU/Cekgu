import { afterEach, describe, expect, test } from 'bun:test'
import type { RecordDetail } from '../../shared/types'
import { askGonka } from './gonka'
import { SYSTEM } from './prompt'

const QUESTION = 'Which questions are flagged?'

const record: RecordDetail = {
  id: 'record-1',
  title: 'Ujian Matematik Percubaan SPM',
  subject: 'Matematik',
  language: 'ms',
  context: null,
  status: 'ready',
  isSample: false,
  expiresAt: null,
  counts: { clear: 1, possible_key_error: 0, possible_ambiguity: 0, split_opinion: 0, unverified: 0, pending: 0 },
  truthScore: { score: null, scored: 0, total: 0 },
  corroboration: { supported: 0, contradicted: 0, absent: 0, retrieved: 0, sourcesOnly: 0 },
  items: []
}

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const bodies: string[] = []

function stubGateway() {
  bodies.length = 0

  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    bodies.push(String(init?.body))
    return new Response(JSON.stringify({ choices: [{ message: { content: 'Nothing is flagged.' } }] }), {
      status: 200,
      headers: { 'x-request-id': 'req-1788416980465962869-369929' }
    })
  }) as typeof fetch
}

type Body = { messages: { role: string; content: string }[] }

describe('the chat request body', () => {
  // Issue #226: the gateway serves a byte-identical body from cache in a fraction of a second, so
  // without this a rehearsed question answers instantly and one a judge invents takes the full call.
  test('is not byte-identical across two identical questions', async () => {
    stubGateway()
    await askGonka(record, QUESTION, [])
    await askGonka(record, QUESTION, [])

    expect(bodies).toHaveLength(2)
    expect(bodies[0]).not.toBe(bodies[1])
  })

  test('carries its own nonce on the system line and leaves the question alone', async () => {
    stubGateway()
    await askGonka(record, QUESTION, [])
    await askGonka(record, QUESTION, [])

    const [first, second] = bodies.map((body) => JSON.parse(body) as Body)
    expect(first?.messages[0]?.content).toStartWith(SYSTEM)
    expect(first?.messages[0]?.content).toContain('// nonce: ')
    expect(first?.messages[0]?.content).not.toBe(second?.messages[0]?.content)
    expect(first?.messages.at(-1)?.content).toBe(QUESTION)
  })
})
