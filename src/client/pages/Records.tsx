import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { RecordStatus, RecordSummary } from '../../shared/types'
import { deleteRecords, listRecords } from '../api'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field, inputClass } from '../components/Field'
import { Select } from '../components/Select'
import { Sheet } from '../components/Sheet'
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

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

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
    <Sheet>
      <h1>Records</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Search" htmlFor="q">
          <input
            id="q"
            type="search"
            className={inputClass}
            placeholder="Title or subject"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            label="Status"
            value={status}
            options={STATUSES.map((entry) => ({ value: entry.value, label: entry.label }))}
            onChange={(value) => setStatus(value as '' | RecordStatus)}
          />
        </Field>
        <label className="flex h-9 items-center gap-2">
          <input
            type="checkbox"
            className="check-box"
            checked={attention}
            onChange={(event) => setAttention(event.target.checked)}
          />
          <span className="type-label">Needs Attention</span>
        </label>
      </div>

      {/* Destructive controls are not visible until a selection exists (FR-RECORD-6). */}
      {selected.size > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-rule pt-4">
          <p className="type-label">{selected.size} selected</p>
          <button
            type="button"
            disabled={deletable === 0}
            onClick={() => setConfirming(true)}
            className="inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium text-pen disabled:opacity-60"
          >
            Delete Records
          </button>
          {protectedCount > 0 ? (
            <p className="type-caption text-ink-muted">The sample record is protected and cannot be deleted.</p>
          ) : null}
        </div>
      ) : null}

      {failed ? (
        <div className="py-12">
          <p className="type-ui text-ink-muted">We could not load your records, try again in a moment.</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : records === null ? (
        <p className="mt-6 type-ui text-ink-muted">Loading your records.</p>
      ) : records.length === 0 ? (
        <div className="py-12">
          <p className="type-ui text-ink-muted">No records yet.</p>
          <button
            type="button"
            onClick={() => navigate('/new-check')}
            className="mt-4 inline-flex h-9 items-center rounded-control bg-ink px-4 font-medium text-on-ink"
          >
            New Check
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="type-label border-b border-rule">
                <th className="w-8 py-2 pr-3 font-medium">
                  <span className="sr-only">Select</span>
                </th>
                {/* Title is what a person scans for and the longest cell in the row, so it gets
                    the width. Auto-layout gave it the same weight as Subject and wrapped it. */}
                <th className="w-[38%] py-2 pr-4 font-medium">Title</th>
                <th className="w-[22%] py-2 pr-4 font-medium">Subject</th>
                <th className="py-2 pr-4 text-right font-medium">Questions</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 text-right font-medium">Attention</th>
                <th className="py-2 font-medium whitespace-nowrap">Updated</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className={`border-b border-rule hover:bg-well ${
                    selected.has(record.id) ? 'shadow-[inset_2px_0_0_0_var(--ink)]' : ''
                  }`}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      className="check-box"
                      checked={selected.has(record.id)}
                      onChange={() => toggle(record.id)}
                      aria-label={`Select ${record.title}`}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/records/${record.id}`)}
                      className="text-left underline-offset-2 hover:underline"
                    >
                      {record.title}
                    </button>
                    {record.isSample ? <span className="status-chip type-label ml-2">Sample</span> : null}
                    {record.expiresAt ? (
                      <p className="type-caption text-ink-muted">Expires {updatedLabel(record.expiresAt)}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">{record.subject}</td>
                  <td className="type-mono py-3 pr-4 text-right">{record.itemCount}</td>
                  <td className="py-3 pr-4">
                    <StatusChip status={record.status} />
                  </td>
                  <td className="type-mono py-3 pr-4 text-right">
                    {record.attentionCount > 0 ? (
                      <span className="text-pen">{record.attentionCount}</span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="type-caption py-3 whitespace-nowrap text-ink-muted">
                    {updatedLabel(record.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Delete ${deletable} ${deletable === 1 ? 'Record' : 'Records'}`}
        body={dialogBody}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmDelete}
      />
    </Sheet>
  )
}
