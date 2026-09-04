import { describe, expect, test } from 'bun:test'
import { chromium } from 'playwright'
import { correctedKeyOption, exactText, exitCodeFor, formatCheckTable, locatorIsVisible } from './check-shots.mjs'

describe('shot anchor checks', () => {
  test('matches visible text without depending on rendered case', () => {
    const pattern = exactText('All Attempts')

    expect(pattern.test('ALL ATTEMPTS')).toBe(true)
    expect(pattern.test('All attempts below')).toBe(false)
  })

  test('fails the gate when any required anchor is absent', () => {
    expect(
      exitCodeFor([
        { shot: 1, anchor: 'Hero line', status: 'PRESENT', selector: 'role=heading' },
        { shot: 5, anchor: 'Request ids', status: 'ABSENT', selector: 'dt + dd' }
      ])
    ).toBe(1)
  })

  test('prints a present or absent row with the resolved selector', () => {
    const table = formatCheckTable([
      { shot: 1, anchor: 'Hero line', status: 'PRESENT', selector: "role=heading[name='Hero']" },
      { shot: 3, anchor: 'Search', status: 'ABSENT', selector: '#q' }
    ])

    expect(table).toContain('SHOT')
    expect(table).toContain('PRESENT')
    expect(table).toContain('ABSENT')
    expect(table).toContain("role=heading[name='Hero']")
    expect(table).toContain('#q')
  })

  test('waits for an anchor rendered after a client-side route transition', async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(
      "<main><script>setTimeout(() => document.querySelector('main').append('Sign In'), 50)</script></main>"
    )

    try {
      expect(await locatorIsVisible(page.getByText(exactText('Sign In')), 1_000)).toBe(true)
    } finally {
      await browser.close()
    }
  })

  test('targets the visible corrected-key bubble instead of its hidden radio', async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(
      "<div class='disposition-key'><label><input class='sr-only' type='radio' value='B'>B</label></div>"
    )
    const option = correctedKeyOption(page.locator('.disposition-key'), 'B')

    try {
      await option.click()
      expect(await page.locator("input[value='B']").isChecked()).toBe(true)
    } finally {
      await browser.close()
    }
  })
})
