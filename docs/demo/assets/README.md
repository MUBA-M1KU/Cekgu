# Deck Assets

Everything `pitch-deck.html` loads from disk. Inline SVG lives in the deck itself;
this folder is for what cannot be inlined.

---

## SVG First

Vector is a few KB, stays sharp at any projector resolution, and inlines at no
extra request. Diagrams, architecture, flows, icons and charts are hand-written
SVG, and that is most of the deck.

**Never embed a base64 raster in the HTML.** It costs a third more bytes than the
file and inflates the PDF too. Base64 is fine for SVG.

---

## Raster Only When Photographic

Claude Code cannot generate images. Delegate to Codex, which has generation built
in and needs no API key:

```bash
codex exec --skip-git-repo-check "<prompt>. Use your image generation tool. Save to /absolute/path/docs/demo/assets/<name>.png"
```

| Detail                | Why                                                                              |
| --------------------- | -------------------------------------------------------------------------------- |
| **Absolute path**     | Codex writes into `~/.codex/generated_images/<session-id>/`, then copies to yours |
| **~800 KB, 1254x1254** | That is a source file, not a deck asset. Resize before committing                |
| **Inside the workspace** | Under a `workspace-write` sandbox the destination must be in the workspace     |

Use the `brandkit` skill for art direction rather than hand-writing a prompt.

---

## Resize Before Committing

Every raster is resized to the size it actually displays at. A logo shown at 200px
wide does not ship at 1254px.

```bash
bunx --bun sharp-cli -i assets/raw.png -o assets/thing.png resize 800 --withoutEnlargement
```

Prefer **WebP** for photographic assets, typically 25-35 percent smaller than PNG
at the same perceived quality. Keep PNG only where transparency against a light
ground matters.

---

## Budget

**`docs/demo/` under 3 MB, the PDF under 2 MB.** A deck that takes ten seconds to
open on someone else's laptop reads as broken. Measure, do not assume:

```bash
du -sh docs/demo/
du -h  docs/demo/pitch-deck.pdf
du -ah docs/demo/assets | sort -h   # find the asset responsible
```
