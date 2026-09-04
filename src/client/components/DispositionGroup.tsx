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

// The chosen bubble fills in pen red, because a disposition is the human's mark and red is
// reserved for the human hand. DESIGN.md Colour and Components.
export function DispositionGroup({ options, onRecord, busy }: Props) {
  const name = useId()
  const [kind, setKind] = useState<DispositionKind | null>(null)
  const [revisedKey, setRevisedKey] = useState<string | null>(null)

  const needsKey = kind === 'key_corrected'
  const blocked = kind === null || (needsKey && revisedKey === null)

  return (
    <div className="mt-4">
      <fieldset className="m-0 border-0 p-0">
        <legend className="type-eyebrow text-ink-muted">Your Decision</legend>
        <div className="mt-3 flex flex-col gap-3">
          {KINDS.map((entry) => (
            <label key={entry.kind} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name={name}
                checked={kind === entry.kind}
                onChange={() => setKind(entry.kind)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-block h-5 w-5 shrink-0 rounded-bubble border ${
                  kind === entry.kind ? 'border-pen bg-pen' : 'border-rule-strong'
                }`}
              />
              <span>
                <span className="type-label block">{entry.label}</span>
                <span className="type-caption text-ink-muted">{entry.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {needsKey ? (
        <div className="mt-4">
          <p className="type-label">Corrected Key</p>
          <div className="mt-2">
            <BubbleRow options={options} filled={revisedKey} onSelect={setRevisedKey} label="Corrected key" />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={blocked || busy}
        onClick={() => kind && onRecord({ kind, revisedKey, revisedText: null, note: null })}
        className="mt-4 inline-flex h-9 items-center rounded-control bg-ink px-4 font-medium text-on-ink disabled:opacity-60"
      >
        Record Decision
      </button>
    </div>
  )
}

export function dispositionLabel(kind: DispositionKind): string {
  return KINDS.find((entry) => entry.kind === kind)?.label ?? kind
}
