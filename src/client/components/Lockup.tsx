import { Link } from 'react-router'
import { Mark } from './Mark'

// The mark is inline, which is what actually makes it follow the theme. See Mark.tsx.
export function Lockup({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2" aria-label="Cekgu, home">
      <Mark className="h-6 w-6" />
      <span className="font-ui text-[1.25rem] font-bold tracking-[-0.02em]">Cekgu</span>
    </Link>
  )
}
