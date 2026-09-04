import { type ReactNode, useEffect, useRef } from 'react'

type Props = {
  open: boolean
  /** The verb and the count, TitleCase: "Delete 3 Records". The confirm button repeats it. */
  title: string
  /**
   * Two sentences: what happens, then the recovery behaviour for this account (FR-RECORD-7).
   *
   * A string is one paragraph. A node is a paragraph that needs a machine string set in it, which
   * the leaving-site dialog needs: a host and a path are things a person reads character by
   * character before deciding, and prose type is the wrong face for that.
   */
  body: (string | ReactNode)[]
  /**
   * The confirm button. Defaults to repeating the title, which is right for a destructive verb
   * and wrong for a statement: 'You Are Leaving Cekgu' is not something a button can say.
   */
  confirmLabel?: string
  /**
   * Pen is the human deleting something. A dialog that only asks a person to confirm where they
   * are going is not that, and colouring it red would spend the product's one alarm on a link.
   */
  tone?: 'danger' | 'neutral'
  onCancel: () => void
  onConfirm: () => void
}

// A level-2 overlay. Native <dialog> gives the focus trap, Escape and the backdrop, so none of
// those are reimplemented here. Initial focus lands on Cancel. DESIGN.md Destructive confirmations.
export function ConfirmDialog({ open, title, body, confirmLabel, tone = 'danger', onCancel, onConfirm }: Props) {
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
      // m-auto restores the centring a modal <dialog> gets from the UA sheet. Tailwind's reset
      // zeroes margin on every element, which drops the dialog into the top-left corner.
      className="m-auto w-[440px] max-w-[calc(100vw-2rem)] rounded-sheet border border-rule-strong bg-sheet p-6 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-[var(--shadow-overlay-tint)]"
    >
      <h2 className="text-[1.25rem]/[1.25] font-semibold">{title}</h2>
      {body.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the body is a fixed list rendered in order
        <p key={index} className="type-ui mt-3">
          {paragraph}
        </p>
      ))}
      <div className="mt-6 flex justify-end gap-3">
        <button ref={cancelRef} type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={
            tone === 'danger'
              ? 'inline-flex h-9 items-center rounded-control bg-pen px-4 font-medium text-pen-ink'
              : 'btn btn-primary'
          }
        >
          {confirmLabel ?? title}
        </button>
      </div>
    </dialog>
  )
}
