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

test.fixme('the sample record opens with its counts', async () => {
  // Needs the seeded sample (#30) and the Record Review page (#34).
})

test.fixme('filtering to Possible Key Error narrows the item list', async () => {
  // Needs the Record Review filters: #34.
})

test.fixme('one evidence panel shows two model names and two request ids', async () => {
  // Needs the Item Evidence view (#35) over provenance from #25 and #29.
})
