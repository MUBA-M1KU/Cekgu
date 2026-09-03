import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { createRecordSchema, GUEST_MAX_ITEM_CHARS, GUEST_MAX_ITEMS, itemCharCount } from '../../shared/schemas'
import { ApiError, createRecord } from '../api'
import { BubbleRow } from '../components/BubbleRow'
import { Field, inputClass } from '../components/Field'
import { Sheet } from '../components/Sheet'
import { useSession } from '../session'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' }
]

type DraftItem = { id: string; stem: string; options: { letter: string; text: string }[]; key: string }

function emptyItem(): DraftItem {
  return {
    id: crypto.randomUUID(),
    stem: '',
    options: [
      { letter: 'A', text: '' },
      { letter: 'B', text: '' }
    ],
    key: ''
  }
}

// Letters are positional, so removing option B has to renumber everything after it.
function relabel(options: { letter: string; text: string }[]) {
  return options.map((option, index) => ({ ...option, letter: LETTERS[index] ?? option.letter }))
}

export function NewCheck() {
  const navigate = useNavigate()
  const session = useSession()
  const isGuest = session.status === 'in' && session.isGuest

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState('en')
  const [context, setContext] = useState('')
  const [items, setItems] = useState<DraftItem[]>([emptyItem()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const maxItems = isGuest ? GUEST_MAX_ITEMS : Number.POSITIVE_INFINITY

  function patchItem(index: number, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function errorFor(...path: (string | number)[]) {
    return errors[path.join('.')]
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const payload = { title, subject, language, context: context.trim() === '' ? null : context, items }

    // FR-CHECK-2: nothing is sent until the whole set is valid, so no request is spent on a
    // malformed paper. The schema is the same one the server validates with.
    const parsed = createRecordSchema.safeParse(payload)
    const found: Record<string, string> = {}

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        if (!found[key]) found[key] = issue.message
        // An issue on items.0.options.1.text has no field of its own on screen, so it rolls up
        // to the options group. Without this the educator sees no message at all for an
        // empty option, which is the most likely mistake in the form.
        const rolled = issue.path.slice(0, 3).join('.')
        if (!found[rolled]) found[rolled] = issue.message
      }
    }

    if (isGuest) {
      if (items.length > GUEST_MAX_ITEMS) {
        found.items = `The Guest workspace takes up to ${GUEST_MAX_ITEMS} questions in one check.`
      }
      items.forEach((item, index) => {
        if (itemCharCount(item) > GUEST_MAX_ITEM_CHARS) {
          found[`items.${index}.stem`] =
            `The Guest workspace takes up to ${GUEST_MAX_ITEM_CHARS} characters across a question and its options.`
        }
      })
    }

    setErrors(found)
    if (Object.keys(found).length > 0 || !parsed.success) return

    setSubmitting(true)
    try {
      const record = await createRecord(parsed.data)
      navigate(`/records/${record.id}`)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'We could not start this check, try again in a moment.'
      setErrors({ form: message })
      setSubmitting(false)
    }
  }

  return (
    <Sheet as="form" onSubmit={submit}>
      <h1>New Check</h1>
      <p className="mt-3 max-w-[62ch] type-body text-ink-muted">
        Type the questions you are about to publish. Two independent models answer each one without seeing your key.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <Field label="Assessment Title" htmlFor="title" error={errorFor('title')}>
          <input id="title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Subject" htmlFor="subject" error={errorFor('subject')}>
            <input id="subject" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Language" htmlFor="language" error={errorFor('language')}>
            <select id="language" className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Context"
          htmlFor="context"
          helper="Optional. Anything the readers should know, such as the year group."
          error={errorFor('context')}
        >
          <textarea
            id="context"
            rows={2}
            className={inputClass}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </Field>
      </div>

      <h2 className="mt-8">Questions</h2>
      {errorFor('items') ? <p className="mt-2 type-caption text-pen">{errorFor('items')}</p> : null}

      {items.map((item, index) => (
        <fieldset key={item.id} className="mt-5 border-0 border-t border-rule p-0 pt-5">
          <legend className="type-eyebrow text-ink-muted">Question {index + 1}</legend>

          <div className="mt-4 flex flex-col gap-5">
            <Field label="Question" htmlFor={`stem-${index}`} error={errorFor('items', index, 'stem')}>
              <textarea
                id={`stem-${index}`}
                rows={2}
                className={`${inputClass} type-lead`}
                value={item.stem}
                onChange={(e) => patchItem(index, { stem: e.target.value })}
              />
            </Field>

            <Field
              label="Options"
              htmlFor={`option-${index}-0`}
              helper="Two to six options. One must be the key."
              error={errorFor('items', index, 'options')}
            >
              <div className="flex flex-col gap-2">
                {item.options.map((option, optionIndex) => (
                  <div key={option.letter} className="flex items-center gap-3">
                    <span className="type-label w-4 shrink-0 text-ink-muted">{option.letter}</span>
                    <input
                      id={`option-${index}-${optionIndex}`}
                      className={inputClass}
                      value={option.text}
                      onChange={(e) =>
                        patchItem(index, {
                          options: item.options.map((o, i) => (i === optionIndex ? { ...o, text: e.target.value } : o))
                        })
                      }
                    />
                    {item.options.length > 2 ? (
                      <button
                        type="button"
                        className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium shrink-0"
                        onClick={() => {
                          const next = relabel(item.options.filter((_, i) => i !== optionIndex))
                          patchItem(index, {
                            options: next,
                            key: next.some((o) => o.letter === item.key) ? item.key : ''
                          })
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Field>

            {item.options.length < 6 ? (
              <div>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium"
                  onClick={() =>
                    patchItem(index, {
                      options: relabel([...item.options, { letter: '', text: '' }])
                    })
                  }
                >
                  Add Option
                </button>
              </div>
            ) : null}

            <Field label="Keyed Option" htmlFor={`key-${index}`} error={errorFor('items', index, 'key')}>
              <BubbleRow
                options={item.options}
                filled={item.key === '' ? null : item.key}
                onSelect={(letter) => patchItem(index, { key: letter })}
                label={`Keyed option for question ${index + 1}`}
              />
            </Field>
          </div>

          {items.length > 1 ? (
            <button
              type="button"
              className="mt-5 inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium"
              onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            >
              Remove Question {index + 1}
            </button>
          ) : null}
        </fieldset>
      ))}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-rule pt-6">
        <button
          type="button"
          disabled={items.length >= maxItems}
          className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium disabled:opacity-60"
          onClick={() => setItems((current) => [...current, emptyItem()])}
        >
          Add Question
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink disabled:opacity-60"
        >
          Submit Check
        </button>
        {isGuest ? (
          <p className="type-caption text-ink-muted">
            {items.length} of {GUEST_MAX_ITEMS} questions used in the Guest workspace.
          </p>
        ) : null}
      </div>

      {errorFor('form') ? (
        <p role="alert" className="mt-4 type-body text-pen">
          {errorFor('form')}
        </p>
      ) : null}
    </Sheet>
  )
}
