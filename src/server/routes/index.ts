import { Hono } from 'hono'
import { type AppEnv, requireSession } from '../session'
import { authRoutes } from './auth'

// Routes from TRD section 15 mount here. Unmatched /api paths get a JSON 404 from src/server/index.ts.
export const api = new Hono<AppEnv>()

// Better Auth's own routes and POST /api/auth/guest are public and answer first, so the
// session gate below never runs for them.
api.route('/', authRoutes)

// TRD section 15: every /api route needs a session cookie unless marked public.
// Protection is the default so a new route is guarded until it opts out here.
const PUBLIC_PATHS = ['/api/sample', '/api/health']

api.use('*', async (c, next) => {
  if (PUBLIC_PATHS.includes(c.req.path)) return next()
  return requireSession(c, next)
})
