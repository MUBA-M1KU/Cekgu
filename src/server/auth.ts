import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as authSchema from './db/auth-schema'
import { env } from './env'

/**
 * Cloud Run gives a tagged revision its own hostname, `<tag>---<service host>`, and a preview deploy
 * is exactly that: the same service, the same configuration, a different tag.
 *
 * Better Auth trusts only `baseURL` unless told otherwise, so every route it owns answered
 * `403 INVALID_ORIGIN` on a preview. Our own routes were unaffected, because `POST /api/auth/guest`
 * calls `auth.api.signInEmail` server side and never sees an Origin header. The visible symptom was
 * that a person could sign in on a preview and then not sign out again, which is the shape the bug
 * was reported in.
 *
 * The check is narrow on purpose: an origin is trusted only when stripping one `<tag>---` prefix
 * off its host leaves the configured host exactly. A wildcard here would be a CSRF hole.
 */
export function sameServiceOrigin(origin: string, base: string): boolean {
  try {
    const candidate = new URL(origin)
    const configured = new URL(base)
    if (candidate.protocol !== configured.protocol) return false

    const [tag, ...rest] = candidate.hostname.split('---')
    return rest.length === 1 && tag !== '' && rest[0] === configured.hostname
  } catch {
    return false
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  // Called without a request while the auth context is built, so the request is optional here
  // whatever the type says.
  trustedOrigins: (request?: Request) => {
    const origin = request?.headers?.get('origin')
    return origin && sameServiceOrigin(origin, env.betterAuthUrl) ? [env.betterAuthUrl, origin] : [env.betterAuthUrl]
  },
  basePath: '/api/auth',
  emailAndPassword: { enabled: true, autoSignIn: true },
  socialProviders: env.google ? { google: env.google } : {},
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 }
})

export type Session = typeof auth.$Infer.Session
