import { useId, useState } from 'react'
import type { DispositionInput } from '../../shared/schemas'
import type { DispositionKind, Option } from '../../shared/types'
import { BubbleRow } from './BubbleRow'

const KINDS: { kind: DispositionKind; label: string; note: string }[] = [
  { kind: 'key_corrected', label: 'Key Corrected', note: 'You changed the supplied key.' },
  { kind: 'wording_revised', label: 'Wording Revised', note: 'You changed the stem or the options.' },
  { kind: 'key_confirmed', label: 'Key Confirmed', note: 'You read the evidence and kept the original key.' },
  { kind: 'flag_dismissed', label: 'Flag Dismissed', note: 'The concern was irrelevant or wrong.' },
  { kind: 'retry_requested', label: 'Retry Requested', note: 'This spends another inference round.' }
]

type Props = { options: Option[]; onRecord: (input: DispositionInput) => void; busy: boolean }

/**
 * Five dispositions, one row.
 *
 * They were a vertical radio list with a note under every option, which is 300 px per item and the
 * same 300 px on every flagged item. On the sample paper that is five identical forms stacked down
 * the page, so the reader reads "You changed the supplied key" five times before making one
 * decision, and the questions that are actually asking something are buried under the controls for
 * answering them.
 *
 * One row of five, and the note belongs to the option under consideration rather than to all of
 * them at once. Native radios inside labels, so arrow-key movement and the group semantics come
 * from the browser rather than from ARIA we would have to keep correct (NFR-UX-2).
 *
 * The chosen chip fills pen red, which is the marked disposition bubble at chip scale: DESIGN.md
 * reserves a filled red surface for exactly this and the destructive confirm button.
 */
export function DispositionGroup({ options, onRecord, busy }: Props) {
  const name = useId()
  const [kind, setKind] = useState<DispositionKind | null>(null)
  const [revisedKey, setRevisedKey] = useState<string | null>(null)

  const needsKey = kind === 'key_corrected'
  const blocked = kind === null || (needsKey && revisedKey === null)
  const chosen = KINDS.find((entry) => entry.kind === kind)

  return (
    <div className="disposition">
      <fieldset className="m-0 border-0 p-0">
        <legend className="type-eyebrow text-ink-muted">Your Decision</legend>
        {/* data-tip puts each note on its own chip. The note below the row only ever describes the
            chip already chosen, which is the one a reader no longer needs explained; the choice
            being made is between the other four. */}
        <div className="disposition-row">
          {KINDS.map((entry) => (
            <label
              key={entry.kind}
              className="disposition-chip type-label"
              data-chosen={kind === entry.kind}
              data-tip={entry.note}
            >
              <input
                type="radio"
                name={name}
                checked={kind === entry.kind}
                onChange={() => setKind(entry.kind)}
                className="sr-only"
              />
              {entry.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* The note and the button belong to a decision in progress, so neither exists until a chip is
          chosen. Rendered unconditionally they were five identical placeholder sentences and five
          disabled buttons down the page, which is the same repetition the row was built to remove.
          aria-live because the note replaces itself in place as the reader moves along the row. */}
      <p className="type-caption disposition-note" aria-live="polite">
        {chosen?.note ?? ''}
      </p>

      {chosen ? (
        <button
          type="button"
          disabled={blocked || busy}
          onClick={() => kind && onRecord({ kind, revisedKey, revisedText: null, note: null })}
          className="btn btn-primary btn-sm mt-3"
        >
          Record Decision
        </button>
      ) : null}

      {needsKey ? (
        <div className="disposition-key">
          <p className="type-label">Corrected Key</p>
          <div className="mt-2">
            <BubbleRow options={options} filled={revisedKey} onSelect={setRevisedKey} label="Corrected key" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function dispositionLabel(kind: DispositionKind): string {
  return KINDS.find((entry) => entry.kind === kind)?.label ?? kind
}
