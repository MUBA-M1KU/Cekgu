import { eq } from 'drizzle-orm'
import { auth } from './auth'
import { db } from './db'
import { user } from './db/auth-schema'
import { env } from './env'

// One ordinary user row, no guest role or column. A request is a Guest request when
// session.user.email === GUEST_EMAIL (TRD section 12, FR-AUTH-2).
export async function seedGuestUser(): Promise<void> {
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, env.guestEmail)).limit(1)
  if (existing.length > 0) return

  await auth.api.signUpEmail({
    body: { email: env.guestEmail, password: env.guestPassword, name: 'Guest' }
  })
}
