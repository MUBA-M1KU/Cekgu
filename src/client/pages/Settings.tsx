import { useState } from 'react'
import { RETENTION_DAYS, TRASH_DAYS } from '../../shared/schemas'
import { deleteAllRecords, signOut } from '../api'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { GUEST_WARNING } from '../components/GuestBanner'
import { Sheet } from '../components/Sheet'
import { setReduceMotion, useReduceMotionSetting } from '../mascot/preferences'
import { count } from '../plural'
import { useSession } from '../session'

export function Settings() {
  const reduceMotion = useReduceMotionSetting()
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
            className="mt-4 inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium disabled:opacity-60"
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
          <p className="type-ui mt-3 max-w-[64ch] text-ink-muted">
            {isGuest
              ? 'This is the shared Guest workspace. Records here are removed 24 hours after they are created, and anyone signed in as Guest can read or delete them before that happens.'
              : `A record is deleted permanently ${RETENTION_DAYS} days after the last change to it, and opening a record does not count as a change. A record you delete yourself goes to Trash and is deleted permanently ${TRASH_DAYS} days after that. Both deletions run automatically and neither can be undone.`}
          </p>
          <p className="type-ui mt-3 max-w-[64ch] text-ink-muted">
            {isGuest
              ? 'Deleting everything clears the whole shared workspace straight away, including records other guests added. The protected sample is left alone.'
              : `Delete All Records does not use Trash. It deletes every record this account holds immediately, including anything already in Trash, without waiting out the ${TRASH_DAYS} days.`}
          </p>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={erasing}
            className="mt-4 inline-flex h-9 items-center rounded-sheet border border-pen px-4 font-medium text-pen disabled:opacity-60"
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
      <div className="mt-3">
        {/* The label wraps the control so the whole row is the target, as DispositionGroup does. */}
        <label className="flex max-w-[60ch] cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
            aria-describedby="reduce-motion-helper"
            className="check-box mt-0.5"
          />
          <span className="min-w-0">
            <span className="type-label block">Reduce Motion</span>
            <span id="reduce-motion-helper" className="mt-1 block type-caption text-ink-muted">
              Stops the mascot and every continuous animation. Your system setting is respected either way.
            </span>
          </span>
        </label>
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
