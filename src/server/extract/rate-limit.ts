// #295. Both extraction routes do unbounded work for a caller who is authenticated only in the
// weakest sense: POST /api/auth/guest is public, so a session costs one request. Behind them sits a
// URL fetch and then structurePaper, which spends real gateway calls under a 100 second ceiling, and
// AGENTS.md forbids burning GonkaRouter tokens.
//
// A fixed window rather than a token bucket: the thing being protected is a slow, expensive call, so
// the smoothness a bucket buys is worth less than being able to read the rule off the code. In
// memory rather than in Postgres because Cloud Run runs this at min-instances 1, max-instances 1
// (TRD section 10) — one process, one counter. That is a real constraint and not an assumption, so
// it is asserted in the comment where a second instance would break it.

export type Clock = () => number

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 6

type Window = { count: number; resetAt: number }

export class RateLimiter {
  private readonly windows = new Map<string, Window>()

  constructor(
    private readonly max: number = MAX_PER_WINDOW,
    private readonly windowMs: number = WINDOW_MS,
    private readonly now: Clock = Date.now
  ) {}

  /** Whether this key may proceed, and how long it must wait if not. */
  take(key: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const at = this.now()
    const open = this.windows.get(key)

    if (!open || at >= open.resetAt) {
      this.windows.set(key, { count: 1, resetAt: at + this.windowMs })
      this.sweep(at)
      return { allowed: true }
    }

    if (open.count >= this.max) {
      // Rounded up, so a caller told to wait one second never comes back to another refusal.
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((open.resetAt - at) / 1000)) }
    }

    open.count += 1
    return { allowed: true }
  }

  /**
   * Drop windows that have already expired.
   *
   * Without this the map is a slow leak keyed on user id, which on a long-lived single instance is
   * exactly the process that never restarts. Swept on write rather than on a timer so nothing has to
   * be torn down in tests.
   */
  private sweep(at: number): void {
    if (this.windows.size < 512) return
    for (const [key, window] of this.windows) {
      if (at >= window.resetAt) this.windows.delete(key)
    }
  }
}

/** One limiter for both extraction routes, so a caller cannot double their budget by alternating. */
export const extractLimiter = new RateLimiter()
