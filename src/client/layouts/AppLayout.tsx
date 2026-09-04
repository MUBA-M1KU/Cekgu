import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import type { RecordSummary } from '../../shared/types'
import { listRecords } from '../api'
import { AppRail } from '../components/AppRail'
import { AppTopbar } from '../components/AppTopbar'
import { GuestBanner } from '../components/GuestBanner'
import { SiteFooter } from '../components/SiteFooter'
import { useSession } from '../session'

export function AppLayout() {
  const session = useSession()
  const { pathname, search } = useLocation()
  const [records, setRecords] = useState<RecordSummary[] | null>(null)

  // Read once for the shell, so the topbar's bell counts real work rather than decorating the
  // corner. A failure leaves the bell empty rather than breaking the page around it. Not asked
  // for at all without a session: the answer would be a 401 in the console and nothing else.
  useEffect(() => {
    if (session.status !== 'in') return
    listRecords()
      .then(setRecords)
      .catch(() => setRecords(null))
  }, [session.status])

  // Decide nothing until the session is known. Redirecting while it loads would throw a signed-in
  // visitor off their own deep link on every cold load.
  if (session.status === 'loading') return null

  // An unauthenticated visitor gets sign-in, not a furnished workspace that cannot load and an
  // account menu claiming they are signed in. The path travels with them, so a shared record link
  // survives the detour. Issue #161.
  if (session.status === 'out') {
    return <Navigate to="/sign-in" replace state={{ from: `${pathname}${search}` }} />
  }

  return (
    <div className="app-shell min-h-dvh bg-paper">
      <AppRail />
      <AppTopbar records={records} />

      <div className="app-body">
        {/* Nothing sits between the topbar and the banner, so it is above the fold at 375 px. */}
        {session.status === 'in' && session.isGuest ? <GuestBanner /> : null}

        <main className="app-content">
          {/* The container is the wide one SolarSim uses; the document inside it keeps DESIGN.md's
              readable measure and is centred in it, so no page has a measure of its own. */}
          <div className="app-doc">
            <Outlet />
          </div>
        </main>
      </div>

      {/* A sibling of the scrolling body, not a child of it: the page is painted over this and
          uncovers it at the end. MakanLah's pattern, and the reason its blur has anything to act
          on. Right aligned and stacked: mark, name, one line, one link. */}
      <footer className="app-footer" role="contentinfo">
        <SiteFooter />
      </footer>
    </div>
  )
}
