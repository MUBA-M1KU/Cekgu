import { Link } from 'react-router'
import type { Attempt, Item, RecordDetail } from '../../../shared/types'
import { ReadRow } from '../../components/ReadRow'
import { VerdictChip } from '../../components/VerdictChip'
import { receiptPath } from '../ReceiptView'

// The cats are the two SEATS, never a particular model: which family serves a seat varies per
// item, so a fixed cat-to-model mapping would be a lie.
const SEATS = [
  { label: 'Reader A', src: '/mascots/tororo.png' },
  { label: 'Reader B', src: '/mascots/hijiki.png' }
]

// The worked example is the one an educator would open first: a key error, where both readers
// agreed with each other and disagreed with the paper. Falling back to whatever is flagged, then
// to the first item, so this section is never empty against a differently seeded sample.
function worked(record: RecordDetail): Item | null {
  return (
    record.items.find((item) => item.verdict === 'possible_key_error') ??
    record.items.find((item) => item.verdict !== 'clear' && item.verdict !== 'pending') ??
    record.items[0] ??
    null
  )
}

// Distinctness is proven by the receipt, so the two seats are chosen on served model. The same
// rule EvidencePanel applies; both sections would otherwise disagree about who reader B was.
function admittedSeats(item: Item): Attempt[] {
  const seats: Attempt[] = []
  for (const attempt of item.attempts) {
    if (!attempt.admitted || !attempt.reading) continue
    if (seats.some((chosen) => chosen.servedModel === attempt.servedModel)) continue
    seats.push(attempt)
    if (seats.length === 2) break
  }
  return seats
}

function Reading({ item, index }: { item: Item; index: number }) {
  const attempt = admittedSeats(item)[index]
  const seat = SEATS[index]
  if (!attempt || !seat || !attempt.reading) return null

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <img src={seat.src} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="type-eyebrow text-ink-muted">{seat.label}</p>
          <p className="type-mono truncate">{attempt.servedModel ?? attempt.requestedModel}</p>
        </div>
      </div>
      <p className="type-body mt-3 italic text-ink-muted">{attempt.reading.reason}</p>
      {attempt.requestId ? (
        <p className="type-mono mt-3 truncate border-t border-rule pt-3 text-ink-muted">
          {/* The viewer, not the raw JSON. A judge following this during Q&A used to land on a
              wall of snake_case with nothing naming the fields; the page it lands on now offers
              the same gateway URL so they can still check it against us. */}
          <Link to={receiptPath(attempt.requestId)} className="underline">
            {attempt.requestId}
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export function SampleSection({ record }: { record: RecordDetail | null }) {
  const item = record ? worked(record) : null

  return (
    <section id="sample" className="bg-well py-[clamp(4rem,8vw,7rem)]">
      <div className="wrap">
        <div className="max-w-[46rem]">
          <h2 className="text-[clamp(2rem,3.4vw,2.75rem)]/[1.1] tracking-[-0.025em]">
            One question, two readings, both receipts.
          </h2>
          <p className="type-ui mt-5 text-[1.0625rem]/[1.6] text-ink-muted">
            This is a real record, kept as it was produced. Every id below resolves to the gateway's public receipt, and
            the receipt names the model that actually served the call.
          </p>
        </div>

        {item ? (
          <div className="card-soft mt-10 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3 className="max-w-[42ch]">{item.stem}</h3>
              <VerdictChip verdict={item.verdict} />
            </div>

            {/* One row, three facts: your key filled, and a ring for each reader who chose that
                option. Two rings on a letter the fill is not on is a key error, seen rather than
                read. */}
            <div className="mt-5">
              <ReadRow
                options={item.options}
                keyLetter={item.key}
                readerA={admittedSeats(item)[0]?.reading?.answer ?? null}
                readerB={admittedSeats(item)[1]?.reading?.answer ?? null}
              />
            </div>

            {item.verdictReason ? <p className="type-ui mt-5 max-w-[70ch]">{item.verdictReason}</p> : null}

            <div className="mt-6 grid gap-6 rounded-sheet bg-well p-5 sm:p-6 lg:grid-cols-2">
              <Reading item={item} index={0} />
              <Reading item={item} index={1} />
            </div>
          </div>
        ) : (
          <p className="type-ui mt-10 text-ink-muted">Loading the sample report.</p>
        )}

        <Link to="/sample" className="type-label mt-6 inline-block underline">
          See the Full Report
        </Link>
      </div>
    </section>
  )
}
