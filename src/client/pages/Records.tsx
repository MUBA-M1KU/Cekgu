import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { RecordStatus, RecordSummary } from '../../shared/types'
import { deleteRecords, listRecords } from '../api'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PlusIcon, SearchIcon, TrashIcon } from '../components/icons'
import { Select } from '../components/Select'
import { StatusChip } from '../components/StatusChip'
import { useSession } from '../session'

const STATUSES: { value: '' | RecordStatus; label: string }[] = [
  { value: '', label: 'Any Status' },
  { value: 'queued', label: 'Queued' },
  { value: 'checking', label: 'Checking' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' }
]

const COLUMNS = 7

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * The library.
 *
 * The filters sit in the table's own header rather than as a form above a separate slab, because
 * they act on the rows below them and nothing else on the page. The bulk toolbar takes the same
 * strip over once a selection exists, so a destructive control never appears in a place the
 * reader was not already looking.
 */
export function Records() {
  const navigate = useNavigate()
  const session = useSession()
  const isGuest = session.status === 'in' && session.isGuest

  const [records, setRecords] = useState<RecordSummary[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'' | RecordStatus>('')
  const [attention, setAttention] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)

  const load = useCallback(() => {
    setFailed(false)
    listRecords({ q: q || undefined, status: status || undefined, attention: attention || undefined })
      .then(setRecords)
      // An empty library and an unreachable server are different facts. Reporting the second as
      // the first would have a judge read "No records yet." during an outage.
      .catch(() => setFailed(true))
  }, [q, status, attention])

  useEffect(load, [load])

  const chosen = records?.filter((record) => selected.has(record.id)) ?? []
  const protectedCount = chosen.filter((record) => record.isSample).length
  const deletable = chosen.length - protectedCount
  const filtering = q !== '' || status !== '' || attention

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function confirmDelete() {
    await deleteRecords([...selected])
    setSelected(new Set())
    setConfirming(false)
    load()
  }

  // FR-RECORD-7: the confirmation states which recovery behaviour applies to this account.
  const dialogBody = [
    deletable === 1
      ? 'This record will be removed from your library.'
      : 'These records will be removed from your library.',
    isGuest ? 'Guest deletion is immediate and there is no recovery.' : 'They will move to Trash for 30 days.',
    ...(protectedCount > 0 ? ['The sample record is protected and will be skipped.'] : [])
  ]

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <h1 className="page-title">Records</h1>
          <p className="page-sub">
            Every paper this account has put through the readers, and what each one is waiting on.
          </p>
        </div>
        <Link to="/new-check" className="btn btn-primary sm:hidden">
          <PlusIcon size={15} />
          New Check
        </Link>
      </header>

      <Card flush>
        {/* One strip, two states. A selection replaces the filters rather than pushing them down
            the page, so the row count under the reader's cursor does not move when they tick a
            box. FR-RECORD-6. */}
        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-rule px-6 py-3">
            <p className="type-label">{selected.size} selected</p>
            <button
              type="button"
              disabled={deletable === 0}
              onClick={() => setConfirming(true)}
              className="btn btn-danger btn-sm"
            >
              <TrashIcon size={15} />
              Delete Records
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="btn btn-ghost btn-sm">
              Clear Selection
            </button>
            {protectedCount > 0 ? (
              <p className="type-caption text-ink-muted">The sample record is protected and cannot be deleted.</p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-b border-rule px-6 py-3">
            <div className="relative min-w-[13rem] flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
                <SearchIcon size={16} />
              </span>
              <input
                id="q"
                type="search"
                aria-label="Search records"
                className="h-9 w-full rounded-control border border-rule-strong bg-transparent pr-3 pl-9 text-ink placeholder:text-ink-muted"
                placeholder="Title or subject"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
            <div className="w-[11rem]">
              <Select
                id="status"
                label="Status"
                value={status}
                options={STATUSES.map((entry) => ({ value: entry.value, label: entry.label }))}
                onChange={(value) => setStatus(value as '' | RecordStatus)}
              />
            </div>
            <label className="flex h-9 shrink-0 items-center gap-2">
              <input
                type="checkbox"
                className="check-box"
                checked={attention}
                onChange={(event) => setAttention(event.target.checked)}
              />
              <span className="type-label">Needs Attention</span>
            </label>
          </div>
        )}

        {failed ? (
          <div className="state-block">
            <p className="type-ui">We could not load your records, try again in a moment.</p>
            <button type="button" onClick={load} className="btn btn-outline btn-sm">
              Try Again
            </button>
          </div>
        ) : records === null ? (
          /* A skeleton in the shape of the rows that are coming, so the table does not jump when
             they land. */
          <div className="px-6 py-1">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 border-b border-rule py-4 last:border-b-0">
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-16" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="state-block" data-centre="true">
            <p className="type-ui">{filtering ? 'No record matches those filters.' : 'No records yet.'}</p>
            {filtering ? (
              <button
                type="button"
                onClick={() => {
                  setQ('')
                  setStatus('')
                  setAttention(false)
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/new-check')} className="btn btn-primary btn-sm">
                <PlusIcon size={15} />
                New Check
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="type-label">
                  <th className="w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  {/* Title is what a person scans for and the longest cell in the row, so it gets
                      the width. Auto-layout gave it the same weight as Subject and wrapped it. */}
                  <th className="w-[34%]">Title</th>
                  <th className="w-[20%]">Subject</th>
                  <th className="num">Questions</th>
                  <th>Status</th>
                  <th className="num">Attention</th>
                  <th className="whitespace-nowrap">Updated</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} data-selected={selected.has(record.id) ? 'true' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        className="check-box"
                        checked={selected.has(record.id)}
                        onChange={() => toggle(record.id)}
                        aria-label={`Select ${record.title}`}
                      />
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/records/${record.id}`)}
                          className="type-label text-left underline-offset-2 hover:underline"
                        >
                          {record.title}
                        </button>
                        {record.isSample ? <span className="status-chip type-caption">Sample</span> : null}
                      </div>
                      {record.expiresAt ? (
                        <p className="type-caption mt-1 text-ink-muted">Expires {updatedLabel(record.expiresAt)}</p>
                      ) : null}
                    </td>
                    <td className="text-ink-muted">{record.subject}</td>
                    <td className="num type-mono">{record.itemCount}</td>
                    <td>
                      <StatusChip status={record.status} />
                    </td>
                    <td className="num type-mono">
                      {record.attentionCount > 0 ? (
                        <span className="text-pen">{record.attentionCount}</span>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                    <td className="type-caption whitespace-nowrap text-ink-muted">{updatedLabel(record.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={COLUMNS} className="type-caption border-t border-rule text-ink-muted">
                    {records.length === 1 ? '1 record' : `${records.length} records`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirming}
        title={`Delete ${deletable} ${deletable === 1 ? 'Record' : 'Records'}`}
        body={dialogBody}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
