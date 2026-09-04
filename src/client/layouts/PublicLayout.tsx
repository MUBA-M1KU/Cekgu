import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { BackToTop } from '../components/BackToTop'
import { Lockup } from '../components/Lockup'

// Plain anchors rather than Link, so a fragment on the current path scrolls and a fragment on
// another path navigates. Both are the browser's own behaviour and neither needs a scroll handler.
const PUBLIC_NAV = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#sample', label: 'Sample Report' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#trust', label: 'Trust and Privacy' }
]

const FOOTER_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#sample', label: 'Sample Report' },
  { href: '/#trust', label: 'Trust and Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/acceptable-use', label: 'Acceptable Use' }
]

// The hero is full-bleed and the nav sits over it, so the bar is transparent until the page has
// moved. Solid from the first pixel would put an empty white band across the clip.
function useSolidNav(threshold: number) {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return solid
}

export function PublicLayout() {
  const { pathname } = useLocation()
  // Only the landing has a hero behind the bar. Everywhere else it is solid immediately.
  const overHero = pathname === '/'
  // Sign-in is a screen rather than a document: it composes its own two-column layout and needs
  // the full width to do it. Everything else public is a document and keeps the 880 px measure.
  const fullBleed = overHero || pathname === '/sign-in'
  const scrolled = useSolidNav(24)

  return (
    <div className="min-h-dvh bg-paper">
      {/* data-glass only where there is media behind the bar for the blur to act on. Everywhere
          else it is solid: a translucent bar over a flat ground is not glass, it is see-through. */}
      <header
        className="nav-sticky"
        data-solid={!overHero || scrolled ? 'true' : 'false'}
        data-glass={overHero ? 'true' : 'false'}
      >
        <div className="wrap flex h-[4.25rem] items-center gap-8">
          <Lockup to="/" />
          <nav aria-label="Primary" className="ml-auto hidden items-center gap-7 md:flex">
            {PUBLIC_NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-ink-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            to="/sign-in"
            className="ml-auto inline-flex h-9 shrink-0 items-center rounded-bubble bg-ink px-5 font-medium text-on-ink md:ml-0"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* The landing is full-bleed: its sections carry their own grounds and their own measure.
          Every other public route is a document and keeps DESIGN.md's 880 px measure. */}
      <main className={fullBleed ? undefined : 'mx-auto max-w-[880px] px-4 py-6 sm:px-8'}>
        <Outlet />
      </main>

      <footer className="border-t border-rule">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8">
          <p className="type-caption text-ink-muted">
            Cekgu · Pre-publication review for multiple-choice papers · Every reading routed through GonkaRouter
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="type-caption text-ink-muted hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
