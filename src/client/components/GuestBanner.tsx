// FR-AUTH-3 requires this sentence word for word, beside the button and again as a banner.
// It is exported so the sign-in page renders exactly the same string.
export const GUEST_WARNING =
  'Shared demo workspace. Anything you add can be viewed or deleted by other guests. Do not enter real, personal or confidential exam content.'

// An inverted strip is the one place the product uses ink as a ground: a stamp on the paper,
// not a card. No icon, no close button, no link. DESIGN.md Layout.
export function GuestBanner() {
  return (
    <div className="bg-ink text-on-ink">
      <p className="mx-auto max-w-[880px] px-4 py-3 text-[0.9375rem]/[1.45] sm:px-8">{GUEST_WARNING}</p>
    </div>
  )
}
