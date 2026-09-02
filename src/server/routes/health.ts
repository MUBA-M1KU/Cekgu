import { Hono } from 'hono'
import type { Health } from '../../shared/types'
import { env } from '../env'
import type { AppEnv } from '../session'

// Public by PUBLIC_PATHS in ./index.ts, because the client asks whether the mascot is enabled
// before it knows whether anyone is signed in. The model health ring lands here with the queue
// work; the shape is already the one it will fill.
export const healthRoutes = new Hono<AppEnv>()

healthRoutes.get('/health', (c) => {
  const body: Health = { models: [], windowMinutes: 15, mascotEnabled: env.mascotEnabled }
  return c.json(body)
})
