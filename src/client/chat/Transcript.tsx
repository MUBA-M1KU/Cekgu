import type { ChatMessage } from '../../shared/chat'
import { SEAT_CAT, SEAT_LABEL } from '../../shared/chat'
import { CitationPills, type CiteAction, ProvenancePill } from './CitationPills'

/**
 * Who is speaking, named above the line rather than implied by which side of the modal it sits on.
 *
 * Both sides are left aligned. A transcript is a document, and DESIGN.md left aligns everything
 * inside one; the two voices are told apart by ground, face and speaker instead, which also keeps
 * the cat next to the seat that is talking rather than floating in a margin.
 */
function Speaker({ message }: { message: ChatMessage }) {
  if (message.role === 'user') return <p className="type-label text-ink-muted">You</p>

  // The cat is the SEAT, never a model family: which family filled the seat is on the pill below,
  // read from the citation. EvidencePanel.tsx states the rule.
  const seat = message.seat

  return (
    <p className="flex items-center gap-2">
      {seat === null ? null : (
        <img
          src={`/mascots/${SEAT_CAT[seat]}.png`}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 shrink-0 object-contain"
        />
      )}
      <span className="type-label text-ink-muted">{seat === null ? 'Cekgu' : SEAT_LABEL[seat]}</span>
    </p>
  )
}

function Turn({ message, onCite }: { message: ChatMessage; onCite: CiteAction }) {
  const isUser = message.role === 'user'

  return (
    <li className="min-w-0">
      <Speaker message={message} />

      {/* The question is recessed in the well and set in the interface face, because it is the
          reader's own input quoted back. The answer sits flat on the sheet in the paper face, the
          same face the readings themselves are set in. */}
      <div className={isUser ? 'mt-2 rounded-control bg-well px-3 py-2' : 'mt-2'}>
        <p className={`${isUser ? 'type-ui' : 'type-body'} whitespace-pre-wrap`}>{message.text}</p>
      </div>

      <CitationPills citations={message.citations} onCite={onCite} />
      {message.provenance ? <ProvenancePill provenance={message.provenance} /> : null}
    </li>
  )
}

/**
 * The message list. The server hands over prose with the citation tokens already stripped and the
 * citations already resolved, so nothing here parses: it renders what it was given.
 */
export function Transcript({ messages, onCite }: { messages: ChatMessage[]; onCite?: CiteAction }) {
  // The in-flight signal is ToolTrace, rendered by ChatModal after this list, because what is
  // happening while a turn runs is a list of lookups rather than one line of "thinking".
  return (
    <ol role="log" className="m-0 flex list-none flex-col gap-5 p-0">
      {messages.map((message) => (
        <Turn key={message.id} message={message} onCite={onCite} />
      ))}
    </ol>
  )
}
