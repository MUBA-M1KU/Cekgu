import { z } from 'zod'

export const GUEST_MAX_ITEMS = 12
export const GUEST_MAX_ITEM_CHARS = 2000
export const GUEST_MAX_RECORDS = 20

const LETTER = /^[A-F]$/

export const optionSchema = z.object({
  letter: z.string().regex(LETTER, 'Option letters run from A to F.'),
  text: z.string().trim().min(1, 'Every option needs text.').max(500, 'This option is too long.')
})

export const itemInputSchema = z
  .object({
    stem: z.string().trim().min(1, 'Every question needs a stem.').max(2000, 'This question is too long.'),
    options: z
      .array(optionSchema)
      .min(2, 'Two to six options. One must be the key.')
      .max(6, 'Two to six options. One must be the key.'),
    key: z.string().regex(LETTER, 'Choose which option is the key.')
  })
  .refine((item) => new Set(item.options.map((o) => o.letter)).size === item.options.length, {
    error: 'Each option needs its own letter.',
    path: ['options']
  })
  .refine((item) => new Set(item.options.map((o) => o.text.trim().toLowerCase())).size === item.options.length, {
    error: 'Two options are the same.',
    path: ['options']
  })
  .refine((item) => item.options.some((o) => o.letter === item.key), {
    error: 'The key must match one of the options.',
    path: ['key']
  })

export const createRecordSchema = z.object({
  title: z.string().trim().min(1, 'Give this assessment a title.').max(200, 'This title is too long.'),
  subject: z.string().trim().min(1, 'Name the subject.').max(120, 'This subject is too long.'),
  language: z.string().trim().min(2, 'Choose a language.').max(32, 'This language is too long.'),
  context: z.string().trim().max(1000, 'This context is too long.').nullish(),
  items: z.array(itemInputSchema).min(1, 'Add at least one question.')
})

export const dispositionSchema = z.object({
  kind: z.enum(['key_corrected', 'wording_revised', 'key_confirmed', 'flag_dismissed', 'retry_requested']),
  revisedKey: z.string().regex(LETTER, 'Choose the corrected key.').nullish(),
  revisedText: z.string().trim().max(2000, 'This revision is too long.').nullish(),
  note: z.string().trim().max(500, 'This note is too long.').nullish()
})

export const deleteRecordsSchema = z.object({
  ids: z.array(z.uuid('That is not a record id.')).min(1, 'Select at least one record.')
})

export function itemCharCount(item: z.infer<typeof itemInputSchema>): number {
  return item.stem.length + item.options.reduce((total, option) => total + option.text.length, 0)
}

export type OptionInput = z.infer<typeof optionSchema>
export type ItemInput = z.infer<typeof itemInputSchema>
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type DispositionInput = z.infer<typeof dispositionSchema>
