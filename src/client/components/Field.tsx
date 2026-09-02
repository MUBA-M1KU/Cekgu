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

export const inputClass =
  'w-full rounded-sheet border border-rule-strong bg-transparent px-3 py-2 text-ink placeholder:text-ink-muted'
