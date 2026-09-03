import { describe, expect, test } from 'bun:test'
import { CATS } from './motions'
import { type CatSchedule, cuesFor, shouldRestartLoop, shouldStop } from './scheduler'
import { MASCOT_STATES } from './state'

const schedule = (partial: Partial<CatSchedule> = {}): CatSchedule => ({
  looping: { group: 'Idle', index: 0, delayMs: 0, loop: true, mirror: false },
  openingPending: false,
  starting: false,
  ...partial
})

describe('splitting a state into an opening and a loop', () => {
  test('checking opens on Tap and loops Idle for both cats', () => {
    expect(cuesFor('checking', 'tororo').opening).toMatchObject({ group: 'Tap', delayMs: 0 })
    expect(cuesFor('checking', 'hijiki').opening).toMatchObject({ group: 'Tap', delayMs: 1200 })
    for (const cat of CATS) expect(cuesFor('checking', cat).schedule.looping).toMatchObject({ group: 'Idle' })
  })

  test('a cat with an opening starts with the opening pending', () => {
    for (const state of MASCOT_STATES) {
      for (const cat of CATS) {
        const cues = cuesFor(state, cat)
        expect(cues.schedule.openingPending, `${state}/${cat}`).toBe(cues.opening !== null)
      }
    }
  })

  test('idle plays one cycle and does not loop', () => {
    expect(cuesFor('idle', 'tororo').opening).toMatchObject({ group: 'Idle', delayMs: 0 })
    expect(cuesFor('idle', 'tororo').schedule.looping).toBeNull()
  })
})

describe('the looping entry only takes over once the opening has run', () => {
  // The bug this gate exists for: in checking, play() arms the loop for both cats while both
  // openings are still on a timer, so an empty queue on the next frame started Idle at once and
  // the two cats moved in unison, which DESIGN.md rule one forbids.
  test('a pending opening blocks the loop even on an empty queue', () => {
    expect(shouldRestartLoop(schedule({ openingPending: true }), true)).toBe(false)
  })

  test('a motion still starting blocks the loop', () => {
    expect(shouldRestartLoop(schedule({ starting: true }), true)).toBe(false)
  })

  test('a cat with no loop never restarts', () => {
    expect(shouldRestartLoop(schedule({ looping: null }), true)).toBe(false)
  })

  test('a queue that is still playing never restarts', () => {
    expect(shouldRestartLoop(schedule(), false)).toBe(false)
  })

  test('an opening that has run over an empty queue restarts the loop', () => {
    expect(shouldRestartLoop(schedule(), true)).toBe(true)
  })

  test('checking cannot start both cats on the same frame', () => {
    const armed = CATS.map((cat) => cuesFor('checking', cat).schedule)
    expect(armed.map((entry) => shouldRestartLoop(entry, true))).toEqual([false, false])
  })
})

describe('a cat with nothing to play is stopped, not left to run out', () => {
  test('only Hijiki in unverified stops', () => {
    const stopping = MASCOT_STATES.flatMap((state) =>
      CATS.filter((cat) => shouldStop(cuesFor(state, cat))).map((cat) => `${state}/${cat}`)
    )
    expect(stopping).toEqual(['unverified/hijiki'])
  })
})
