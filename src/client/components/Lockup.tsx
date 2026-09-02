import { Link } from 'react-router'

// The mark takes the text colour of wherever it sits, so it needs no light and dark variants.
export function Lockup({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2" aria-label="Cekgu, home">
      <img src="/brand/cekgu-mark.svg" alt="" aria-hidden="true" className="h-6 w-6" />
      <span className="font-ui text-[1.25rem] font-bold tracking-[-0.02em]">Cekgu</span>
    </Link>
  )
}
