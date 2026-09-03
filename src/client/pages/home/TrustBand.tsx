// The four track constraints, as a fact the page states rather than a claim it argues. Rendered
// twice because the loop translates by half its width; one copy would show a seam.
const CLAIMS = [
  ['Every inference through GonkaRouter', 'no direct provider calls'],
  ['Two model families minimum', 'one reader is not a reading'],
  ['A Gonka request id on every attempt', 'resolvable to a receipt'],
  ['Fail closed', 'fewer than two verified readings means Unverified']
]

export function TrustBand() {
  return (
    <div className="marquee">
      {/* The list is decorative repetition of claims made in full on this page, so it is read
          once by assistive technology and the duplicate is hidden. */}
      <div className="marquee-track type-mono uppercase tracking-[0.16em]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-8" aria-hidden={copy === 1 ? 'true' : undefined}>
            {CLAIMS.map(([claim, qualifier]) => (
              <span key={claim} className="flex items-center gap-3">
                <b className="font-medium text-[color-mix(in_oklab,var(--on-ink)_92%,transparent)]">{claim}</b>
                <span aria-hidden="true">·</span>
                {qualifier}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
