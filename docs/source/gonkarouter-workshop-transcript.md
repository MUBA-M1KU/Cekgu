# GonkaRouter Workshop — Transcript

> **Source** — recording of the GonkaRouter developer workshop, 27 Aug 2026, 9:00 PM MYT on Microsoft Teams. 1h 18m.
> Speaker: **Jack**, GonkaRouter Tech Lead, with **Carol** (marketing) on Q&A and **Richard** (MUBA) hosting. **Method**
> — audio extracted with `ffmpeg` (mono 16 kHz, the source rate), transcribed with OpenAI Whisper `small` on GPU.
> **Captured** — 2026-08-29. Companion: [`gonkarouter-workshop-slides.md`](gonkarouter-workshop-slides.md) — **the deck
> is the authority on every technical detail.**

---

## ⚠️ Read This Before Quoting Anything Here

**Jack presented in Mandarin.** The recording is mixed-language: Richard hosts in English, Jack presents in Mandarin
from 11:15, and the Q&A alternates between the two with Richard summarising each answer in English.

Three passes were run to get something usable:

| Pass | Setting                                                  | Outcome                                                                                                                                       |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `language=en, task=transcribe`                           | **Unusable for Jack.** Forced English onto Mandarin speech: "solved a credit card", "a different SD card", "the cost of the cost of the cost" |
| 2    | auto-detect, `task=translate`                            | Whisper sampled the Malaysian-accented English intro and guessed **`ms`** for the whole file. Better, still degraded                          |
| 3    | **`language=zh, task=translate`** on the clip from 11:15 | Usable. "three or four different SDKs", "compress everything in the middle into five minutes"                                                 |

This document uses **pass 3 for Jack** and **pass 1 for the English speakers**.

**It is still machine translation of a second language, and it is lossy.** Numbers and identifiers in particular came
through wrong — the transcript says "170 million balloons" for what the slides show as 1.77M requests. **Where this
document and the deck disagree, the deck is right.** Quote the deck for anything technical; quote this only for what was
said and not slid.

### Proper-Noun Correction Key

| Heard as                                                                   | Actually                                 |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| "Kongkar root", "Gongkai Router", "Gongkang Router", "public route/router" | **GonkaRouter**                          |
| "AstroPeak", "Astrophic"                                                   | **Anthropic**                            |
| "Kimmy" · "MiniMarkz" · "DeepSyncV4"                                       | **Kimi** · **MiniMax** · **DeepSeek-V4** |
| "Cartrude"                                                                 | **CertiK**                               |
| "deaf volume", "that portfolio"                                            | **Devfolio**                             |
| "web-free"                                                                 | **Web3**                                 |
| "works bodies"                                                             | **WorkBuddy**                            |

---

## Run Of Show

| Time        | Segment                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------- |
| 00:00–11:15 | Richard opens. Slido QR, mics off, speaker intro. Screen-share problems delay the start ~7 min |
| 11:15–29:00 | **Jack, Part 1** — the problem, what Gonka is, the router's position, cost                     |
| 29:00–45:00 | **Jack, Part 2** — live demo: dashboard, key, WorkBuddy wiring, gotchas                        |
| 45:00–61:00 | Best practices, limits, resources, wrap                                                        |
| 61:00–73:00 | **Q&A** — the valuable part. Jack and Carol answer; Richard fields the event questions         |
| 73:00–78:00 | Reminders, photo session, close                                                                |

---

## Jack's Framing (11:15 onward)

> _"Today we mainly solve a very specific problem. You have an AI application in your mind. From this idea, to the first
> token, back to your screen — how many things are in the middle? If you do it yourself, you will know the answer. For
> example, I got a credit card, I got three or four different SDKs, I got it for two days."_

> _"The first step is not to write code, but to find a credit card that can be used. Many developers and students, and
> small teams, stop at the first step."_

On what Gonka is:

> _"Many compute nodes are providing inference. Who contributed the compute, gets the income."_

> _"Gonka is the base network. GonkaRouter is the developer's front door. You don't need to understand it. You don't
> need a wallet. You don't need to know which node served you. These are all our problems."_

On pricing — the point the deck makes visually, said plainly:

> _"Pay special attention to this: on many platforms, output is priced 3 to 5 times input. Once your use case answers
> often, the bill pulls up. We don't have that difference here."_

