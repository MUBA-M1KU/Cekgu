import type { CSSProperties } from 'react'

/**
 * Three chart forms, no library.
 *
 * Every one of them is a labelled row: the name and the number are text in the DOM before any
 * colour is applied, so the chart still reads with the palette switched off, in a screenshot, or
 * to a screen reader. That is also why none of them carries a hover tooltip. A tooltip exists to
 * hold what direct labels could not, and here there is nothing left over.
 */

/** A single ratio against a limit. Not a donut: a two-slice pie is the number, drawn badly. */
export function Meter({ value, total, label }: { value: number; total: number; label: string }) {
  const share = total > 0 ? value / total : 0

  return (
    <div role="img" aria-label={`${label}: ${value} of ${total}, ${Math.round(share * 100)} percent`} className="meter">
      <div className="meter-fill" style={{ width: `${Math.max(share * 100, share > 0 ? 1 : 0)}%` }} />
    </div>
  )
}

type BarProps = {
  label: string
  value: number
  /** The bar's own scale. Bars in one list share a max, or none of them mean anything together. */
  max: number
  /** What the number is, printed at the row's trailing edge. */
  detail?: string
  /** A CSS colour for the fill. Omitted, the bar is ink. */
  fill?: string
  /** Rendered in place of the plain label, so a verdict can bring its chip. */
  labelNode?: React.ReactNode
}

/** One labelled horizontal bar. The label carries the identity; the fill only reinforces it. */
export function Bar({ label, value, max, detail, fill, labelNode }: BarProps) {
  const width = max > 0 ? (value / max) * 100 : 0

  return (
    <li className="chart-row">
      <div className="chart-row-label type-label">{labelNode ?? label}</div>
      <div className="chart-row-value type-mono">{detail ?? value}</div>
      <div className="chart-track">
        <div
          className="chart-fill"
          style={{
            width: `${Math.max(width, value > 0 ? 1.5 : 0)}%`,
            ...(fill ? ({ '--fill': fill } as CSSProperties) : {})
          }}
        />
      </div>
    </li>
  )
}

export function BarList({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <ul className="chart-rows" aria-label={label}>
      {children}
    </ul>
  )
}
