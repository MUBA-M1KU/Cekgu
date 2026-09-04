import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Field, inputClass } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'
import { Lockup } from '../components/Lockup'

type Mode = 'sign-in' | 'sign-up'

// Two rings on one bubble is direction C's signature: the inner is one reader, the outer is the
// other, and agreement is the two of them landing on the same circle. It is the only decoration
// on this screen and it is the product's own shape rather than an illustration of nothing.
//
// It carried a live count off the sample until now, which made a dashboard of the one screen whose
// whole job is a single action, and put a number in front of someone who has not seen the product
// yet. The line under it is the product's own, the one both footers already carry.
function Figure() {
  return (
    <aside className="auth-pane-figure" aria-label="About Cekgu">
      <svg className="auth-figure-mark" viewBox="0 0 260 180" aria-hidden="true" focusable="false">
        <circle cx="105" cy="90" r="66" fill="var(--sheet)" />
        <circle cx="155" cy="90" r="66" fill="none" stroke="var(--rule-strong)" strokeWidth="1.5" />
      </svg>
      <p className="type-ui max-w-[30ch] text-balance text-center text-ink-muted">
        Two readers, and the receipts to prove it.
      </p>
    </aside>
  )
}

// Where to land after signing in. AppLayout sends the path a visitor was refused, so a shared
// record link survives the detour. Only an internal path is followed: the value arrives through
// router state rather than the URL, but a destination we did not write is still not one to
// navigate to unchecked.
function internalPath(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : null
}

export function SignIn() {
  const navigate = useNavigate()
  const destination = internalPath(useLocation().state) ?? '/records'
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const path = mode === 'sign-in' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email'
    const body = mode === 'sign-in' ? { email, password } : { email, password, name: name || email }

    try {
      const response = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!response.ok) throw new Error('rejected')
      navigate(destination)
    } catch {
      setError(
        mode === 'sign-in'
          ? 'That email and password did not match an account.'
          : 'We could not create that account. The email may already be in use.'
      )
      setBusy(false)
    }
  }

  async function enterAsGuest() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/guest', { method: 'POST', credentials: 'include' })
      if (!response.ok) throw new Error('guest sign-in failed')
      navigate(destination)
    } catch {
      setError('We could not open the Guest workspace, try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-pane-form">
        {/* The bar is suppressed on this route, so the lockup lives here. It is in the left pane
            rather than the right one because the right pane is gone below lg and the way back to
            the landing is not decoration. */}
        <Lockup to="/" />

        <section className="card-soft w-full p-7 sm:p-8">
          <h1>{mode === 'sign-in' ? 'Sign In' : 'Create an Account'}</h1>

          <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
            {mode === 'sign-up' ? (
              <Field label="Name" htmlFor="name">
                <input id="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            ) : null}
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              helper={mode === 'sign-up' ? 'At least eight characters.' : undefined}
            >
              <input
                id="password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-10 items-center rounded-bubble bg-ink px-5 font-medium text-on-ink disabled:opacity-60"
              >
                {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                  setError(null)
                }}
                className="inline-flex h-10 items-center rounded-bubble border border-rule-strong px-5 font-medium"
              >
                {mode === 'sign-in' ? 'Create an Account' : 'Use an Existing Account'}
              </button>
            </div>

            {error ? (
              <p role="alert" className="type-ui text-pen">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-7 border-t border-rule pt-6">
            <button
              type="button"
              onClick={enterAsGuest}
              disabled={busy}
              className="inline-flex h-10 w-full items-center justify-center rounded-bubble border border-rule-strong px-5 font-medium disabled:opacity-60"
            >
              Sign In as Guest
            </button>
            {/* FR-AUTH-3: the warning sits beside the button, word for word, and again as a banner inside. */}
            <p className="type-caption mt-3 text-ink-muted">{GUEST_WARNING}</p>
          </div>
        </section>
      </div>

      <Figure />
    </div>
  )
}
