import type { Seat } from '../../shared/chat'
import type { Utterance } from './speech'

// The cats' voices are the browser's own. speechSynthesis needs no key, reaches no host and ships
// no bytes, so the gateway fence in src/server/gateway/only-gonkarouter.test.ts is untouched and no
// second track exemption is spent on a voice. It is also the only engine that cannot fail on stage
// for a network reason.
//
// Audio is never the only channel. Every utterance renders a caption carrying the same words and
// the request id behind them, so a muted browser, a machine with no voices installed and a hall
// with no speakers all still show what the readers found.

const SEAT_HINT: Record<Seat, RegExp> = {
  0: /female|woman|zira|samantha|karen|moira|tessa|fiona|serena|allison|susan|hazel/i,
  1: /male|man|david|alex|daniel|fred|oliver|thomas|george|mark|guy/i
}

// One voice split by pitch and rate when the machine has no second one to give. Tororo opens and
// Hijiki follows everywhere else in the mascot, so she is the higher and quicker of the two.
const SEAT_TONE: Record<Seat, { pitch: number; rate: number }> = {
  0: { pitch: 1.15, rate: 1.02 },
  1: { pitch: 0.82, rate: 0.94 }
}

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

function english(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  return en.length > 0 ? en : voices
}

/**
 * A voice per seat, or null for a seat the machine cannot fill. Chrome returns an empty list until
 * `voiceschanged` fires, so callers must not cache the result of a first call made too early.
 */
export function pickVoices(voices: SpeechSynthesisVoice[]): Record<Seat, SpeechSynthesisVoice | null> {
  const pool = english(voices)
  if (pool.length === 0) return { 0: null, 1: null }

  const first = pool.find((voice) => SEAT_HINT[0].test(voice.name)) ?? null
  const second = pool.find((voice) => voice !== first && SEAT_HINT[1].test(voice.name)) ?? null

  // Two hinted voices is the good case. Otherwise take any two distinct ones, and if there is only
  // one on the machine both seats share it and the tone table below does the separating.
  if (first && second) return { 0: first, 1: second }

  const fallback = pool.filter((voice) => voice !== first && voice !== second)
  return {
    0: first ?? fallback[0] ?? pool[0] ?? null,
    1: second ?? fallback[1] ?? fallback[0] ?? pool[0] ?? null
  }
}

let cached: Record<Seat, SpeechSynthesisVoice | null> | null = null

function voicesFor(engine: SpeechSynthesis): Record<Seat, SpeechSynthesisVoice | null> {
  if (cached) return cached
  const available = engine.getVoices()
  if (available.length === 0) return { 0: null, 1: null }
  cached = pickVoices(available)
  return cached
}

/**
 * Warms the voice list. Chrome populates it asynchronously and a first getVoices() before that
 * returns nothing at all, which would silently mute the first record a person opens.
 */
export function primeVoices(): () => void {
  const engine = synth()
  if (!engine) return () => {}

  const refresh = () => {
    cached = null
    voicesFor(engine)
  }

  refresh()
  engine.addEventListener('voiceschanged', refresh)
  return () => engine.removeEventListener('voiceschanged', refresh)
}

export type SpeechHandle = { cancel(): void }

// speechSynthesis.cancel() is global: it stops every utterance in the browser, whoever queued it.
// Each speak() takes the next turn and only the handle holding the current one may reach the
// engine, so a stale handle — the summary dismissed on its timer after the chat began answering —
// cannot cut off the speech that replaced it.
let turn = 0

/**
 * Speaks a sequence in order, one seat at a time. Returns a handle whose cancel() stops mid-line,
 * which is what an unmount, a mute or a second record landing needs.
 *
 * Silent by contract when muted, when the engine is missing, or when the machine has no voice: the
 * caller still renders the captions, so nothing about the feature depends on this succeeding.
 */
export function speak(
  utterances: Utterance[],
  options: { muted: boolean; onLine?: (index: number) => void }
): SpeechHandle {
  const engine = synth()
  if (!engine || options.muted || utterances.length === 0) return { cancel() {} }

  const voices = voicesFor(engine)
  let cancelled = false

  engine.cancel()
  const mine = ++turn

  utterances.forEach((line, index) => {
    const spoken = new SpeechSynthesisUtterance(line.text)
    const voice = voices[line.seat]
    if (voice) spoken.voice = voice
    spoken.pitch = SEAT_TONE[line.seat].pitch
    spoken.rate = SEAT_TONE[line.seat].rate
    spoken.addEventListener('start', () => {
      if (!cancelled) options.onLine?.(index)
    })
    engine.speak(spoken)
  })

  return {
    cancel() {
      cancelled = true
      if (mine === turn) engine.cancel()
    }
  }
}
