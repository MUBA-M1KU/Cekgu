import type { Cat, MascotMotion } from './motions'
import { MOTION_PLAN } from './motions'
import type { MascotState } from './state'

export type CatSchedule = {
  /** Restarted whenever the motion queue empties, or null when the cat should go still. */
  looping: MascotMotion | null
  /** Set when a state begins, cleared once the opening motion has actually been asked to start. */
  openingPending: boolean
  /** Set while a motion() call is in flight, because the queue reads empty until that call lands. */
  starting: boolean
}

export type CatCues = { opening: MascotMotion | null; schedule: CatSchedule }

export function cuesFor(state: MascotState, cat: Cat): CatCues {
  const plan = MOTION_PLAN[state][cat]
  const opening = plan.find((entry) => !entry.loop) ?? null

  return {
    opening,
    schedule: {
      looping: plan.find((entry) => entry.loop) ?? null,
      openingPending: opening !== null,
      starting: false
    }
  }
}

// An empty queue is not enough on its own. Under Checking both openings sit on a timer, so a
// frame that ran before either landed would start both Idle loops together, which is the unison
// DESIGN.md rule one forbids.
export function shouldRestartLoop(schedule: CatSchedule, queueFinished: boolean): boolean {
  if (!schedule.looping || schedule.openingPending || schedule.starting) return false
  return queueFinished
}

/** A cat with neither an opening nor a loop is stopped, rather than left to run its last motion out. */
export function shouldStop(cues: CatCues): boolean {
  return cues.opening === null && cues.schedule.looping === null
}
