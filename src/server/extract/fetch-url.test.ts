import { describe, expect, test } from 'bun:test'
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
