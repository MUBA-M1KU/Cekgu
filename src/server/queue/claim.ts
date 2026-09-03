import { and, eq, lt, sql } from 'drizzle-orm'
import { db } from '../db'
import { items } from '../db/schema'

// Longer than the worst-case round: two seats, three families, three attempts each at a 90-second
// cutoff. A claim younger than this belongs to an instance that may still be working it.
export const CLAIM_LEASE_MS = 15 * 60 * 1000

// TRD section 13. SKIP LOCKED is the whole point: a second worker, or the same worker after a
// crash-restart, never claims an item another loop already holds.

export type ClaimedItem = {
  id: string
  recordId: string
  position: number
  stem: string
  options: { letter: string; text: string }[]
  key: string
}

export async function claimNextItem(): Promise<ClaimedItem | null> {
  const claimed = await db.execute(sql`
    UPDATE items SET status = 'running', claimed_at = now()
    WHERE id = (
      SELECT id FROM items WHERE status = 'queued'
      ORDER BY record_id, position
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, record_id, position, stem, options, key
  `)

  const row = claimed.rows[0] as Record<string, unknown> | undefined
  if (!row) return null

  return {
    id: String(row.id),
    recordId: String(row.record_id),
    position: Number(row.position),
    stem: String(row.stem),
    options: row.options as { letter: string; text: string }[],
    key: String(row.key)
  }
}

// A Cloud Run restart mid-round leaves items in `running` with nobody to finish them.
//
// Scoped by lease rather than releasing everything running. A deploy overlaps two instances: the new
// revision passes its health check while the outgoing one is still mid-round, and an unscoped
// release would re-queue items it is actively working. Those get claimed twice, the gateway is
// called twice for one item, and the attempts table gains rows that describe no real second opinion.
export async function releaseStaleClaims(now = new Date(), leaseMs = CLAIM_LEASE_MS): Promise<number> {
  const cutoff = new Date(now.getTime() - leaseMs)

  const released = await db
    .update(items)
    .set({ status: 'queued', claimedAt: null })
    .where(and(eq(items.status, 'running'), lt(items.claimedAt, cutoff)))
    .returning({ id: items.id })

  return released.length
}
