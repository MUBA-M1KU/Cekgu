import { and, eq, isNotNull, isNull, lt } from 'drizzle-orm'
import { RETENTION_DAYS, TRASH_DAYS } from '../shared/schemas'
import { db } from './db'
import { records } from './db/schema'

const DAY_MS = 24 * 60 * 60 * 1000

// Hard deletes in both directions, because what the notice promises is that the data is gone.
// The sample is exempt: it is the product's own fixture rather than anyone's data (FR-SAMPLE-2).
// Guest records need no retention pass here, since sweepExpiredGuestRecords already takes them at
// 24 hours, which is the shorter promise.
export async function sweepRetiredRecords(now: Date = new Date()): Promise<{ purged: string[]; retired: string[] }> {
  const purged = await db
    .delete(records)
    .where(
      and(
        eq(records.isSample, false),
        isNotNull(records.deletedAt),
        lt(records.deletedAt, new Date(now.getTime() - TRASH_DAYS * DAY_MS))
      )
    )
    .returning({ id: records.id })

  const retired = await db
    .delete(records)
    .where(
      and(
        eq(records.isSample, false),
        isNull(records.deletedAt),
        lt(records.updatedAt, new Date(now.getTime() - RETENTION_DAYS * DAY_MS))
      )
    )
    .returning({ id: records.id })

  return { purged: purged.map((row) => row.id), retired: retired.map((row) => row.id) }
}

// Hourly rather than on the five-minute guest cadence. The shortest window this touches is thirty
// days, so a finer interval would only add queries.
export const RETENTION_SWEEP_INTERVAL_MS = 60 * 60 * 1000

export function startRetentionSweep(intervalMs: number = RETENTION_SWEEP_INTERVAL_MS): Timer {
  const timer = setInterval(async () => {
    try {
      const { purged, retired } = await sweepRetiredRecords()
      if (purged.length + retired.length > 0) {
        console.log(
          `retention sweep: purged ${purged.length} from trash, retired ${retired.length} past ${RETENTION_DAYS} days`
        )
      }
    } catch (error) {
      console.error('retention sweep failed', error)
    }
  }, intervalMs)

  timer.unref()
  return timer
}
