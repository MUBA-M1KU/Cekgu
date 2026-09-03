import { expect, test } from '@playwright/test'

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

test('the sample record opens with its counts', async ({ page }) => {
  await page.goto('/sample')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/practice set/i)
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
