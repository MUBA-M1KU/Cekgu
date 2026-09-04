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
    const exempt = /^\.hero-media$|^\.hero-scrim$|\[data-solid="true"\]$/
    const bare: string[] = []
    for (const { selector, body } of parse(withoutFallbacks)) {
      if (exempt.test(selector)) continue
      const background = /background(?:-color)?:\s*(color-mix\([^;]*transparent[^;]*)\);/.exec(body)
      if (background && !body.includes('backdrop-filter')) bare.push(`${selector}: ${background[1]})`)
    }
    expect(bare).toEqual([])
  })
})

describe('the rail opens on one condition', () => {
  // Three rules make the rail open: its width, the backdrop behind it, and the labels' opacity.
  // They are only correct together. #182 moved the first two off :focus-within, because a mouse
  // click leaves focus on the link it followed and the rail stayed open after the pointer left.
  // The third was missed, and the mismatch was worse than the original bug: the labels turned
  // opaque while the rail stayed 4rem wide, so `overflow: hidden` sliced every one of them
  // mid-word. Counted on the source rather than the rule parser above, which cannot see a
  // selector list split across lines — which is exactly how all three of these are written.
  const selectors = [...css.matchAll(/^\s*(\.app-rail[^,{\n]*)[,{]/gm)].map((match) => (match[1] ?? '').trim())

  test('no rail selector opens on :focus-within', () => {
    expect(selectors.filter((selector) => selector.includes(':focus-within'))).toEqual([])
  })

  test('hover and :has(:focus-visible) open the rail in the same places', () => {
    const hover = selectors.filter((selector) => selector.startsWith('.app-rail:hover'))
    const focus = selectors.filter((selector) => selector.startsWith('.app-rail:has(:focus-visible)'))
    expect(hover.length).toBe(3)
    expect(focus.length).toBe(hover.length)
  })
})
