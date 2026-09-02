import type { Context, MiddlewareHandler } from 'hono'
import { auth, type Session } from './auth'
import { env } from './env'

export type AppEnv = { Variables: { session: Session } }

export function isGuest(session: Session): boolean {
  return session.user.email === env.guestEmail
}

export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ error: { code: 'unauthorized', message: 'Sign in to continue.' } }, 401)
  }
  c.set('session', session)
  await next()
}

export function sessionOf(c: Context<AppEnv>): Session {
  return c.get('session')
}
