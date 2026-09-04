import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { GUEST_MAX_ITEMS, GUEST_MAX_RECORDS } from '../../shared/schemas'
import type { Health, RecordSummary } from '../../shared/types'
import { getHealth, listRecords } from '../api'
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

/**
 * Where you land after signing in.
 *
 * A page header, a hero card, two CTA cards under it, and a rail down the right.
 *
 * TWO CTA CARDS, NOT THREE. New Check and Records are the only other places this
 * dashboard sends anyone; Settings belongs to the account menu. A third card would be
 * a slot filled to balance a grid, which DESIGN.md names as a tell.
 *
 * THE HERO IS NOT A THIRD CTA, and it is deliberately not a link. It carries the reader
 * families and whether they are answering, because that is the one thing this product can
 * say on arrival that nothing else can, and it is the track requirement made visible. Every
 * line in it comes from /api/health; none is computed here and none is a placeholder.
 */
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

  // "Back" needs evidence of having been here, and a session does not supply it: a visitor who
  // signed up a second ago has one. A record this account actually holds is the honest signal.
  const returning = held > 0

  return (
    <div className="dash">
      <header className="dash-head">
        <h1 className="dash-title">{returning ? 'Good to have you back.' : 'Welcome to Cekgu.'}</h1>
        <p className="dash-sub">
          {records === null
            ? 'Loading your workspace.'
            : working.length > 0
              ? `${count(working.length, 'check is', 'checks are')} still running. You can leave and come back.`
              : attention > 0
                ? `${count(attention, 'item needs', 'items need')} your attention.`
                : 'Nothing is waiting on you.'}
        </p>
        {failed ? <p className="dash-sub">We could not reach your records, try again in a moment.</p> : null}
      </header>

      <div className="dash-bento">
        <div className="dash-col">
          <section className="dash-hero">
            <p className="dash-hero-lede">
              Cekgu never decides on one reading. Two independent models sit every question blind, and each reading
              carries the Gonka request id of the call that produced it.
            </p>
            {health ? (
              <>
                <dl className="dash-figures">
                  {health.models.map((model) => (
                    <div key={model.model}>
                      <dt>{family(model.model)}</dt>
                      {/* No data is its own state. The health ring reports successRate 1 and healthy
                          true for a family nobody has called, and printing "Available" from that
                          would be a claim with nothing behind it. */}
                      <dd data-degraded={model.medianLatencyMs !== null && !model.healthy ? 'true' : undefined}>
                        {model.medianLatencyMs === null ? 'Not Called Yet' : model.healthy ? 'Available' : 'Degraded'}
                      </dd>
                      <p className="dash-figure-note">
                        {model.medianLatencyMs === null
                          ? `no calls in the last ${health.windowMinutes} minutes`
                          : `${Math.round(model.successRate * 100)}% of calls, median ${(model.medianLatencyMs / 1000).toFixed(1)}s`}
                      </p>
                    </div>
                  ))}
                </dl>
                <p className="dash-hero-note">
                  A family that is struggling is demoted rather than dropped, because one reader cannot produce two
                  independent readings.
                </p>
              </>
            ) : (
              /* Not a skeleton pretending to be a status. Until /api/health answers there is nothing
                 true to show, and a shimmering placeholder in the shape of one is a claim that a
                 reader is there. */
              <p className="dash-figures-pending">Checking which readers are answering…</p>
            )}
          </section>

          <div className="dash-ctas">
            <Link className="dash-card dash-card-check" to="/new-check">
              <span className="dash-card-label">New Check</span>
              <span className="dash-card-sub">Type or paste a paper and its key. The key stays behind.</span>
            </Link>

            <Link className="dash-card dash-card-records" to="/records">
              <span className="dash-card-label">All Records</span>
              <span className="dash-card-sub">
                {records === null
                  ? 'Everything this account holds.'
                  : held > 0
                    ? `${count(held, 'record')} held, and the protected sample.`
                    : 'Only the protected sample so far.'}
              </span>
            </Link>
          </div>
        </div>

        <aside className="dash-rail">
          <h2 className="dash-rail-heading">Recent Records</h2>
          {records !== null && recent.length === 0 ? (
            <p className="dash-recent-empty">Nothing yet. Your checks will collect here.</p>
          ) : (
            <ul className="dash-recent">
              {recent.map((record) => (
                <li key={record.id}>
                  <Link to={`/records/${record.id}`} className="dash-recent-item">
                    <span className="dash-recent-name">{record.title}</span>
                    <span className="dash-recent-meta">
                      <StatusChip status={record.status} />
                      {record.attentionCount > 0 ? (
                        <span className="text-pen">{record.attentionCount} to review</span>
                      ) : null}
                    </span>
                    <span className="dash-recent-when">{updatedLabel(record.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {isGuest ? (
            <div className="dash-rail-note">
              <h2 className="dash-rail-heading">Guest Allowance</h2>
              <p className="dash-recent-empty">
                {held} of {GUEST_MAX_RECORDS} records held, up to {GUEST_MAX_ITEMS} questions in one check. The
                protected sample does not count against this. Guest records are removed after 24 hours, and the shared
                workspace is visible to everyone.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
