import { Application } from 'pixi.js'
import type { Cubism4InternalModel, Live2DModel } from 'pixi-live2d-display/cubism4'
import { CATS, type Cat, type MascotMotion, STAGE_HEIGHT, STAGE_WIDTH } from './motions'
import { type CatSchedule, cuesFor, shouldRestartLoop, shouldStop } from './scheduler'
import type { MascotState } from './state'

// The Cubism core is not on npm under a redistributable licence, so it is fetched from Live2D's
// own CDN the first time a stage is built. FR-MASCOT-1 requires that a page with the flag off asks
// for nothing, which rules out a <script> tag in index.html.
const CORE_SRC = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'

const MODEL_URL: Record<Cat, string> = {
  tororo: '/live2d/tororo/runtime/tororo.model3.json',
  hijiki: '/live2d/hijiki/runtime/hijiki.model3.json'
}

// The library restarts a random motion from this group whenever nothing is playing. The design
// wants a cat to go still after its cycle, so the group is named out of existence and every
// motion, the looping idle included, is started from play() below.
const NO_AUTO_IDLE = 'CekguManualIdle'

export type MascotStage = {
  play(state: MascotState): void
  hold(held: boolean): void
  pause(): void
  resume(): void
  destroy(): void
}

let corePromise: Promise<void> | null = null

function loadCore(): Promise<void> {
  if (corePromise) return corePromise

  corePromise = new Promise((resolve, reject) => {
    if ('Live2DCubismCore' in window) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = CORE_SRC
    script.async = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('The Cubism core script did not load.')))
    document.head.append(script)
  })

  return corePromise
}

// The Cubism 4 build throws at module scope when the core is missing, so it can only be imported
// once the script above has run. That also keeps pixi and the plugin out of the entry chunk.
async function loadLive2D(): Promise<typeof import('pixi-live2d-display/cubism4')> {
  await loadCore()
  return import('pixi-live2d-display/cubism4')
}

type CoreModel = Cubism4InternalModel['coreModel']

type ClippingManager = {
  initialize(
    model: CoreModel,
    drawableCount: number,
    masks: Int32Array[],
    maskCounts: Int32Array,
    renderTextures: number
  ): void
}

// Tororo and Hijiki use no clipping masks, and the Cubism framework only builds a clipping manager
// for a model that does. 0.5.0-beta then dereferences that manager unconditionally on the first
// draw and again on release, so both throw. A manager initialised over zero masks allocates no
// texture and its setup pass is a no-op, which satisfies both call sites without changing a frame.
function giveClippingManager(model: Live2DModel, live2d: typeof import('pixi-live2d-display/cubism4')): void {
  const internal = model.internalModel as Cubism4InternalModel
  const core = internal.coreModel
  if (core.isUsingMasking()) return

  const renderer = internal.renderer as unknown as { _clippingManager?: ClippingManager }
  if (renderer._clippingManager) return

  const construct = (live2d as unknown as { CubismClippingManager_WebGL: new () => ClippingManager })
    .CubismClippingManager_WebGL
  const manager = new construct()
  manager.initialize(core, core.getDrawableCount(), core.getDrawableMasks(), core.getDrawableMaskCounts(), 1)
  renderer._clippingManager = manager
}

