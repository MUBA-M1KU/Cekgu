import type { ReactNode } from 'react'

type Props = {
  /** TitleCase: a form label names a thing. DESIGN.md Capitalisation. */
  label: string
  htmlFor: string
  /** Sentence case, and only when it tells the educator something the label does not. */
  helper?: string
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, helper, error, children }: Props) {
  const helperId = helper ? `${htmlFor}-helper` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="type-label">
        {label}
      </label>
      {children}
      {helper ? (
        <p id={helperId} className="type-caption text-ink-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="type-caption text-pen">
          {error}
        </p>
      ) : null}
    </div>
  )
}

// min-h rather than h, so one class serves both a single-line input and a textarea, and both
// line up with the 36 px select and button beside them.
export const inputClass =
  'w-full min-h-9 rounded-control border border-rule-strong bg-transparent px-3 py-1.5 text-ink transition-colors placeholder:text-ink-muted hover:border-ink-muted'
