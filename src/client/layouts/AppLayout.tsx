import { Outlet } from 'react-router'
import { GuestBanner } from '../components/GuestBanner'
import { Lockup } from '../components/Lockup'
import { Nav } from '../components/Nav'
import { useSession } from '../session'

const APP_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/new-check', label: 'New Check' },
  { to: '/records', label: 'Records' },
  { to: '/settings', label: 'Settings' }
]

export function AppLayout() {
  const session = useSession()

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-[880px] flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
          <Lockup to="/dashboard" />
          <div className="ml-auto">
            <Nav items={APP_NAV} />
          </div>
        </div>
      </header>

      {/* Nothing sits between the navigation and the banner, so it is above the fold at 375 px. */}
      {session.status === 'in' && session.isGuest ? <GuestBanner /> : null}

      <main className="mx-auto max-w-[880px] px-4 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
