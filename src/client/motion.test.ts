import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const styles = readFileSync(join(import.meta.dir, 'styles.css'), 'utf8')
const preferences = readFileSync(join(import.meta.dir, 'mascot/preferences.ts'), 'utf8')

// Before 4 September the reduced-motion reset fired on the system query alone, so a machine with
// animations switched off killed every animation in the product and nothing in Settings could bring
// them back. Windows reports its "show animations" toggle through that query, and people throw that
// switch for a faster desktop as often as for motion sensitivity — the signal is one bit carrying
// two unrelated intentions, so it is a default rather than a verdict.
describe('the motion preference can overrule the system', () => {
  test('no system-query block applies without checking for an explicit choice', () => {
    // Every @media (prefers-reduced-motion: reduce) block must scope its selectors to
    // :root:not([data-motion="full"]), or "Always Animate" silently stops working.
    const blocks = styles.split('@media (prefers-reduced-motion: reduce)').slice(1)
    expect(blocks.length).toBeGreaterThan(0)

    const unguarded = blocks.filter((block) => {
      const body = block.slice(0, block.indexOf('}'))
      return !body.includes(':root:not([data-motion="full"])')
    })
    expect(unguarded).toEqual([])
  })

  test('the reduce branch is keyed off the setting, not the old boolean attribute', () => {
    expect(styles).toContain(':root[data-motion="reduce"]')
    expect(styles).not.toContain('data-reduce-motion')
  })

  test('an explicit choice wins in both directions', () => {
    // full short-circuits to false and reduce to true before the system is consulted at all.
    expect(preferences).toMatch(/if \(setting === 'full'\) return false/)
    expect(preferences).toMatch(/if \(setting === 'reduce'\) return true/)
    expect(preferences).toMatch(/return systemPrefers\(\)/)
  })

  test('the old boolean setting still means reduce', () => {
    expect(preferences).toContain('LEGACY_KEY')
    expect(preferences).toMatch(/localStorage\.getItem\(LEGACY_KEY\) === 'true' \? 'reduce' : 'system'/)
  })
})
