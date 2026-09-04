import { afterEach, expect, test } from 'bun:test'
import { clearSession, refreshSession, sessionSnapshot } from './session'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function serve(body: unknown, ok = true) {
  globalThis.fetch = (() =>
    Promise.resolve(ok ? Response.json(body) : new Response('nope', { status: 401 }))) as unknown as typeof fetch
}

const GUEST = { user: { id: 'u1', email: 'guest@cekgu.local', name: 'Guest' }, isGuest: true }

// The store caches, so signing in has to be able to tell it the answer changed. Without that, the
// guard on every workspace route keeps refusing a visitor who has just been let in.
//
// This is the bug that shipped: signing in as guest set the cookie, navigated to /records, and
// AppLayout read a cached "signed out" and sent the visitor straight back to /sign-in. The store
// had refreshSession from the day it was written; the sign-in page simply never called it.
test('refreshSession replaces a cached signed-out state', async () => {
  serve({ user: null, isGuest: false })
  await refreshSession()
  expect(sessionSnapshot().status).toBe('out')

  serve(GUEST)
  await refreshSession()

  const after = sessionSnapshot()
  expect(after.status).toBe('in')
  expect(after.status === 'in' && after.isGuest).toBe(true)
})

// Signing out drops the session without waiting for a round trip, so nothing on screen goes on
// naming an account nobody is signed into while the navigation is still in flight.
test('clearSession drops a signed-in state immediately', async () => {
  serve(GUEST)
  await refreshSession()
  expect(sessionSnapshot().status).toBe('in')

  clearSession()
  expect(sessionSnapshot().status).toBe('out')
})

// A read that fails is a signed-out visitor, never a stuck loading state: the shell renders
// nothing at all while the session is unknown, so hanging here blanks the whole app.
test('a failed read settles as signed out rather than hanging', async () => {
  globalThis.fetch = (() => Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch
  await refreshSession()
  expect(sessionSnapshot().status).toBe('out')

  serve(null, false)
  await refreshSession()
  expect(sessionSnapshot().status).toBe('out')
})
