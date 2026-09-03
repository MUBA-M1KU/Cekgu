import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { ItemVerdict, RecordDetail } from '../../shared/types'
import { getSample } from '../api'
import { ItemRow } from '../components/ItemRow'
import { Sheet } from '../components/Sheet'
import { VerdictFilters } from '../components/VerdictFilters'
import { count } from '../plural'

// FR-SAMPLE-4: reachable signed out, read-only, with the evidence and request ids visible.
// ItemRow in readOnly mode does not render the disposition group at all, rather than disabling it.
export function SampleReport() {
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<ItemVerdict | null>(null)

  useEffect(() => {
    getSample()
      .then(setRecord)
      .catch(() => setFailed(true))
  }, [])

  if (failed) {
    return (
      <Sheet>
        <h1>Sample Report</h1>
        <p className="type-body mt-3 text-ink-muted">We could not load the sample report just now.</p>
      </Sheet>
    )
  }

  if (!record) {
    return (
      <Sheet>
        <p className="type-body text-ink-muted">Loading the sample report.</p>
      </Sheet>
    )
  }

  const ordered = [...record.items].sort((a, b) => {
    const rank = (verdict: ItemVerdict) => (verdict === 'clear' ? 1 : 0)
    return rank(a.verdict) - rank(b.verdict) || a.position - b.position
  })
  const shown = filter ? ordered.filter((item) => item.verdict === filter) : ordered

  const noop = async () => {}

  return (
    <Sheet>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0">{record.title}</h1>
          <span className="status-chip type-label">Sample</span>
        </div>
        <p className="type-caption mt-2 text-ink-muted">
          {record.subject} · {count(record.items.length, 'question')}
        </p>
        <p className="type-body mt-3 max-w-[66ch]">
          This is a real review record, kept as it was produced. Open any item to see both readings, the model that
          served each one, and its Gonka request id. You can check a request id against the public receipt yourself.
        </p>
      </header>

      <h2 className="mt-8">Summary</h2>
      <VerdictFilters counts={record.counts} active={filter} onChange={setFilter} />

      <h2 className="mt-8">Items</h2>
      <ul className="mt-4 m-0 list-none p-0">
        {shown.map((item) => (
          <ItemRow key={item.id} item={item} onDisposition={noop} onRetry={noop} readOnly />
        ))}
      </ul>

      <p className="type-body mt-8 border-t border-rule pt-5 max-w-[64ch] text-ink-muted">
        Want to run your own?{' '}
        <Link to="/sign-in" className="underline">
          Sign In as Guest
        </Link>{' '}
        and type a few questions. Nothing here is a claim that the paper is correct, only that two independent readers
        looked at it.
      </p>
    </Sheet>
  )
}
