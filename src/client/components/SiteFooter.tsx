import { Link } from 'react-router'
import { Mark } from './Mark'

// One footer, two mountings. The app shell fixes it behind the scrolling page and uncovers it at
// the end; the landing puts it in flow, because a fixed footer under a sticky hero would be pinned
// against the shell rather than revealed by it. The content and the surface are the same in both,
// which is the whole point of sharing it.
// The notices were public-only until the owner asked for them in the workspace too: a signed-in
// reader is exactly who has agreed to them, and the footer is the only place that carries them.
const LEGAL = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/acceptable-use', label: 'Acceptable Use' }
]

export function SiteFooter() {
  return (
    <div className="app-footer-inner">
      <Link to="/" className="app-footer-brand" aria-label="Cekgu home">
        <Mark className="h-7 w-7 shrink-0" />
        <span className="app-footer-name">Cekgu</span>
      </Link>
      <p className="type-ui text-ink-muted">Two readers, and the receipts to prove it.</p>
      {/* One row. The notices and the way to reach us used to be cards on the landing; the footer is
          the only place that carries them now, so they read as a single line of exits rather than a
          stack. The nav keeps its own landmark inside the row so the legal links stay addressable. */}
      <div className="app-footer-links">
        <Link to="/#trust" className="app-footer-link type-caption">
          Trust and Privacy
        </Link>
        <nav aria-label="Legal" className="app-footer-links">
          {LEGAL.map((item) => (
            <Link key={item.href} to={item.href} className="app-footer-link type-caption">
              {item.label}
            </Link>
          ))}
        </nav>
        <a href="https://x.com/Cekgu0903" target="_blank" rel="noreferrer" className="app-footer-link type-caption">
          @Cekgu0903
        </a>
      </div>
    </div>
  )
}
