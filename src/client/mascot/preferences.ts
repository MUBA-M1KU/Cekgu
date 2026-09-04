import { useSyncExternalStore } from 'react'

export type MotionSetting = 'system' | 'full' | 'reduce'

const KEY = 'cekgu.motion'
const LEGACY_KEY = 'cekgu.reduceMotion'
const CHANGED = 'cekgu:reduce-motion'
const QUERY = '(prefers-reduced-motion: reduce)'

// Three states rather than a checkbox, because the old boolean could only ever add reduction:
// combined() was `stored() || systemPrefers()`, so a reader whose system asked for less motion had
// no way back to it from inside the product. Windows' "show animations" toggle is what Chromium
// reports through this query, and people turn that off for a snappier desktop as often as for
// motion sensitivity — one OS switch, two unrelated intentions. So the system stays the default and
// is still honoured by it, and an explicit choice here outranks it in both directions.
export function motionSetting(): MotionSetting {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'system' || stored === 'full' || stored === 'reduce') return stored
    // Anyone who ticked the old Reduce Motion box meant "reduce", so carry that across.
    return localStorage.getItem(LEGACY_KEY) === 'true' ? 'reduce' : 'system'
  } catch {
    // A browser with storage blocked still follows the system preference below.
    return 'system'
  }
}

function systemPrefers(): boolean {
  return typeof matchMedia === 'function' && matchMedia(QUERY).matches
}

function resolved(): boolean {
  const setting = motionSetting()
  if (setting === 'full') return false
  if (setting === 'reduce') return true
  return systemPrefers()
}

function subscribe(onChange: () => void): () => void {
  const media = typeof matchMedia === 'function' ? matchMedia(QUERY) : null
  media?.addEventListener('change', onChange)
  window.addEventListener(CHANGED, onChange)
  window.addEventListener('storage', onChange)

  return () => {
    media?.removeEventListener('change', onChange)
    window.removeEventListener(CHANGED, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Whether motion should be suppressed right now, after the setting and the system are resolved. */
export function useReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, resolved)
}

/** The stored choice alone, which is what the Settings control shows and changes. */
export function useMotionSetting(): MotionSetting {
  return useSyncExternalStore(subscribe, motionSetting)
}

const MUTE_KEY = 'cekgu.mute'
const MUTE_CHANGED = 'cekgu:mute'

// Mute and Reduce Motion are separate switches over separate senses, and neither implies the other.
// Someone who turns the animation off may still want to be told what was found, and someone who
// silences a shared office still wants the cats moving. Muting stops audio only; the captions that
// carry the same words and the request ids behind them are never suppressed.
export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    // Storage blocked. Audible is the default, and the mute control still works for this page.
    return false
  }
}

export function setMuted(value: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, String(value))
  } catch {
    // Nothing to do: the event below still updates this page, it just will not outlive it.
  }
  window.dispatchEvent(new Event(MUTE_CHANGED))
}

function subscribeMute(onChange: () => void): () => void {
  window.addEventListener(MUTE_CHANGED, onChange)
  window.addEventListener('storage', onChange)

  return () => {
    window.removeEventListener(MUTE_CHANGED, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useMuted(): boolean {
  return useSyncExternalStore(subscribeMute, isMuted)
}

// styles.css keys the NFR-UX-5 reset off this attribute, so the stored setting has to reach the
// document at boot as well as on every change. Absent means follow the system, which is why the
// attribute is removed rather than written as "system": the CSS asks whether it is "full".
export function applyMotionSetting(): void {
  const root = document.documentElement
  const setting = motionSetting()
  if (setting === 'system') root.removeAttribute('data-motion')
  else root.setAttribute('data-motion', setting)
}

export function setMotionSetting(value: MotionSetting): void {
  try {
    localStorage.setItem(KEY, value)
    // The old key would otherwise keep answering for anyone who had ticked the box before.
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // The setting is a convenience; a browser that refuses storage keeps the system preference.
  }

  applyMotionSetting()
  window.dispatchEvent(new Event(CHANGED))
}
