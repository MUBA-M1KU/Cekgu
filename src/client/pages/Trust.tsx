import { Sheet } from '../components/Sheet'

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

export function Trust() {
  return (
    <>
      <Sheet>
        <h1>Trust and Privacy</h1>
        <p className="type-body mt-3 max-w-[64ch]">
          Cekgu asks you to send your questions to a network of machines that we do not control, so it is worth being
          plain about what that means and what it does not.
        </p>
        <p className="type-body mt-4 max-w-[64ch]">
          Your records belong to your account. A private account's library is visible only to that account. The Guest
          workspace is shared by everyone who uses it and is not private in any sense.
        </p>
      </Sheet>

      <section className="mt-10">
        <h2>Questions People Ask</h2>
        <dl className="mt-5 m-0">
          {FAQ.map((entry) => (
            <div key={entry.q} className="border-t border-rule py-4">
              <dt className="type-label">{entry.q}</dt>
              <dd className="type-body m-0 mt-2 max-w-[64ch] text-ink-muted">{entry.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}
