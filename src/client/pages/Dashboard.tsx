import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { GUEST_MAX_ITEMS, GUEST_MAX_RECORDS } from '../../shared/schemas'
import type { Health, RecordSummary } from '../../shared/types'
import { getHealth, listRecords } from '../api'
import { Sheet } from '../components/Sheet'
import { StatusChip } from '../components/StatusChip'
import { count } from '../plural'
import { useSession } from '../session'

const RECENT = 5

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// The gateway's own model ids are long and vendor-prefixed. The family is the part a person
// reading a status line cares about; the full id stays in the evidence view where it is proof.
function family(model: string): string {
  return model.split('/')[1]?.split('-')[0] ?? model
}

export function Dashboard() {
  const session = useSession()
  const isGuest = session.status === 'in' && session.isGuest

  const [records, setRecords] = useState<RecordSummary[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    listRecords()
      .then(setRecords)
      // An empty library and an unreachable server are different facts, as on Records.
      .catch(() => setFailed(true))
    // Status is supporting information. If it cannot be fetched the dashboard still works,
    // so a failure here leaves the section out rather than failing the page.
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  const working = records?.filter((record) => record.status === 'queued' || record.status === 'checking') ?? []
  const attention = records?.reduce((total, record) => total + record.attentionCount, 0) ?? 0
  const recent = records?.slice(0, RECENT) ?? []
  const held = records?.filter((record) => !record.isSample).length ?? 0

  return (
    <Sheet>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Dashboard</h1>
          <p className="type-ui mt-2 text-ink-muted">
            {records === null
              ? 'Loading your workspace.'
              : working.length > 0
                ? `${count(working.length, 'check is', 'checks are')} still running. You can leave and come back.`
                : attention > 0
                  ? `${count(attention, 'item needs', 'items need')} your attention.`
                  : 'Nothing is waiting on you.'}
          </p>
        </div>
        <Link
          to="/new-check"
          className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink"
        >
          New Check
        </Link>
      </div>

      {failed ? (
        <p className="type-ui mt-6 text-ink-muted">We could not reach your records, try again in a moment.</p>
      ) : null}

      <h2 className="mt-8">Recent Records</h2>
      {records !== null && recent.length === 0 ? (
        <div className="mt-4">
          <p className="type-ui text-ink-muted">No records yet.</p>
          <Link
            to="/new-check"
            className="mt-4 inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium"
          >
            Check Your First Paper
          </Link>
        </div>
      ) : (
        <ul className="mt-4 m-0 list-none p-0">
          {recent.map((record) => (
            <li key={record.id} className="border-t border-rule">
              <Link to={`/records/${record.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                <span className="type-ui min-w-0 flex-1">{record.title}</span>
                {record.attentionCount > 0 ? (
                  <span className="type-caption text-pen">{record.attentionCount} to review</span>
                ) : null}
                <StatusChip status={record.status} />
                <span className="type-caption text-ink-muted">{updatedLabel(record.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {records !== null && recent.length > 0 ? (
        <Link to="/records" className="mt-4 inline-block type-label underline">
          All Records
        </Link>
      ) : null}

      {isGuest ? (
        <>
          <h2 className="mt-10">Guest Allowance</h2>
          <p className="type-ui mt-3 text-ink-muted">
            {held} of {GUEST_MAX_RECORDS} records held, up to {GUEST_MAX_ITEMS} questions in one check. The protected
            sample does not count against this. Guest records are removed after 24 hours, and the shared workspace is
            visible to everyone.
          </p>
        </>
      ) : null}

      {health ? (
        <>
          <h2 className="mt-10">Model Availability</h2>
          <p className="type-ui mt-3 text-ink-muted">
            Success rate over the last {health.windowMinutes} minutes, per family. A family that is struggling is
            demoted rather than dropped, because one reader cannot produce two independent readings.
          </p>
          <ul className="mt-4 m-0 list-none p-0">
            {health.models.map((model) => (
              <li key={model.model} className="flex flex-wrap items-baseline gap-x-4 border-t border-rule py-2">
                <span className="type-mono min-w-0 flex-1">{family(model.model)}</span>
                <span className="type-caption text-ink-muted">
                  {model.medianLatencyMs === null
                    ? 'no calls in the window'
                    : `${Math.round(model.successRate * 100)}% of calls, median ${(model.medianLatencyMs / 1000).toFixed(1)}s`}
                </span>
                {/* No data is its own state. The health ring reports successRate 1 and healthy
                    true for a family nobody has called, and printing "Available" from that would
                    be a claim with nothing behind it. */}
                <span
                  className={`type-label ${model.medianLatencyMs === null ? 'text-ink-muted' : model.healthy ? 'text-ink-muted' : 'text-pen'}`}
                >
                  {model.medianLatencyMs === null ? 'Not Called Yet' : model.healthy ? 'Available' : 'Degraded'}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Sheet>
  )
}
