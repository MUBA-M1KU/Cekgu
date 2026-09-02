import { expect, test } from '@playwright/test'

// TRD section 18: the first three steps of the demo acceptance test, run against a real
// deployment. The steps that need screens which do not exist yet are marked below with the
// issue that unblocks them, so a green run never implies the demo path is covered.

test('the app serves its shell', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.status()).toBe(200)
  await expect(page.locator('#root')).toBeAttached()
})

test('a client route falls back to the shell rather than 404ing', async ({ page }) => {
  const response = await page.goto('/records')

  expect(response?.status()).toBe(200)
  await expect(page.locator('#root')).toBeAttached()
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

// Blocked on the screens, not on this file. Each becomes a real assertion when its issue lands.
test.fixme('the guest workspace shows the warning banner', async () => {
  // Needs the app shell and the Guest banner: #32.
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
