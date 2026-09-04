import { Hono } from 'hono'
import { type AppEnv, requireSession } from '../session'
import { accountRoutes } from './account'
import { authRoutes } from './auth'
import { extractRoutes } from './extract'
import { healthRoutes } from './health'
import { receiptRoutes } from './receipts'
import { recordRoutes } from './records'
import { sampleRoutes } from './sample'
import { statsRoutes } from './stats'

// Routes from TRD section 15 mount here. An unmatched /api path gets a JSON 404 from
// src/server/index.ts only once the caller has a session; without one the gate below answers 401
// first, which is the right order — an anonymous caller should not learn which routes exist.
export const api = new Hono<AppEnv>()

// Better Auth's own routes and POST /api/auth/guest are public and answer first, so the
// session gate below never runs for them.
api.route('/', authRoutes)

// TRD section 15: every /api route needs a session cookie unless marked public.
// Protection is the default so a new route is guarded until it opts out here.
const PUBLIC_PATHS = ['/api/sample', '/api/health']

// The receipt read-through is public for the same reason /api/sample is: the Sample Report is
// reachable signed out and its request ids are the whole point of it (FR-SAMPLE-4). It adds no
// authority, because the gateway endpoint behind it needs no key either.
const PUBLIC_PREFIXES = ['/api/receipts/']

api.use('*', async (c, next) => {
  if (PUBLIC_PATHS.includes(c.req.path)) return next()
  if (PUBLIC_PREFIXES.some((prefix) => c.req.path.startsWith(prefix))) return next()
  return requireSession(c, next)
})

api.route('/', accountRoutes)
api.route('/', extractRoutes)
api.route('/', healthRoutes)
api.route('/', receiptRoutes)
api.route('/', recordRoutes)
api.route('/', sampleRoutes)
api.route('/', statsRoutes)
