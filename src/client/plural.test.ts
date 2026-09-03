import { expect, test } from 'bun:test'
import { count } from './plural'

test('one is singular and everything else is not', () => {
  expect(count(1, 'question')).toBe('1 question')
  expect(count(0, 'question')).toBe('0 questions')
  expect(count(12, 'question')).toBe('12 questions')
})

test('an irregular plural can be given', () => {
  expect(count(1, 'entry', 'entries')).toBe('1 entry')
  expect(count(3, 'entry', 'entries')).toBe('3 entries')
})
