import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router'
import type { RecordSummary } from '../../shared/types'
import { listRecords } from '../api'
import { AppRail } from '../components/AppRail'
import { AppTopbar } from '../components/AppTopbar'
import { GuestBanner } from '../components/GuestBanner'
import { useSession } from '../session'

export function AppLayout() {
  const session = useSession()
  const [records, setRecords] = useState<RecordSummary[] | null>(null)

  // Read once for the shell, so the topbar's bell counts real work rather than decorating the
  // corner. A failure leaves the bell empty rather than breaking the page around it.
  useEffect(() => {
    listRecords()
      .then(setRecords)
      .catch(() => setRecords(null))
  }, [])

  return (
    <div className="min-h-dvh bg-paper">
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

        <footer className="app-footer" role="contentinfo">
          <div className="app-footer-inner">
            <p className="type-caption text-ink-muted">Two readers, and the receipts to prove it.</p>
            <Link to="/" className="type-caption text-ink-muted underline">
              Cekgu
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
