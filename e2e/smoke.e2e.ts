import { expect, type Page, test } from '@playwright/test'

// TRD section 18: the first three steps of the demo acceptance test, run against a real
// deployment. The steps that need screens which do not exist yet are marked below with the
// issue that unblocks them, so a green run never implies the demo path is covered.

// Assert rendered content, never that #root is attached: an attached root passes against a
// blank page, against a failed fetch rendered as an empty state, and against a React error
// boundary. It proves the bundle parsed, not that the product works.

test('the app renders its landing page', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.status()).toBe(200)
  // Not the heading's words: #45 rewrites product copy, and pinning it here would break on
  // a change that is not a regression.
  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
})

test('a client route falls back to the shell rather than 404ing', async ({ page }) => {
  const response = await page.goto('/records')

  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('an api path is refused without a session', async ({ request }) => {
  const response = await request.get('/api/nope')

  // The session gate answers before the catch-all, so an anonymous caller cannot tell
  // an unknown route from a real one.
  expect(response.status()).toBe(401)
})

test('sign in as guest returns a usable session', async ({ request }) => {
  const signIn = await request.post('/api/auth/guest')
  expect(signIn.status()).toBe(200)

  const session = await request.get('/api/auth/get-session')
  expect(session.status()).toBe(200)
  expect(await session.json()).toMatchObject({ user: expect.anything() })
})

test('an unknown api path answers json once signed in, not the shell', async ({ request }) => {
  await request.post('/api/auth/guest')

  const response = await request.get('/api/nope')

  expect(response.status()).toBe(404)
  expect(await response.json()).toMatchObject({ error: { code: 'not_found' } })
})

// FR-AUTH-2 and FR-AUTH-3, and the first step of the PRD demo acceptance test. The warning is
// asserted word for word because FR-AUTH-3 fixes the sentence; it is not ordinary product copy.
const GUEST_WARNING =
  'Shared demo workspace. Anything you add can be viewed or deleted by other guests. Do not enter real, personal or confidential exam content.'

test('sign in as guest lands in the guest workspace with the warning banner', async ({ page }) => {
  await page.goto('/sign-in')

  // FR-AUTH-3 requires the same sentence beside the button and again inside the workspace.
  await expect(page.getByText(GUEST_WARNING)).toBeVisible()

  await page.getByRole('button', { name: 'Sign In as Guest' }).click()

  await expect(page).toHaveURL(/\/records$/)
  await expect(page.getByText(GUEST_WARNING)).toBeVisible()
})

// The last three steps of the demo acceptance test, run signed out because that is the state a
// judge arrives in (FR-SAMPLE-4). Each asserts rendered content rather than chrome: the summary
// filters name all five verdicts from page load, so matching a verdict label proves nothing.
//
// One Show Evidence button is rendered per item, which makes it the honest way to count what the
// list is showing without depending on a wrapper element's shape.
const EVIDENCE = 'Show Evidence'

// A Clear item with no decision on it collapses to one line, so that the items actually asking
// something are not buried under nine that are not. Its evidence is still reachable — that is the
// product's whole provenance claim — but it is one click further in, so a count of the evidence
// buttons has to open the quiet rows first. Opening them is itself the assertion that every item
// can still be reached.
async function openEveryItem(page: Page): Promise<void> {
  // Wait for the list before counting: called straight after a goto, an empty count means the
  // items have not arrived yet rather than that they are all open, and the loop would exit having
  // opened nothing.
  await expect(page.getByRole('button', { name: /^Possible Key Error/ })).toBeVisible()
  const quiet = page.getByRole('button', { expanded: false }).filter({ hasText: /Clear/ })
  for (let n = await quiet.count(); n > 0; n = await quiet.count()) await quiet.first().click()
}

test('the sample record opens with its counts', async ({ page }) => {
  await page.goto('/sample')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/practice set/i)
  await openEveryItem(page)
  await expect(page.getByRole('button', { name: EVIDENCE })).toHaveCount(12)

  // The counts come from the seeded pass, so they are asserted as a set rather than as one number:
  // a rerun may legitimately change them, but they must always total the twelve items.
  const summary = page.getByRole('button', {
    name: /Possible Key Error|Possible Ambiguity|Split Opinion|Unverified|Clear/
  })
  const counts = (await summary.allTextContents()).map((text) => Number(text.replace(/\D+/g, '')))

  expect(counts).toHaveLength(5)
  expect(counts.reduce((total, n) => total + n, 0)).toBe(12)
  expect(counts.some((n) => n > 0)).toBe(true)
})

test('filtering to Possible Key Error narrows the item list', async ({ page }) => {
  await page.goto('/sample')
  await openEveryItem(page)
  await expect(page.getByRole('button', { name: EVIDENCE })).toHaveCount(12)

  const filter = page.getByRole('button', { name: /^Possible Key Error/ })
  const flagged = Number((await filter.textContent())?.replace(/\D+/g, '') ?? 0)
  expect(flagged).toBeGreaterThan(0)

  await filter.click()
  await expect(page.getByRole('button', { name: EVIDENCE })).toHaveCount(flagged)

  // The mis-keyed benchmark item is the one the demo turns on, so the filter must keep it.
  await expect(page.getByText(/first in, first out/i).first()).toBeVisible()
})

test('one evidence panel shows two model names and two request ids', async ({ page }) => {
  await page.goto('/sample')
  await page.getByRole('button', { name: /^Possible Key Error/ }).click()
  await page.getByRole('button', { name: EVIDENCE }).first().click()

  await expect(page.locator('a[href*="/v1/receipts/"]').first()).toBeVisible()

  const panel = await page.locator('body').innerText()
  const requestIds = [...new Set([...panel.matchAll(/req-\d+-\d+/g)].map((match) => match[0]))]
  const models = ['MiniMaxAI/MiniMax-M2.7', 'moonshotai/Kimi-K2.6', 'deepseek-ai/DeepSeek-V4-Flash-0731'].filter(
    (model) => panel.includes(model)
  )

  expect(requestIds.length).toBeGreaterThanOrEqual(2)
  expect(models.length).toBeGreaterThanOrEqual(2)

  // NFR-PROV-3: every id shown is checkable by the person reading it.
  const links = await page
    .locator('a[href*="/v1/receipts/"]')
    .evaluateAll((all) => all.map((a) => (a as HTMLAnchorElement).href))
  for (const id of requestIds) expect(links.some((href) => href.endsWith(id))).toBe(true)
})

// Reported by c3638: navigating away from a record blanked the whole app. Cause was a teardown
// order at the pixi/Live2D boundary — Application.destroy() destroys its ticker before the stage
// children, and Live2DModel.destroy() then calls ticker.remove() on a destroyed ticker. The throw
// landed in React's effect cleanup, which unmounted everything.
//
// It only fires with the animated stage mounted, which needs a viewport of 1024 px or more and
// MASCOT_ENABLED true. Desktop Chrome is 1280 wide, so CI reaches it. The canvas is asserted
// first and the test skips with a reason otherwise, because a run where the stage never mounted
// would pass this without exercising anything.
test('navigating away from a record with the mascot mounted keeps the app rendered', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('button', { name: 'Sign In as Guest' }).click()
  await expect(page).toHaveURL(/\/records$/)

  await page
    .getByText(/practice set/i)
    .first()
    .click()
  await expect(page).toHaveURL(/\/records\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('button', { name: EVIDENCE }).first()).toBeVisible()

  // Getting this readiness signal right took three attempts, and the two that failed both passed
  // against a deployment that still had the defect — worth recording, because a regression test
  // that passes against the bug is worse than none. Waiting for the canvas element resolves while
  // createStage() is still loading. Waiting for the textures resolves before motionPreload does.
  // Screenshotting the canvas is useless because backgroundAlpha is 0, so a blank one samples the
  // page behind it and never looks uniform.
  //
  // What actually gates createStage() is motionPreload: ALL, which fetches every motion file for
  // both cats before Live2DModel.from resolves. So the signal is /live2d/ traffic going quiet.
  const canvas = page.locator('canvas')
  let lastAsset = Date.now()
  page.on('response', (response) => {
    if (response.url().includes('/live2d/')) lastAsset = Date.now()
  })

  try {
    await canvas.waitFor({ state: 'attached', timeout: 20_000 })
    await expect.poll(() => Date.now() - lastAsset > 2000, { timeout: 40_000, intervals: [500] }).toBe(true)
  } catch {
    test.skip(true, 'the animated stage never loaded, so this deployment cannot reproduce the defect')
  }

  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error.message ?? error)))

  await page.getByRole('link', { name: 'Dashboard' }).first().click()

  // Rendered content, not #root: the point is that the tree survived, and a heading proves it.
  // The heading is matched by role rather than by its words. #175 made the dashboard's h1
  // state-aware — "Good to have you back." once the account holds a record, "Welcome to Cekgu."
  // before that — and the Guest workspace's records expire after 24 hours, so pinning either
  // string would make this test depend on the age of a fixture rather than on the tree surviving.
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Scoped to the rail. #175 added an All Records card to the dashboard, and getByRole matches the
  // accessible name as a substring, so an unscoped 'Records' now resolves to both and fails strict
  // mode. The rail is what this line was always checking: the shell around the page, still there.
  await expect(page.getByLabel('Workspace', { exact: true }).getByRole('link', { name: 'Records' })).toBeVisible()
  expect(errors).toEqual([])
})

