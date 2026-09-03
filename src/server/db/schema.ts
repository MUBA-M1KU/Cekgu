import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { Option, Reading } from '../../shared/types'
import { user } from './auth-schema'

export const recordStatus = pgEnum('record_status', ['queued', 'checking', 'ready', 'in_review', 'resolved'])
export const itemStatus = pgEnum('item_status', ['queued', 'running', 'done'])
export const verdict = pgEnum('verdict', [
  'clear',
  'possible_key_error',
  'possible_ambiguity',
  'split_opinion',
  'unverified',
  'pending'
])
export const receiptStatus = pgEnum('receipt_status', ['pending', 'verified', 'mismatch', 'missing'])
export const dispositionKind = pgEnum('disposition_kind', [
  'key_corrected',
  'wording_revised',
  'key_confirmed',
  'flag_dismissed',
  'retry_requested'
])

export const records = pgTable(
  'records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    language: text('language').notNull(),
    context: text('context'),
    status: recordStatus('status').notNull().default('queued'),
    isSample: boolean('is_sample').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('records_user_id_deleted_at_idx').on(table.userId, table.deletedAt)]
)

export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recordId: uuid('record_id')
      .notNull()
      .references(() => records.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    stem: text('stem').notNull(),
    options: jsonb('options').$type<Option[]>().notNull(),
    key: text('key').notNull(),
    verdict: verdict('verdict').notNull().default('pending'),
    verdictReason: text('verdict_reason'),
    status: itemStatus('status').notNull().default('queued'),
    attemptsUsed: integer('attempts_used').notNull().default(0)
  },
  (table) => [index('items_record_id_status_idx').on(table.recordId, table.status)]
)

export const attempts = pgTable(
  'attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    requestedModel: text('requested_model').notNull(),
    servedModel: text('served_model'),
    requestId: text('request_id'),
    devshardId: text('devshard_id'),
    fallbackHeader: text('fallback_header'),
    httpStatus: integer('http_status'),
    receiptStatus: receiptStatus('receipt_status').notNull().default('pending'),
    receiptJson: jsonb('receipt_json'),
    readingJson: jsonb('reading_json').$type<Reading>(),
    latencyMs: integer('latency_ms'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    admitted: boolean('admitted').notNull().default(false),
    rejectionReason: text('rejection_reason')
  },
  (table) => [index('attempts_item_id_started_at_idx').on(table.itemId, table.startedAt)]
)

export const dispositions = pgTable(
  'dispositions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    kind: dispositionKind('kind').notNull(),
    revisedKey: text('revised_key'),
    revisedText: text('revised_text'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('dispositions_item_id_created_at_idx').on(table.itemId, table.createdAt)]
)

export const modelHealth = pgTable('model_health', {
  model: text('model').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  successes: integer('successes').notNull().default(0),
  failures: integer('failures').notNull().default(0),
  medianLatencyMs: integer('median_latency_ms'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})
