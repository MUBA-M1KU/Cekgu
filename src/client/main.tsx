import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyReduceMotion } from './mascot/preferences'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

// NFR-UX-5 has to hold on the first paint, not once Settings has been visited.
applyReduceMotion()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
