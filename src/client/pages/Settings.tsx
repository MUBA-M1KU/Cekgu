import { Sheet } from '../components/Sheet'
import { setReduceMotion, useReduceMotionSetting } from '../mascot/preferences'

export function Settings() {
  const reduceMotion = useReduceMotionSetting()

  return (
    <Sheet>
      <h1>Settings</h1>

      <div className="mt-6 flex max-w-[60ch] items-start gap-3 border-t border-rule pt-6">
        <input
          id="reduce-motion"
          type="checkbox"
          checked={reduceMotion}
          onChange={(event) => setReduceMotion(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
        />
        <div className="min-w-0">
          <label htmlFor="reduce-motion" className="type-label">
            Reduce Motion
          </label>
          <p className="mt-1 type-caption text-ink-muted">
            Stops the mascot and every continuous animation. Your system setting is respected either way.
          </p>
        </div>
      </div>
    </Sheet>
  )
}
