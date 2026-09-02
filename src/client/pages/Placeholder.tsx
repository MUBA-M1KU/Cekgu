// Every product screen has its own issue. This is the shell's stand-in so routes resolve
// and the frame can be judged on its own before the screens land.
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <section className="rounded-sheet border border-rule bg-sheet p-4 shadow-[var(--shadow-sheet)] sm:p-8">
      <h1>{title}</h1>
      <p className="mt-3 type-body text-ink-muted">{note}</p>
    </section>
  )
}
