import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as authSchema from './db/auth-schema'
import { env } from './env'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  basePath: '/api/auth',
  emailAndPassword: { enabled: true, autoSignIn: true },
  socialProviders: env.google ? { google: env.google } : {},
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 }
})

export type Session = typeof auth.$Infer.Session
