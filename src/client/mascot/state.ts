import type { Item, ItemVerdict, RecordDetail } from '../../shared/types'

export const MASCOT_STATES = ['idle', 'checking', 'agreement', 'attention', 'split', 'unverified', 'resolved'] as const

export type MascotState = (typeof MASCOT_STATES)[number]

const ATTENTION: ItemVerdict[] = ['possible_key_error', 'possible_ambiguity']

function landedVerdicts(previous: RecordDetail, next: RecordDetail): ItemVerdict[] {
  const before = new Map<string, Item>(previous.items.map((item) => [item.id, item]))

  return next.items
    .filter((item) => before.get(item.id)?.verdict === 'pending' && item.verdict !== 'pending')
    .map((item) => item.verdict)
}

// Status is read before any item is compared, so a resolved or still-running record reports itself
// even on a cold open. That also answers the disposition rule without a branch of its own: a
// disposition that finishes the record is caught by the status check, and one that does not leaves
// the cats idle. Below the status check every state is a reaction to a change between two
// snapshots, and a record opened cold has no earlier snapshot to react to.
export function deriveMascotState(previous: RecordDetail | null, next: RecordDetail): MascotState {
  if (next.status === 'resolved') return 'resolved'
  if (next.status === 'queued' || next.status === 'checking') return 'checking'
  if (previous === null) return 'idle'

  const landed = landedVerdicts(previous, next)
  if (landed.includes('split_opinion')) return 'split'
  if (landed.some((verdict) => ATTENTION.includes(verdict))) return 'attention'
  if (landed.includes('unverified')) return 'unverified'
  if (landed.includes('clear')) return 'agreement'

  return 'idle'
}
