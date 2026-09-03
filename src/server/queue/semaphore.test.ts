import { expect, test } from 'bun:test'
import { gatewaySemaphore, Semaphore } from './semaphore'

test('the gateway semaphore caps in-flight calls at four', async () => {
  const releases = await Promise.all(Array.from({ length: 4 }, () => gatewaySemaphore.acquire()))

  expect(gatewaySemaphore.held).toBe(4)
  for (const release of releases) release()
  expect(gatewaySemaphore.held).toBe(0)
})

test('a fifth caller waits until a slot is free', async () => {
  const semaphore = new Semaphore(2)
  const first = await semaphore.acquire()
  await semaphore.acquire()

  let third = false
  const waiting = semaphore.acquire().then((release) => {
    third = true
    return release
  })

  await new Promise((resolve) => setTimeout(resolve, 5))
  expect(third).toBe(false)

  first()
  await waiting
  expect(third).toBe(true)
})

// The measured limit: a 36-call fan-out was refused with account-level 429s and a wave of four was
// accepted (TRD gotcha 10). Never more than the limit, however many callers pile up.
// Found by dev-b0 on #27. Releasing twice used to free a slot nobody took.
test('releasing twice frees one slot, not two', async () => {
  const semaphore = new Semaphore(2)
  const release = await semaphore.acquire()
  await semaphore.acquire()

  release()
  release()

  expect(semaphore.held).toBe(1)
})

test('it never exceeds its limit under a burst', async () => {
  const semaphore = new Semaphore(4)
  let peak = 0
  let held = 0

  await Promise.all(
    Array.from({ length: 20 }, async () => {
      const release = await semaphore.acquire()
      held += 1
      peak = Math.max(peak, held)
      await new Promise((resolve) => setTimeout(resolve, 1))
      held -= 1
      release()
    })
  )

  expect(peak).toBe(4)
})
