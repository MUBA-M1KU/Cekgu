import type { SVGProps } from 'react'

/**
 * One icon family for the whole shell.
 *
 * Every glyph is drawn from the product's own vocabulary rather than a general-purpose set: a
 * bubble row for the workspace, a filled bubble beside an empty one for a new check, stacked
 * sheets for the library, a bubble on a rule for settings. That is the mark's geometry at 20 px,
 * which is why they are not imported from an icon package.
 *
 * They live in one file so the family cannot drift: a 20-unit box, a 1.4 stroke, round caps, and
 * `currentColor` throughout. A glyph written inline in a component is how a fifth stroke weight
 * gets into the product.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  )
}

export const DashboardIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="5.5" cy="6" r="2.5" fill="currentColor" />
    <circle cx="14.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="5.5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14.5" cy="14" r="2.5" fill="currentColor" />
  </Icon>
)

export const NewCheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10 6.75v6.5M6.75 10h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

export const RecordsIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6.5 8h7M6.5 11h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 7h13M3.5 13h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="7.5" cy="7" r="2.25" fill="currentColor" />
    <circle cx="12.5" cy="13" r="2.25" fill="currentColor" />
  </Icon>
)

export const SidebarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 4v12" stroke="currentColor" strokeWidth="1.4" />
  </Icon>
)

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.4" />
    <path d="m12.6 12.6 3.1 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

export const BellIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M5.5 8.5a4.5 4.5 0 0 1 9 0v3l1.2 2.2H4.3L5.5 11.5z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M8.3 15.8a1.9 1.9 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="10" cy="10" r="3.5" fill="currentColor" />
    <path
      d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </Icon>
)

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M16 12.3A6.5 6.5 0 0 1 7.7 4a6.5 6.5 0 1 0 8.3 8.3z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </Icon>
)

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </Icon>
)

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </Icon>
)

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 10h11M11 5.5 15.5 10 11 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5 6.5 10l5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)

// A reader speaking is the filled bubble the product already uses for a chosen option, with the
// carry of a voice drawn off it. Muted keeps the bubble and cuts the carry, so the two glyphs read
// as one state changing rather than two unrelated symbols.
export const VoiceOnIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7" cy="10" r="3" fill="currentColor" />
    <path
      d="M12 7.2a4 4 0 0 1 0 5.6M14.6 5a7.5 7.5 0 0 1 0 10"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </Icon>
)

export const VoiceOffIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7" cy="10" r="3" fill="currentColor" />
    <path d="M12.5 8l4 4M16.5 8l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
)
