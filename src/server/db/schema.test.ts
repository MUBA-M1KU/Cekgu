import { describe, expect, test } from 'bun:test'
import { getTableColumns } from 'drizzle-orm'
import {
  dispositionKindSchema,
  itemStatusSchema,
  receiptStatusSchema,
  recordStatusSchema,
  verdictSchema
} from '../../shared/api'
import {
  attempts,
  dispositionKind,
  dispositions,
  itemStatus,
  items,
  modelHealth,
  receiptStatus,
  recordStatus,
  records,
  verdict
} from './schema'

// A database enum and the zod schema the API answers with are two statements of one closed set.
// If they drift, a row Postgres accepts becomes a response the client refuses to render.
describe('database enums match the API closed sets', () => {
  const pairs = [
    ['record_status', recordStatus.enumValues, recordStatusSchema.options],
    ['item_status', itemStatus.enumValues, itemStatusSchema.options],
    ['verdict', verdict.enumValues, verdictSchema.options],
    ['receipt_status', receiptStatus.enumValues, receiptStatusSchema.options],
    ['disposition_kind', dispositionKind.enumValues, dispositionKindSchema.options]
  ] as const

  for (const [name, columnValues, apiValues] of pairs) {
    test(name, () => {
      expect([...columnValues].sort()).toEqual([...apiValues].sort())
    })
  }
})

// NFR-SEC-3: Cekgu reviews the paper, never the cohort. No column may hold a learner's
// answer, mark, name or identifier, so the guard is on column names rather than on intent.
test('no table has a column that could hold learner data', () => {
  const forbidden = /student|learner|pupil|candidate|respondent|score|mark|grade|answer_sheet|response/i
  const tables = { records, items, attempts, dispositions, modelHealth }

  const offenders = Object.entries(tables).flatMap(([table, definition]) =>
    Object.values(getTableColumns(definition))
      .map((column) => `${table}.${column.name}`)
      .filter((qualified) => forbidden.test(qualified))
  )

  expect(offenders).toEqual([])
})
