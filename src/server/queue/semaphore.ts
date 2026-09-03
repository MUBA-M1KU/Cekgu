// TRD section 13: never tell the gateway to do more than four things at once. Measured on
// 3 September, a 36-call fan-out was refused with account-level 429s and a wave of four was accepted.

export class Semaphore {
  private inFlight = 0
  private readonly waiting: (() => void)[] = []

  constructor(private readonly limit: number) {}

  async acquire(): Promise<() => void> {
    if (this.inFlight < this.limit) {
      this.inFlight += 1
    } else {
      // A releaser hands its slot straight to the next waiter, so inFlight is already correct here.
      await new Promise<void>((resolve) => this.waiting.push(resolve))
    }

    // Guarded because a caller with an error path and a finally can release twice, and a second
    // release frees a slot nobody took — five calls in flight against a cap of four.
    let released = false
    return () => {
      if (released) return
      released = true
      this.release()
    }
  }

  private release(): void {
    const next = this.waiting.shift()
    if (next) {
      next()
      return
    }
    this.inFlight -= 1
  }

  get held(): number {
    return this.inFlight
  }
}

export const gatewaySemaphore = new Semaphore(4)
