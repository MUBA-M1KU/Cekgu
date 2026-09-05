import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { correctedKeyOption, exactText, locatorIsVisible } from './check-shots.mjs'

const DEFAULT_URL = 'https://cekgu-op7lf5dspq-as.a.run.app'
const SAMPLE_TITLE = 'Introductory computer science practice set'
const FIFO_STEM = 'Which data structure removes elements in first in, first out order?'
const SHOT_NAMES = Array.from({ length: 9 }, (_, index) => `shot-${index + 1}`)
const REQUIRED_BEATS = [...SHOT_NAMES, 'end']

export function assertCompleteTake(beats) {
  for (const name of REQUIRED_BEATS) {
    if (!beats.some((beat) => beat.name === name)) throw new Error(`take is missing required beat ${name}`)
  }

  const ordered = REQUIRED_BEATS.map((name) => beats.find((beat) => beat.name === name))
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].ms <= ordered[index - 1].ms) throw new Error('required beats must be strictly increasing')
  }
}

export function normalizedBeatOffsets(beats) {
  assertCompleteTake(beats)
  const first = beats.find((beat) => beat.name === 'shot-1').ms
  return beats.filter((beat) => beat.ms >= first).map((beat) => ({ ...beat, ms: beat.ms - first }))
}

export function servedModelLabel(container, model) {
  return container.locator('p.type-mono').filter({ hasText: exactText(model) })
}

export function attemptStatusLabel(container, status) {
  return container.getByRole('table').getByText(exactText(status))
}

export function decisionChoice(container, label) {
  return container.locator('.disposition label').filter({ hasText: exactText(label) })
}

export async function resetSharedSample(page) {
  const reset = await page.evaluate(async () => {
    const response = await fetch('/api/sample/reset', { method: 'POST' })
    const body = await response.json()
    return response.ok && body.reset === true
  })
  if (!reset) throw new Error('shared sample reset failed')
}

export async function frameBelowHeader(page, locator, top = 120, settleMs = 1_050) {
  await locator.waitFor({ state: 'visible' })
  await locator.evaluate((element, targetTop) => {
    window.scrollBy({ top: element.getBoundingClientRect().top - targetTop, behavior: 'smooth' })
  }, top)
  await page.waitForTimeout(settleMs)
}

async function installCursor(page) {
  await page.addInitScript(() => {
    const attach = () => {
      if (document.querySelector('#cekgu-demo-cursor')) return
      const style = document.createElement('style')
      style.textContent = `
        #cekgu-demo-cursor {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 2147483647;
          width: 22px;
          height: 22px;
          border: 2px solid rgba(18, 24, 31, 0.92);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 1px 4px rgba(18, 24, 31, 0.24);
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: width 120ms ease, height 120ms ease, background 120ms ease;
        }
        #cekgu-demo-cursor[data-down='true'] {
          width: 16px;
          height: 16px;
          background: rgba(18, 24, 31, 0.28);
        }
      `
      const cursor = document.createElement('div')
      cursor.id = 'cekgu-demo-cursor'
      document.head.append(style)
      document.body.append(cursor)
      document.addEventListener('mousemove', (event) => {
        cursor.style.left = `${event.clientX}px`
        cursor.style.top = `${event.clientY}px`
      })
      document.addEventListener('mousedown', () => {
        cursor.dataset.down = 'true'
      })
      document.addEventListener('mouseup', () => {
        delete cursor.dataset.down
      })
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, { once: true })
    else attach()
  })
}

async function resetSample(browser, baseUrl, timeout) {
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(timeout)

  try {
    await page.goto(new URL('/sign-in', baseUrl).href, { waitUntil: 'networkidle' })
    const result = await page.evaluate(async () => {
      const signIn = await fetch('/api/auth/guest', { method: 'POST', credentials: 'include' })
      if (!signIn.ok) return { ok: false, stage: 'guest sign-in', status: signIn.status }
      const reset = await fetch('/api/sample/reset', { method: 'POST' })
      const body = await reset.json()
      return { ok: reset.ok && body.reset === true, stage: 'sample reset', status: reset.status }
    })
    if (!result.ok) throw new Error(`${result.stage} failed with HTTP ${result.status}`)
    console.log('sample reset: true')
  } finally {
    await context.close()
  }
}

