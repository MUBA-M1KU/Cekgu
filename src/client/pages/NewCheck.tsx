import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { createRecordSchema, GUEST_MAX_ITEM_CHARS, itemCharCount } from '../../shared/schemas'
import { ApiError, createRecord, extractPaper } from '../api'
import { BubbleRow } from '../components/BubbleRow'
import { Card, CardBody, CardHead } from '../components/Card'
import { Field, inputClass } from '../components/Field'
import { PlusIcon, TrashIcon } from '../components/icons'
import { Select } from '../components/Select'
import { DEMO_PAPER } from '../demo-paper'
import { useSession } from '../session'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' }
]

const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024

type Extraction = {
  requestId: string
  servedModel: string
  receiptStatus: string
  transcription: { provider: string; responseId: string | null; model: string | null } | null
  warnings: string[]
}

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

// A missing model falls back to the provider, because a bare id with nothing naming it is worse
// than a coarse name. Gemini promises neither value, so both have to be allowed to be absent.
function transcriptionLine(transcription: Extraction['transcription']): string {
  if (!transcription) return ''
  return [transcription.model ?? transcription.provider, transcription.responseId].filter(Boolean).join(' · ')
}

// Letters are positional, so removing option B has to renumber everything after it.
function relabel(options: { letter: string; text: string }[]) {
  return options.map((option, index) => ({ ...option, letter: LETTERS[index] ?? option.letter }))
}

