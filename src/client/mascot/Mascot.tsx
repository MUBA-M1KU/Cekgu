import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { RecordDetail } from '../../shared/types'
import { getHealth } from '../api'
import { VoiceOffIcon, VoiceOnIcon } from '../components/icons'
import { BADGE_SIZE, STAGE_HEIGHT, STAGE_WIDTH } from './motions'
import { setMuted, useMuted, useReduceMotion } from './preferences'
import { SpeechBubble } from './SpeechBubble'
import { Stage } from './Stage'
import { summaryUtterances, type Utterance } from './speech'
import { deriveMascotState, type MascotState } from './state'
import { primeVoices, type SpeechHandle, speak } from './voice'

const WIDE = '(min-width: 1024px)'
const NARROW = '(min-width: 600px) and (max-width: 1023.98px)'

// How long the last caption stays after the voice stops. Long enough to finish reading a line you
// only half heard, short enough that it is gone before you scroll to the item it names.
const CAPTION_HOLD_MS = 6_000

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

const TERMINAL = ['ready', 'in_review', 'resolved']

export function Mascot({ record, onOpenChat }: { record: RecordDetail | null; onOpenChat?: () => void }) {
  const placement = usePlacement()
  const reduceMotion = useReduceMotion()
  const muted = useMuted()
  const anchor = useRef<HTMLSpanElement>(null)
  const previous = useRef<RecordDetail | null>(null)
  const spokenFor = useRef<string | null>(null)
  const handle = useRef<SpeechHandle | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<MascotState>('idle')
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const [lines, setLines] = useState<Utterance[]>([])
  const [line, setLine] = useState(0)

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

  // Chrome fills the voice list asynchronously and returns nothing at all before it does, which
  // would silently mute the first record of a session — the demo's first record.
  useEffect(primeVoices, [])

  useEffect(() => {
    if (!record) return
    setState(deriveMascotState(previous.current, record))
    previous.current = record
  }, [record])

  const dismiss = useCallback(() => {
    handle.current?.cancel()
    handle.current = null
    setLines([])
    setLine(0)
  }, [])

  // The summary speaks once per record per visit, when the record is finished rather than as each
  // item lands. Twelve items landing would be twelve interruptions, and the three that matter would
  // be buried in the nine that do not. Everything per-item is on the Play control in the evidence
  // panel instead, where a person asked for it.
  useEffect(() => {
    if (!record || !enabled || placement !== 'stage') return
    if (!TERMINAL.includes(record.status) || spokenFor.current === record.id) return

    spokenFor.current = record.id
    const utterances = summaryUtterances(record)
    if (utterances.length === 0) return

    setLines(utterances)
    setLine(0)
    handle.current = speak(utterances, { muted, onLine: setLine })

    const timer = setTimeout(dismiss, CAPTION_HOLD_MS * utterances.length)
    return () => clearTimeout(timer)
  }, [record, enabled, placement, muted, dismiss])

  useEffect(() => () => handle.current?.cancel(), [])

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

  const spoken = lines[line] ?? null

  return (
    <div className="relative mt-8" style={{ height: `${STAGE_HEIGHT}px` }}>
      <div className="absolute right-0 bottom-0 flex flex-col items-end gap-2">
        {spoken ? <SpeechBubble utterance={spoken} /> : null}

        <div className="flex items-end gap-1">
          <button
            type="button"
            onClick={() => {
              if (!muted) handle.current?.cancel()
              setMuted(!muted)
            }}
            aria-pressed={muted}
            className="btn btn-ghost btn-sm"
            title={muted ? 'Unmute The Readers' : 'Mute The Readers'}
          >
            {muted ? <VoiceOffIcon /> : <VoiceOnIcon />}
            <span className="sr-only">{muted ? 'Unmute The Readers' : 'Mute The Readers'}</span>
          </button>

          {/* The canvas was decorative and is now a control, so the accessible name lives on the
              button and the canvas inside it stays hidden from the tree. A cat is not a label. */}
          <button
            type="button"
            onClick={onOpenChat}
            className="cursor-pointer rounded-control border-0 bg-transparent p-0"
          >
            <span className="sr-only">Ask About This Record</span>
            <span aria-hidden="true">
              {reduceMotion ? (
                <img src="/brand/mascot-still.png" alt="" width={STAGE_WIDTH} height={STAGE_HEIGHT} />
              ) : (
                <Stage state={state} />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
