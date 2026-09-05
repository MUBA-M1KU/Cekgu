import type { ReactNode } from 'react'

/**
 * Level 1, the surface every working screen is built from.
 *
 * One card is one concern. The single 71.5 rem sheet this replaces held a whole page inside it,
 * which reads as a document: right for the record workspace, wrong for a dashboard, a library and
 * a settings screen, where a reader needs to see where one concern stops.
 *
 * `flush` is for a card whose content runs to its own edges, a table or a list of rows. The rows
 * then supply the horizontal padding, so the hairlines and the hover band reach the border
 * instead of stopping inside it.
 */
type CardProps = {
  children: ReactNode
  className?: string
  flush?: boolean
}

export function Card({ children, className, flush }: CardProps) {
  return (
    <section className={`card${flush ? ' card-flush' : ''}${className ? ` ${className}` : ''}`}>{children}</section>
  )
}

type HeadProps = {
  /** TitleCase: a card title names a thing. DESIGN.md Capitalisation. */
  title: string
  /** Sentence case, and only when it tells the reader something the title does not. */
  description?: string
  /** The card's own control, at the trailing edge of its header. At most one. */
  action?: ReactNode
  /** Card titles are h2 on a page whose h1 is the page header, h3 inside a section. */
  as?: 'h2' | 'h3'
}

export function CardHead({ title, description, action, as: Tag = 'h2' }: HeadProps) {
  return (
    <header className="card-head">
      <div className="min-w-0">
        <Tag className="card-title">{title}</Tag>
        {description ? <p className="type-caption card-desc">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`card-body${className ? ` ${className}` : ''}`}>{children}</div>
}
