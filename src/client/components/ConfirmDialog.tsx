import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  /** The verb and the count, TitleCase: "Delete 3 Records". The confirm button repeats it. */
  title: string
  /** Two sentences: what happens, then the recovery behaviour for this account (FR-RECORD-7). */
  body: string[]
  onCancel: () => void
  onConfirm: () => void
}

// A level-2 overlay. Native <dialog> gives the focus trap, Escape and the backdrop, so none of
// those are reimplemented here. Initial focus lands on Cancel. DESIGN.md Destructive confirmations.
export function ConfirmDialog({ open, title, body, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        // A backdrop click lands on the dialog element itself, never on its content.
        if (event.target === ref.current) onCancel()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
      className="w-[440px] max-w-[calc(100vw-2rem)] rounded-sheet border border-rule-strong bg-sheet p-6 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-[var(--shadow-overlay-tint)]"
    >
      <h2 className="text-[1.25rem]/[1.25] font-semibold">{title}</h2>
      {body.map((sentence) => (
        <p key={sentence} className="type-body mt-3">
          {sentence}
        </p>
      ))}
      <div className="mt-6 flex justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-9 items-center rounded-sheet bg-pen px-4 font-medium text-pen-ink"
        >
          {title}
        </button>
      </div>
    </dialog>
  )
}
