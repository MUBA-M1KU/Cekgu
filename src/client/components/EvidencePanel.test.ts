import { expect, test } from 'bun:test'
import type { Attempt } from '../../shared/types'
import { attemptStatus, shortReason } from './EvidencePanel'

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

// DESIGN.md Attempt rows names Hedged as its own status. The reading was admissible and arrived
// second; Rejected would tell a judge the gateway refused a call it did not refuse.
test('a reading that lost its hedge is hedged, not rejected or timed out', () => {
  const hedgeLost = attempt({
    servedModel: 'MiniMaxAI/MiniMax-M2.7',
    requestId: 'req-1788426475140384999-410759',
    httpStatus: 200,
    receiptStatus: 'verified',
    rejectionReason: 'A hedge of this call returned first, so this reading was recorded and not used.'
  })
  expect(attemptStatus(hedgeLost)).toBe('Hedged')
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

// Every string admitReading, callGonka and runRound can write. The table column holds one line, so
// the cap is the requirement, not a preference.
const EVERY_REASON = [
  'A hedge of this call returned first, so this reading was recorded and discarded.',
  'The gateway answered 429. {"error":{"message":"rate limit exceeded: too many concurrent requests"}}',
  'The gateway answered 503. upstream unavailable',
  'The gateway substituted a model: MiniMaxAI/MiniMax-M2.7',
  'The gateway returned a body that is not JSON.',
  'The call passed the 90 second evidence cutoff.',
  'The response carried no x-request-id, so it cannot be verified.',
  'The receipt for req-1788426475140384999-410759 could not be read. TimeoutError',
  'No receipt appeared for req-1788426475140384999-410759 within 5s.',
  'The receipt names moonshotai/Kimi-K2.6, but MiniMaxAI/MiniMax-M2.7 was requested.',
  'The receipt did not verify the serving model.',
  'The receipt named no serving model.',
  'The model did not return the requested JSON.',
  'The model answered E, which is not an option.',
  'The model called F defensible, which is not an option.'
]

test('no rejection reason reaches the attempts table longer than five words', () => {
  for (const reason of EVERY_REASON) {
    const short = shortReason(reason)
    expect(short).not.toBeNull()
    expect(short?.split(' ').length).toBeLessThanOrEqual(5)
  }
})

test('the reasons that carry a detail keep it', () => {
  expect(shortReason('The call passed the 90 second evidence cutoff.')).toBe('Passed the 90 second cutoff')
  expect(shortReason('The model answered E, which is not an option.')).toBe('Answered E, not an option')
  expect(shortReason('The gateway answered 503. upstream unavailable')).toBe('Gateway answered 503')
})

// A 429 and a 503 are both "the gateway answered", and the rate limit case is the one on screen in
// the demo. It has to be reached before the generic branch or the row says nothing useful.
test('a rate limit is named by its cause, not by its status code', () => {
  const rateLimited =
    'The gateway answered 429. {"error":{"message":"rate limit exceeded: too many concurrent requests","type":"upstream_error"}}'
  expect(shortReason(rateLimited)).toBe('Too many concurrent requests')
})

test('an unmapped reason is trimmed rather than left to break the column', () => {
  expect(shortReason(null)).toBeNull()
  expect(shortReason('Something nobody has written yet went wrong here.')).toBe(
    'Something nobody has written yet\u2026'
  )
  expect(shortReason('Four words exactly here')).toBe('Four words exactly here')
})
