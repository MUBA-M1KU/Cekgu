import { useState } from 'react'
import { signOut } from '../api'
import { GUEST_WARNING } from '../components/GuestBanner'
import { Sheet } from '../components/Sheet'
import { setReduceMotion, useReduceMotionSetting } from '../mascot/preferences'
import { useSession } from '../session'

export function Settings() {
  const reduceMotion = useReduceMotionSetting()
  const session = useSession()
  const [leaving, setLeaving] = useState(false)
  const [failed, setFailed] = useState(false)

  async function leave() {
    setLeaving(true)
    setFailed(false)
    try {
      await signOut()
      // A full load rather than a client route, so every cached record in memory goes with
      // the session. On the shared Guest account that matters more than the extra request.
      window.location.assign('/')
    } catch {
      setFailed(true)
      setLeaving(false)
    }
  }

  return (
    <Sheet>
      <h1>Settings</h1>

      <h2 className="mt-8">Account</h2>
      {session.status === 'in' ? (
        <>
          <dl className="mt-3 m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            <dt className="type-caption text-ink-muted">Signed in as</dt>
            <dd className="type-body m-0">{session.isGuest ? 'Guest' : session.user.name || session.user.email}</dd>
            {session.isGuest ? null : (
              <>
                <dt className="type-caption text-ink-muted">Email</dt>
                <dd className="type-mono m-0">{session.user.email}</dd>
              </>
            )}
          </dl>
          {session.isGuest ? (
            <p className="mt-3 max-w-[64ch] type-caption text-ink-muted">
              {GUEST_WARNING} Records here are removed after 24 hours.
            </p>
          ) : null}

          <button
            type="button"
            onClick={leave}
            disabled={leaving}
            className="mt-4 inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium disabled:opacity-60"
          >
            {leaving ? 'Signing Out' : 'Sign Out'}
          </button>
          {failed ? (
            <p className="mt-2 type-caption text-pen">We could not sign you out, try again in a moment.</p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 type-body text-ink-muted">
          {session.status === 'loading' ? 'Checking your session.' : 'You are not signed in.'}
        </p>
      )}

      <h2 className="mt-10">Accessibility</h2>
      <div className="mt-3">
        {/* The label wraps the control so the whole row is the target, as DispositionGroup does. */}
        <label className="flex max-w-[60ch] cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
            aria-describedby="reduce-motion-helper"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
          />
          <span className="min-w-0">
            <span className="type-label block">Reduce Motion</span>
            <span id="reduce-motion-helper" className="mt-1 block type-caption text-ink-muted">
              Stops the mascot and every continuous animation. Your system setting is respected either way.
            </span>
          </span>
        </label>
      </div>
    </Sheet>
  )
}