async function buildStage(
  canvas: HTMLCanvasElement,
  onFailure: () => void,
  initiallyPaused: boolean
): Promise<MascotStage> {
  const live2d = await loadLive2D()

  // The ticker never runs before the caller has said the stage is on screen, so a canvas that
  // mounts below the fold costs no frames at all (FR-MASCOT-4).
  const app = new Application({
    view: canvas,
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    sharedTicker: false,
    autoStart: !initiallyPaused
  })

  const loadModel = (cat: Cat): Promise<Live2DModel> =>
    live2d.Live2DModel.from(MODEL_URL[cat], {
      ticker: app.ticker,
      autoHitTest: false,
      autoFocus: false,
      idleMotionGroup: NO_AUTO_IDLE,
      motionPreload: live2d.MotionPreloadStrategy.ALL
    })

  const [tororo, hijiki] = await Promise.all([loadModel('tororo'), loadModel('hijiki')])
  const models: Record<Cat, Live2DModel> = { tororo, hijiki }
  for (const cat of CATS) giveClippingManager(models[cat], live2d)

  const baseScale: Record<Cat, number> = { tororo: 1, hijiki: 1 }
  const schedules: Record<Cat, CatSchedule> = {
    tororo: { looping: null, openingPending: false, starting: false },
    hijiki: { looping: null, openingPending: false, starting: false }
  }
  const timers = new Set<ReturnType<typeof setTimeout>>()

  let held = false
  let paused = initiallyPaused

  // A lost context is the failure that matters once the stage is up: the cats vanish and nothing
  // else in the app notices, so the still image has to take over.
  const onContextLost = () => onFailure()
  canvas.addEventListener('webglcontextlost', onContextLost)

  CATS.forEach((cat, index) => {
    const model = models[cat]
    model.anchor.set(0.5, 1)
    const scale = Math.min(STAGE_WIDTH / 2 / model.width, STAGE_HEIGHT / model.height)
    baseScale[cat] = scale
    model.scale.set(scale)
    model.x = STAGE_WIDTH * (index === 0 ? 0.27 : 0.73)
    model.y = STAGE_HEIGHT
    app.stage.addChild(model)
  })

  function start(cat: Cat, entry: MascotMotion) {
    const model = models[cat]
    const schedule = schedules[cat]
    model.scale.x = entry.mirror ? -baseScale[cat] : baseScale[cat]
    schedule.openingPending = false
    schedule.starting = true

    model
      .motion(entry.group, entry.index, live2d.MotionPriority.FORCE)
      .then((started) => {
        schedule.starting = false
        if (!started) schedule.looping = null
      })
      .catch((error: unknown) => {
        schedule.starting = false
        schedule.looping = null
        console.debug('A mascot motion did not play.', error)
        onFailure()
      })
  }

  // 0.5.0-beta's own idle restart is disabled above, so the looping entry is restarted here when
  // the queue empties and the scheduler says the opening has had its turn.
  function tick() {
    for (const cat of CATS) {
      const schedule = schedules[cat]
      if (!shouldRestartLoop(schedule, models[cat].internalModel.motionManager.isFinished())) continue
      const entry = schedule.looping
      if (entry) start(cat, entry)
    }
  }

  app.ticker.add(tick)

  function clearTimers() {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }

  function sync() {
    if (held || paused) app.ticker.stop()
    else app.ticker.start()
  }

  return {
    play(state: MascotState) {
      clearTimers()

      for (const cat of CATS) {
        const cues = cuesFor(state, cat)
        schedules[cat] = cues.schedule

        if (shouldStop(cues)) {
          models[cat].internalModel.motionManager.stopAllMotions()
          models[cat].scale.x = baseScale[cat]
          continue
        }

        const opening = cues.opening
        if (!opening) continue

        const timer = setTimeout(() => {
          timers.delete(timer)
          start(cat, opening)
        }, opening.delayMs)
        timers.add(timer)
      }
    },
    hold(value: boolean) {
      held = value
      sync()
    },
    pause() {
      paused = true
      sync()
    },
    resume() {
      paused = false
      sync()
    },
    destroy() {
      clearTimers()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      app.ticker.remove(tick)

      // Each model has to leave the ticker before pixi destroys it. Application.destroy() destroys
      // its ticker first and the stage children second, and Live2DModel.destroy() sets
      // autoUpdate = false from inside itself, whose setter calls ticker.remove(). By then _head
      // is null and it throws "Cannot read properties of null (reading 'next')".
      //
      // That throw lands in React's effect cleanup, so it took the whole app down to a blank page
      // on any navigation away from a record while the stage was mounted. Destroying the models
      // here, while the ticker is still alive, leaves app.destroy() an empty stage.
      for (const cat of CATS) {
        app.stage.removeChild(models[cat])
        models[cat].destroy({ children: true, texture: true, baseTexture: true })
      }

      app.destroy(false, { children: true, texture: true, baseTexture: true })
    }
  }
}

type SharedStage = { promise: Promise<MascotStage>; refs: number }

const shared = new WeakMap<HTMLCanvasElement, SharedStage>()

// React's StrictMode mounts, unmounts and remounts an effect in development, so two createStage
// calls race on one canvas. A second Application takes the WebGL context from the first, and
// destroying either loses it for both, which silently degrades the stage to the still image. One
// build per canvas, released only when the last caller destroys it.
export async function createStage(
  canvas: HTMLCanvasElement,
  onFailure: () => void,
  initiallyPaused = false
): Promise<MascotStage> {
  const entry = shared.get(canvas) ?? { refs: 0, promise: buildStage(canvas, onFailure, initiallyPaused) }
  entry.refs += 1
  shared.set(canvas, entry)

  let stage: MascotStage
  try {
    stage = await entry.promise
  } catch (error) {
    entry.refs -= 1
    if (entry.refs <= 0) shared.delete(canvas)
    throw error
  }

  let released = false

  return {
    ...stage,
    destroy() {
      if (released) return
      released = true
      entry.refs -= 1
      if (entry.refs > 0) return
      shared.delete(canvas)
      stage.destroy()
    }
  }
}
