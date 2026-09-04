import type { Option } from '../../shared/types'

type Props = {
  options: Option[]
  /** The key printed on the paper. Drawn filled. */
  keyLetter: string | null
  /** What reader A committed to. Drawn as an inner ring. */
  readerA?: string | null
  /** What reader B committed to. Drawn as an outer ring. */
  readerB?: string | null
  /**
   * Drop the options nobody marked. In the hero card the row competes with the stem for width and
   * the untouched options carry nothing, so only the key and the two answers are drawn.
   */
  condensed?: boolean
}

function sentence(options: Option[], keyLetter: string | null, a?: string | null, b?: string | null): string {
  const parts = [keyLetter ? `Key ${keyLetter}.` : 'No key.']
  if (a && b) parts.push(a === b ? `Both readers chose ${a}.` : `Reader A chose ${a}, reader B chose ${b}.`)
  else if (a) parts.push(`Reader A chose ${a}. Reader B has no admitted reading.`)
  else if (b) parts.push(`Reader B chose ${b}. Reader A has no admitted reading.`)
  else if (options.length > 0) parts.push('No reading has been admitted yet.')
  return parts.join(' ')
}

// One row of option letters carrying three facts at once: which one you keyed, and which one each
// reader committed to. A key error is then a single glyph — a filled A beside a double-ringed B —
// rather than three stacked bubble rows a reader has to compare by eye. The row is a picture of a
// state that is also written out beside it, so it carries one sentence for assistive technology
// rather than fifteen separately-labelled circles.
export function ReadRow({ options, keyLetter, readerA, readerB, condensed }: Props) {
  const marked = condensed
    ? options.filter((option) => option.letter === keyLetter || option.letter === readerA || option.letter === readerB)
    : options

  return (
    <div className="read-row" role="img" aria-label={sentence(options, keyLetter, readerA, readerB)}>
      {marked.map((option) => (
        <span
          key={option.letter}
          aria-hidden="true"
          className="slot"
          data-key={option.letter === keyLetter ? 'true' : undefined}
          data-reader-a={option.letter === readerA ? 'true' : undefined}
          data-reader-b={option.letter === readerB ? 'true' : undefined}
        >
          {option.letter}
        </span>
      ))}
    </div>
  )
}
