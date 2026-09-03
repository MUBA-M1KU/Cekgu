import { Link } from 'react-router'
import type { Item, RecordDetail } from '../../../shared/types'
import { verdictLabel } from '../../components/VerdictChip'

const META = ['No sign-up to try', 'Every reading carries a receipt', 'Your key is never shown to a model']

// Three rows, because the card is a glance rather than the report. The full record is one click
// away at /sample and the whole of it is on this page under Sample Report.
const ROWS = 3

function firstRequestId(item: Item): string | null {
  return item.attempts.find((attempt) => attempt.requestId !== null)?.requestId ?? null
}

function VerdictDot({ verdict }: { verdict: Item['verdict'] }) {
  const token =
    verdict === 'clear'
      ? '--verdict-clear'
      : verdict === 'possible_key_error'
        ? '--verdict-key-error'
        : verdict === 'possible_ambiguity'
          ? '--verdict-ambiguity'
          : verdict === 'split_opinion'
            ? '--verdict-split'
            : '--verdict-unverified'

  return (
    <span
      aria-hidden="true"
      className="h-[0.4375rem] w-[0.4375rem] shrink-0 rounded-bubble"
      style={{ background: `var(${token})` }}
    />
  )
}

// The card proves the product on the page rather than describing it, so it reads the real sample
// rather than a fixture. Its height is reserved either way, so the hero never reflows around it.
function LiveCard({ record }: { record: RecordDetail | null }) {
  const rows = record?.items.slice(0, ROWS) ?? []
  const requestId = rows.map(firstRequestId).find((id) => id !== null) ?? null

  return (
    <div className="hero-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="type-eyebrow text-ink-muted">Introductory CS Practice Set</p>
        <span className="type-caption text-ink-muted">{record ? 'Ready' : 'Loading'}</span>
      </div>

      <div className="min-h-[9.75rem]">
        {rows.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-t border-rule py-[0.6rem]">
            <VerdictDot verdict={item.verdict} />
            <p className="type-body min-w-0 flex-1 truncate">{item.stem}</p>
            <span className="sr-only">{verdictLabel(item.verdict)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-rule pt-3">
        <span className="type-mono truncate text-ink-muted">{requestId ?? 'Reading the sample'}</span>
        {requestId ? <span className="type-mono text-[var(--verdict-clear)]">verified</span> : null}
      </div>
    </div>
  )
}

export function Hero({ record }: { record: RecordDetail | null }) {
  return (
    <section className="hero">
      <div className="hero-media">
        {/* Poster and the container's own gradient both draw the same frame, so the hero is
            composed before a byte of video arrives and if it never does. */}
        {/* tabIndex -1 alongside aria-hidden: a media element counts as focusable, and hiding a
            focusable element from assistive technology is the defect the rule is about. */}
        <video autoPlay muted loop playsInline tabIndex={-1} poster="/hero/hero-poster.jpg" aria-hidden="true">
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-scrim" />

      <div className="hero-body wrap grid w-full grid-cols-1 items-center gap-12 pt-12 pb-[11rem] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-20">
        <div>
          <span className="hero-badge type-mono">Two readers · every question · before publication</span>
          <h1 className="mt-6 max-w-[15ch] text-[clamp(2.75rem,5.6vw,4.75rem)]/[1.05] tracking-[-0.03em]">
            Two readers see your paper before your learners do.
          </h1>
          <p className="type-lead mt-6 max-w-[38ch] text-[clamp(1.0625rem,1.35vw,1.25rem)]/[1.58] text-ink-muted">
            Cekgu withholds your answer key and asks two independent models to sit every question blind. Where they
            agree with each other and disagree with you, that is worth a second look.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/sign-in"
              className="inline-flex h-[2.875rem] items-center rounded-bubble bg-ink px-6 font-medium text-on-ink"
            >
              Try Cekgu Free
            </Link>
            <a
              href="#sample"
              className="inline-flex h-[2.875rem] items-center rounded-bubble border-[1.5px] border-rule-strong px-6 font-medium"
            >
              See a Real Report
            </a>
          </div>

          <ul className="type-mono mt-9 m-0 flex flex-wrap gap-x-7 gap-y-3 p-0 list-none text-[0.75rem] text-ink-muted">
            {META.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-[0.4375rem] w-[0.4375rem] rounded-bubble bg-ink-muted" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <LiveCard record={record} />
      </div>

      <img className="hero-cat" src="/mascots/hijiki-ledge.png" alt="" aria-hidden="true" />
    </section>
  )
}
