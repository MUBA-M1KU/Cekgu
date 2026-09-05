# Cekgu pitch script

The spoken script for Demo Day at APU, 6 September 2026, Auditorium 1 on Level 7. Owned by the `pitch-smith` subagent
([`.claude/agents/pitch-smith.md`](../../.claude/agents/pitch-smith.md)).

> **The slot is 3 minutes plus 1 minute of Q&A**, cut down from 5 plus 5 and confirmed with the organizers on the
> evening of 5 September. This is a re-cut, not a trim: 3 minutes carries fewer claims, harder. The deck was re-cut with
> it, from eleven slides to nine.
>
> **This is not the submission video.** The MVP video is recorded, public and unchangeable at
> [youtu.be/zFASN69yQr8](https://youtu.be/zFASN69yQr8), 4 minutes 42 seconds, shot from
> [`recordly-script.md`](recordly-script.md). Nothing below changes it, and the pitch must stand on its own in front of
> judges who may not have watched it.
>
> **Written 5 September against the deployed build.** Every count, label and request id below was read off the running
> app or the public receipts endpoint that day. What is still open is the rehearsal, not the build: nobody has walked
> [section 6](#6-live-demo-114-144--driver) with a clock. Run it once before the room fills.

Contents:

1. [Format and conventions](#format-and-conventions)
1. [Run of show](#0-run-of-show)
1. [Opening route drafts](#1-opening-route-drafts)
1. [Introduction](#2-introduction-000-014--27-words--speaker)
1. [The problem](#3-the-problem-014-034--44-words--speaker)
1. [The objective](#4-the-objective-034-050--34-words--speaker)
1. [How the check works](#5-how-the-check-works-050-114--51-words--speaker)
1. [Live demo](#6-live-demo-114-144--driver)
1. [The proof](#7-the-proof-144-201--39-words--speaker)
1. [How it is built](#8-how-it-is-built-201-217--35-words--speaker)
1. [What broke](#9-what-broke-217-241--47-words--speaker)
1. [Business model](#10-business-model-241-251--20-words--speaker)
1. [Close](#11-close-251-300--20-words--speaker)
1. [Q&A session](#12-qa-session-1-minute)
1. [Fallback ladder](#13-fallback-ladder)
1. [The 2-minute MVP video](#14-the-2-minute-mvp-video)
1. [Pre-flight](#15-pre-flight)

## Format and conventions

- **Slot** — 3 minutes presentation plus 1 minute Q&A, confirmed with the organizers on 5 September. The 5-plus-5 figure
  in [`../brief.md`](../brief.md#how-we-are-judged) is what was announced at the opening ceremony and is superseded.
- **Budget** — 2:30 deck, 0:30 live demo, last word by **3:00** with nothing held back as buffer. There is no buffer at
  three minutes; the buffer is the [cut list](#what-gets-cut-if-you-run-long).
- **Deck** — [`pitch-deck.html`](pitch-deck.html), 9 slides. PDF backup: [`pitch-deck.pdf`](pitch-deck.pdf). Arrow keys
  or click to advance. `N` speaker notes, `T` rehearsal timer, `R` reset, all off by default and never in the PDF. The
  timer turns amber at 2:20 and red at 2:50.
- **Speakers** — **SPEAKER** narrates and owns the deck and the clock. **DRIVER** owns the keyboard and the app. One
  person can do both if the app is already on `/sample` before the pitch starts.
- **Notation** — plain text is **spoken**, _italics_ are on-stage action, `NOTE:` is internal and never spoken.
- **Team** — Team M1KU: @AlaskanTuna, @kymil4, @chaosiris, @c3638. The four handles are on slide 01 and slide 09, so
  nobody is introduced aloud.

**Never present a recording as live.** If something fails, say so out loud and take the
[fallback ladder](#13-fallback-ladder).

### Where the five required deck sections live

Devfolio requires five named sections ([`../brief.md`](../brief.md#what-we-submit)). Each is a whole slide and carries
its section name as the slide's eyebrow, so a judge holding the checklist can tick it from the back row. Three minutes
does not allow a spoken paragraph on each, and it does not have to: the deck is a submitted artifact in its own right.

| Required section                         | Slide  | Spoken at       |
| ---------------------------------------- | ------ | --------------- |
| **Problem statement and objective**      | 02, 03 | 0:14-0:50       |
| **Overall concept**                      | 04, 05 | 0:50-1:14, 1:44 |
| **Technology stacks and track chosen**   | 06     | 2:01            |
| **Motivation and challenges**            | 02, 07 | 0:14-0:34, 2:17 |
| **Commercialisation and business model** | 08     | 2:41            |

## 0. Run of show

| Time      | Segment             | Screen             | Who     |
| --------- | ------------------- | ------------------ | ------- |
| 0:00-0:14 | Who we are          | Slide 01           | SPEAKER |
| 0:14-0:34 | The problem         | Slide 02           | SPEAKER |
| 0:34-0:50 | The objective       | Slide 03           | SPEAKER |
| 0:50-1:14 | How the check works | Slide 04           | SPEAKER |
| 1:14-1:44 | **Live demo**       | app, `/sample`     | DRIVER  |
| 1:44-2:01 | The proof           | Slide 05           | SPEAKER |
| 2:01-2:17 | How it is built     | Slide 06           | SPEAKER |
| 2:17-2:41 | What broke          | Slide 07           | SPEAKER |
| 2:41-2:51 | Business model      | Slide 08           | SPEAKER |
| 2:51-3:00 | Close               | Slide 09           | SPEAKER |
| 3:00-4:00 | Judge Q&A           | parked on Slide 09 | both    |

`NOTE:` Every segment length above is also a `data-budget` attribute on the matching `section.slide` in
[`pitch-deck.html`](pitch-deck.html): 14, 20, 16, 24, 17, 16, 24, 10, 9. They sum to 150 seconds and the demo is the
other 30. **Change one and change the other,** or the rehearsal timer and the speaker notes start lying. The timer's own
`TOTAL` is 170, so it warns at 2:20 and turns red at 2:50.

`NOTE:` Word budgets are measured, not estimated. Roughly 130 words per minute for continuous speech, about 115 where
clicking and loading eat the window. Each section heading carries its own count. If a rehearsal runs long, **cut words,
never speed up.**

### What gets cut if you run long

In this order, and no further. Each line is already marked in its own section.

1. **"Signed off."** in [section 3](#3-the-problem-014-034--44-words--speaker). Two words, one beat.
1. **"You can grep for it."** in [section 8](#8-how-it-is-built-201-217--35-words--speaker). The claim survives without
   the dare.
1. **The whole of [section 8](#8-how-it-is-built-201-217--35-words--speaker), 16 seconds.** Slide 06 says it all in a
   diagram and the judges have the repository. Advance through it and keep talking about
   [section 9](#9-what-broke-217-241--47-words--speaker).
1. **The measurement half of [section 9](#9-what-broke-217-241--47-words--speaker)**, from "We measured before we built"
   to "Not one." The numbers stay on the wall.

**Do not cut the demo and do not cut the close.** The demo is the only thing on the clock a judge cannot get from the
PDF, and a pitch that stops mid-sentence at 3:00 loses more than one missing claim does.

## 1. Opening route drafts

Fifteen seconds is a handshake, not a story. All three routes below fit; the difference is who the judge is standing
next to when they land.

### Route A — the vetting committee

Local, checkable, and it disarms the first objection before it is asked. Every Malaysian university already runs human
vetting ([UiTM guidance](../PRODUCT.md#the-problem)), so a judge is about to think "they already have a committee for
that".

> "We're Team M1KU. We built Cekgu. Every university in this room already vets its exam papers by committee. That
> process is careful. Here's what it cannot catch."

**Chosen.** It is specific to this audience, it takes fourteen seconds, and it disarms the objection before the product
arrives. At three minutes there is no room to answer "don't you already have a committee?" later, so it is answered
first.

**An earlier draft ended "The committee reads the paper. Cekgu re-solves it, before a single student does."** It was cut
when slide 02's headline became **The committee reads the paper. Nobody re-solves it.** Saying a line and then
projecting it spends the same fourteen seconds twice. The opening now hands the punch to the wall and the wall lands it.

### Route B — the student's grievance

The line the concept was selected on, from
[the plain-language pitch](../superpowers/research/three-day-rescore.md#the-product-in-plain-language).

> "Every one of us has lost a mark we deserved, because the answer key was wrong. We're Team M1KU, and Cekgu is how that
> stops."

**Why not.** It spends the closing line in the opening, and it makes us sound like the customer. The buyer is the
educator, and a judge scoring practicality wants to meet them early.

### Route C — the count

Opens on the real record and puts the product in the room by the second sentence.

> "Twelve questions. Three of them had something wrong with them, and the teacher who wrote them didn't know. We're Team
> M1KU, and we built Cekgu."

**Why not.** It gives away slide 03's number before slide 02 has made anyone care about it, and the room has not met the
problem yet.

## 2. Introduction (0:00-0:14 · 27 words · SPEAKER)

**[Slide 01 - Cover]**

_Deck up on the presenter machine. The app is already open in the other window on
`cekgu-op7lf5dspq-as.a.run.app/sample`, signed out, scrolled to the top. DRIVER is idle with the cursor off screen._

> "We're Team M1KU. We built Cekgu. Every university in this room already vets its exam papers by committee. That
> process is careful. Here's what it cannot catch."

`NOTE:` Beat before the last sentence, then advance. **Do not finish the thought;** slide 02's headline finishes it, in
the same words, and the stamp at the foot of that slide answers it. Do not read a URL aloud and do not roll call four
names; the grid on the slide already says them.

## 3. The problem (0:14-0:34 · 44 words · SPEAKER)

**[Slide 02 - Problem statement]**

> "Here's one question off our sample quiz. Which data structure removes elements first in, first out? The key says
> Stack. The answer is Queue."

_(24 second) Let the room solve it. Most of them will._

> "That paper was vetted. Signed off. Published with the mistake still in it. Small enough to survive a careful human
> read."

`NOTE:` The question on the slide is question 3 of the public sample record, verbatim, and the slide prints its supplied
key and the correct answer beside it. A judge can open the Sample Report signed out and find the same item. The stamp
across the foot is the vetting-committee answer, so point at it on "That paper was vetted" if a hand is free.

`NOTE:` **Cut line: "Signed off."** It is the beat, not the argument.

## 4. The objective (0:34-0:50 · 34 words · SPEAKER)

**[Slide 03 - Project objective]**

> "So she re-reads all twelve, with the same attention on each. Cekgu turns twelve into three. Two possible key errors,
> one possible ambiguity, nine clear. Those are the live counts on our public sample."

`NOTE:` Say "possible" both times; the word is doing work. Cekgu never asserts that a key is wrong, only that it
deserves a look. The counts are what `GET /api/sample` returns right now.

`NOTE:` **There is no Unverified item in this sample.** Nothing in the pitch may promise a judge one. The chip reads
`Unverified 0` and the [Q&A](#12-qa-session-1-minute) has the answer if it is asked.

## 5. How the check works (0:50-1:14 · 51 words · SPEAKER)

**[Slide 04 - Overall concept]**

> "The key is withheld. Two model families answer cold, never seeing it and never seeing each other. We compare the two
> readers to each other first, and only then to the key. That rule was written before any model answered, and fewer than
> two verified answers is Unverified, never a guess."

_(1:12) SPEAKER, one line, then hand over:_ "Here it is on the deployed app."

`NOTE:` This is the track's explicit consensus logic, which the challenge doc calls
[a major plus](../source/gonkarouter-challenge.md#4-developer-tips-straight-from-the-organisers). **Say the ordering out
loud:** readers to each other first, key second. Do not read the five rows; they are already on the slide, and a judge
reading them is a judge not listening.

`NOTE:` The slide says **Reader A** and **Reader B**, not two model names, and that is deliberate. They are seats. Which
family sits in each is decided by health at run time and is printed on slide 06.

## 6. Live demo (1:14-1:44 · DRIVER)

> **Walked signed out on the deployed app, 5 September. Not yet rehearsed with a clock.** Every literal below is the
> label the screen shows today. If one has changed, the screen wins, not this file.

**The whole demo is one page and one click.** `/sample` is public, read-only and served from stored evidence, so it
needs no sign-in, no Guest workspace and no live gateway call. That is why it is the demo at three minutes: nothing in
the path can be slow.

1. **Already open:** `https://cekgu-op7lf5dspq-as.a.run.app/sample`. _The record header reads_ **Introductory computer
   science practice set** _with a_ `Sample` _chip, and the five verdict chips read_ `Possible Key Error 2`,
   `Possible Ambiguity 1`, `Split Opinion 0`, `Unverified 0`, `Clear 9`.

   > "This is the public sample record. No sign-in, and the QR at the end opens it on your phone."

1. **Click:** `Show Evidence` on the **first row in the list**, question 3,
   `Which data structure removes elements in first in, first out order?`. _The evidence panel opens inline beneath the
   item. Do not filter and do not scroll to find it: the page already sorts attention items above_ `Clear` _ones, so
   question 3 is the top row._

   > "Question three. Both readers answered it without the key. Both chose Queue; the key says Stack."

1. **The moment.** _The supplied-key bubble is filled on_ `A`. _Both reader columns are filled on_ `B`. _The sentence
   above the button reads_ **"Both readers chose Queue. The supplied key is Stack. Rule: two verified readings agree on
   a non-key option, so Possible Key Error."** _A judge sees the disagreement before anyone explains it._

1. **Point at:** the two `Request Id` values, one in each reader column, and the `Receipt` field under each reading,
   both reading `Verified`. _Say this one out loud._

   > "Two different models, two Gonka request ids, both receipts verified. That's what proves this reasoning ran on the
   > network and not on our laptop."

_DRIVER stops. SPEAKER takes the deck back._

`NOTE:` **This is the track's proof obligation and it is the one thing on the clock that cannot be cut.** The challenge
doc requires a Gonka Request ID visible for every inference step; step 4 is where a judge sees two of them, side by
side, on a page anyone in the room can open.

`NOTE:` **Reader A on this question is `moonshotai/Kimi-K2.6` and it will be on screen.** That family was delisted on 5
September. Do not explain it here, do not apologise for it, and do not skip past it: it is a preserved record and both
receipts still resolve. [Section 9](#9-what-broke-217-241--47-words--speaker) opens by pointing straight back at it,
which is worth far more than six seconds spent hedging now.

`NOTE:` **Do not submit a new check on stage.** A one-question guest check submitted at 16:42 UTC on 5 September was
still `Checking` with no recorded attempt twenty-five minutes later. Offer it in Q&A as something a judge can start
themselves, never as something that finishes while we watch.

`NOTE:` **Do not sign in.** The Guest workspace is shared and will hold other people's records, and the decision beat it
would unlock costs fifteen seconds we do not have. Everything above happens signed out, on one URL.

`NOTE:` Read the request ids off the screen; do not recite them from this file. Never wait for a load in silence. If a
click is slow, say what is about to appear.

## 7. The proof (1:44-2:01 · 39 words · SPEAKER)

**[Slide 05 - The proof]**

> "That id is on the wall. Open the URL from your seat. The gateway tells you which model served it. On a centralised
> API I can tell you I used two models. Here, you can check that I did."

`NOTE:` If a judge reaches for a phone here, **stop and let them.** It is the best thing that can happen in this pitch.
The id on the slide is `req-1788427238422211326-414866`, served by `MiniMaxAI/MiniMax-M2.7`, and it was re-checked
against `GET /v1/receipts/{id}` on 5 September: HTTP 200, `outcome: success`, served model matching the slide.

`NOTE:` **The slide carries one receipt, not a pair, and that is on purpose.** Question 9's two readers were MiniMax and
Kimi; printing a delisted model beside a live one needs a footnote, and a wall is the wrong place for one. The pair
claim is made by the foot line, `Every question gets two of these, from two different model families`, and it is shown
live in the demo.

`NOTE:` **Be precise about what a receipt is.** Gateway metadata, not cryptographic proof and not an on-chain
transaction. Our own product copy says so ([TRD, request ids and provenance](../TRD.md#4-request-ids-and-provenance)).

## 8. How it is built (2:01-2:17 · 35 words · SPEAKER)

**[Slide 06 - Technology stack and track chosen]**

> "One Bun process. Hono serves the API, the queue worker runs in it, Postgres keeps every attempt. Every model call
> leaves from one file, and that file only knows GonkaRouter. You can grep for it."

`NOTE:` Three of the four track requirements land here, said out loud or shown in the diagram: all inference through
GonkaRouter, two families cross-verifying, a request ID on every step. The fourth, the printed rule, was slide 04. Do
not read the black band word for word.

`NOTE:` **Cut line: "You can grep for it."** Then the whole section, if the clock demands it.

## 9. What broke (2:17-2:41 · 47 words · SPEAKER)

**[Slide 07 - Motivation and challenges]**

> "That second reader you just saw? Tonight the gateway stopped serving it. We changed one line: the list of model
> families. Nothing else."

_(2:30)_

> "We measured before we built, too. Thirty questions, fourteen of twenty planted mistakes caught, and on forty clean
> questions it flagged nothing. Not one."

`NOTE:` **Land on "Not one." Beat, then take slide 08.** The zero is the failure direction a teacher actually cares
about, and it is the one figure on this deck the sample record cannot support.

`NOTE:` **The wall says "5 SEPTEMBER, THE NIGHT BEFORE", not a clock time,** because a Discord timestamp is not
something a judge outside the team can check. Say "tonight"; keep the hour for the answer below.

`NOTE:` **Be exact if pushed, and only if pushed.** The family was `moonshotai/Kimi-K2.6`; the GonkaRouter mentor
announced it on Discord at 6:21 PM on 5 September; the commit is
`fix(gateway): drop the delisted Kimi family from the model registry`. The registry was the only production edit, and
the queue's own health window already demotes a family with no successes and three failures inside fifteen minutes
([`src/server/queue/health.ts`](../../src/server/queue/health.ts)). **WE DID NOT SIT AND WATCH THAT DEMOTION HAPPEN IN
PRODUCTION TRAFFIC. If a judge asks whether we observed it live, say no, and say the design is what made the fix one
line.**

`NOTE:` **Two measurements share the right of this slide and the deck keeps them apart.** Never blur them.

- The chart is the [3 September mechanism benchmark](../superpowers/research/three-day-rescore.md), which judged a
  synchronous design nobody shipped. Its recorded verdict of "failed" is about that design, not the queue.
- The dot field is the
  [30-question set run twice through the deployed queue](../superpowers/research/three-day-rescore.md#the-30-item-evaluation-set--4-september),
  60 item-runs in all.

`NOTE:` **That run's own Unverified rate, 19 of 60, is deliberately off the slide.** It is a load effect, not a
regression: thirty questions back to back sustain account-level rate limiting a twelve-question paper never reaches.
Quoting it without that sentence misrepresents both runs, and the sentence does not fit on a wall.

`NOTE:` **The one green dot at the end of the defect row is a real miss.** Question 6 of the sample record, written to
be ambiguous, came back **Clear** in the first pass and **Unverified** in the second. It is in
[the README](../README.md#about-the-project) as a characterised limitation. **DO NOT PRESENT IT AS FIXED OR AS A
ONE-OFF.**

## 10. Business model (2:41-2:51 · 20 words · SPEAKER)

**[Slide 08 - Commercialisation and business model]**

> "We charge for questions checked, not tokens. Twenty-nine ringgit for three hundred a month. And nobody has paid us
> yet."

`NOTE:` Saying the pricing is untested **before** a judge says it is worth more than the pricing is. If the clock is
tight, cut the number and keep the last sentence.

`NOTE:` The slide carries a third plan and the buyer, neither of which the spoken line names: **Cekgu Studio**, the same
product at 1500 questions a month for RM79, and the line "The first buyer is an independent tutor, not a university
procurement office." The judges read both while you talk. **NOBODY IS ON ANY OF THE THREE PLANS AND ALL THREE PRICES ARE
UNTESTED.**

## 11. Close (2:51-3:00 · 20 words · SPEAKER)

**[Slide 09 - Close]**

### Slogan drafts

| Draft                                                 | Verdict                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| "Check the exam before the exam checks us."           | The concept's own line, and it puts the student back in it. Too clever to hear  |
| "Two readers, one rule, and the receipt to prove it." | Lands the mechanism. Too technical for the last five seconds                    |
| "Check the paper before the students sit it."         | **Chosen.** It is the line already on slide 09, so it is heard and read at once |

### Finalized close

> "We accept losing marks when we're wrong. Not when the paper is.
>
> Check the paper before the students sit it."

`NOTE:` Beat before the last line. Then stop talking and leave slide 09 up for the whole minute of Q&A. The QR on it
opens the public sample record, so a judge can be looking at the evidence while they ask.

## 12. Q&A session (1 minute)

One minute is one question and maybe a follow-up. **Answer in three sentences and stop.** A long answer to a good
question costs the next judge their turn.

### Most likely, prepare these cold

**"You showed Kimi in the demo. Kimi is offline. Is this stale?"**

-> The record is from 3 September and we kept it as it came back, including which model answered. Both of those receipts
still resolve, so you can check them now. The gateway dropped Kimi this evening and our registry lost a line; the queue
seats whichever two families are healthy, so nothing else had to change. **(THE DEMO SHOWS A PRESERVED RECORD, NOT A
LIVE CALL. Say so plainly rather than implying the check just ran.)**

**"Is the demo hardcoded?"**

-> No. That record is what our own queue produced on 3 September, kept exactly as it came back: twelve questions,
forty-two attempts, thirty-two distinct Gonka request ids. Eighteen of those attempts were rejected and they are still
in the record with the gateway's own error text beside them, because a run that only kept its successes would be a
brochure. Query any id against the public receipts endpoint from your own laptop right now. **(A LIVE CHECK TAKES
MINUTES, NOT SECONDS. Offer the queued state, never a finished verdict.)**

**"What stops the two models from just agreeing with each other?"**

-> Nothing stops them, and agreement is not our claim. They never see the key and never see each other's answer, so
agreement is not coordination, but it could still be correlation. That is exactly why the verdict reads **Possible Key
Error** and not "key error", and why only the teacher can change a key. **(WE HAVE NOT MEASURED HOW CORRELATED MINIMAX
AND DEEPSEEK ARE. Do not claim independence of training data.)**

### Second tier, likely

**"Why does this need to be decentralised at all?"**

-> What decentralisation actually buys this product is the receipt. The gateway publishes which model served which
request, so "two independent models checked your paper" is something you can verify rather than something we assert.
When a student challenges a question, that trail is what the teacher shows. **(THE RECEIPT IS GATEWAY METADATA, not
cryptographic and not an on-chain transaction.)**

**"What happens when the gateway rate-limits you?"**

-> It happened on the record you just looked at. DeepSeek answered `429` on five calls, timed out on a sixth, and served
nothing, and all twelve questions still got two receipt-verified readings from the other families. A hard cap of four
calls in flight, three attempts per family, and when the budget really is spent the question goes **Unverified**, which
is a visible state with a **Retry Verification** button next to it.

**"How accurate is it? Give me a number."**

-> I will not give you a percentage, because I do not have one that would mean anything on sixty runs. Thirty questions,
twenty clean and ten planted, twice through the deployed queue: no clean question flagged, fourteen of twenty planted
defects caught, five abstained and one missed. **(NO ACCURACY PERCENTAGE until a broader labelled set exists. It is the
first thing we would build with the prize.)**

**"Why would a teacher upload an unreleased paper to a decentralised network?"**

-> Many of them should not, and the product says so rather than hiding it. UiTM's own guidance calls final papers
confidential and node operators can see prompt text, so version one is for practice sets, past-year papers and question
banks.

**"How is this different from pasting the paper into ChatGPT?"**

-> A chat sees your key and anchors on it; our readers never see it. A chat is one opinion; we require two distinct
model families whose receipts name different models. And a chat leaves no record; we keep every attempt, every request
id and the human's decision beside the machine's.

### Third tier, brief answers

**"Only two models now. Isn't two the bare minimum?"**

-> Yes, and it is the floor rather than a preference: one family cannot produce two distinct readings, so with two
configured we try a struggling family rather than skip it.

**"Is the request id on-chain?"**

-> No. It is a gateway receipt anyone can query. We are careful never to call it on-chain proof.

**"Your rule starts with Unverified, but there isn't one in the record."**

-> Not in this capture, and I would rather say that than show you a stale one. What it does have is eighteen rejected
attempts sitting next to the ones that counted.

**"Does it work for anything other than multiple choice?"**

-> Not yet. The rule compares a chosen option against a supplied key, and that shape is multiple choice. **(NOT BUILT
AND NOT VALIDATED. Do not promise it for a date.)**

**"What are the cats?"**

-> Two readers made visible, one white and one black. They are licensed Live2D sample characters and they are credited
as such.

**"What would you do with the prize?"**

-> A labelled evaluation set big enough to publish a real precision number, then Bahasa Malaysia, then export.

## 13. Fallback ladder

Decide this before you need it. Venue wifi will be bad.

| If                                     | Then                                                                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/sample` is slow to paint             | Say what is about to appear and keep talking. It is stored evidence, not a model call, so it will arrive                                                                     |
| The venue network is down              | **Slide 04 is the demo.** It carries the question, both readers, the key and the rule that fired. Say "this is the deck, not the app" first, then spend the 30 seconds there |
| A judge asks to see a check run        | Offer to start one and hand them the record URL. **Never wait for it on stage**                                                                                              |
| The deployed app is down               | Slides 04 and 05 carry the whole demo, and the request id on slide 05 resolves from any phone on mobile data                                                                 |
| The presenter laptop dies              | [`pitch-deck.pdf`](pitch-deck.pdf) on the second machine and on a USB stick. Self-contained, needs no network                                                                |
| The projector will not take the laptop | The PDF opens on anything. Nine pages, 1920 by 1080, fonts embedded                                                                                                          |

`TO FILL:` a recorded MP4 of the demo path, kept offline at `docs/demo/assets/cekgu-demo.mp4`. The submitted film at
[youtu.be/zFASN69yQr8](https://youtu.be/zFASN69yQr8) is not a substitute, because playing it needs the same network the
demo needs. **If anything recorded is ever played on stage, say the word "recording" first.**

## 14. The 2-minute MVP video

> **Superseded, and retained rather than deleted.** The submitted MVP video is the 4-minute-42 film at
> [youtu.be/zFASN69yQr8](https://youtu.be/zFASN69yQr8), shot from [`recordly-script.md`](recordly-script.md), and it is
> public and unchangeable. The shot list below is the two-minute cut that was planned before it and never shot. It is
> kept because it is the only written form of a two-minute version, and because the track brief asks for a 2-minute
> video pitch showing the product in action.

**Before you record.** Capture at 1920x1080, the deployed URL in a clean browser window, no bookmarks bar, no
notifications, cursor visible. Record the voice-over separately over the screen capture. Reset the shared sample first,
so shot 7 starts with no decision on the item: signed in as Guest, open the browser console on the app and run
`await fetch('/api/sample/reset', { method: 'POST' })`. It answers `{"reset":true}`. Use a fresh browser profile, or
clear `cekgu.guestBannerDismissed` from `localStorage`, because the shared-workspace banner in shot 2 is dismissible.
The Guest workspace is shared and will hold other guests' records, so find the sample by typing `Introductory` into
`Search`, never by scrolling.

| #   | Time      | Visual                                                                                                                                                                                   | Voice-over                                                                                                                                                                                                                                            |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 0:00-0:13 | The landing page, held on the hero: the `Cekgu` wordmark and **Two readers see your paper before your learners do.** Cursor moves to **Try Cekgu Free** and clicks                       | "A learner can understand a subject and still lose marks because the answer key is wrong. Cekgu gives every question an independent second look, before learners see it."                                                                             |
| 2   | 0:13-0:24 | Sign-in: two panes, no top bar, the guest warning under the button. Click **Sign In as Guest**. **Records** opens and the ink-black shared-workspace banner holds                        | "For this demonstration we use Cekgu's shared Guest workspace and a public sample paper. Confidential papers and learner data do not belong here."                                                                                                    |
| 3   | 0:24-0:37 | Type `Introductory` into `Search`, open **Introductory computer science practice set**, the row with the **Sample** chip. Hold on the **Summary** heading and its chips                  | "This sample holds twelve computer science questions. Nine came back clear. Three need attention, so the educator goes straight to those instead of starting at question one."                                                                        |
| 4   | 0:37-0:54 | Click the **Possible Key Error** chip, which reads `2`. Twelve rows collapse to two. **Show Evidence** on the first in, first out question. The bubble row fills `A` and rings `B` twice | "Here, the supplied key says Stack. But both independent readers chose Queue, and neither was shown the key. Cekgu identifies this as a possible key error, and explains why."                                                                        |
| 5   | 0:54-1:14 | **The receipt beat.** Hold the evidence panel: two **Served Model** names, two different `Request Id` values, both `Receipt` fields reading `Verified`                                   | "To review a question, Cekgu sends its wording and options — without the supplied key — through GonkaRouter to two distinct model families. The educator can inspect each reading, the served model, the gateway request ID, and its receipt status." |
| 6   | 1:14-1:28 | Scroll to **All Attempts** on the same item. Three rows: two `Admitted`, one `Timed Out` carrying **The call passed the 90 second evidence cutoff.**                                     | "The review stays honest when a model cannot complete its reading. Without two verified readings, Cekgu returns Unverified rather than presenting a false consensus."                                                                                 |
| 7   | 1:28-1:41 | **Key Corrected**, then the `B` bubble under **Corrected Key**, then **Record Decision**. The **Possible Key Error** chip stays exactly where it was                                     | "Cekgu does not change an answer key automatically. The educator reviews the evidence and makes the final decision."                                                                                                                                  |
| 8   | 1:41-1:54 | Let the corrected question hold, then dissolve slowly to the landing hero                                                                                                                | "With Cekgu, educators can catch possible key errors and ambiguous questions before learners see them — making every practice paper easier to review and explain."                                                                                    |
| 9   | 1:54-2:00 | The landing hero, the `Cekgu` wordmark and `cekgu-op7lf5dspq-as.a.run.app`, silent to the end                                                                                            | No narration.                                                                                                                                                                                                                                         |

**Recording notes, unchanged from the original draft.**

- **Shot 5 is the one that cannot be cut.** It is the track's proof obligation and the single frame that separates this
  entry from a prompt typed into a chat window. Hold it long enough to read a request id off the screen.
- **Shot 5's model names are now dated.** The record's two readers are MiniMax and Kimi, and Kimi was delisted on 5
  September. A re-shoot should name the seats, not the pair, or say the date on screen.
- **Do not claim certification, cryptographic proof, on-chain proof, automatic key changes, or guaranteed correctness.**
  The receipt is unsigned gateway metadata ([TRD, request ids and provenance](../TRD.md#4-request-ids-and-provenance)):
  it makes the serving model publicly inspectable, and that is all.
- **Do not speed up or cut around a slow model call.** If a call takes forty seconds, cut to the queued state and say
  so. A video that pretends the gateway is instant contradicts the deck's own challenges slide.
- **Shoot on the signed-in record, not on the public Sample Report.** `/sample` renders the same twelve items and the
  same receipts, but it is read-only: `ItemRow` drops the whole decision group there, so shot 7 has nothing to click.
- **Shot 6 shows the mechanism, not the verdict.** This record has no Unverified item, so what is on screen is the one
  call that never came back, which is what the line is about. The table scrolls sideways, so frame the `Status` column
  and the reason under it and let `Request Id` sit off-frame.

## 15. Pre-flight

- [ ] Slide 09's QR scanned with a phone off the rendered deck, and it lands on the public sample record
- [ ] `https://cekgu-op7lf5dspq-as.a.run.app/sample` opened signed out on the demo laptop, and `Show Evidence` on the
      top row opens the panel with two request ids visible without scrolling sideways
- [ ] `req-1788427238422211326-414866` queried against `api.gonkarouter.io/v1/receipts/` on the day, and it still
      answers `outcome: success` with `MiniMaxAI/MiniMax-M2.7`
- [ ] The model names on slide 06 checked against `src/server/gateway/models.ts` on the day
- [ ] Sections 2 to 11 rehearsed end to end with the timer (`T`), last word before 3:00
- [ ] [Section 6](#6-live-demo-114-144--driver) walked against the running app, and every literal label re-checked
      against the screen
- [ ] The three [most likely questions](#most-likely-prepare-these-cold) answered out loud, in three sentences each
- [ ] [`pitch-deck.pdf`](pitch-deck.pdf) exported, opened on a second machine with the network off, and page count
      confirmed as 9
- [ ] `du -sh docs/demo/` under 3 MB, `du -h docs/demo/pitch-deck.pdf` under 2 MB
