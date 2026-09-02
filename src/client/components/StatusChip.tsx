import type { ItemStatus, RecordStatus } from '../../shared/types'

const LABELS: Record<RecordStatus | ItemStatus, string> = {
  queued: 'Queued',
  checking: 'Checking',
  ready: 'Ready',
  in_review: 'In Review',
  resolved: 'Resolved',
  running: 'Running',
  done: 'Complete'
}

export function statusLabel(status: RecordStatus | ItemStatus): string {
  return LABELS[status]
}

// Status carries no colour: it is a fact about progress, not a judgment. DESIGN.md Components.
export function StatusChip({ status, detail }: { status: RecordStatus | ItemStatus; detail?: string }) {
  return (
    <span className="status-chip type-label">
      {LABELS[status]}
      {detail ? <span className="type-mono text-ink-muted">{detail}</span> : null}
    </span>
  )
}
