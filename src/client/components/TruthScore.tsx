import type { CSSProperties } from 'react'
import { scoreBand } from '../../shared/truth-score'
import type { Corroboration, RecordScore } from '../../shared/types'

// The track brief's Truth Score. It is a proportion, so it is the one place in this product where a
// bar is honest: the length is the number, not decoration. DESIGN.md forbids a chart with nothing
// behind it, and every pixel of this one is the reader agreement the receipts below it prove.

const BAND_TOKEN = {
  strong: '--verdict-clear',
  mixed: '--verdict-key-error',
  weak: '--pen'
} as const

// No new colours. A score reuses the token of the verdict it tends to travel with, so the rail and
// the item rows below it never disagree about what amber means.
const tint = (score: number): CSSProperties => ({ '--score': `var(${BAND_TOKEN[scoreBand(score)]})` }) as CSSProperties

/**
 * What live retrieval found, in a sentence.
 *
 * `retrieved: 0` is silence, not a finding, so it renders nothing at all: a record checked before
 * retrieval existed, or on a deployment without the key, must not carry a line implying the web was
 * consulted and had nothing to say.
 */
function CorroborationLine({ tally }: { tally: Corroboration }) {
  if (!tally.retrieved) return null

  // Contradiction leads when there is any, because it is the only one of the three that asks the
  // educator to do something.
  const text = tally.contradicted
    ? `The web pointed away from the readers on ${tally.contradicted} of ${tally.retrieved} checked ${tally.retrieved === 1 ? 'item' : 'items'}.`
    : tally.supported
      ? `The web backed both readers on ${tally.supported} of ${tally.retrieved} checked ${tally.retrieved === 1 ? 'item' : 'items'}.`
      : `The web was searched on ${tally.retrieved} ${tally.retrieved === 1 ? 'item' : 'items'} and settled none of them.`

  return <p className="type-caption truth-score-basis">{text}</p>
}

/** The record's headline score, for the summary rail. */
export function TruthScoreSummary({ score, tally }: { score: RecordScore; tally?: Corroboration }) {
  if (score.score === null) {
    return (
      <div className="truth-score">
        <p className="type-label truth-score-caption">Truth Score</p>
        <p className="truth-score-empty">
          No item has two verified readings yet, so there is no score. An unread paper is not a failing one.
        </p>
      </div>
    )
  }

  return (
    <div className="truth-score" style={tint(score.score)}>
      <p className="type-label truth-score-caption">Truth Score</p>
      <p className="truth-score-figure">
        {score.score}
        <span className="truth-score-of">/100</span>
      </p>
      <div className="truth-score-track" aria-hidden="true">
        <span className="truth-score-fill" style={{ inlineSize: `${score.score}%` }} />
      </div>
      {/* The denominator travels with the number on purpose. Three verified items out of twelve can
          average 100, and printing that alone would describe nine items nobody read. */}
      <p className="type-caption truth-score-basis">
        How much of the verified reader agreement backs your keys, across {score.scored} of {score.total}{' '}
        {score.total === 1 ? 'item' : 'items'}.
      </p>
      {tally ? <CorroborationLine tally={tally} /> : null}
    </div>
  )
}

/** One item's score, sized to sit beside its verdict chip rather than compete with it. */
export function TruthScoreMark({ score, className }: { score: number | null; className?: string }) {
  // Unverified already says so in the chip beside this. A dash here would read as a low score.
  if (score === null) return null

  // The denominator rather than a second bar. Twelve mini bars down a page is noise, and a bare
  // figure beside a verdict has to be guessed at; "88/100" says what it is without a legend, and
  // echoes the summary figure above it.
  return (
    <span className={`truth-score-mark type-mono${className ? ` ${className}` : ''}`} style={tint(score)}>
      <span className="sr-only">Truth Score </span>
      <span className="truth-score-mark-value">{score}</span>
      <span className="truth-score-mark-of">/100</span>
    </span>
  )
}
