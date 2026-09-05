import type { ToolEvent } from '../api'

/** A trace entry carries its own id: the same tool may be called twice in one turn, so neither the
 *  name nor the position identifies a row, and the list index is not a key. */
export type TracedTool = ToolEvent & { id: string }

/**
 * What the agent is doing, while it is doing it.
 *
 * This is the difference between an agent and a chatbot made visible: a grounded answer that
 * appears with no account of how it was found asks to be taken on trust, which is the one thing
 * this product does not do. The trace shows the lookups as they happen and then gets out of the
 * way — the caller unmounts it the moment the answer lands, leaving the bubble and its citation
 * pills, which are the durable record of the same thing.
 */
const LABEL: Record<string, (position: number | null) => string> = {
  record_summary: () => 'Reading the record summary',
  list_items: () => 'Listing every question',
  get_item: (position) => (position ? `Opening question ${position}` : 'Opening a question'),
  get_readings: (position) => (position ? `Reading both seats on question ${position}` : 'Reading both seats'),
  get_attempts: (position) => (position ? `Checking every attempt on question ${position}` : 'Checking the attempts')
}

function describe(event: ToolEvent): string {
  return LABEL[event.name]?.(event.position) ?? event.name
}

export function ToolTrace({ events }: { events: TracedTool[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-1 p-0">
      {events.map((event) => (
        <li key={event.id} className="type-caption flex items-center gap-2 text-ink-muted">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink-muted" />
          {describe(event)}
        </li>
      ))}

      <li className="type-caption flex items-center gap-2 text-ink-muted">
        <span aria-hidden="true" className="size-1.5 shrink-0 animate-pulse rounded-full bg-pen" />
        {events.length === 0 ? 'Reading the record…' : 'Writing the answer…'}
      </li>
    </ol>
  )
}
