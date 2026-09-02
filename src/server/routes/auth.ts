import { Hono } from 'hono'
import { auth } from '../auth'
import { env } from '../env'

export const authRoutes = new Hono()

// Registered before the Better Auth wildcard, because Hono matches in registration
// order and Better Auth does not own this path (TRD section 15, FR-AUTH-2).
authRoutes.post('/auth/guest', async (c) => {
  const response = await auth.api.signInEmail({
    body: { email: env.guestEmail, password: env.guestPassword },
    asResponse: true
  })

  if (!response.ok) {
    return c.json(
      { error: { code: 'guest_unavailable', message: 'The Guest workspace is not available right now.' } },
      503
    )
  }

  for (const cookie of response.headers.getSetCookie()) {
    c.header('set-cookie', cookie, { append: true })
  }

  const body = (await response.json()) as { user?: { id?: string } }
  return c.json({ user: { id: body.user?.id ?? '', isGuest: true } })
})

// GET /api/session - who the caller is, and whether this is the shared Guest account.
// Not in TRD section 15: the client cannot derive Guest status on its own, because GUEST_EMAIL is
// server configuration. Better Auth's get-session returns the user but knows nothing about the
// Guest convention, so the single comparison that defines it (TRD section 12) is answered here.
// Registered ahead of the session gate in routes/index.ts, so a signed-out caller gets null
// rather than a 401.
authRoutes.get('/session', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ user: null, isGuest: false })

  return c.json({
    user: { id: session.user.id, email: session.user.email, name: session.user.name },
    isGuest: session.user.email === env.guestEmail
  })
})

authRoutes.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))
