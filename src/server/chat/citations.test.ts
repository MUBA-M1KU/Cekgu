import { describe, expect, test } from 'bun:test'
import type { ChatProvenance } from '../../shared/chat'
import type { Attempt, Item, RecordDetail } from '../../shared/types'
import { citationsIn, stripTokens, toMessages } from './citations'

function attempt(model: string, answer: string, requestId: string | null, admitted = true): Attempt {
  return {
    id: `a-${model}`,
    requestedModel: model,
    servedModel: model,
    requestId,
    devshardId: '65725',
    fallbackHeader: null,
    httpStatus: 200,
    receiptStatus: 'verified',
    reading: admitted ? { model, answer, defensible: [answer], reason: 'because' } : null,
    latencyMs: 1000,
    startedAt: '2026-09-04T00:00:00.000Z',
    finishedAt: '2026-09-04T00:00:01.000Z',
    admitted,
    rejectionReason: null
  }
}

const item: Item = {
  id: 'i-4',
  position: 4,
  stem: 'Which structure is LIFO?',
  options: [
    { letter: 'A', text: 'Stack' },
    { letter: 'B', text: 'Queue' }
  ],
  key: 'A',
  status: 'done',
  verdict: 'possible_key_error',
  verdictReason: null,
  truthScore: null,
  attemptsUsed: 2,
  attempts: [attempt('kimi', 'B', 'req-aaa'), attempt('minimax', 'B', 'req-bbb')],
  dispositions: []
}

const record: RecordDetail = {
  id: 'r-1',
  title: 'Paper',
  subject: 'Computer Science',
  language: 'en',
  context: null,
  status: 'ready',
  isSample: false,
  expiresAt: null,
  counts: { clear: 0, possible_key_error: 1, possible_ambiguity: 0, split_opinion: 0, unverified: 0, pending: 0 },
  truthScore: { score: null, scored: 0, total: 0 },
  items: [item]
}

const provenance: ChatProvenance = { provider: 'gemini', responseId: 'resp-1', model: 'gemini-2.5-flash' }

describe('citationsIn', () => {
  test('resolves a reading token to the family that actually filled that seat', () => {
    expect(citationsIn('Reader A chose Queue. [reading:4:A]', record)).toEqual([
      { kind: 'reading', position: 4, seat: 0, model: 'kimi', requestId: 'req-aaa' }
    ])

    expect(citationsIn('[reading:4:B]', record)).toEqual([
      { kind: 'reading', position: 4, seat: 1, model: 'minimax', requestId: 'req-bbb' }
    ])
  })

  test('a receipt token carries the model the record says served it', () => {
    expect(citationsIn('[receipt:req-bbb]', record)).toEqual([
      { kind: 'receipt', requestId: 'req-bbb', model: 'minimax' }
    ])
  })

  // The whole point of resolving here rather than on the client: an id the model invented must not
  // become a pill a judge can click.
  test('drops tokens the record cannot vouch for', () => {
    expect(citationsIn('[item:99] [reading:99:A] [receipt:req-invented]', record)).toEqual([])
  })

  test('de-duplicates repeats and keeps first-seen order', () => {
    const found = citationsIn('[item:4] [reading:4:A] [item:4]', record)

    expect(found).toHaveLength(2)
    expect(found[0]).toEqual({ kind: 'item', position: 4 })
  })

  test('prose with no tokens and no named question produces none', () => {
    expect(citationsIn('Both readers agreed.', record)).toEqual([])
  })

  // Measured on production: MiniMax answered correctly, named three items in prose, and emitted no
  // tokens at all. A sentence about this record with nothing under it reads as ungrounded.
  test('recovers an item named in prose when the model forgot the token', () => {
    expect(citationsIn('Question 4 is flagged.', record)).toEqual([{ kind: 'item', position: 4 }])
    expect(citationsIn('Item 4 came back Possible Key Error.', record)).toEqual([{ kind: 'item', position: 4 }])
  })

  test('recovers every position in a list', () => {
    const many: RecordDetail = { ...record, items: [item, { ...item, id: 'i-9', position: 9 }] }

    expect(citationsIn('Questions 4 and 9 are flagged.', many)).toEqual([
      { kind: 'item', position: 4 },
      { kind: 'item', position: 9 }
    ])
  })

  // The recovery resolves against the record like every other citation, so a position that is not
  // in this paper cannot become a pill however confidently it is named.
  test('does not recover a question this record does not have', () => {
    expect(citationsIn('Question 99 is flagged.', record)).toEqual([])
  })

  // Only item pills are recovered. A claim about what a reader said still needs the model to have
  // cited that reader, because a reading pill carries a model name and a request id.
  test('never invents a reading or a receipt from prose', () => {
    const found = citationsIn('Reader A chose Queue on question 4, receipt req-aaa.', record)

    expect(found).toEqual([{ kind: 'item', position: 4 }])
  })

  test('a prose mention and its token do not double up', () => {
    expect(citationsIn('Question 4 is flagged. [item:4]', record)).toEqual([{ kind: 'item', position: 4 }])
  })
})

