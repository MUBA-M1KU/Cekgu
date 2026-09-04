import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useSession } from '../session'

// FR-AUTH-3 requires this sentence word for word, beside the button and again inside the Guest
// workspace. It is exported so the sign-in page renders exactly the same string.
export const GUEST_WARNING =
  'Shared demo workspace. Anything you add can be viewed or deleted by other guests. Do not enter real, personal or confidential exam content.'

const KEY = 'cekgu.guestBannerDismissed'
const CHANGED = 'cekgu:guest-banner'

function dismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    // Storage blocked means the warning keeps showing, which is the safe direction to fail.
    return false
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function dismissGuestBanner(): void {
  try {
    localStorage.setItem(KEY, 'true')
  } catch {
    // Nothing to do: the notice simply stays, which is the safe direction.
  }
  window.dispatchEvent(new Event(CHANGED))
}

/**
 * The shared-workspace disclosure, as a chip in the topbar with a dropover under it.
 *
 * It was a full-width inverted strip below the topbar. That strip is a stamp across a working
 * screen: it pushed every page down by its own height on arrival, and once dismissed the fact that
 * this is a shared account left the product entirely except in Settings.
 *
 * FR-AUTH-3 requires the sentence to be visible on every Guest page without scrolling at 375 px,
 * so the dropover is OPEN on arrival rather than waiting to be found. Dismissing closes it and
 * remembers that, which is the dismissal the requirement already allows, and the chip stays
 * afterwards: dismissing hides the notice, never the disclosure.
 */
export function GuestNotice() {
  const session = useSession()
  const hidden = useSyncExternalStore(subscribe, dismissed)
  const [open, setOpen] = useState(!hidden)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (session.status !== 'in' || !session.isGuest) return null

  return (
    <div ref={ref} className="guest-notice relative">
      <button
        type="button"
        className="guest-chip type-label"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        Guest
      </button>

      {open ? (
        <div className="app-pop guest-pop" role="dialog" aria-label="Shared workspace notice">
          <div className="guest-pop-head">
            <p className="type-label">Shared Workspace</p>
          </div>
          <div className="guest-pop-body">
            <p className="type-ui">{GUEST_WARNING}</p>
            <p className="type-caption text-ink-muted">Records here are removed after 24 hours.</p>
          </div>
          <div className="guest-pop-foot">
            <button
              type="button"
              onClick={() => {
                dismissGuestBanner()
                setOpen(false)
              }}
              className="btn btn-primary btn-sm"
            >
              Got It
            </button>
            <p className="type-caption text-ink-muted">The chip stays, so this is always one click away.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
