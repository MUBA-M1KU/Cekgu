import { describe, expect, test } from 'bun:test'

import { GUEST_MAX_ITEM_CHARS } from '../shared/schemas'
import { guestExpiresAt, guestLimitRejection } from './guest'

type Input = Parameters<typeof guestLimitRejection>[0]

function item(stem = 'Which data structure is first in, first out?', optionText = 'Queue') {
  return {
    stem,
    options: [
      { letter: 'A', text: 'Stack' },
      { letter: 'B', text: optionText }
    ],
    key: 'B'
  }
}

function input(items: ReturnType<typeof item>[]): Input {
  return { title: 'Practice set', subject: 'Computer Science', language: 'en', context: null, items }
}

test('a guest record expires 24 hours after it is created', () => {
  const created = new Date('2026-09-03T06:00:00.000Z')
  expect(guestExpiresAt(created).toISOString()).toBe('2026-09-04T06:00:00.000Z')
})

describe('FR-AUTH-5 limits', () => {
  test('a check is accepted', () => {
    expect(guestLimitRejection(input([item(), item()]))).toBeNull()
  })

  // The counts were capped at 12 questions and 20 records and are not any more, at the owner's
  // request: a demo that hits a wall on stage is worse than a workspace somebody could flood. These
  // two assert the absence, because "we removed a limit" is only true if something checks that it
  // is gone — both of these pass trivially against an uncapped implementation and fail loudly if
  // anyone reinstates a cap.
  test('a check of a hundred questions is accepted', () => {
    const many = Array.from({ length: 100 }, () => item())
    expect(guestLimitRejection(input(many))).toBeNull()
  })

  test('no rejection code mentions a count limit', () => {
    const many = Array.from({ length: 100 }, () => item())
    expect(guestLimitRejection(input(many))?.code).toBeUndefined()
  })

  test('an oversized question is named by its position', () => {
    const long = item('x'.repeat(GUEST_MAX_ITEM_CHARS))
    const rejection = guestLimitRejection(input([item(), long]))
    expect(rejection?.code).toBe('guest_size_limit')
    expect(rejection?.message).toStartWith('Question 2')
  })

  test('the size limit counts the options, not the stem alone', () => {
    // A stem 20 characters under the cap plus two options of 15 characters each is over it.
    const stem = 'x'.repeat(GUEST_MAX_ITEM_CHARS - 20)
    const wide = {
      stem,
      options: [
        { letter: 'A', text: 'y'.repeat(15) },
        { letter: 'B', text: 'z'.repeat(15) }
      ],
      key: 'A'
    }
    expect(guestLimitRejection(input([wide]))?.code).toBe('guest_size_limit')
  })

  test('the size guard still applies inside a very long check', () => {
    const many = Array.from({ length: 50 }, () => item())
    const long = item('x'.repeat(GUEST_MAX_ITEM_CHARS))
    expect(guestLimitRejection(input([...many, long]))?.code).toBe('guest_size_limit')
  })
})
