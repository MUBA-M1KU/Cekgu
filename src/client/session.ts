import { useSyncExternalStore } from 'react'

export type SessionUser = { id: string; email: string; name: string }
export type SessionState =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'in'; user: SessionUser; isGuest: boolean }

type SessionResponse = { user: SessionUser | null; isGuest: boolean }

/**
 * One session for the whole app.
 *
 * This was a hook with its own useState, so every component that asked mounted its own fetch: the
 * shell, the topbar and the page each called GET /api/session on the same paint, and the public
 * nav asking too would have made four. Worse, nothing could tell any of them that the session had
 * changed, so signing out could only work by reloading the page and hoping.
 *
 * A store fixes both. The read is shared and happens once, and signing out can say so.
 */
let state: SessionState = { status: 'loading' }
let inFlight: Promise<void> | null = null
const listeners = new Set<() => void>()

function publish(next: SessionState): void {
  state = next
  for (const listener of listeners) listener()
}

async function read(): Promise<void> {
  try {
    const response = await fetch('/api/session', { credentials: 'include' })
    const body = response.ok ? ((await response.json()) as SessionResponse) : null
    publish(body?.user ? { status: 'in', user: body.user, isGuest: body.isGuest } : { status: 'out' })
  } catch {
    publish({ status: 'out' })
  }
}

/** Ask the server again. Returns when the answer has been published to every subscriber. */
export function refreshSession(): Promise<void> {
  inFlight = read().finally(() => {
    inFlight = null
  })
  return inFlight
}

/**
 * Drop the session locally, without waiting for a round trip.
 *
 * Signing out used to rely entirely on `window.location.assign` to clear what the client held. If
 * that navigation was slow, blocked or simply not reached, every screen went on showing the
 * account that had just been signed out of.
 */
export function clearSession(): void {
  publish({ status: 'out' })
}

/** The current answer, outside React. The store's snapshot getter, and what a test can assert. */
export function sessionSnapshot(): SessionState {
  return state
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // The first subscriber starts the read; the rest join the one already in flight.
  if (state.status === 'loading' && inFlight === null) void refreshSession()
  return () => {
    listeners.delete(listener)
  }
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, sessionSnapshot, sessionSnapshot)
}
