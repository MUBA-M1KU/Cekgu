import { Link } from 'react-router'
import type { Attempt, Item, ReceiptStatus } from '../../shared/types'
import { BubbleRow } from './BubbleRow'

const RECEIPT_LABEL: Record<ReceiptStatus, string> = {
  verified: 'Verified',
  mismatch: 'Mismatch',
  missing: 'Missing',
  pending: 'Pending'
}

function receiptPath(requestId: string): string {
  return `/receipt/${requestId}`
}

// A rate-limited call carries no x-request-id either, so the 429 has to be named before the
// missing-id branch or it reads as a timeout next to its own "The gateway answered 429" reason.
// Hedged is its own state and not a rejection: that reading was admissible and simply arrived
// second, and calling it Rejected in the one table a judge reads misstates what the gateway did.
export function attemptStatus(attempt: Attempt): string {
  if (attempt.admitted) return 'Admitted'
  if (attempt.rejectionReason?.startsWith('A hedge of this call returned first')) return 'Hedged'
  if (attempt.httpStatus === 429) return 'Rate Limited'
  if (attempt.requestId === null) return 'Timed Out'
  return 'Rejected'
}

// Every rejection reason the server can write, in at most five words. The long sentence is the one
// that belongs in the record; it is what the row's title attribute carries. What the table needs is
// a label short enough to sit in a column beside seven others, on a projector, without wrapping to
// four lines. $1 carries through the one detail that varies.
const SHORT_REASONS: [RegExp, string][] = [
  [/^A hedge of this call returned first/, 'Its twin returned first'],
  [/^The gateway answered \d+\.[\s\S]*rate limit/, 'Too many concurrent requests'],
  [/^The gateway answered (\d+)/, 'Gateway answered $1'],
  [/^The gateway substituted a model/, 'Gateway substituted another model'],
  [/^The gateway returned a body that is not JSON/, 'Gateway body was not JSON'],
  [/^The call passed the (\d+) second/, 'Passed the $1 second cutoff'],
  [/^The response carried no x-request-id/, 'No request id returned'],
  [/^The receipt for \S+ could not be read/, 'Receipt could not be read'],
  [/^No receipt appeared for/, 'No receipt appeared in time'],
  [/^The receipt names \S+, but/, 'Receipt names a different model'],
  [/^The receipt did not verify/, 'Receipt did not verify'],
  [/^The receipt named no serving model/, 'Receipt named no model'],
  [/^The model did not return the requested JSON/, 'Not the requested JSON'],
  [/^The model answered (\S+?),/, 'Answered $1, not an option'],
  [/^The model called (\S+?) defensible/, 'Called $1, not an option']
]

export function shortReason(reason: string | null): string | null {
  if (!reason) return null

  for (const [pattern, short] of SHORT_REASONS) {
    const found = reason.match(pattern)
    if (found) return short.replace('$1', found[1] ?? '')
  }

  // An unmapped reason still has to fit. Trimming to five words is worse copy than a written one,
  // which is why the table above exists, but it is never a broken column.
  const words = reason.replace(/[.…]$/, '').split(/\s+/)
  return words.length <= 5 ? words.join(' ') : `${words.slice(0, 5).join(' ')}…`
}

function seconds(ms: number | null): string {
  return ms === null ? '—' : `${(ms / 1000).toFixed(1)}s`
}

