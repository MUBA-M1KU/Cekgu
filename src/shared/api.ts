import { z } from 'zod'

// The response shapes from TRD section 15, as schemas both halves can use: the client to know
// what it may render, the server to check a handler before it ships. Ids and timestamps are
// plain strings rather than uuid and datetime, because the point here is shape and the closed
// value sets, and because the TRD's own examples use placeholders like "<uuid>" and "…".

export const recordStatusSchema = z.enum(['queued', 'checking', 'ready', 'in_review', 'resolved'])
export const itemStatusSchema = z.enum(['queued', 'running', 'done'])
export const verdictSchema = z.enum([
  'clear',
  'possible_key_error',
  'possible_ambiguity',
  'split_opinion',
  'unverified',
  'pending'
])
export const receiptStatusSchema = z.enum(['pending', 'verified', 'mismatch', 'missing'])
export const dispositionKindSchema = z.enum([
  'key_corrected',
  'wording_revised',
  'key_confirmed',
  'flag_dismissed',
  'retry_requested'
])

export const optionOutSchema = z.object({ letter: z.string(), text: z.string() })

export const readingSchema = z.object({
  answer: z.string(),
  defensible: z.array(z.string()),
  reason: z.string()
})

export const attemptSchema = z.object({
  id: z.string(),
  requestedModel: z.string(),
  servedModel: z.string().nullable(),
  requestId: z.string().nullable(),
  devshardId: z.string().nullable(),
  fallbackHeader: z.string().nullable(),
  httpStatus: z.number().nullable(),
  receiptStatus: receiptStatusSchema,
  reading: readingSchema.nullable(),
  latencyMs: z.number().nullable(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  admitted: z.boolean(),
  rejectionReason: z.string().nullable()
})

export const dispositionSchema = z.object({
  id: z.string(),
  kind: dispositionKindSchema,
  revisedKey: z.string().nullable(),
  revisedText: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string()
})

export const itemOutSchema = z.object({
  id: z.string(),
  position: z.number(),
  stem: z.string(),
  options: z.array(optionOutSchema),
  key: z.string(),
  status: itemStatusSchema,
  verdict: verdictSchema,
  verdictReason: z.string().nullable(),
  attemptsUsed: z.number(),
  attempts: z.array(attemptSchema),
  dispositions: z.array(dispositionSchema)
})

export const verdictCountsSchema = z.object({
  clear: z.number(),
  possible_key_error: z.number(),
  possible_ambiguity: z.number(),
  split_opinion: z.number(),
  unverified: z.number(),
  pending: z.number()
})

export const recordSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  status: recordStatusSchema,
  itemCount: z.number(),
  attentionCount: z.number(),
  isSample: z.boolean(),
  expiresAt: z.string().nullable(),
  updatedAt: z.string()
})

export const recordListSchema = z.object({ records: z.array(recordSummarySchema) })

export const recordDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  language: z.string(),
  context: z.string().nullable(),
  status: recordStatusSchema,
  isSample: z.boolean(),
  expiresAt: z.string().nullable(),
  counts: verdictCountsSchema,
  items: z.array(itemOutSchema)
})

export const createRecordResponseSchema = z.object({
  id: z.string(),
  status: recordStatusSchema,
  itemCount: z.number(),
  expiresAt: z.string().nullable()
})

export const deleteRecordsResponseSchema = z.object({
  deleted: z.array(z.string()),
  skipped: z.array(z.object({ id: z.string(), reason: z.string() })),
  mode: z.enum(['trash', 'immediate'])
})

export const healthSchema = z.object({
  models: z.array(
    z.object({
      model: z.string(),
      successRate: z.number(),
      medianLatencyMs: z.number().nullable(),
      healthy: z.boolean()
    })
  ),
  windowMinutes: z.number(),
  mascotEnabled: z.boolean()
})

export const apiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) })