// Third instance of one bug: #143 was two Sample Report links, and the breadcrumb read "Records"
// while navigating to /dashboard. A link whose name does not say where it goes is a defect whether
// or not anyone clicks it, and it makes getByRole ambiguous for whoever writes the next test. This
// asserts the class rather than either instance.
test('no two links in the workspace share a name and lead somewhere different', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('button', { name: 'Sign In as Guest' }).click()
  await expect(page).toHaveURL(/\/records$/)

  const collisions = await page.$$eval('a', (links) => {
    const byName = new Map()
    for (const el of links) {
      const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().toLowerCase()
      if (!name) continue
      const seen = byName.get(name) ?? new Set()
      seen.add(el.getAttribute('href') ?? '')
      byName.set(name, seen)
    }
    return [...byName.entries()]
      .filter(([, hrefs]) => hrefs.size > 1)
      .map(([name, hrefs]) => `${name} -> ${[...hrefs].join(' | ')}`)
  })

  expect(collisions).toEqual([])
})

// Issue #161 and c3638's report: an unauthenticated visitor was served the whole authenticated
// shell — rail, topbar and an account menu reading "Signed In" over an em dash — on a URL whose
// data could only ever 401. These assert the redirect and the absence of that chrome.
const APP_ROUTES = [
  '/dashboard',
  '/records',
  '/new-check',
  '/settings',
  // The deep link is the one people actually share, and it is the one c3638 reported: a record
  // they had deleted, opened in a browser that had never signed in. The id is deliberately one
  // that does not exist, because the guard is route-level and must not rest on the row surviving.
  '/records/00000000-0000-4000-8000-000000000000'
]

