import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GUEST_WARNING } from '../components/GuestBanner'

// The finished page, with email sign-in, is #38. The Guest path is here because it is the
// demo path (FR-AUTH-2) and the shell's Guest banner cannot be judged without it.
export function SignIn() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <section className="rounded-sheet border border-rule bg-sheet p-4 shadow-[var(--shadow-sheet)] sm:p-8">
      <h1>Sign In</h1>
      <p className="mt-3 type-body text-ink-muted">
        Private sign-in with email or Google lands in #38. The shared Guest workspace is open now.
      </p>

      <div className="mt-6 border-t border-rule pt-6">
        <button
          type="button"
          onClick={enterAsGuest}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink disabled:opacity-60"
        >
          Sign In as Guest
        </button>
        {/* FR-AUTH-3: the warning sits beside the button, word for word. */}
        <p className="mt-3 max-w-[60ch] type-body text-ink-muted">{GUEST_WARNING}</p>
        {error ? (
          <p role="alert" className="mt-3 type-body text-pen">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
