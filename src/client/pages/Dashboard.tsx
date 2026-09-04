import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { AccountStats, Health, ItemVerdict, RecordSummary } from '../../shared/types'
import { getHealth, getStats, listRecords } from '../api'
import { Card, CardBody, CardHead } from '../components/Card'
import { Bar, BarList, Meter } from '../components/charts'
import { ArrowRightIcon } from '../components/icons'
import { StatusChip } from '../components/StatusChip'
import { VerdictChip } from '../components/VerdictChip'

const RECENT = 5

// Attention first, Clear last, which is the order the record workspace puts items in. A chart that
// sorted by size would move every row the moment a check finished.
const VERDICT_ORDER: ItemVerdict[] = [
  'possible_key_error',
  'possible_ambiguity',
  'split_opinion',
  'unverified',
  'clear'
]

// The token each verdict's colour is written to in styles.css. Pending is absent on purpose: it is
// the absence of a verdict, it has no colour of its own, and the card names it in a sentence.
const VERDICT_TOKEN: Partial<Record<ItemVerdict, string>> = {
  possible_key_error: '--verdict-key-error',
  possible_ambiguity: '--verdict-ambiguity',
  split_opinion: '--verdict-split',
  unverified: '--verdict-unverified',
  clear: '--verdict-clear'
}

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
 * Four figures across the top, then the one claim this product exists to make, then what the
 * readers found and which of them found it.
 *
 * THE VERIFICATION PANEL IS THE POINT OF THIS SCREEN. Verified readings against total readings is
 * the track requirement stated as a number, and it is the only figure here a judge can check
 * without taking our word for it: open any record, follow a request id, compare it against the
 * gateway. Everything in it comes from /api/stats, which counts rows and computes nothing.
 */
