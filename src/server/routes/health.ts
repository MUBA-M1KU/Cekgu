import { Hono } from 'hono'
import type { Health } from '../../shared/types'
import { env } from '../env'
import { HEALTH_WINDOW_MINUTES, readHealth } from '../queue/health'
import type { AppEnv } from '../session'

// Public by PUBLIC_PATHS in ./index.ts, because the client asks whether the mascot is enabled
// before it knows whether anyone is signed in.
export const healthRoutes = new Hono<AppEnv>()

healthRoutes.get('/health', async (c) => {
  // Read from model_health rather than from the ring, so a restart shows the last known picture
  // rather than an empty one (TRD section 13).
  const models = await readHealth()
  const body: Health = { models, windowMinutes: HEALTH_WINDOW_MINUTES, mascotEnabled: env.mascotEnabled }
  return c.json(body)
})
