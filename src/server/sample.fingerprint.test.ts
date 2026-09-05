import { describe, expect, test } from 'bun:test'
import type { PassFile } from './sample'
import { passFingerprint, stableStringify } from './sample'

// #301. seedSample used to return early whenever a sample row existed, so an updated fixture never
// reached a deployment that had booted once — #299 added 24 retrieved pages and production kept
// serving a row seeded weeks earlier. The reload now turns on this fingerprint, which puts two
// failure modes one bug apart: too sensitive and every boot re-seeds the demo surface, too blunt and
// the fixture never lands. Both are covered below, without a database.

describe('stableStringify', () => {
  // The one that matters. Postgres normalises jsonb key order, so a reading read back out does not
  // stringify to the same bytes as the one in the file even when nothing changed.
  test('key order does not change the output', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }))
  })

  test('nested key order does not change it either', () => {
    const one = { outer: { z: [{ b: 1, a: 2 }], y: 3 } }
    const two = { outer: { y: 3, z: [{ a: 2, b: 1 }] } }
    expect(stableStringify(one)).toBe(stableStringify(two))
  })

  test('array order does change it, because order is meaning in a list of sources', () => {
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]))
  })

  test('null, primitives and empty containers round-trip', () => {
    expect(stableStringify(null)).toBe('null')
    expect(stableStringify(4)).toBe('4')
    expect(stableStringify('x')).toBe('"x"')
    expect(stableStringify([])).toBe('[]')
    expect(stableStringify({})).toBe('{}')
  })

  test('a different value is a different string', () => {
    expect(stableStringify({ a: 1 })).not.toBe(stableStringify({ a: 2 }))
  })
})

const reading = (extra: Record<string, unknown> = {}) => ({
  model: 'deepseek-ai/DeepSeek-V4-Flash-0731',
  answer: 'A',
  defensible: ['A'],
  reason: 'because',
  ...extra
})

const pass = (items: PassFile['items']): PassFile =>
  ({
    pass: 'capture-test',
    capturedAt: '2026-09-03T00:00:00.000Z',
    record: { title: 'T', subject: 'S', language: 'en', context: null },
    items
  }) as unknown as PassFile

const item = (stem: string, readingJson: unknown, requestId = 'req-1') =>
  ({
    stem,
    options: [
      { letter: 'A', text: 'one' },
      { letter: 'B', text: 'two' }
    ],
    key: 'A',
    attempts: [{ requestId, readingJson, admitted: true }]
  }) as unknown as PassFile['items'][number]

describe('passFingerprint', () => {
  test('the same pass fingerprints the same twice', () => {
    const p = pass([item('Q1', reading())])
    expect(passFingerprint(p)).toBe(passFingerprint(p))
  })

  // The bug this exists to catch: adding sources must make the fixture look different, or the
  // re-seed never fires and #301 stays open.
  test('attaching sources changes the fingerprint', () => {
    const without = pass([item('Q1', reading())])
    const withSources = pass([
      item('Q1', reading({ sources: [{ title: 'T', url: 'https://example.com/', snippet: 's' }] }))
    ])
    expect(passFingerprint(withSources)).not.toBe(passFingerprint(without))
  })

  test('changing a stem, a key or an option changes it', () => {
    const base = passFingerprint(pass([item('Q1', reading())]))
    expect(passFingerprint(pass([item('Q2', reading())]))).not.toBe(base)

    const rekeyed = item('Q1', reading())
    rekeyed.key = 'B'
    expect(passFingerprint(pass([rekeyed]))).not.toBe(base)
  })

  test('changing a request id changes it', () => {
    const base = passFingerprint(pass([item('Q1', reading())]))
    expect(passFingerprint(pass([item('Q1', reading(), 'req-2')]))).not.toBe(base)
  })

  // The other bug: an order-sensitive fingerprint would differ on every boot, because the database
  // promises nothing about the order it returns rows in, and the sample would re-seed forever.
  test('item order does not change it', () => {
    const a = pass([item('Q1', reading()), item('Q2', reading(), 'req-2')])
    const b = pass([item('Q2', reading(), 'req-2'), item('Q1', reading())])
    expect(passFingerprint(a)).toBe(passFingerprint(b))
  })

  test('reading key order does not change it, which is what jsonb does to a stored reading', () => {
    const inFileOrder = pass([item('Q1', { model: 'm', answer: 'A', defensible: ['A'], reason: 'r' })])
    const asPostgresReturnsIt = pass([item('Q1', { reason: 'r', answer: 'A', model: 'm', defensible: ['A'] })])
    expect(passFingerprint(inFileOrder)).toBe(passFingerprint(asPostgresReturnsIt))
  })
})

describe('the committed fixture', () => {
  test('fingerprints stably, and carries the retrieved pages #299 added', async () => {
    const { loadPass, SAMPLE_PASS_PATH } = await import('./sample')
    const loaded = await loadPass(SAMPLE_PASS_PATH)
    expect(loaded).not.toBeNull()
    if (!loaded) return

    expect(passFingerprint(loaded)).toBe(passFingerprint(loaded))

    const withSources = loaded.items.flatMap((entry) =>
      entry.attempts.filter((row) => row.readingJson?.sources?.length)
    )
    expect(withSources.length).toBe(24)
    // Grounding is a value a Gonka reader reports about evidence it was shown, and these readers
    // were shown nothing. It must never appear on this fixture.
    const grounded = loaded.items.flatMap((entry) =>
      entry.attempts.filter((row) => row.readingJson && 'grounding' in row.readingJson)
    )
    expect(grounded).toHaveLength(0)
  })
})
