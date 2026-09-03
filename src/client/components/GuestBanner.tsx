import { useSyncExternalStore } from 'react'

// FR-AUTH-3 requires this sentence word for word, beside the button and again as a banner.
// It is exported so the sign-in page renders exactly the same string.
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
    // Nothing to do: the banner simply stays, which is the safe direction.
  }
  window.dispatchEvent(new Event(CHANGED))
}

// An inverted strip is the one place the product uses ink as a ground: a stamp on the paper,
// not a card. It now carries a single dismiss control, and the same sentence stays on the
// sign-in page and in Settings so dismissing hides the strip rather than the disclosure.
export function GuestBanner() {
  const hidden = useSyncExternalStore(subscribe, dismissed)
  if (hidden) return null

  return (
    <div className="bg-ink text-on-ink">
      <div className="mx-auto flex max-w-[55rem] items-start gap-4 px-4 py-3 sm:px-8">
        <p className="min-w-0 flex-1 text-[0.9375rem]/[1.45]">{GUEST_WARNING}</p>
        <button
          type="button"
          onClick={dismissGuestBanner}
          aria-label="Dismiss the shared workspace notice"
          // -my-2 keeps the 44 px hit area from growing the strip: the target extends over the
          // padding that is already there rather than adding height. Measured 27x26 before this.
          className="-my-2 -mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sheet text-[1.125rem]/[1.2] opacity-80 hover:opacity-100"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  )
}
