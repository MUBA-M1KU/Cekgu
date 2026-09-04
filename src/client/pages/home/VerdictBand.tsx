import type { ItemVerdict, RecordDetail } from '../../../shared/types'

// The figure is the verdict drawn rather than named: two filled circles where the readers agreed,
// two halves where each found more than one answer it could defend, a solid beside a faded one
// where they disagreed, a dashed outline where a reading never arrived.
// `id` because a figure can hold the same fill twice, so the fill alone does not identify one.
type Mark = { id: string; fill: 'full' | 'half' | 'faint' | 'none' }

const FIELDS: { verdict: ItemVerdict; title: string; meaning: string; figure: Mark[]; token: string }[] = [
  {
    verdict: 'possible_key_error',
    title: 'Possible Key Error',
    meaning: 'Both readers agreed on an option that is not the one you keyed.',
    figure: [
      { id: 'a', fill: 'full' },
      { id: 'b', fill: 'full' }
    ],
    token: '--verdict-key-error'
  },
  {
    verdict: 'possible_ambiguity',
    title: 'Possible Ambiguity',
    meaning: 'Each reader found more than one option it could defend.',
    figure: [
      { id: 'a', fill: 'half' },
      { id: 'b', fill: 'half' }
    ],
    token: '--verdict-ambiguity'
  },
  {
    verdict: 'split_opinion',
    title: 'Split Opinion',
    meaning: 'The two readers disagreed with each other. The machine has no opinion to offer.',
    figure: [
      { id: 'a', fill: 'full' },
      { id: 'b', fill: 'faint' }
    ],
    token: '--verdict-split'
  },
  {
    verdict: 'unverified',
    title: 'Unverified',
    meaning: 'Fewer than two readings survived verification, so Cekgu says nothing.',
    figure: [{ id: 'a', fill: 'none' }],
    token: '--verdict-unverified'
  },
  {
    verdict: 'clear',
    title: 'Clear',
    meaning:
      'Both readers chose your key. Nothing is being asked of you. It never means the question is certified correct.',
    figure: [{ id: 'a', fill: 'full' }],
    token: '--verdict-clear'
  }
]

// The counts are the sample record's own, so the band is a reading of a real paper rather than a
// legend with decorative numbers. Before the record arrives the count is simply absent; a zero
// would be a claim about a paper nobody has read yet.
export function VerdictBand({ record }: { record: RecordDetail | null }) {
  function count(verdict: ItemVerdict): number | null {
    if (!record) return null
    return record.items.filter((item) => item.verdict === verdict).length
  }

  return (
    <section className="fields" aria-label="The five verdicts">
      {FIELDS.map((field) => {
        const n = count(field.verdict)
        return (
          <div key={field.verdict} className="field-v" style={{ background: `var(${field.token})` }}>
            <div className="figure" aria-hidden="true">
              {field.figure.map((mark) => (
                <span key={mark.id} data-fill={mark.fill} />
              ))}
            </div>
            <h3 className="text-[1.0625rem]">{field.title}</h3>
            <p className="type-body mt-[0.55rem] max-w-[34ch] text-[0.9375rem]/[1.5] opacity-[0.88]">{field.meaning}</p>
            {n === null ? null : (
              <>
                {/* The number is a graphic at 36 px in the corner; the sentence beside it is what
                    a screen reader needs, because "2" alone says nothing about what it counts. */}
                <span className="count" aria-hidden="true">
                  {n}
                </span>
                <span className="sr-only">
                  {n} of the {record?.items.length ?? 0} items in the sample report.
                </span>
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
