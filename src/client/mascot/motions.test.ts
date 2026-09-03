import { describe, expect, test } from 'bun:test'
import { CATS, MOTION_CHOICE, MOTION_PLAN, type MotionGroup } from './motions'
import { MASCOT_STATES, type MascotState } from './state'

type Row = { groups: MotionGroup[]; delayMs: number | null }

// docs/DESIGN.md "The mascot", transcribed. This table is the specification; MOTION_PLAN is the
// implementation of it, so a change to one without the other fails here.
const DESIGN: Record<MascotState, { tororo: Row; hijiki: Row }> = {
  idle: { tororo: { groups: ['Idle'], delayMs: 0 }, hijiki: { groups: ['Idle'], delayMs: 400 } },
  checking: { tororo: { groups: ['Tap', 'Idle'], delayMs: 0 }, hijiki: { groups: ['Tap', 'Idle'], delayMs: 1200 } },
  agreement: { tororo: { groups: ['FlickUp'], delayMs: 0 }, hijiki: { groups: ['FlickUp'], delayMs: 300 } },
  attention: { tororo: { groups: ['Tap'], delayMs: 0 }, hijiki: { groups: ['Tap'], delayMs: 300 } },
  split: { tororo: { groups: ['Flick'], delayMs: 0 }, hijiki: { groups: ['Flick'], delayMs: 300 } },
  unverified: { tororo: { groups: ['FlickDown'], delayMs: 0 }, hijiki: { groups: [], delayMs: null } },
  resolved: { tororo: { groups: ['FlickUp'], delayMs: 0 }, hijiki: { groups: ['FlickUp'], delayMs: 300 } }
}

const MODEL_PATH = {
  tororo: 'public/live2d/tororo/runtime/tororo.model3.json',
  hijiki: 'public/live2d/hijiki/runtime/hijiki.model3.json'
}

type Model3 = { FileReferences: { Motions: Record<string, { File: string }[]> } }

describe('every state maps both cats', () => {
  for (const state of MASCOT_STATES) {
    test(`${state} plays the groups the design names`, () => {
      for (const cat of CATS) {
        expect(MOTION_PLAN[state][cat].map((motion) => motion.group)).toEqual(DESIGN[state][cat].groups)
      }
    })

    test(`${state} opens on the offsets the design names`, () => {
      for (const cat of CATS) {
        expect(MOTION_PLAN[state][cat][0]?.delayMs ?? null).toBe(DESIGN[state][cat].delayMs)
      }
    })
  }
})

describe('the cats never start a paired motion in unison', () => {
  for (const state of MASCOT_STATES) {
    test(state, () => {
      const opening = CATS.map((cat) => MOTION_PLAN[state][cat][0]?.delayMs).filter(
        (delay): delay is number => delay !== undefined
      )
      expect(new Set(opening).size).toBe(opening.length)
    })
  }
})

describe('mirroring', () => {
  test('only Hijiki mirrors, and only in split opinion', () => {
    const mirrored = MASCOT_STATES.flatMap((state) =>
      CATS.flatMap((cat) => MOTION_PLAN[state][cat].filter((motion) => motion.mirror).map(() => `${state}/${cat}`))
    )
    expect(mirrored).toEqual(['split/hijiki'])
  })
})

describe('looping', () => {
  test('only checking loops, and it loops Idle for both cats', () => {
    const looping = MASCOT_STATES.flatMap((state) =>
      CATS.flatMap((cat) =>
        MOTION_PLAN[state][cat].filter((motion) => motion.loop).map((motion) => `${state}/${cat}/${motion.group}`)
      )
    )
    expect(looping).toEqual(['checking/tororo/Idle', 'checking/hijiki/Idle'])
  })
})

describe('the chosen index exists in the shipped models', () => {
  test('every group carries a reason for its index', () => {
    for (const [group, choice] of Object.entries(MOTION_CHOICE)) {
      expect(choice.reason.length, `${group} has no reason`).toBeGreaterThan(0)
    }
  })

  for (const cat of CATS) {
    test(cat, async () => {
      const model = (await Bun.file(MODEL_PATH[cat]).json()) as Model3
      for (const state of MASCOT_STATES) {
        for (const motion of MOTION_PLAN[state][cat]) {
          const files = model.FileReferences.Motions[motion.group]
          expect(files, `${motion.group} missing from ${cat}`).toBeDefined()
          expect(motion.index, `${state}/${cat}/${motion.group}`).toBeLessThan(files?.length ?? 0)
          expect(motion.index).toBe(MOTION_CHOICE[motion.group].index)
        }
      }
    })
  }
})
