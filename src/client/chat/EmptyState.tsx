// The exact four the design contract names. They are the four questions the record actually
// answers: one flagged item, the disagreements, one item's two readings, and why anything is
// Unverified. Sentence case, because a question is something a person says, not a control label.
const SUGGESTIONS = [
  'Why is question 4 flagged?',
  'Which questions did the readers disagree on?',
  'What did each reader say about question 7?',
  'Why is anything Unverified?'
]

/**
 * What the modal shows before the first question.
 *
 * The closing line is the product position, not a disclaimer, so it is set in the paper face at
 * lead size in full ink rather than as muted fine print under the fold. PRODUCT.md defines Cekgu
 * against "a single general AI chat [that] offers one opaque opinion"; this is the sentence that
 * says so before a judge has typed anything.
 */
export function EmptyState({ onSend }: { onSend: (question: string) => void }) {
  return (
    <div>
      <p className="type-eyebrow text-ink-muted">Start Here</p>

      <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        {SUGGESTIONS.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onSend(question)}
              className="type-ui w-full rounded-control border border-rule-strong bg-sheet px-3 py-2 text-left transition-colors hover:bg-well"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>

      <p className="type-lead mt-5 max-w-[44ch]">
        Cekgu reports what the two readers found. It does not decide which answer is correct, because that decision is
        yours.
      </p>
    </div>
  )
}
