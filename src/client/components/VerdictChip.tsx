import type { CSSProperties } from 'react'
import type { ItemVerdict } from '../../shared/types'

type VerdictMeta = { label: string; token: string }

// The label is the full verdict name; DESIGN.md forbids abbreviating it to a glyph or an initial.
const VERDICTS: Record<ItemVerdict, VerdictMeta> = {
  clear: { label: 'Clear', token: '--verdict-clear' },
  possible_key_error: { label: 'Possible Key Error', token: '--verdict-key-error' },
  possible_ambiguity: { label: 'Possible Ambiguity', token: '--verdict-ambiguity' },
  split_opinion: { label: 'Split Opinion', token: '--verdict-split' },
  unverified: { label: 'Unverified', token: '--verdict-unverified' },
  pending: { label: 'Pending', token: '--verdict-unverified' }
}

export function verdictLabel(verdict: ItemVerdict): string {
  return VERDICTS[verdict].label
}

// Every glyph is drawn from the OMR bubble row, so the chip reads as an answer bubble
// rather than a generic status dot. NFR-UX-3: never colour alone. The glyph is decorative
// because the chip already carries the full verdict name as text.
function Glyph({ verdict }: { verdict: ItemVerdict }) {
  switch (verdict) {
    case 'clear':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width={12} height={12}>
          <circle cx="8" cy="8" r="5" fill="currentColor" />
        </svg>
      )
    case 'possible_key_error':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 26 16" width={20} height={12}>
          <circle cx="6" cy="8" r="5" fill="currentColor" />
          <circle cx="20" cy="8" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'possible_ambiguity':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 26 16" width={20} height={12}>
          <circle cx="6" cy="8" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 3.75a4.25 4.25 0 0 0 0 8.5z" fill="currentColor" />
          <circle cx="20" cy="8" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 3.75a4.25 4.25 0 0 0 0 8.5z" fill="currentColor" />
        </svg>
      )
    case 'split_opinion':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 30 16" width={23} height={12}>
          <circle cx="9" cy="8" r="4.5" fill="currentColor" />
          <circle cx="21" cy="8" r="4.5" fill="currentColor" />
          <path d="M3.5 5.5 1 8l2.5 2.5M26.5 5.5 29 8l-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )
    default:
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width={12} height={12}>
          <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.2" />
        </svg>
      )
  }
}

type Props = { verdict: ItemVerdict; count?: number; active?: boolean }

export function VerdictChip({ verdict, count, active }: Props) {
  const meta = VERDICTS[verdict]
  const style = { '--verdict': `var(${meta.token})` } as CSSProperties

  return (
    <span className="verdict-chip type-label" style={style} data-active={active ? 'true' : undefined}>
      <Glyph verdict={verdict} />
      {meta.label}
      {count === undefined ? null : <span className="type-mono">{count}</span>}
    </span>
  )
}
