import { useState } from 'react'
import { RETENTION_DAYS, TRASH_DAYS } from '../../shared/schemas'
import { deleteAllRecords, signOut } from '../api'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field } from '../components/Field'
import { Select } from '../components/Select'
import { Sheet } from '../components/Sheet'
import { type MotionSetting, setMotionSetting, useMotionSetting } from '../mascot/preferences'
import { count } from '../plural'
import { useSession } from '../session'
import { setTheme, type Theme, useTheme } from '../theme'

const MOTION_OPTIONS = [
  { value: 'system', label: 'Follow System' },
  { value: 'full', label: 'Always Animate' },
  { value: 'reduce', label: 'Never Animate' }
]

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
]

// A panel, not a run of headings down a narrow column. The sheet is 1144 px wide and the old
// layout put every section in one 64ch measure, so two thirds of the page was empty. Each panel is
// full width and lays its own contents across instead, which fills the sheet without leaving one
// short panel stretched to match a tall one beside it. The facts inside are wells, which is also
// how the dividers went: a bounded card says "these belong together" without drawing a line.
const PANEL = 'rounded-sheet border border-rule p-5 sm:p-6'
const NOTE = 'rounded-control bg-well p-4'

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
    <Sheet>
      <h1>Settings</h1>

      <div className="mt-6 grid gap-4">
        <section className={PANEL}>
          <h2 className="mt-0">Account</h2>
          {session.status === 'in' ? (
            <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="type-caption text-ink-muted">Signed in as</p>
                <p className="type-ui mt-1">{session.isGuest ? 'Guest' : session.user.name || session.user.email}</p>
              </div>
              {session.isGuest ? null : (
                <div className="min-w-0">
                  <p className="type-caption text-ink-muted">Email</p>
                  <p className="type-mono mt-1 truncate">{session.user.email}</p>
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={leave}
                  disabled={leaving}
                  className="inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium disabled:opacity-60"
                >
                  {leaving ? 'Signing Out' : 'Sign Out'}
                </button>
                {failed ? (
                  <p className="mt-2 type-caption text-pen">We could not sign you out, try again in a moment.</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 type-ui text-ink-muted">
              {session.status === 'loading' ? 'Checking your session.' : 'You are not signed in.'}
            </p>
          )}
        </section>

        <section className={PANEL}>
          <h2 className="mt-0">Appearance</h2>
          <div className="mt-4 grid items-end gap-x-10 gap-y-4 sm:grid-cols-[13rem_13rem] lg:grid-cols-[13rem_13rem_minmax(0,1fr)]">
            <Field label="Theme" htmlFor="theme">
              <Select
                id="theme"
                label="Theme"
                value={theme}
                options={THEME_OPTIONS}
                onChange={(value) => setTheme(value as Theme)}
              />
            </Field>
            {/* Three choices, not a checkbox. A checkbox could only ever ask for less motion, so a
                machine with animations switched off had no way back — and Windows reports that one
                toggle whether it was thrown for motion sensitivity or for a faster desktop. */}
            <Field label="Animation" htmlFor="motion">
              <Select
                id="motion"
                label="Animation"
                value={motion}
                options={MOTION_OPTIONS}
                onChange={(value) => setMotionSetting(value as MotionSetting)}
              />
            </Field>
            <p className="type-caption text-ink-muted sm:col-span-2 lg:col-span-1">
              {motion === 'system'
                ? 'Following your system setting. Choose Always Animate if your machine has animations switched off but you want them here.'
                : motion === 'full'
                  ? 'Animating regardless of your system setting.'
                  : 'The mascot and every continuous animation are stopped.'}
            </p>
          </div>
        </section>

        {session.status === 'in' ? (
          <section className={PANEL}>
            <h2 className="mt-0">Your Data</h2>
            {/* Three deadlines as cards rather than three paragraphs. The facts are the ones the
                retention sweep and the account route actually enforce; what changed here is that a
                reader can find the one they came for without reading the other two. */}
            {isGuest ? (
              <p className={`type-ui mt-4 max-w-[80ch] ${NOTE} text-ink-muted`}>
                This is the shared Guest workspace. Records are removed 24 hours after they are created, and any guest
                can read or delete them. Deleting everything clears the whole workspace; the protected sample is left
                alone.
              </p>
            ) : (
              <dl className="mt-4 m-0 grid gap-3 sm:grid-cols-3">
                <div className={NOTE}>
                  <dt className="type-label">Trash</dt>
                  <dd className="type-ui m-0 mt-1 text-ink-muted">
                    Deleted permanently {TRASH_DAYS} days after you delete a record
                  </dd>
                </div>
                <div className={NOTE}>
                  <dt className="type-label">Inactivity</dt>
                  <dd className="type-ui m-0 mt-1 text-ink-muted">
                    Deleted permanently {RETENTION_DAYS} days after the last change. Opening a record is not a change
                  </dd>
                </div>
                <div className={NOTE}>
                  <dt className="type-label">Delete All</dt>
                  <dd className="type-ui m-0 mt-1 text-ink-muted">
                    Immediate, including anything already in Trash. It does not use the {TRASH_DAYS} days
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-10 gap-y-3">
              <p className="type-caption text-ink-muted">
                {isGuest
                  ? 'The 24 hour sweep runs automatically. None of this can be undone.'
                  : 'The first two run automatically. None of the three can be undone.'}
              </p>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={erasing}
                className="inline-flex h-9 items-center rounded-control border border-pen px-4 font-medium text-pen disabled:opacity-60"
              >
                {erasing ? 'Deleting' : 'Delete All Records'}
              </button>
            </div>
            {erased ? (
              <p className="type-caption mt-2 text-ink-muted">
                {erased.deleted === 0
                  ? 'There was nothing to delete.'
                  : `Deleted ${count(erased.deleted, 'record', 'records')}.`}
                {erased.skipped > 0 ? ' The protected sample was left alone.' : ''}
              </p>
            ) : null}
            {eraseFailed ? (
              <p className="type-caption mt-2 text-pen">We could not delete your records, try again in a moment.</p>
            ) : null}
          </section>
        ) : null}
      </div>

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
    </Sheet>
  )
}