// A reader's column: model name, its own bubble row, its rationale, then the provenance block.
// Model names and request ids are text so a judge can copy an id into the receipt URL during Q&A.
//
// Above 720px the column is a subgrid of the panel's ten rows, so both readers' model names,
// bubbles, rationales and provenance lines sit on the same baselines however long either reason
// runs. The rows are an invisible table; nothing here draws a rule or a cell.
function ReaderColumn({ item, attempt }: { item: Item; attempt: Attempt }) {
  const reading = attempt.reading
  if (!reading) return null

  return (
    <div className="min-w-0 min-[720px]:grid min-[720px]:row-span-10 min-[720px]:grid-rows-subgrid">
      <p className="type-eyebrow text-ink-muted">Served Model</p>
      <p className="type-mono mt-1 break-words">{attempt.servedModel}</p>

      <div className="mt-3">
        <BubbleRow options={item.options} filled={reading.answer} label={`Answer chosen by ${attempt.servedModel}`} />
      </div>

      {reading.defensible.length > 1 ? (
        <p className="mt-2 type-caption text-ink-muted">
          Also considered defensible: {reading.defensible.filter((letter) => letter !== reading.answer).join(', ')}
        </p>
      ) : (
        // The empty cell holds row four open. Dropping it would move every later row up in this
        // column alone, which is the misalignment the subgrid exists to remove.
        <div />
      )}

      <p className="type-body mt-3 italic">{reading.reason}</p>

      <dl className="type-mono mt-4 m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 min-[720px]:row-span-4 min-[720px]:grid-rows-subgrid min-[720px]:gap-y-0">
        <dt className="text-ink-muted">Request Id</dt>
        <dd className="m-0 break-words">{attempt.requestId}</dd>
        <dt className="text-ink-muted">Requested</dt>
        <dd className="m-0 break-words">{attempt.requestedModel}</dd>
        <dt className="text-ink-muted">Served</dt>
        <dd className="m-0 break-words">{attempt.servedModel}</dd>
        <dt className="text-ink-muted">Receipt</dt>
        <dd className="m-0">{RECEIPT_LABEL[attempt.receiptStatus]}</dd>
      </dl>

      {attempt.requestId ? (
        <p className="mt-3 m-0">
          <Link
            to={receiptPath(attempt.requestId)}
            target="_blank"
            rel="noreferrer"
            className="type-label inline-block underline"
          >
            View Receipt
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export function EvidencePanel({ item }: { item: Item }) {
  const admitted = item.attempts.filter((attempt) => attempt.admitted && attempt.reading)

  // Distinctness is proven by receipt, not by which model was asked for, so the two columns are
  // chosen on served model. FR-EVIDENCE-4: never two readings from the same family side by side.
  const readers: Attempt[] = []
  for (const attempt of admitted) {
    if (!readers.some((chosen) => chosen.servedModel === attempt.servedModel)) readers.push(attempt)
    if (readers.length === 2) break
  }

  const unadmitted = item.attempts.filter((attempt) => !readers.includes(attempt))

  return (
    <div className="mt-4 bg-well p-4 sm:p-6">
      <h3 className="type-eyebrow text-ink-muted">Evidence</h3>

      <div className="mt-4 flex flex-col gap-6 min-[720px]:grid min-[720px]:grid-cols-2 min-[720px]:grid-rows-[repeat(10,auto)] min-[720px]:gap-x-8 min-[720px]:gap-y-0">
        {readers[0] ? <ReaderColumn item={item} attempt={readers[0]} /> : null}

        {readers[1] ? (
          <ReaderColumn item={item} attempt={readers[1]} />
        ) : (
          <div className="min-w-0 min-[720px]:row-span-10">
            <p className="type-eyebrow text-ink-muted">No Second Reading</p>
            <p className="mt-2 max-w-[46ch] type-body">
              Only one model family produced a reading Cekgu could admit, so no verdict is given. The attempts below
              show what the other family did.
            </p>
          </div>
        )}
      </div>

      <h3 className="type-eyebrow mt-6 text-ink-muted">All Attempts</h3>
      <div className="mt-3 overflow-x-auto">
        {/* Every cell is flush left against its header, chips included: a status set in a chip sat a
            pill's padding to the right of the word above it, which read as an indent nothing meant. */}
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="type-label border-b border-rule">
              <th className="py-2 pr-4 text-left font-medium">#</th>
              <th className="py-2 pr-4 text-left font-medium">Requested Model</th>
              <th className="py-2 pr-4 text-left font-medium">Served Model</th>
              <th className="py-2 pr-4 text-left font-medium">Status</th>
              <th className="py-2 pr-4 text-left font-medium">Request Id</th>
              <th className="py-2 pr-4 text-left font-medium">Shard</th>
              <th className="py-2 pr-4 text-left font-medium">Latency</th>
              <th className="py-2 text-left font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {item.attempts.map((attempt, index) => (
              <tr key={attempt.id} className="border-b border-rule align-top">
                <td className="type-mono py-2 pr-4">{index + 1}</td>
                <td className="type-mono py-2 pr-4 break-words">{attempt.requestedModel}</td>
                <td className="type-mono py-2 pr-4 break-words">{attempt.servedModel ?? '—'}</td>
                <td className="py-2 pr-4">
                  <span className="type-label whitespace-nowrap">{attemptStatus(attempt)}</span>
                  {attempt.rejectionReason ? (
                    // The five words are what the column can hold; the sentence the server wrote is
                    // still read out and still on hover, so shortening costs a reader nothing.
                    <p className="mt-1 type-caption text-ink-muted" title={attempt.rejectionReason}>
                      <span aria-hidden="true">{shortReason(attempt.rejectionReason)}</span>
                      <span className="sr-only">{attempt.rejectionReason}</span>
                    </p>
                  ) : null}
                </td>
                <td className="type-mono py-2 pr-4">
                  {attempt.requestId ? (
                    <Link
                      to={receiptPath(attempt.requestId)}
                      target="_blank"
                      rel="noreferrer"
                      className="whitespace-nowrap underline"
                    >
                      {attempt.requestId}
                    </Link>
                  ) : (
                    <span className="type-caption text-ink-muted">No request id was returned.</span>
                  )}
                </td>
                <td className="type-mono py-2 pr-4">{attempt.devshardId ?? '—'}</td>
                <td className="type-mono py-2 pr-4">{seconds(attempt.latencyMs)}</td>
                <td className="type-label py-2 whitespace-nowrap">{RECEIPT_LABEL[attempt.receiptStatus]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unadmitted.length > 0 ? (
        <p className="mt-3 type-caption text-ink-muted">
          Rejected, hedged and timed-out attempts are listed because they are part of the record. Only readings that
          passed receipt verification enter the verdict. A request id opens its receipt.
        </p>
      ) : null}
    </div>
  )
}
