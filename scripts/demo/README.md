# Demo video pipeline

This pipeline records the deployed product, appends every page of the pitch deck, adds local Kokoro narration, burns
matching subtitles, and writes a 1920×1080 MP4. Media stays in a scratch directory and must not be committed.

Contents:

1. [Pipeline](#pipeline)
1. [Run the complete pipeline](#run-the-complete-pipeline)
1. [Install Kokoro once](#install-kokoro-once)
1. [Recorder contract](#recorder-contract)
1. [Assemble the deck](#assemble-the-deck)
1. [Narrate and subtitle](#narrate-and-subtitle)
1. [Environment overrides](#environment-overrides)
1. [Verify the result](#verify-the-result)
1. [Troubleshooting](#troubleshooting)

## Pipeline

```text
check-shots.mjs
        │
        ▼
record.mjs ──► capture.webm + measured beats.json
                                      │
pitch-deck.pdf ──► assemble.sh ───────┤ append slide beats
                                      ▼
                          capture-joined.mp4
                                      │
narration.txt ──► Kokoro WAVs ────────┤
               └─► matching SRT ──────┤
                                      ▼
                              cekgu-demo.mp4
```

The browser and deck share one timeline. `record.mjs` measures `shot-1` through `shot-9` and `end`; `assemble.sh`
preserves those offsets, then adds `slide-1` through the final deck page and a new `end`. Each line in `narration.txt`
names one of those beats, so a slow browser step moves all later narration with the picture.

## Run the complete pipeline

Run from the repository root. The deployed app is the recorder's default; set `DEMO_URL` only when recording another
deployment.

```bash
export DEMO_DIR="$(mktemp -d -t cekgu-demo.XXXXXX)"
export KOKORO_HOME="${KOKORO_HOME:-${XDG_DATA_HOME:-$HOME/.local/share}/cekgu-video/kokoro}"

bun scripts/demo/check-shots.mjs
bun scripts/demo/record.mjs
bash scripts/demo/assemble.sh
bash scripts/demo/narrate.sh

ffprobe -v error \
  -show_entries format=duration:stream=codec_name,width,height,sample_rate,channels \
  -of default=noprint_wrappers=1 "$DEMO_DIR/cekgu-demo.mp4"
```

The final path is printed by `narrate.sh`. With the defaults, the result is 285 seconds, or 4:45. Keep
`$DEMO_DIR/capture.webm` and `$DEMO_DIR/beats.json` until the final video has been reviewed; they are the inputs needed
to rebuild without recording the browser again.

Required commands are Bun, Google Chrome, Python, `ffmpeg`, `ffprobe`, `pdfinfo`, and `pdftoppm`. Run `bun install`
before the first capture so Playwright is available.

## Install Kokoro once

`KOKORO_HOME` must contain the Python environment and both Kokoro assets:

```text
$KOKORO_HOME/
├── .venv/bin/python
├── kokoro-v1.0.onnx
└── voices-v1.0.bin
```

To create the documented default installation:

```bash
export KOKORO_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/cekgu-video/kokoro"
mkdir -p "$KOKORO_HOME"
python3.11 -m venv "$KOKORO_HOME/.venv"
"$KOKORO_HOME/.venv/bin/python" -m pip install kokoro-onnx soundfile
curl -fL \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx \
  -o "$KOKORO_HOME/kokoro-v1.0.onnx"
curl -fL \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin \
  -o "$KOKORO_HOME/voices-v1.0.bin"
```

If Kokoro already exists elsewhere, set `KOKORO_HOME` to that directory. The default voice is the clear English
`af_heart`; no cloud account or API key is used.

## Recorder contract

Run the anchor gate before recording:

```bash
bun scripts/demo/check-shots.mjs
```

Every row must be `PRESENT`. Then record:

```bash
bun scripts/demo/record.mjs
```

The recorder writes:

- `$DEMO_DIR/capture.webm`, the 1920×1080 product walkthrough
- `$DEMO_DIR/beats.json`, a strictly increasing array of `{ "name": string, "ms": number }`
- `$DEMO_DIR/frames/`, optional stills for reviewing each shot

A complete take has `shot-1` through `shot-9` followed by `end`. Do not hand-edit these offsets: they are measured from
the capture and account for browser or gateway delays.

The Guest workspace is shared. The recorder resets the protected sample before the take and never sends a live inference
request.

## Assemble the deck

Run:

```bash
bash scripts/demo/assemble.sh
```

The assembler reads `capture.webm`, `beats.json`, and `docs/demo/pitch-deck.pdf`. It renders every PDF page into
`$DEMO_DIR/assembly/`, normalizes the capture and slides to the same 1920×1080 H.264 stream, and writes
`$DEMO_DIR/capture-joined.mp4`.

It also writes `$DEMO_DIR/slides.json` and extends `beats.json` with one beat per slide. Nothing is written to
`docs/demo/`; the HTML and PDF deck remain read-only inputs.

`DEMO_TOTAL_SECONDS` defaults to `285`. The capture duration is measured with `ffprobe`, and the remaining time is
distributed across the slide pages. Each slide must receive at least five seconds; assembly stops if the capture is too
long for that floor.

## Narrate and subtitle

Run assembly first, then:

```bash
bash scripts/demo/narrate.sh
```

Each non-comment line in `narration.txt` has this form:

```text
beat | offset_ms | spoken text
```

`schedule.py` resolves the named beat against the extended `beats.json`. Kokoro renders one PCM WAV per line. If one
line would still be speaking at the next start, its successor moves later by the minimum gap; the measured beat remains
the earliest allowed start.

`subtitles.py` reads the same corrected `lines.json` and the same WAV durations. Long sentences become balanced cards of
no more than two 42-character lines, and a card is cut before the next spoken line rather than overlapping it.

The narrator writes these scratch artifacts:

- `$DEMO_DIR/narration-segments/`, one PCM WAV per script line
- `$DEMO_DIR/lines.json`, resolved and overlap-free line timing
- `$DEMO_DIR/narration.srt`, the subtitle track before it is burned in
- `$DEMO_DIR/narration.wav`, the mixed narration timeline
- `$DEMO_DIR/cekgu-demo.mp4`, the final H.264/AAC video

## Environment overrides

The normal run only needs `DEMO_DIR` and `KOKORO_HOME`.

| Variable               | Default                                       | Purpose                                      |
| ---------------------- | --------------------------------------------- | -------------------------------------------- |
| `DEMO_DIR`             | System temporary directory under `cekgu-demo` | All capture, intermediate, and final media   |
| `DEMO_URL`             | Deployed Cekgu URL in `record.mjs`            | Product deployment to capture                |
| `DEMO_DECK`            | `docs/demo/pitch-deck.pdf`                    | PDF whose pages are appended                 |
| `DEMO_TOTAL_SECONDS`   | `285`                                         | Joined capture and deck duration             |
| `KOKORO_HOME`          | `$XDG_DATA_HOME/cekgu-video/kokoro`           | Model, voices, and Kokoro Python environment |
| `DEMO_VOICE`           | `af_heart`                                    | Kokoro voice                                 |
| `DEMO_SPEED`           | `1.0`                                         | Kokoro speech speed                          |
| `DEMO_LANGUAGE`        | `en-us`                                       | Kokoro language                              |
| `DEMO_SCRIPT`          | `scripts/demo/narration.txt`                  | Beat-keyed narration text                    |
| `DEMO_SOURCE`          | `$DEMO_DIR/capture-joined.mp4`                | Video that receives narration                |
| `DEMO_OUT`             | `$DEMO_DIR/cekgu-demo.mp4`                    | Final MP4 path                               |
| `DEMO_PYTHON`          | `$KOKORO_HOME/.venv/bin/python`               | Python executable with Kokoro installed      |
| `DEMO_BROWSER_CHANNEL` | `chrome`                                      | Playwright browser channel                   |
| `DEMO_HEADLESS`        | Headless unless set to `false`                | Show the recording browser                   |
| `DEMO_STILLS`          | Enabled unless set to `0`                     | Save per-shot review frames                  |

`DEMO_FFMPEG`, `DEMO_FFPROBE`, `DEMO_PDFINFO`, and `DEMO_PDFTOPPM` may point to non-default command locations.
`DEMO_PRESET` and `DEMO_FPS` override the H.264 preset and frame rate.

## Verify the result

Run the automated pipeline checks:

```bash
bun test scripts/demo/pipeline.test.ts
bash -n scripts/demo/assemble.sh scripts/demo/narrate.sh
bun run lint
bun run typecheck
```

Then open the MP4 at full screen and check:

1. Product narration follows the action after any slow page transition.
2. `slide-1` begins only after the browser capture ends.
3. Subtitles stay readable and never stack two different claims.
4. The request IDs and both `Verified` receipts remain visible during the proof beats.
5. The last frame and spoken line finish between 4:30 and 5:00.

## Troubleshooting

**`missing required beat shot-N`.** The browser take ended early. Re-run `record.mjs`; do not invent the missing offset.

**`unknown beat 'slide-N'`.** `narrate.sh` ran before the current deck was assembled, or `narration.txt` names a page
that the PDF does not contain. Run `assemble.sh` again.

**`target must leave at least 5 seconds per slide`.** Increase `DEMO_TOTAL_SECONDS` within the five-minute limit or
record a shorter walkthrough.

**`missing Kokoro model` or `missing Kokoro voices`.** Point `KOKORO_HOME` at the directory holding both asset files, or
follow [Install Kokoro once](#install-kokoro-once).

**The final video exceeds five minutes.** The chosen voice finished after the assembled timeline. Raise `DEMO_SPEED`
slightly, re-run `narrate.sh`, and review the result; do not change the measured browser beats.
