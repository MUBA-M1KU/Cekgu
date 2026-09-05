import type { ComponentType } from 'react'
import { Link, NavLink } from 'react-router'
import { DashboardIcon, NewCheckIcon, RecordsIcon, SettingsIcon } from './icons'
import { Mark } from './Mark'

type RailItem = { to: string; label: string; Icon: ComponentType<{ size?: number }> }

// Two groups, because Review and Account are different kinds of place. Collapsed, the headings
// become a rule at the same height rather than four clipped letters.
const GROUPS: { heading: string; items: RailItem[] }[] = [
  {
    heading: 'Review',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
      { to: '/new-check', label: 'New Check', Icon: NewCheckIcon },
      { to: '/records', label: 'Records', Icon: RecordsIcon }
    ]
  },
  { heading: 'Account', items: [{ to: '/settings', label: 'Settings', Icon: SettingsIcon }] }
]

/**
 * The workspace sidebar.
 *
 * Pinned wide from the topbar's toggle it holds that width. As a rail it peeks: the pointer or
 * keyboard focus arriving widens it over the page behind a light scrim, and leaving settles it
 * back. Both live in styles.css, keyed off the rail itself, so a route change has no state to lose.
 *
 * `collapsed` only narrows it; the width itself lives on the shell as a custom property, so the
 * content and the footer follow it without either one measuring the sidebar.
 */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="app-sidebar">
      {/* Link, not NavLink: NavLink to "/" matches every path below it, so the wordmark would
          announce itself as the current page on every screen in the shell. */}
      <Link to="/" className="app-sidebar-logo" aria-label="Cekgu, home" onClick={onNavigate}>
        <Mark className="h-6 w-6 shrink-0" />
        <span className="app-sidebar-text font-ui text-[1.0625rem] font-bold tracking-[-0.02em]">Cekgu</span>
      </Link>

      <nav className="app-sidebar-nav" aria-label="Workspace">
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="app-sidebar-head">
              <span className="app-sidebar-text type-eyebrow">{group.heading}</span>
              <hr />
            </div>
            <ul className="m-0 list-none p-0">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) => `app-sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <span className="app-sidebar-icon">
                      <item.Icon size={18} />
                    </span>
                    <span className="app-sidebar-text truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}
