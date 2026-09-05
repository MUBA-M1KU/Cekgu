import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Attempt, Grounding, Item, ReceiptStatus, Source } from '../../shared/types'
import { useMuted } from '../mascot/preferences'
import { itemUtterances } from '../mascot/speech'
import { type SpeechHandle, speak } from '../mascot/voice'
import { receiptPath } from '../pages/ReceiptView'
import { BubbleRow } from './BubbleRow'
import { ExternalLink } from './ExternalLink'
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
      {/* Beside the served model rather than at the foot of the column. The receipt is what proves
          this name, so the claim and the proof are one line apart instead of a panel apart, and it
          is text because the model name it qualifies is text — a button here would outrank the
          reading it belongs to. */}
      {attempt.requestId ? (
        <Link to={receiptPath(attempt.requestId)} className="type-caption mt-1 inline-block underline">
          View Receipt
        </Link>
      ) : null}

      <div className="mt-3">
        <BubbleRow options={item.options} filled={reading.answer} label={`Answer chosen by ${attempt.servedModel}`} />
      </div>

      {reading.defensible.length > 1 ? (
        <p className="mt-2 type-caption text-ink-muted">
          Also considered defensible: {reading.defensible.filter((letter) => letter !== reading.answer).join(', ')}
        </p>
      ) : null}

      <p className="type-body mt-3 italic">{reading.reason}</p>

      {reading.grounding ? <GroundingLine grounding={reading.grounding} /> : null}

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
    </div>
  )
}

// What the retrieved pages did to this reader's own answer, in the reader's own words rather than
// as a chip: it is a sentence about evidence, and a chip beside the verdict chip would read as a
// second verdict. NFR-UX-3, never colour alone — the label carries the whole meaning.
const GROUNDING_LINE: Record<Grounding, string> = {
  supported: 'The pages retrieved for this question backed this answer.',
  contradicted: 'The pages retrieved for this question pointed somewhere else.',
  absent: 'The pages retrieved for this question did not settle it.'
}

function GroundingLine({ grounding }: { grounding: Grounding }) {
  return (
    <p className="mt-2 type-caption text-ink-muted" data-grounding={grounding}>
      {GROUNDING_LINE[grounding]}
    </p>
  )
}

/**
 * The pages both readers were shown, listed once under them rather than twice inside them.
 *
 * They are links because the claim is checkable or it is nothing: a judge who cannot open the page
 * has been told a story about evidence. Retrieved text is quoted, never paraphrased, so nothing on
 * this panel is a model's account of what a page said.
 */
function Sources({ sources, shownToReaders }: { sources: Source[]; shownToReaders: boolean }) {
  return (
    <div className="mt-6 border-t border-rule pt-4">
      <p className="type-label">Retrieved From The Web</p>
      {/* Two captions, because the difference between them is the whole claim. A record checked
          before retrieval existed can still show what the web says about its questions, but saying
          the readers weighed it would be a lie about a record whose entire value is that it is
          exactly what the pipeline produced. */}
      <p className="mt-1 type-caption text-ink-muted">
        {shownToReaders
          ? 'Fetched while the readers worked, and shown to both of them. No model wrote any of it, and no model outside the Gonka network read it.'
          : 'Fetched after these readings, so the readers did not see them and no verdict or score above rests on them. No model wrote any of it, and no model outside the Gonka network read it.'}
      </p>
      <ol className="mt-3 flex flex-col gap-3">
        {sources.map((source, index) => (
          <li key={source.url} className="flex gap-2">
            <span className="type-mono shrink-0 text-ink-muted">[{index + 1}]</span>
            <div className="min-w-0">
              <ExternalLink href={source.url} className="type-body break-words underline">
                {source.title}
              </ExternalLink>
              <p className="mt-1 type-caption text-ink-muted">{source.snippet}</p>
            </div>
          </li>
        ))}
      </ol>
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

  // Both readers were shown the same pages, so they are listed once under the pair rather than
  // twice inside it. Taken from whichever reader carries them, because a reading recorded before
  // live retrieval existed carries none.
  // Deduplicated on the way out as well as on the way in: a search can return the same page twice,
  // and rows written before tavily.ts deduplicated may already carry one.
  const retrieved = readers.find((attempt) => attempt.reading?.sources?.length)?.reading?.sources ?? []
  const sources = retrieved.filter(
    (source, index) => retrieved.findIndex((other) => other.url === source.url) === index
  )

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

      {sources.length ? (
        <Sources sources={sources} shownToReaders={readers.some((attempt) => attempt.reading?.grounding)} />
      ) : null}

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
