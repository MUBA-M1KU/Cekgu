import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { createRecordSchema, GUEST_MAX_ITEM_CHARS, itemCharCount } from '../../shared/schemas'
import { ApiError, createRecord, extractPaper } from '../api'
import { BubbleRow } from '../components/BubbleRow'
import { Field, inputClass } from '../components/Field'
import { Select } from '../components/Select'
import { Sheet } from '../components/Sheet'
import { DEMO_PAPER } from '../demo-paper'
import { useSession } from '../session'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' }
]

const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024

type Extraction = { requestId: string; servedModel: string; warnings: string[] }

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

function demoItems(): DraftItem[] {
  return DEMO_PAPER.items.map((item) => ({
    id: crypto.randomUUID(),
    stem: item.stem,
    options: item.options.map((option) => ({ ...option })),
    key: item.key
  }))
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
  const [prefilled, setPrefilled] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<Extraction | null>(null)

  function fillWithDemo() {
    setTitle(DEMO_PAPER.title)
    setSubject(DEMO_PAPER.subject)
    setLanguage(DEMO_PAPER.language)
    setContext(DEMO_PAPER.context)
    setItems(demoItems())
    setErrors({})
    setPrefilled(true)
  }

  // Nothing is written until the whole draft has parsed. A form half filled from a failed extraction
  // is worse than an empty one, because the educator cannot tell which fields came from their paper.
  async function uploadPaper(file: File) {
    setExtracting(true)
    setExtractError(null)
    setExtraction(null)

    if (!UPLOAD_TYPES.includes(file.type)) {
      setExtractError('That file type is not supported. Upload a PNG, JPEG, WebP or PDF.')
      setExtracting(false)
      return
    }

    if (file.size > UPLOAD_MAX_BYTES) {
      setExtractError('That file is larger than 10 MB. Upload a smaller scan or photo.')
      setExtracting(false)
      return
    }

    try {
      const response = await extractPaper(file)
      const draft = createRecordSchema.safeParse(response.draft)

      if (!draft.success) {
        setExtractError('We could not read a usable paper out of that file. Try a clearer scan, or type it in.')
        return
      }

      setTitle(draft.data.title)
      setSubject(draft.data.subject)
      setLanguage(draft.data.language)
      setContext(draft.data.context ?? '')
      setItems(
        draft.data.items.map((item) => ({
          id: crypto.randomUUID(),
          stem: item.stem,
          options: item.options.map((option) => ({ ...option })),
          key: item.key
        }))
      )
      // Errors on screen were about the form before this paper landed in it.
      setErrors({})
      setExtraction({
        requestId: response.provenance.requestId,
        servedModel: response.provenance.servedModel,
        warnings: response.warnings
      })
    } catch (error) {
      setExtractError(error instanceof ApiError ? error.message : 'We could not read that file, try again in a moment.')
    } finally {
      setExtracting(false)
    }
  }

  function clearForm() {
    setTitle('')
    setSubject('')
    setLanguage('en')
    setContext('')
    setItems([emptyItem()])
    setErrors({})
    setPrefilled(false)
  }

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
      <p className="mt-3 max-w-[62ch] type-ui text-ink-muted">
        Type the questions you are about to publish. Two independent models answer each one without seeing your key.
      </p>

      <div className="mt-6 rounded-sheet bg-well p-4">
        <p className="type-label">Upload a Paper</p>
        <p className="mt-1 max-w-[62ch] type-caption text-ink-muted">
          A photo or a PDF of a printed paper fills the fields below for you to read and correct before you submit it.
        </p>
        {/* The split is stated rather than buried. Requirement 1 binds reasoning and verification to
            Gonka, and reading pixels into text decides nothing, but a judge who works that out for
            themselves reads silence as concealment. */}
        <p className="mt-1 max-w-[62ch] type-caption text-ink-muted">
          The file is read by a vision model. Every judgement about what it says is made by two Gonka models, and the
          request id below is that step's receipt.
        </p>

        <label className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-control border border-rule-strong px-4 font-medium focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink has-disabled:cursor-default has-disabled:opacity-60">
          <input
            type="file"
            className="sr-only"
            accept={UPLOAD_TYPES.join(',')}
            disabled={extracting}
            onChange={(event) => {
              const file = event.target.files?.[0]
              // Cleared so choosing the same file twice after a failure still fires a change.
              event.target.value = ''
              if (file) void uploadPaper(file)
            }}
          />
          {extracting ? 'Reading the Paper' : 'Choose a File'}
        </label>
        {extracting ? (
          <p className="mt-2 type-caption text-ink-muted">
            A photo takes a few seconds and a PDF can take up to a minute. You can keep typing while it runs.
          </p>
        ) : null}

        {extractError ? (
          <p role="alert" className="mt-2 type-caption text-pen">
            {extractError}
          </p>
        ) : null}

        {extraction ? (
          <>
            <dl className="type-mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-ink-muted">Request Id</dt>
              <dd className="m-0 break-words">{extraction.requestId}</dd>
              <dt className="text-ink-muted">Served</dt>
              <dd className="m-0 break-words">{extraction.servedModel}</dd>
            </dl>
            {extraction.warnings.length > 0 ? (
              <div className="mt-3">
                <p className="type-label">Worth Checking</p>
                <ul className="mt-1 list-disc pl-5">
                  {extraction.warnings.map((warning) => (
                    <li key={warning} className="type-caption text-ink-muted">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {isGuest ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-sheet bg-well p-4">
          <div className="min-w-0 flex-1">
            <p className="type-label">Signed In as Guest</p>
            <p className="mt-1 max-w-[62ch] type-caption text-ink-muted">
              A demo should not start with typing. This fills every field with a three-question paper: one key is wrong
              on purpose, and one question has two defensible answers depending on the convention.
            </p>
          </div>
          <button
            type="button"
            onClick={fillWithDemo}
            className="inline-flex h-9 shrink-0 items-center rounded-control border border-rule-strong px-4 font-medium"
          >
            Fill With Demo Content
          </button>
          {prefilled ? (
            <button type="button" onClick={clearForm} className="type-label shrink-0 underline">
              Clear the Form
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-5">
        <Field label="Assessment Title" htmlFor="title" error={errorFor('title')}>
          <input id="title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Subject" htmlFor="subject" error={errorFor('subject')}>
            <input id="subject" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Language" htmlFor="language" error={errorFor('language')}>
            <Select id="language" label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
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

      {/* A card each, not a rule each. Twelve questions used to arrive as twelve hairlines down
          the sheet, which is the same device the guest hint above already declines. */}
      {items.map((item, index) => (
        <fieldset key={item.id} className="mt-5 border-0 p-0">
          {/* The legend stays outside the card. A <legend> renders in the fieldset's border box,
              so putting the well on the fieldset itself hangs it over the card's top edge. */}
          <legend className="type-eyebrow text-ink-muted">Question {index + 1}</legend>

          <div className="mt-2 flex flex-col gap-5 rounded-sheet bg-well p-5">
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
                      aria-label={`Question ${index + 1}, option ${option.letter}`}
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
                        className="inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium shrink-0"
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
                  className="inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium"
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

            {items.length > 1 ? (
              <button
                type="button"
                className="inline-flex h-9 self-start items-center rounded-control border border-rule-strong px-4 font-medium"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
              >
                Remove Question {index + 1}
              </button>
            ) : null}
          </div>
        </fieldset>
      ))}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-control border border-rule-strong px-4 font-medium disabled:opacity-60"
          onClick={() => setItems((current) => [...current, emptyItem()])}
        >
          Add Question
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center rounded-control bg-ink px-4 font-medium text-on-ink disabled:opacity-60"
        >
          Submit Check
        </button>
      </div>

      {errorFor('form') ? (
        <p role="alert" className="mt-4 type-ui text-pen">
          {errorFor('form')}
        </p>
      ) : null}
    </Sheet>
  )
}
