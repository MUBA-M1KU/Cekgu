import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import type { DispositionInput } from '../../shared/schemas'
import type { ItemVerdict, RecordDetail } from '../../shared/types'
import { getRecord, recordDisposition, retryItem, subscribeToRecord } from '../api'
import { ItemRow } from '../components/ItemRow'
import { Sheet } from '../components/Sheet'
import { StatusChip } from '../components/StatusChip'
import { ATTENTION_VERDICTS, VerdictFilters } from '../components/VerdictFilters'
import { Mascot } from '../mascot/Mascot'
import { count } from '../plural'

// Attention verdicts first and Clear last, so the filter row reads in the order the educator
// should work through it. FR-RECORD-3, DESIGN.md Layout.
export function RecordWorkspace() {
  const { id = '' } = useParams()
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<ItemVerdict | null>(null)

  const load = useCallback(() => {
    getRecord(id)
      .then(setRecord)
      .catch(() => setFailed(true))
  }, [id])

  useEffect(load, [load])
  useEffect(() => subscribeToRecord(id, load), [id, load])

  if (failed) {
    return (
      <Sheet>
        <h1>Record</h1>
        <p className="mt-3 type-body text-ink-muted">We could not open this record. It may have expired.</p>
      </Sheet>
    )
  }

  if (!record) {
    return (
      <Sheet>
        <p className="type-body text-ink-muted">Opening this record.</p>
      </Sheet>
    )
  }

  const attentionCount = ATTENTION_VERDICTS.reduce((total, verdict) => total + record.counts[verdict], 0)
  const ordered = [...record.items].sort((a, b) => {
    const rank = (verdict: ItemVerdict) => (verdict === 'clear' ? 1 : 0)
    return rank(a.verdict) - rank(b.verdict) || a.position - b.position
  })
  const shown = filter ? ordered.filter((item) => item.verdict === filter) : ordered

  async function onDisposition(itemId: string, input: DispositionInput) {
    setRecord(await recordDisposition(id, itemId, input))
  }

  async function onRetry(itemId: string) {
    setRecord(await retryItem(id, itemId))
  }

  return (
    <Sheet>
      <header>
        {/* data-mascot-slot is where Mascot.tsx portals the compact badge. */}
        <div data-mascot-slot className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0">{record.title}</h1>
          <StatusChip status={record.status} />
          {record.isSample ? <span className="status-chip type-label">Sample</span> : null}
        </div>
        <p className="mt-2 type-caption text-ink-muted">
          {record.subject} · {record.language === 'ms' ? 'Bahasa Malaysia' : 'English'} ·{' '}
          {count(record.items.length, 'question')}
        </p>
        {record.isSample ? (
          <p className="mt-2 max-w-[70ch] type-caption text-ink-muted">
            This record is preserved benchmark evidence. Its questions, readings and verdicts cannot be edited or
            deleted.
          </p>
        ) : null}
      </header>

      <h2 className="mt-8">Summary</h2>
      {/* The chips are both the summary counts and the filter, so the same numbers are never
          printed twice. DESIGN.md Layout. */}
      <div className="flex flex-wrap items-baseline gap-x-4">
        <VerdictFilters counts={record.counts} active={filter} onChange={setFilter} />
        {/* The number asking for a decision, so it is the one count in pen red. DESIGN.md Colour. */}
        <p className="type-label mt-4 ml-auto text-pen">
          {attentionCount} {attentionCount === 1 ? 'item needs' : 'items need'} attention
        </p>
      </div>

      <h2 className="mt-8">Items</h2>
      {shown.length === 0 ? (
        <div className="py-12">
          <p className="type-body text-ink-muted">No items match this filter.</p>
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="mt-4 inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink"
          >
            Show All Items
          </button>
        </div>
      ) : (
        <ul className="mt-4 m-0 list-none p-0">
          {shown.map((item) => (
            <ItemRow key={item.id} item={item} onDisposition={onDisposition} onRetry={onRetry} readOnly={false} />
          ))}
        </ul>
      )}

      <Mascot record={record} />
    </Sheet>
  )
}
