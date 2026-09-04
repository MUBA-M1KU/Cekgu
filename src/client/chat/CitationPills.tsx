import { Link } from 'react-router'
import type { ChatProvenance, Citation } from '../../shared/chat'
import { SEAT_LABEL } from '../../shared/chat'
import { receiptPath } from '../pages/ReceiptView'

/** Wired by the record page: an item pill jumps to its item, a reading pill opens its evidence. */
export type CiteAction = ((citation: Citation) => void) | undefined

/** Head and tail, so a pill stays a pill. The whole id is on the receipt page it opens. */
function shortId(requestId: string): string {
  return requestId.length > 18 ? `${requestId.slice(0, 8)}…${requestId.slice(-6)}` : requestId
}

/** `MiniMaxAI/MiniMax-M2.7` reads as `MiniMax-M2.7` on a pill; the vendor is kept in the title. */
function shortModel(model: string): string {
  return model.slice(model.lastIndexOf('/') + 1)
}

function citationKey(citation: Citation): string {
  if (citation.kind === 'item') return `item:${citation.position}`
  if (citation.kind === 'reading') return `reading:${citation.position}:${citation.seat}`
  return `receipt:${citation.requestId}`
}

// Ink on --well at pill radius, the status-chip formula: a citation is a fact about where a
// sentence came from, not a judgment about it, so it carries no colour. The transparent border is
// what lets the one pill that is NOT a Gonka fact swap in a dashed edge without changing size.
const PILL = 'status-chip type-label border border-transparent'

// The whole affordance an actionable pill gets: its transparent edge takes the rule colour, the
// same move a verdict chip makes when it is the active filter.
const ACTION = `${PILL} transition-colors hover:border-rule-strong`

function ItemPill({ citation, onCite }: { citation: Extract<Citation, { kind: 'item' }>; onCite: CiteAction }) {
  const label = `Item ${citation.position}`
  if (!onCite) return <span className={PILL}>{label}</span>

  return (
    <button
      type="button"
      className={ACTION}
      title={`Go to item ${citation.position} in this record.`}
      onClick={() => onCite(citation)}
    >
      {label}
    </button>
  )
}

function ReadingPill({ citation, onCite }: { citation: Extract<Citation, { kind: 'reading' }>; onCite: CiteAction }) {
  const model = citation.model.length > 0 ? shortModel(citation.model) : null
  const body = (
    <>
      {SEAT_LABEL[citation.seat]}
      {model ? (
        <>
          <span aria-hidden="true" className="text-ink-muted">
            ·
          </span>
          <span className="type-mono">{model}</span>
        </>
      ) : null}
    </>
  )

  if (!onCite) {
    return (
      <span className={PILL} title={citation.model.length > 0 ? citation.model : undefined}>
        {body}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={ACTION}
      title={`Open the evidence for item ${citation.position}${citation.model.length > 0 ? `, read by ${citation.model}` : ''}.`}
      onClick={() => onCite(citation)}
    >
      {body}
    </button>
  )
}

// The pill that leaves the product, because it is the one with something to check behind it: the
// public receipt for that request id. It is a Link whether or not onCite is wired.
function ReceiptPill({ requestId, model }: { requestId: string; model?: string | null }) {
  return (
    <Link
      to={receiptPath(requestId)}
      className={`${ACTION} type-mono`}
      title={model ? `Gonka receipt for ${requestId}, served by ${model}.` : `Gonka receipt for ${requestId}.`}
    >
      <span className="sr-only">Receipt </span>
      {shortId(requestId)}
    </Link>
  )
}

/**
 * The pills under a bubble. One per resolved citation, in the order the server resolved them.
 *
 * A sentence with no pill beneath it is visibly ungrounded, which is the point: the row is never
 * padded out, and an agent turn that cites nothing shows nothing.
 */
export function CitationPills({ citations, onCite }: { citations: Citation[]; onCite?: CiteAction }) {
  if (citations.length === 0) return null

  return (
    <ul className="m-0 mt-2 flex list-none flex-wrap items-center gap-2 p-0">
      {citations.map((citation) => (
        <li key={citationKey(citation)}>
          {citation.kind === 'item' ? <ItemPill citation={citation} onCite={onCite} /> : null}
          {citation.kind === 'reading' ? <ReadingPill citation={citation} onCite={onCite} /> : null}
          {citation.kind === 'receipt' ? <ReceiptPill requestId={citation.requestId} model={citation.model} /> : null}
        </li>
      ))}
    </ul>
  )
}

/**
 * Who phrased the sentence, which is a different fact from where its content came from.
 *
 * Under `CHAT_PROVIDER=gonka` the id is a real request id with a public receipt, so it is the same
 * pill every cited reading gets. Under `gemini` it is not one, and it must never look like one:
 * no fill, a dashed edge, no link to follow, and the provider named before the id. That is the
 * precedent src/server/transcribe/gemini.ts set, and it is load-bearing rather than decorative,
 * because the whole surface's claim is that a cited fact carries a receipt and this does not.
 */
export function ProvenancePill({ provenance }: { provenance: ChatProvenance }) {
  const { provider, responseId, model } = provenance
  if (responseId === null) return null

  if (provider === 'gonka') {
    return (
      <p className="mt-2 flex flex-wrap items-center gap-2">
        <ReceiptPill requestId={responseId} model={model} />
      </p>
    )
  }

  return (
    <p className="mt-2">
      <span
        className="inline-flex items-center gap-2 rounded-bubble border border-dashed border-rule-strong px-3 py-1 text-ink-muted"
        title={model ? `${model} response id. It is not a Gonka request id and has no receipt.` : undefined}
      >
        <span className="type-label">Gemini</span>
        <span aria-hidden="true">·</span>
        <span className="type-mono">{shortId(responseId)}</span>
        <span className="sr-only">
          {model ? `${model} response id.` : 'Gemini response id.'} It is not a Gonka request id and has no receipt.
        </span>
      </span>
    </p>
  )
}
