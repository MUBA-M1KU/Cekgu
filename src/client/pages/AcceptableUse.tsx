import { Link } from 'react-router'
import { Sheet } from '../components/Sheet'

// PRODUCT.md's Acceptable Use row. The copy is c3638's draft from #100; docs/legal/acceptable-use.md
// is the source of record, so a change here changes there too.
const PROHIBITED = [
  'Confidential final examination papers, unreleased exam content or material restricted by your institution.',
  'Personal data, including learner names, identifiers, answers or marks linked to a person.',
  'Passwords, access tokens or other secrets, including those embedded in example questions or notes.',
  'Content you do not have permission to share with an external processing service.'
]

export function AcceptableUse() {
  return (
    <Sheet>
      <h1>Acceptable Use</h1>
      <p className="type-body mt-3 max-w-[62ch]">
        Use Cekgu to review practice or synthetic multiple-choice questions that you are permitted to share for
        processing through GonkaRouter's decentralised inference network. Cekgu supports an educator's review; the
        educator remains responsible for the final question and answer key.
      </p>

      <h2 className="mt-8">Content You Must Not Submit</h2>
      <ul className="mt-4 m-0 list-none p-0">
        {PROHIBITED.map((entry) => (
          <li key={entry} className="border-t border-rule py-4">
            <p className="type-body max-w-[64ch] text-ink-muted">{entry}</p>
          </li>
        ))}
      </ul>
      <p className="type-body mt-4 max-w-[64ch]">
        These restrictions apply to private accounts as well as Guest access. A private library does not make
        confidential content safe to upload.
      </p>

      <h2 className="mt-10">Using the Shared Demo</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Other guests can view and delete anything you add to the shared Guest workspace. Use synthetic examples there.
        Guest-created records are scheduled to expire after 24 hours; keep any copy you need outside the demo. Read the{' '}
        <Link to="/privacy" className="underline">
          privacy notice
        </Link>{' '}
        for cleanup timing and deletion limits.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Respect the demo's submission limits and protected sample. Review model suggestions before using them in an
        assessment; agreement between models is not a guarantee that an answer is correct.
      </p>
      <p className="type-body mt-4 max-w-[64ch] text-ink-muted">
        See{' '}
        <Link to="/terms" className="underline">
          terms
        </Link>{' '}
        for service boundaries and the attribution of the licensed Live2D sample characters.
      </p>
    </Sheet>
  )
}
