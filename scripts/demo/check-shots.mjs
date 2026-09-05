import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const DEFAULT_URL = 'https://cekgu-op7lf5dspq-as.a.run.app'
const GUEST_WARNING =
  'Shared demo workspace. Anything you add can be viewed or deleted by other guests. Do not enter real, personal or confidential exam content.'
const SAMPLE_TITLE = 'Introductory computer science practice set'
const FIFO_STEM = 'Which data structure removes elements in first in, first out order?'
const ATTEMPTS_FOOTER = 'Every attempt is listed, admitted or not'

export function exactText(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^\\s*${escaped}\\s*$`, 'i')
}

export function exitCodeFor(results) {
  return results.some((result) => result.status === 'ABSENT') ? 1 : 0
}

export async function locatorIsVisible(locator, timeout) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

export function correctedKeyOption(container, letter) {
  return container.locator('label').filter({ hasText: exactText(letter) })
}

export function formatCheckTable(results) {
  const headings = ['SHOT', 'ANCHOR', 'STATUS', 'RESOLVED SELECTOR']
  const rows = results.map((result) => [String(result.shot), result.anchor, result.status, result.selector])
  const widths = headings.map((heading, index) =>
    Math.max(heading.length, ...rows.map((row) => row[index]?.length ?? 0))
  )
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join(' | ')
  return [render(headings), widths.map((width) => '-'.repeat(width)).join('-|-'), ...rows.map(render)].join('\n')
}

export async function runShotChecks(options = {}) {
  const baseUrl = options.baseUrl ?? process.env.DEMO_URL ?? DEFAULT_URL
  const timeout = Number(options.timeout ?? process.env.DEMO_TIMEOUT_MS ?? 30_000)
  const browser = await chromium.launch({ channel: process.env.DEMO_BROWSER_CHANNEL ?? 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()
  page.setDefaultTimeout(timeout)

  const results = []
  const add = (shot, anchor, present, selector) => {
    results.push({ shot, anchor, status: present ? 'PRESENT' : 'ABSENT', selector })
  }
  const check = async (shot, anchor, selector, locator, predicate) => {
    if (!(await locatorIsVisible(locator, timeout))) {
      add(shot, anchor, false, selector)
      return false
    }
    const present = predicate ? await predicate(locator).catch(() => false) : true
    add(shot, anchor, present, selector)
    return present
  }

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await check(
      1,
      'Cekgu wordmark',
      "role=link[name='Cekgu, home' i]",
      page.getByRole('link', { name: /Cekgu, home/i })
    )
    await check(
      1,
      'Hero line',
      "role=heading[name='Two readers see your paper before your learners do.' i]",
      page.getByRole('heading', { name: exactText('Two readers see your paper before your learners do.') })
    )
    const tryCekgu = page.getByRole('link', { name: exactText('Try Cekgu Free') })
    await check(1, 'Try Cekgu Free', "role=link[name='Try Cekgu Free' i]", tryCekgu)

    if (await tryCekgu.isVisible().catch(() => false)) {
      await tryCekgu.click()
      await page.waitForURL(/\/sign-in(?:[/?#]|$)/)
    }

    await check(
      2,
      'Sign-in screen',
      "role=heading[name='Sign In' i]",
      page.getByRole('heading', { name: exactText('Sign In') })
    )
    const guestButton = page.getByRole('button', { name: exactText('Sign In as Guest') })
    await check(2, 'Sign In as Guest', "role=button[name='Sign In as Guest' i]", guestButton)
    await check(2, 'Guest warning', `text=${GUEST_WARNING}`, page.getByText(exactText(GUEST_WARNING)))

    if (await guestButton.isVisible().catch(() => false)) {
      await guestButton.click()
      // SignIn.tsx:103 sends a guest with no saved destination to /dashboard; it was /records when
      // this gate was written. The shot list still films Records, so the walk goes there explicitly
      // rather than asserting wherever sign-in happens to land this week.
      await page.waitForURL(/\/(dashboard|records)(?:[/?#]|$)/)
      await page.getByRole('link', { name: exactText('Records') }).click()
      await page.waitForURL(/\/records(?:[/?#]|$)/)
      await page.getByRole('heading', { name: exactText('Records') }).waitFor()
    }

    const drawer = page.locator('.guest-drawer')
    await check(2, 'Shared-workspace drawer', '.guest-drawer', drawer)
    await check(
      2,
      'Drawer dismiss control',
      "role=button[name='Dismiss the shared workspace notice' i]",
      page.getByRole('button', { name: exactText('Dismiss the shared workspace notice') })
    )
    for (const label of ['Dashboard', 'New Check', 'Records', 'Settings']) {
      await check(
        2,
        `${label} sidebar link`,
        `role=link[name='${label}' i]`,
        page.getByRole('link', { name: exactText(label) })
      )
    }

    let reset = false
    try {
      reset = await page.evaluate(async () => {
        const response = await fetch('/api/sample/reset', { method: 'POST' })
        const body = await response.json()
        return response.ok && body.reset === true
      })
    } catch {
      reset = false
    }
    add(3, 'Shared sample reset', reset, 'POST /api/sample/reset')

    const dismiss = page.getByRole('button', { name: exactText('Dismiss the shared workspace notice') })
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click()

    const search = page.locator('#q')
    await check(3, 'Search records', '#q', search)
    if (await search.isVisible().catch(() => false)) {
      await search.fill('Introductory')
      await page.waitForTimeout(500)
    }

    const sampleRow = page.getByRole('button', { name: exactText(SAMPLE_TITLE) })
    await check(3, 'Sample record title', `role=button[name='${SAMPLE_TITLE}' i]`, sampleRow)
    await check(3, 'Sample chip', "text='Sample' i", page.getByText(exactText('Sample')))

    if (await sampleRow.isVisible().catch(() => false)) {
      await sampleRow.click()
      await page.waitForURL(/\/records\/[^/?#]+/)
      await page.getByRole('heading', { name: exactText(SAMPLE_TITLE) }).waitFor()
    }

    await check(
      3,
      'Summary heading',
      "role=heading[name='Summary' i]",
      page.getByRole('heading', { name: exactText('Summary') })
    )
    const chipPatterns = [
      ['Possible Key Error 2', /^\s*Possible\s+Key\s+Error\s*2\s*$/i],
      ['Possible Ambiguity 1', /^\s*Possible\s+Ambiguity\s*1\s*$/i],
      ['Split Opinion 0', /^\s*Split\s+Opinion\s*0\s*$/i],
      ['Unverified 0', /^\s*Unverified\s*0\s*$/i],
      ['Clear 9', /^\s*Clear\s*9\s*$/i]
    ]
    for (const [label, pattern] of chipPatterns) {
      await check(3, label, `role=button[name='${label}' i]`, page.getByRole('button', { name: pattern }))
    }

    const keyErrorFilter = page.getByRole('button', { name: chipPatterns[0][1] })
    if (await keyErrorFilter.isVisible().catch(() => false)) await keyErrorFilter.click()

    const item = page
      .locator('li')
      .filter({ has: page.getByText(exactText(FIFO_STEM)) })
      .first()
    await check(4, 'FIFO question', `li:has-text('${FIFO_STEM}')`, item)
    await check(
      4,
      'Key A and both readers B',
      "role=img[name='Key A. Both readers chose B.' i]",
      item.getByRole('img', { name: exactText('Key A. Both readers chose B.') })
    )
    const showEvidence = item.getByRole('button', { name: exactText('Show Evidence') })
    await check(4, 'Show Evidence', "role=button[name='Show Evidence' i]", showEvidence)
    if (await showEvidence.isVisible().catch(() => false)) await showEvidence.click()

    await check(5, 'Reader A', "text='Reader A' i", item.getByText(exactText('Reader A')))
    await check(5, 'Reader B', "text='Reader B' i", item.getByText(exactText('Reader B')))
    await check(
      5,
      'Kimi served model',
      "text='moonshotai/Kimi-K2.6' i",
      item.getByText(exactText('moonshotai/Kimi-K2.6'))
    )
    await check(
      5,
      'MiniMax served model',
      "text='MiniMaxAI/MiniMax-M2.7' i",
      item.getByText(exactText('MiniMaxAI/MiniMax-M2.7'))
    )
    await check(
      5,
      'Served Model labels',
      "text='Served Model' i (count >= 2)",
      item.getByText(exactText('Served Model')),
      async (locator) => {
        return (await locator.count()) >= 2
      }
    )
    const requestIds = item.locator('dt', { hasText: exactText('Request Id') }).locator('+ dd')
    await check(
      5,
      'Two distinct Request Id values',
      "dt:has-text('Request Id' i) + dd",
      requestIds,
      async (locator) => {
        const values = (await locator.allTextContents()).map((value) => value.trim()).filter(Boolean)
        return values.length >= 2 && new Set(values).size === values.length
      }
    )
    const receipts = item.locator('dt', { hasText: exactText('Receipt') }).locator('+ dd')
    await check(5, 'Verified reader receipts', "dt:has-text('Receipt' i) + dd", receipts, async (locator) => {
      const values = (await locator.allTextContents()).map((value) => value.trim())
      return values.length >= 2 && values.every((value) => exactText('Verified').test(value))
    })

    await check(
      6,
      'All Attempts heading',
      "role=heading[name='All Attempts' i]",
      item.getByRole('heading', { name: exactText('All Attempts') })
    )
    await check(
      6,
      'Two Admitted attempts',
      "text='Admitted' i (count >= 2)",
      item.getByText(exactText('Admitted')),
      async (locator) => {
        return (await locator.count()) >= 2
      }
    )
    await check(6, 'Timed Out attempt', "text='Timed Out' i", item.getByText(exactText('Timed Out')))
    // Shot 6 used to check for "The call passed the 90 second evidence cutoff." on the timed-out
    // row. #202 removed every per-attempt reason from this table at the owner's request; the string
    // is still on the record the API returns, but nothing renders it. The Status chip is what names
    // a failed attempt now, and it is checked directly above. The footer is checked here instead
    // because it carries the claim the shot is actually about - that nothing was hidden.
    await check(6, 'Attempts footer', `text='${ATTEMPTS_FOOTER}' i`, item.getByText(new RegExp(ATTEMPTS_FOOTER, 'i')))

    const keyCorrected = item.getByText(exactText('Key Corrected'))
    await check(7, 'Key Corrected', "text='Key Corrected' i", keyCorrected)
    if (await keyCorrected.isVisible().catch(() => false)) await keyCorrected.click()
    const correctedKey = item.locator('.disposition-key')
    await check(7, 'Corrected Key', ".disposition-key:has-text('Corrected Key' i)", correctedKey)
    const correctedB = correctedKeyOption(correctedKey, 'B')
    await check(7, 'Corrected key B', ".disposition-key label:has-text('B' i)", correctedB)
    if (await correctedB.isVisible().catch(() => false)) await correctedB.click()
    await check(
      7,
      'Record Decision',
      "role=button[name='Record Decision' i]:enabled",
      item.getByRole('button', { name: exactText('Record Decision') }),
      async (locator) => (await locator.isVisible()) && (await locator.isEnabled())
    )

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await check(
      8,
      'Return hero line',
      "role=heading[name='Two readers see your paper before your learners do.' i]",
      page.getByRole('heading', { name: exactText('Two readers see your paper before your learners do.') })
    )
    await check(
      9,
      'Closing Cekgu wordmark',
      "role=link[name='Cekgu, home' i]",
      page.getByRole('link', { name: /Cekgu, home/i })
    )
    add(9, 'Deployed URL', new URL(page.url()).host === new URL(baseUrl).host, 'document.location.host')
  } finally {
    await context.close()
    await browser.close()
  }

  return results
}

async function main() {
  const results = await runShotChecks()
  console.log(formatCheckTable(results))
  const missing = results.filter((result) => result.status === 'ABSENT')
  if (missing.length > 0)
    console.error(`\n${missing.length} required shot anchor${missing.length === 1 ? '' : 's'} absent.`)
  process.exitCode = exitCodeFor(results)
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : ''
if (entry === import.meta.url) await main()
