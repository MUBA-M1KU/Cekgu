# Frontend redesign proposals

Three complete visual directions for Cekgu's frontend, built as standalone HTML against the deployed build and the real
sample record. **Direction C is chosen**, and has been revised against the owner's notes; A and B are kept as the record
of what was decided against. No product code is touched by anything in this directory — adopting C means a separate
change to `src/client/` and to [`../DESIGN.md`](../DESIGN.md).

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

## What changed in C after it was chosen

Six revisions, all from the owner's notes on 3 September.

- **The landing takes the structure of SolarSim, another project of the owner's**: a sticky nav that solidifies on
  scroll, a full-viewport hero with background media behind a two-axis scrim, a marquee trust band, then sections
- **Four routes became one page.** How It Works, Sample Report, Pricing and Trust and Privacy are sections with anchors,
  not separate screens
- **The hero carries a generated video.** `hero.mp4` is 10 seconds, 1280 x 720, 539 KB, no audio track, with
  `hero-poster.jpg` and a CSS gradient behind it so the hero is composed before a byte of video arrives. It was
  generated in Gemini and regenerated once: the first pass laid down **navy** ink, which contradicts the design system's
  rule that red is the human hand and nothing else is
- **Sign-in loses the shared-workspace note** and both cards centre their content
- **The record workspace gets a topbar and a drawer.** The drawer is MakanLah's pattern, from the same owner rather than
  SolarSim's hover rail: a modal dialog with a blurred scrim, a sliding panel, and a hamburger at the topbar's leading
  edge
- **Tororo and Hijiki appear in seven places, not one.** They were a single 240 x 160 stage on one authenticated screen.
  They are now the hero pair, step two of How It Works, the Reader A and Reader B avatars in every evidence panel, the
  sign-in greeting, the topbar run indicator, the drawer footer beside the reduce-motion setting, and the empty state

The evidence-panel use is the one that earns its place rather than decorating: the cats are the two **seats**, never a
particular model. Which family serves a seat varies per item, so a fixed cat-to-model mapping would be a lie.

## The second revision

Four more notes from the owner, after seeing the first revision.

- **The mascot images are generated now, not cropped from the Live2D preview.** `cat-tororo.png` and `cat-hijiki.png`
  are a chibi pair produced through the Codex CLI in one image and split, so the two read as siblings rather than as two
  separate generations. They carry their own outline, which is why the tinted disc that was propping the white cat up on
  white surfaces could go. The Live2D rig is unchanged and still owns the animated stage
- **The mascot appears in three places, not seven.** Hero, the Reader A and Reader B avatars in the evidence panel, and
  the empty state. Dropped: the topbar run indicator, the drawer footer, the sign-in greeting, and step two of How It
  Works — that last one put the cats 200 px below the hero that already introduces them, and the same claim is made more
  precisely by two rings converging on one bubble
- **Sign-in is back to the first version**: one card beside a quiet figure rather than two centred cards, and without
  the shared-workspace note
- **The post-auth shell is SolarSim's, taken as-is.** A 64 px rail that expands to 200 px on hover with a blurred
  backdrop, section headings that crossfade from divider to label, an active item marked by a 2 px bar; a 56 px glass
  topbar offset by the rail carrying breadcrumbs, a theme switch, a notification popover with an unread badge and a
  profile popover; and the padded content container. The footer is MakanLah's: right-aligned, stacked, glass, and
  deliberately almost empty

### The hero clip carries a watermark, and it is still there

Gemini bakes a four-point sparkle into the frame at roughly 91% across and 83% down — its AI-content mark. The hero now
shows the **top-left 80%** of the clip, which moves the mark out of view and is also the better crop: the nib and the
marked bubble sit there and the lower right is empty paper.

**The mark has not been removed from `hero.mp4`.** Stripping a provider's provenance mark from an asset is a decision
about how the project represents its own material, not a formatting choice, so it is left for the owner to make
deliberately. Anyone reframing or reusing this clip should know the mark is in the file.

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

`impeccable`'s slop detector was run over this directory. The first pass returned **122 findings**. Sixty-nine were
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

Re-running it after C's revision found eight more contrast failures introduced by the new recessed evidence ground, and
those are fixed the same way. Two findings are new and declined: `marquee` on the trust band, which is the structure the
owner asked for and which the reduced-motion reset in `_shared.css` stops outright; and one `tight-leading`, which is a
4.75 rem display line at 1.05 and correct at that size.

All four pages render with **zero page errors and no horizontal overflow** at 1440 px and 853 px.

## What is deliberately not here

- **No product code.** These are static proposals. Adopting one means a separate change to `src/client/` and to
  [`../DESIGN.md`](../DESIGN.md)
- **No dashboard, records list, new-check or settings screen.** Landing, sign-in and the record workspace are the three
  the demo and the judging turn on. The rest follow from whichever direction wins
- **No shader, particle or liquid effect**, despite the references that prompted this pointing at them. The motion
  budget went to the one animation per direction that carries information, plus the hero video; the honest read is that
  a teacher reviewing a paper under time pressure is not the audience for an effects layer
- **The cats are not in the mark, the favicon or the wordmark.** They are licensed Live2D sample characters, so they
  appear in the product and never as Cekgu's own identity. That line is in [`../DESIGN.md`](../DESIGN.md) and holds
