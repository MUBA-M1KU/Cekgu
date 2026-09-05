import { type Ref, useId, useState } from 'react'

type Props = {
  onSend: (question: string) => void
  pending: boolean
  ref?: Ref<HTMLTextAreaElement>
}

// One row, and the field is the same height as the button beside it. A two-row textarea next to a
// one-row button reads as two unrelated controls that happen to be adjacent.
const ROW = 'h-11'

export function Composer({ onSend, pending, ref }: Props) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const question = draft.trim()
  const ready = question.length > 0 && !pending

  const send = () => {
    if (!ready) return
    onSend(question)
    setDraft('')
  }

  return (
    <form
      className="flex shrink-0 items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <label htmlFor={id} className="sr-only">
        Your Question
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        // Enter sends and Shift+Enter breaks the line. A question about one item is a sentence, and
        // reaching for a button after every sentence is the slower path through a two-minute demo.
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            send()
          }
        }}
        placeholder="Ask about this record…"
        className={`type-ui ${ROW} min-w-0 flex-1 resize-none rounded-control border border-rule-strong bg-transparent px-3 py-[0.6rem] text-ink`}
      />
      <button type="submit" className={`btn btn-primary ${ROW} shrink-0`} disabled={!ready}>
        Send
      </button>
    </form>
  )
}
