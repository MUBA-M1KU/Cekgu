# Frontend redesign proposals

Three complete visual directions for Cekgu's frontend, built as standalone HTML against the deployed build and the real
sample record. **Direction C is chosen**, and has been revised against the owner's notes; A and B are kept as the record
of what was decided against. No product code is touched by anything in this directory — adopting C means a separate
change to `src/client/` and to [`../DESIGN.md`](../DESIGN.md).

Raised by [issue #44](https://github.com/MUBA-M1KU/Cekgu/issues/44). The design system these argue with is
[`../DESIGN.md`](../DESIGN.md), which stays canonical until a direction is adopted and folded into it.

Contents:

1. [How to look at them](#how-to-look-at-them)
1. [The three directions](#the-three-directions)
1. [What changed in C after it was chosen](#what-changed-in-c-after-it-was-chosen)
1. [The second revision](#the-second-revision)
1. [The third revision](#the-third-revision)
1. [What the diagnosis rests on](#what-the-diagnosis-rests-on)
1. [Quality checks run against these files](#quality-checks-run-against-these-files)
1. [What is deliberately not here](#what-is-deliberately-not-here)

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
| `mascot-sprites.png`                         | The eight-pose mascot sheet. 1152 x 576, four columns by two rows, 288 px cells |
| `cat-*.png`                                  | The four poses direction C places, cut from the same renders as the sheet       |

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
- **The hero carries a generated video.** `hero.mp4` is 9 seconds, 1280 x 720, 651 KB, no audio track, with
  `hero-poster.jpg` and a CSS gradient behind it so the hero is composed before a byte of video arrives. It was
  generated in Gemini and regenerated twice: the first pass laid down **navy** ink, which contradicts the design
  system's rule that red is the human hand and nothing else is, and the second cut the pen in mid-air with the mark
  still on the page at the last frame. **The loop is baked into the asset.** The clip is the generated ten seconds minus
  its first second, and that first second is cross-dissolved back in over the tail, so the file's own first and last
  frames are consecutive frames of the source and plain `loop` shows no cut. Re-cutting `hero.mp4` without that dissolve
  brings the cut back
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

Gemini bakes a four-point sparkle into the frame at roughly 91% across and 83% down — its AI-content mark. The hero
scales the clip **1.14x from its top left**, which carries that corner past the right edge of the visible crop. It costs
14% of the frame rather than the 26% the first pass spent, and the better half is what survives: the nib and the marked
bubble sit top-left, the lower right is empty paper.

This is checked rather than assumed. A script walks the live DOM at **sixty viewport sizes**, from 768 x 700 to 2560 x
1440, computes where the sparkle lands under `object-fit: cover` plus the element transform, and asserts its bounding
box falls outside the media box. All sixty are clean.

**The mark has not been removed from `hero.mp4`.** Stripping a provider's provenance mark from an asset is a decision
about how the project represents its own material, not a formatting choice, so it is left for the owner to make
deliberately. Anyone reframing or reusing this clip should know the mark is in the file.

## The third revision

Four more notes from the owner, after seeing the second revision.

- **The cats are redrawn.** The generated chibi pair was still a flat vector cartoon with a black outline, which reads
  as clip art beside a photographic hero. The set is now soft-matte 3D: no outlines, one diffuse key light from the
  upper left, chibi proportions, pointed neko ears, and a matte finish with no specular. The art direction is
  **PandAI**, the mascot set the owner made for another project, named as the reference rather than approximated from
  memory
- **There is a sprite sheet.** Eight poses on `mascot-sprites.png`, Tororo on the top row and Hijiki on the bottom, four
  columns each: bust, reading, considering and greeting for Tororo; bust, on the edge, flagging and asleep for Hijiki.
  `index.html` shows the sheet by driving `background-position` over the real file, so what is on that page is the sheet
  working rather than a picture of it
- **The hero carries one cat, not two.** Hijiki is draped over the line where the hero ends: body on the light ground,
  both front paws hanging across the ticker band below it
- **The record workspace centres its content.** `.doc` capped the measure at 60 rem without an auto margin, so the whole
  document hung off the left edge of a 100 rem container and left a gutter of up to 320 px on the right alone

### Placing the hero cat

The pose was rendered around an invisible ledge, and the alpha channel says where it falls: scanning row coverage, the
body ends and the two hanging paws begin at **66.3%** of the image height. So the offset that puts the paws on the
boundary is `calc(var(--cat-w) * -0.345)` — that fraction times the 1.025 aspect ratio — computed from the artwork
rather than nudged until it looked right. Resizing the cat keeps the grip on the line.

Only three of the eight poses are placed: the hero, the two evidence-panel avatars, and the empty state. The empty state
takes the sleeping pose, because a reader with nothing to read is asleep and that is the state the screen is reporting.
The other five exist so that a screen needing a character later does not need a new render on the day.

Two notes for anyone re-exporting these. The empty state's mascot sits on a disc of `--sunk`, because the sleeping pose
is a black cat and the dark theme's card is within a few points of the same value; the disc is the ground it needs, not
decoration. And the PNGs are colour-quantised to 255 entries but keep their **original alpha channel byte for byte** — a
straight palette conversion folds the transparent background into a low-alpha entry, which is invisible on a light
ground and a pale square around the cat on a dark one.

**The two cats are not drawn in one consistent fur language.** The busts and Tororo reading came back tufted; the
remaining five came back smooth. Every pose that shares a screen with another shares its treatment, so nothing on screen
is mismatched, but anyone extending the set should generate against the smooth renders and expect to redo the busts.

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
rather than by eye.

Five more are fixed and worth naming, because each was reached for by reflex:

- A tracked-caps eyebrow above the headline, on **all four** pages
- Text below the system's own 12 px floor
- Skipped heading levels
- A pulsing dot announcing liveness on a static page
- A decorative repeating-gradient texture

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

The third revision was measured against that same baseline rather than reported on its own: the detector returns the
**identical set of findings** on `c-two-readers.html` and `index.html` before and after it, rule for rule and count for
count, so the mascot work and the centring fix introduced nothing new.

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
