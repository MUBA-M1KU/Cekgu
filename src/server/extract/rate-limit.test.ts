import { describe, expect, test } from 'bun:test'
import { RateLimiter } from './rate-limit'

const at = (value: { now: number }) => () => value.now

describe('the window', () => {
  test('allows up to the limit and refuses the next', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(3, 1000, at(clock))

    expect(limiter.take('a').allowed).toBe(true)
    expect(limiter.take('a').allowed).toBe(true)
    expect(limiter.take('a').allowed).toBe(true)
    expect(limiter.take('a').allowed).toBe(false)
  })

  test('the refusal says how long to wait, rounded up', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(1, 1000, at(clock))

    limiter.take('a')
    clock.now = 400
    const refused = limiter.take('a')
    expect(refused.allowed).toBe(false)
    expect(refused.allowed === false && refused.retryAfterSeconds).toBe(1)
  })

  test('a caller told to wait n seconds is allowed after n seconds', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(1, 1000, at(clock))

    limiter.take('a')
    clock.now = 1000
    expect(limiter.take('a').allowed).toBe(true)
  })

  test('the window resets rather than sliding, so a full window is a clean slate', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(2, 1000, at(clock))

    limiter.take('a')
    limiter.take('a')
    expect(limiter.take('a').allowed).toBe(false)
    clock.now = 1001
    expect(limiter.take('a').allowed).toBe(true)
    expect(limiter.take('a').allowed).toBe(true)
  })
})

describe('keys are independent', () => {
  test('one caller exhausting their budget does not refuse another', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(1, 1000, at(clock))

    expect(limiter.take('a').allowed).toBe(true)
    expect(limiter.take('a').allowed).toBe(false)
    // The shared Guest account is one key, so guests share a budget by design; a private account
    // must not inherit that.
    expect(limiter.take('b').allowed).toBe(true)
  })
})

describe('the map does not grow without bound', () => {
  test('expired windows are dropped once the map is large', () => {
    const clock = { now: 0 }
    const limiter = new RateLimiter(1, 1000, at(clock))

    for (let i = 0; i < 600; i += 1) limiter.take(`key-${i}`)
    clock.now = 5000
    // The sweep runs on the next write; every earlier window has expired by now, so the one that
    // triggers it should still be allowed and the rest collected.
    expect(limiter.take('fresh').allowed).toBe(true)
    expect(limiter.take('key-0').allowed).toBe(true)
  })
})
