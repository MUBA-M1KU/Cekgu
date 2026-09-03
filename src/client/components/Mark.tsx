// The mark, inline rather than an <img src>, so currentColor resolves against the page.
//
// It was an <img src="/brand/cekgu-mark.svg"> and the comment claimed it "takes the text colour of
// wherever it sits, so it needs no light and dark variants". That was false: an <img>-loaded SVG is
// its own document, so currentColor fell back to black. Measured by drawing it to a canvas over a
// light-on-dark page — the rings came out 0,0,0 while the page colour was #f1efea, which is why the
// logo disappeared into the dark ground. Inline, the claim is finally true.
//
// The tick uses var(--pen) rather than the hardcoded #B3202F it had. That token is
// light-dark(#b3202f, #f07079), so the red lightens on the dark ground for contrast — which a
// literal hex inside an <img> could not do.
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7 36a17 17 0 1 0 34 0a17 17 0 1 0-34 0M20.5 28a19.5 19.5 0 1 0 39 0a19.5 19.5 0 1 0-39 0M25.5 28a14.5 14.5 0 1 0 29 0a14.5 14.5 0 1 0-29 0"
      />
      <path
        fill="none"
        stroke="var(--pen)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 36l11 12q13-20 27-33"
      />
    </svg>
  )
}
