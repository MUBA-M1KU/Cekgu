import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { GUEST_WARNING } from './components/GuestBanner'

const clientDir = fileURLToPath(new URL('.', import.meta.url))
const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')
const pages = [...new Bun.Glob('**/*.tsx').scanSync({ cwd: clientDir })].sort()

const unwrapMarkdown = (markdown: string) => markdown.replace(/^>\s?/gm, '').replace(/\*\*/g, '').replace(/\s+/g, ' ')
const unwrapSource = (source: string) => source.replace(/\s+/g, ' ')

const FORBIDDEN = /certif|cryptograph|on-chain|blockchain|error-free|guarantee|100%/i

// Exact negation sentences copied from the pages. Each denies a claim; nothing else may mention these words.
const ALLOWED_DENIALS = [
  'It does not certify a paper, change a key, or grade anyone.',
  'It never means the question is certified correct.',
  'It is not cryptographic or on-chain proof, and model agreement is not the same as truth.',
  'It is gateway metadata, not cryptographic proof and not an on-chain transaction.',
  'Cekgu never certifies a question as correct.'
]

describe('the Guest warning', () => {
  test('is PRODUCT.md and the PRD word for word', () => {
    expect(unwrapMarkdown(read('../../docs/PRODUCT.md'))).toContain(GUEST_WARNING)
    expect(unwrapMarkdown(read('../../docs/PRD.md'))).toContain(GUEST_WARNING)
  })

  test('is written once, in GuestBanner, and the sign-in page renders that export', () => {
    const holders = pages.filter((file) => read(file).includes('Shared demo workspace'))
    expect(holders).toEqual(['components/GuestBanner.tsx'])

    const signIn = read('pages/SignIn.tsx')
    expect(signIn).toMatch(/import \{ GUEST_WARNING \} from '\.\.\/components\/GuestBanner'/)
    expect(signIn).toContain('{GUEST_WARNING}')
  })
})

describe('the pages', () => {
  test('every allowlisted denial still exists on a page and denies something', () => {
    const everything = pages.map((file) => unwrapSource(read(file))).join('\n')
    for (const denial of ALLOWED_DENIALS) {
      expect(everything).toContain(denial)
      expect(denial).toMatch(/\bnot\b|\bnever\b/)
    }
  })

  test('make no forbidden claim outside the allowlisted denials', () => {
    const offences: string[] = []
    for (const file of pages) {
      let text = unwrapSource(read(file))
      for (const denial of ALLOWED_DENIALS) text = text.replaceAll(denial, '')
      const match = FORBIDDEN.exec(text)
      if (match) offences.push(`${file}: …${text.slice(Math.max(0, match.index - 60), match.index + 60)}…`)
    }
    expect(offences).toEqual([])
  })

  test('never call the Guest account anonymous', () => {
    const offences = pages.filter((file) => /anonymous/i.test(read(file)))
    expect(offences).toEqual([])
  })

  test('state the retention windows in Settings from the constants the sweep enforces', () => {
    const settings = read('pages/Settings.tsx')

    expect(settings).toContain("import { RETENTION_DAYS, TRASH_DAYS } from '../../shared/schemas'")
    // Interpolated either way round, because the copy moved from a template literal to JSX when the
    // paragraphs became a definition list. What matters is that the number on screen comes from the
    // constant the sweep compares against, not that it is written with a dollar sign.
    expect(settings).toMatch(/[${{]RETENTION_DAYS} days/)
    expect(settings).toMatch(/[${{]TRASH_DAYS} days/)
  })

  // The page printed Math.round(RETENTION_DAYS / 30) as "3 months". Three calendar months is 89 to
  // 92 days and retention.ts compares against RETENTION_DAYS * 86_400_000, so the unit on screen was
  // one the sweep never enforces.
  test('state those windows in days, never converted to months', () => {
    expect(read('pages/Settings.tsx')).not.toMatch(/\bmonths?\b/)
  })

  // sweepRetiredRecords keys on records.updatedAt, and GET /api/records/:id writes nothing, so
  // reading a record does not move its clock. The page claimed the window was "counted from the
  // last time you opened or changed one", which is wrong in the account holder's disfavour.
  test('do not claim that opening a record postpones its deletion', () => {
    // Matched on the claim rather than one phrasing of it: the sentence was reworded when the
    // section was compressed, and pinning the old words would have failed on copy that is still
    // correct. What must survive is that the page says opening is not a change.
    expect(unwrapSource(read('pages/Settings.tsx')).toLowerCase()).toMatch(
      /opening a record (is not|does not count as) a change/
    )
  })

  test('price the four plans as pilot plans', () => {
    const pricing = read('pages/home/PricingSection.tsx')
    const plans: [string, string][] = [
      ['Guest', 'RM0'],
      ['Free', 'RM0'],
      ['Cekgu Plus', 'RM29'],
      ['Cekgu Studio', 'RM79']
    ]
    expect(pricing.match(/name: '/g)).toHaveLength(plans.length)
    for (const [name, price] of plans) expect(pricing).toMatch(new RegExp(`name: '${name}',[^}]*price: '${price}'`))
    expect(pricing).toMatch(/name: 'Cekgu Plus',[^}]*RM290 per year/)
    expect(pricing).toContain('Pilot plan')
  })
})
