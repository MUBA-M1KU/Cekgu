import { describe, expect, test } from 'bun:test'
import { Glob } from 'bun'

// Three brand files shipped to main unable to open, twice, and nothing caught it: their comments
// named the design tokens as `--ink` and `--pen`, and a double hyphen inside an XML comment is
// illegal. An SVG inlined into HTML still renders, because the HTML parser is lenient, so every
// check we had passed while the standalone files were refused by Chrome as broken images.
//
// This asserts the rule rather than the symptom. It reads committed files and needs no network,
// no browser and no external tool, so it runs everywhere the rest of the suite does.

const root = new URL('../../', import.meta.url)
const files = [...new Glob('public/**/*.svg').scanSync({ cwd: root.pathname })].sort()

// Everything between `<!--` and the first following `-->`, which is what XML calls a comment.
function comments(source: string): string[] {
  return [...source.matchAll(/<!--([\s\S]*?)-->/g)].map(([, body]) => body ?? '')
}

describe('committed svg assets', () => {
  test('there are some to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    const source = Bun.file(new URL(file, root)).text()

    test(`${file} has no double hyphen inside a comment`, async () => {
      const offenders = comments(await source).filter((body) => body.includes('--'))
      expect(offenders).toEqual([])
    })

    test(`${file} declares a viewBox`, async () => {
      expect(await source).toMatch(/<svg[^>]*\sviewBox="/)
    })
  }
})
