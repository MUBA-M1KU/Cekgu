import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

// TRD section 20's third input. A pasted link is fetched here, reduced to the text printed on the
// page, and handed to the SAME structuring step an upload uses — so the only thing that decides
// what the paper says is still a Gonka model. Nothing in this file calls a model, and that is why
// it lives outside the two exempt directories rather than beside the transcriber.
//
// Fetching a URL a stranger typed is a server-side request forgery primitive, so the guard below is
// the point of the module and the parsing is the easy part. Cloud Run reaches a metadata service on
// 169.254.169.254 that hands out service-account tokens; an unguarded fetcher would hand them to
// whoever pasted the link.

export const URL_MAX_BYTES = 5_000_000
const FETCH_TIMEOUT_MS = 15_000
const MAX_REDIRECTS = 3
// Enough for a long past paper, short enough that one page cannot fill a prompt on its own.
const MAX_TEXT_CHARS = 40_000

export const HTML_TYPES = ['text/html', 'application/xhtml+xml', 'text/plain']

export type UrlFetch =
  | { ok: true; kind: 'text'; text: string; finalUrl: string }
  | { ok: true; kind: 'binary'; bytes: Uint8Array; contentType: string; finalUrl: string }
  | { ok: false; reason: string }

// The eight 16-bit groups of an IPv6 address, with :: expanded. Returns null for anything that does
// not parse, and every caller treats null as private — an address we cannot read is not one to trust.
function v6Groups(address: string): number[] | null {
  // A v4-embedded tail is written in dotted form. Convert it to two hex groups first so the rest of
  // this function only ever sees groups.
  const dotted = address.match(/^(.*:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  const normalised = dotted
    ? `${dotted[1]}${(((Number(dotted[2]) << 8) | Number(dotted[3])) >>> 0).toString(16)}:${(((Number(dotted[4]) << 8) | Number(dotted[5])) >>> 0).toString(16)}`
    : address

  const halves = normalised.split('::')
  if (halves.length > 2) return null
  const parse = (part: string | undefined): number[] =>
    part
      ? part
          .split(':')
          .filter(Boolean)
          .map((group) => Number.parseInt(group, 16))
      : []

  const left = parse(halves[0])
  if (halves.length === 1) return left.length === 8 && !left.some(Number.isNaN) ? left : null

  const right = parse(halves[1])
  const fill = 8 - left.length - right.length
  if (fill < 0) return null
  const groups = [...left, ...Array<number>(fill).fill(0), ...right]
  return groups.some(Number.isNaN) ? null : groups
}

// Every range that is not the public internet. Checked against the RESOLVED address, not the
// hostname, because a name under someone else's control can point at 127.0.0.1 whenever it likes.
function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase()
    const groups = v6Groups(lower)
    if (!groups) return true

    const [g0, g1, g2, g3, g4, g5, g6, g7] = groups
    if (g0 === undefined || g1 === undefined || g6 === undefined || g7 === undefined) return true

    // Masked, not prefix-matched. fe80::/10 spans fe80 through febf and fec0::/10 through feff, so
    // testing `startsWith('fe80')` let http://[fe90::1]/ and the deprecated site-local block through.
    if ((g0 & 0xfe00) === 0xfc00) return true // unique local, fc00::/7
    if ((g0 & 0xffc0) === 0xfe80) return true // link-local, fe80::/10
    if ((g0 & 0xffc0) === 0xfec0) return true // site-local, deprecated but still not the internet
    if ((g0 & 0xff00) === 0xff00) return true // multicast, ff00::/8

    // Four ways to write an IPv4 address inside an IPv6 one, and the guard has to decode all of
    // them or it judges the wrapper instead of the address. Only ::ffff: was handled, so
    // http://[::169.254.169.254]/ and the NAT64 form http://[64:ff9b::a9fe:a9fe]/ both read as
    // public and reached the cloud metadata service wherever a translator sat on the path.
    const embedded = (hi: number, lo: number) => isPrivateAddress(`${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`)
    const topFive = g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0

    if (topFive && g5 === 0xffff) return embedded(g6, g7) // ::ffff:0:0/96, IPv4-mapped
    if (g0 === 0x0064 && g1 === 0xff9b) return embedded(g6, g7) // 64:ff9b::/96, NAT64
    if (g0 === 0x2002) return embedded(g1, g2 ?? 0) // 2002::/16, 6to4
    // ::/96 IPv4-compatible. Excludes :: and ::1, which the unspecified/loopback test below owns.
    if (topFive && g5 === 0 && !(g6 === 0 && (g7 === 0 || g7 === 1))) return embedded(g6, g7)

    // ::1 (loopback) and :: (unspecified), once expanded.
    return groups.every((group, index) => (index === 7 ? group === 0 || group === 1 : group === 0))
  }

  const parts = address.split('.').map(Number)
  const [a, b] = parts
  if (parts.length !== 4 || a === undefined || b === undefined || parts.some(Number.isNaN)) return true

  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true // link-local, and the cloud metadata service with it
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a === 192 && b === 0) return true // 192.0.0.0/24 protocol assignments, and 192.0.2.0/24 docs
  if (a === 198 && (b === 18 || b === 19)) return true // 198.18.0.0/15 benchmarking
  if (a >= 224) return true // multicast and reserved
  return false
}

/**
 * Parsed, scheme-checked and proven to resolve outside every private range.
 *
 * Returns the address it vetted, and the caller connects to THAT rather than to the hostname again.
 * Resolving twice is the DNS rebinding hole: a name whose record changes between the check and the
 * connect passes here and lands somewhere else (#294).
 */