export async function recordDemo(options = {}) {
  const baseUrl = options.baseUrl ?? process.env.DEMO_URL ?? DEFAULT_URL
  const demoDir = options.demoDir ?? process.env.DEMO_DIR ?? join(tmpdir(), 'cekgu-demo')
  const timeout = Number(options.timeout ?? process.env.DEMO_TIMEOUT_MS ?? 30_000)
  const headless = process.env.DEMO_HEADLESS !== 'false'
  const stills = process.env.DEMO_STILLS !== '0'
  const videoDir = join(demoDir, 'playwright-video')
  const frameDir = join(demoDir, 'frames')
  const capturePath = join(demoDir, 'capture.webm')

  mkdirSync(demoDir, { recursive: true })
  rmSync(videoDir, { recursive: true, force: true })
  rmSync(frameDir, { recursive: true, force: true })
  rmSync(capturePath, { force: true })
  mkdirSync(videoDir, { recursive: true })
  if (stills) mkdirSync(frameDir, { recursive: true })

  const browser = await chromium.launch({
    channel: process.env.DEMO_BROWSER_CHANNEL ?? 'chrome',
    headless
  })
  await resetSample(browser, baseUrl, timeout)

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } }
  })
  const page = await context.newPage()
  page.setDefaultTimeout(timeout)
  await installCursor(page)

  const video = page.video()
  const captureStarted = Date.now()
  const beats = []
  const errors = []
  let pointer = { x: 1740, y: 980 }
  let failure = null

  page.on('pageerror', (error) => errors.push(String(error).slice(0, 240)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text().slice(0, 240))
  })

  const elapsed = () => Date.now() - captureStarted
  const pause = (ms) => page.waitForTimeout(ms)
  const must = async (locator, name) => {
    if (!(await locatorIsVisible(locator, timeout))) throw new Error(`required recording anchor is absent: ${name}`)
    return locator
  }
  const mark = async (name) => {
    const ms = elapsed()
    beats.push({ name, ms })
    console.log(`${String(ms).padStart(6)}ms  ${name}`)
    if (stills) await page.screenshot({ path: join(frameDir, `${name}.png`) })
  }
  const finishShot = async (name, durationMs) => {
    const start = beats.find((beat) => beat.name === name)?.ms
    if (start === undefined) throw new Error(`cannot pace missing beat ${name}`)
    const remaining = start + durationMs - elapsed()
    if (remaining > 0) await pause(remaining)
  }
  const moveTo = async (locator, duration = 720) => {
    await must(locator, 'pointer target')
    await locator.scrollIntoViewIfNeeded()
    const box = await locator.boundingBox()
    if (!box) throw new Error('pointer target has no bounding box')
    const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    const steps = Math.max(1, Math.round(duration / 24))
    const origin = pointer
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps
      const eased = ratio < 0.5 ? 2 * ratio * ratio : 1 - (-2 * ratio + 2) ** 2 / 2
      const x = origin.x + (target.x - origin.x) * eased
      const y = origin.y + (target.y - origin.y) * eased
      await page.mouse.move(x, y)
      await pause(24)
    }
    pointer = target
  }
  const click = async (locator, after = 650) => {
    await moveTo(locator)
    await pause(320)
    await page.mouse.down()
    await pause(110)
    await page.mouse.up()
    await pause(after)
  }
  const type = async (locator, text) => {
    await click(locator, 250)
    await page.keyboard.type(text, { delay: 105 })
    await pause(500)
  }
  const scrollTo = async (locator, block = 'center') => {
    await must(locator, 'scroll target')
    await locator.evaluate((element, align) => element.scrollIntoView({ behavior: 'smooth', block: align }), block)
    await pause(1_050)
  }

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    const hero = page.getByRole('heading', { name: exactText('Two readers see your paper before your learners do.') })
    const tryCekgu = page.getByRole('link', { name: exactText('Try Cekgu Free') })
    await must(hero, 'shot 1 hero line')
    await must(tryCekgu, 'shot 1 Try Cekgu Free')
    await page.mouse.move(pointer.x, pointer.y)
    await pause(1_000)
    await mark('shot-1')
    await pause(5_200)
    await moveTo(tryCekgu, 900)
    await pause(2_000)
    await click(tryCekgu, 450)
    await must(page.getByRole('heading', { name: exactText('Sign In') }), 'shot 2 sign-in heading')
    await finishShot('shot-1', 13_000)

    await mark('shot-2')
    await pause(2_600)
    const guestButton = page.getByRole('button', { name: exactText('Sign In as Guest') })
    await must(guestButton, 'shot 2 Sign In as Guest')
    await click(guestButton, 500)
    // A guest with no saved destination lands on /dashboard since SignIn.tsx:103 changed; it used to
    // be /records. The walk holds there long enough to read, then takes the sidebar to Records, which
    // is where the shot list continues. Clicking the link rather than pushing the URL keeps the rail
    // visibly doing its job, and the shot needs a post-auth page on screen either way.
    await page.waitForURL(/\/(dashboard|records)(?:[/?#]|$)/)
    if (new URL(page.url()).pathname.startsWith('/dashboard')) {
      await pause(2_400)
      await click(page.getByRole('link', { name: exactText('Records') }), 500)
      await page.waitForURL(/\/records(?:[/?#]|$)/)
    }
    await must(page.locator('.guest-drawer'), 'shot 2 shared-workspace drawer')
    await resetSharedSample(page)
    await pause(1_900)
    const dismiss = page.getByRole('button', { name: exactText('Dismiss the shared workspace notice') })
    await click(dismiss, 450)
    await finishShot('shot-2', 11_000)

    await mark('shot-3')
    const search = page.locator('#q')
    await type(search, 'Introductory')
    const sampleRow = page.getByRole('button', { name: exactText(SAMPLE_TITLE) })
    await must(sampleRow, 'shot 3 sample record')
    await pause(900)
    await resetSharedSample(page)
    await click(sampleRow, 500)
    await page.waitForURL(/\/records\/[^/?#]+/)
    await must(page.getByRole('heading', { name: exactText('Summary') }), 'shot 3 Summary')
    await must(page.getByRole('button', { name: /^\s*Possible\s+Key\s+Error\s*2\s*$/i }), 'shot 3 Possible Key Error 2')
    const item = page
      .locator('li')
      .filter({ has: page.getByText(exactText(FIFO_STEM)) })
      .first()
    await must(decisionChoice(item, 'Key Corrected'), 'shot 7 clean decision control')
    await pause(2_000)
    await finishShot('shot-3', 13_000)

    await mark('shot-4')
    const keyErrorFilter = page.getByRole('button', { name: /^\s*Possible\s+Key\s+Error\s*2\s*$/i })
    await click(keyErrorFilter, 500)
    await must(item, 'shot 4 FIFO question')
    await scrollTo(item)
    await must(item.getByRole('img', { name: exactText('Key A. Both readers chose B.') }), 'shot 4 answer bubbles')
    await pause(4_000)
    const showEvidence = item.getByRole('button', { name: exactText('Show Evidence') })
    await click(showEvidence, 650)
    const readerA = item.getByText(exactText('Reader A'))
    await must(readerA, 'shot 5 Reader A')
    await frameBelowHeader(page, readerA, 130)
    await finishShot('shot-4', 17_000)

    await mark('shot-5')
    const kimi = servedModelLabel(item, 'moonshotai/Kimi-K2.6')
    const minimax = servedModelLabel(item, 'MiniMaxAI/MiniMax-M2.7')
    const requestIds = item.locator('dt', { hasText: exactText('Request Id') }).locator('+ dd')
    const receipts = item.locator('dt', { hasText: exactText('Receipt') }).locator('+ dd')
    await must(kimi, 'shot 5 Kimi served model')
    await must(minimax, 'shot 5 MiniMax served model')
    if ((await requestIds.count()) < 2) throw new Error('shot 5 requires two Request Id values')
    if ((await receipts.count()) < 2) throw new Error('shot 5 requires two Receipt values')
    await pause(2_200)
    await moveTo(kimi, 650)
    await pause(2_100)
    await moveTo(minimax, 650)
    await pause(2_100)
    await moveTo(requestIds.nth(0), 650)
    await pause(2_100)
    await moveTo(requestIds.nth(1), 650)
    await pause(2_100)
    await moveTo(receipts.nth(1), 650)
    await finishShot('shot-5', 20_000)

    await mark('shot-6')
    const allAttempts = item.getByRole('heading', { name: exactText('All Attempts') })
    await scrollTo(allAttempts, 'start')
    const timedOut = attemptStatusLabel(item, 'Timed Out')
    // The per-attempt reason this shot used to rest on was removed in #202 at the owner's request,
    // and the footer sentence that replaced it has since moved onto the heading as a tooltip. So the
    // camera holds on the Status chip, then rests on the mark beside All Attempts until the rule
    // appears under the pointer. Hovering is the shot now: the sentence arrives because the viewer
    // watched someone ask for it, which reads better than a paragraph that was always there.
    const attemptsRule = item.locator('.attempts-tip').first()
    await must(timedOut, 'shot 6 Timed Out')
    await must(attemptsRule, 'shot 6 attempts rule')
    await moveTo(timedOut, 700)
    await pause(3_000)
    await scrollTo(attemptsRule, 'center')
    await moveTo(attemptsRule, 700)
    // Long enough for the tooltip to fade up and be read, which a 2 s hold was not.
    await pause(3_200)
    await finishShot('shot-6', 14_000)

    await mark('shot-7')
    const keyCorrected = decisionChoice(item, 'Key Corrected')
    await scrollTo(keyCorrected, 'center')
    await click(keyCorrected, 500)
    const correctedKey = item.locator('.disposition-key')
    await must(correctedKey, 'shot 7 Corrected Key')
    const correctedB = correctedKeyOption(correctedKey, 'B')
    await click(correctedB, 450)
    const recordDecision = item.getByRole('button', { name: exactText('Record Decision') })
    await must(recordDecision, 'shot 7 Record Decision')
    await pause(650)
    await click(recordDecision, 500)
    await must(
      item.getByText(exactText('You corrected the key to B. The machine verdict above is unchanged.')),
      'shot 8 corrected key result'
    )
    await scrollTo(item, 'center')
    await finishShot('shot-7', 13_000)

    await mark('shot-8')
    await pause(4_000)
    const previousFrame = await page.screenshot({ type: 'jpeg', quality: 86 })
    const frameUrl = `data:image/jpeg;base64,${previousFrame.toString('base64')}`
    await page.evaluate(
      ({ image }) => {
        const overlay = document.createElement('img')
        overlay.id = 'cekgu-demo-dissolve'
        overlay.src = image
        overlay.alt = ''
        Object.assign(overlay.style, {
          position: 'fixed',
          inset: '0',
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: '2147483646',
          pointerEvents: 'none',
          opacity: '1',
          transition: 'opacity 2200ms ease-in-out'
        })
        document.body.append(overlay)
        window.history.pushState({}, '', '/')
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
      },
      { image: frameUrl }
    )
    await must(
      page.getByRole('heading', { name: exactText('Two readers see your paper before your learners do.') }),
      'shot 8 return hero'
    )
    await pause(450)
    await page.evaluate(() => {
      const overlay = document.querySelector('#cekgu-demo-dissolve')
      if (overlay instanceof HTMLElement) overlay.style.opacity = '0'
    })
    await pause(2_350)
    await page.evaluate(() => document.querySelector('#cekgu-demo-dissolve')?.remove())
    await finishShot('shot-8', 13_000)

    await page.evaluate((label) => {
      const url = document.createElement('div')
      url.id = 'cekgu-demo-url'
      url.textContent = label
      Object.assign(url.style, {
        position: 'fixed',
        left: '50%',
        bottom: '38px',
        zIndex: '2147483646',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        border: '1px solid rgba(18, 24, 31, 0.2)',
        borderRadius: '999px',
        background: 'rgba(255, 255, 255, 0.92)',
        boxShadow: '0 8px 24px rgba(18, 24, 31, 0.12)',
        color: '#12181f',
        font: '500 21px/1.2 ui-sans-serif, system-ui, sans-serif',
        letterSpacing: '0.01em',
        pointerEvents: 'none'
      })
      document.body.append(url)
    }, new URL(baseUrl).host)
    await page.mouse.move(1770, 980, { steps: 24 })
    pointer = { x: 1770, y: 980 }
    await mark('shot-9')
    await finishShot('shot-9', 6_000)
    await mark('end')
    assertCompleteTake(beats)
  } catch (error) {
    failure = error
  } finally {
    await context.close()
    await browser.close()
    if (video) renameSync(await video.path(), capturePath)
    writeFileSync(join(demoDir, 'beats.json'), `${JSON.stringify(beats, null, 2)}\n`)
  }

  console.log(`video: ${capturePath}`)
  console.log(`beats: ${join(demoDir, 'beats.json')}`)
  console.log(`console errors: ${errors.length}`)
  for (const error of errors.slice(0, 5)) console.log(`  ! ${error}`)
  if (failure) throw failure
  return { capturePath, beats, errors }
}

async function main() {
  try {
    await recordDemo()
  } catch (error) {
    console.error(`recording failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : ''
if (entry === import.meta.url) await main()
