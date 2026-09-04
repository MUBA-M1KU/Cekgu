// FR-PUBLIC-2. The claims here are deliberately smaller than the product feels, because prompts
// traverse a decentralised network and a receipt is metadata rather than proof.
const FAQ = [
  {
    q: 'Where do my questions go?',
    a: 'The GonkaRouter gateway routes each question to a decentralised inference network, so your questions leave our server and are processed by machines we do not own. Do not enter confidential final examinations or any learner personal data.'
  },
  {
    q: 'Does Cekgu store anything about my students?',
    a: 'No. Cekgu reviews assessment content, not student performance. The system has no field for a learner name, answer, mark or identifier.'
  },
  {
    q: 'What is a receipt, and is it proof?',
    a: 'Public metadata the gateway publishes for a completed request. Anyone with the request id can see which model actually served it. It is gateway metadata, not cryptographic proof and not an on-chain transaction.'
  },
  {
    q: 'Does agreement between two models mean the answer is right?',
    a: 'No. Two models agreeing is a signal worth your attention, not proof. They may share training data, or share a misconception. Cekgu never certifies a question as correct.'
  },
  {
    q: 'Why does an item sometimes say Unverified?',
    a: 'Because fewer than two distinct, receipt-verified readings survived: models time out, rate limits happen. Cekgu will not rule on one reading and call it a consensus.'
  },
  {
    q: 'Who can see what I add in the Guest workspace?',
    a: 'Everyone. Guest is one shared account, not a private session. Every guest can open and delete every other guest record, and guest records are removed 24 hours after they are created.'
  },
  {
    q: 'Can Cekgu change my paper?',
    a: "No. Cekgu suggests where to look. Only you change a key, the wording, or a flagged item's disposition."
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
            Cekgu sends your questions to a network of machines we do not control, so it is worth being plain about
            that. Your records belong to your account, and a private library is visible only to that account. The Guest
            workspace is shared by everyone who uses it, and is not private.
          </p>
        </div>

        {/* Disclosures rather than seven opened cards. The answers are long and only one is ever
            the reader's question, so a wall of them buried the section's own lede — which is where
            the facts that apply to everyone already are. Native details/summary: it works with the
            keyboard, and without JavaScript. */}
        <div className="faq-list">
          {FAQ.map((entry) => (
            <details key={entry.q} className="faq-item">
              <summary className="faq-q type-label">{entry.q}</summary>
              <p className="faq-a type-body">{entry.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
