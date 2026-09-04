import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyReduceMotion } from './mascot/preferences'
import './styles.css'
import { applyTheme } from './theme'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

// NFR-UX-5 has to hold on the first paint, not once Settings has been visited. The theme is the
// same shape of problem: a stored choice that has to reach the document before React mounts, or
// the page flashes light before switching.
applyReduceMotion()
applyTheme()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
