import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

type Option = { letter: string; text: string }
type Item = {
  id: string
  intended: 'clean' | 'mis_keyed' | 'ambiguous'
  stem: string
  options: Option[]
  key: string
  correctKey?: string
  defensibleKeys?: string[]
  note?: string
}
type EvaluationSet = {
  title: string
  subject: string
  language: string
  context: string
  items: Item[]
}

const set = JSON.parse(readFileSync(new URL('./evaluation-set.json', import.meta.url), 'utf8')) as EvaluationSet
const letters = (item: Item) => item.options.map((option) => option.letter)
const chars = (item: Item) => item.stem.length + item.options.reduce((total, option) => total + option.text.length, 0)
const byIntent = (intended: Item['intended']) => set.items.filter((item) => item.intended === intended)

describe('evaluation set', () => {
  test('is a record in the POST /api/records shape', () => {
    expect(set.title.length).toBeGreaterThan(0)
    expect(set.subject).toBe('Computer Science')
    expect(set.language).toBe('en')
    expect(set.context.length).toBeGreaterThan(0)
  })

  test('holds 30 items split 20 clean, 5 mis-keyed, 5 ambiguous', () => {
    expect(set.items).toHaveLength(30)
    expect(byIntent('clean')).toHaveLength(20)
    expect(byIntent('mis_keyed')).toHaveLength(5)
    expect(byIntent('ambiguous')).toHaveLength(5)
  })

  test('the first 12 items are the demo composition', () => {
    const head = set.items.slice(0, 12).map((item) => item.intended)
    expect(head.filter((intended) => intended === 'clean')).toHaveLength(8)
    expect(head.filter((intended) => intended === 'mis_keyed')).toHaveLength(2)
    expect(head.filter((intended) => intended === 'ambiguous')).toHaveLength(2)
  })

  test('ids are unique kebab-case', () => {
    const ids = set.items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  test('every item is a valid typed multiple-choice item within the Guest size limit', () => {
    for (const item of set.items) {
      expect(item.stem.trim().length).toBeGreaterThan(0)
      expect(item.options.length).toBeGreaterThanOrEqual(2)
      expect(item.options.length).toBeLessThanOrEqual(6)
      expect(letters(item)).toEqual('ABCDEF'.slice(0, item.options.length).split(''))
      const texts = item.options.map((option) => option.text.trim().toLowerCase())
      expect(new Set(texts).size).toBe(texts.length)
      expect(letters(item)).toContain(item.key)
      expect(chars(item)).toBeLessThanOrEqual(2000)
    }
  })

  test('mis-keyed items carry a different correct key and a note', () => {
    for (const item of byIntent('mis_keyed')) {
      const correctKey = item.correctKey
      expect(correctKey).toBeDefined()
      expect(letters(item)).toContain(correctKey ?? '')
      expect(correctKey).not.toBe(item.key)
      expect(item.defensibleKeys).toBeUndefined()
      expect(item.note?.length ?? 0).toBeGreaterThan(0)
    }
  })

  test('ambiguous items list at least two defensible keys including the supplied one, and a note', () => {
    for (const item of byIntent('ambiguous')) {
      expect(item.correctKey).toBeUndefined()
      expect(item.defensibleKeys?.length ?? 0).toBeGreaterThanOrEqual(2)
      expect(item.defensibleKeys).toContain(item.key)
      for (const letter of item.defensibleKeys ?? []) expect(letters(item)).toContain(letter)
      expect(item.note?.length ?? 0).toBeGreaterThan(0)
    }
  })

  test('clean items carry no plant metadata', () => {
    for (const item of byIntent('clean')) {
      expect(item.correctKey).toBeUndefined()
      expect(item.defensibleKeys).toBeUndefined()
      expect(item.note).toBeUndefined()
    }
  })

  test('the FIFO demo item is keyed Stack with Queue correct', () => {
    const fifo = set.items.find((item) => item.id === 'fifo-structure')
    expect(fifo?.intended).toBe('mis_keyed')
    expect(fifo?.options.find((option) => option.letter === fifo.key)?.text).toBe('Stack')
    expect(fifo?.options.find((option) => option.letter === fifo.correctKey)?.text).toBe('Queue')
  })

  test('the DNS item is keyed at encryption with the address translation correct', () => {
    const dns = set.items.find((item) => item.id === 'dns-role')
    expect(dns?.intended).toBe('mis_keyed')
    const optionText = (letter: string | undefined) =>
      dns?.options.find((option) => option.letter === letter)?.text ?? ''
    expect(optionText(dns?.key)).toMatch(/encrypt/i)
    expect(optionText(dns?.correctKey)).toMatch(/IP addresses/i)
  })

  test('the demo head opens its plants with the FIFO item', () => {
    const head = set.items.slice(0, 12)
    expect(head.find((item) => item.intended === 'mis_keyed')?.id).toBe('fifo-structure')
  })

  test('no option offers a catch-all answer', () => {
    for (const item of set.items) {
      for (const option of item.options) expect(option.text).not.toMatch(/all of the above|none of the above/i)
    }
  })

  test('no stem is negated', () => {
    for (const item of set.items) expect(item.stem).not.toMatch(/\bnot\b/i)
  })
})
