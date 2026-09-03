import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGE_HEIGHT, STAGE_WIDTH } from './motions'
import type { MascotStage } from './runtime'
import type { MascotState } from './state'

// A destructive confirmation or an open receipt is exactly when the cats must stop moving, so the
// stage watches the document for either rather than being told about them.
const BLOCKING = 'dialog[open], [data-receipt-popover], [role="dialog"]'

function blocked(): boolean {
  return document.querySelector(BLOCKING) !== null
}

export function Stage({ state }: { state: MascotState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<MascotStage | null>(null)
  const stateRef = useRef<MascotState>(state)
  const visibleRef = useRef(true)
  // Off screen until the observer says otherwise, so a stage that mounts below the fold, which is
  // the common case on a long record, never runs a frame before it is seen (FR-MASCOT-4).
  const onScreenRef = useRef(false)
  const [failed, setFailed] = useState(false)

  const applyActivity = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    if (visibleRef.current && onScreenRef.current) stage.resume()
    else stage.pause()
  }, [])

  // Re-running on `failed` is what tears the runtime down: the canvas is gone by then, so the
  // cleanup destroys the stage and the effect returns before building another.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || failed) return

    let live = true
    let stage: MascotStage | null = null
    const startPaused = !(visibleRef.current && onScreenRef.current)

    import('./runtime')
      .then((runtime) => runtime.createStage(canvas, () => setFailed(true), startPaused))
      .then((created) => {
        if (!live) {
          created.destroy()
          return
        }
        stage = created
        stageRef.current = created
        created.play(stateRef.current)
        created.hold(blocked())
        // The observers may have spoken while the runtime was loading, so the live values win
        // over the ones this effect captured.
        applyActivity()
      })
      .catch((error: unknown) => {
        console.debug('The mascot stage did not start.', error)
        if (live) setFailed(true)
      })

    return () => {
      live = false
      stageRef.current = null
      stage?.destroy()
    }
  }, [failed, applyActivity])

  useEffect(() => {
    stateRef.current = state
    stageRef.current?.play(state)
  }, [state])

  // FR-MASCOT-4: a hidden tab and an off-screen canvas both stop the ticker, and only both being
  // clear starts it again.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    visibleRef.current = document.visibilityState !== 'hidden'

    const onVisibility = () => {
      visibleRef.current = document.visibilityState !== 'hidden'
      applyActivity()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        onScreenRef.current = (entries[entries.length - 1]?.intersectionRatio ?? 0) >= 0.1
        applyActivity()
      },
      { threshold: [0, 0.1] }
    )

    document.addEventListener('visibilitychange', onVisibility)
    observer.observe(canvas)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
    }
  }, [applyActivity])

  useEffect(() => {
    const check = () => stageRef.current?.hold(blocked())
    const observer = new MutationObserver(check)

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open', 'role', 'data-receipt-popover']
    })

    return () => observer.disconnect()
  }, [])

  if (failed) {
    return <img src="/brand/mascot-still.png" alt="" width={STAGE_WIDTH} height={STAGE_HEIGHT} />
  }

  return (
    <canvas
      ref={canvasRef}
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      style={{ width: `${STAGE_WIDTH}px`, height: `${STAGE_HEIGHT}px` }}
    />
  )
}
