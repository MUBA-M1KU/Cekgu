import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('styles.css', import.meta.url), 'utf8')

// The fallback blocks are where a surface is deliberately opaque or deeper-tinted BECAUSE the blur
// cannot run, so they are the one place a translucent background without one is correct. Dropped
// before parsing rather than exempted by selector, since they hold the same selectors as the rules
// they override.
const withoutFallbacks = css
  .replace(/@supports not \(backdrop-filter[\s\S]*?\n}\n/g, '')
  .replace(/@media \(prefers-reduced-transparency[\s\S]*?\n}\n/g, '')

// Rules, roughly: a selector and the declarations between its braces. Good enough to ask questions
// about one rule at a time, which is all these tests need.
function parse(source: string) {
  return [...source.matchAll(/(?:^|\n)([^@\n{][^{\n]*)\{([^}]*)\}/g)].map((match) => ({
    selector: (match[1] ?? '').trim(),
    body: match[2] ?? ''
  }))
}

const rules = parse(css)

describe('glass surfaces', () => {
  // The bug this exists to prevent shipped once and was invisible on the page. Lightning CSS, which
  // Tailwind runs over the built stylesheet, collapses a prefixed and unprefixed pair of the same
  // property down to whichever came LAST in the source. Written standard-first, the build kept only
  // `-webkit-backdrop-filter` — and Chrome dropped support for that prefix at version 151, so every
  // glass surface deployed as a bare translucent tint with no blur at all. The page still rendered;
  // it just quietly stopped being glass. Prefix first, standard last.
  test('every webkit blur is followed by the standard property with the same value', () => {
    const wrong: string[] = []
    for (const { selector, body } of rules) {
      for (const match of body.matchAll(/-webkit-backdrop-filter:\s*([^;]+);/g)) {
        const value = (match[1] ?? '').trim()
        const standard = new RegExp(`(?<!-)backdrop-filter:\\s*${value.replace(/[().*+?^$|[\]\\]/g, '\\$&')};`)
        if (!standard.test(body)) wrong.push(`${selector}: no matching backdrop-filter for "${value}"`)
      }
    }
    expect(wrong).toEqual([])
  })

  test('the standard property comes last, or the build drops it', () => {
    const wrong: string[] = []
    for (const { selector, body } of rules) {
      const webkit = body.indexOf('-webkit-backdrop-filter')
      const standard = body.search(/(?<!-)backdrop-filter/)
      if (webkit !== -1 && standard !== -1 && standard < webkit) wrong.push(selector)
    }
    expect(wrong).toEqual([])
  })

  // NFR-UX: a translucent panel with nothing blurring behind it is the half-finished look the
  // review named, so every surface that asks for transparency has to also ask for the blur. Scrims
  // and gradients are exempt: their transparency is the composite, not a material.
  test('no surface is translucent without a blur', () => {
    // Matched on the suffix rather than on the one scrim that existed when this was written: the
    // shell grew a second one for the mobile sidebar, and a scrim is a scrim wherever it is.
    const exempt = /^\.hero-media$|-scrim$|\[data-solid="true"\]$/
    const bare: string[] = []
    for (const { selector, body } of parse(withoutFallbacks)) {
      if (exempt.test(selector)) continue
      const background = /background(?:-color)?:\s*(color-mix\([^;]*transparent[^;]*)\);/.exec(body)
      if (background && !body.includes('backdrop-filter')) bare.push(`${selector}: ${background[1]})`)
    }
    expect(bare).toEqual([])
  })
})

// #195 asserted that the three rules opening the hover rail agreed on one condition. There is no
// hover rail any more: the sidebar holds a width a person sets and does not react to the pointer,
// so the bug class those tests guarded cannot occur and there are no .app-rail selectors left for
// them to count. The sidebar has no equivalent to guard, which is the point of the change.
