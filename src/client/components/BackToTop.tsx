import { useEffect, useState } from 'react'
import { useReduceMotion } from '../mascot/preferences'

// The landing page is one document with five sections behind a pinned hero, so the way back to the
// nav is a long scroll. The control appears only once the hero is off screen, because before that
// the top is already where you are.
export function BackToTop() {
  const [shown, setShown] = useState(false)
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className="to-top"
      data-shown={shown ? 'true' : undefined}
      // Hidden from the tab order while it is invisible, or a keyboard user tabs onto a control
      // that is not on screen.
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : 'true'}
      // A smooth scroll of a whole page is exactly the motion the setting is about, so the
      // jump is instant when it is on. The CSS reset cannot reach a scriptual scroll.
      onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
    >
      <span className="sr-only">Back to Top</span>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M8 13V3.5M8 3.5 3.75 7.75M8 3.5l4.25 4.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
