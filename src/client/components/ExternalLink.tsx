import { type ReactNode, useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

type Props = {
  href: string
  children: ReactNode
  className?: string
  /** Overrides the accessible name, which otherwise comes from the link's own text. */
  'aria-label'?: string
}

// Everything after the scheme, so the dialog can put the host on its own line. A URL we cannot
// parse is shown whole rather than guessed at.
function parts(href: string): { host: string; path: string } {
  try {
    const url = new URL(href)
    return { host: url.host, path: `${url.pathname}${url.search}` }
  } catch {
    return { host: href, path: '' }
  }
}

/**
 * A link that leaves Cekgu, with the confirmation that says so.
 *
 * Every one of these goes to the gateway, and the whole point of following it is that the reader
 * checks something we said against a party that is not us. That makes the hand-off worth naming:
 * the dialog prints the host and the exact path, so a person can see where they are about to land
 * before a new tab opens on it.
 *
 * The anchor keeps its real `href`, so middle-click, the context menu and a screen reader
 * announcing the destination all still work. The dialog is what a plain left click gets, and a
 * click with a modifier held is left to the browser: someone who has already asked for a new tab
 * has said where they are going.
 */
export function ExternalLink({ href, children, className, 'aria-label': label }: Props) {
  const [asking, setAsking] = useState(false)
  const { host, path } = parts(href)

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className={className}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
          event.preventDefault()
          setAsking(true)
        }}
      >
        {children}
      </a>

      <ConfirmDialog
        open={asking}
        tone="neutral"
        title="You Are Leaving Cekgu"
        confirmLabel="Open in a New Tab"
        body={[
          `This link opens ${host}, which is not run by us.`,
          path ? `It goes to ${path}.` : 'Nothing you have typed into Cekgu is sent with it.'
        ]}
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false)
          // Inside the click handler, so this counts as a user gesture and no popup blocker
          // stops it. noopener is what keeps the new tab from reaching back through window.opener.
          window.open(href, '_blank', 'noopener,noreferrer')
        }}
      />
    </>
  )
}
