import { Link, Outlet } from 'react-router'
import { Lockup } from '../components/Lockup'
import { Nav } from '../components/Nav'

const PUBLIC_NAV = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/sample', label: 'Sample Report' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/trust', label: 'Trust and Privacy' }
]

export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-[880px] flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
          <Lockup to="/" />
          <div className="ml-auto flex flex-wrap items-center gap-6">
            <Nav items={PUBLIC_NAV} />
            <Link
              to="/sign-in"
              className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[880px] px-4 py-6 sm:px-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[880px] px-4 py-6 sm:px-8 type-caption text-ink-muted">
        Tororo and Hijiki are Live2D sample characters, used under the Live2D Free Material License Agreement, and are
        not Cekgu's own. Built with the Live2D Cubism SDK.
      </footer>
    </div>
  )
}
