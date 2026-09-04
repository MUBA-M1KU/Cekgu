import { describe, expect, test } from 'bun:test'
import { mockRecord, mockStats } from './mock-record'

const pass = await Bun.file('./src/server/fixtures/benchmark-pass.json').json()

const captured = new Map<string, string>()
for (const item of pass.items) {
  for (const attempt of item.attempts) {
    if (attempt.requestId && attempt.servedModel) captured.set(attempt.requestId, attempt.servedModel)
  }
}

const attempts = mockRecord('sample').items.flatMap((item) => item.attempts)

describe('the mock request ids', () => {
  // The whole claim of this product is that a person can take a request id off the screen and check
  // it against the gateway themselves. These ids were generated from a counter until 4 September,
  // so every receipt link in a mock build landed on {"error":{"code":"not_found"}} — on the one
  // screen whose entire purpose is that proof. A generated id is not a shortcut here, it is the
  // defect.
  test('are all ids the real benchmark pass captured', () => {
    const invented = attempts
      .map((attempt) => attempt.requestId)
      .filter((id): id is string => id !== null)
      .filter((id) => !captured.has(id))

    expect(invented).toEqual([])
  })

  // A receipt names the model that served the call. If the mock hands an attempt an id captured
  // against a different family, the viewer shows a mismatch that never happened.
  test('are paired with the model the receipt actually names', () => {
    const wrong = attempts
      .filter((attempt) => attempt.requestId !== null)
      .filter((attempt) => captured.get(attempt.requestId ?? '') !== attempt.servedModel)
      .map(
        (attempt) =>
          `${attempt.requestId} is ${attempt.servedModel}, receipt says ${captured.get(attempt.requestId ?? '')}`
      )

    expect(wrong).toEqual([])
  })

  // Two rows claiming one receipt is two rows claiming one call happened twice.
  test('are not handed out twice', () => {
    const ids = attempts.map((attempt) => attempt.requestId).filter((id): id is string => id !== null)

    expect(ids.length).toBe(new Set(ids).size)
  })
})

describe('mockStats', () => {
  // The dashboard and the record must not disagree about the same fixture, which they would the
  // moment a figure here was typed in rather than counted.
  test('counts the mock rather than restating them', () => {
    const stats = mockStats()
    const readings = attempts.filter((attempt) => attempt.reading !== null)

    expect(stats.readings).toBe(readings.length)
    expect(stats.verifiedReadings).toBe(readings.filter((a) => a.receiptStatus === 'verified').length)
    expect(stats.items).toBe(mockRecord('sample').items.length)
    expect(stats.families.reduce((sum, family) => sum + family.readings, 0)).toBe(readings.length)
  })
})
