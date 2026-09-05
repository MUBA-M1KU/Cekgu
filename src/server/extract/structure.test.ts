import { describe, expect, test } from 'bun:test'
import type { Provenance } from '../gateway/client'
import { MODELS } from '../gateway/models'
import { structurePaper, structuringPrompt } from './structure'

const DRAFT = {
  title: 'Week 4 data structures quiz',
  subject: 'Computer Science',
  language: 'en',
  context: null,
  items: [
    {
      stem: 'Which structure is first in, first out?',
      options: [
        { letter: 'A', text: 'Stack' },
        { letter: 'B', text: 'Queue' }
      ],
      key: 'B'
    }
  ]
}

function verified(model: string, content: string): Provenance {
  const requestId = `req-${model}`
  return {
    content,
    requestId,
    devshardId: '70158',
    requestedModel: model,
    servedModel: model,
    fallbackHeader: null,
    receiptStatus: 'verified',
    receipt: {
      x_request_id: requestId,
      x_devshard_id: '70158',
      model,
      created_at: '2026-09-04T12:00:00Z',
      outcome: 'success',
      status_code: 200,
      stream: false,
      total_tokens: 240,
      ttft_ms: 300,
      duration_ms: 1800
    },
    httpStatus: 200,
    latencyMs: 1800,
    error: null
  }
}

