import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Attempt, Item, ReceiptStatus } from '../../shared/types'
import { useMuted } from '../mascot/preferences'
import { itemUtterances } from '../mascot/speech'
import { type SpeechHandle, speak } from '../mascot/voice'
import { receiptPath } from '../pages/ReceiptView'
import { BubbleRow } from './BubbleRow'
import { InfoIcon, VoiceOnIcon } from './icons'

// The rule the attempts table is read by. One sentence, on the heading, rather than a paragraph
// under every table on every open item.
const ATTEMPTS_RULE =
  'Every attempt is listed, admitted or not. A reading enters the verdict only when its receipt names the model that was requested.'

const RECEIPT_LABEL: Record<ReceiptStatus, string> = {
  verified: 'Verified',
  mismatch: 'Mismatch',
  missing: 'Missing',
  pending: 'Pending'
}

// A rate-limited call carries no x-request-id either, so the 429 has to be named before the
// missing-id branch or it reads as a timeout next to its own "The gateway answered 429" reason.
export function attemptStatus(attempt: Attempt): string {
  if (attempt.admitted) return 'Admitted'
  if (attempt.httpStatus === 429) return 'Rate Limited'
  if (attempt.requestId === null) return 'Timed Out'
  return 'Rejected'
}

function seconds(ms: number | null): string {
  return ms === null ? '-' : `${(ms / 1000).toFixed(1)}s`
}

// The cats are the two SEATS, never a particular model: which family serves a seat varies per
// item, so a fixed cat-to-model mapping would be a lie. The seat is named above the served model
// rather than instead of it, because the model name is what a judge reads out and copies.
const SEATS = [
  { label: 'Reader A', src: '/mascots/tororo.png' },
  { label: 'Reader B', src: '/mascots/hijiki.png' }
]

// A reader's column: seat, model name, its own bubble row, its rationale, then the provenance
// block. Model names and request ids are text so a judge can copy an id into the receipt URL.
function ReaderColumn({ item, attempt, seat }: { item: Item; attempt: Attempt; seat: number }) {
  const reading = attempt.reading
  if (!reading) return null
  const who = SEATS[seat]

  return (
    <div className="min-w-0 flex-1">
      {who ? (
        <p className="mb-3 flex items-center gap-2">
          <img src={who.src} alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />
          <span className="type-label">{who.label}</span>
        </p>
      ) : null}
      <p className="type-eyebrow text-ink-muted">Served Model</p>
      <p className="type-mono mt-1 break-words">{attempt.servedModel}</p>

      <div className="mt-3">
        <BubbleRow options={item.options} filled={reading.answer} label={`Answer chosen by ${attempt.servedModel}`} />
      </div>

      {reading.defensible.length > 1 ? (
        <p className="mt-2 type-caption text-ink-muted">
          Also considered defensible: {reading.defensible.filter((letter) => letter !== reading.answer).join(', ')}
        </p>
      ) : null}

      <p className="type-body mt-3 italic">{reading.reason}</p>

      <dl className="type-mono mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-ink-muted">Request Id</dt>
        <dd className="m-0 break-words">{attempt.requestId}</dd>
        <dt className="text-ink-muted">Requested</dt>
        <dd className="m-0 break-words">{attempt.requestedModel}</dd>
        <dt className="text-ink-muted">Served</dt>
        <dd className="m-0 break-words">{attempt.servedModel}</dd>
        <dt className="text-ink-muted">Receipt</dt>
        <dd className="m-0">{RECEIPT_LABEL[attempt.receiptStatus]}</dd>
      </dl>

      {/* Outline rather than ghost: this panel is a well, and a ghost control on a recessed ground
          is a text link with padding. The receipt is the product's whole claim, so the one control
          that opens it gets a surface to sit on. */}
      {attempt.requestId ? (
        <Link to={receiptPath(attempt.requestId)} className="btn btn-outline btn-sm mt-3">
          View Receipt
        </Link>
      ) : null}
    </div>
  )
}

/**
 * The two readers, out loud, on request. Nothing here speaks on its own: the record page says the
 * summary once and everything per item waits to be asked for, which is what keeps twelve items from
 * becoming twelve interruptions.
 *
 * There is no caption because this panel IS the caption — every word spoken is already printed
 * beside it. Muted, the control is not rendered at all rather than left dead, since the evidence is
 * fully readable without it.
 */
