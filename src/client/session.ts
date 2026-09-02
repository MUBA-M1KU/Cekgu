import { useEffect, useState } from 'react'

export type SessionUser = { id: string; email: string; name: string }
export type SessionState =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'in'; user: SessionUser; isGuest: boolean }

type SessionResponse = { user: SessionUser | null; isGuest: boolean }

// GET /api/session answers both questions in one round trip, because Guest status is a
// server-side comparison against GUEST_EMAIL that the client cannot make for itself.
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  useEffect(() => {
    let live = true

    fetch('/api/session', { credentials: 'include' })
      .then((response) => (response.ok ? (response.json() as Promise<SessionResponse>) : null))
      .then((body) => {
        if (!live) return
        setState(body?.user ? { status: 'in', user: body.user, isGuest: body.isGuest } : { status: 'out' })
      })
      .catch(() => {
        if (live) setState({ status: 'out' })
      })

    return () => {
      live = false
    }
  }, [])

  return state
}
