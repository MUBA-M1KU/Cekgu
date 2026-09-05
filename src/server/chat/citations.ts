import type { ChatMessage, ChatProvenance, Citation, Seat } from '../../shared/chat'
import { seatedAttempts } from '../../shared/chat'
import type { RecordDetail } from '../../shared/types'

// The model cites by writing tokens inline; this file turns them into links and takes them back out
// of the prose. Resolution happens here rather than on the client because a token names a seat and a
// position, and only the record knows which family filled that seat and what request id it carried.
//
// A token that resolves to nothing is dropped rather than rendered. An invented request id must not
// become a pill a judge can click, so the record is the authority on every citation, never the model.

const ITEM = /\[item:(\d+)\]/g
const READING = /\[reading:(\d+):([AB])\]/g
const RECEIPT = /\[receipt:([^\]\s]+)\]/g

function itemAt(record: RecordDetail, position: number) {
  return record.items.find((item) => item.position === position) ?? null
}

function readingCitation(record: RecordDetail, position: number, seat: Seat): Citation | null {
  const item = itemAt(record, position)
  if (!item) return null

  const attempt = seatedAttempts(item)[seat]
  if (!attempt) return null

  return { kind: 'reading', position, seat, model: attempt.servedModel ?? 'unknown', requestId: attempt.requestId }
}

function receiptCitation(record: RecordDetail, requestId: string): Citation | null {
  for (const item of record.items) {
    const attempt = item.attempts.find((candidate) => candidate.requestId === requestId)
    if (attempt) return { kind: 'receipt', requestId, model: attempt.servedModel }
  }
  return null
}

function key(citation: Citation): string {
  if (citation.kind === 'item') return `item:${citation.position}`
  if (citation.kind === 'reading') return `reading:${citation.position}:${citation.seat}`
  return `receipt:${citation.requestId}`
}

// A model that names "question 9" in prose and forgets the token leaves a sentence about this
// record with nothing under it, which reads as ungrounded when it is not. Measured on production:
// MiniMax answered correctly, named items 3, 9 and 11, and emitted no tokens at all.
//
// Recovering the citation from the prose is safe in a way inventing one would not be, because the
// position still has to resolve against the loaded record before it becomes a pill. What this
// cannot do is manufacture a reading or a receipt: only item pills are recovered, and a claim about
// what a reader said still needs the model to have cited the reader.
const NAMED_ITEM = /\b(?:question|item)s?\s+(\d+)(?:\s*(?:,|and)\s*(\d+))*/gi
const NUMBER = /\d+/g

/** The citations one paragraph carries, resolved against the record and de-duplicated in order. */
export function citationsIn(paragraph: string, record: RecordDetail): Citation[] {
  const found: Citation[] = []

  for (const match of paragraph.matchAll(ITEM)) {
    const position = Number(match[1])
    if (itemAt(record, position)) found.push({ kind: 'item', position })
  }

  for (const match of paragraph.matchAll(NAMED_ITEM)) {
    for (const digits of match[0].match(NUMBER) ?? []) {
      const position = Number(digits)
      if (itemAt(record, position)) found.push({ kind: 'item', position })
    }
  }

  for (const match of paragraph.matchAll(READING)) {
    const citation = readingCitation(record, Number(match[1]), match[2] === 'A' ? 0 : 1)
    if (citation) found.push(citation)
  }

  for (const match of paragraph.matchAll(RECEIPT)) {
    const citation = receiptCitation(record, match[1] ?? '')
    if (citation) found.push(citation)
  }

  return [...new Map(found.map((citation) => [key(citation), citation])).values()]
}

export function stripTokens(text: string): string {
  return text
    .replace(ITEM, '')
    .replace(READING, '')
    .replace(RECEIPT, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim()
}

// A paragraph quoting one seat is spoken in that seat's voice, so a paragraph citing both seats
// belongs to neither and stays Cekgu's own. That is also the honest reading: a sentence comparing
// two readers is not either reader speaking.
function seatOf(citations: Citation[]): Seat | null {
  const seats = new Set(citations.filter((citation) => citation.kind === 'reading').map((citation) => citation.seat))
  if (seats.size !== 1) return null
  return seats.has(0) ? 0 : 1
}

/**
 * One agent turn into the messages the transcript renders. Paragraphs become separate messages so
 * each can carry its own speaker, and only the last one carries the provenance of the call: a single
 * inference produced all of them, and printing its id four times would overstate what happened.
 */
export function toMessages(text: string, record: RecordDetail, provenance: ChatProvenance): ChatMessage[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

  const source = paragraphs.length > 0 ? paragraphs : [text.trim()]

  return source.map((paragraph, index) => {
    const citations = citationsIn(paragraph, record)
    return {
      id: crypto.randomUUID(),
      role: 'agent' as const,
      seat: seatOf(citations),
      text: stripTokens(paragraph),
      citations,
      provenance: index === source.length - 1 ? provenance : null
    }
  })
}
