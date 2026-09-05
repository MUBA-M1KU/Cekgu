import { createInterface } from 'node:readline'
import { chromium, type Page } from 'playwright'

const BASE_URL = process.env.DEMO_BASE_URL ?? 'https://cekgu-op7lf5dspq-as.a.run.app'
const TOTAL_MS = 120_000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function at(start: number, offset: number) {
  const remaining = offset - (performance.now() - start)
  if (remaining > 0) await sleep(remaining)
}

async function resetSample(page: Page) {
  const result = await page.evaluate(async () => {
    const response = await fetch('/api/sample/reset', { method: 'POST' })
    if (!response.ok) throw new Error(`Reset failed with status ${response.status}`)
    return (await response.json()) as { reset?: boolean }
  })
  if (!result.reset) throw new Error('The protected Sample could not be reset.')
}

async function waitForStart() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  console.log('READY: Chromium is on the landing page. Type start and press Enter to record.')
  await new Promise<void>((resolve) => {
    rl.on('line', (line) => {
      if (line.trim() === 'start') {
        rl.close()
        resolve()
      }
    })
  })
}

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized', '--incognito']
})

try {
  // Use the real maximised window instead of emulating 1920x1080. A forced viewport can render
  // wider than the user's display and hide the right side of the responsive layout.
  const context = await browser.newContext({ viewport: null })
  const page = await context.newPage()

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Try Cekgu Free' }).waitFor()
  console.log(`VIEWPORT: ${await page.evaluate(() => `${window.innerWidth}x${window.innerHeight}`)}`)

  // Establish the clean Guest session and reset the shared Sample before recording starts. This
  // keeps the reset out of the captured timeline while still using the same isolated context.
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Sign In as Guest' }).click()
  await page.waitForURL(/\/dashboard$/)
  await resetSample(page)
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Try Cekgu Free' }).waitFor()
  await waitForStart()

  const start = performance.now()

  // Shot 1: landing page, 0:00-0:13.
  await at(start, 12_500)
  await page.getByRole('link', { name: 'Try Cekgu Free' }).click()

  // Shot 2: sign-in and the shared Guest warning, 0:13-0:24.
  await at(start, 15_500)
  await page.getByRole('button', { name: 'Sign In as Guest' }).click()
  await page.waitForURL(/\/dashboard$/)

  // Shot 3: search for the protected Sample and show its summary, 0:24-0:37.
  await at(start, 24_000)
  await page.getByLabel('Workspace', { exact: true }).getByRole('link', { name: 'Records' }).click()
  await page.waitForURL(/\/records$/)
  await page.locator('#q').fill('Introductory')
  await page.getByText('Introductory computer science practice set', { exact: true }).first().click()
  await page.waitForURL(/\/records\/[0-9a-f-]{36}$/)

  // Shot 4: narrow to Possible Key Error and open the FIFO item, 0:37-0:54.
  await at(start, 37_000)
  await page.getByRole('button', { name: /^Possible Key Error/ }).click()
  const item = page.locator('li').filter({ hasText: /first in, first out/i })
  await item.getByRole('button', { name: 'Show Evidence' }).click()

  // Shot 5: hold the two readers, served models, request ids and verified receipts, 0:54-1:14.
  await at(start, 54_000)
  await item.getByText('Reader A').scrollIntoViewIfNeeded()

  // Shot 6: show the recorded timeout in All Attempts, 1:14-1:28.
  await at(start, 74_000)
  await item.getByText('ALL ATTEMPTS').scrollIntoViewIfNeeded()

  // Shot 7: record the educator's decision without changing the machine verdict, 1:28-1:41.
  await at(start, 88_000)
  await item.getByText('Key Corrected').click()
  await item.getByRole('group', { name: 'Corrected key' }).locator('label').filter({ hasText: /^B$/ }).click()
  await item.getByRole('button', { name: 'Record Decision' }).click()
  await item.getByText('Possible Key Error').first().waitFor()

  // Shot 8 and 9: return to the landing hero and hold the brand plus URL, 1:41-2:00.
  await at(start, 101_000)
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Try Cekgu Free' }).waitFor()
  await at(start, TOTAL_MS)

  // Write beats.json with timeline offsets.
  const beats = [
    { name: 'shot-1', ms: 0 },
    { name: 'shot-2', ms: 12_500 },
    { name: 'shot-3', ms: 15_500 },
    { name: 'shot-4', ms: 24_000 },
    { name: 'shot-5', ms: 37_000 },
    { name: 'shot-6', ms: 54_000 },
    { name: 'shot-7', ms: 74_000 },
    { name: 'shot-8', ms: 88_000 },
    { name: 'shot-9', ms: 101_000 },
    { name: 'end', ms: TOTAL_MS }
  ]

  const { writeFileSync } = await import('node:fs')
  const { dirname } = await import('node:path')
  const outputDir = dirname(new URL(import.meta.url).pathname.slice(1))
  const beatsPath = `${outputDir}/demo/beats.json`

  writeFileSync(beatsPath, JSON.stringify(beats, null, 2))
  console.log('DONE: 120-second demo timeline completed.')
} finally {
  await browser.close()
  process.exit(0)
}
