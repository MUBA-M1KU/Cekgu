import { useEffect, useId, useRef } from 'react'
import type { ChatMessage } from '../../shared/chat'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../mascot/motions'
import { useReduceMotion } from '../mascot/preferences'
import { Stage } from '../mascot/Stage'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'
import { Transcript } from './Transcript'

type Props = {
  open: boolean
  messages: ChatMessage[]
  /** A question is in flight. The cats tap, the composer locks, the transcript says so in words. */
  pending: boolean
  onSend: (question: string) => void
  onClose: () => void
}

/**
 * The record agent, in a fixed floating modal with both cats on their own stage inside it.
 *
 * A native <dialog> supplies the focus trap, Escape and the backdrop, the same way ConfirmDialog
 * does, so none of those are reimplemented. Initial focus lands in the composer, because a person
 * who opened this came to type.
 */
export function ChatModal({ open, messages, pending, onSend, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      composerRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // The newest turn is the one being read, so the region is pinned to its own bottom rather than
  // scrolled with behaviour, which would animate under a Reduce Motion setting that says not to.
  // The pending line is a turn for this purpose: it is the thing that just appeared.
  const turns = messages.length + (pending ? 1 : 0)

  useEffect(() => {
    const region = scrollRef.current
    if (region && turns > 0) region.scrollTop = region.scrollHeight
  }, [turns])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // A backdrop click lands on the dialog element itself, never on its content.
        if (event.target === dialogRef.current) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      // m-auto restores the centring a modal <dialog> gets from the UA sheet; Tailwind's reset
      // zeroes margin on every element and drops it into the top-left corner.
      className="m-auto flex h-[38rem] max-h-[calc(100dvh-2rem)] w-[36rem] max-w-[calc(100vw-2rem)] flex-col rounded-sheet border border-rule-strong bg-sheet p-6 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-[var(--shadow-overlay-tint)]"
    >
      <header className="flex shrink-0 items-start justify-between gap-4">
        <h2 id={titleId} className="card-title">
          Ask About This Record
        </h2>
        <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
          Close
        </button>
      </header>

      {/* The cats keep the place they hold on the record page, at the trailing edge, so opening the
          modal moves them rather than introducing a second pair somewhere new. */}
      <div className="mt-3 flex shrink-0 items-end justify-between gap-4" style={{ height: `${STAGE_HEIGHT}px` }}>
        <p className="type-caption max-w-[28ch] text-ink-muted">
          About this record only. Every answer names the reading it came from.
        </p>
        <div data-chat-stage aria-hidden="true" className="pointer-events-none shrink-0">
          {reduceMotion ? (
            <img src="/brand/mascot-still.png" alt="" width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          ) : (
            <Stage state={pending ? 'checking' : 'idle'} />
          )}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-5">
        {messages.length === 0 && !pending ? (
          <EmptyState onSend={onSend} />
        ) : (
          <Transcript messages={messages} pending={pending} />
        )}
      </div>

      <Composer ref={composerRef} onSend={onSend} pending={pending} />
    </dialog>
  )
}