On the competitive comparison (~1:00:00):

> _"[OpenRouter's] price… is many times higher. Whether during the competition or after, we will help you get the
> biggest benefit."_

**The live demo hit real problems** — a screen-share failure at the start, and a 404 during the WorkBuddy walkthrough
that Jack debugged on air. The WorkBuddy URL gotcha in the deck is not theoretical; it bit the presenter.

---

## The Q&A — What Was Actually Ruled

This is the part not in the deck. Answers are Jack's and Carol's, with Richard's English summaries.

### On What Scores Well

**Jack:**

> _"It should be more like the kind of product that solves practical problems… that can solve specific needs in real
> life. Not something that is not practical at all. Or something that online or elsewhere is very common — you just make
> a copy."_

> _"Because now, for technology, there is no barrier to entry. So the main thing to consider is your thinking, and your
> ideas."_

**Richard's summary of both sponsors:**

> _"The answer from Carol is: making something that is contributing to society. And from Jack: they want something that
> can really solve the pain point of the society… They will be giving marks more on how the problem aligns, and what
> solution you have provided that's really applicable in real life scenarios."_

### 🔑 Web3 Is Not Required

**Q: Must the solution have Web3 components?**

> **Jack: No.** _"Not necessarily Web3, of course. Including any other areas. The main thing is useful, and needs to be
> able to solve the needs of the people. This is not limited to Web3 at all."_
>
> **Richard:** _"The answer from Jack is no. Which means you can build any solutions that really have the values and
> really can solve the real-world problems."_

This is a **blockchain** hackathon, but this track does not require a blockchain component. Worth knowing before
scoping.

### 🌍 Not Limited To Malaysia

**Q: Is the social problem specifically for Malaysia, or across the world?**

> **Carol: any scope, not limited to Malaysia.**

She gave a worked example of an existing GonkaRouter customer: a Reddit-based tool that finds target customers
automatically — scanning Reddit for people expressing a relevant need, so the operator does not read threads one by one.

### 🪙 Unlimited Tokens — How It Actually Works

**Q: Are the unlimited tokens automatic, or do we need to do something?**

> **Jack:** Register and you get the **$20 credit** automatically. _"The rate is very low, so it is usually enough for
> everyone."_
>
> **If you run out during the contest, email him and they will top you up.**
>
> After the contest they will email the winners the 20M/month grant. _"You don't need to pass any procedures."_

So: no application form for the unlimited tokens. Just register, and email if you exhaust the credit.

### 📜 Event Rulings From Richard

| Question                                     | Ruling                                                                                                                                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Participant certificate if we don't win?** | Yes — but you must **submit on Devfolio and complete your pitching session**. Pitching is the criterion                                                                                             |
| **Can we submit more than one project?**     | **No. One project per team.** One project _may_ target multiple tracks. He flagged he would confirm and revert                                                                                      |
| **What if Devfolio has problems?**           | They will open a **Google Form** as a fallback submission route                                                                                                                                     |
| **Is pitching mandatory for all members?**   | **At least one.** But _"if you are just one person, you are not really having any advantages, because you need to face the judges more and more"_ — bring at least two, because of the 5-minute Q&A |

### Closing Reminders

- **Register on Devfolio now**, even though registration runs to the day before pitching — they need time to verify
  entries
- **Merchandise and t-shirts are limited**, first come first served
- Join the Discord; mentors can be booked for one-on-one sessions
- Further questions go to the Discord channel

---

## Deltas Against `docs/brief.md`

**All six are now promoted into [`../brief.md`](../brief.md)** — this table is kept as the record of where they came
from. The brief is the working reference; this is the source.

| Item                  | Brief says                        | Workshop said                                                                     |
| --------------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| **Web3 component**    | not addressed                     | **Not required** for the GonkaRouter track                                        |
| **Problem scope**     | not addressed                     | **Not limited to Malaysia**                                                       |
| **Certificates**      | "digital, issued to participants" | Conditional on **submitting and completing the pitch**                            |
| **Projects per team** | not addressed                     | **One project per team**; one project may enter multiple tracks (to be confirmed) |
| **Devfolio failure**  | not addressed                     | **Google Form fallback** planned                                                  |
| **Token top-up**      | "unlimited during the hackathon"  | Automatic $20; **email Jack to raise it** if exhausted                            |
