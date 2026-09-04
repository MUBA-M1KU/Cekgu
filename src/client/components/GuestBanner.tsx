import { useState, useSyncExternalStore } from 'react'
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
 * The shared-workspace disclosure, as a drawer pulled out from under the topbar.
 *
 * It shares the topbar card's width and its corner, and its top edge is hidden behind the card, so
 * the two read as one surface rather than as a strip that happens to sit below a bar. The full
 * width is the point: this sentence is the one thing on a Guest screen that has to be read before
 * anything is typed, and a chip in the corner is something you find rather than something you are
 * told.
 *
 * FR-AUTH-3 requires it visible on every Guest page without scrolling at 375 px, which it is: it
 * is in flow directly under the bar, so nothing sits between them, and it carries one dismiss
 * control. Dismissal is remembered in that browser, and the same sentence stays on the sign-in
 * page and in Settings, so dismissing hides the drawer rather than the disclosure.
 */
export function GuestDrawer() {
  const session = useSession()
  const alreadyDismissed = useSyncExternalStore(subscribe, dismissed)
  // Local as well as stored, so dismissing animates out on this screen rather than vanishing.
  const [closed, setClosed] = useState(false)

  if (session.status !== 'in' || !session.isGuest) return null
  if (alreadyDismissed || closed) return null

  return (
    <div className="guest-drawer">
      <p className="guest-drawer-text type-ui">{GUEST_WARNING}</p>
      <button
        type="button"
        onClick={() => {
          setClosed(true)
          dismissGuestBanner()
        }}
        aria-label="Dismiss the shared workspace notice"
        className="guest-drawer-close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}
