import { expect, test } from 'bun:test'

// The environment comes from test-env.ts, preloaded by bunfig.toml, because env.ts snapshots
// process.env at first import and one test file cannot own that for the whole suite.

const { healthRoutes } = await import('./health')

test('GET /health answers the shape the client reads the mascot flag from', async () => {
  const response = await healthRoutes.request('/health')

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ models: [], windowMinutes: 15, mascotEnabled: true })
})
