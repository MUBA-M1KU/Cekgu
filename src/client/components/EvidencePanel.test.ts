import { expect, test } from 'bun:test'
import type { Attempt } from '../../shared/types'
import { attemptStatus } from './EvidencePanel'

const attempt = (over: Partial<Attempt>): Attempt => ({
  id: 'a',
  requestedModel: 'MiniMaxAI/MiniMax-M2.7',
  servedModel: null,
  requestId: null,
  devshardId: null,
  fallbackHeader: null,
  httpStatus: null,
  receiptStatus: 'missing',
  reading: null,
  latencyMs: null,
  startedAt: '2026-09-03T09:00:00.000Z',
  finishedAt: '2026-09-03T09:00:01.000Z',
  admitted: false,
  rejectionReason: null,
  ...over
})

test('a rate-limited attempt is named, not reported as a timeout', () => {
  // The 429 carries no x-request-id, so it satisfies the missing-id test as well. Question 1 of
  // the sample record holds two of these beside a real cutoff, and the demo opens that table.
  const rateLimited = attempt({
    httpStatus: 429,
    latencyMs: 766,
    rejectionReason:
      'The gateway answered 429. {"error":{"message":"rate limit exceeded: too many concurrent requests"}}'
  })
  expect(attemptStatus(rateLimited)).toBe('Rate Limited')
})

test('a call past the evidence cutoff is still a timeout', () => {
  const timedOut = attempt({
    httpStatus: null,
    latencyMs: 90001,
    rejectionReason: 'The call passed the 90 second evidence cutoff.'
  })
  expect(attemptStatus(timedOut)).toBe('Timed Out')
})

test('a reading that lost its hedge is rejected, not timed out', () => {
  const hedgeLost = attempt({
    servedModel: 'MiniMaxAI/MiniMax-M2.7',
    requestId: 'req-1788426475140384999-410759',
    httpStatus: 200,
    receiptStatus: 'verified',
    rejectionReason: 'A hedge of this call returned first, so this reading was recorded and not used.'
  })
  expect(attemptStatus(hedgeLost)).toBe('Rejected')
})

test('an admitted reading is admitted whatever else it carries', () => {
  const admitted = attempt({
    servedModel: 'moonshotai/Kimi-K2.6',
    requestId: 'req-1788426429986649454-410589',
    httpStatus: 200,
    receiptStatus: 'verified',
    admitted: true
  })
  expect(attemptStatus(admitted)).toBe('Admitted')
})