function PlayReaders({ item }: { item: Item }) {
  const muted = useMuted()
  const handle = useRef<SpeechHandle | null>(null)

  useEffect(() => () => handle.current?.cancel(), [])

  const lines = itemUtterances(item)
  if (muted || lines.length === 0) return null

  return (
    <button
      type="button"
      onClick={() => {
        handle.current?.cancel()
        handle.current = speak(lines, { muted: false })
      }}
      className="btn btn-ghost btn-sm"
    >
      <VoiceOnIcon />
      Play Readers
    </button>
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

  return (
    <div className="mt-4 rounded-control bg-well p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="type-eyebrow text-ink-muted">Evidence</h3>
        <PlayReaders item={item} />
      </div>

      <div className="mt-4 flex flex-col gap-6 min-[720px]:flex-row">
        {readers[0] ? <ReaderColumn item={item} attempt={readers[0]} seat={0} /> : null}

        {readers[1] ? (
          <ReaderColumn item={item} attempt={readers[1]} seat={1} />
        ) : (
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow text-ink-muted">No Second Reading</p>
            <p className="mt-2 max-w-[46ch] type-ui">
              Only one model family produced a reading Cekgu could admit, so no verdict is given. The attempts below
              show what the other family did.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <h3 className="type-eyebrow text-ink-muted">All Attempts</h3>
        {/* The rule this table is read by, on the heading that names it. It was a sentence printed
            under every attempts table on every open item, and it says the same thing every time. */}
        <button type="button" className="attempts-tip" data-tip={ATTEMPTS_RULE} aria-label="How attempts are counted">
          <InfoIcon size={15} />
          <span className="sr-only">{ATTEMPTS_RULE}</span>
        </button>
      </div>

      {/* Eight columns did not fit. At 1920 this panel gives a table 898 px, and requested model,
          served model and a 30-character request id each wanted a column of their own, so the table
          scrolled sideways and the receipt link sat off the visible edge — on the one screen whose
          whole job is to be inspected.

          Six columns, and the two that merged were the two that belong together: an attempt's id and
          the receipt that proves it are one fact, not two, and they read better stacked under the
          model than spread across the page. Requested model earns a line only when it differs from
          what was served, which is the single case the rule below the heading is about; when they
          match, saying so twice per row bought nothing and cost the scrollbar. */}
      <div className="mt-3 overflow-x-auto">
        <table className="data-table" data-surface="well">
          <thead>
            <tr className="type-label">
              <th>#</th>
              <th>Attempt</th>
              <th>Status</th>
              <th>Shard</th>
              <th>Latency</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {item.attempts.map((attempt, index) => (
              <tr key={attempt.id}>
                <td className="type-mono align-top">{index + 1}</td>
                <td className="align-top">
                  {/* A span, not a p. scripts/demo/record.mjs finds shot 5's reader columns with
                      p.type-mono and record.test.ts asserts that resolves to exactly one element,
                      so a paragraph here would put three of them on an item with a retry and the
                      recorder would throw on a strict-mode violation before the camera moved. */}
                  <span className="type-mono block">{attempt.servedModel ?? attempt.requestedModel}</span>
                  {attempt.servedModel && attempt.servedModel !== attempt.requestedModel ? (
                    <p className="type-caption mt-1 text-pen">Requested {attempt.requestedModel}</p>
                  ) : null}
                  {attempt.requestId ? (
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="type-mono text-ink-muted">{attempt.requestId}</span>
                      <Link to={receiptPath(attempt.requestId)} className="btn btn-outline btn-sm">
                        View Receipt
                      </Link>
                    </p>
                  ) : (
                    <p className="type-caption mt-2 text-ink-muted">No request id was returned.</p>
                  )}
                </td>
                <td className="align-top">
                  <span className="status-chip type-label">{attemptStatus(attempt)}</span>
                </td>
                <td className="type-mono align-top">{attempt.devshardId ?? '-'}</td>
                <td className="type-mono align-top">{seconds(attempt.latencyMs)}</td>
                <td className="align-top">
                  <span className="status-chip type-label">{RECEIPT_LABEL[attempt.receiptStatus]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
