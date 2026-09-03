import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { VerdictCounts } from '../../shared/types'
import { getSample } from '../api'
import { Field, inputClass } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'

type Mode = 'sign-in' | 'sign-up'

// Two rings on one bubble is direction C's signature: the inner is one reader, the outer is the
// other, and agreement is the two of them landing on the same circle. It is the only decoration
// on this screen and it is the product's own shape rather than an illustration of nothing.
function Figure({ counts }: { counts: VerdictCounts | null }) {
  const total = counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : 0
  const clear = counts?.clear ?? 0

  return (
    <div className="hidden flex-col items-center justify-center gap-8 lg:flex">
      <svg viewBox="0 0 260 180" width="260" height="180" aria-hidden="true" focusable="false">
        <circle cx="105" cy="90" r="66" fill="var(--well)" />
        <circle cx="155" cy="90" r="66" fill="none" stroke="var(--rule-strong)" strokeWidth="1.5" />
      </svg>
      <p className="type-ui max-w-[30ch] text-center text-ink-muted">
        {counts
          ? `${clear} of ${total} questions on the sample paper came back Clear. The other ${total - clear} are waiting inside.`
          : 'Two independent readers sit every question before your learners do.'}
      </p>
    </div>
  )
}

export function SignIn() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState<VerdictCounts | null>(null)

  // The figure states a fact about the seeded sample, so it reads the sample rather than carrying
  // a number in the source that would drift the first time the seed changes.
  useEffect(() => {
    getSample()
      .then((record) => setCounts(record.counts))
      .catch(() => setCounts(null))
  }, [])

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
      navigate('/records')
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
      navigate('/records')
    } catch {
      setError('We could not open the Guest workspace, try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <div className="wrap grid min-h-[calc(100dvh-11rem)] items-center justify-center gap-16 py-12 lg:grid-cols-[26rem_minmax(0,28rem)]">
      <section className="card-soft mx-auto w-full max-w-[26rem] rounded-[1.5rem] p-7 sm:p-8">
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

      <Figure counts={counts} />
    </div>
  )
}
