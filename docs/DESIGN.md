# Cekgu design system

This document owns **how Cekgu looks and moves**: identity, colour, type, spacing, layout, components, motion, the
mascot's behaviour and the capitalisation and accessibility rules the frontend is held to. [`PRODUCT.md`](PRODUCT.md)
owns the product: who it serves, the verdicts, the dispositions and the demo. [`PRD.md`](PRD.md) owns what must ship.

Where a screen and this file disagree, fix the screen. Where this file and PRODUCT.md disagree about meaning, PRODUCT.md
wins and this file is corrected.

Cekgu is a review document, not a dashboard. Everything below is built from four objects the product already has: the
exam paper, the OMR answer-bubble row, the vetting committee's red pen, and two readers of opposite tone (Tororo, a
white cat, and Hijiki, a black cat). If a decision cannot be traced to one of those four, it is decoration and does not
belong.

Contents:

1. [Identity](#identity)
1. [Colour](#colour)
1. [Typography](#typography)
1. [Spacing, radius, borders and elevation](#spacing-radius-borders-and-elevation)
1. [Layout](#layout)
1. [Components](#components)
1. [Motion and the mascot](#motion-and-the-mascot)
1. [Capitalisation](#capitalisation)
1. [Accessibility](#accessibility)
1. [Tells this system avoids](#tells-this-system-avoids)

## Identity

### Name

**Cekgu**, a Malaysian compression of "check" and "cikgu" (teacher). Written with a capital C and no other styling. It
is never `CEKGU`, `cekgu` or `Cek-gu` in product chrome, and it takes no article: "Cekgu reduces", not "The Cekgu".

### The mark

Two OMR answer bubbles overlap. The left one is **filled with ink**, the right one is **an open ring**, and the ring is
knocked out of the filled bubble where they cross so both stay legible as separate circles. A **red pen check** starts
inside the filled bubble and sweeps up through the ring.

Each part means one thing:

- **Two bubbles, two tones.** The filled bubble and the open ring are the two independent readers. They share the same
  ink because they do the same job; they differ in tone because they are different readers. This is Hijiki and Tororo in
  geometry, never as a cat illustration. The mark carries no ears, eyes or whiskers
- **The overlap.** The readers commit separately, and Cekgu looks at where their readings coincide. The lens between the
  two circles is that comparison
- **The red check.** The human's pen. It is the only red in the mark and it crosses both readers, because the verdict is
  not final until an educator has marked it

The ink is `currentColor`, so the mark takes the text colour of wherever it sits and needs no light and dark variants.
The accent is the one explicit fill, `#B3202F`, and does not change between themes: on the dark ground the pen red sits
on the paper-coloured ink and reads as the same pen.

### Assets

All four files live under `public/brand/`. They are hand-authored SVG with a `viewBox`, one compound path for the ink
and one stroke for the pen, no raster and no filters.

| File                 | Contents                                                | Intended sizes                                                  |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| `cekgu-mark.svg`     | Symbol only, `viewBox 0 0 64 64`, ink in `currentColor` | 16 px (tab, inline), 24 px (nav), 48 px (record header), 512 px |
| `cekgu-wordmark.svg` | The name as SVG `<text>`, `viewBox 0 0 160 48`          | 96 px to 320 px wide                                            |
| `cekgu-lockup.svg`   | Mark plus wordmark, `viewBox 0 0 240 64`                | 120 px to 480 px wide; the deck, the README, the home page      |
| `favicon.svg`        | Mark on a solid paper ground with a 12-unit corner      | 16 px and 32 px tabs, 180 px touch icon after rasterising       |

The wordmark and lockup set the name as `<text>` in `'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif` at weight
700 with a `-0.8` unit tracking. They render exactly wherever the Google Font is loaded, which includes the app and the
deck, and fall back to Helvetica or Arial elsewhere, including a bare GitHub file preview.

Converting the text to outlines is a later task once the face is final. Until then, do not paste the wordmark into a
context that cannot load the font and expect the exact letterforms.

### Usage rules

- The mark sits on paper or ink, never on a photograph, a gradient or a verdict tint
- Clear space around the mark is one bubble radius (17 of the 64 units) on every side
- Below 24 px use the mark alone; the wordmark is not legible under 96 px wide
- Do not recolour the pen. If the accent cannot be shown, use the mark in one ink colour with the check in the same ink
- Do not rotate, outline, shadow or animate the mark. The only motion in the identity is the mascot's
- The cats are licensed Live2D sample characters, credited per FR-MASCOT-5. They appear in the product, never in the
  mark, the favicon or the deck's title slide as if they were Cekgu's own

## Colour

The palette is paper and ink with one pen. Neutrals are deliberately **hue-biased**: the paper is a warm grey like
photocopied exam stock, not cream and not white; the ink is blue-black like a fountain pen, not `#000` and not a neutral
grey. The five verdict colours are semantic and are never used for anything but verdicts.

### The rule that decides what is red

**Ink is the paper and the machine. Red is the human hand.** Machine verdicts, model names, request ids and status text
are never red. Red appears only where an educator marks something:

- The pen check in the mark
- A disposition bubble the educator has filled
- The attention count that is asking for their decision
- The confirm button of a destructive dialog

Filled red surfaces exist in exactly two places, the marked disposition bubble and the destructive confirm button.
Everywhere else red is a stroke, a glyph or text.

### Tokens

The frontend copies this block verbatim into its global stylesheet. Every token is written once with `light-dark()`, so
there is one source of truth per colour; `color-scheme` follows the system unless a `data-theme` attribute on the root
forces one side. `light-dark()` and `color-mix()` are supported in every evergreen browser since 2024, and the demo runs
on one.

```css
:root {
  color-scheme: light dark;

  --paper: light-dark(#f1efea, #12171e); /* the desk: page ground */
  --sheet: light-dark(#fbfaf7, #1a2029); /* the review document and every raised surface */
  --well: light-dark(#eae7e0, #222a35); /* recessed areas: evidence panel, code, table stripes */
  --ink: light-dark(#17202b, #eceae4); /* text, filled bubbles, primary buttons */
  --ink-muted: light-dark(#4f5a68, #a6afba); /* secondary text, helper text, timestamps */
  --rule: light-dark(#d6d2c9, #323b47); /* hairlines between rows, non-interactive borders */
  --rule-strong: light-dark(#7a828c, #6b7682); /* input and control borders, at least 3:1 on the sheet */
  --pen: light-dark(#b3202f, #f07079); /* the human's red: dispositions, attention count, delete */
  --pen-ink: light-dark(#fbfaf7, #12171e); /* text on a filled pen surface */
  --on-ink: light-dark(#fbfaf7, #12171e); /* text on a filled ink surface */

  --verdict-clear: light-dark(#2c6e49, #7cc79c);
  --verdict-key-error: light-dark(#a34a08, #f2a468);
  --verdict-ambiguity: light-dark(#6b4fbb, #b9a6f2);
  --verdict-split: light-dark(#2456a6, #8fb8f7);
  --verdict-unverified: light-dark(#5b6470, #a0aab6);

  --focus: var(--ink);
  --focus-halo: var(--sheet);
  --shadow-tint: light-dark(rgb(23 32 43 / 0.06), transparent);
  --shadow-overlay-tint: light-dark(rgb(23 32 43 / 0.18), rgb(0 0 0 / 0.5));
  --shadow-sheet: 0 1px 2px var(--shadow-tint);
  --shadow-overlay: 0 12px 32px var(--shadow-overlay-tint);
}

:root[data-theme='light'] {
  color-scheme: light;
}

:root[data-theme='dark'] {
  color-scheme: dark;
}
```

Chip backgrounds are derived, not listed, so a verdict has one source of truth:
`background: color-mix(in oklab, var(--verdict-clear) 12%, var(--sheet))` with the text in the verdict colour. A 12%
tint moves the ground's luminance by less than a tenth of a contrast step, so the ratios below hold on chips too.

Measured contrast against `--sheet`, light then dark: ink 15.7 and 13.6; ink-muted 6.7 and 7.4; pen 6.4 and 5.7; clear
5.9 and 8.2; key error 5.7 and 8.0; ambiguity 5.8 and 7.6; split 6.8 and 8.1; unverified 5.8 and 7.0. Every text colour
also clears 4.5:1 on `--well` in both themes. On the dark ground the sheet is lighter than the paper, so elevation is
carried by tone and no shadow is needed.

### The five verdicts

Hues were chosen for what each verdict asks the educator to do, and the pen red was kept out of the set so a verdict
never looks like a human decision. Every verdict carries a glyph drawn from the bubble row and a text label, because
NFR-UX-3 forbids colour as the only signal.

| Verdict                | Colour                 | Glyph                                     | Why this hue                                                        |
| ---------------------- | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| **Clear**              | Moss green `#2C6E49`   | One filled bubble                         | Quiet. Clear is the control, not a certificate, so it must not glow |
| **Possible Key Error** | Burnt orange `#A34A08` | Filled bubble with a second bubble ringed | The hottest verdict without borrowing the pen's red                 |
| **Possible Ambiguity** | Violet `#6B4FBB`       | Two half-filled bubbles                   | Neither warm nor cold: the wording, not the key, needs work         |
| **Split Opinion**      | Ink blue `#2456A6`     | Two bubbles filled, pointing apart        | Closest to ink because the machine has no opinion to offer          |
| **Unverified**         | Slate `#5B6470`        | One dashed bubble                         | Deliberately the least saturated: no evidence, no colour claim      |

## Typography

Three faces, each with one job, all from Google Fonts:

- **Source Serif 4** is the paper. Question stems, options, the supplied key, and each reader's rationale are set in it,
  because those words were written by a person and this is what they look like on an exam sheet. It is the only face
  that ever appears in italic, and only for a reader's rationale
- **Schibsted Grotesk** is Cekgu's own voice: navigation, headings, labels, buttons, verdict and status text, helper
  copy, errors. It is a newspaper grotesque with enough character at 700 to carry the display sizes on the home page and
  the deck without a second display face
- **Spline Sans Mono** is for anything a machine issued and a human might copy: request ids, model ids, receipt fields,
  timestamps in the attempt table, counts in filters. It is always set with `font-variant-numeric: tabular-nums` and
  `slashed-zero`

The split is the structure. A reader can tell at a glance whether text came from the paper, from Cekgu, or from the
gateway, without a label saying so.

### Stacks

```css
--font-paper: 'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
--font-ui: 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Spline Sans Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

Load the three families from Google Fonts with `display=swap`, weights 400 and 600 for Source Serif 4 (plus 400 italic),
400, 500 and 700 for Schibsted Grotesk, and 400 and 500 for Spline Sans Mono. Nothing else is loaded.

### Scale

Sizes are in pixels for clarity and shipped as `rem`. Line heights are unitless.

| Role      | Size | Line | Face  | Weight | Used for                                                       |
| --------- | ---- | ---- | ----- | ------ | -------------------------------------------------------------- |
| Display   | 38   | 1.1  | UI    | 700    | Home page headline and the deck only. Never inside the product |
| Heading 1 | 30   | 1.15 | UI    | 700    | Record title                                                   |
| Heading 2 | 24   | 1.2  | UI    | 700    | Page section: Summary, Items, Evidence                         |
| Heading 3 | 20   | 1.25 | UI    | 600    | An item's stem heading in the review, dialog titles            |
| Lead      | 17   | 1.5  | Paper | 400    | A question stem                                                |
| Body      | 15   | 1.55 | Paper | 400    | Options, rationale, trust copy                                 |
| UI        | 15   | 1.45 | UI    | 400    | Buttons, controls, helper text, status sentences               |
| Label     | 13   | 1.3  | UI    | 500    | Uppercase eyebrow labels, table headers, chip text             |
| Caption   | 12   | 1.4  | UI    | 400    | Timestamps, attribution, expiry                                |
| Mono      | 13   | 1.5  | Mono  | 400    | Request ids, model ids, receipt fields                         |

Weights: 700 is reserved for headings and the wordmark; 600 for emphasis inside UI text and the paper face's bold; 500
for labels and chip text; 400 for everything else. There is no 300 and no 800.

Letter-spacing: display and heading 1 at `-0.02em`; heading 2 at `-0.01em`; uppercase labels at `+0.06em` with
`text-transform: uppercase`; mono at `0`. Uppercase is used only for eyebrow labels and table headers, never for buttons
or body copy.

## Spacing, radius, borders and elevation

### Spacing

A 4-based scale with named steps. Use the tokens; do not write raw pixel margins.

```css
--s-1: 4px; /* icon to label, glyph to chip text */
--s-2: 8px; /* between controls in a group, inside chips */
--s-3: 12px; /* inside inputs and buttons, between a label and its field */
--s-4: 16px; /* row padding, between paragraphs */
--s-5: 24px; /* between blocks inside the sheet */
--s-6: 32px; /* sheet padding on desktop, between items */
--s-7: 48px; /* between sections */
--s-8: 64px; /* home page section rhythm */
--s-9: 96px; /* home page hero */
```

Mobile halves the two largest steps: sheet padding drops from `--s-6` to `--s-4` and section spacing from `--s-7` to
`--s-5`.

### Radius

Two radii, each with a name that says what it is for:

- `--r-bubble: 999px`. Anything descended from the OMR bubble is round: verdict chips, status chips, filter counts, the
  disposition bubbles, avatars, the mascot's stage badge
- `--r-sheet: 4px`. Anything descended from paper is nearly square: the sheet, inputs, buttons, dialogs, the evidence
  panel, tables. Paper has corners

There is no medium radius. If a component does not know whether it is a bubble or a sheet, it is a sheet.

### Borders and elevation

Separation is spent by role. Three levels exist and nothing invents a fourth:

- **Level 0, flat.** Rows inside the sheet are separated by a 1 px `--rule` hairline, not by cards, gaps or shading. The
  bubble row, attempt rows, record rows and the option list are all level 0
- **Level 1, the sheet.** The review document, the records table, the form and the home page's panels sit on `--sheet`
  with a 1 px `--rule` border and `--shadow-sheet`. On dark the shadow is off and the lighter tone does the work. There
  is one sheet per page; a sheet never contains another sheet
- **Level 2, overlay.** Dialogs, the receipt popover and menus use `--shadow-overlay` and a 1 px `--rule-strong` border.
  Overlays are the only surfaces that cast a visible shadow on dark

Recessed areas use `--well` with no border at all: the evidence panel, code, the guest banner's inner note. Inputs use a
1 px `--rule-strong` border and no fill. No surface uses a left-hand colour rail, a gradient border or a glass effect.

## Layout

### The review document

The record workspace is one sheet, at most 880 px wide, centred on the paper ground with `--s-6` padding. It reads top
to bottom like the paper it reviews:

1. **Header.** Record title (heading 1), subject and language as a caption line, the record status chip, and for Guest
   records the expiry. The **Sample** label from FR-SAMPLE-2 sits here as a status chip in ink, not a banner
1. **Summary.** Five verdict filters in one row, each a chip with its count in mono. They are both the summary counts
   and the filter, so the same numbers are never printed twice. The attention count sits at the row's end in pen red,
   because it is the number asking for a decision
1. **Items.** Attention items first, then **Clear**, per FR-RECORD-3. Each item is a level-0 row, numbered with the
   paper's own item number in a 40 px left gutter in mono. The numbering is the paper's, so it is allowed
1. **Evidence.** Opens inline beneath its item as a `--well` panel, never as a separate page, so two model names and two
   request ids are on the same screen as the stem (FR-EVIDENCE-1)

### Item rows

An item row shows, left to right: the item number, the stem (lead, paper face), then the bubble row beneath it with the
supplied key filled in ink. The verdict chip sits at the row's right edge on desktop and beneath the stem on mobile,
followed by the disposition chip once one exists.

Below the bubble row, one sentence in UI face states the rule that fired, in the words FR-VERDICT-4 requires: "Both
readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key
Error."

### Record rows

The records library is a level-1 table with the six FR-RECORD-5 columns: Title, Subject, Questions, Status, Attention,
Updated. Questions and Attention are mono and right-aligned. Status is a chip. Attention shows its number in pen red
when non-zero and a dash in `--ink-muted` when zero.

Row hover uses `--well`. The selected state adds a 2 px ink inset on the left edge of the row, which is a selection mark
on a table row, not a card rail. Bulk actions appear in a toolbar above the table only when a selection exists
(FR-RECORD-6).

### The evidence panel

Two columns from 720 px, stacked below it. Each column is one reader, top to bottom:

- The served model name as a label
- The reader's own bubble row with its choice filled
- The rationale in paper italic
- A mono block with request id, requested model, served model and receipt status. The request id is selectable text and
  is followed by a **View Receipt** text button, which opens the [receipt page](#the-receipt-page) in a new tab

From 720 px **the two columns share one row grid**. The model name, the bubble row, the rationale and every line of the
mono block sit on the same baseline in both readers, however long either rationale runs. This is an invisible table:
alignment is the only thing the grid contributes, and no rule, cell or divider is drawn. A reader with nothing to say in
a row leaves that row empty rather than pulling the rest of its column up.

Beneath both columns the attempt table lists every attempt (FR-EVIDENCE-2) as level-0 rows. If only one family answered,
the second column holds that family's attempt history under the heading **No Second Reading**, never a duplicate of the
first (FR-EVIDENCE-4).

### The receipt page

`/receipt/<request-id>`, public and reachable signed out, one sheet. A request id anywhere in the product links here
rather than to the gateway's raw JSON, which is not a page a judge should be handed mid-pitch.

- **The heading is `Gonka Receipt`** and the request id sits under it in mono, unbroken
- **The gateway's fields** follow as the same invisible table the evidence panel uses: served model, outcome, status
  code, devshard, created, time to first token, duration, total tokens and whether it streamed
- **One paragraph** says what a receipt is and, per FR-PUBLIC-2, what it is not: gateway metadata, not cryptographic or
  on-chain proof
- **A plain button, `Open on GonkaRouter`,** goes to `https://api.gonkarouter.io/v1/receipts/<id>`, and the paragraph
  links gonkarouter.io itself
- **The raw JSON** is printed last in a `--well` block, so nothing rendered above has to be taken on trust

A receipt the gateway has not written yet is not an error state. It says so in a sentence and still offers the outbound
link, because the id is real and a receipt appears a moment after the call it belongs to finishes.

### The guest banner

A full-width strip directly under the navigation, ink ground with paper text, 44 px tall on desktop and up to two lines
at 375 px. It carries the FR-AUTH-3 sentence word for word plus one dismiss control at its trailing edge, and nothing
else: no icon, no link. It is not sticky, but it is above the fold on every Guest page at 375 px because nothing sits
between the navigation and it. An inverted strip is the one place the product uses ink as a ground; a stamp on the
paper, not a card.

### Mobile at 375 px

- The sheet loses its side margins and its border becomes the top and bottom rules only; padding is `--s-4`
- The item number gutter narrows to 28 px; the verdict chip moves beneath the stem
- The bubble row stays horizontal: six 28 px bubbles with `--s-2` gaps fit in 208 px
- Evidence columns stack, reader A above reader B, and the attempt table scrolls horizontally inside its own container
- The mascot stage is hidden; the two-reader idea is carried by the two evidence columns
- Nothing scrolls the body horizontally (NFR-UX-1)

## Components

### The bubble row

The one component that belongs to this product and no other: a horizontal run of round 28 px bubbles labelled A to F in
UI face 500, one per option. It has three states:

- **Open.** A 1 px `--rule-strong` ring
- **Keyed.** Filled ink, the supplied key
- **Read.** Filled in the reader's column, showing what that reader chose

In the item row the bubble row shows the key; in each evidence column it shows the reader's choice, so a key error is
visible as two readers filling the same bubble the key did not.

### Verdict chips

Pill radius, `--s-1` vertical and `--s-3` horizontal padding, glyph then label in Label size and weight 500, text in the
verdict colour on its 12% tint. The label is the full verdict name; it is never abbreviated to a glyph or an initial.
When used as a filter the count follows in mono and the active filter gains a 1 px border in its verdict colour.

### Status chips

Record and item status (**Queued**, **Checking**, **Running**, **Complete**, **Ready**, **In Review**, **Resolved**,
**Unverified**) use ink on `--well`, pill radius, no colour. Status is a fact about progress, not a judgment. Elapsed
time and attempt counts follow in mono; no percentage and no countdown (FR-QUEUE-4).

**Unverified** is both a status and a verdict. It takes the verdict's coloured chip when shown as a verdict and the
plain chip when shown as an item's progress state.

### Disposition controls

Five dispositions rendered as a vertical radio group, each row a 20 px bubble beside its TitleCase label and a one-line
sentence-case description. The chosen bubble fills in pen red, the human's mark. **Key Corrected** reveals a bubble row
to choose the new key. **Retry Requested** is labelled with the fact that it spends an inference round.

The machine verdict chip stays visible above the group while it is edited, and the item row then shows both chips,
verdict first. In the signed-out **Sample Report** the group is not rendered at all, not disabled.

### Attempt rows

A level-0 table: Attempt number, Requested model, Served model, Status, Request id, Shard, Latency, Receipt. Models and
ids in mono. The status words are **Admitted**, **Hedged**, **Rate Limited**, **Timed Out** and **Rejected**; **Hedged**
is the copy of a hedged call that arrived second, which was admissible and simply lost the race.

**Every cell is flush left with its header, status and receipt included.** They are text here rather than chips: a chip
sets its word a pill's padding to the right of the header above it, which reads as an indent that means nothing, and on
`--well` the chip's own `--well` ground is invisible anyway.

**A row that produced no used reading shows why beneath its status, in `--ink-muted` and in at most five words.** Five
is the column's budget beside seven others on a projector, not a style preference; the sentence the server wrote stays
on the row as its title, so nothing is lost.

A row with no request id prints "No request id was returned" in that cell; the cell is never blank. **A present id is
itself the link** and opens the [receipt page](#the-receipt-page) in a new tab. It is never broken across lines: the id
is the thing a judge copies.

Eight columns of provenance do not fit the 880 px reading column, so the table scrolls inside its own container. The
order puts the proof leftmost: what was asked, what served it, what happened, and the id.

### Buttons

Three kinds. **Primary** is filled ink with `--on-ink` text: **New Check**, **Sign In**, **Submit Check**. **Plain** is
ink text with a 1 px `--rule-strong` border: **Retry Verification**, **Cancel**, **View Receipt**. **Destructive** is
filled pen red with `--pen-ink` text and appears only inside a confirmation dialog. All are `--r-sheet`, 36 px tall,
`--s-4` horizontal padding, UI face 500. There are no ghost, link-style or icon-only buttons in the product.

### Empty states

One sentence in sentence case and one primary action, set in the sheet at `--s-7` vertical padding. No illustration and
no mascot. "No records yet." with **New Check**; "No items match this filter." with **Show All Items**; "This record has
expired." with **Back to Records**.

### Destructive confirmations

A level-2 dialog, 440 px wide. The title is the verb and the count in TitleCase: **Delete 3 Records**. The body is two
sentences in sentence case: what happens, then the recovery behaviour for this account per FR-RECORD-7. Private: "They
will move to Trash for 30 days." Guest: "Guest deletion is immediate and there is no recovery." If the selection
includes the sample, a third sentence says it will be skipped.

Buttons are right-aligned: **Cancel** (plain), then the destructive button repeating the title. Initial focus lands on
**Cancel**. Escape and clicking the backdrop cancel.

## Motion and the mascot

### Durations and easing

```css
--t-quick: 120ms; /* hover, focus, chip and bubble state changes */
--t-panel: 200ms; /* evidence panel and popover enter and exit */
--t-sheet: 320ms; /* item expand and collapse, dialog enter */
--ease-out: cubic-bezier(0.2, 0, 0, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

Enter uses `--ease-out`, exit uses `--ease-in`. Nothing bounces, overshoots or springs. Nothing loops except the mascot
idle. Verdict chips do not animate in; a verdict arriving replaces the status chip in one `--t-quick` cross-fade,
because a result is a fact, not an event. The attention count does not pulse.

Under `prefers-reduced-motion: reduce` or the user's **Reduce Motion** setting every transition above collapses to `0ms`
except opacity, which may keep `--t-quick`. This applies product-wide, not only to the mascot (NFR-UX-5).

### The mascot

Tororo and Hijiki are the two readers made visible. They live on a 240 × 160 px stage at the sheet's bottom-right on
viewports of 1024 px and above, lazy-loaded after the record content (FR-MASCOT-2). Between 600 and 1023 px the stage
collapses to a 48 px static badge of both cats in the record header; below 600 px it is hidden. They are animated by
default and static only under reduced motion or on load failure (FR-MASCOT-3).

The model files expose five motion groups per cat: `Idle`, `Tap`, `FlickUp`, `FlickDown` and `Flick`, plus eye-blink and
lip-sync parameters and no hit areas. The mapping below names groups because the individual motion files carry no
descriptive names. Lip-sync is never driven and the cats never react to the pointer.

The file chosen inside each group, the same for both cats, is held as data in `src/client/mascot/motions.ts`:

| Group       | File and index        | Why                                                                                                   |
| ----------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| `Idle`      | `motion/00_idle`, `0` | The only file the rig names idle, the longest at 9.73 s, and the one driving the full breath and tail |
| `Tap`       | `motion/07`, `2`      | The shortest of the three at 4.07 s and the only one without arm-swing curves, so it reads as a turn  |
| `FlickUp`   | `motion/01`, `0`      | The only file in the group                                                                            |
| `FlickDown` | `motion/02`, `0`      | The only file in the group                                                                            |
| `Flick`     | `motion/05`, `0`      | The only file in the group                                                                            |

| Product state        | Tororo (white)                  | Hijiki (black)                          | Static fallback                            |
| -------------------- | ------------------------------- | --------------------------------------- | ------------------------------------------ |
| Idle dashboard       | One `Idle` cycle, then still    | One `Idle` cycle, offset by 400 ms      | Resting pose                               |
| Checking             | `Tap`, then `Idle` on a loop    | `Tap` starting 1.2 s later, then `Idle` | Two reading poses and the status text      |
| Agreement with key   | One `FlickUp`, then still       | One `FlickUp`, 300 ms later             | Neutral pose                               |
| Attention item found | One `Tap`, then still           | One `Tap`, 300 ms later                 | Concerned pose beside the verdict label    |
| Split opinion        | One `Flick` to the left         | One `Flick` to the right, 300 ms later  | Paired poses facing apart                  |
| Unverified           | One `FlickDown`, then still     | Stays still                             | Waiting pose beside **Retry Verification** |
| Resolved             | One short `FlickUp`, then still | Same, 300 ms later                      | No badge, no confetti                      |

Three rules hold across every state:

- **The cats never move in unison.** Every paired motion is offset, because synchronised readers would say the opposite
  of what the product claims. Under Checking, the two `Tap` motions are never started together
- **Blink is on, always, even when still.** A still cat with blinking eyes is animated by decision; a frozen frame is
  the fallback, not the default
- **Quiet at the moments that matter.** While a destructive dialog or a receipt popover is open the stage holds its last
  frame and stops blinking. The mascot has no state for deletion and none for a receipt

The state text on screen is authoritative. If the cats and the chip ever disagree, the chip is right and the mascot is a
bug (FR-MASCOT-4).

## Capitalisation

Chrome is TitleCase; prose is sentence case. Chrome is anything that names a place, an action or a state: navigation,
buttons, headings, card and dialog titles, table headers, tab labels, menu items, form labels, verdicts, dispositions
and statuses. Prose is anything that talks to the reader: body copy, helper text, placeholders, tooltips, errors, empty
states, toasts, the guest banner and the rule sentence.

| Kind          | Example                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Button        | `Sign In as Guest`, `Retry Verification`, `Delete 3 Records`                                                                         |
| Verdict       | `Possible Key Error`, `Split Opinion`, `Unverified`                                                                                  |
| Disposition   | `Key Corrected`, `Flag Dismissed`                                                                                                    |
| Table header  | `Served Model`, `Request Id`                                                                                                         |
| Form label    | `Assessment Title`, `Keyed Option`                                                                                                   |
| Error         | `We could not verify this item, try again in a moment.`                                                                              |
| Helper        | `Two to six options. One must be the key.`                                                                                           |
| Empty state   | `No records yet.`                                                                                                                    |
| Rule sentence | `Both readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error.` |

In TitleCase, short function words stay lowercase (`as`, `to`, `of`, `and`) unless first: `Sign In as Guest`,
`Back to Records`. Verdict and disposition names keep their TitleCase inside a sentence, because they are names: "so
Possible Key Error". The check is made on rendered text, not source, since `text-transform` can hide a mistake either
way.

Markdown files, including this one, follow the sentence-case rule in
[documentation hygiene](../AGENTS.md#documentation-hygiene) instead.

## Accessibility

- **Contrast.** Text is at least 4.5:1 on its ground and large text and glyphs at least 3:1; the measured values are in
  [Colour](#colour). Input borders, chip borders and the focus ring are at least 3:1 against the sheet
- **Focus.** A 2 px `--focus` outline with a 2 px `--focus-halo` offset on every interactive element, so the ring is
  visible on ink, on tint and on the well. The ring is ink, never red, because red is a human mark and focus is not one.
  Focus is never removed; `:focus-visible` is used so pointer clicks do not paint it
- **Keyboard.** Record rows open with Enter, the disposition group moves with arrow keys, filters are a toolbar with
  arrow-key movement, the evidence panel is a disclosure button, dialogs trap focus and return it on close. Every flow
  in NFR-UX-2 is walked with the pointer unplugged before it is called done
- **Never colour alone.** Every verdict has a glyph and its full name; every status has its name; the attention count
  has the word "attention" in its accessible label. The bubble row's filled state is also exposed as `aria-pressed` or
  `aria-checked` and the key is named in text beside it
- **Reduced motion.** `prefers-reduced-motion` and the **Reduce Motion** setting stop every loop and collapse every
  transition, product-wide
- **The mascot is never the only signal.** It has `aria-hidden="true"`, sits outside the tab order, and the page is
  complete without it. Screen readers never learn there are cats
- **Text scales.** Every size is `rem`; the layout holds at 200% browser zoom because the sheet is fluid and the bubble
  row wraps only below 208 px of available width

## Tells this system avoids

Each line is one tell from [design standards](../AGENTS.md#design-standards) and what Cekgu does instead.

- **Warm cream, serif display, terracotta.** Warm-grey photocopy paper, a grotesque display, and a crimson pen. The
  serif is the paper's face for stems and options, never a display face
- **Near black with one acid or vermilion pop.** Dark mode is blue-black ink with a paper-coloured text and the same pen
  red; the five verdict hues carry the meaning, not one pop
- **Purple to blue gradient hero.** The home page hero is a sheet on the paper ground with the lockup and one filled ink
  button. There are no gradients anywhere
- **Inter or Space Grotesk.** Schibsted Grotesk, Source Serif 4 and Spline Sans Mono, each with a job
- **Everything centred.** The sheet is centred on the desk; everything inside it is left-aligned like a paper, and the
  only right-aligned things are numbers
- **One large radius everywhere.** Two radii by descent: round for bubbles, 4 px for paper
- **A coloured rail on a rounded card.** No cards inside the sheet and no rails. Selection is a 2 px inset on a table
  row; verdicts live in chips
- **Numbered markers on non-sequences.** The only numbers on items are the paper's own item numbers, and attempts are
  numbered because they happened in order
- **Three of everything.** Five verdicts, five dispositions, six statuses, two readers, three faces, because that is how
  many there are
- **Glassmorphism.** Three elevation levels, each meaning something: flat rows, one sheet, overlays. No blur
- **A neon dashboard with no data.** A review document with real readings, real request ids and a receipt for each, and
  the one thing that pulses is a cat's eyelid
