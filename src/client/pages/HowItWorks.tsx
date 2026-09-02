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

      <p className="mt-6 max-w-[62ch] type-body text-ink-muted">
        A receipt is gateway metadata that makes the serving model publicly inspectable. It is not cryptographic or
        on-chain proof, and model agreement is not the same as truth.
      </p>
    </Sheet>
  )
}
