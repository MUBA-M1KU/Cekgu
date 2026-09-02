import { describe, expect, test } from 'bun:test'
import { createRecordSchema, itemCharCount, itemInputSchema } from './schemas'

const validItem = {
  stem: 'Which structure is first in, first out?',
  options: [
    { letter: 'A', text: 'Stack' },
    { letter: 'B', text: 'Queue' }
  ],
  key: 'B'
}

describe('itemInputSchema, FR-CHECK-2', () => {
  test('accepts a well formed item', () => {
    expect(itemInputSchema.safeParse(validItem).success).toBe(true)
  })

  test('rejects a missing stem', () => {
    expect(itemInputSchema.safeParse({ ...validItem, stem: '   ' }).success).toBe(false)
  })

  test('rejects fewer than two options', () => {
    const result = itemInputSchema.safeParse({ ...validItem, options: [validItem.options[0]], key: 'A' })
    expect(result.success).toBe(false)
  })

  test('rejects more than six options', () => {
    const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => ({ letter, text: `Option ${letter}` }))
    expect(itemInputSchema.safeParse({ ...validItem, options }).success).toBe(false)
  })

  test('rejects a duplicate option letter', () => {
    const options = [
      { letter: 'A', text: 'Stack' },
      { letter: 'A', text: 'Queue' }
    ]
    expect(itemInputSchema.safeParse({ ...validItem, options, key: 'A' }).success).toBe(false)
  })

  test('rejects two options with the same text, ignoring case and padding', () => {
    const options = [
      { letter: 'A', text: 'Queue' },
      { letter: 'B', text: ' queue ' }
    ]
    expect(itemInputSchema.safeParse({ ...validItem, options, key: 'A' }).success).toBe(false)
  })

  test('rejects a key that matches no option', () => {
    expect(itemInputSchema.safeParse({ ...validItem, key: 'C' }).success).toBe(false)
  })

  test('rejects an absent key', () => {
    expect(itemInputSchema.safeParse({ ...validItem, key: '' }).success).toBe(false)
  })

  test('names the failing field so the form can show the error beside it', () => {
    const result = itemInputSchema.safeParse({ ...validItem, key: 'C' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['key'])
  })
})

describe('createRecordSchema', () => {
  test('accepts a minimal record', () => {
    const result = createRecordSchema.safeParse({
      title: 'Week 4 data structures quiz',
      subject: 'Computer Science',
      language: 'en',
      items: [validItem]
    })
    expect(result.success).toBe(true)
  })

  test('rejects a record with no items', () => {
    const result = createRecordSchema.safeParse({
      title: 'Empty',
      subject: 'Computer Science',
      language: 'en',
      items: []
    })
    expect(result.success).toBe(false)
  })

  test('rejects a blank title', () => {
    const result = createRecordSchema.safeParse({
      title: '  ',
      subject: 'Computer Science',
      language: 'en',
      items: [validItem]
    })
    expect(result.success).toBe(false)
  })
})

describe('itemCharCount, the FR-AUTH-5 guest size limit', () => {
  test('counts the stem and every option', () => {
    expect(itemCharCount(validItem)).toBe(validItem.stem.length + 'Stack'.length + 'Queue'.length)
  })
})
