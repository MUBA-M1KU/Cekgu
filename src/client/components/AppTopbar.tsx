import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import type { RecordSummary } from '../../shared/types'
import { signOut } from '../api'
import { count } from '../plural'
import { useSession } from '../session'
import { setTheme, useTheme } from '../theme'

type Props = { records: RecordSummary[] | null }

const CRUMBS: Record<string, string> = {
  dashboard: 'Dashboard',
  'new-check': 'New Check',
  records: 'Records',
  settings: 'Settings'
}

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return ref
}

// The bell reports work waiting on a person, which is the only thing this product has that is
// worth interrupting for: items a check flagged, and checks still running. A bell that counted
// nothing real would be a control that lies, which DESIGN.md forbids.
function tally(records: RecordSummary[]) {
  const flagged = records.filter((record) => record.attentionCount > 0)
  const running = records.filter((record) => record.status === 'queued' || record.status === 'checking')
  return { flagged, running, total: flagged.reduce((sum, record) => sum + record.attentionCount, 0) + running.length }
}

// A notification here is derived from the record rather than stored as a row, so there is no read
// state on the server to write to and no endpoint to clear: local is the only honest scope. The
// signature is what keeps it honest. A record returns to the list the moment its status or its
// attention count moves, so Clear silences the state of the work and never the work itself, and
// the empty state below says so rather than implying the queue is done.
const CLEARED_KEY = 'cekgu.notifications.cleared'

type Cleared = Record<string, string>

const signatureOf = (record: RecordSummary) => `${record.status}:${record.attentionCount}`

function readCleared(): Cleared {
  try {
    const raw = localStorage.getItem(CLEARED_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}

    const cleared: Cleared = {}
    for (const [id, signature] of Object.entries(parsed)) {
      if (typeof signature === 'string') cleared[id] = signature
    }
    return cleared
  } catch {
    // A browser with storage blocked still gets its notifications; it just cannot silence them.
    return {}
  }
}

function writeCleared(cleared: Cleared): void {
  try {
    localStorage.setItem(CLEARED_KEY, JSON.stringify(cleared))
  } catch {
    // Silencing is a convenience, not state the product reads back.
  }
}

