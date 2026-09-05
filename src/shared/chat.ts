import type { Item, RecordDetail } from './types'

/** Which cat. Tororo is Reader A, Hijiki is Reader B, and a seat is never a model family. */
export type Seat = 0 | 1

export const SEAT_LABEL: Record<Seat, string> = { 0: 'Reader A', 1: 'Reader B' }
export const SEAT_CAT: Record<Seat, string> = { 0: 'tororo', 1: 'hijiki' }

export type Citation =
  | { kind: 'item'; position: number }
  | { kind: 'reading'; position: number; seat: Seat; model: string; requestId: string | null }
  | { kind: 'receipt'; requestId: string; model: string | null }

/**
 * Named apart from Gonka provenance on purpose, exactly as TranscriptionProvenance is in
 * src/server/transcribe/gemini.ts: a Gemini response id is not a Gonka request id and must never be
 * rendered as one. Every fact the agent cites still carries a Gonka id, because the readings are
 * Gonka's; this field describes only the layer that phrased them.
 */
export type ChatProvenance = { provider: 'gemini' | 'gonka'; responseId: string | null; model: string | null }

export type ChatMessage = {
  id: string
  role: 'user' | 'agent'
  /** The seat speaking, or null when the line is Cekgu's own rather than a quoted reading. */
  seat: Seat | null
  text: string
  citations: Citation[]
  provenance: ChatProvenance | null
}

export type ChatRequest = { question: string; history: ChatMessage[] }
export type ChatResponse = { messages: ChatMessage[] }

/**
 * The two reader seats for one item, chosen the way EvidencePanel chooses its columns: by served
 * model, so a seat is never filled twice by the same family. Shared because the evidence panel, the
 * spoken lines and the agent's tools must all agree on who Reader A is for a given item.
 */
export function seatedAttempts(item: Item) {
  const seated: Item['attempts'] = []
  for (const attempt of item.attempts) {
    if (!attempt.admitted || !attempt.reading) continue
    if (seated.some((chosen) => chosen.servedModel === attempt.servedModel)) continue
    seated.push(attempt)
    if (seated.length === 2) break
  }
  return seated
}

/** Flagged and still undecided, which is the number the record rail prints. */
export function attentionItems(record: RecordDetail): Item[] {
  return record.items.filter(
    (item) => item.verdict !== 'clear' && item.verdict !== 'pending' && item.dispositions.length === 0
  )
}