/**
 * The form that starts a check.
 *
 * Two columns from the xl breakpoint: the paper on the left, and a rail on the right carrying
 * what is about to be sent and the button that sends it. The single-column version put Submit
 * Check under question nine, which is the one place on the page a reader has stopped looking.
 *
 * Each question is a surface rather than a fieldset separated by a rule, because a question is a
 * block a person edits, moves through and deletes as one thing.
 */
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
      setPrefilled(true)
      setExtraction({
        requestId: response.provenance.requestId,
        servedModel: response.provenance.servedModel,
        receiptStatus: response.provenance.receiptStatus,
        transcription: response.transcription ?? null,
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
    // The receipt goes with the draft it belongs to. A request id left on screen would be
    // provenance for questions that are no longer in any field.
    setExtraction(null)
    setExtractError(null)
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

  const keyed = items.filter((item) => item.key !== '').length

  return (
    <form onSubmit={submit} noValidate>
      <header className="page-head">
        <div className="min-w-0">
          <h1 className="page-title">New Check</h1>
          <p className="page-sub">
            Type the questions you are about to publish. Two independent models answer each one without seeing your key.
          </p>
        </div>
      </header>

      {/* One fieldset around the whole grid rather than a disabled prop threaded through Field,
          Select and BubbleRow. A draft lands whole, so every field on the screen has to be
          unavailable while one is on its way, including Submit and Clear. */}
      <fieldset disabled={extracting} className="m-0 border-0 p-0">
        <div className="page-grid">
          <div className="col-span-12 flex flex-col gap-4 xl:col-span-8">
            {isGuest ? (
              <Card>
                <CardHead
                  title="Signed In as Guest"
                  description="A demo should not start with typing. This fills every field with a three-question paper: one key is wrong on purpose, and one question has two defensible answers depending on the convention."
                  action={
                    <button type="button" onClick={fillWithDemo} className="btn btn-outline btn-sm">
                      Fill With Demo Content
                    </button>
                  }
                />
              </Card>
            ) : null}

            {/* Second of the two ways to fill this form, and the one every account kind gets. Its
              head is the guest card's shape because they are the same kind of offer; what follows
              in the body is the part that has no equivalent. */}
            <Card>
              <CardHead
                title="Upload a Paper"
                description="A photo or a PDF of a printed paper fills the fields below for you to read and correct before you submit it."
                action={
                  <label className="btn btn-outline btn-sm cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink has-disabled:cursor-not-allowed has-disabled:opacity-55">
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
                }
              />
              <CardBody>
                {/* The split is stated rather than buried. Requirement 1 binds reasoning and
                  verification to Gonka, and reading pixels into text decides nothing, but a judge
                  who works that out for themselves reads silence as concealment. */}
                <p className="type-caption text-ink-muted">
                  The file is read by a vision model. Every judgement about what it says is made by two Gonka models.
                  Both steps are receipted below, and the receipts say which is which.
                </p>

                {extracting ? (
                  <p className="type-caption text-ink-muted">
                    This can take a minute or two, and anything you type before it lands would be replaced.
                  </p>
                ) : null}

                {extractError ? (
                  <p role="alert" className="type-caption text-pen">
                    {extractError}
                  </p>
                ) : null}

                {extraction ? (
                  <>
                    {/* Two rows, never merged. Each names where its step ran, on the row rather than
                      only in the helper text above, so the panel is unambiguous in a photograph
                      taken without it. */}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                      {transcriptionLine(extraction.transcription) ? (
                        <>
                          <dt className="type-mono text-ink-muted">Read by</dt>
                          <dd className="m-0">
                            <span className="type-mono break-words">{transcriptionLine(extraction.transcription)}</span>
                            <span className="type-caption block text-ink-muted">Outside the Gonka network</span>
                          </dd>
                        </>
                      ) : null}
                      <dt className="type-mono text-ink-muted">Structured by</dt>
                      <dd className="m-0">
                        <span className="type-mono break-words">
                          {extraction.servedModel} · {extraction.requestId}
                        </span>
                        <span className="type-caption block text-ink-muted">
                          Gonka request id, receipt {extraction.receiptStatus}
                        </span>
                      </dd>
                    </dl>

                    {extraction.warnings.length > 0 ? (
                      <div>
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
              </CardBody>

              {/* Outside the guest card on purpose: an upload fills the form for any account, and the
                one control that empties it again cannot be the one behind a gate. This card is the
                one both fill paths have in common. */}
              {prefilled ? (
                <div className="card-foot">
                  <button type="button" onClick={clearForm} className="btn btn-ghost btn-sm">
                    Clear the Form
                  </button>
                </div>
              ) : null}
            </Card>

            <Card>
              <CardHead title="The Paper" description="What the readers are told before they see a single question." />
              <CardBody>
                <Field label="Assessment Title" htmlFor="title" error={errorFor('title')}>
                  <input id="title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Subject" htmlFor="subject" error={errorFor('subject')}>
                    <input
                      id="subject"
                      className={inputClass}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </Field>
                  <Field label="Language" htmlFor="language" error={errorFor('language')}>
                    <Select
                      id="language"
                      label="Language"
                      value={language}
                      options={LANGUAGES}
                      onChange={setLanguage}
                    />
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
              </CardBody>
            </Card>

            {errorFor('items') ? (
              <p role="alert" className="type-caption text-pen">
                {errorFor('items')}
              </p>
            ) : null}

            {items.map((item, index) => (
              <fieldset key={item.id} className="question-block m-0 border-0 p-0">
                <legend className="sr-only">Question {index + 1}</legend>
                <div className="question-head">
                  <span className="type-eyebrow text-ink-muted">Question {index + 1}</span>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    >
                      <TrashIcon size={15} />
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="question-body">
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
                          <span className="type-mono w-4 shrink-0 text-ink-muted">{option.letter}</span>
                          <input
                            id={`option-${index}-${optionIndex}`}
                            aria-label={`Question ${index + 1}, option ${option.letter}`}
                            className={inputClass}
                            value={option.text}
                            onChange={(e) =>
                              patchItem(index, {
                                options: item.options.map((o, i) =>
                                  i === optionIndex ? { ...o, text: e.target.value } : o
                                )
                              })
                            }
                          />
                          {item.options.length > 2 ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`Remove option ${option.letter} from question ${index + 1}`}
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
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          patchItem(index, {
                            options: relabel([...item.options, { letter: '', text: '' }])
                          })
                        }
                      >
                        <PlusIcon size={15} />
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
              </fieldset>
            ))}

            <div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setItems((current) => [...current, emptyItem()])}
              >
                <PlusIcon size={15} />
                Add Question
              </button>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Card className="sticky-rail">
              <CardHead title="Before You Send" />
              <CardBody>
                <dl className="fact-list type-ui">
                  <dt className="type-caption">Questions</dt>
                  <dd className="type-mono">{items.length}</dd>
                  <dt className="type-caption">Keys set</dt>
                  <dd className="type-mono">
                    {keyed} of {items.length}
                  </dd>
                  <dt className="type-caption">Readings</dt>
                  <dd className="type-mono">{items.length * 2}</dd>
                </dl>
                <p className="type-caption text-ink-muted">
                  Two readings per question, one from each family, and each one carries its own Gonka request id. Your
                  key is never sent with the question.
                </p>
              </CardBody>
              <div className="card-foot">
                <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                  {submitting ? 'Submitting' : 'Submit Check'}
                </button>
                {errorFor('form') ? (
                  <p role="alert" className="type-caption text-pen">
                    {errorFor('form')}
                  </p>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