export function AppTopbar({ records }: Props) {
  const { pathname } = useLocation()
  const session = useSession()
  const theme = useTheme()
  const [open, setOpen] = useState<'bell' | 'user' | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [cleared, setCleared] = useState<Cleared>(readCleared)

  const bellRef = useDismiss(open === 'bell', () => setOpen(null))
  const userRef = useDismiss(open === 'user', () => setOpen(null))

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0] ?? 'dashboard'

  const all = records ?? []
  const { flagged, running, total } = tally(all.filter((record) => cleared[record.id] !== signatureOf(record)))
  // Counted before the filter, so the empty state can tell a cleared bell from a quiet one.
  const outstanding = tally(all).total
  // Null until the read lands, so an unknown count is omitted rather than printed as zero. The
  // sample is the product's own fixture rather than the account's work, so it is not held.
  const held = records ? all.filter((record) => !record.isSample).length : null

  function clearNotifications() {
    const next = { ...cleared }
    for (const record of [...flagged, ...running]) next[record.id] = signatureOf(record)
    setCleared(next)
    writeCleared(next)
  }

  async function leave() {
    setLeaving(true)
    try {
      await signOut()
      // A full load rather than a client route, so every cached record goes with the session.
      window.location.assign('/')
    } catch {
      setLeaving(false)
    }
  }

  return (
    <header className="app-topbar">
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="m-0 flex min-w-0 list-none items-center gap-2 p-0">
          <li className="truncate">
            {segments.length > 1 ? (
              <Link
                to={CRUMBS[first] ? `/${first}` : '/dashboard'}
                className="type-label text-ink-muted hover:text-ink"
              >
                {CRUMBS[first] ?? 'Dashboard'}
              </Link>
            ) : (
              // On a section root this crumb is the page you are already on. A link here went to
              // /dashboard while reading "Records", and collided with the rail's own Records link:
              // two links, one name, two destinations. Plain text says the same thing truthfully.
              <span className="type-label text-ink-muted">{CRUMBS[first] ?? 'Dashboard'}</span>
            )}
          </li>
          {segments.length > 1 ? (
            <>
              <li aria-hidden="true" className="type-label text-ink-muted">
                /
              </li>
              <li className="type-label min-w-0 truncate" aria-current="page">
                Record
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="app-icon-button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true" focusable="false">
              <circle cx="10" cy="10" r="3.5" fill="currentColor" />
              <path
                d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M16 12.3A6.5 6.5 0 0 1 7.7 4a6.5 6.5 0 1 0 8.3 8.3z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div ref={bellRef} className="relative">
          <button
            type="button"
            className="app-icon-button"
            aria-expanded={open === 'bell'}
            aria-haspopup="true"
            onClick={() => setOpen(open === 'bell' ? null : 'bell')}
            aria-label={total > 0 ? `Waiting on you, ${total}` : 'Nothing waiting on you'}
          >
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M5.5 8.5a4.5 4.5 0 0 1 9 0v3l1.2 2.2H4.3L5.5 11.5z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M8.3 15.8a1.9 1.9 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {total > 0 ? <span className="app-badge type-caption">{total}</span> : null}
          </button>

          {open === 'bell' ? (
            <div className="app-pop">
              <div className="app-pop-head">
                <p className="type-label">All Notifications</p>
                {total > 0 ? (
                  <button type="button" onClick={clearNotifications} className="app-pop-action type-label">
                    Clear
                  </button>
                ) : null}
              </div>
              {total === 0 ? (
                <div className="app-pop-empty">
                  <svg viewBox="0 0 20 20" width="26" height="26" fill="none" aria-hidden="true" focusable="false">
                    <path
                      d="M5.5 8.5a4.5 4.5 0 0 1 9 0v3l1.2 2.2H4.3L5.5 11.5z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      opacity="0.4"
                    />
                  </svg>
                  <p className="type-ui">
                    {outstanding === 0 ? 'Nothing is waiting on you.' : 'Cleared. Anything still open is in Records.'}
                  </p>
                </div>
              ) : (
                <ul className="app-pop-list m-0 list-none p-0">
                  {[...running.map((r) => [r, 'Running'] as const), ...flagged.map((r) => [r, null] as const)].map(
                    ([record, running_]) => (
                      <li key={record.id}>
                        <Link to={`/records/${record.id}`} className="app-pop-row" onClick={() => setOpen(null)}>
                          <span className="app-pop-dot" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="type-label block truncate">{record.title}</span>
                            <span className="type-caption mt-1 block text-ink-muted">
                              {running_ ?? `${record.attentionCount} to review`}
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div ref={userRef} className="relative">
          <button
            type="button"
            className="app-avatar"
            aria-expanded={open === 'user'}
            aria-haspopup="true"
            onClick={() => setOpen(open === 'user' ? null : 'user')}
            aria-label="Your account"
          >
            {session.status === 'in' ? (session.isGuest ? 'G' : (session.user.email[0]?.toUpperCase() ?? 'A')) : '·'}
          </button>

          {open === 'user' ? (
            <div className="app-pop">
              <div className="app-pop-head">
                <p className="type-label">Account</p>
              </div>
              {session.status === 'in' ? (
                <div className="app-pop-account">
                  {/* The identity is the content of this menu, so it is set at the same size as the
                      controls below it rather than under them. The address is mono because Settings
                      already sets an address in mono and an email is a machine string either way. */}
                  {session.isGuest ? (
                    <p className="type-ui">Guest</p>
                  ) : (
                    <p className="type-mono truncate">{session.user.email}</p>
                  )}
                  {session.isGuest ? (
                    <p className="type-caption text-ink-muted">
                      {/* Not the shared-workspace sentence: FR-AUTH-3 requires that one word for word
                          and copy.test.ts holds it to a single home in GuestBanner. This is the fact a
                          person actually needs in a menu, and it is not a second phrasing of it. */}
                      Records removed after 24 hours
                    </p>
                  ) : null}
                  {/* A count, never an allowance: nothing in the product caps it, so nothing here
                      may imply a ceiling by printing one. */}
                  {held === null ? null : <p className="type-caption text-ink-muted">{count(held, 'record')} held</p>}
                </div>
              ) : null}
              <Link to="/settings" className="app-pop-row border-t border-rule" onClick={() => setOpen(null)}>
                <span className="type-ui">Settings</span>
              </Link>
              <button type="button" onClick={leave} disabled={leaving} className="app-pop-row w-full text-left">
                <span className="type-ui text-pen">{leaving ? 'Signing Out' : 'Sign Out'}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
