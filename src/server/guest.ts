import { and, count, eq, isNull, lt } from 'drizzle-orm'
import {
  type CreateRecordInput,
  GUEST_MAX_ITEM_CHARS,
  GUEST_MAX_ITEMS,
  GUEST_MAX_RECORDS,
  itemCharCount
} from '../shared/schemas'
import type { ApiError } from '../shared/types'
import { db } from './db'
import { user } from './db/auth-schema'
import { records } from './db/schema'
import { env } from './env'

const GUEST_RECORD_TTL_MS = 24 * 60 * 60 * 1000
export const SWEEP_INTERVAL_MS = 5 * 60 * 1000

// FR-AUTH-4. Private records leave this null, which is also what keeps them out of the sweep below.
export function guestExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + GUEST_RECORD_TTL_MS)
}

// FR-AUTH-5, enforced on the server rather than only in the form. The count is passed in rather than
// queried here so the limits stay a pure function; call guestRecordsHeld for it.
export function guestLimitRejection(input: CreateRecordInput, recordsHeld: number): ApiError['error'] | null {
  if (input.items.length > GUEST_MAX_ITEMS) {
    const over = input.items.length - GUEST_MAX_ITEMS
    return {
      code: 'guest_item_limit',
      message: `The Guest workspace takes ${GUEST_MAX_ITEMS} questions per check. Remove ${over} and try again, or sign in with an account.`
    }
  }

  const oversized = input.items.findIndex((item) => itemCharCount(item) > GUEST_MAX_ITEM_CHARS)
  if (oversized >= 0) {
    return {
      code: 'guest_size_limit',
      message: `Question ${oversized + 1} runs past ${GUEST_MAX_ITEM_CHARS} characters across its stem and options. Shorten it and try again.`
    }
  }

  if (recordsHeld >= GUEST_MAX_RECORDS) {
    return {
      code: 'guest_record_limit',
      message: `The Guest workspace already holds ${GUEST_MAX_RECORDS} records. Delete one from Records, or wait for the oldest to expire.`
    }
  }

  return null
}

export async function guestRecordsHeld(userId: string): Promise<number> {
  const [row] = await db
    .select({ held: count() })
    .from(records)
    .where(and(eq(records.userId, userId), eq(records.isSample, false), isNull(records.deletedAt)))

  return row?.held ?? 0
}

// FR-AUTH-4 and FR-SAMPLE-2. A hard delete, because Guest carries no recovery promise; items,
// attempts and dispositions go with it through the cascade.
//
// Scoped to the Guest user rather than to expires_at alone. Deleting every non-sample row with a
// past expiry would rest on "a non-null expires_at means a Guest record", which nothing in the
// schema enforces — and FR-RECORD-7 purges soft-deleted private records after 30 days, so the
// obvious implementation of that would hand this function real accounts to destroy.
export async function sweepExpiredGuestRecords(now: Date = new Date()): Promise<string[]> {
  const guestId = await guestUserId()
  if (!guestId) return []

  const swept = await db
    .delete(records)
    .where(and(eq(records.userId, guestId), eq(records.isSample, false), lt(records.expiresAt, now)))
    .returning({ id: records.id })

  return swept.map((row) => row.id)
}

async function guestUserId(): Promise<string | null> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, env.guestEmail)).limit(1)
  return row?.id ?? null
}

export function startGuestSweep(intervalMs: number = SWEEP_INTERVAL_MS): Timer {
  const timer = setInterval(async () => {
    try {
      const swept = await sweepExpiredGuestRecords()
      if (swept.length > 0) console.log(`swept ${swept.length} expired guest records`)
    } catch (error) {
      console.error('guest sweep failed', error)
    }
  }, intervalMs)

  timer.unref()
  return timer
}
