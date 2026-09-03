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
  attemptsUsed: number
  attempts: Attempt[]
  dispositions: Disposition[]
}

export type VerdictCounts = Record<ItemVerdict, number>

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
  items: Item[]
}

export type HealthModel = {
  model: string
  successRate: number
  medianLatencyMs: number | null
  healthy: boolean
}

export type Health = { models: HealthModel[]; windowMinutes: number; mascotEnabled: boolean }

export type ApiError = { error: { code: string; message: string } }

// The gateway's receipt, verbatim. Snake case because these are GonkaRouter's own field names and
// the receipt page prints them beside the raw JSON a judge can open on api.gonkarouter.io; renaming
// them would put our spelling between the reader and the proof.
export type Receipt = {
  x_request_id: string
  x_devshard_id: string
  model: string
  created_at: string
  outcome: string
  status_code: number
  stream: boolean
  total_tokens: number
  ttft_ms: number
  duration_ms: number
}

// Gotcha 11: a receipt is written asynchronously, so "not there" is an ordinary answer rather than
// an error, and the page says which of the three happened in a sentence.
export type ReceiptLookup = {
  requestId: string
  status: 'found' | 'missing' | 'unreachable'
  receipt: Receipt | null
  sourceUrl: string
}
