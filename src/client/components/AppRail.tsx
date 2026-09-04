import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { Mark } from './Mark'

type RailItem = { to: string; label: string; icon: ReactNode; end?: boolean }

// Glyphs are drawn from the product's own vocabulary rather than a generic icon set: a bubble row
// for the workspace, a filled bubble beside an empty one for a new check, stacked sheets for the
// library, a bubble on a rule for settings.
const ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="5.5" cy="6" r="2.5" fill="currentColor" />
      <circle cx="14.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="14" r="2.5" fill="currentColor" />
    </svg>
  ),
  newCheck: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.75v6.5M6.75 10h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  records: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 8h7M6.5 11h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
      <path d="M3.5 7h13M3.5 13h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7.5" cy="7" r="2.25" fill="currentColor" />
      <circle cx="12.5" cy="13" r="2.25" fill="currentColor" />
    </svg>
  )
}

// Two groups, because Overview and Account are different kinds of place. The headings only appear
// once the rail is open; collapsed they would be four clipped letters.
const GROUPS: { heading: string; items: RailItem[] }[] = [
  {
    heading: 'Review',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
      { to: '/new-check', label: 'New Check', icon: ICONS.newCheck },
      { to: '/records', label: 'Records', icon: ICONS.records }
    ]
  },
  { heading: 'Account', items: [{ to: '/settings', label: 'Settings', icon: ICONS.settings }] }
]

export function AppRail() {
  return (
    <>
      <nav className="app-rail" aria-label="Workspace">
        <NavLink to="/dashboard" className="app-rail-logo" aria-label="Cekgu, dashboard">
          <Mark className="h-7 w-7 shrink-0" />
          <span className="app-rail-text font-ui text-[1.25rem] font-bold tracking-[-0.02em]">Cekgu</span>
        </NavLink>

        {GROUPS.map((group) => (
          <div key={group.heading}>
            {/* A div rather than a p: an hr inside a p closes the paragraph early, which put the
                headings outside the element whose opacity hides them at 64 px. */}
            <div className="app-rail-head">
              <hr className="app-rail-rule" />
              <span className="app-rail-text type-eyebrow">{group.heading}</span>
            </div>
            <ul className="m-0 list-none p-0">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `app-rail-link${isActive ? ' active' : ''}`}
                  >
                    <span className="app-rail-icon">{item.icon}</span>
                    <span className="app-rail-text">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {/* Sibling rather than a child, so the blur sits under the rail and over the page. */}
      <div className="app-rail-backdrop" aria-hidden="true" />
    </>
  )
}
