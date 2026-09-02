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
