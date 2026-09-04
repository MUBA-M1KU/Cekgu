import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Attempt, Item, ReceiptStatus } from '../../shared/types'
import { useMuted } from '../mascot/preferences'
import { itemUtterances } from '../mascot/speech'
import { type SpeechHandle, speak } from '../mascot/voice'
import { receiptPath } from '../pages/ReceiptView'
import { BubbleRow } from './BubbleRow'
import { VoiceOnIcon } from './icons'

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

      {attempt.requestId ? (
        <Link to={receiptPath(attempt.requestId)} className="type-label mt-3 inline-block underline">
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

  const unadmitted = item.attempts.filter((attempt) => !readers.includes(attempt))

  // Distinct status-and-reason pairs, in the order the attempts happened. A Map keyed on the pair
  // keeps the first occurrence and drops every repeat.
  const reasons = [
    ...new Map(
      unadmitted
        .filter((attempt) => attempt.rejectionReason !== null)
        .map((attempt) => [
          `${attemptStatus(attempt)}:${attempt.rejectionReason}`,
          [attemptStatus(attempt), attempt.rejectionReason as string] as const
        ])
    ).values()
  ]

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

      <h3 className="type-eyebrow mt-6 text-ink-muted">All Attempts</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="type-label border-b border-rule">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Requested Model</th>
              <th className="py-2 pr-4 font-medium">Served Model</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Request Id</th>
              <th className="py-2 pr-4 font-medium">Shard</th>
              <th className="py-2 pr-4 font-medium">Latency</th>
              <th className="py-2 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {item.attempts.map((attempt, index) => (
              <tr key={attempt.id} className="border-b border-rule align-top">
                <td className="type-mono py-2 pr-4">{index + 1}</td>
                <td className="type-mono py-2 pr-4 whitespace-nowrap">{attempt.requestedModel}</td>
                <td className="type-mono py-2 pr-4 whitespace-nowrap">{attempt.servedModel ?? '-'}</td>
                <td className="py-2 pr-4">
                  <span className="status-chip type-label">{attemptStatus(attempt)}</span>
                </td>
                <td className="type-mono py-2 pr-4 whitespace-nowrap">
                  {attempt.requestId ? (
                    <>
                      {attempt.requestId}{' '}
                      <Link to={receiptPath(attempt.requestId)} className="type-label underline">
                        View Receipt
                      </Link>
                    </>
                  ) : (
                    <span className="type-caption text-ink-muted">No request id was returned.</span>
                  )}
                </td>
                <td className="type-mono py-2 pr-4">{attempt.devshardId ?? '-'}</td>
                <td className="type-mono py-2 pr-4">{seconds(attempt.latencyMs)}</td>
                <td className="py-2">
                  <span className="status-chip type-label">{RECEIPT_LABEL[attempt.receiptStatus]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unadmitted.length > 0 ? (
        <div className="mt-4 border-t border-rule pt-3">
          <p className="type-caption max-w-[76ch] text-ink-muted">
            Every attempt is listed, admitted or not, because the ones that failed are part of the record. A reading
            enters the verdict only when its receipt names the model that was requested.
          </p>
          {/* One line per reason rather than a paragraph under every Status chip. The reasons
              repeat across rows far more often than they differ, so the table was printing the
              same sentence three times and pushing the request ids off the screen to do it. */}
          {reasons.length > 0 ? (
            <dl className="mt-3 m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {reasons.map(([status, reason]) => (
                <div key={`${status}:${reason}`} className="contents">
                  <dt className="type-label whitespace-nowrap">{status}</dt>
                  <dd className="type-caption m-0 max-w-[70ch] text-ink-muted">{reason}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
