import { Sheet } from '../components/Sheet'
import { setReduceMotion, useReduceMotionSetting } from '../mascot/preferences'

export function Settings() {
  const reduceMotion = useReduceMotionSetting()

  return (
    <Sheet>
      <h1>Settings</h1>

      <div className="mt-6 border-t border-rule pt-6">
        {/* The label wraps the control so the whole row is the target, as DispositionGroup does. */}
        <label className="flex max-w-[60ch] cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
            aria-describedby="reduce-motion-helper"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
          />
          <span className="min-w-0">
            <span className="type-label block">Reduce Motion</span>
            <span id="reduce-motion-helper" className="mt-1 block type-caption text-ink-muted">
              Stops the mascot and every continuous animation. Your system setting is respected either way.
            </span>
          </span>
        </label>
      </div>
    </Sheet>
  )
}