export async function assertPublicUrl(
  raw: string
): Promise<{ ok: true; url: URL; address: string } | { ok: false; reason: string }> {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return { ok: false, reason: 'That is not a web address. Paste a link beginning with https://.' }
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, reason: 'Only http and https links can be read.' }
  }

  // Credentials in a URL are almost always an attempt to reach something we should not be reaching.
  if (url.username || url.password) {
    return { ok: false, reason: 'That link carries a username or password. Paste a plain link.' }
  }

  // Only the default web ports. A paper is served over http or https, and nothing else the fetcher
  // could usefully reach is — while a port field turns the guard into a port scanner that reports
  // back through timing and error text (#295).
  if (url.port && url.port !== '80' && url.port !== '443') {
    return { ok: false, reason: 'Only the standard web ports can be read.' }
  }

  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [host] : await resolve(host)
  if (!addresses.length) return { ok: false, reason: 'That address could not be found.' }
  // EVERY address, not the one that will be used: a name resolving to one public and one private
  // address must be refused outright rather than raced.
  if (addresses.some(isPrivateAddress)) {
    return { ok: false, reason: 'That link points inside a private network, so it was not fetched.' }
  }

  const address = addresses[0]
  if (!address) return { ok: false, reason: 'That address could not be found.' }
  return { ok: true, url, address }
}

/**
 * The same request, addressed to the literal IP that was vetted.
 *
 * This is what closes the rebinding window: `fetch` resolves the hostname itself, so handing it the
 * name again would let a second lookup return an address the guard never saw. The name is carried
 * in the Host header and the SNI instead.
 */
function pinnedUrl(url: URL, address: string): string {
  const host = isIP(address) === 6 ? `[${address}]` : address
  const port = url.port ? `:${url.port}` : ''
  return `${url.protocol}//${host}${port}${url.pathname}${url.search}`
}

async function resolve(host: string): Promise<string[]> {
  try {
    const found = await lookup(host, { all: true })
    return found.map((entry) => entry.address)
  } catch {
    return []
  }
}

/**
 * Fetch a public URL and return either its text or its bytes.
 *
 * Redirects are followed by hand, one hop at a time, because `fetch` would follow them for us
 * without re-checking where they land — and a public URL that redirects to 169.254.169.254 is the
 * whole attack.
 */
export async function fetchUrl(raw: string): Promise<UrlFetch> {
  let target = raw
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const checked = await assertPublicUrl(target)
    if (!checked.ok) return checked

    let response: Response
    try {
      response = await fetch(pinnedUrl(checked.url, checked.address), {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          // The socket goes to the vetted IP, so the name has to travel in the header for virtual
          // hosts to serve the right page.
          host: checked.url.host,
          accept: 'text/html,application/xhtml+xml,application/pdf,image/*;q=0.8,*/*;q=0.5'
        },
        // And in the SNI, or the certificate cannot validate against an IP. Measured on Bun 1.4:
        // fetching a literal IP without this fails with "unknown certificate verification error",
        // and with it returns 200.
        tls: { serverName: checked.url.hostname }
      })
    } catch {
      return { ok: false, reason: 'That page could not be reached.' }
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) return { ok: false, reason: 'That page redirected to nowhere.' }
      target = new URL(location, checked.url).toString()
      continue
    }

    if (!response.ok) {
      return { ok: false, reason: `That page answered ${response.status}.` }
    }

    const declared = Number(response.headers.get('content-length') ?? '0')
    if (declared > URL_MAX_BYTES) {
      return { ok: false, reason: 'That page is larger than 5 MB.' }
    }

    const contentType = (response.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
    const read = await readCapped(response)
    if (!read) return { ok: false, reason: 'That page is larger than 5 MB.' }
    const buffer = read

    const finalUrl = checked.url.toString()
    if (HTML_TYPES.includes(contentType) || contentType === '') {
      const text = htmlToText(new TextDecoder().decode(buffer))
      if (text.length < 40) {
        return { ok: false, reason: 'That page had almost no text on it. Paste the questions instead.' }
      }
      return { ok: true, kind: 'text', text, finalUrl }
    }

    return { ok: true, kind: 'binary', bytes: new Uint8Array(buffer), contentType, finalUrl }
  }

  return { ok: false, reason: 'That link redirected too many times.' }
}

/**
 * The body, or null if it goes past the ceiling.
 *
 * Read through the stream with a running count rather than buffered whole and measured afterwards.
 * A chunked response sends no content-length, so the header check above cannot fire, and
 * `arrayBuffer()` would hold the entire body in memory before anything measured it — a server the
 * caller chose could stream for the full 15 s timeout, four times over across the redirect budget.
 */
async function readCapped(response: Response): Promise<Uint8Array | null> {
  const body = response.body
  if (!body) return new Uint8Array()

  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      total += value.byteLength
      if (total > URL_MAX_BYTES) return null
      chunks.push(value)
    }
  } catch {
    return null
  } finally {
    // Releases the socket whether we finished or walked away at the ceiling.
    void reader.cancel().catch(() => undefined)
  }

  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.byteLength
  }
  return out
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
  '#160': ' '
}

/**
 * The words printed on the page, and nothing else.
 *
 * Deliberately crude. Anything cleverer is a guess about which div holds the questions, and the
 * Gonka model downstream is far better at that than a selector would be — its whole job is finding
 * stems, options and a key in loose text. What matters here is that script and style content never
 * reaches it, because that is not text a reader can see.
 */
export function htmlToText(html: string): string {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|head)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article|br)\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&([a-z]+|#\d+);/gi, (whole, name: string) => ENTITIES[name.toLowerCase()] ?? whole)
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text
}