export function Dashboard() {
  const [records, setRecords] = useState<RecordSummary[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [health, setHealth] = useState<Health | null>(null)
  const [stats, setStats] = useState<AccountStats | null>(null)

  const load = useCallback(() => {
    setFailed(false)
    listRecords()
      .then(setRecords)
      // An empty library and an unreachable server are different facts, as on Records.
      .catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    load()
    // Both are supporting information. If either cannot be fetched the dashboard still works, so a
    // failure leaves that card saying so rather than failing the page.
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
    getStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [load])

  const working = records?.filter((record) => record.status === 'queued' || record.status === 'checking') ?? []
  const recent = records?.slice(0, RECENT) ?? []
  const held = records?.filter((record) => !record.isSample).length ?? 0
  const attention = records?.reduce((sum, record) => sum + record.attentionCount, 0) ?? 0
  // A family the health ring has never been asked to serve reports healthy with a null median, so
  // answering is the pair of both, not the flag on its own.
  const answering = health?.models.filter((model) => model.healthy && model.medianLatencyMs !== null).length ?? 0

  // Bars in one list share a scale, or none of them mean anything beside each other.
  const verdictMax = stats ? Math.max(...VERDICT_ORDER.map((verdict) => stats.counts[verdict]), 1) : 1
  const familyMax = stats ? Math.max(...stats.families.map((entry) => entry.readings), 1) : 1

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
              value={health ? `${answering} / ${health.models.length}` : '-'}
              note={health ? `in the last ${health.windowMinutes} minutes` : 'checking the gateway'}
            />
          </>
        )}

        {/* The admin reference's illustrated stat, with the illustration replaced by the thing the
            figure is about. A ratio against a limit is a meter; a two-slice donut is this number
            drawn worse. */}
        <Card className="col-span-12 xl:col-span-4">
          <CardHead title="Receipt-Verified Readings" />
          <CardBody>
            {stats === null ? (
              <>
                <div className="skeleton h-10 w-28" />
                <div className="skeleton h-3 w-40" />
              </>
            ) : (
              <>
                <span className="type-caption panel-chip">Every record this account holds</span>
                <p className="panel-figure">{stats.verifiedReadings}</p>
                <p className="type-ui text-ink-muted">
                  of {stats.readings} readings carry a receipt naming the model that served them.
                </p>
                <Meter value={stats.verifiedReadings} total={stats.readings} label="Receipt-verified readings" />
              </>
            )}
          </CardBody>
          <div className="card-foot">
            <p className="type-caption max-w-[46ch] text-ink-muted">
              A reading is admitted only once its receipt names the model that was asked for. Open any record to follow
              one to the gateway.
            </p>
          </div>
        </Card>

        {/* One row per verdict rather than one stacked bar. Two of these five colours are close
            enough that a reader with ordinary colour vision cannot reliably split them where the
            segments touch, and a verdict colour is semantic so it cannot move. The chart moves
            instead: the label carries the identity and the fill only agrees with it. */}
        <Card className="col-span-12 xl:col-span-8">
          <CardHead
            title="What the Readers Found"
            description="Every question this account has put through a check, by the verdict it came back with."
          />
          <CardBody>
            {stats === null ? (
              <div className="grid gap-4">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ) : stats.items === 0 ? (
              <p className="type-ui text-ink-muted">Nothing has been checked yet, so there is nothing to show here.</p>
            ) : (
              <BarList label="Questions by verdict">
                {VERDICT_ORDER.map((verdict) => (
                  <Bar
                    key={verdict}
                    label={verdict}
                    labelNode={<VerdictChip verdict={verdict} />}
                    value={stats.counts[verdict]}
                    max={verdictMax}
                    detail={String(stats.counts[verdict])}
                    fill={`var(${VERDICT_TOKEN[verdict]})`}
                  />
                ))}
              </BarList>
            )}
          </CardBody>
          {stats && stats.counts.pending > 0 ? (
            <div className="card-foot">
              <p className="type-caption text-ink-muted">
                {stats.counts.pending} more {stats.counts.pending === 1 ? 'question is' : 'questions are'} still with
                the readers and have no verdict yet.
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="col-span-12 xl:col-span-7">
          <CardHead
            title="The Two Readers"
            description="A family that is struggling is demoted rather than dropped, because one reader cannot produce two independent readings."
          />
          <CardBody>
            {/* Two halves, and the reader is told which is which. Work done and answering now are
                different questions about the same two families, and without the labels the card
                reads as one list printed twice.

                The split is taken from the served model on each receipt, never from what was
                requested: a family that was asked and did not answer did no work. */}
            {stats && stats.families.length > 0 ? (
              <div>
                <p className="type-eyebrow mb-3 text-ink-muted">Readings So Far</p>
                <BarList label="Readings by model family">
                  {stats.families.map((entry) => (
                    <Bar
                      key={entry.model}
                      label={family(entry.model)}
                      value={entry.readings}
                      max={familyMax}
                      detail={`${entry.readings} read, ${entry.verified} verified`}
                    />
                  ))}
                </BarList>
              </div>
            ) : null}

            {health === null ? (
              /* Not a skeleton pretending to be a status. Until /api/health answers there is
                 nothing true to show, and a shimmering placeholder in the shape of one is a claim
                 that a reader is there. */
              <p className="type-ui text-ink-muted">Checking which readers are answering.</p>
            ) : (
              <div>
                <p className="type-eyebrow mb-1 text-ink-muted">Answering Now</p>
                <ul className="m-0 list-none p-0">
                  {health.models.map((model) => (
                    <li
                      key={model.model}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule py-3"
                    >
                      <div className="min-w-0">
                        <p className="type-label">{family(model.model)}</p>
                        <p className="type-mono mt-1 truncate text-ink-muted">{model.model}</p>
                      </div>
                      <div className="text-right">
                        {/* Degraded is not red. Red is the human hand everywhere in this product, and
                          a gateway having a slow afternoon is not a decision anyone made. */}
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
              </div>
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
