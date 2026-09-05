import { useRef, useState } from 'react'
import type { ItemVerdict, VerdictCounts } from '../../shared/types'
import { VerdictChip } from './VerdictChip'

// Attention verdicts first and Clear last, so the row reads in the order the educator should
// work through it. FR-RECORD-3, DESIGN.md Layout.
export const VERDICT_FILTERS: ItemVerdict[] = [
  'possible_key_error',
  'possible_ambiguity',
  'split_opinion',
  'unverified',
  'clear'
]

export const ATTENTION_VERDICTS: ItemVerdict[] = [
  'possible_key_error',
  'possible_ambiguity',
  'split_opinion',
  'unverified'
]

type Props = {
  counts: VerdictCounts
  active: ItemVerdict | null
  onChange: (verdict: ItemVerdict | null) => void
}

// role="toolbar" is a promise: one tab stop, arrow keys inside. Declaring it without the roving
// tabindex tells a screen reader to expect movement that never happens, which is worse than
// leaving the role off. DESIGN.md Accessibility.
export function VerdictFilters({ counts, active, onChange }: Props) {
  const [focusIndex, setFocusIndex] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function move(to: number) {
    const index = (to + VERDICT_FILTERS.length) % VERDICT_FILTERS.length
    setFocusIndex(index)
    buttons.current[index]?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') move(focusIndex + 1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') move(focusIndex - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(VERDICT_FILTERS.length - 1)
    else return
    event.preventDefault()
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Filter items by verdict"
      onKeyDown={onKeyDown}
    >
      {VERDICT_FILTERS.map((verdict, index) => (
        <button
          key={verdict}
          ref={(node) => {
            buttons.current[index] = node
          }}
          type="button"
          tabIndex={index === focusIndex ? 0 : -1}
          aria-pressed={active === verdict}
          onFocus={() => setFocusIndex(index)}
          onClick={() => onChange(active === verdict ? null : verdict)}
          className="cursor-pointer rounded-bubble"
        >
          <VerdictChip verdict={verdict} count={counts[verdict]} active={active === verdict} />
        </button>
      ))}
    </div>
  )
}
