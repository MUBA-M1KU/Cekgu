import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import type { ZodType } from 'zod'
import { createRecordResponseSchema, healthSchema, itemOutSchema, recordDetailSchema, recordListSchema } from './api'
import type { Attempt, Item, RecordDetail, RecordSummary } from './types'

// The TRD is canonical, so these assert the code against the document rather than against a
// copy of it. If chaosiris's handlers match the TRD they match these; if the TRD moves, this
// fails here rather than on a screen during the demo.
const trd = readFileSync(new URL('../../docs/TRD.md', import.meta.url), 'utf8')

function jsonBlocksIn(heading: string): unknown[] {
  const section = trd.slice(trd.indexOf(`### \`${heading}\``))
  const upTo = section.slice(0, section.indexOf('\n### ', 1) === -1 ? undefined : section.indexOf('\n### ', 1))
  return [...upTo.matchAll(/```json\n([\s\S]*?)```/g)].map((match) => JSON.parse(match[1] as string))
}

function accepts(schema: ZodType, value: unknown) {
  const result = schema.safeParse(value)
  if (!result.success) throw new Error(JSON.stringify(result.error.issues, null, 2))
  return result.data
}

describe('the TRD section 15 examples', () => {
  test('GET /api/records matches the list schema', () => {
    const [example] = jsonBlocksIn('GET /api/records')
    accepts(recordListSchema, example)
  })

  test('GET /api/records/:id matches the detail schema', () => {
    const [example] = jsonBlocksIn('GET /api/records/:id')
    const record = accepts(recordDetailSchema, example) as RecordDetail
    expect(record.items.length).toBeGreaterThan(0)
    expect(record.items[0]?.attempts.length).toBeGreaterThan(0)
  })

  test('GET /api/health matches the health schema', () => {
    const [example] = jsonBlocksIn('GET /api/health')
    accepts(healthSchema, example)
  })
})

describe('the closed value sets', () => {
  test('every verdict the rule can return is a verdict the API may carry', () => {
    for (const verdict of ['clear', 'possible_key_error', 'possible_ambiguity', 'split_opinion', 'unverified']) {
      expect(itemOutSchema.shape.verdict.safeParse(verdict).success).toBe(true)
    }
    expect(itemOutSchema.shape.verdict.safeParse('pending').success).toBe(true)
    expect(itemOutSchema.shape.verdict.safeParse('probably_fine').success).toBe(false)
  })

  test('an attempt may report no request id, because a timed-out call returns no headers', () => {
    const [example] = jsonBlocksIn('GET /api/records/:id')
    const record = example as RecordDetail
    const attempt = record.items[0]?.attempts[0] as Attempt
    const timedOut = { ...attempt, requestId: null, servedModel: null, httpStatus: null, reading: null }
    expect(itemOutSchema.shape.attempts.element.safeParse(timedOut).success).toBe(true)
  })
})

describe('the create response', () => {
  test('carries the status the record starts in', () => {
    const created = accepts(createRecordResponseSchema, {
      id: 'b0a7c6d2-0000-4000-8000-000000000000',
      status: 'queued',
      itemCount: 1,
      expiresAt: null
    })
    expect(created).toMatchObject({ status: 'queued' })
  })
})

describe('the client types and the schemas agree', () => {
  test('a parsed list is assignable to RecordSummary[]', () => {
    const [example] = jsonBlocksIn('GET /api/records')
    const parsed = accepts(recordListSchema, example) as { records: RecordSummary[] }
    const first = parsed.records[0] as RecordSummary
    expect(typeof first.attentionCount).toBe('number')
  })

  test('a parsed detail is assignable to Item[]', () => {
    const [example] = jsonBlocksIn('GET /api/records/:id')
    const parsed = accepts(recordDetailSchema, example) as RecordDetail
    const items: Item[] = parsed.items
    expect(items[0]?.options[0]?.letter).toBeDefined()
  })
})
