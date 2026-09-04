import { useState } from 'react'
import type { DispositionInput } from '../../shared/schemas'
import type { Attempt, Item } from '../../shared/types'
import { DispositionGroup, dispositionLabel } from './DispositionGroup'
import { EvidencePanel } from './EvidencePanel'
import { ReadRow } from './ReadRow'
import { StatusChip } from './StatusChip'
import { VerdictChip } from './VerdictChip'

type Props = {
  item: Item
  onDisposition: (itemId: string, input: DispositionInput) => Promise<void>
  onRetry: (itemId: string) => Promise<void>
  readOnly?: boolean
}

const FAIL_CLOSED = 'Two independent, receipt-verified readings are required before Cekgu gives a verdict.'

// Distinctness is proven by the receipt, so the two seats are chosen on served model. EvidencePanel
// below applies the same rule, and the row and the panel must name the same reader B.
function admittedSeats(item: Item): Attempt[] {
  const seats: Attempt[] = []
  for (const attempt of item.attempts) {
    if (!attempt.admitted || !attempt.reading) continue
    if (seats.some((chosen) => chosen.servedModel === attempt.servedModel)) continue
    seats.push(attempt)
    if (seats.length === 2) break
  }
  return seats
}

// A level-0 row: hairline separated, numbered with the paper's own item number in a left gutter.
// The numbering is the paper's, so it is allowed. DESIGN.md Layout.
export function ItemRow({ item, onDisposition, onRetry, readOnly }: Props) {
  const [busy, setBusy] = useState(false)
  const [showEvidence, setShowEvidence] = useState(false)
  const latest = item.dispositions.at(-1)
  const needsDecision = item.verdict !== 'clear' && item.verdict !== 'pending'

  // A clean item is the control, not the work. On the sample paper nine of twelve come back Clear,
  // and giving each of them a stem, a reading row, a sentence and a button buries the three that
  // are actually asking something behind nine hundred pixels of nothing-is-wrong. So a Clear item
  // with no decision on it collapses to one line, and opening it gives back the whole row —
  // including the evidence, which stays reachable on every item because the receipts are the
  // product's claim and a judge must be able to open any of them.
  const [open, setOpen] = useState(false)
  const quiet = item.verdict === 'clear' && item.status === 'done' && !latest && !open

  if (quiet) {
    return (
      <li className="border-t border-rule">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="flex w-full items-center gap-3 py-3 text-left sm:gap-4"
        >
          <span className="type-mono w-7 shrink-0 text-ink-muted sm:w-10">{item.position}</span>
          <ReadRow
            options={item.options}
            keyLetter={item.key}
            readerA={admittedSeats(item)[0]?.reading?.answer ?? null}
            readerB={admittedSeats(item)[1]?.reading?.answer ?? null}
            condensed
          />
          <span className="type-body min-w-0 flex-1 truncate">{item.stem}</span>
          <VerdictChip verdict={item.verdict} />
        </button>
      </li>
    )
  }

  async function record(input: DispositionInput) {
    setBusy(true)
    await onDisposition(item.id, input)
    setBusy(false)
  }

  return (
    <li className="flex gap-3 border-t border-rule py-5 sm:gap-4">
      <span className="type-mono w-7 shrink-0 text-ink-muted sm:w-10">{item.position}</span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <p className="type-lead min-w-0">{item.stem}</p>
          <span className="flex shrink-0 flex-wrap items-center gap-2">
            {item.status === 'done' ? <VerdictChip verdict={item.verdict} /> : <StatusChip status={item.status} />}
            {latest ? <span className="status-chip type-label">{dispositionLabel(latest.kind)}</span> : null}
          </span>
        </div>

        {/* The key and both readings in one row of letters: filled is what you keyed, and each
            ring is a reader that chose that option. Two rings landing off the fill is the whole
            reason this screen exists, and it should be visible before the sentence is read. */}
        <div className="mt-3">
          <ReadRow
            options={item.options}
            keyLetter={item.key}
            readerA={admittedSeats(item)[0]?.reading?.answer ?? null}
            readerB={admittedSeats(item)[1]?.reading?.answer ?? null}
          />
        </div>

        {item.verdictReason ? <p className="mt-3 max-w-[70ch]">{item.verdictReason}</p> : null}
        {item.verdict === 'unverified' ? (
          <p className="mt-2 max-w-[70ch] type-caption text-ink-muted">{FAIL_CLOSED}</p>
        ) : null}

        {latest?.revisedKey ? (
          <p className="mt-2 type-caption text-ink-muted">
            You corrected the key to {latest.revisedKey}. The machine verdict above is unchanged.
          </p>
        ) : null}

        {!readOnly && item.verdict === 'unverified' ? (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              await onRetry(item.id)
              setBusy(false)
            }}
            className="mt-3 inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium disabled:opacity-60"
          >
            Retry Verification
          </button>
        ) : null}

        {item.attempts.length > 0 ? (
          <button
            type="button"
            aria-expanded={showEvidence}
            onClick={() => setShowEvidence((open) => !open)}
            className="type-label mt-3 inline-flex h-9 items-center rounded-control border border-rule-strong px-4"
          >
            {showEvidence ? 'Hide Evidence' : 'Show Evidence'}
          </button>
        ) : null}

        {showEvidence ? <EvidencePanel item={item} /> : null}

        {!readOnly && needsDecision && !latest ? (
          <DispositionGroup options={item.options} onRecord={record} busy={busy} />
        ) : null}
      </div>
    </li>
  )
}
