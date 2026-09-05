import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('index.ts', import.meta.url), 'utf8')

// Bun's HTTP idleTimeout defaults to 10 s and is enforced at 12 s. Both of this product's streaming
// routes go quiet for longer than that on purpose — the record assistant sends nothing while a
// gateway call is in flight, and the record events stream sends nothing while a record's status is
// unchanged — so the default cuts them mid-flight. Nothing about that failure looks like a failure:
// Hono's streamSSE closes the stream cleanly and the client reads an ordinary end of response.
//
// Asserted on the source because the alternative is a socket held open for four minutes in a test,
// and because the value being absent is the whole bug. A reviewer deleting it would see one option
// removed from a constructor, not two features breaking on the slow answers nobody tests with.
describe('the server outlives a silent stream', () => {
  test('Bun.serve sets an explicit idleTimeout', () => {
    expect(source).toMatch(/Bun\.serve\(\{[^}]*idleTimeout:\s*(\d+)/)
  })

  test('the timeout clears the gateway budget and stays under Cloud Run', () => {
    const idleTimeout = Number(/idleTimeout:\s*(\d+)/.exec(source)?.[1])
    // Above chat/gonka.ts's 90 s per-call ceiling, so the socket never decides an answer's fate.
    expect(idleTimeout).toBeGreaterThan(90)
    // Bun's maximum, and Cloud Run cuts the request at 300 s regardless.
    expect(idleTimeout).toBeLessThanOrEqual(255)
  })
})
