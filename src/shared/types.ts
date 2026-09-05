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

export type Reading = { model: string; answer: string; defensible: string[]; reason: string }

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
