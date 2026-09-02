import type { MascotState } from './state'

export const CATS = ['tororo', 'hijiki'] as const

export type Cat = (typeof CATS)[number]

export type MotionGroup = 'Idle' | 'Tap' | 'FlickUp' | 'FlickDown' | 'Flick'

export type MascotMotion = {
  group: MotionGroup
  /** Which file inside the group; see MOTION_CHOICE and docs/DESIGN.md "The mascot". */
  index: number
  /** Milliseconds after the state begins. A looping entry starts when the entry before it ends. */
  delayMs: number
  loop: boolean
  /** Flips the model horizontally so the two cats face apart in Split Opinion. */
  mirror: boolean
}

// The models carry no descriptive motion names, so the index is chosen on what the file measurably
// drives and recorded here and in docs/DESIGN.md. Both cats ship the same nine files per group.
export const MOTION_CHOICE: Record<MotionGroup, { index: number; reason: string }> = {
  Idle: {
    index: 0,
    reason:
      'motion/00_idle is the only file the rig names idle, the longest at 9.73s, and the one that drives the full breath, ear and tail set.'
  },
  Tap: {
    index: 2,
    reason:
      'motion/07 is the shortest Tap at 4.07s and the only one with no arm-swing curves, so the reaction reads as a head turn rather than a wave.'
  },
  FlickUp: { index: 0, reason: 'motion/01 is the only file in the group.' },
  FlickDown: { index: 0, reason: 'motion/02 is the only file in the group.' },
  Flick: { index: 0, reason: 'motion/05 is the only file in the group.' }
}

function motion(group: MotionGroup, delayMs: number, extra: { loop?: boolean; mirror?: boolean } = {}): MascotMotion {
  return {
    group,
    index: MOTION_CHOICE[group].index,
    delayMs,
    loop: extra.loop ?? false,
    mirror: extra.mirror ?? false
  }
}

// docs/DESIGN.md "The mascot". Tororo always opens; Hijiki always follows, because two readers
// starting in unison would say the opposite of what the product claims. The design table gives no
// offset for Split Opinion, so it takes the house 300 ms the other paired states use.
export const MOTION_PLAN: Record<MascotState, Record<Cat, MascotMotion[]>> = {
  idle: {
    tororo: [motion('Idle', 0)],
    hijiki: [motion('Idle', 400)]
  },
  checking: {
    tororo: [motion('Tap', 0), motion('Idle', 0, { loop: true })],
    hijiki: [motion('Tap', 1200), motion('Idle', 0, { loop: true })]
  },
  agreement: {
    tororo: [motion('FlickUp', 0)],
    hijiki: [motion('FlickUp', 300)]
  },
  attention: {
    tororo: [motion('Tap', 0)],
    hijiki: [motion('Tap', 300)]
  },
  split: {
    tororo: [motion('Flick', 0)],
    hijiki: [motion('Flick', 300, { mirror: true })]
  },
  unverified: {
    tororo: [motion('FlickDown', 0)],
    hijiki: []
  },
  resolved: {
    tororo: [motion('FlickUp', 0)],
    hijiki: [motion('FlickUp', 300)]
  }
}
