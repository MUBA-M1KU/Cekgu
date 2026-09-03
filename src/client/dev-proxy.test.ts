import { afterAll, beforeAll, expect, test } from 'bun:test'
import { createServer, type ViteDevServer } from 'vite'
import config from '../../vite.config'

let backend: ReturnType<typeof Bun.serve>
let server: ViteDevServer
let base = ''

beforeAll(async () => {
  backend = Bun.serve({
    port: 0,
    hostname: '127.0.0.1',
    fetch: (request) => Response.json({ proxied: new URL(request.url).pathname })
  })
  const proxy = Object.fromEntries(
    Object.keys(config.server?.proxy ?? {}).map((key) => [key, `http://127.0.0.1:${backend.port}`])
  )
  server = await createServer({
    ...config,
    configFile: false,
    logLevel: 'silent',
    server: { ...config.server, proxy, port: 0, host: '127.0.0.1' }
  })
  await server.listen()
  base = server.resolvedUrls?.local[0] ?? ''
})

afterAll(async () => {
  await server.close()
  backend.stop(true)
})

test('the client api module is served by vite rather than forwarded to the backend', async () => {
  const response = await fetch(`${base}api.ts`)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('javascript')
})

test('api requests still reach the backend through the proxy', async () => {
  const response = await fetch(`${base}api/health`)
  expect(await response.json()).toEqual({ proxied: '/api/health' })
})
