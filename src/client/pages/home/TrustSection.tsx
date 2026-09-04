import { Link } from 'react-router'

// FR-PUBLIC-2. The claims here are deliberately smaller than the product feels, because prompts
// traverse a decentralised network and a receipt is metadata rather than proof.
const FAQ = [
  {
    q: 'Where do my questions go?',
    a: 'Each question is sent to the GonkaRouter gateway, which routes it to a decentralised inference network. Your questions leave our server and are processed by machines we do not own. Do not enter confidential final examinations or any learner personal data.'
  },
  {
    q: 'Does Cekgu store anything about my students?',
    a: 'No. Cekgu reviews assessment content, not student performance. There is no field anywhere in the system for a learner name, answer, mark or identifier.'
  },
  {
    q: 'What is a receipt, and is it proof?',
    a: 'A receipt is public metadata the gateway publishes for a completed request. It makes the model that actually served a request inspectable by anyone with the request id. It is gateway metadata, not cryptographic proof and not an on-chain transaction.'
  },
  {
    q: 'Does agreement between two models mean the answer is right?',
    a: 'No. Two models agreeing is a signal worth your attention, not a proof of truth. They may share training data or share a misconception. Cekgu never certifies a question as correct.'
  },
  {
    q: 'Why does an item sometimes say Unverified?',
    a: 'Because fewer than two distinct, receipt-verified readings survived. Models time out and rate limits happen. Cekgu refuses to give a verdict on one reading rather than pretending there was a consensus.'
  },
  {
    q: 'Who can see what I add in the Guest workspace?',
    a: 'Everyone. The Guest account is one shared account, not a private session of your own. Every guest can open and delete every other guest record. Guest records are removed 24 hours after they are created.'
  },
  {
    q: 'Can Cekgu change my paper?',
    a: 'No. Cekgu suggests where to look. Only you change a key, the wording, or the disposition on a flagged item.'
  }
]

// PRODUCT.md's Terms, Privacy and Acceptable Use rows. The pages carry the notices; this is the way in.
const NOTICES = [
  { to: '/terms', name: 'Terms', gist: 'What Cekgu is for, the limits it sets, and how accounts and records work.' },
  {
    to: '/privacy',
    name: 'Privacy',
    gist: 'What is stored, where processing happens, who can see a record, and what deletion does.'
  },
  {
    to: '/acceptable-use',
    name: 'Acceptable Use',
    gist: 'What must never be submitted, and how the shared Guest workspace may be used.'
  }
]

export function TrustSection() {
  return (
    <section id="trust" className="bg-well py-[clamp(4rem,8vw,7rem)]">
      <div className="wrap">
        <div className="max-w-[46rem]">
          <h2 className="text-[clamp(2rem,3.4vw,2.75rem)]/[1.1] tracking-[-0.025em]">
            Your questions leave our server. Here is what that means.
          </h2>
          <p className="type-ui mt-5 text-[1.0625rem]/[1.6] text-ink-muted">
            Cekgu asks you to send your questions to a network of machines that we do not control, so it is worth being
            plain about what that means and what it does not. Your records belong to your account. A private account's
            library is visible only to that account. The Guest workspace is shared by everyone who uses it and is not
            private in any sense.
          </p>
        </div>

        <dl className="mt-10 m-0 grid gap-5 lg:grid-cols-2">
          {FAQ.map((entry) => (
            <div key={entry.q} className="card-soft p-6">
              <dt className="type-label">{entry.q}</dt>
              <dd className="type-body m-0 mt-2 max-w-[64ch] text-ink-muted">{entry.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card-soft p-6">
            <h3 className="type-label">Notices</h3>
            <ul className="mt-3 m-0 list-none p-0">
              {NOTICES.map((notice) => (
                <li key={notice.to} className="mt-3 first:mt-0">
                  <Link to={notice.to} className="type-label underline">
                    {notice.name}
                  </Link>
                  <p className="type-body m-0 mt-1 max-w-[64ch] text-ink-muted">{notice.gist}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-soft p-6">
            <h3 className="type-label">Reach the Team</h3>
            <p className="type-body mt-3 max-w-[64ch] text-ink-muted">
              Cekgu is a hackathon demo built by a small team, not a staffed product. Reach us on X at{' '}
              <a href="https://x.com/Cekgu0903" target="_blank" rel="noreferrer" className="underline">
                @Cekgu0903
              </a>
              . There is no support desk behind that account and no promised reply time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
