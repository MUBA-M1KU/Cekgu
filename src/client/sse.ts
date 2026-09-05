/**
 * Server-sent event framing, kept apart from the fetch that feeds it so it can be tested against
 * bytes rather than against a network.
 *
 * THE TAIL IS THE WHOLE POINT. A frame is normally terminated by a blank line, and a reader that
 * only ever consumes up to a blank line drops the last frame whenever the stream closes without
 * one. That is not hypothetical: it is a stream whose final write is the answer, which is the one
 * frame that matters, and losing it looks exactly like an answer that never arrived.
 */
export type SseFrame = { event: string; data: string }

const EVENT = /^event:[ \t]*(.*)$/m
const DATA = /^data:[ \t]?(.*)$/m

/** One frame's text into its event and data, or null when it carries neither. */
export function readFrame(text: string): SseFrame | null {
  const body = text.trim()
  if (body.length === 0) return null

  const event = EVENT.exec(body)?.[1]?.trim()
  const data = DATA.exec(body)?.[1]
  if (!event || data === undefined || data.length === 0) return null

  return { event, data }
}

/**
 * Every complete frame in the buffer, and the tail that is not a frame yet. Both `\n\n` and the
 * `\r\n\r\n` a proxy may rewrite it to terminate a frame.
 */
export function takeFrames(buffer: string): { frames: SseFrame[]; rest: string } {
  const frames: SseFrame[] = []
  let rest = buffer

  while (true) {
    const lf = rest.indexOf('\n\n')
    const crlf = rest.indexOf('\r\n\r\n')
    const at = lf === -1 ? crlf : crlf === -1 ? lf : Math.min(lf, crlf)
    if (at === -1) break

    const width = at === crlf && crlf !== -1 ? 4 : 2
    const frame = readFrame(rest.slice(0, at))
    rest = rest.slice(at + width)
    if (frame) frames.push(frame)
  }

  return { frames, rest }
}
