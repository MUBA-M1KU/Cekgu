import { useId } from 'react'
import type { Option } from '../../shared/types'

const BUBBLE = 'inline-flex h-7 w-7 items-center justify-center rounded-bubble type-label transition-colors'

type Props = {
  options: Option[]
  /** The filled bubble: the supplied key in an item row, the reader's choice in an evidence column. */
  filled: string | null
  /** Supply to make it a real radiogroup; omit for the read-only rows in review and evidence. */
  onSelect?: (letter: string) => void
  label: string
}

function tone(isFilled: boolean) {
  return isFilled ? 'bg-ink text-on-ink' : 'border border-rule-strong text-ink'
}

// A horizontal run of round bubbles labelled A to F, one per option. In the item row it shows the
// key; in each evidence column it shows that reader's choice, so a key error is visible as two
// readers filling the same bubble the key did not. DESIGN.md Components.
export function BubbleRow({ options, filled, onSelect, label }: Props) {
  const name = useId()

  // Read-only: the bubbles are a picture of a state that is already named in text beside them,
  // so they carry one visually hidden sentence rather than a fake radiogroup.
  if (!onSelect) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="sr-only">
          {label}: {filled ?? 'none'}
        </span>
        {options.map((option) => (
          <span key={option.letter} aria-hidden="true" className={`${BUBBLE} ${tone(option.letter === filled)}`}>
            {option.letter}
          </span>
        ))}
      </div>
    )
  }

  // Native radios, so arrow-key movement and the group semantics come from the browser
  // rather than from ARIA we would have to keep correct ourselves (NFR-UX-2).
  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.letter}
          className={`${BUBBLE} ${tone(option.letter === filled)} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]`}
        >
          <input
            type="radio"
            name={name}
            value={option.letter}
            checked={option.letter === filled}
            onChange={() => onSelect(option.letter)}
            className="sr-only"
          />
          {option.letter}
        </label>
      ))}
    </fieldset>
  )
}
