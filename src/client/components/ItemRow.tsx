import { useState } from 'react'
import type { DispositionInput } from '../../shared/schemas'
import type { Item } from '../../shared/types'
import { BubbleRow } from './BubbleRow'
import { DispositionGroup, dispositionLabel } from './DispositionGroup'
import { StatusChip } from './StatusChip'
import { VerdictChip } from './VerdictChip'

type Props = {
  item: Item
  onDisposition: (itemId: string, input: DispositionInput) => Promise<void>
  onRetry: (itemId: string) => Promise<void>
  readOnly?: boolean
}

const FAIL_CLOSED = 'Two independent, receipt-verified readings are required before Cekgu gives a verdict.'

// A level-0 row: hairline separated, numbered with the paper's own item number in a left gutter.
// The numbering is the paper's, so it is allowed. DESIGN.md Layout.
export function ItemRow({ item, onDisposition, onRetry, readOnly }: Props) {
  const [busy, setBusy] = useState(false)
  const latest = item.dispositions.at(-1)
  const needsDecision = item.verdict !== 'clear' && item.verdict !== 'pending'

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

        <div className="mt-3">
          <BubbleRow options={item.options} filled={item.key} label={`Supplied key for question ${item.position}`} />
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
            className="mt-3 inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium disabled:opacity-60"
          >
            Retry Verification
          </button>
        ) : null}

        {!readOnly && needsDecision && !latest ? (
          <DispositionGroup options={item.options} onRecord={record} busy={busy} />
        ) : null}
      </div>
    </li>
  )
}
