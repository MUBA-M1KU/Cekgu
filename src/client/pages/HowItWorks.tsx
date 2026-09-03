import type { ItemVerdict } from '../../shared/types'
import { Sheet } from '../components/Sheet'
import { VerdictChip } from '../components/VerdictChip'

// The meanings are PRODUCT.md's machine verdict table, in the words it shows the educator.
const VERDICTS: { verdict: ItemVerdict; meaning: string }[] = [
  { verdict: 'clear', meaning: 'No issue found by this check. It never means the question is certified correct.' },
  {
    verdict: 'possible_key_error',
    meaning: 'Both readers chose the same option that is not your key. Recheck the key first.'
  },
  {
    verdict: 'possible_ambiguity',
    meaning: 'Both readers found more than one defensible option. Recheck the stem and the options.'
  },
  { verdict: 'split_opinion', meaning: 'The readers committed to different answers. Expert judgment is required.' },
  {
    verdict: 'unverified',
    meaning: 'Fewer than two independent readings survived verification, so no verdict is given.'
  }
]

const STEPS = [
  {
    title: 'You type the questions',
    detail:
      'Stem, options and the answer you keyed. Cekgu checks the set for missing stems, duplicate options and absent keys before spending a single request.'
  },
  {
    title: 'Two models answer blind',
    detail:
      'Your key is withheld, and neither model sees the other. Each returns the option it commits to, every option it considers defensible, and its reasoning.'
  },
  {
    title: 'Each reading is verified',
    detail:
      'A reading only counts if the gateway did not substitute a different model and the public receipt names the model we asked for. Anything else is recorded and discarded.'
  },
  {
    title: 'A fixed rule decides',
    detail:
      'The two readings are compared with each other first, and only then with your key. The same rule runs every time, and the sentence it produces is printed on screen.'
  },
  {
    title: 'You review what was flagged',
    detail:
      'Risky items first, clean items still there as the control. Open any item to see both readings and their receipts side by side.'
  }
]

export function HowItWorks() {
  return (
    <Sheet>
      <h1>How It Works</h1>
      <p className="mt-3 max-w-[62ch] type-body">
        Two independent AI models answer every question before your learners do, without seeing your answer key or each
        other's response. Cekgu compares the two readings with one another first, and only then with your key. You
        decide what to change.
      </p>

      <h2 className="mt-8">The Five Verdicts</h2>
      <ul className="mt-4 p-0 m-0 list-none">
        {VERDICTS.map(({ verdict, meaning }) => (
          <li
            key={verdict}
            className="flex flex-col gap-2 border-t border-rule py-4 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <span className="shrink-0 sm:basis-48">
              <VerdictChip verdict={verdict} />
            </span>
            <p className="type-body text-ink-muted">{meaning}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10">How a Check Runs</h2>
      {/* An ordered list because these genuinely happen in order, not because numbers look tidy. */}
      <ol className="mt-4 m-0 list-none p-0">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4 border-t border-rule py-4">
            <span className="type-mono w-6 shrink-0 text-ink-muted">{index + 1}</span>
            <span className="min-w-0">
              <span className="type-label block">{step.title}</span>
              <span className="type-body text-ink-muted">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <h2 className="mt-10">You Decide, Not the Model</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Cekgu never changes a key, edits a question or approves a paper. A verdict is a place to look. You record what
        you actually did: corrected the key, revised the wording, confirmed the key was right, dismissed the flag, or
        asked for another attempt. Your decision is stored beside the machine verdict without replacing it, so the
        history shows both what Cekgu observed and what you decided.
      </p>

      <h2 className="mt-10">Receipts</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Every reading carries the Gonka request id of the call that produced it, and every id links to the gateway's
        public receipt. The receipt names the model that actually served the request, which is how Cekgu proves two
        readings came from two different families rather than the same one twice.
      </p>
      <p className="type-body mt-4 max-w-[64ch] text-ink-muted">
        A receipt is gateway metadata that makes the serving model publicly inspectable. It is not cryptographic or
        on-chain proof, and model agreement is not the same as truth.
      </p>
    </Sheet>
  )
}
