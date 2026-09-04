# Deck assets

Everything [`pitch-deck.html`](../pitch-deck.html) loads from disk. Inline SVG lives in the deck itself; this folder is
for what cannot be inlined.

## Reach for SVG first

Vector is a few KB, stays sharp at any projector resolution, and inlines at no extra request. Diagrams, architecture,
flows, icons and charts are hand-written SVG, and that is most of the deck.

**Never embed a base64 raster in the HTML.** It costs a third more bytes than the file and inflates the PDF too. Base64
is fine for SVG.

## Raster only when photographic

Claude Code cannot generate images. Delegate to Codex, which has generation built in and needs no API key:

```bash
codex exec --skip-git-repo-check "<prompt>. Use your image generation tool. Save to /absolute/path/docs/demo/assets/<name>.png"
```

Three details in that command matter:

- **Give it an absolute path.** Codex writes into `~/.codex/generated_images/<session-id>/`, then copies to yours.
- **Expect ~800 KB at 1254x1254.** That is a source file, not a deck asset. Resize before committing.
- **Keep the destination inside the workspace.** Under a `workspace-write` sandbox it has to be.

Art direction comes from the identity section of [`DESIGN.md`](../../DESIGN.md); the `brandkit` skill was deliberately
not vendored.

## Resize before committing

Every raster is resized to the size it actually displays at. A logo shown at 200px wide does not ship at 1254px.

```bash
bunx --bun sharp-cli -i assets/raw.png -o assets/thing.png resize 800 --withoutEnlargement
```

Prefer **WebP** for photographic assets, typically 25-35 percent smaller than PNG at the same perceived quality. Keep
PNG only where transparency against a light ground matters.

## Stay inside the size budget

**`docs/demo/` under 3 MB, the PDF under 2 MB.** A deck that takes ten seconds to open on someone else's laptop reads as
broken. Measure, do not assume:

```bash
du -sh docs/demo/
du -h  docs/demo/pitch-deck.pdf
du -ah docs/demo/assets | sort -h   # find the asset responsible
```

## The fonts are inlined, and why

The deck's three faces from [`DESIGN.md`](../../DESIGN.md) are **base64 woff2 inside
[`pitch-deck.html`](../pitch-deck.html)**, one `@font-face` per family with a weight range, because all three are
variable fonts.

This is the one deliberate exception to the no-base64 rule above, and it is not a raster. A linked Google Fonts
stylesheet fails in the two places that matter:

- **Opening the file.** The deck is opened from `file://` on the demo laptop, and venue wifi is the one thing nobody
  controls. A linked stylesheet means Helvetica on the projector
- **Printing the PDF.** Chromium printed the whole deck in Helvetica whenever the font request had not resolved, and the
  failure is silent

A loose `assets/fonts/*.woff2` does not fix it either: Chromium treats `file://` as an opaque origin and blocks the
cross-origin font fetch, so the deck only rendered correctly when the bytes were in the document.

| Family                | Latin subset | Licence                   |
| --------------------- | ------------ | ------------------------- |
| **Schibsted Grotesk** | 46 KB        | SIL Open Font License 1.1 |
| **Source Serif 4**    | 122 KB       | SIL Open Font License 1.1 |
| **Spline Sans Mono**  | 36 KB        | SIL Open Font License 1.1 |

Base64 costs a third more, so 204 KB of woff2 becomes 275 KB of CSS. Measured after: the HTML is 324 KB and `docs/demo/`
is 924 KB, both inside [the size budget](#stay-inside-the-size-budget). `font-display` is `block`, not `swap`, so a
slide never flashes a fallback face in front of a judge.

Re-fetch them from the same Google Fonts URL the scaffold's `src/client/index.html` uses, keep only the `/* latin */`
blocks, and base64 each file once.
