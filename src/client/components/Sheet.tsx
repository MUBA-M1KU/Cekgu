import type { ReactNode } from 'react'

type Props = { children: ReactNode; as?: 'section' | 'form'; onSubmit?: (event: React.FormEvent) => void }

// Level 1, the sheet: the review document, the records table, the form. One sheet per page;
// a sheet never contains another sheet. At 375 px it loses its side margins and its border
// becomes the top and bottom rules only. DESIGN.md Layout and Borders.
const CLASS =
  '-mx-4 border-y border-rule bg-sheet p-4 sm:mx-0 sm:rounded-sheet sm:border-x sm:p-8 sm:shadow-[var(--shadow-sheet)]'

export function Sheet({ children, as = 'section', onSubmit }: Props) {
  if (as === 'form') {
    return (
      <form onSubmit={onSubmit} noValidate className={CLASS}>
        {children}
      </form>
    )
  }

  return <section className={CLASS}>{children}</section>
}
