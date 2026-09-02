import { useSyncExternalStore } from 'react'

const KEY = 'cekgu.reduceMotion'
const CHANGED = 'cekgu:reduce-motion'
const QUERY = '(prefers-reduced-motion: reduce)'

function stored(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    // A browser with storage blocked still gets the system preference below.
    return false
  }
}

function systemPrefers(): boolean {
  return typeof matchMedia === 'function' && matchMedia(QUERY).matches
}

function combined(): boolean {
  return stored() || systemPrefers()
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

/** True when either the system preference or the user's own setting asks for less motion. */
export function useReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, combined)
}

/** The user's own setting alone, which is what the Settings checkbox shows and changes. */
export function useReduceMotionSetting(): boolean {
  return useSyncExternalStore(subscribe, stored)
}

// styles.css keys the NFR-UX-5 reset off this attribute, so the stored setting has to reach the
// document at boot as well as on every change.
export function applyReduceMotion(): void {
  const root = document.documentElement
  if (stored()) root.setAttribute('data-reduce-motion', 'true')
  else root.removeAttribute('data-reduce-motion')
}

export function setReduceMotion(value: boolean): void {
  try {
    localStorage.setItem(KEY, String(value))
  } catch {
    // The setting is a convenience; a browser that refuses storage keeps the system preference.
  }

  applyReduceMotion()
  window.dispatchEvent(new Event(CHANGED))
}
