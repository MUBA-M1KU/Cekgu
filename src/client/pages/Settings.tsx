import { useState } from 'react'
import { RETENTION_DAYS, TRASH_DAYS } from '../../shared/schemas'
import { deleteAllRecords, signOut } from '../api'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'
import { TrashIcon } from '../components/icons'
import { Select } from '../components/Select'
import { type MotionSetting, setMotionSetting, useMotionSetting } from '../mascot/preferences'
import { count } from '../plural'
import { clearSession, useSession } from '../session'
import { setTheme, type Theme, useTheme } from '../theme'

// Carried over from #191 on main: the theme was reachable only from the topbar toggle, which is a
// control you find rather than a setting you set.
const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
]

const MOTION_OPTIONS = [
  { value: 'system', label: 'Follow System' },
  { value: 'full', label: 'Always Animate' },
  { value: 'reduce', label: 'Never Animate' }
]

/**
 * Settings is a list of separate decisions, so it is laid out as one: what the section is on the
 * left, the controls that change it on the right.
 *
 * Stacked in a single column, which is what this screen was, every heading reads as the next
 * paragraph of the one above it and the destructive control sits in the same flow as a dropdown
 * about animation.
 */
export function Settings() {
  const motion = useMotionSetting()
  const theme = useTheme()
  const session = useSession()
  const [leaving, setLeaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [erasing, setErasing] = useState(false)
  const [erased, setErased] = useState<{ deleted: number; skipped: number } | null>(null)
  const [eraseFailed, setEraseFailed] = useState(false)
  const isGuest = session.status === 'in' && session.isGuest

  async function leave() {
    setLeaving(true)
    setFailed(false)
    try {
      await signOut()
      // Locally first, so nothing on screen goes on naming an account nobody is signed into if
      // the navigation below is slow or never happens.
      clearSession()
      // A full load rather than a client route, so every cached record in memory goes with
      // the session. On the shared Guest account that matters more than the extra request.
      window.location.assign('/')
    } catch {
      setFailed(true)
      setLeaving(false)
    }
  }

  async function eraseEverything() {
    setConfirming(false)
    setErasing(true)
    setEraseFailed(false)
    try {
      const result = await deleteAllRecords()
      setErased({ deleted: result.deleted.length, skipped: result.skipped.length })
    } catch {
      setEraseFailed(true)
    }
    setErasing(false)
  }

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">
            Who you are signed in as, how long this account keeps what it holds, and how much the product moves.
          </p>
        </div>
      </header>

      <section className="settings-row">
        <div>
          <h2 className="settings-heading">Account</h2>
          <p className="type-caption settings-desc">The identity every record on this workspace is filed under.</p>
        </div>
        <div className="settings-body">
          {session.status === 'in' ? (
            <Card>
              <div>
                <dl className="fact-list type-ui">
                  <dt className="type-caption">Signed in as</dt>
                  <dd>{session.isGuest ? 'Guest' : session.user.name || session.user.email}</dd>
                  {session.isGuest ? null : (
                    <>
                      <dt className="type-caption">Email</dt>
                      <dd className="type-mono">{session.user.email}</dd>
                    </>
                  )}
                </dl>
                {session.isGuest ? (
                  <p className="type-caption mt-4 max-w-[64ch] text-ink-muted">
                    {GUEST_WARNING} Records here are removed after 24 hours.
                  </p>
                ) : null}
              </div>
              <div className="card-foot">
                <button type="button" onClick={leave} disabled={leaving} className="btn btn-outline">
                  {leaving ? 'Signing Out' : 'Sign Out'}
                </button>
                {failed ? (
                  <p role="alert" className="type-caption text-pen">
                    We could not sign you out, try again in a moment.
                  </p>
                ) : null}
              </div>
            </Card>
          ) : (
            <p className="type-ui text-ink-muted">
              {session.status === 'loading' ? 'Checking your session.' : 'You are not signed in.'}
            </p>
          )}
        </div>
      </section>

      {session.status === 'in' ? (
        <section className="settings-row">
          <div>
            <h2 className="settings-heading">Your Data</h2>
            <p className="type-caption settings-desc">
              Three deadlines. The first two run on their own; the third is the button below them.
            </p>
          </div>
          <div className="settings-body">
            <Card>
              <div>
                {isGuest ? (
                  <p className="type-ui max-w-[64ch] text-ink-muted">
                    This is the shared Guest workspace. Records are removed 24 hours after they are created, and any
                    guest can read or delete them. Deleting everything clears the whole workspace; the protected sample
                    is left alone.
                  </p>
                ) : (
                  <>
                    <dl className="fact-list type-ui">
                      <dt className="type-label">Trash</dt>
                      <dd className="text-ink-muted">
                        Deleted permanently {TRASH_DAYS} days after you delete a record
                      </dd>
                      <dt className="type-label">Inactivity</dt>
                      <dd className="text-ink-muted">
                        Deleted permanently {RETENTION_DAYS} days after the last change. Opening a record is not a
                        change
                      </dd>
                      <dt className="type-label">Delete All</dt>
                      <dd className="text-ink-muted">
                        Immediate, including anything already in Trash. It does not use the {TRASH_DAYS} days
                      </dd>
                    </dl>
                    <p className="type-caption mt-4 max-w-[64ch] text-ink-muted">
                      The first two run automatically. None of the three can be undone.
                    </p>
                  </>
                )}
              </div>
              <div className="card-foot">
                <button type="button" onClick={() => setConfirming(true)} disabled={erasing} className="btn btn-danger">
                  <TrashIcon size={15} />
                  {erasing ? 'Deleting' : 'Delete All Records'}
                </button>
                {erased ? (
                  <p className="type-caption text-ink-muted">
                    {erased.deleted === 0
                      ? 'There was nothing to delete.'
                      : `Deleted ${count(erased.deleted, 'record', 'records')}.`}
                    {erased.skipped > 0 ? ' The protected sample was left alone.' : ''}
                  </p>
                ) : null}
                {eraseFailed ? (
                  <p role="alert" className="type-caption text-pen">
                    We could not delete your records, try again in a moment.
                  </p>
                ) : null}
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      <section className="settings-row">
        <div>
          <h2 className="settings-heading">Appearance</h2>
          <p className="type-caption settings-desc">
            How the product looks and how much it moves. Both are read on every screen and neither is stored on the
            server.
          </p>
        </div>
        <div className="settings-body">
          <Card>
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Theme" htmlFor="theme">
                  <Select
                    id="theme"
                    label="Theme"
                    value={theme}
                    options={THEME_OPTIONS}
                    onChange={(value) => setTheme(value as Theme)}
                  />
                </Field>
                {/* Three choices, not a checkbox. A checkbox could only ever ask for less motion, so
                    a machine with animations switched off had no way back, and Windows reports that
                    one toggle whether it was thrown for motion sensitivity or for a faster desktop. */}
                <Field label="Animation" htmlFor="motion">
                  <Select
                    id="motion"
                    label="Animation"
                    value={motion}
                    options={MOTION_OPTIONS}
                    onChange={(value) => setMotionSetting(value as MotionSetting)}
                  />
                </Field>
              </div>
              <p className="type-caption mt-3 max-w-[60ch] text-ink-muted">
                {motion === 'system'
                  ? 'Following your system setting. Choose Always Animate if your machine has animations switched off but you want them here.'
                  : motion === 'full'
                    ? 'Animating regardless of your system setting.'
                    : 'The mascot and every continuous animation are stopped.'}
              </p>
            </div>
          </Card>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title="Delete All Records"
        body={
          isGuest
            ? [
                'Every record in the shared Guest workspace is removed straight away, including ones other guests added.',
                'The protected sample is left alone. Nothing else can be recovered.'
              ]
            : [
                'Every record this account holds is removed straight away, including anything already in Trash.',
                'There is no recovery, and this is not the same as the Trash window a single deletion uses.'
              ]
        }
        onCancel={() => setConfirming(false)}
        onConfirm={eraseEverything}
      />
    </>
  )
}