for (const route of APP_ROUTES) {
  test(`an unauthenticated visitor to ${route} is sent to sign in`, async ({ page }) => {
    await page.goto(route)

    await expect(page).toHaveURL(/\/sign-in$/)
    // The account menu is the specific thing that lied, so assert it is not on the page at all.
    await expect(page.locator('.app-avatar')).toHaveCount(0)
  })
}

test('signing in returns the visitor to the page they were refused', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/\/sign-in$/)

  await page.getByRole('button', { name: /guest/i }).first().click()

  await expect(page).toHaveURL(/\/settings$/, { timeout: 20000 })
})

// PRODUCT.md lists Terms, Privacy and Acceptable Use as a launch requirement. The contract worth
// holding is that a judge can reach all three from the product, so these assert hrefs and a
// rendered heading rather than the prose: the copy is a legal notice that will be revised, and the
// redesign in #44 rewrites the surface around it.
const NOTICES = ['/terms', '/privacy', '/acceptable-use']

test('every notice is reachable from Trust and Privacy', async ({ page }) => {
  await page.goto('/trust')

  // Scoped to the section: the footer carries the same three hrefs, so an unscoped locator
  // matches twice and fails on strict mode rather than on the thing being asserted.
  const trust = page.locator('#trust')
  for (const href of NOTICES) {
    await expect(trust.locator(`a[href="${href}"]`)).toBeVisible()
  }
})

for (const href of NOTICES) {
  test(`the notice at ${href} renders`, async ({ page }) => {
    const response = await page.goto(href)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
  })
}

test('the footer carries the notices on a page that is not the landing', async ({ page }) => {
  await page.goto('/sample')

  const footer = page.getByRole('navigation', { name: 'Footer' })
  for (const href of NOTICES) {
    await expect(footer.locator(`a[href="${href}"]`)).toBeVisible()
  }
})
