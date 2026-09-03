# Frontend redesign proposals

Three complete visual directions for Cekgu's frontend, built as standalone HTML against the deployed build and the real
sample record. They exist to be chosen between; **none of them ships until one is picked**, and no product code is
touched by anything in this directory.

Raised by [issue #44](https://github.com/MUBA-M1KU/Cekgu/issues/44). The design system these argue with is
[`../DESIGN.md`](../DESIGN.md), which stays canonical until a direction is adopted and folded into it.

## How to look at them

Open [`index.html`](index.html) in a browser. It carries the diagnosis, the three directions side by side and a
recommendation, and links to each. Everything is static: no build step, no server, no dependency beyond Google Fonts.

| File                                         | What it is                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| [`index.html`](index.html)                   | The cover. Diagnosis, comparison table, recommendation. **Start here**          |
| [`a-marked-paper.html`](a-marked-paper.html) | Direction A. Landing, sign-in and record workspace                              |
| [`b-instrument.html`](b-instrument.html)     | Direction B. Same three screens                                                 |
| [`c-two-readers.html`](c-two-readers.html)   | Direction C. Same three screens                                                 |
| `_shared.css`                                | The band that labels each screen. Frame chrome only, shared by nothing else     |
| `current-*.jpg`                              | The deployed screens as they were on 3 September, so the diagnosis is evidenced |

Each direction page is one scroll through three screens, separated by a labelled black band. The band is not part of any
design; it is there so a screen can be judged without the label competing with it.

## The three directions

- **A · Marked Paper.** Builds the metaphor the design system already claims. A darker desk so the sheet reads as a
  physical object, a ruled red margin, and a verdict rendered as a hand-drawn ring around the option the two readers
  actually chose
- **B · Instrument.** Reframes Cekgu as an apparatus rather than a document. Dark, dense and mono-forward, with a
  reading matrix that puts all twelve questions, both readers and the key on one screen, and request ids promoted to a
  standing fixture
- **C · Two Readers.** Makes the answer bubble the entire visual language, from 420 px in the hero to 12 px in a row,
  and turns the five verdicts into a colour palette rather than five chips

## What the diagnosis rests on

Measured against the deployed build at 1440 px and at 853 px, which is a 1280 px projector at the 150% zoom the demo
runs at. The findings that drove the work:

1. Every page is one centred sheet holding a vertical stack, so no page has a shape that differs from any other page's
1. `#fbfaf7` on `#f1efea` is a two percent luminance step, so the sheet never reads as an object on a desk
1. Roughly 45% of the hero panel is empty, and the marketing site never shows the product
1. The record workspace renders a five-option disposition form on all twelve items, open, always. The sample record is
   **5 076 px tall**
1. A Clear item and a Possible Key Error item have the same type size, row height and controls
1. Sign-in is a 575 px form in a 1130 px panel with about 400 px of empty ground beneath it

## Quality checks run against these files

`impeccable`'s slop detector was run over this directory, and the first pass returned **122 findings**. Sixty-nine were
genuine WCAG AA contrast failures introduced by darkening the grounds without re-solving the muted text on them, and
those are fixed: every text token in all four files now clears 4.5:1 on every ground it sits on, solved numerically
rather than by eye. Also fixed, and worth naming because they were reached for by reflex: a tracked-caps eyebrow above
the headline on **all four** pages, text below the system's own 12 px floor, skipped heading levels, a pulsing dot
announcing liveness on a static page, and a decorative repeating-gradient texture.

**Twenty-five findings are declined**, with reasons, so they are not re-litigated:

- **`all-caps-body` ×11.** These are eyebrow labels and table headers, which [`../DESIGN.md`](../DESIGN.md) explicitly
  sanctions uppercase for. The check counts characters and cannot separate a label from body copy
- **`cramped-padding` ×7.** Bordered containers whose children carry their own padding. The check tests the container
- **`gpt-thin-border-wide-shadow` ×6.** Now 18 px blur in A and 24 px in B, down from 46 and 60. A raised sheet needs a
  contact shadow; these are the smallest values that still read as elevation
- **`dark-glow` ×1.** A false positive, verified: every `box-shadow` on that page computes to a neutral, checked by
  walking the live DOM for any shadow whose colour is not neutral. Worth adding to
  [#118](https://github.com/MUBA-M1KU/Cekgu/issues/118) as a false-positive class

All four pages render with **zero page errors and no horizontal overflow** at 1440 px and 853 px.

## What is deliberately not here

- **No product code.** These are static proposals. Adopting one means a separate change to `src/client/` and to
  [`../DESIGN.md`](../DESIGN.md)
- **No dashboard, records list, new-check or settings screen.** Landing, sign-in and the record workspace are the three
  the demo and the judging turn on. The rest follow from whichever direction wins
- **No shader, particle or liquid effect**, despite the references that prompted this pointing at them. The motion
  budget went to the one animation per direction that carries information; the honest read is that a teacher reviewing a
  paper under time pressure is not the audience for an effects layer
