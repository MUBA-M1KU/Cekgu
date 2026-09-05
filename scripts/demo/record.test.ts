import { describe, expect, test } from 'bun:test'
import {
  assertCompleteTake,
  attemptStatusLabel,
  decisionChoice,
  frameBelowHeader,
  normalizedBeatOffsets,
  resetSharedSample,
  servedModelLabel
} from './record.mjs'

const complete = [
  { name: 'shot-1', ms: 1_200 },
  { name: 'shot-2', ms: 14_200 },
  { name: 'shot-3', ms: 25_200 },
  { name: 'shot-4', ms: 38_200 },
  { name: 'shot-5', ms: 55_200 },
  { name: 'shot-6', ms: 75_200 },
  { name: 'shot-7', ms: 89_200 },
  { name: 'shot-8', ms: 102_200 },
  { name: 'shot-9', ms: 115_200 },
  { name: 'end', ms: 121_200 }
]

// A cold Chromium launch on a CI runner took longer than bun's 5 s default and timed out the
// first browser-backed test in the file while the later ones, launching against a warm cache,
// passed. The budget is the fixture's start-up cost, not the assertion's.
const BROWSER_TIMEOUT_MS = 60_000

describe('demo recording beats', () => {
  test('rejects a take that omits the receipt beat', () => {
    expect(() => assertCompleteTake(complete.filter((beat) => beat.name !== 'shot-5'))).toThrow('shot-5')
  })

  test('rejects beats that run backwards', () => {
    const outOfOrder = complete.map((beat) => ({ ...beat }))
    outOfOrder[6] = { name: 'shot-7', ms: 70_000 }

    expect(() => assertCompleteTake(outOfOrder)).toThrow('strictly increasing')
  })

  test('normalizes measured offsets to the first filmed frame', () => {
    expect(normalizedBeatOffsets(complete).slice(0, 3)).toEqual([
      { name: 'shot-1', ms: 0 },
      { name: 'shot-2', ms: 13_000 },
      { name: 'shot-3', ms: 24_000 }
    ])
  })

  test('targets the reader-column model when the same value repeats in receipts and attempts', async () => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(`
      <section>
        <p class="type-mono">moonshotai/Kimi-K2.6</p>
        <dl><dd>moonshotai/Kimi-K2.6</dd></dl>
        <table><tr><td>moonshotai/Kimi-K2.6</td></tr></table>
      </section>
    `)

    try {
      const target = servedModelLabel(page.locator('section'), 'moonshotai/Kimi-K2.6')
      expect(await target.count()).toBe(1)
      expect(await target.evaluate((element) => element.tagName)).toBe('P')
    } finally {
      await browser.close()
    }
  }, BROWSER_TIMEOUT_MS)

  test('frames evidence below the persistent top bar', async () => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage({ viewport: { width: 500, height: 300 } })
    await page.setContent(
      "<div style='height: 600px'></div><p id='reader'>Reader A</p><div style='height: 600px'></div>"
    )

    try {
      const reader = page.locator('#reader')
      await frameBelowHeader(page, reader, 80, 500)
      expect(Math.round((await reader.boundingBox())?.y ?? -1)).toBe(80)
    } finally {
      await browser.close()
    }
  }, BROWSER_TIMEOUT_MS)

  test('targets the attempt-table status when its reason repeats the label', async () => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(`
      <section>
        <table><tbody><tr><td><span>Timed Out</span></td></tr></tbody></table>
        <dl><dt>Timed Out</dt><dd>The call passed the cutoff.</dd></dl>
      </section>
    `)

    try {
      const target = attemptStatusLabel(page.locator('section'), 'Timed Out')
      expect(await target.count()).toBe(1)
      expect(await target.evaluate((element) => element.tagName)).toBe('SPAN')
    } finally {
      await browser.close()
    }
  }, BROWSER_TIMEOUT_MS)

  test('does not mistake a recorded disposition chip for an editable decision', async () => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(`
      <li id="decided"><span class="status-chip">Key Corrected</span></li>
      <li id="clean"><div class="disposition"><label><input type="radio">Key Corrected</label></div></li>
    `)

    try {
      expect(await decisionChoice(page.locator('#decided'), 'Key Corrected').count()).toBe(0)
      expect(await decisionChoice(page.locator('#clean'), 'Key Corrected').count()).toBe(1)
    } finally {
      await browser.close()
    }
  }, BROWSER_TIMEOUT_MS)

  test('resets the sample through the current browser session', async () => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    let method = ''
    await page.route('https://cekgu.test/**', async (route) => {
      if (route.request().url().endsWith('/api/sample/reset')) {
        method = route.request().method()
        await route.fulfill({ json: { reset: true } })
      } else {
        await route.fulfill({ contentType: 'text/html', body: '<main>Cekgu</main>' })
      }
    })
    await page.goto('https://cekgu.test')

    try {
      await resetSharedSample(page)
      expect(method).toBe('POST')
    } finally {
      await browser.close()
    }
  }, BROWSER_TIMEOUT_MS)
})
