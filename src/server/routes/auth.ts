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

authRoutes.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))
