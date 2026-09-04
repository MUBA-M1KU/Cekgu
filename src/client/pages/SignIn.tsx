import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { ItemVerdict, RecordDetail } from '../../shared/types'
import { getSample } from '../api'
import { Field, inputClass } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'
import { admittedSeats } from '../components/ItemRow'
import { ChevronLeftIcon } from '../components/icons'
import { Mark } from '../components/Mark'
import { ReadRow } from '../components/ReadRow'
import { VerdictChip } from '../components/VerdictChip'
import { count } from '../plural'
import { refreshSession } from '../session'

type Mode = 'sign-in' | 'sign-up'

const ORDER: ItemVerdict[] = ['possible_key_error', 'possible_ambiguity', 'split_opinion', 'unverified', 'clear']

/**
 * The right-hand panel.
 *
 * It is the product's own components carrying the seeded sample's real counts, not an
 * illustration of a product and not a picture of a dashboard built out of divs. A visitor who has
 * never used Cekgu sees the five verdicts it can return and how many of each the sample earned,
 * which is the shortest true answer to "what does this thing do".
 */
function SamplePanel({ record }: { record: RecordDetail | null }) {
  if (!record) {
    return (
      <aside className="auth-aside">
        <p className="type-ui text-ink-muted">Two independent readers sit every question before your learners do.</p>
      </aside>
    )
  }

  const total = Object.values(record.counts).reduce((sum, n) => sum + n, 0)
  const attention = total - record.counts.clear
  // The one item worth showing whole. A key error is the verdict a person can read off the row
  // without being told the rule: the key filled on one letter, both readers ringed on another.
  const shown = record.items.find((item) => item.verdict === 'possible_key_error')
  const seats = shown ? admittedSeats(shown) : []

  return (
    <aside className="auth-aside">
      <div className="mx-auto w-full max-w-[36rem]">
        <p className="type-eyebrow text-ink-muted">From the public sample</p>
        <h2 className="mt-3 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em]">
          {count(attention, 'question')} on this paper needed a second look.
        </h2>
        <p className="type-body mt-4 max-w-[52ch] text-ink-muted">
          Two independent models answered all {total} without seeing the key. Where they disagreed with it, or with each
          other, Cekgu says so and shows the Gonka request id behind each reading.
        </p>

        {shown ? (
          <div className="card mt-7">
            <div>
              <VerdictChip verdict={shown.verdict} />
              <p className="type-lead mt-4">{shown.stem}</p>
              <div className="mt-3">
                <ReadRow
                  options={shown.options}
                  keyLetter={shown.key}
                  readerA={seats[0]?.reading?.answer ?? null}
                  readerB={seats[1]?.reading?.answer ?? null}
                />
              </div>
              <p className="type-caption mt-3 text-ink-muted">
                The filled bubble is the supplied key. The rings are what each reader chose.
              </p>
            </div>
          </div>
        ) : null}

        <ul className="mt-7 m-0 flex list-none flex-wrap gap-2 p-0">
          {ORDER.filter((verdict) => record.counts[verdict] > 0).map((verdict) => (
            <li key={verdict}>
              <VerdictChip verdict={verdict} count={record.counts[verdict]} />
            </li>
          ))}
        </ul>

        <Link to="/sample" className="btn btn-outline mt-7">
          Read the Sample Report
        </Link>
      </div>
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
  const [sample, setSample] = useState<RecordDetail | null>(null)

  // The panel states facts about the seeded sample, so it reads the sample rather than carrying
  // numbers in the source that would drift the first time the seed changes.
  useEffect(() => {
    getSample()
      .then(setSample)
      .catch(() => setSample(null))
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
      // Before navigating, not after. AppLayout guards every workspace route on the session it
      // already holds, and this page was loaded while there was none: without this the router
      // moves to /records, the guard reads a cached "signed out" and sends the visitor straight
      // back to the page they just signed in from.
      await refreshSession()
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
      await refreshSession()
      navigate(destination)
    } catch {
      setError('We could not open the Guest workspace, try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-form-panel">
        <div className="mx-auto w-full max-w-[24rem]">
          <Link to="/" className="type-caption inline-flex items-center gap-1 text-ink-muted hover:text-ink">
            <ChevronLeftIcon size={15} />
            Back to the site
          </Link>

          <div className="mt-8 flex items-center gap-2">
            <Mark className="h-7 w-7" />
            <span className="font-ui text-[1.25rem] font-bold tracking-[-0.02em]">Cekgu</span>
          </div>

          <h1 className="mt-6 text-[1.625rem] leading-[1.15] tracking-[-0.02em]">
            {mode === 'sign-in' ? 'Sign In' : 'Create an Account'}
          </h1>
          <p className="type-ui mt-2 text-ink-muted">
            {mode === 'sign-in'
              ? 'Your records, and every request id behind them.'
              : 'Your papers stay on your account. Your keys are never sent to a model.'}
          </p>

          {/* Two states of one choice, so a segmented control rather than a second button that
              looks like it submits something. */}
          <fieldset className="seg mt-6 m-0 border-0">
            <legend className="sr-only">Account</legend>
            <button
              type="button"
              aria-pressed={mode === 'sign-in'}
              onClick={() => {
                setMode('sign-in')
                setError(null)
              }}
            >
              Existing Account
            </button>
            <button
              type="button"
              aria-pressed={mode === 'sign-up'}
              onClick={() => {
                setMode('sign-up')
                setError(null)
              }}
            >
              New Account
            </button>
          </fieldset>

          <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
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

            <button type="submit" disabled={busy} className="btn btn-primary mt-1 w-full">
              {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>

            {error ? (
              <p role="alert" className="type-caption text-pen">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-7 border-t border-rule pt-6">
            <button type="button" onClick={enterAsGuest} disabled={busy} className="btn btn-outline w-full">
              Sign In as Guest
            </button>
            {/* FR-AUTH-3: the warning sits beside the button, word for word, and again as a banner inside. */}
            <p className="type-caption mt-3 text-ink-muted">{GUEST_WARNING}</p>
          </div>
        </div>
      </div>

      <SamplePanel record={sample} />
    </div>
  )
}