describe('stripTokens', () => {
  test('takes the tokens out and closes the space they left', () => {
    expect(stripTokens('Reader A chose Queue [reading:4:A].')).toBe('Reader A chose Queue.')
    expect(stripTokens('Question 4 is flagged. [item:4]')).toBe('Question 4 is flagged.')
  })

  test('leaves a malformed token alone rather than mangling the sentence', () => {
    expect(stripTokens('See [item:] and [reading:4:C].')).toBe('See [item:] and [reading:4:C].')
  })
})

describe('toMessages', () => {
  test('splits paragraphs and gives each the seat it quotes', () => {
    const text = 'Question 4 is flagged. [item:4]\n\nI read Queue. [reading:4:A]\n\nSo did I. [reading:4:B]'
    const messages = toMessages(text, record, provenance)

    expect(messages.map((message) => message.seat)).toEqual([null, 0, 1])
    expect(messages[1]?.text).toBe('I read Queue.')
  })

  // A sentence comparing two readers is not either reader speaking, so it stays Cekgu's own.
  test('a paragraph citing both seats belongs to neither', () => {
    const messages = toMessages('They split. [reading:4:A] [reading:4:B]', record, provenance)

    expect(messages).toHaveLength(1)
    expect(messages[0]?.seat).toBeNull()
  })

  test('only the last message carries the provenance of the one call that made them all', () => {
    const messages = toMessages('One. [item:4]\n\nTwo. [reading:4:A]', record, provenance)

    expect(messages[0]?.provenance).toBeNull()
    expect(messages[1]?.provenance).toEqual(provenance)
  })

  test('a single unbroken answer is still one message', () => {
    const messages = toMessages('Both readers chose Queue. [item:4]', record, provenance)

    expect(messages).toHaveLength(1)
    expect(messages[0]?.role).toBe('agent')
    expect(messages[0]?.citations).toHaveLength(1)
  })
})

describe('markdown', () => {
  // MiniMax answered production with "**Possible key error on item 3:**" and the asterisks were
  // rendered literally, because the transcript prints plain text.
  test('drops emphasis the transcript would print literally', () => {
    expect(stripTokens('**Possible key error on item 3:** both readers chose B.')).toBe(
      'Possible key error on item 3: both readers chose B.'
    )
    expect(stripTokens('That is *defensible* either way.')).toBe('That is defensible either way.')
  })

  test('drops headings and bullet markers', () => {
    expect(stripTokens('## Findings\n- item one\n- item two')).toBe('Findings\nitem one\nitem two')
  })

  test('leaves arithmetic and prose asterisks alone', () => {
    expect(stripTokens('The rule is 2 * 3 = 6.')).toBe('The rule is 2 * 3 = 6.')
  })
})
