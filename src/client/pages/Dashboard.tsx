import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Health, RecordSummary } from '../../shared/types'
import { getHealth, listRecords } from '../api'
import { Card, CardBody, CardHead } from '../components/Card'
import { ArrowRightIcon } from '../components/icons'
import { StatusChip } from '../components/StatusChip'

const RECENT = 5

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// The gateway's own model ids are long and vendor-prefixed. The family is the part a person
// reading a status line cares about; the full id stays in the evidence view where it is proof.
function family(model: string): string {
  return model.split('/')[1]?.split('-')[0] ?? model
}

/**
 * A figure and what it counts. No icon tile and no trend badge: this product has no week on week
 * number to put in one, and a percentage nothing measured is the fastest way to tell a reader the
 * screen is a template with the data still to come.
 */
function Stat({ label, value, note, pen }: { label: string; value: string; note?: string; pen?: boolean }) {
  return (
    <Card className="col-span-12 sm:col-span-6 xl:col-span-3">
      <div>
        <p className="type-eyebrow stat-label">{label}</p>
        <p className="stat-value" data-pen={pen ? 'true' : undefined}>
          {value}
        </p>
        {note ? <p className="type-caption stat-note">{note}</p> : null}
      </div>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card className="col-span-12 sm:col-span-6 xl:col-span-3">
      <div>
        <p className="type-eyebrow stat-label">Loading</p>
        <div className="skeleton mt-2 h-7 w-20" />
        <div className="skeleton mt-3 h-3 w-32" />
      </div>
    </Card>
  )
}

/**
 * Where you land after signing in.
 *
 * Four figures across the top, then the two things that are actually happening: which readers are
 * answering, and which records moved last. The New Check and All Records cards this page used to
 * carry are gone because both destinations are now in the shell on every screen, and a card whose
 * only job is to be a link is a card the reader has to read before they can ignore it.
 *
 * THE READER PANEL IS THE POINT OF THIS SCREEN. It carries the model families and whether they
 * are answering, because that is the one thing this product can say on arrival that nothing else
 * can, and it is the track requirement made visible. Every line in it comes from /api/health;
 * none is computed here and none is a placeholder.
 */
export function Dashboard() {
  const [records, setRecords] = useState<RecordSummary[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [health, setHealth] = useState<Health | null>(null)

  const load = useCallback(() => {
    setFailed(false)
    listRecords()
      .then(setRecords)
      // An empty library and an unreachable server are different facts, as on Records.
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    load()
    // Status is supporting information. If it cannot be fetched the dashboard still works,
    // so a failure here leaves the section out rather than failing the page.
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [load])

  const working = records?.filter((record) => record.status === 'queued' || record.status === 'checking') ?? []
  const recent = records?.slice(0, RECENT) ?? []
  const held = records?.filter((record) => !record.isSample).length ?? 0
  const attention = records?.reduce((sum, record) => sum + record.attentionCount, 0) ?? 0
  // A family the health ring has never been asked to serve reports healthy with a null median, so
  // answering is the pair of both, not the flag on its own.
  const answering = health?.models.filter((model) => model.healthy && model.medianLatencyMs !== null).length ?? 0

  // "Back" needs evidence of having been here, and a session does not supply it: a visitor who
  // signed up a second ago has one. A record this account actually holds is the honest signal.
  const returning = held > 0

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <h1 className="page-title">{returning ? 'Good to have you back.' : 'Welcome to Cekgu.'}</h1>
          <p className="page-sub">
            Cekgu never decides on one reading. Two independent models sit every question blind, and each reading
            carries the Gonka request id of the call that produced it.
          </p>
        </div>
      </header>

      <div className="page-grid">
        {records === null && !failed ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Stat
              label="Needs Your Attention"
              value={String(attention)}
              pen={attention > 0}
              note={attention > 0 ? 'questions waiting on a decision' : 'nothing is waiting on you'}
            />
            <Stat
              label="Checks Running"
              value={String(working.length)}
              note={working.length > 0 ? 'still with the readers' : 'the queue is clear'}
            />
            <Stat
              label="Records Held"
              value={String(held)}
              note={held > 0 ? 'plus the protected sample' : 'only the protected sample so far'}
            />
            <Stat
              label="Readers Answering"
              value={health ? `${answering} / ${health.models.length}` : '—'}
              note={health ? `in the last ${health.windowMinutes} minutes` : 'checking the gateway'}
            />
          </>
        )}

        <Card className="col-span-12 xl:col-span-7">
          <CardHead
            title="The Two Readers"
            description="A family that is struggling is demoted rather than dropped, because one reader cannot produce two independent readings."
          />
          <CardBody>
            {health === null ? (
              /* Not a skeleton pretending to be a status. Until /api/health answers there is
                 nothing true to show, and a shimmering placeholder in the shape of one is a claim
                 that a reader is there. */
              <p className="type-ui text-ink-muted">Checking which readers are answering.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {health.models.map((model) => (
                  <li
                    key={model.model}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="type-label">{family(model.model)}</p>
                      <p className="type-mono mt-1 truncate text-ink-muted">{model.model}</p>
                    </div>
                    <div className="text-right">
                      {/* Degraded is not red. Red is the human hand everywhere in this product, and a
                          gateway having a slow afternoon is not a decision anyone made. */}
                      <p className="type-label">
                        {model.medianLatencyMs === null ? 'Not Called Yet' : model.healthy ? 'Available' : 'Degraded'}
                      </p>
                      <p className="type-caption mt-1 text-ink-muted">
                        {model.medianLatencyMs === null
                          ? `no calls in the last ${health.windowMinutes} minutes`
                          : `${Math.round(model.successRate * 100)}% of calls, median ${(model.medianLatencyMs / 1000).toFixed(1)}s`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12 xl:col-span-5" flush>
          <CardHead
            title="Recent Records"
            action={
              <Link to="/records" className="btn btn-ghost btn-sm">
                View All
                <ArrowRightIcon size={15} />
              </Link>
            }
          />
          {failed ? (
            <div className="state-block">
              <p className="type-ui">We could not reach your records, try again in a moment.</p>
              <button type="button" onClick={load} className="btn btn-outline btn-sm">
                Try Again
              </button>
            </div>
          ) : records === null ? (
            <ul className="m-0 list-none p-0">
              {[0, 1, 2].map((row) => (
                <li key={row} className="border-t border-rule px-6 py-3">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton mt-2 h-3 w-1/3" />
                </li>
              ))}
            </ul>
          ) : recent.length === 0 ? (
            <div className="state-block">
              <p className="type-ui">Nothing yet. Your checks will collect here.</p>
              <Link to="/new-check" className="btn btn-outline btn-sm">
                Start One
              </Link>
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {recent.map((record) => (
                <li key={record.id} className="border-t border-rule">
                  <Link
                    to={`/records/${record.id}`}
                    className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-well"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="type-label block truncate">{record.title}</span>
                      <span className="type-caption mt-1 block text-ink-muted">{updatedLabel(record.updatedAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {record.attentionCount > 0 ? (
                        <span className="type-mono text-pen">{record.attentionCount}</span>
                      ) : null}
                      <StatusChip status={record.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
