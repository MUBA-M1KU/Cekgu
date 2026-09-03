import { eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { items } from '../db/schema'

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
    UPDATE items SET status = 'running'
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
export async function releaseRunningItems(): Promise<number> {
  const released = await db
    .update(items)
    .set({ status: 'queued' })
    .where(eq(items.status, 'running'))
    .returning({ id: items.id })

  return released.length
}
