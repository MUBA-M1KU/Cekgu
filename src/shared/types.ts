export type RecordStatus = 'queued' | 'checking' | 'ready' | 'in_review' | 'resolved'
export type ItemStatus = 'queued' | 'running' | 'done'
export type Verdict = 'clear' | 'possible_key_error' | 'possible_ambiguity' | 'split_opinion' | 'unverified'
export type ItemVerdict = Verdict | 'pending'
export type ReceiptStatus = 'pending' | 'verified' | 'mismatch' | 'missing'
export type DispositionKind =
  | 'key_corrected'
  | 'wording_revised'
  | 'key_confirmed'
  | 'flag_dismissed'
  | 'retry_requested'

export type Option = { letter: string; text: string }

/** One page the readers were shown. Retrieved text, never a model's words. */
export type Source = { title: string; url: string; snippet: string }

/**
 * What the retrieved evidence did to this reading's own answer, as the Gonka reader reports it.
 *
 * `absent` is the honest default and covers both "we retrieved nothing" and "what we retrieved did
 * not speak to this question". Most exam items have no page on the web that settles them, and
 * treating silence as doubt would flag the entire syllabus.
 */
export type Grounding = 'supported' | 'contradicted' | 'absent'

export type Reading = {
  model: string
  answer: string
  defensible: string[]
  reason: string
  /** Absent on readings taken before live retrieval existed, and on any round that retrieved nothing. */
  grounding?: Grounding
  sources?: Source[]
}

export type Attempt = {
  id: string
  requestedModel: string
  servedModel: string | null
  requestId: string | null
  devshardId: string | null
  fallbackHeader: string | null
  httpStatus: number | null
  receiptStatus: ReceiptStatus
  reading: Reading | null
  latencyMs: number | null
  startedAt: string
  finishedAt: string | null
  admitted: boolean
  rejectionReason: string | null
}

export type Disposition = {
  id: string
  kind: DispositionKind
  revisedKey: string | null
  revisedText: string | null
  note: string | null
  createdAt: string
}

export type Item = {
  id: string
  position: number
  stem: string
  options: Option[]
  key: string
  status: ItemStatus
  verdict: ItemVerdict
  verdictReason: string | null
  /** 0 to 100, or null when the verdict is Unverified. See truth-score.ts. */
  truthScore: number | null
  attemptsUsed: number
  attempts: Attempt[]
  dispositions: Disposition[]
}

export type VerdictCounts = Record<ItemVerdict, number>

/** A record's Truth Score beside the item counts it was drawn from. See truth-score.ts. */
export type RecordScore = { score: number | null; scored: number; total: number }

/** What live retrieval found across a record, counted per item. See truth-score.ts. */
export type Corroboration = {
  supported: number
  contradicted: number
  absent: number
  retrieved: number
  /** Items carrying pages but no grounding: retrieved after the readings, so the readers never saw them. */
  sourcesOnly: number
}

export type RecordSummary = {
  id: string
  title: string
  subject: string
  status: RecordStatus
  itemCount: number
  attentionCount: number
  isSample: boolean
  expiresAt: string | null
  updatedAt: string
}

export type RecordDetail = {
  id: string
  title: string
  subject: string
  language: string
  context: string | null
  status: RecordStatus
  isSample: boolean
  expiresAt: string | null
  counts: VerdictCounts
  /** The mean of the items that have a score, with how many of them there were. */
  truthScore: RecordScore
  /** Zero `retrieved` means live retrieval never ran on this record, which is a different fact from finding nothing. */
  corroboration: Corroboration
  items: Item[]
}

export type HealthModel = {
  model: string
  successRate: number
  medianLatencyMs: number | null
  healthy: boolean
}

export type Health = { models: HealthModel[]; windowMinutes: number; mascotEnabled: boolean }

/** One family's share of the work, keyed on the served model the receipt names. */
export type ReaderShare = { model: string; readings: number; verified: number }

/** Account-wide aggregates for the dashboard. Every figure is a count of rows this account owns. */
export type AccountStats = {
  records: number
  items: number
  counts: VerdictCounts
  readings: number
  verifiedReadings: number
  families: ReaderShare[]
}

/** The gateway's public receipt body, as `GET /v1/receipts/{id}` returns it. */
export type Receipt = {
  x_request_id: string
  x_devshard_id: string | null
  model: string
  created_at: string
  outcome: string
  status_code: number
  stream: boolean
  total_tokens: number | null
  ttft_ms: number | null
  duration_ms: number | null
}

/**
 * What our own read-through found. `not_found` and `unreachable` are different facts and the
 * viewer says which: a receipt that was never written is the gateway answering, a gateway we could
 * not reach is not an answer at all.
 */
export type ReceiptLookup = {
  requestId: string
  status: 'found' | 'not_found' | 'unreachable' | 'invalid'
  receipt: Receipt | null
}

export type ApiError = { error: { code: string; message: string } }
