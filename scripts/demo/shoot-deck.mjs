// Captures each pitch deck slide as a still, from the HTML rather than the committed PDF: the PDF
// is stale against #233 and still carries the claim #224 removed (issue #237).
//
// Stills rather than a single screen recording, deliberately. Playwright's capture carries a
// variable lead-in, and the deck's slides are too uniformly dark for scene detection to recover the
// transitions, so a recording cannot be cut to the narration reliably. Stills give exact slide
// durations; assemble-deck.sh restores motion with a crossfade.
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const deck = process.env.DECK_HTML
const outDir = process.env.DECK_SHOTS
if (!deck || !outDir) throw new Error('set DECK_HTML and DECK_SHOTS')
mkdirSync(outDir, { recursive: true })

// The staggered reveals run about 600ms off .slide.active; this waits past the longest of them so
// every slide is captured fully arrived rather than mid-transition.
const settle = Number(process.env.DECK_SETTLE_MS ?? 1400)

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference'
})
const page = await context.newPage()
await page.goto(`file://${deck}`, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)

const count = await page.locator('section.slide').count()
process.stderr.write(`deck slides: ${count}\n`)

for (let index = 0; index < count; index += 1) {
  await page.waitForTimeout(settle)
  const active = await page.evaluate(() =>
    [...document.querySelectorAll('section.slide')].findIndex((el) => el.classList.contains('active'))
  )
  if (active !== index) throw new Error(`expected slide ${index + 1} active, found ${active + 1}`)
  const name = `slide-${index + 1}`
  await page.screenshot({ path: `${outDir}/${name}.png`, animations: 'disabled' })
  process.stderr.write(`  captured ${name}\n`)
  if (index < count - 1) await page.keyboard.press('ArrowRight')
}

await context.close()
await browser.close()
process.stdout.write(`${count}\n`)
