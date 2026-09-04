import { Link } from 'react-router'
import { Mark } from './Mark'

// One footer, two mountings. The app shell fixes it behind the scrolling page and uncovers it at
// the end; the landing puts it in flow, because a fixed footer under a sticky hero would be pinned
// against the shell rather than revealed by it. The content and the surface are the same in both,
// which is the whole point of sharing it.
type Props = {
  // Public-only. The app shell mounts the same footer without them, because a signed-in workspace
  // is not where someone goes looking for the terms they agreed to before signing up.
  legal?: { href: string; label: string }[]
}

export function SiteFooter({ legal }: Props = {}) {
  return (
    <div className="app-footer-inner">
      <Link to="/" className="app-footer-brand" aria-label="Cekgu home">
        <Mark className="h-7 w-7 shrink-0" />
        <span className="app-footer-name">Cekgu</span>
      </Link>
      <p className="type-ui text-ink-muted">Two readers, and the receipts to prove it.</p>
      <Link to="/#trust" className="app-footer-link type-caption">
        Trust and Privacy
      </Link>
      {legal ? (
        <nav aria-label="Legal" className="app-footer-legal">
          {legal.map((item) => (
            <Link key={item.href} to={item.href} className="app-footer-link type-caption">
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
