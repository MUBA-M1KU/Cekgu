import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { RecordDetail } from '../../shared/types'
import { getHealth } from '../api'
import { BADGE_SIZE, STAGE_HEIGHT, STAGE_WIDTH } from './motions'
import { useReduceMotion } from './preferences'
import { Stage } from './Stage'
import { deriveMascotState, type MascotState } from './state'

const WIDE = '(min-width: 1024px)'
const NARROW = '(min-width: 600px) and (max-width: 1023.98px)'

type Placement = 'stage' | 'badge' | 'none'

function readPlacement(): Placement {
  if (typeof matchMedia !== 'function') return 'none'
  if (matchMedia(WIDE).matches) return 'stage'
  if (matchMedia(NARROW).matches) return 'badge'
  return 'none'
}

function subscribePlacement(onChange: () => void): () => void {
  const queries = [matchMedia(WIDE), matchMedia(NARROW)]
  for (const query of queries) query.addEventListener('change', onChange)

  return () => {
    for (const query of queries) query.removeEventListener('change', onChange)
  }
}

// The stage is never mounted below 1024 px, so a phone requests neither the runtime chunk nor the
// 2.7 MB of models: a CSS-hidden canvas would still have paid for both.
function usePlacement(): Placement {
  return useSyncExternalStore(subscribePlacement, readPlacement)
}

export function Mascot({ record }: { record: RecordDetail | null }) {
  const placement = usePlacement()
  const reduceMotion = useReduceMotion()
  const anchor = useRef<HTMLSpanElement>(null)
  const previous = useRef<RecordDetail | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<MascotState>('idle')
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let live = true

    getHealth()
      .then((health) => {
        if (live) setEnabled(health.mascotEnabled)
      })
      .catch((error: unknown) => console.debug('The mascot flag could not be read.', error))

    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    if (!record) return
    setState(deriveMascotState(previous.current, record))
    previous.current = record
  }, [record])

  const showBadge = record !== null && enabled && placement === 'badge'

  useEffect(() => {
    // DESIGN.md puts the badge in the record header beside the status chips. The workspace marks
    // that row with data-mascot-slot, so the contract is greppable from both sides.
    if (!showBadge) {
      setSlot(null)
      return
    }
    setSlot(anchor.current?.closest('section')?.querySelector<HTMLElement>('[data-mascot-slot]') ?? null)
  }, [showBadge])

  if (!record || !enabled || placement === 'none') return null

  if (showBadge) {
    return (
      <>
        <span ref={anchor} hidden />
        {slot
          ? createPortal(
              <img
                src="/brand/mascot-badge.png"
                alt=""
                aria-hidden="true"
                width={BADGE_SIZE}
                height={BADGE_SIZE}
                className="pointer-events-none"
              />,
              slot
            )
          : null}
      </>
    )
  }

  return (
    <div aria-hidden="true" className="pointer-events-none relative mt-8" style={{ height: `${STAGE_HEIGHT}px` }}>
      <div className="absolute right-0 bottom-0">
        {reduceMotion ? (
          <img src="/brand/mascot-still.png" alt="" width={STAGE_WIDTH} height={STAGE_HEIGHT} />
        ) : (
          <Stage state={state} />
        )}
      </div>
    </div>
  )
}
