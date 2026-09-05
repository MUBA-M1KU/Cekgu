import { describe, expect, test } from 'bun:test'
import { readFrame, takeFrames } from './sse'

// The bytes production actually sends, copied from a live run on 5 September.
const REAL =
  'event: tool\ndata: {"name":"record_summary","position":null}\n\n' +
  'event: messages\ndata: {"messages":[{"id":"a","role":"agent"}]}\n\n'

describe('takeFrames', () => {
  test('reads a whole body', () => {
    const { frames, rest } = takeFrames(REAL)

    expect(frames.map((frame) => frame.event)).toEqual(['tool', 'messages'])
    expect(rest).toBe('')
  })

  test('holds a frame split mid-JSON until the rest arrives', () => {
    const cut = REAL.indexOf('"position"')
    const first = takeFrames(REAL.slice(0, cut))

    expect(first.frames).toEqual([])

    const second = takeFrames(first.rest + REAL.slice(cut))
    expect(second.frames.map((frame) => frame.event)).toEqual(['tool', 'messages'])
  })

  // THE BUG THIS FILE EXISTS FOR. A stream whose last write is the answer can close without the
  // blank line that would terminate it. Consuming only up to a blank line drops that frame, and the
  // reader sees a question that never got a reply.
  test('leaves an unterminated final frame in the tail rather than eating it', () => {
    const truncated = REAL.trimEnd()
    const { frames, rest } = takeFrames(truncated)

    expect(frames.map((frame) => frame.event)).toEqual(['tool'])
    expect(rest).toContain('event: messages')
    expect(readFrame(rest)?.event).toBe('messages')
  })

  test('accepts the CRLF a proxy may rewrite the stream to', () => {
    const { frames } = takeFrames(REAL.replaceAll('\n', '\r\n'))

    expect(frames.map((frame) => frame.event)).toEqual(['tool', 'messages'])
  })

  test('survives a leading blank line and a keepalive comment', () => {
    const { frames } = takeFrames(`\n\n: keepalive\n\n${REAL}`)

    expect(frames.map((frame) => frame.event)).toEqual(['tool', 'messages'])
  })
})

describe('readFrame', () => {
  test('reads the pair', () => {
    expect(readFrame('event: tool\ndata: {"a":1}')).toEqual({ event: 'tool', data: '{"a":1}' })
  })

  test('is null for anything that is not a frame', () => {
    expect(readFrame('')).toBeNull()
    expect(readFrame('   \n  ')).toBeNull()
    expect(readFrame(': just a comment')).toBeNull()
    expect(readFrame('data: {"a":1}')).toBeNull()
    expect(readFrame('event: tool')).toBeNull()
    expect(readFrame('event: tool\ndata:')).toBeNull()
  })

  test('keeps a colon inside the data intact', () => {
    expect(readFrame('event: messages\ndata: {"t":"a: b"}')?.data).toBe('{"t":"a: b"}')
  })
})
