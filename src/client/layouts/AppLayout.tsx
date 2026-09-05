import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import type { RecordSummary } from '../../shared/types'
import { listRecords } from '../api'
import { AppSidebar } from '../components/AppSidebar'
import { AppTopbar } from '../components/AppTopbar'
import { GuestDrawer } from '../components/GuestBanner'
import { SiteFooter } from '../components/SiteFooter'
import { useSession } from '../session'

// Whether the sidebar is wide or narrow is a preference a person sets once and expects to find
// again, so it outlives the route. A browser with storage blocked gets the wide default.
const SIDEBAR_KEY = 'cekgu.sidebar'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

const MOBILE = '(max-width: 47.99rem)'

export function AppLayout() {
  const session = useSession()
  const { pathname, search } = useLocation()
  const [records, setRecords] = useState<RecordSummary[] | null>(null)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  // Below the md breakpoint the sidebar is an overlay rather than a column, so the same control
  // has to mean "show it" instead of "narrow it". One flag each, because they are two states.
  const [drawer, setDrawer] = useState(false)

  // Read once for the shell, so the topbar's bell counts real work rather than decorating the
  // corner. A failure leaves the bell empty rather than breaking the page around it. Not asked
  // for at all without a session: the answer would be a 401 in the console and nothing else.
  useEffect(() => {
    if (session.status !== 'in') return
    listRecords()
      .then(setRecords)
      .catch(() => setRecords(null))
  }, [session.status])

  // The drawer belongs to the small viewport. Widening the window while it is open would
  // otherwise leave a scrim over a page that no longer has anything overlaying it.
  useEffect(() => {
    const query = window.matchMedia(MOBILE)
    const sync = () => {
      if (!query.matches) setDrawer(false)
    }
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const toggle = useCallback(() => {
    if (window.matchMedia(MOBILE).matches) {
      setDrawer((open) => !open)
      return
    }
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'open')
      } catch {
        // The width is a convenience, not state the product reads back.
      }
      return next
    })
  }, [])

  // Decide nothing until the session is known. Redirecting while it loads would throw a signed-in
  // visitor off their own deep link on every cold load.
  if (session.status === 'loading') return null

  // An unauthenticated visitor gets sign-in, not a furnished workspace that cannot load and an
  // account menu claiming they are signed in. The path travels with them, so a shared record link
  // survives the detour. Issue #161.
  if (session.status === 'out') {
    return <Navigate to="/sign-in" replace state={{ from: `${pathname}${search}` }} />
  }

  // Three values, not two. "open" is the mobile drawer being pulled out, and it has to be distinct
  // from the ordinary wide desktop sidebar: sharing one value put the drawer on screen by default
  // at 375 px, sitting over the control that closes it.
  const side = drawer ? 'open' : collapsed ? 'collapsed' : 'wide'

  return (
    <div className="app-shell min-h-dvh bg-paper" data-side={side}>
      <AppSidebar onNavigate={() => setDrawer(false)} />
      {/* Only under the md breakpoint does the sidebar overlay anything, and only then is there
          something for a scrim to dim. */}
      {drawer ? (
        <button
          type="button"
          className="app-scrim md:hidden"
          onClick={() => setDrawer(false)}
          aria-label="Close the sidebar"
        />
      ) : null}

      <div className="app-body">
        <AppTopbar records={records} onToggleSidebar={toggle} />

        {/* Nothing sits between the bar and this, which is what makes it above the fold on every
            Guest page at 375 px. FR-AUTH-3. */}
        <GuestDrawer />

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <footer className="app-footer" role="contentinfo">
        <SiteFooter />
      </footer>
    </div>
  )
}
