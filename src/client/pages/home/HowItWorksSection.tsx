import type { ItemVerdict } from '../../../shared/types'
import { VerdictChip } from '../../components/VerdictChip'

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

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="wrap py-[clamp(4rem,8vw,7rem)]">
      <div className="max-w-[46rem]">
        <h2 className="text-[clamp(2rem,3.4vw,2.75rem)]/[1.1] tracking-[-0.025em]">
          Five steps, and you make the last one.
        </h2>
        <p className="type-lead mt-5 text-ink-muted">
          Cekgu is a first pass, not a vetting committee. It never changes a key, edits a question or approves a paper.
          It does not certify a paper, change a key, or grade anyone. Every decision on this page is yours.
        </p>
      </div>

      {/* An ordered list because these genuinely happen in order, not because numbers look tidy. */}
      <ol className="mt-12 m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="card-soft p-6">
            <p className="type-mono text-ink-muted">{String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-[1.125rem]">{step.title}</h3>
            <p className="type-body mt-2 text-ink-muted">{step.detail}</p>
          </li>
        ))}
      </ol>

      <h3 className="mt-16 text-[1.375rem]">The Five Verdicts</h3>
      <ul className="mt-5 m-0 list-none p-0">
        {VERDICTS.map(({ verdict, meaning }) => (
          <li
            key={verdict}
            className="flex flex-col gap-2 border-t border-rule py-4 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <span className="shrink-0 sm:basis-56">
              <VerdictChip verdict={verdict} />
            </span>
            <p className="type-body max-w-[62ch] text-ink-muted">{meaning}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-[1.125rem]">You Decide, Not the Model</h3>
          <p className="type-body mt-3 max-w-[64ch] text-ink-muted">
            A verdict is a place to look. You record what you actually did: corrected the key, revised the wording,
            confirmed the key was right, dismissed the flag, or asked for another attempt. Your decision is stored
            beside the machine verdict without replacing it, so the history shows both what Cekgu observed and what you
            decided.
          </p>
        </div>
        <div>
          <h3 className="text-[1.125rem]">Receipts</h3>
          <p className="type-body mt-3 max-w-[64ch] text-ink-muted">
            Every reading carries the Gonka request id of the call that produced it, and every id links to the gateway's
            public receipt. The receipt names the model that actually served the request, which is how Cekgu proves two
            readings came from two different families rather than the same one twice. It is not cryptographic or
            on-chain proof, and model agreement is not the same as truth.
          </p>
        </div>
      </div>
    </section>
  )
}
