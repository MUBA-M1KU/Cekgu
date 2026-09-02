import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { Field, inputClass } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'
import { Sheet } from '../components/Sheet'

type Mode = 'sign-in' | 'sign-up'

export function SignIn() {
  const navigate = useNavigate()
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
    <Sheet>
      <h1>Sign In</h1>

      <form onSubmit={submit} noValidate className="mt-6 flex max-w-[26rem] flex-col gap-5">
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

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink disabled:opacity-60"
          >
            {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
            }}
            className="type-label underline"
          >
            {mode === 'sign-in' ? 'Create an account instead' : 'I already have an account'}
          </button>
        </div>

        {error ? (
          <p role="alert" className="type-body text-pen">
            {error}
          </p>
        ) : null}
      </form>

      <div className="mt-8 border-t border-rule pt-6">
        <button
          type="button"
          onClick={enterAsGuest}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium disabled:opacity-60"
        >
          Sign In as Guest
        </button>
        {/* FR-AUTH-3: the warning sits beside the button, word for word, and again as a banner inside. */}
        <p className="type-body mt-3 max-w-[60ch] text-ink-muted">{GUEST_WARNING}</p>
      </div>
    </Sheet>
  )
}
