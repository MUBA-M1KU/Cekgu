import { describe, expect, test } from 'bun:test'
import { isIP } from 'node:net'
import { assertPublicUrl, htmlToText } from './fetch-url'

describe('the scheme and shape of the link', () => {
  test('a sentence is not a link', async () => {
    const result = await assertPublicUrl('what is the capital of Malaysia')
    expect(result.ok).toBe(false)
  })

  test('file:// is refused', async () => {
    const result = await assertPublicUrl('file:///etc/passwd')
    expect(result).toEqual({ ok: false, reason: 'Only http and https links can be read.' })
  })

  test('a data URI is refused', async () => {
    const result = await assertPublicUrl('data:text/html,<h1>hi</h1>')
    expect(result).toEqual({ ok: false, reason: 'Only http and https links can be read.' })
  })

  test('a link carrying credentials is refused', async () => {
    const result = await assertPublicUrl('https://user:pass@example.com/paper')
    expect(result).toEqual({ ok: false, reason: 'That link carries a username or password. Paste a plain link.' })
  })
})

// #294. The guard used to resolve, judge, and then hand the NAME back to fetch, which resolved a
// second time — so a record that changed between the two lookups passed the check and connected
// somewhere else. It now returns the address it vetted and the caller connects to that.
describe('the vetted address travels with the verdict', () => {
  test('a literal address is returned unchanged', async () => {
    const result = await assertPublicUrl('https://93.184.216.34/paper.html')
    expect(result.ok).toBe(true)
    expect(result.ok && result.address).toBe('93.184.216.34')
  })

  test('a hostname resolves to an address the caller can pin to', async () => {
    const result = await assertPublicUrl('https://example.com/')
    expect(result.ok).toBe(true)
    // Whatever it resolved to, it must be a real address and not the name again.
    expect(result.ok && isIP(result.address)).toBeGreaterThan(0)
  })

  test('an IPv6 literal is returned in bare form, for the caller to bracket', async () => {
    const result = await assertPublicUrl('http://[2606:4700:4700::1111]/')
    expect(result.ok).toBe(true)
    expect(result.ok && result.address).not.toContain('[')
  })
})

// #295. A port field turned the fetcher into a port scanner that reported back through timing and
// error text. A paper is served over http or https and nothing else it could reach usefully is.
describe('ports', () => {
  test('a non-web port is refused', async () => {
    const result = await assertPublicUrl('http://example.com:22/')
    expect(result).toEqual({ ok: false, reason: 'Only the standard web ports can be read.' })
  })

  test('an unusual high port is refused', async () => {
    expect((await assertPublicUrl('http://example.com:8080/')).ok).toBe(false)
  })

  test('an explicit 80 and 443 are allowed', async () => {
    expect((await assertPublicUrl('http://93.184.216.34:80/')).ok).toBe(true)
    expect((await assertPublicUrl('https://93.184.216.34:443/')).ok).toBe(true)
  })

  test('no port at all is allowed', async () => {
    expect((await assertPublicUrl('https://93.184.216.34/')).ok).toBe(true)
  })
})

