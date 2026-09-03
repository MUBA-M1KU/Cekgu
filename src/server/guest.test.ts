import { describe, expect, test } from 'bun:test'

import { GUEST_MAX_ITEM_CHARS, GUEST_MAX_ITEMS, GUEST_MAX_RECORDS } from '../shared/schemas'
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
  test('a check within every limit is accepted', () => {
    expect(guestLimitRejection(input([item(), item()]), 0)).toBeNull()
  })

  test(`${GUEST_MAX_ITEMS} questions is the limit, not one past it`, () => {
    const atLimit = Array.from({ length: GUEST_MAX_ITEMS }, () => item())
    expect(guestLimitRejection(input(atLimit), 0)).toBeNull()
    expect(guestLimitRejection(input([...atLimit, item()]), 0)?.code).toBe('guest_item_limit')
  })

  test('the item-limit message says how many to remove', () => {
    const overBy3 = Array.from({ length: GUEST_MAX_ITEMS + 3 }, () => item())
    expect(guestLimitRejection(input(overBy3), 0)?.message).toContain('Remove 3')
  })

  test('an oversized question is named by its position', () => {
    const long = item('x'.repeat(GUEST_MAX_ITEM_CHARS))
    const rejection = guestLimitRejection(input([item(), long]), 0)
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
    expect(guestLimitRejection(input([wide]), 0)?.code).toBe('guest_size_limit')
  })

  test(`the ${GUEST_MAX_RECORDS}th record is allowed and the next is refused`, () => {
    expect(guestLimitRejection(input([item()]), GUEST_MAX_RECORDS - 1)).toBeNull()
    const rejection = guestLimitRejection(input([item()]), GUEST_MAX_RECORDS)
    expect(rejection?.code).toBe('guest_record_limit')
    expect(rejection?.message).toContain('Delete one from Records, or wait for the oldest to expire.')
  })

  test('the item limit is reported before the record limit', () => {
    const tooMany = Array.from({ length: GUEST_MAX_ITEMS + 1 }, () => item())
    expect(guestLimitRejection(input(tooMany), GUEST_MAX_RECORDS)?.code).toBe('guest_item_limit')
  })
})
