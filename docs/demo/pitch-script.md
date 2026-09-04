# Pitch script

The spoken script for Demo Day at APU, 6 September 2026. Owned by the `pitch-smith` subagent
([`.claude/agents/pitch-smith.md`](../../.claude/agents/pitch-smith.md)).

> **4 September 2026, written against the frozen build.** The app is live at `cekgu-op7lf5dspq-as.a.run.app` and its
> sample record is public at `/api/sample`, signed out. Every count, model id, request id and literal button label below
> was read off the running app and the record today, not planned against a design. The one exception is
> [the 30-item evaluation](../superpowers/research/three-day-rescore.md#the-30-item-evaluation-set--4-september) behind
> slide 08, which is its own recorded run through the same deployed queue.
>
> **What is still open is the rehearsal, not the build.** Nobody has walked section 6 with a clock in front of an
> audience; that is issue #42. Run it once before the room fills, correct any label the app has changed since, and cut
> this paragraph to the second sentence.

Contents:

1. [Format and conventions](#format-and-conventions)
1. [Run of show at a glance](#0-run-of-show-at-a-glance)
1. [Opening route drafts](#1-opening-route-drafts)
1. [Introduction](#2-introduction-000-015--32-words--speaker)
1. [The problem](#3-the-problem-015-040--58-words--speaker)
1. [The objective](#4-the-objective-040-100--45-words--speaker)
1. [How the check works](#5-how-the-check-works-100-135--77-words--speaker)
1. [Live demo](#6-live-demo-135-245--driver)
1. [The proof](#7-the-proof-245-315--62-words--speaker)
1. [How it is built](#8-how-it-is-built-315-345--63-words--speaker)
1. [What we measured](#9-what-we-measured-345-415--65-words--speaker)
1. [Business model](#10-business-model-415-435--49-words--speaker)
1. [Close](#11-close-435-445--20-words--speaker)
1. [Q&A session](#12-qa-session-5-minutes)
1. [Fallback ladder](#13-fallback-ladder)
1. [The two-minute video](#14-the-two-minute-video-shot-list)
1. [Pre-flight](#15-pre-flight)

## Format and conventions

- **Slot** — 5 minutes presentation plus 5 minutes Q&A. Source:
  [`../source/opening-ceremony-transcript.md`](../source/opening-ceremony-transcript.md).
- **Budget** — 3:35 deck · 1:00 live demo · last word by **4:45**. The final 15 seconds is buffer, never content.
- **Deck** — [`pitch-deck.html`](pitch-deck.html), 10 slides. PDF backup: [`pitch-deck.pdf`](pitch-deck.pdf). Arrow keys
  or click to advance. `N` speaker notes, `T` rehearsal timer, `R` reset — all off by default and never in the PDF.
- **Speakers** — **SPEAKER** narrates and owns the deck and the clock. **DRIVER** owns the keyboard and the app.
- **Notation** — plain text is **spoken**, _italics_ are on-stage action, `NOTE:` is internal and never spoken.
- **Team** — Team M1KU. `TO FILL:` the four member names, in the **Devfolio submission**. Slide 01 carries the team name
  and nothing else, deliberately: a deck should not advertise an unfinished state to a judge.

**Never present a recording as live.** If something fails, say so out loud and take the
[fallback ladder](#13-fallback-ladder).

### Where the five required deck sections live

Devfolio requires five named sections ([`../brief.md`](../brief.md#what-we-submit)). Each is a whole slide, not a
bullet, and each carries its section name as the slide's eyebrow so a judge holding the checklist can tick it from the
back row.

| Required section                         | Slide         | Spoken at          |
| ---------------------------------------- | ------------- | ------------------ |
| **Problem statement and objective**      | 02 and 03     | 0:15-1:00          |
| **Motivation and challenges**            | 02, 03 and 08 | 0:15-1:00 and 3:45 |
| **Overall concept**                      | 04, 05 and 06 | 1:00-1:45 and 2:45 |
| **Technology stacks and track chosen**   | 07            | 3:15               |
| **Commercialisation and business model** | 09            | 4:15               |

## 0. Run of show at a glance

| Time       | Segment             | Screen             | Who     |
| ---------- | ------------------- | ------------------ | ------- |
| 0:00-0:15  | Who we are          | Slide 01           | SPEAKER |
| 0:15-0:40  | The problem         | Slide 02           | SPEAKER |
| 0:40-1:00  | The objective       | Slide 03           | SPEAKER |
| 1:00-1:35  | How the check works | Slide 04           | SPEAKER |
| 1:35-1:45  | Hand to the demo    | Slide 05           | SPEAKER |
| 1:45-2:45  | **Live demo**       | app                | DRIVER  |
| 2:45-3:15  | The proof           | Slide 06           | SPEAKER |
| 3:15-3:45  | How it is built     | Slide 07           | SPEAKER |
| 3:45-4:15  | What we measured    | Slide 08           | SPEAKER |
| 4:15-4:35  | Business model      | Slide 09           | SPEAKER |
| 4:35-4:45  | Close               | Slide 10           | SPEAKER |
| 5:00-10:00 | Judge Q&A           | parked on Slide 10 | both    |

`NOTE:` Word budget is measured, not estimated. Roughly 130 wpm for continuous speech, ~115 wpm where clicking and
loading eat the window. Each section heading below carries its own count. If a rehearsal runs long, **cut words, never
speed up.** Re-count and re-time after any line edit.

## 1. Opening route drafts

### Route A — the student's grievance

The line the concept was selected on, from
[the plain-language pitch](../superpowers/research/three-day-rescore.md#the-product-in-plain-language). Warm, and it
puts a judge on the beneficiary's side inside five seconds.

> "As students, we accept losing marks when we're wrong. What feels unfair is losing them because the exam itself was
> wrong. We built Cekgu so that stops happening."

**Why not.** It spends the closing line in the opening, and it makes us sound like the customer. The buyer is the
educator, and a judge scoring practicality wants to meet them early.

### Route B — the lecturer's Sunday night

Concrete, and it names the operator instead of the beneficiary.

> "It's Sunday night. You've written twelve questions for tomorrow's quiz, you've read them twice, and question seven
> has the wrong answer key. You won't find out until thirty students have already lost the mark."

**Why not.** "Thirty students" is a number we cannot support, and the scene takes eighteen seconds to build. Good
material for the video, too slow for a fifteen-second handshake.

### Route C — the vetting committee

Local, checkable, and it disarms the first objection before it is asked. Every Malaysian university already runs human
vetting ([UiTM guidance](../PRODUCT.md#the-problem)), so a judge is about to think "they already have a committee for
that".

> "Every university in this room already vets its exam papers by committee. The committee reads the paper. Nobody
> re-solves it."

**Chosen.** It is specific to this audience, it takes eight seconds, and the differentiator arrives before the product
does.

### Finalized opening

> "We're Team M1KU, and we built Cekgu. Every university in this room already vets its exam papers by committee. The
> committee reads the paper. Cekgu re-solves it, before a single student does."

`NOTE:` 32 words. Land on "before a single student does" and stop. No "without further ado", no roll call of four names.

## 2. Introduction (0:00-0:15 · 32 words · SPEAKER)

**[Slide 01 — Cover]**

_Deck up on the presenter machine. The app is already open in the other window on the sign-in page, signed out, fields
empty. DRIVER is idle with the cursor off screen._

> "We're Team M1KU, and we built Cekgu. Every university in this room already vets its exam papers by committee. The
> committee reads the paper. Cekgu re-solves it, before a single student does."

`NOTE:` Handshake, not a beat. Do not read a URL aloud.

## 3. The problem (0:15-0:40 · 58 words · SPEAKER)

**[Slide 02 — Problem statement]**

_(15 second)_

> "Here's one item on a twelve-question quiz. Which data structure removes elements first in, first out? The supplied
> key says Stack. The answer is Queue."

_(25 second)_

> "That paper was vetted. Signed off. Published with the defect still in it. Not big questions. One wrong key, two
> defensible answers, a missing word. Small enough to survive a careful human read."

`NOTE:` The item on the slide is question 3 of the sample record, verbatim, down to the four option texts. The red pen
mark at the bottom right is the committee's sign-off. Point at it on "signed off" if a hand is free, and do not explain
the joke.

`NOTE:` 58 words in 25 seconds is 139 wpm, about two seconds over. If the rehearsal runs long, "Not big questions." is
the line to cut.

## 4. The objective (0:40-1:00 · 45 words · SPEAKER)

**[Slide 03 — Project objective]**

> "So the lecturer re-reads all twelve, with the same attention on each. Cekgu turns twelve into three. Two possible key
> errors, one possible ambiguity, nine clear. Those are the live counts on our public sample. The three are where a
> human should spend the evening."

`NOTE:` Say "possible" both times; the word is doing work. The counts are what `GET /api/sample` returns right now, and
a judge can open the Sample Report signed out and count the chips.

`NOTE:` **There is no Unverified item in this sample.** Nothing in the pitch may promise a judge one. If asked, it is
real product behaviour that this particular capture did not produce; the [Q&A](#12-qa-session-5-minutes) has the answer.

## 5. How the check works (1:00-1:35 · 77 words · SPEAKER)

**[Slide 04 — Overall concept]**

> "Three things matter here. One, the key is withheld. Two model families on the Gonka network answer it cold, never
> seeing the key and never seeing each other.
>
> Two, we compare the readers to each other first, and only then to the key. Both said Queue. The key says Stack.
>
> Three, that rule was written down before any model answered, and it's the list on the right. Fewer than two verified
> readings is Unverified, never a verdict."

`NOTE:` This is the track's explicit consensus logic, which the challenge doc calls
[a major plus](../source/gonkarouter-challenge.md#4-developer-tips-straight-from-the-organisers). Say the ordering out
loud. Do not read all five rows; they are already on the slide.

`NOTE:` The Unverified line is the rule, not a prediction. Say "is Unverified", never "you'll see one" — this record has
none, and the [demo](#6-live-demo-135-245--driver) shows the rejected attempts instead.

## 6. Live demo (1:35-2:45 · DRIVER)

> **Walked on the live app, 4 September. Not yet rehearsed with a clock** — that is issue #42. Every literal below is
> the label the screen shows today. If one has changed, the screen wins, not this file.

**[Slide 05 — The demo moment]** _(1:35-1:45 · 19 words · SPEAKER)_

> "That's the item Cekgu flagged. Here it is on the deployed app, and I'm signing in as a guest."

_SPEAKER stops talking. DRIVER Alt+Tabs to the app and narrates only the numbered lines._

1. **Click:** `Sign In as Guest`. _The shared-workspace banner appears and stays put._
1. **Click:** the row titled `Introductory computer science practice set`, the one carrying the `Sample` chip. _The
   workspace opens. Five verdict filters with their counts, and one line in red:_ **"3 items need attention"**
1. **Click:** the `Possible Key Error` filter chip, which reads `2`. _Twelve rows collapse to two._
1. **Click:** `Show Evidence` on question 3, `Which data structure removes elements in first in, first out order?`. _The
   evidence panel opens inline beneath the item, not on a new page._
1. **The moment:** _the supplied key bubble is filled on `A`, and both reader columns have theirs filled on `B`. The
   sentence above the button reads_ **"Both readers chose Queue. The supplied key is Stack."** _A judge sees the
   disagreement before anyone explains it._
1. **Point at:** the two `Served Model` names, `moonshotai/Kimi-K2.6` and `MiniMaxAI/MiniMax-M2.7`, and the **two
   distinct `Request Id` values** beneath them, each with `Receipt Verified`. _Say this one out loud: this is what
   proves the reasoning ran on the network and not on our server._
1. **Scroll to:** `All Attempts`, still on question 3. _Three rows. Two are `Admitted`. The third is `Timed Out`, and
   the reason beside it reads_ **"The call passed the 90 second evidence cutoff."** _Say it: a reading with no verified
   receipt is not a second reader. Cekgu keeps it and refuses to count it._
1. **Click:** `Key Corrected`, then the `B` bubble under `Corrected Key`, then `Record Decision`. _The attention count
   drops. The machine verdict chip stays exactly where it was._

_DRIVER stops. SPEAKER takes the deck back._

`NOTE:` Read the request ids off the screen; do not recite them from this file. Never wait for a load in silence. If a
click is slow, say what is about to appear.

`NOTE:` **The `All Attempts` table scrolls sideways.** At laptop width the `Request Id`, `Shard`, `Latency` and
`Receipt` columns sit off the right edge. Point at `Status` and the reason under it, which are always visible; the ids
for step 6 are in the reader columns above, not in this table.

`NOTE:` **If step 7 has more time, use question 1 instead.** Clear the filter, `Show Evidence` on
`What is the time complexity of reading the element at a known index in an array?`, and its `All Attempts` has six rows
that add up: two `Admitted`, two `Rate Limited` carrying the gateway's own words, one `Timed Out` at the 90-second
cutoff, and a hedge that lost its own race. It is the stronger picture and it costs about eight seconds more. Question
12 is the same shape with three rate limits and no cutoff.

`NOTE:` **Reset the sample before the pitch** ([FR-SAMPLE-3](../PRD.md#the-sample-record)), so step 8 starts with no
disposition on it. There is no button: signed in as Guest, open the browser console on the app and run
`await fetch('/api/sample/reset', { method: 'POST' })`. It answers `{"reset":true}`.

`NOTE:` **The Guest workspace is shared and it will have other people's records in it.** On 4 September the list held
four besides the sample. Identify the row by its title and its `Sample` chip, or type `Introductory` into `Search`
first. Do not scroll hunting for it on stage.

`NOTE:` The "submit a new check and walk away" beat is **cut from the stage demo** and lives in
[the video](#14-the-two-minute-video-shot-list) instead. It costs twenty seconds and proves less than the receipt does.
Offer it in Q&A if a judge asks whether the thing actually runs.

## 7. The proof (2:45-3:15 · 62 words · SPEAKER)

**[Slide 06 — The proof]**

> "That's the part this track is actually about. Every reading carries a Gonka request id. These two are from question
> nine on the record you just had open. Different models, different ids, both receipts verified.
>
> Paste either id into that receipts URL and the gateway tells you which model served it. That's what proves this
> reasoning didn't come out of our server."

`NOTE:` If a judge reaches for a phone here, **stop and let them**. It is the best thing that can happen in this pitch.
The receipt is gateway metadata, not cryptographic or on-chain proof, and we say so if pressed.

`NOTE:` These two ids are **in the sample record**, on question 9, the mis-keyed DNS item. That is the whole point of
the beat: a judge can lift either string off the wall, search the Sample Report for it, and find the reading it belongs
to. Both were re-verified against `GET /v1/receipts/{id}` on 4 September — HTTP 200, `outcome: success`, served model
matching the slide.

## 8. How it is built (3:15-3:45 · 63 words · SPEAKER)

**[Slide 07 — Technology and track]**

> "One Bun process. Hono serves the API, the queue worker runs inside it, Postgres holds the records. Every inference
> call leaves from one file, and it goes to GonkaRouter. There's no other AI provider in this repository, and you can
> grep for it.
>
> The four things this track requires are the four things this product needs to work. We didn't bolt them on."

`NOTE:` Three of the four track requirements land here, said out loud: all inference through GonkaRouter, at least two
models cross-verifying, and a Gonka Request ID shown for every step. The fourth, the printed rule, was slide 04.

## 9. What we measured (3:45-4:15 · 65 words · SPEAKER)

**[Slide 08 — Motivation and challenges]**

> "We measured before we built, and it went against us. Twelve items, two models, and not one had two readings inside
> thirty seconds.
>
> So we threw out the instant checker and built a queue that fails closed. Twelve of twelve got two verified readings.
>
> Then thirty items, twice. It caught fourteen of twenty planted defects. And on forty clean-control runs it flagged
> nothing. Not one."

`NOTE:` This is the slide that says we tested our own idea and let the result change the architecture. Do not soften it
into "we faced some challenges". The sponsors asked for
[a complete implementation rather than a complex one](../brief.md#how-we-are-judged), and this is what that sounds like.

`NOTE:` **Land on "Not one."** The zero is the one figure on this deck the sample record cannot support, and it is the
failure direction a lecturer actually cares about. Beat, then take slide 09.

`NOTE:` **Three measurements share this slide and the deck keeps them apart.**

- The chart is the benchmark that
  [recorded a verdict of "failed"](../superpowers/research/three-day-rescore.md#the-mechanism-benchmark--failed-3-september);
  it judged a synchronous design nobody shipped.
- The `12 of 12` in the left column is the public sample record, on twelve items drawn from the same committed
  evaluation set — **they are not provably the identical twelve** ([PRD](../PRD.md#the-sample-record)), so never say
  "the same twelve".
- The dot rows are a third run entirely:
  [the 30-item set, twice through the deployed queue](../superpowers/research/three-day-rescore.md#the-30-item-evaluation-set--4-september).

Never blur them, and never quote the benchmark's "thirteen of thirteen" as if it described the record on screen.

`NOTE:` **The 30-item run's own Unverified rate, 19 of 60, is deliberately off the slide.** It is a load effect, not a
regression: thirty items back to back sustain account-level rate limiting that a twelve-item paper never reaches.
Quoting it beside the sample record's own 0 of 12 without that sentence misrepresents both, and the sentence does not
fit on a wall. If a judge asks, [the Q&A](#12-qa-session-5-minutes) carries it with the explanation attached.

`NOTE:` **The one green dot at the end of the defect row is a real miss.** It is question 6 of the sample record as
well: "Which layer of the TCP/IP model does HTTP belong to?", written to be ambiguous, returned **Clear** in the first
pass and **Unverified** in the second. No item caught in one pass ever came back **Clear** in the other. It is in
[the README](../README.md#what-cekgu-cannot-do) as a characterised limitation. **DO NOT PRESENT IT AS FIXED OR AS A
ONE-OFF.**

## 10. Business model (4:15-4:35 · 49 words · SPEAKER)

**[Slide 09 — Business model]**

> "We charge for questions checked, not tokens. Free is twenty a month, Plus is three hundred for twenty-nine ringgit.
> The first buyer is an independent tutor, not a university procurement office. And I'll say it before you do: nobody
> has paid us anything. This is a price to test."

`NOTE:` Saying the pricing is untested **before** a judge says it is worth more than the pricing is. If the clock is
tight, cut the plan list, not the last sentence.

## 11. Close (4:35-4:45 · 20 words · SPEAKER)

**[Slide 10 — Close]**

### Slogan drafts

| Draft                                                 | Verdict                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| "Two readers, one rule, and the receipt to prove it." | Accurate, and it lands the mechanism. Too technical for the last five seconds |
| "The paper gets marked before the students do."       | Good rhythm, wrong verb. Cekgu never marks anything                           |
| "Check the exam before the exam checks us."           | **Chosen.** The concept's own line, and it puts the student back in it        |

### Finalized close

> "We accept losing marks when we're wrong. Not when the paper is.
>
> Check the exam before the exam checks us."

`NOTE:` Beat before the last line. Then stop talking and leave slide 10 up for the whole of Q&A.

## 12. Q&A session (5 minutes)

### Most likely, prepare these cold

**"Is the demo hardcoded?"**

-> No. The sample record is what our own queue produced on 3 September, kept exactly as it came back: twelve items,
forty-two attempts, thirty-two distinct Gonka request ids. Eighteen of those attempts were rejected and they are still
in the record with the gateway's own error text beside them, because a run that only kept its successes would be a
brochure. Query any id against the public receipts endpoint from your own laptop right now. If you want it live, give me
a question and I'll queue it in front of you, though it will not finish while we're standing here. **(A LIVE CHECK TAKES
MINUTES, NOT SECONDS. Offer the queued state, not a finished verdict.)**

**"What stops the two models from just agreeing with each other?"**

-> Nothing stops them, and agreement is not our claim. They never see the key and never see each other's output, so
agreement is not coordination. It could still be correlation, because two large models trained on overlapping data can
be wrong the same way. That is exactly why the verdict reads **Possible Key Error** and not "key error", and why only
the educator can change a key. Two models agreeing doesn't make an answer true. It makes the item worth a human minute.
**(WE HAVE NOT MEASURED HOW CORRELATED MINIMAX AND KIMI ARE. Do not claim independence of training data.)**

**"How do you know it doesn't just flag everything?"**

-> Because we counted the other direction. Forty clean-control runs — twenty good questions, each run twice through the
deployed queue — and it flagged none of them. Zero. Every error it made in that run was an abstention or a miss, never a
false accusation, and that is the direction that matters: a lecturer sent to re-read a correct item loses an evening,
but a lecturer who stops trusting the flags is gone. The same run caught fourteen of twenty planted defects. **(SIXTY
ITEM-RUNS ON ONE COMMITTED PAPER, NOT A PUBLISHED PRECISION FIGURE. Say the size of the set before you say the
result.)**

**"Why does this need to be decentralised at all?"**

-> Two honest answers. The track requires it, and I won't pretend that isn't a reason. But what decentralisation
actually buys this product is the receipt. The gateway publishes which model served which request, so "two independent
models checked your paper" is something you can verify rather than something we assert. On a centralised API I can tell
you I used two models; here you can check that I did. When a student challenges an item, that trail is what the lecturer
shows. **(THE RECEIPT IS GATEWAY METADATA. It is not cryptographic and it is not an on-chain transaction, and our own
product copy says so.)**

**"What happens when the gateway rate-limits you?"**

-> It happened on the record you just looked at. DeepSeek answered `429` — "rate limit exceeded: too many concurrent
requests" — on five calls, timed out on a sixth, and never served one reading. All twelve items still got two
receipt-verified readings, from the other two families. That is the queue doing its job rather than a story we're
telling you: a hard cap of four calls in flight, three attempts per family, and the third family taken when one fails.
When the budget really is spent the item goes **Unverified**, which is a visible state with a **Retry Verification**
button next to it, not a silent gap. We never fill a missing second reading with the first model's answer, and we never
count the same model twice.

### Second tier, likely

**"How accurate is it? Give me a number."**

-> I'm not going to give you a percentage, because I don't have one that would mean anything on sixty runs. Here is what
I do have. A committed thirty-item paper — twenty clean, five mis-keyed, five written to be ambiguous — put twice
through the deployed queue. Of the forty clean-control runs, none were flagged. Of the twenty planted-defect runs,
fourteen were caught, five abstained as **Unverified**, and one came back **Clear**. The twelve-item record on screen is
the same picture smaller: both key errors caught, one ambiguity caught, one missed, no clean control flagged. **(NO
ACCURACY PERCENTAGE. A broader labelled set across subjects, languages and difficulty is required before we publish one,
and it is the first thing we would build with the prize.)**

**"You planted two ambiguous items and only caught one. Isn't that a failure?"**

-> It's a miss, and it's in our README rather than waiting for you to find it. Cekgu detects disagreement between
readers, and ambiguity only when a reader declares more than one option defensible. On the kilobyte question both
readers said 1024 and both wrote that 1000 was defensible too, so the rule fired. On the other one both committed to a
single answer, and two confident readers who agree are indistinguishable from an unambiguous question. That's a property
of the design, not a threshold we can tune. It also tells you which direction we fail in, which is the quiet one. The
same item failed the same way in our thirty-item run, so it is characterised rather than a fluke — and in the second
pass it came back **Unverified** instead. **(NOT FIXED. Do not offer it as a one-off.)**

**"Your rule starts with Unverified, but there isn't one in the record. Where is it?"**

-> Not in this capture, and I'd rather say that than show you a stale one. Every one of the twelve items got its two
receipt-verified readings, so nothing reached the Unverified branch. What the record does have is eighteen rejected
attempts sitting next to the ones that counted — rate limits, ninety-second cutoffs, hedges that lost their own race.
That's the same rule doing the same thing one layer down: an attempt with no verified receipt never becomes a reader.
Push thirty items through back to back and you see plenty of it — nineteen of sixty item-runs came back **Unverified**
in the run behind that slide. That is load, not accuracy: thirty items sustain account-level rate limiting a twelve-item
paper never reaches, and every one of those nineteen has a **Retry Verification** button on it. **(UNVERIFIED IS SHIPPED
AND TESTED, BUT IT IS NOT DEMONSTRABLE FROM THIS SAMPLE. Do not promise to show one.)**

**"Why would a lecturer upload an unreleased exam paper to a decentralised network?"**

-> Many of them should not, and the product says so rather than hiding it. UiTM's own guidance calls final papers
confidential, and node operators can see prompt text. Version one is for practice sets, past-year papers and question
banks. A confidential final paper is a policy conversation with a faculty, not a checkbox in our app.

**"How is this different from pasting the paper into ChatGPT?"**

-> Three ways. A chat sees your answer key and anchors on it; our readers never see it. A chat is one opinion; we
require two distinct model families whose receipts name different models. And a chat leaves no record; we keep every
attempt, every request id and the human's decision beside the machine's.

**"Who pays for this, and why?"**

-> An independent tutor or course creator who publishes practice sets every month, because the alternative is asking
another subject expert to re-solve the whole paper. **(THAT IS A HYPOTHESIS, NOT A FINDING. We have not run buyer
interviews. Student sensitivity proves the problem matters; it does not prove an educator's budget.)**

**"What if both models are simply wrong?"**

-> Then Cekgu is wrong, and it's wrong in the direction of asking a human to look at a question that was fine. That
costs a minute. The expensive direction is the other one, which is why **Clear** never means "certified correct" and why
we don't collapse the five states into a confidence score. Every change to a paper is made by a person.

**"Does it work for anything other than multiple choice?"**

-> Not yet. The rule compares a chosen option against a supplied key, and that shape is multiple choice. Essays, proofs
and code need a different rule and separate validation before we'd claim anything. **(NOT BUILT AND NOT VALIDATED. Do
not promise it for a date.)**

### Third tier, brief answers

**"Why those two models?"**

-> We didn't pick two, we configured three. MiniMax and Kimi are the two that answered; DeepSeek was rate-limited across
the whole capture and served nothing. The queue orders families by a rolling success rate, so it used the ones that were
up. A day later, on our thirty-item run, DeepSeek served fourteen readings and the ordering reshuffled between the two
passes. A family that keeps failing is demoted, never dropped, because one candidate cannot produce two distinct
readings.

**"Is the request id on-chain?"**

-> No. It's a gateway receipt anyone can query. We're careful never to call it on-chain proof.

**"Two guests can see each other's records?"**

-> Yes, and we say so on the button and again in a banner inside the workspace. Guest is one shared account, not an
anonymous private one, and we never use the word "anonymous" for it.

**"How long does a real check take?"**

-> Minutes, not seconds, and the product tells you that up front. That's why it's a queue you can walk away from rather
than a spinner.

**"What are the cats?"**

-> Two readers made visible, one white and one black, because two independent readers is the whole idea. They're
licensed Live2D sample characters and they're credited as such. If the animation ever disagrees with the status text,
the text is right and the cats are a bug.

**"What would you do with the prize?"**

-> A labelled evaluation set big enough to publish a real precision number, then Bahasa Malaysia, then export, in that
order.

## 13. Fallback ladder

Decide this before you need it. Venue wifi will be bad.

| If                                      | Then                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| The gateway is slow or rate-limited     | Say so out loud. The sample record is stored evidence and needs no gateway. Stay on it and offer a live receipt lookup instead |
| A live check does not finish on stage   | Do not wait in silence. It is **Queued**, and the design says you may leave. Move to slide 06                                  |
| The record list is full of other guests | Type `Introductory` into `Search`. The Guest workspace is shared and other guests' records sit in it                           |
| The venue network is down               | Slides 05 and 06 carry the whole demo, both real request ids included. Say "this is the deck, not the app" before you start    |
| The deployed app is down                | Run locally on the demo laptop against the seeded sample record, and say that is what you are doing                            |
| The laptop dies                         | [`pitch-deck.pdf`](pitch-deck.pdf) on the second machine and on a USB stick. It is self-contained and needs no network         |

`TO FILL:` a recorded MP4 of the two-minute flow, kept offline at `assets/cekgu-demo.mp4`. That is issue #47, and it is
not in this ladder until it is on disk. **If it is ever played on stage, say the word "recording" first.**

## 14. The two-minute video, shot list

Devfolio requires an MVP video and the track asks for a two-minute pitch **showing the product in action**. Asked
directly whether the video should cover theme and architecture or just the system, the organiser answered: more on the
system, the demonstration of it ([opening ceremony, 00:39](../source/opening-ceremony-transcript.md)). So the deck does
not appear in it at all. This is a shot list only; recording is issue #47.

**Capture.** 1920x1080, the deployed URL in a clean browser window, no bookmarks bar, no notifications, cursor visible.
Record the voice-over separately over the screen capture. Reset the sample before rolling, per
[section 6](#6-live-demo-135-245--driver).

| #   | Time      | On screen                                                                                                                        | Voice-over                                                                                                            |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | 0:00-0:15 | Sign-in page. Cursor moves to **Sign In as Guest** and clicks. The banner appears and holds                                      | "We accept losing marks when we're wrong. We shouldn't lose them because the answer key was wrong."                   |
| 2   | 0:15-0:30 | The records library. Open **Introductory computer science practice set**, the row with the **Sample** chip. The summary resolves | "Twelve computer science questions, already checked. Nine came back clear. Three need a human."                       |
| 3   | 0:30-0:55 | Click the **Possible Key Error** filter, which reads **2**. **Show Evidence** on question 3. Hold on the three bubble rows       | "Both readers answered this blind. Neither saw the key. Both chose Queue. The key says Stack."                        |
| 4   | 0:55-1:15 | **The receipt beat.** Zoom the evidence panel: two **Served Model** names, two **Request Id** values, two **Verified** chips     | "Two different models on the Gonka network. Two request ids, both receipts verified. You can check them."             |
| 5   | 1:15-1:35 | **Key Corrected**, then bubble `B` under **Corrected Key**, then **Record Decision**. The machine verdict chip stays visible     | "Cekgu doesn't change anything. The educator does, and the record keeps both."                                        |
| 6   | 1:35-1:50 | Clear the filter. **Show Evidence** on question 1, scroll to **All Attempts**. Hold on the six rows                              | "Six calls went out. Two rate limits, a timeout, a hedge that lost. Two came back with receipts. Only those counted." |
| 7   | 1:50-2:00 | **New Check**, **Fill With Demo Content**, **Submit Check**. The record appears as **Queued**. Close the tab                     | "Start a check and walk away. It's a queue, not a spinner."                                                           |

**Literal inputs for shot 7**, so anyone can re-record it without asking. **Fill With Demo Content** writes all of this
in one click, and typing it by hand is the fallback, not the plan:

- **Assessment Title:** `Week 6 networks and data structures quiz`
- **Subject:** `Computer Science`
- **Question 3:** `Which data structure removes elements in first in, first out order?`
- **Options:** `Stack` · `Queue` · `Binary search tree` · `Hash table`
- **Keyed Option:** `B`

`NOTE:` Shot 4 is the one that cannot be cut. It is the track's proof obligation and the single frame that separates
this entry from a prompt typed into a chat window. Hold it long enough to read an id off the screen.

`NOTE:` **Shot 6 replaces an Unverified item, which this record does not contain.** Question 1's `All Attempts` table
has six rows: two `Admitted`, two `Rate Limited` with the gateway's own error text, one `Timed Out` at ninety seconds,
and a hedge recorded and discarded. Question 12 is the same shape if question 1 renders badly, with three rate limits
and no cutoff. The table scrolls sideways, so frame the `Status` column and the reason text under it, and let the
`Request Id` column sit off-frame — the ids are already in shot 4.

`NOTE:` Do not speed up or cut around a slow model call. If a call takes forty seconds, cut to the queued state and say
so. A video that pretends the gateway is instant contradicts slide 08 of our own deck.

## 15. Pre-flight

- [ ] Four member names entered in the **Devfolio submission**. They are deliberately not on the deck; slide 01 carries
      the team name only, and slide 10 already carries the live demo URL and its QR
- [ ] Section 6 rehearsed with a clock against the running app, and every literal label in it re-checked against the
      screen. Issue #42
- [ ] Every claim in this script is demonstrable on screen inside the time budget
- [ ] Rehearsed end to end with the timer (`T`), under 4:45 spoken
- [ ] `POST /api/sample/reset` run immediately before the pitch, from a Guest session
- [ ] Fallback clip recorded and playable offline
- [ ] `pitch-deck.pdf` exported and opened on a second machine, with the network off
- [ ] `du -sh docs/demo/` under 3 MB, `du -h docs/demo/pitch-deck.pdf` under 2 MB
