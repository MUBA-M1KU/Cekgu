import { Link } from 'react-router'
import { Sheet } from '../components/Sheet'

// PRODUCT.md's Privacy row. The copy is c3638's draft from #100; docs/legal/privacy.md is the source
// of record, so a change here changes there too.
export function Privacy() {
  return (
    <Sheet>
      <h1>Privacy</h1>
      <p className="type-body mt-3 max-w-[62ch]">
        Cekgu processes assessment content so educators can inspect potential problems. Do not enter confidential final
        papers or personal data in questions or notes. A private account does not make that content suitable for
        external processing.
      </p>

      <h2 className="mt-8">What Is Stored</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        For private sign-in, we store account information such as your name and email, together with authentication
        data. Both private and Guest sign-in use a session cookie; session records can include an IP address and browser
        information.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Review records store assessment metadata alongside the questions and supplied keys. They also keep model
        evidence and your review decisions. They are associated with the account that created them. Free-text fields can
        contain personal information if entered; the absence of a dedicated learner field does not prevent it from being
        stored.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">The Reduce Motion preference is stored locally in your browser.</p>

      <h2 className="mt-10">Where Processing Happens</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Our hosting and database infrastructure process account and record data. Questions are sent through GonkaRouter
        to a decentralised inference network, outside machines operated by the Cekgu team. Private sign-in does not keep
        questions within Cekgu's infrastructure.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Your browser requests fonts from Google Fonts when pages load, including before sign-in. When animated
        characters load, it also downloads the Cubism runtime from Live2D's CDN.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        <a href="https://gonkarouter.io/privacy-policy" target="_blank" rel="noreferrer" className="underline">
          GonkaRouter's privacy policy
        </a>{' '}
        allows retention of API inputs and outputs for debugging, service improvement and security monitoring, without
        stating a fixed retention period. Its providers may process data under their own policies, including outside
        your country. Cekgu does not promise zero third-party retention.
      </p>

      <h2 className="mt-10">Who Can See Records</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        A private account's library is available to that account through the app. Guest records are public within the
        shared demo workspace: anyone entering as Guest can view or delete another guest's records. Guest access does
        not provide a private account. Request IDs also allow inspection of public gateway receipt metadata.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Saved review activity on the protected sample is publicly readable without signing in, including any notes and
        revised wording submitted through the API. Guests can reset this shared review history.
      </p>

      <h2 className="mt-10">Expiry and Deletion</h2>
      <p className="type-body mt-4 max-w-[64ch]">
        Guest-created records are scheduled to expire 24 hours after creation. A periodic cleanup removes expired
        records when the worker runs; records remain accessible to guests until that cleanup succeeds. Guest deletion
        removes a record and its related review data from the app database without a recovery option. The protected
        sample is excluded from Guest deletion and expiry.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Private deletion hides the record from your library but retains a stored copy. It does not cancel queued or
        running checks, so those questions may still be sent for processing. This demo has no restore interface or
        verified automatic permanent-deletion deadline for private records.
      </p>
      <p className="type-body mt-4 max-w-[64ch]">
        Deleting a record does not delete your account or guarantee removal from infrastructure backups, service logs or
        third-party systems.
      </p>
      <p className="type-body mt-4 max-w-[64ch] text-ink-muted">
        See also{' '}
        <Link to="/terms" className="underline">
          terms
        </Link>{' '}
        and{' '}
        <Link to="/acceptable-use" className="underline">
          acceptable use
        </Link>
        .
      </p>
    </Sheet>
  )
}
