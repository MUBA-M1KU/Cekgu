import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'cekgu.theme'
const CHANGED = 'cekgu:theme'

// Light is the product's default rather than the system's choice: the demo is presented on a
// projector and a judge's own dark setting should not change what they are shown. styles.css says
// the same thing in its own comment; this is the switch that makes the dark palette reachable.
function stored(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    // A browser with storage blocked still gets a working product, in light.
    return 'light'
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, stored, () => 'light')
}

// styles.css keys color-scheme off this attribute, so the stored choice has to reach the document
// at boot as well as on every change. Called from main.tsx beside applyMotionSetting.
export function applyTheme(): void {
  document.documentElement.setAttribute('data-theme', stored())
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // The choice is a convenience; a browser that refuses storage stays in light.
  }

  applyTheme()
  window.dispatchEvent(new Event(CHANGED))
}