describe('addresses inside a private network', () => {
  const PRIVATE = [
    'http://127.0.0.1/',
    'http://localhost.localdomain./',
    'http://0.0.0.0/',
    'http://10.1.2.3/',
    'http://172.16.5.4/',
    'http://172.31.255.255/',
    'http://192.168.1.1/',
    'http://100.64.0.1/',
    'http://192.0.0.1/',
    'http://198.18.0.1/',
    'http://[::1]/',
    'http://[fd00::1]/',
    'http://[fe80::1]/'
  ]

  for (const link of PRIVATE) {
    test(`${link} is refused`, async () => {
      const result = await assertPublicUrl(link)
      expect(result.ok).toBe(false)
    })
  }

  // The one that matters on Cloud Run: this address hands out service-account tokens.
  test('the cloud metadata service is refused', async () => {
    const result = await assertPublicUrl('http://169.254.169.254/computeMetadata/v1/')
    expect(result).toEqual({ ok: false, reason: 'That link points inside a private network, so it was not fetched.' })
  })

  test('an IPv4 address wearing a v6 hat is still judged on the v4 address', async () => {
    const result = await assertPublicUrl('http://[::ffff:169.254.169.254]/')
    expect(result.ok).toBe(false)
  })

  test('a public address is allowed', async () => {
    const result = await assertPublicUrl('https://93.184.216.34/paper.html')
    expect(result.ok).toBe(true)
  })

  test('172.32 is public, so the 172 block is not refused wholesale', async () => {
    const result = await assertPublicUrl('http://172.32.0.1/')
    expect(result.ok).toBe(true)
  })

  test('a public IPv6 address is allowed', async () => {
    const result = await assertPublicUrl('http://[2606:4700:4700::1111]/')
    expect(result.ok).toBe(true)
  })

  test('loopback written the long way is still refused', async () => {
    const result = await assertPublicUrl('http://[0:0:0:0:0:0:0:1]/')
    expect(result.ok).toBe(false)
  })

  test('a v4-mapped loopback is refused', async () => {
    const result = await assertPublicUrl('http://[::ffff:127.0.0.1]/')
    expect(result.ok).toBe(false)
  })

  // Every one of these read as PUBLIC until 6 September. The guard decoded ::ffff: and nothing else,
  // and matched link-local on the literal prefix fe80 rather than on the /10 it actually spans, so
  // six ways of writing an address that is not the public internet walked straight through it.
  const ONCE_MISSED = [
    ['http://[::169.254.169.254]/', 'IPv4-compatible ::/96, the metadata service'],
    ['http://[64:ff9b::a9fe:a9fe]/', 'NAT64 well-known prefix, reachable wherever a translator sits'],
    ['http://[2002:a9fe:a9fe::]/', '6to4 encoding of the metadata service'],
    ['http://[fe90::1]/', 'link-local is fe80::/10, not the literal prefix fe80'],
    ['http://[febf::1]/', 'the top of fe80::/10'],
    ['http://[fec0::1]/', 'deprecated site-local fec0::/10'],
    ['http://[ff02::1]/', 'multicast ff00::/8']
  ] as const

  for (const [link, why] of ONCE_MISSED) {
    test(`${link} is refused — ${why}`, async () => {
      const result = await assertPublicUrl(link)
      expect(result.ok).toBe(false)
    })
  }

  test('a public 2002:: address that does not wrap a private v4 is still allowed', async () => {
    // 6to4 wrapping 93.184.216.34, which is public. The decode must judge the embedded address
    // rather than refuse the whole 2002::/16 block.
    const result = await assertPublicUrl('http://[2002:5db8:d822::]/')
    expect(result.ok).toBe(true)
  })

  test('the unspecified address is refused', async () => {
    expect((await assertPublicUrl('http://[::]/')).ok).toBe(false)
  })
})

describe('reducing a page to its words', () => {
  test('script and style content never survives', () => {
    const html =
      '<html><head><style>.a{color:red}</style></head><body><script>alert(1)</script><p>Question 1</p></body></html>'
    const text = htmlToText(html)
    expect(text).toBe('Question 1')
    expect(text).not.toContain('alert')
    expect(text).not.toContain('color:red')
  })

  test('block tags become line breaks so questions do not run together', () => {
    expect(htmlToText('<li>A. Stack</li><li>B. Queue</li>')).toBe('A. Stack\nB. Queue')
  })

  test('entities are decoded', () => {
    expect(htmlToText('<p>1 &lt; 2 &amp;&nbsp;3 &gt; 2</p>')).toBe('1 < 2 & 3 > 2')
  })

  test('comments are dropped', () => {
    expect(htmlToText('<p>Keep<!-- the key is B --></p>')).toBe('Keep')
  })

  test('an unknown entity is left alone rather than mangled', () => {
    expect(htmlToText('<p>&dagger;</p>')).toBe('&dagger;')
  })
})
