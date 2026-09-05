import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { BackToTop } from '../components/BackToTop'
import { Lockup } from '../components/Lockup'
import { SiteFooter } from '../components/SiteFooter'
import { useSession } from '../session'

// Plain anchors rather than Link, so a fragment on the current path scrolls and a fragment on
// another path navigates. Both are the browser's own behaviour and neither needs a scroll handler.
const PUBLIC_NAV = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#sample', label: 'Sample Report' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#trust', label: 'Trust and Privacy' }
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
  const session = useSession()
  // Only the landing has a hero behind the bar. Everywhere else it is solid immediately.
  const overHero = pathname === '/'
  // Sign-in is a task, not a document, and it is the only public route that composes a whole
  // screen: two panels, its own lockup and its own way back to the site. The site bar and footer
  // over it are a second set of exits on a screen whose whole job is one action, and the bar's
  // Sign In button is a link to the page it is already on.
  const bare = pathname === '/sign-in'
  const scrolled = useSolidNav(24)

  if (bare) {
    return (
      <div className="min-h-dvh bg-paper">
        <Outlet />
      </div>
    )
  }

  return (
    // A column, not a block. min-h-dvh alone only guarantees the container reaches the viewport
    // floor; it says nothing about where the footer inside it lands, so on a page shorter than the
    // viewport the footer sat directly under the content with the remaining paper below it. Every
    // other public route is long enough to hide that, which is why it only ever showed on a receipt.
    <div className="flex min-h-dvh flex-col bg-paper">
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
          {/* A visitor who is already signed in has no use for Sign In, and offering it on the
              landing page is a link back to a decision they have made. Guest counts: the shared
              workspace is a session like any other and the way back into it is the same door.

              Nothing is rendered while the session is still unknown, because a bar that says
              Sign In for a moment and then changes its mind is worse than one that waits. */}
          {session.status === 'in' ? (
            <Link
              to="/dashboard"
              className="ml-auto inline-flex h-9 shrink-0 items-center rounded-bubble bg-ink px-5 font-medium text-on-ink md:ml-0"
            >
              Open App
            </Link>
          ) : session.status === 'out' ? (
            <Link
              to="/sign-in"
              className="ml-auto inline-flex h-9 shrink-0 items-center rounded-bubble bg-ink px-5 font-medium text-on-ink md:ml-0"
            >
              Sign In
            </Link>
          ) : (
            <span className="ml-auto h-9 w-[6.5rem] shrink-0 md:ml-0" aria-hidden="true" />
          )}
        </div>
      </header>

      {/* The landing is full-bleed: its sections carry their own grounds and their own measure.
          The sample report is a working surface with filters and evidence side by side, so it
          takes the workspace measure rather than the prose one. */}
      {/* grow, so the slack on a short page goes here and the footer keeps the floor. */}
      <main className={overHero ? 'grow' : 'mx-auto w-full max-w-[76rem] grow px-4 py-6 sm:px-6'}>
        <Outlet />
      </main>

      {/* shrink-0 because .public-footer sets a definite height and a flex child would otherwise
          give it up to a long page. */}
      <footer className="public-footer shrink-0" role="contentinfo">
        <SiteFooter />
      </footer>

      <BackToTop />
    </div>
  )
}
