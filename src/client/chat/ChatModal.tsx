import { useEffect, useId, useRef, useState } from 'react'
import type { ChatMessage, Citation } from '../../shared/chat'
import { CloseIcon } from '../components/icons'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../mascot/motions'
import { useReduceMotion } from '../mascot/preferences'
import { Stage } from '../mascot/Stage'
import { Composer } from './Composer'
import { ToolTrace, type TracedTool } from './ToolTrace'
import { Transcript } from './Transcript'

type Props = {
  open: boolean
  messages: ChatMessage[]
  /** A question is in flight. The cats tap, the composer locks, the trace says what is happening. */
  pending: boolean
  /** The tools called so far this turn. Cleared by the caller when the answer lands. */
  tools: TracedTool[]
  /** Four at most: openers before the first question, follow-ups after every answer. */
  suggestions: string[]
  onSend: (question: string) => void
  onClose: () => void
  /** Wired by the record page: an item pill jumps to its item, a reading pill opens its evidence. */
  onCite?: (citation: Citation) => void
}

/**
 * The record agent, in a floating modal with both cats on their own stage at the top of it.
 *
 * A native <dialog> supplies the focus trap, Escape and the backdrop, the same way ConfirmDialog
 * does, so none of those are reimplemented. Initial focus lands in the composer, because a person
 * who opened this came to type.
 *
 * THE `hidden` CLASS IS LOAD-BEARING. The UA sheet hides a dialog with `dialog:not([open])`, and a
 * `display: flex` utility on the element outranks it — which left the modal painted into the page
 * at all times, stuck below the record, and made close() look broken because the element stayed
 * visible after it stopped being open. Never give this element an unconditional display utility.
 */
export function ChatModal({ open, messages, pending, tools, suggestions, onSend, onClose, onCite }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const reduceMotion = useReduceMotion()
  // Stage builds its runtime and loads its models on mount, whatever its visibility, so rendering
  // one behind a closed <dialog> would pull the Live2D chunk onto the record page for cats nobody
  // has asked to see. Once opened it stays mounted, so closing and reopening does not tear the
  // runtime down and build it again.
  const [everOpened, setEverOpened] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      setEverOpened(true)
      dialog.showModal()
      composerRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // The newest turn is the one being read, so the region is pinned to its own bottom rather than
  // scrolled with behaviour, which would animate under a Reduce Motion setting that says not to.
  const turns = messages.length + tools.length + (pending ? 1 : 0)

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
      // onCancel already handles Escape; this pairs a keyboard route with the click above so the
      // dismissal is not mouse-only.
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      // m-auto restores the centring a modal <dialog> gets from the UA sheet; Tailwind's reset
      // zeroes margin on every element and drops it into the top-left corner.
      className={`${open ? 'flex' : 'hidden'} m-auto h-[44rem] max-h-[calc(100dvh-2rem)] w-[46rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-sheet border border-rule-strong bg-sheet p-6 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-[var(--shadow-overlay-tint)]`}
    >
      <header className="flex shrink-0 items-center justify-between gap-4">
        <h2 id={titleId} className="card-title">
          Ask About This Record
        </h2>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
          <CloseIcon />
        </button>
      </header>

      {/* Centre stage, and at full size. The cats are the interface here rather than an ornament in
          a corner: this is the one surface in the product where a person is addressing them. */}
      <div
        data-chat-stage
        aria-hidden="true"
        className="pointer-events-none mt-2 flex shrink-0 justify-center"
        style={{ height: `${STAGE_HEIGHT}px` }}
      >
        {everOpened && !reduceMotion ? (
          <Stage state={pending ? 'checking' : 'idle'} />
        ) : (
          <img src="/brand/mascot-still.png" alt="" width={STAGE_WIDTH} height={STAGE_HEIGHT} />
        )}
      </div>

      <div ref={scrollRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto py-4">
        <Transcript messages={messages} onCite={onCite} />
        {pending ? <div className={messages.length > 0 ? 'mt-5' : ''}>{<ToolTrace events={tools} />}</div> : null}
      </div>

      {/* Chips sit against the composer, not under the header: they are things to send, so they
          belong beside the control that sends things. */}
      {suggestions.length > 0 && !pending ? (
        <ul className="m-0 mb-3 flex shrink-0 list-none flex-wrap gap-2 p-0">
          {suggestions.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => onSend(question)}
                className="status-chip type-ui border border-rule-strong bg-sheet text-left transition-colors hover:bg-well"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Composer ref={composerRef} onSend={onSend} pending={pending} />
    </dialog>
  )
}
