import { expect, test } from 'bun:test'

// env.ts reads process.env once at import, so the placeholders have to be in place before the
// route module is pulled in. They are stand-ins, not credentials: nothing here opens a connection.
process.env.DATABASE_URL = 'postgres://cekgu@localhost:5432/cekgu'
process.env.BETTER_AUTH_SECRET = 'placeholder'
process.env.GUEST_EMAIL = 'guest@example.invalid'
process.env.GUEST_PASSWORD = 'placeholder'
process.env.MASCOT_ENABLED = 'true'

const { healthRoutes } = await import('./health')

test('GET /health answers the shape the client reads the mascot flag from', async () => {
  const response = await healthRoutes.request('/health')

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ models: [], windowMinutes: 15, mascotEnabled: true })
})
