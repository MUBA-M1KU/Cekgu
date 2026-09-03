import { expect, test } from 'bun:test'

// The environment comes from test-env.ts, preloaded by bunfig.toml, because env.ts snapshots
// process.env at first import and one test file cannot own that for the whole suite.

const { healthRoutes } = await import('./health')

const { MODELS } = await import('../gateway/models')

test('GET /health answers the shape the client reads the mascot flag from', async () => {
  const response = await healthRoutes.request('/health')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.windowMinutes).toBe(15)
  expect(body.mascotEnabled).toBe(true)
})

// The placeholder DATABASE_URL connects to nothing, which is the outage this asserts: the endpoint
// the client reads availability from must degrade to "no data yet" rather than 500.
test('it answers with every model when model_health cannot be read', async () => {
  const response = await healthRoutes.request('/health')
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.models.map((model: { model: string }) => model.model)).toEqual([...MODELS])
  expect(body.models.every((model: { healthy: boolean }) => model.healthy)).toBe(true)
})
