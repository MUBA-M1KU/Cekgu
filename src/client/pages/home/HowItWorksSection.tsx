import { useEffect, useRef, useState } from 'react'

// Each step leads with the glyph it produces, so the sequence is legible before a word of it is
// read: four bare options, then a letter both readers ringed, then one reading admitted and one
// discarded, then the key beside what the readers actually said, then the mark only you can make.
// `id` because a figure can hold the same letter twice — step three shows one B admitted and
// one discarded — so the letter alone does not identify a slot.
type Slot = { id: string; letter: string; key?: true; a?: true; b?: true; void?: true; pen?: true }

const STEPS: { title: string; detail: string; figure: Slot[] }[] = [
  {
    title: 'You Type the Questions',
    detail:
      'Stem, options and the answer you keyed. Cekgu checks the set for missing stems, duplicate options and absent keys before spending a single request.',
    figure: [
      { id: 'a', letter: 'A' },
      { id: 'b', letter: 'B' },
      { id: 'c', letter: 'C' },
      { id: 'd', letter: 'D' }
    ]
  },
  {
    title: 'Two Models Answer Blind',
    detail:
      'Your key is withheld, and neither model sees the other. Each returns the option it commits to, every option it considers defensible, and its reasoning.',
    figure: [
      { id: 'agreed', letter: 'B', a: true, b: true },
      { id: 'c', letter: 'C' }
    ]
  },
  {
    title: 'Each Reading Is Verified',
    detail:
      'A reading only counts if the gateway did not substitute a different model and the public receipt names the model we asked for. Anything else is recorded and discarded.',
    figure: [
      { id: 'admitted', letter: 'B', a: true },
      { id: 'discarded', letter: 'B', void: true }
    ]
  },
  {
    title: 'A Fixed Rule Decides',
    detail:
      'The two readings are compared with each other first, and only then with your key. The same rule runs every time, and the sentence it produces is printed on screen.',
    figure: [
      { id: 'key', letter: 'A', key: true },
      { id: 'readers', letter: 'B', a: true, b: true }
    ]
  },
  {
    title: 'You Review What Was Flagged',
    detail:
      'Risky items first, clean items still there as the control. Open any item to see both readings and their receipts side by side.',
    figure: [{ id: 'mark', letter: '✓', pen: true }]
  }
]

export function HowItWorksSection() {
  // The rail marks where the reader is, so it needs the panel currently under the reading line
  // rather than the first one on screen. Nothing animates: the attribute only moves emphasis.
  const [active, setActive] = useState(0)
  const panels = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const onScreen = entries.filter((entry) => entry.isIntersecting)
        if (onScreen.length === 0) return
        const highest = onScreen.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b))
        const index = panels.current.indexOf(highest.target as HTMLLIElement)
        if (index !== -1) setActive(index)
      },
      // A narrow band near the top rather than across the middle. Mid-viewport looks right while
      // scrolling and is wrong the moment a rail link is used: the panel jumped to sits at the top,
      // so the middle of the screen is already showing the step after it, and the rail marks the
      // wrong one at the exact moment the reader is watching it.
      { rootMargin: '-15% 0px -75% 0px' }
    )
    for (const panel of panels.current) if (panel) observer.observe(panel)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="wrap py-[clamp(4rem,8vw,7rem)]">
      <div className="hiw-grid">
        <div className="hiw-rail">
          <p className="hiw-kicker type-mono">How It Works</p>
          <h2 className="mt-4 text-[clamp(2rem,3.4vw,2.75rem)]/[1.1] tracking-[-0.025em]">
            Five steps, and you make the last one.
          </h2>
          <p className="type-ui mt-5 text-[1.0625rem]/[1.6] text-ink-muted">
            Cekgu is a first pass, not a vetting committee. It never changes a key, edits a question or approves a
            paper. It does not certify a paper, change a key, or grade anyone. Every decision on this page is yours.
          </p>

          {/* Links rather than labels: the rail is a table of contents that also reports position,
              which is the only thing that earns a numbered list of five items down the side. */}
          <ol className="hiw-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <a
                  href={`#how-step-${index + 1}`}
                  className="hiw-step"
                  data-active={index === active ? 'true' : undefined}
                  aria-current={index === active ? 'step' : undefined}
                >
                  <span className="hiw-step-num type-mono">{String(index + 1).padStart(2, '0')}</span>
                  <span className="hiw-step-title">{step.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* An ordered list because these genuinely happen in order, not because numbers look tidy. */}
        <ol className="hiw-panels">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              id={`how-step-${index + 1}`}
              className="hiw-panel card-soft"
              ref={(element) => {
                panels.current[index] = element
              }}
            >
              <div className="read-row hiw-figure" aria-hidden="true">
                {step.figure.map((slot) => (
                  <span
                    key={slot.id}
                    className="slot"
                    data-key={slot.key}
                    data-reader-a={slot.a}
                    data-reader-b={slot.b}
                    data-void={slot.void}
                    data-pen={slot.pen}
                  >
                    {slot.letter}
                  </span>
                ))}
              </div>
              <div className="hiw-panel-text">
                <p className="hiw-panel-num type-mono">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="hiw-panel-title">{step.title}</h3>
                <p className="type-ui mt-3 max-w-[52ch] text-ink-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-[1.125rem]">You Decide, Not the Model</h3>
          <p className="type-ui mt-3 max-w-[64ch] text-ink-muted">
            A verdict is a place to look. You record what you actually did: corrected the key, revised the wording,
            confirmed the key was right, dismissed the flag, or asked for another attempt. Your decision is stored
            beside the machine verdict without replacing it, so the history shows both what Cekgu observed and what you
            decided.
          </p>
        </div>
        <div>
          <h3 className="text-[1.125rem]">Receipts</h3>
          <p className="type-ui mt-3 max-w-[64ch] text-ink-muted">
            Every reading carries the Gonka request id of the call that produced it, and every id links to the gateway's
            public receipt. The receipt names the model that actually served the request, which is how Cekgu proves two
            readings came from two different families rather than the same one twice. It is not cryptographic or
            on-chain proof, and model agreement is not the same as truth.
          </p>
        </div>
      </div>
    </section>
  )
}
