import { Application } from 'pixi.js'
import type { Cubism4InternalModel, Live2DModel } from 'pixi-live2d-display/cubism4'
import { CATS, type Cat, type MascotMotion, MOTION_PLAN, STAGE_HEIGHT, STAGE_WIDTH } from './motions'
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

export async function createStage(canvas: HTMLCanvasElement, onFailure: () => void): Promise<MascotStage> {
  const live2d = await loadLive2D()

  const app = new Application({
    view: canvas,
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    sharedTicker: false
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
  const looping: Record<Cat, MascotMotion | null> = { tororo: null, hijiki: null }
  const restarting: Record<Cat, boolean> = { tororo: false, hijiki: false }
  const timers = new Set<ReturnType<typeof setTimeout>>()

  let held = false
  let paused = false

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
    model.scale.x = entry.mirror ? -baseScale[cat] : baseScale[cat]
    restarting[cat] = true
    void model.motion(entry.group, entry.index, live2d.MotionPriority.FORCE).then((started) => {
      restarting[cat] = false
      if (!started) looping[cat] = null
    })
  }

  // 0.5.0-beta's own idle restart is disabled above, so the looping entry is restarted here when
  // the queue empties. The guard keeps the restart from firing again before the motion has begun.
  function tick() {
    for (const cat of CATS) {
      const entry = looping[cat]
      if (!entry || restarting[cat]) continue
      if (models[cat].internalModel.motionManager.isFinished()) start(cat, entry)
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
        const plan = MOTION_PLAN[state][cat]
        const opening = plan.find((entry) => !entry.loop)
        looping[cat] = plan.find((entry) => entry.loop) ?? null

        if (!opening) {
          models[cat].scale.x = baseScale[cat]
          continue
        }

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
      app.destroy(false, { children: true, texture: true, baseTexture: true })
    }
  }
}
