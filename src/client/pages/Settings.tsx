import { useState } from 'react'
import { RETENTION_DAYS, TRASH_DAYS } from '../../shared/schemas'
import { deleteAllRecords, signOut } from '../api'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field } from '../components/Field'
import { GUEST_WARNING } from '../components/GuestBanner'
import { Select } from '../components/Select'
import { Sheet } from '../components/Sheet'
import { type MotionSetting, setMotionSetting, useMotionSetting } from '../mascot/preferences'
import { count } from '../plural'
import { useSession } from '../session'

const MOTION_OPTIONS = [
  { value: 'system', label: 'Follow System' },
  { value: 'full', label: 'Always Animate' },
  { value: 'reduce', label: 'Never Animate' }
]

export function Settings() {
  const motion = useMotionSetting()
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

      <h2 className="mt-8">Account</h2>
      {session.status === 'in' ? (
        <>
          <dl className="mt-3 m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            <dt className="type-caption text-ink-muted">Signed in as</dt>
            <dd className="type-ui m-0">{session.isGuest ? 'Guest' : session.user.name || session.user.email}</dd>
            {session.isGuest ? null : (
              <>
                <dt className="type-caption text-ink-muted">Email</dt>
                <dd className="type-mono m-0">{session.user.email}</dd>
              </>
            )}
          </dl>
          {session.isGuest ? (
            <p className="mt-3 max-w-[64ch] type-caption text-ink-muted">
              {GUEST_WARNING} Records here are removed after 24 hours.
            </p>
          ) : null}

          <button
            type="button"
            onClick={leave}
            disabled={leaving}
            className="mt-4 inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium disabled:opacity-60"
          >
            {leaving ? 'Signing Out' : 'Sign Out'}
          </button>
          {failed ? (
            <p className="mt-2 type-caption text-pen">We could not sign you out, try again in a moment.</p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 type-ui text-ink-muted">
          {session.status === 'loading' ? 'Checking your session.' : 'You are not signed in.'}
        </p>
      )}

      {session.status === 'in' ? (
        <>
          <h2 className="mt-10">Your Data</h2>
          {/* Three deadlines as pairs rather than three paragraphs. The facts are the ones the
              retention sweep and the account route actually enforce; what changed here is that a
              reader can find the one they came for without reading the other two. */}
          {isGuest ? (
            <p className="type-ui mt-3 max-w-[64ch] text-ink-muted">
              This is the shared Guest workspace. Records are removed 24 hours after they are created, and any guest can
              read or delete them. Deleting everything clears the whole workspace; the protected sample is left alone.
            </p>
          ) : (
            <>
              <dl className="mt-3 m-0 grid max-w-[64ch] grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="type-label">Trash</dt>
                <dd className="type-ui m-0 text-ink-muted">
                  Deleted permanently {TRASH_DAYS} days after you delete a record
                </dd>
                <dt className="type-label">Inactivity</dt>
                <dd className="type-ui m-0 text-ink-muted">
                  Deleted permanently {RETENTION_DAYS} days after the last change. Opening a record is not a change
                </dd>
                <dt className="type-label">Delete All</dt>
                <dd className="type-ui m-0 text-ink-muted">
                  Immediate, including anything already in Trash. It does not use the {TRASH_DAYS} days
                </dd>
              </dl>
              <p className="type-caption mt-3 max-w-[64ch] text-ink-muted">
                The first two run automatically. None of the three can be undone.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={erasing}
            className="mt-4 inline-flex h-9 items-center rounded-control border border-pen px-4 font-medium text-pen disabled:opacity-60"
          >
            {erasing ? 'Deleting' : 'Delete All Records'}
          </button>
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
        </>
      ) : null}

      <h2 className="mt-10">Accessibility</h2>
      {/* Three choices, not a checkbox. A checkbox could only ever ask for less motion, so a
          machine with animations switched off had no way back — and Windows reports that one
          toggle whether it was thrown for motion sensitivity or for a faster desktop. */}
      <div className="mt-3 max-w-[22rem]">
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
      <p className="type-caption mt-2 max-w-[60ch] text-ink-muted">
        {motion === 'system'
          ? 'Following your system setting. Choose Always Animate if your machine has animations switched off but you want them here.'
          : motion === 'full'
            ? 'Animating regardless of your system setting.'
            : 'The mascot and every continuous animation are stopped.'}
      </p>

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
