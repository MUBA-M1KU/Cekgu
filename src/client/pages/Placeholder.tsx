import { Sheet } from '../components/Sheet'
// Every product screen has its own issue. This is the shell's stand-in so routes resolve
// and the frame can be judged on its own before the screens land.
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <Sheet>
      <h1>{title}</h1>
      <p className="mt-3 type-ui text-ink-muted">{note}</p>
    </Sheet>
  )
}
