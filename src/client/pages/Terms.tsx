import { Link } from 'react-router'
import { Sheet } from '../components/Sheet'

// PRODUCT.md's Terms row. The copy is c3638's draft from #100; docs/legal/terms.md is the source of
// record, so a change here changes there too.
export function Terms() {
  return (
    <Sheet>
      <h1>Terms</h1>
      <p className="type-body mt-3 max-w-[62ch]">
        Cekgu is a demo for educators checking multiple-choice practice questions before publication. It highlights
        possible problems for a human to review. It does not certify a paper as correct or replace subject expertise or
        institutional review.
      </p>

      <h2 className="mt-8">Accounts and Records</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        A private account has its own records library. Guest access uses one shared account: other guests can view and
        delete what you add. Guest-created records are scheduled to expire after 24 hours and have no recovery promise.
        The protected demo sample is excluded from Guest deletion and expiry.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Deleting a private record hides it from your library but leaves a stored copy. Read the{' '}
        <Link to="/privacy" className="underline">
          privacy notice
        </Link>{' '}
        for the demo's deletion limits before adding content.
      </p>

      <h2 className="mt-10">Checking and Human Decisions</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Questions pass through GonkaRouter to a decentralised inference network. Do not submit confidential final papers
        or personal data, including learner information, even from a private account. Submit only content you are
        permitted to share for this processing, as described in{' '}
        <Link to="/acceptable-use" className="underline">
          acceptable use
        </Link>
        .
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Models can agree and still be wrong. You decide whether to change a question or answer key. A receipt is gateway
        metadata, not cryptographic or on-chain proof. Checks can be delayed or remain Unverified when enough valid
        readings are unavailable.
      </p>

      <h2 className="mt-10">Sample Character Attribution</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Tororo and Hijiki are Live2D sample characters, used under the{' '}
        <a
          href="https://www.live2d.com/eula/live2d-free-material-license-agreement_en.html"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Live2D Free Material License Agreement
        </a>{' '}
        and{' '}
        <a
          href="https://www.live2d.com/en/learn/sample/model-terms/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          sample-data terms
        </a>
        . They are not Cekgu's original characters. Illustration and modelling: Live2D Inc. The animated characters use
        the Live2D Cubism SDK, which has{' '}
        <a href="https://www.live2d.com/en/sdk/license/" target="_blank" rel="noreferrer" className="underline">
          separate release licensing
        </a>
        .
      </p>
      <p className="type-body mt-4 max-w-[64ch] bg-well p-4">
        This content uses sample data owned and copyrighted by Live2D Inc.
      </p>
      <p className="type-body mt-4 max-w-[64ch] text-ink-muted">
        Publication requires the application-length copyright notice in full. Its inclusion in the final app copy
        remains a release review item; the short attribution above does not replace it.
      </p>
    </Sheet>
  )
}
