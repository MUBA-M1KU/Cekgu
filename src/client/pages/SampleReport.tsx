import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { ItemVerdict, RecordDetail } from '../../shared/types'
import { getSample } from '../api'
import { Card, CardBody, CardHead } from '../components/Card'
import { ItemRow } from '../components/ItemRow'
import { ArrowRightIcon } from '../components/icons'
import { TruthScoreSummary } from '../components/TruthScore'
import { VerdictFilters } from '../components/VerdictFilters'
import { count } from '../plural'

/**
 * FR-SAMPLE-4: reachable signed out, read-only, with the evidence and request ids visible.
 * ItemRow in readOnly mode does not render the disposition group at all, rather than disabling it.
 *
 * Three cards rather than one document: what this record is, what the readers found, and the
 * questions themselves. The filters belong to the middle one because they act on the third, and a
 * reader who has scrolled into the items can still see which filter is on by scrolling back to
 * one card rather than to the top of a page.
 */
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
      <Card>
        <CardBody>
          <h1 className="page-title">Sample Report</h1>
          <p className="type-ui text-ink-muted">We could not load the sample report just now.</p>
        </CardBody>
      </Card>
    )
  }

  if (!record) {
    return (
      <Card>
        <CardBody>
          <div className="skeleton h-7 w-2/5" />
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-24 w-full" />
        </CardBody>
      </Card>
    )
  }

  const ordered = [...record.items].sort((a, b) => {
    const rank = (verdict: ItemVerdict) => (verdict === 'clear' ? 1 : 0)
    return rank(a.verdict) - rank(b.verdict) || a.position - b.position
  })
  const shown = filter ? ordered.filter((item) => item.verdict === filter) : ordered
  const attention = record.items.length - record.counts.clear

  const noop = async () => {}

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">{record.title}</h1>
            <span className="status-chip type-caption">Sample</span>
          </div>
          <p className="type-caption mt-2 text-ink-muted">
            {record.subject} · {count(record.items.length, 'question')}
          </p>
          <p className="page-sub type-body max-w-[70ch]">
            This is a real review record, kept as it was produced. Open any item to see both readings, the model that
            served each one, and its Gonka request id. You can check a request id against the public receipt yourself.
          </p>
        </div>
        <Link to="/sign-in" className="btn btn-primary">
          Sign In as Guest
          <ArrowRightIcon size={15} />
        </Link>
      </header>

      <div className="page-grid">
        <Card className="col-span-12">
          <CardHead
            title="Summary"
            description={
              attention > 0
                ? `${count(attention, 'question')} came back with something worth a second look. Pick one to see only those.`
                : 'Every question came back Clear.'
            }
          />
          <CardBody>
            <TruthScoreSummary score={record.truthScore} />
            <VerdictFilters counts={record.counts} active={filter} onChange={setFilter} />
          </CardBody>
        </Card>

        <Card className="col-span-12" flush>
          <CardHead
            title="Items"
            action={
              filter ? (
                <button type="button" onClick={() => setFilter(null)} className="btn btn-ghost btn-sm">
                  Show All Questions
                </button>
              ) : undefined
            }
          />
          {/* Same construction as the review document, and the same reason for no border-t: every
              ItemRow opens on one already. */}
          <ul className="m-0 list-none p-0 px-6">
            {shown.map((item) => (
              <ItemRow key={item.id} item={item} onDisposition={noop} onRetry={noop} readOnly />
            ))}
          </ul>
          <div className="card-foot mt-0">
            <p className="type-ui max-w-[64ch] text-ink-muted">
              Want to run your own? Sign in as a guest and type a few questions. Nothing here is a claim that the paper
              is correct, only that two independent readers looked at it.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
