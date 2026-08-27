# TBD - MUBA 2026 Pitch Script (Demo Day, APU, 6 Sept 2026)

<!--
  TEMPLATE. Replace everything. The structure below is the house format and is
  not a suggestion - follow it closely.

  Owned by the `pitch-smith` subagent (.claude/agents/pitch-smith.md).

  Two rules that govern every line here:
  1. Write the words, not a description of the words. Verbatim, spoken, in the
     voice of someone talking to a room. Contractions. Short sentences.
  2. Every claim must be demonstrable on screen. If you cannot find the code
     that does a thing, it does not go in the script.
-->

> **Format:** **5 minutes presentation + 5 minutes Q&A.** Source: opening ceremony,
> [`../source/opening-ceremony-transcript.md`](../source/opening-ceremony-transcript.md). **Budget:** TBD deck &middot;
> TBD live demo &middot; last word by **4:45**. The final 15s is buffer, never content. **Deck:**
> [`pitch-deck.html`](pitch-deck.html) - N slides. PDF backup: [`pitch-deck.pdf`](pitch-deck.pdf). Arrow keys or click
> to advance. `N` speaker notes, `T` rehearsal timer, `R` reset - all off by default and never in the PDF. **Speakers:**
> **SPEAKER** (narration, owns the deck and the clock) &middot; **DRIVER** (keyboard, owns the app). **Convention:**
> plain text = **spoken** &middot; _italics_ = on-stage action &middot; `NOTE:` = internal, never spoken. **Never
> present a recording as live.** If something fails, say so out loud and take the fallback ladder in the last section.

---

## 0. Run-Of-Show At A Glance

| Time       | Segment                   | Screen            | Who     |
| ---------- | ------------------------- | ----------------- | ------- |
| 0:00-0:15  | Who we are, what we built | Slide 1           | SPEAKER |
| 0:15-1:00  | The problem               | Slide 2           | SPEAKER |
| 1:00-1:45  | The product               | Slide 3           | SPEAKER |
| 1:45-2:45  | **Live demo**             | app               | DRIVER  |
| 2:45-3:45  | How it works              | Slide 4           | SPEAKER |
| 3:45-4:30  | Why us                    | Slide 5           | SPEAKER |
| 4:30-4:45  | Close                     | Slide 6           | SPEAKER |
| 5:00-10:00 | Judge Q&A                 | parked on Slide 6 | both    |

`NOTE:` Word budget is measured, not estimated. Roughly 130 wpm for continuous speech, ~115 wpm where clicking and
loading eat the window. If a rehearsal runs long, **cut words, never speed up.** Re-count and re-time after any line
edit.

---

## 1. Opening - Route Drafts

<!--
  Draft two or three routes for the opening, then a Finalized Script.
  Alternatives are cheap now and expensive on stage. The hook is the first
  fifteen seconds and the slogan is the last five - both get drafted more
  than once.

  Local and specific beats generic. A real scene a Malaysian audience
  recognises works. "In today's fast-paced world" works nowhere.
  Humour is allowed and helps, as long as it is one line and needs no
  explaining.
-->

### Route A - <name the angle>

> "..."

### Route B - <name the angle>

> "..."

### Finalized Script

> "..."

---

## 2. [Introduction] (0:00-0:15 &middot; ~35 words &middot; SPEAKER)

**[Slide 01 - Cover]**

_Deck up. App already open in the other window on <route>, fields empty._

> "We're Team <name>. We built <thing>, and it <does the one thing>."

`NOTE:` Handshake, not a beat. Do not read URLs aloud.

---

## 3. [The Problem] (0:15-1:00 &middot; SPEAKER)

**[Slide 02 - The Problem]**

_(15 second)_

> "..."

_(40 second)_

> "..."

---

## 4. [Live Demo] (1:45-2:45 &middot; DRIVER)

<!--
  Write the exact click path with the literal inputs typed out, so any
  teammate can run it. Number the pipeline steps. Mark the one moment that
  should land.
-->

_Alt+Tab to the app._

1. **Type:** `<the literal input, verbatim>`
2. **Click:** `<the literal button label>`
3. _Wait ~Ns. Two models run in parallel._
4. **The moment:** _<what lands, and why a judge notices>_
5. **Point at:** the Gonka Request ID per step - _this is the proof the reasoning ran on the network, not on our
   server._

`NOTE:` Read confidences and IDs off the screen as they render. Do not hard-commit to a number the screen will show.

---

## 5. [How It Works] (2:45-3:45 &middot; SPEAKER)

**[Slide 04 - Architecture]**

> "..."

`NOTE:` The three track requirements land in this section, said out loud: all inference through GonkaRouter, at least
two models cross-verifying, and a Gonka Request ID shown for every step.

---

## 6. [Why Us] (3:45-4:30 &middot; SPEAKER)

**[Slide 05 - The Differentiator]**

> "..."

`NOTE:` Name the incumbent, then name what they structurally cannot do. "Nobody does this" is almost always wrong and a
judge will find them.

---

## 7. [Close] (4:30-4:45 &middot; SPEAKER)

**[Slide 06 - Close]**

> "<the slogan, five seconds>"

---

## 8. [Q&A Session] (5 minutes)

<!--
  Three tiers, in this order. Each entry is the question in bold, then the
  answer starting with an arrow. Include the hostile questions - a judge will
  ask them whether or not you prepared.

  Flag what is not true yet in bold caps, exactly like this:
  **(NOT LOAD-TESTED AT THAT SCALE YET, be honest if pushed.)**
  A confident false answer loses more than an honest limit does.
-->

### Most Likely (prepare these cold)

**"Is the demo hardcoded?"**

-> ...

**"What stops two models from just agreeing with each other?"**

-> ...

**"Why does this need to be decentralised at all?"**

-> ...

### Second Tier (likely)

**"..."**

-> ...

### Third Tier (less likely, prepare brief answers)

**"..."**

-> ...

---

## 9. Fallback Ladder

<!--
  Decide this before you need it. Venue wifi will be bad.
-->

| If                                  | Then                                                                 |
| ----------------------------------- | -------------------------------------------------------------------- |
| The gateway is slow or rate-limited | ...                                                                  |
| The venue network is down           | Recorded clip at `assets/<name>.mp4`, stated out loud as a recording |
| The deployed app is down            | Run locally against seeded data                                      |
| The laptop dies                     | ...                                                                  |

---

## 10. Pre-Flight

- [ ] Every claim in this script is demonstrable on screen inside the time budget
- [ ] Rehearsed end to end with the timer (`T`), under 4:45 spoken
- [ ] Fallback clip recorded and playable offline
- [ ] `pitch-deck.pdf` exported and opened on a second machine
- [ ] `du -sh docs/demo/` under 3 MB, `du -h docs/demo/pitch-deck.pdf` under 2 MB
