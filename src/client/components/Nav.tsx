import { NavLink } from 'react-router'

export type NavItem = { to: string; label: string }

// TitleCase, because navigation names a place. DESIGN.md Capitalisation.
export function Nav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 p-0 m-0 list-none">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `inline-block py-1 border-b-2 ${isActive ? 'border-ink' : 'border-transparent text-ink-muted'}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
