import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { RecordDetail } from '../../shared/types'
import { getHealth } from '../api'
import { VoiceOffIcon, VoiceOnIcon } from '../components/icons'
import { STAGE_HEIGHT, STAGE_WIDTH } from './motions'
import { setMuted, useMuted, useReduceMotion } from './preferences'
import { SpeechBubble } from './SpeechBubble'
import { Stage } from './Stage'
import { summaryUtterances, type Utterance } from './speech'
import { deriveMascotState, type MascotState } from './state'
import { primeVoices, type SpeechHandle, speak } from './voice'

const LIVE = '(min-width: 1024px)'

// The rail is a third of a twelve-column grid, so the 240 px stage is scaled to sit inside it with
// air on both sides rather than touching the card's edges.
const DOCK_SCALE = 0.85
const DOCK = { w: Math.round(STAGE_WIDTH * DOCK_SCALE), h: Math.round(STAGE_HEIGHT * DOCK_SCALE) }

// Below the live breakpoint the cats are a still image at the same aspect. The Live2D runtime is
// 469 kB of chunk plus 2.7 MB of models and a WebGL context, which FR-MASCOT-2 keeps off a phone —
// but the assistant behind them should still be reachable there, so the image is the button.
const STILL = { w: 168, h: 112 }

const CAPTION_HOLD_MS = 6_000
const TERMINAL = ['ready', 'in_review', 'resolved']

function subscribeLive(onChange: () => void): () => void {
  const query = matchMedia(LIVE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function readLive(): boolean {
  return typeof matchMedia === 'function' && matchMedia(LIVE).matches
}

export function useLiveViewport(): boolean {
  return useSyncExternalStore(subscribeLive, readLive)
}

type Props = {
  record: RecordDetail | null
  /** The chat modal owns the only other stage, so this one stands down while it is open. */
  chatOpen: boolean
  onOpenChat: () => void
}

/**
 * The readers, docked in the summary card.
 *
 * THEY USED TO LIVE AT THE FOOT OF THE PAGE, which meant scrolling past twelve items to reach the
 * assistant. The card is in the sticky rail, so here they follow the reader down and the chat is
 * one click away from anywhere in the record.
 *
 * ONLY ONE LIVE2D STAGE EXISTS AT A TIME, and that is a correctness rule rather than a saving. Two
 * stages load the same models, the same textures and the same motion files concurrently; pixi keys
 * its texture cache by URL, so the second load reaches into the first stage's textures and the cats
 * on the page went blank while their button stayed clickable. The modal's stage mounts only while
 * it is open, and this one stands down for exactly that time.
 */
export function Mascot({ record, chatOpen, onOpenChat }: Props) {
  const live = useLiveViewport()
  const reduceMotion = useReduceMotion()
  const muted = useMuted()
  const previous = useRef<RecordDetail | null>(null)
  const spokenFor = useRef<string | null>(null)
  const handle = useRef<SpeechHandle | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<MascotState>('idle')
  const [lines, setLines] = useState<Utterance[]>([])
  const [line, setLine] = useState(0)

  useEffect(() => {
    let alive = true

    getHealth()
      .then((health) => {
        if (alive) setEnabled(health.mascotEnabled)
      })
      .catch((error: unknown) => console.debug('The mascot flag could not be read.', error))

    return () => {
      alive = false
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
    if (!record || !enabled) return
    if (!TERMINAL.includes(record.status) || spokenFor.current === record.id) return

    spokenFor.current = record.id
    const utterances = summaryUtterances(record)
    if (utterances.length === 0) return

    setLines(utterances)
    setLine(0)
    handle.current = speak(utterances, { muted, onLine: setLine })

    const timer = setTimeout(dismiss, CAPTION_HOLD_MS * utterances.length)
    return () => clearTimeout(timer)
  }, [record, enabled, muted, dismiss])

  useEffect(() => () => handle.current?.cancel(), [])

  if (!record || !enabled) return null

  const spoken = lines[line] ?? null
  const animated = live && !reduceMotion && !chatOpen
  const size = live ? DOCK : STILL

  return (
    <div className="border-t border-rule px-5 pt-4 sm:px-6">
      {/* In flow rather than floating, so a caption arriving grows the card instead of covering the
          count above it. The rail is sticky and short; there is room to grow and none to overlap. */}
      {spoken ? <SpeechBubble utterance={spoken} /> : null}

      <div className="mt-3 flex items-end justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (!muted) handle.current?.cancel()
            setMuted(!muted)
          }}
          aria-pressed={muted}
          className="btn btn-ghost btn-sm shrink-0"
          title={muted ? 'Unmute The Readers' : 'Mute The Readers'}
        >
          {muted ? <VoiceOffIcon /> : <VoiceOnIcon />}
          <span className="sr-only">{muted ? 'Unmute The Readers' : 'Mute The Readers'}</span>
        </button>

        {/* The canvas was decorative and is now a control, so the accessible name lives on the
            button and the canvas inside it stays hidden from the tree. A cat is not a label.

            The cats sit ON the card's bottom edge: the button carries no padding below them and
            this block is the card's last child, so the stage's floor is the card's floor. */}
        <button
          type="button"
          onClick={onOpenChat}
          className="-mb-1 shrink-0 cursor-pointer rounded-control border-0 bg-transparent p-0"
        >
          <span className="sr-only">Ask About This Record</span>
          <span
            aria-hidden="true"
            className="block overflow-hidden"
            style={{ width: `${size.w}px`, height: `${size.h}px` }}
          >
            {animated ? (
              <span className="block" style={{ transform: `scale(${DOCK_SCALE})`, transformOrigin: 'top left' }}>
                <Stage state={state} />
              </span>
            ) : (
              <img src="/brand/mascot-still.png" alt="" width={size.w} height={size.h} />
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
