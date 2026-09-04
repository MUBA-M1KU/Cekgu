import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { BackToTop } from '../components/BackToTop'
import { Lockup } from '../components/Lockup'
import { SiteFooter } from '../components/SiteFooter'

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
          The sample report is a working surface with filters and evidence side by side, so it
          takes the workspace measure rather than the prose one. */}
      <main className={overHero ? undefined : 'mx-auto w-full max-w-[76rem] px-4 py-6 sm:px-6'}>
        <Outlet />
      </main>

      <footer className="public-footer" role="contentinfo">
        <SiteFooter />
      </footer>

      <BackToTop />
    </div>
  )
}
