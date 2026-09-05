import { Link } from 'react-router'
import { SEAT_LABEL } from '../../shared/chat'
import { receiptPath } from '../pages/ReceiptView'
import type { Utterance } from './speech'

// The caption is not a subtitle for the audio, it is the authoritative channel and the audio is the
// enhancement. A muted browser, a machine with no installed voices and a hall with no speakers all
// still show what the reader found and the request id it came from. DESIGN.md: the state text on
// screen is authoritative, and if the cats and the text ever disagree the text is right.
export function SpeechBubble({ utterance }: { utterance: Utterance }) {
  const cite = utterance.cite

  return (
    <div className="relative z-20 w-full rounded-control border border-rule bg-sheet p-3 shadow-[var(--shadow-soft)]">
      <p className="type-ui m-0">{utterance.caption}</p>

      {cite ? (
        <p className="type-caption mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
          <span>{SEAT_LABEL[utterance.seat]}</span>
          <span aria-hidden="true">·</span>
          <span className="type-mono">{cite.model}</span>
          {cite.requestId ? (
            <Link to={receiptPath(cite.requestId)} className="type-mono underline">
              {cite.requestId.slice(-6)}
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