describe('structuringPrompt', () => {
  test('carries the paper and every constraint needed for a schema-valid draft', () => {
    const prompt = structuringPrompt('1. Which structure is FIFO?')

    expect(prompt).toContain('1. Which structure is FIFO?')
    expect(prompt).toContain('strict JSON')
    expect(prompt).toContain('A to F')
    expect(prompt).toContain('two to six options')
    expect(prompt).toContain('one key per question')
    expect(prompt).toContain('never invent a question or an answer')
    expect(prompt).toContain('omit that item')
    expect(prompt).toContain('renumber them')
    expect(prompt).toContain('fewer than two options')
    expect(prompt).toContain('"draft"')
    expect(prompt).toContain('"warnings"')
    expect(prompt).toContain('"context": null')
  })
})

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('structurePaper', () => {
  test('returns a schema-valid draft with its verified Gonka provenance', async () => {
    const model = MODELS[0]
    const warnings = ['Question 2 was omitted because no printed answer key was found.']
    const result = await structurePaper('paper', {
      call: async () => verified(model, JSON.stringify({ draft: DRAFT, warnings })),
      order: () => [model]
    })

    expect(result).toEqual({
      ok: true,
      draft: DRAFT,
      provenance: { requestId: `req-${model}`, servedModel: model, receiptStatus: 'verified' },
      warnings
    })
  })

  test('normalises model warnings to sentence case', async () => {
    const model = MODELS[0]
    const result = await structurePaper('paper', {
      call: async () =>
        verified(
          model,
          JSON.stringify({ draft: DRAFT, warnings: ['question 2 was omitted because its key was not printed.'] })
        ),
      order: () => [model]
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.warnings).toEqual(['Question 2 was omitted because its key was not printed.'])
  })

  test('extracts JSON wrapped in prose and a fenced block', async () => {
    const model = MODELS[0]
    const content = `Here is the result:\n\`\`\`json\n${JSON.stringify({ draft: DRAFT, warnings: [] })}\n\`\`\`\nDone.`
    const result = await structurePaper('paper', {
      call: async () => verified(model, content),
      order: () => [model]
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.draft).toEqual(DRAFT)
  })

  test('rejects a body that omits the explicit warnings array', async () => {
    const model = MODELS[0]
    const result = await structurePaper('paper', {
      call: async () => verified(model, JSON.stringify({ draft: DRAFT })),
      order: () => [model]
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/warnings/i)
  })

  test('tries the next model after a gateway error', async () => {
    const first = MODELS[0]
    const second = MODELS[1]
    const calls: string[] = []
    const result = await structurePaper('paper', {
      call: async (model) => {
        calls.push(model)
        if (model === first) {
          return {
            ...verified(model, JSON.stringify({ draft: DRAFT, warnings: [] })),
            error: 'The gateway answered 503.'
          }
        }
        return verified(model, JSON.stringify({ draft: DRAFT, warnings: [] }))
      },
      order: () => [first, second]
    })

    expect(calls).toEqual([first, second])
    expect(result.ok && result.provenance.servedModel).toBe(second)
  })

  test('tries the next model when the receipt is not verified', async () => {
    const first = MODELS[0]
    const second = MODELS[1]
    const calls: string[] = []
    const result = await structurePaper('paper', {
      call: async (model) => {
        calls.push(model)
        const response = verified(model, JSON.stringify({ draft: DRAFT, warnings: [] }))
        return model === first ? { ...response, receiptStatus: 'mismatch' as const } : response
      },
      order: () => [first, second]
    })

    expect(calls).toEqual([first, second])
    expect(result.ok && result.provenance.servedModel).toBe(second)
  })

  // structurePaper waves over whatever deps.order() hands it, so the wave arithmetic is a property
  // of the loop rather than of how many families ship. Three synthetic names keep this testing the
  // batching after the registry dropped to two, and keep it honest if a third is ever restored.
  test('starts two models at once and leaves the third until that wave settles', async () => {
    const [first, second, third] = ['family-a', 'family-b', 'family-c']
    const calls: string[] = []
    const settle: Record<string, (provenance: Provenance) => void> = {}
    const pending = structurePaper('paper', {
      call: (model) => {
        calls.push(model)
        return new Promise<Provenance>((resolve) => {
          settle[model] = resolve
        })
      },
      order: () => [first, second, third]
    })

    await flush()
    expect(calls).toEqual([first, second])

    const refuse = (model: string) => {
      const resolve = settle[model]
      if (!resolve) throw new Error(`The call to ${model} did not start.`)
      resolve({
        ...verified(model, JSON.stringify({ draft: DRAFT, warnings: [] })),
        error: 'The gateway answered 503.'
      })
    }
    refuse(first)
    refuse(second)
    await flush()

    expect(calls).toEqual([first, second, third])
    settle[third]?.(verified(third, JSON.stringify({ draft: DRAFT, warnings: [] })))
    const result = await pending
    expect(result.ok && result.provenance.servedModel).toBe(third)
  })

  // The reason the wave exists. healthyOrder cannot know which family will be fast on a structuring
  // prompt, so a first name that takes 74 s used to spend the route's whole 100 s ceiling alone.
  test('answers on the first verified draft rather than the first family in the order', async () => {
    const [slow, quick] = MODELS
    let slowSettled = false
    const result = await structurePaper('paper', {
      call: (model) =>
        model === slow
          ? new Promise<Provenance>((resolve) =>
              setTimeout(() => {
                slowSettled = true
                resolve(verified(slow, JSON.stringify({ draft: DRAFT, warnings: [] })))
              }, 50)
            )
          : Promise.resolve(verified(quick, JSON.stringify({ draft: DRAFT, warnings: [] }))),
      order: () => [slow, quick]
    })

    expect(result.ok && result.provenance.servedModel).toBe(quick)
    expect(slowSettled).toBe(false)
  })

  test('tries the next model after malformed JSON', async () => {
    const first = MODELS[0]
    const second = MODELS[1]
    const result = await structurePaper('paper', {
      call: async (model) =>
        model === first
          ? verified(model, 'This is not JSON.')
          : verified(model, JSON.stringify({ draft: DRAFT, warnings: [] })),
      order: () => [first, second]
    })

    expect(result.ok && result.provenance.servedModel).toBe(second)
  })

  test('returns a teacher-readable reason when the draft fails createRecordSchema', async () => {
    const model = MODELS[0]
    const result = await structurePaper('paper', {
      call: async () => verified(model, JSON.stringify({ draft: { ...DRAFT, items: [] }, warnings: [] })),
      order: () => [model]
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/at least one question/i)
  })

  test('translates a missing required field into a teacher-readable reason', async () => {
    const model = MODELS[0]
    const { title: _title, ...draftWithoutTitle } = DRAFT
    const result = await structurePaper('paper', {
      call: async () => verified(model, JSON.stringify({ draft: draftWithoutTitle, warnings: [] })),
      order: () => [model]
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain('required information')
      expect(result.reason).not.toContain('expected string')
    }
  })

  test('rejects every completion that has no Gonka Request ID', async () => {
    const calls: string[] = []
    const result = await structurePaper('paper', {
      call: async (model) => {
        calls.push(model)
        return { ...verified(model, JSON.stringify({ draft: DRAFT, warnings: [] })), requestId: null, receipt: null }
      },
      order: () => [...MODELS]
    })

    expect(calls).toEqual([...MODELS])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/request id|verified/i)
  })

  test('treats a blank Gonka Request ID as missing proof', async () => {
    const model = MODELS[0]
    const result = await structurePaper('paper', {
      call: async () => ({
        ...verified(model, JSON.stringify({ draft: DRAFT, warnings: [] })),
        requestId: ''
      }),
      order: () => [model]
    })

    expect(result.ok).toBe(false)
  })
})
