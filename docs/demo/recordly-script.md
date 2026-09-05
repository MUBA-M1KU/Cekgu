# Cekgu recording script

> **Shot, and the film it produced is submitted and unchangeable.** It is public at
> [youtu.be/zFASN69yQr8](https://youtu.be/zFASN69yQr8) at 4 minutes 42 seconds. Two things below have since moved and
> this file is not being rewritten to match, because it is the record of what was filmed: the deck is now nine slides
> rather than eleven, re-cut for a 3-minute stage pitch, and `moonshotai/Kimi-K2.6` was delisted on 5 September. Segment
> 2 re-timed for a nine-slide deck is 9 x 12 s = 1:48, so a re-shoot would land at 4:18 and needs its own arithmetic.
> Read [`pitch-script.md`](pitch-script.md) for the stage pitch; the two are different performances.

This recording captures the Cekgu submission video in two segments: a live, end-to-end run of the deployed app at
https://cekgu-op7lf5dspq-as.a.run.app, from the landing page through guest sign-in, the sample record, the flagged FIFO
question with both models' receipts, a corrected disposition, and a new one-question check left Queued, followed by a
walk through the 11-slide pitch deck. The total running time is 4 minutes 42 seconds, inside the required 4:30 to 5:00
window. One rule governs the new check: a live model call may not finish during the recording, so the new check is shown
as Queued and never waited on, which is the fail-closed queue design working as intended.

## Run of show

| Segment              | Starts at | Length | On screen                   | Spoken                                    |
| -------------------- | --------- | ------ | --------------------------- | ----------------------------------------- |
| Segment 1, live demo | 0:00      | 2:30   | Deployed app, guest session | Narrated per step below                   |
| Segment 2, deck walk | 2:30      | 2:12   | 11 slides, in order         | One or two lines per slide, speaker notes |
| Total                | 0:00      | 4:42   |                             |                                           |

Arithmetic: live demo 150 s (2:30, inside the 2 to 3 minute requirement) plus deck walk 11 slides x 12 s = 132 s (2:12)
equals 282 s, which is 4:42. That is between 4:30 and 5:00, with 18 s of headroom before 5:00.

## Segment 1, the live demo

1. [0:00] open URL, https://cekgu-op7lf5dspq-as.a.run.app, then wait 3 s for the landing page to settle. "This is Cekgu,
   live on the deployed app. We built it so a wrong answer key is caught before a student loses the mark."
2. [0:10] open URL, /sign-in, then wait 3 s for the sign-in page to settle. "We accept losing marks when we're wrong. We
   shouldn't lose them because the answer key was wrong."
3. [0:18] click, "Sign In as Guest", then wait 5 s for the dashboard at /dashboard to settle and for the Guest warning
   banner to appear. "I'm signing in as a guest. Guest is a shared demo workspace, and the warning banner on the
   dashboard says so."
4. [0:30] click, "Records", then wait 3 s for the records list at /records to settle. "Twelve computer science
   questions, already checked."
5. [0:40] click, the row titled "Introductory computer science practice set" carrying the "Sample" chip, then wait 4 s
   for the record at /records/:id to settle. "Nine came back clear. Two possible key errors, one possible ambiguity.
   Three questions need attention."
6. [0:52] click, the "Possible Key Error" filter chip, which reads 2, then wait 2 s for the list to filter. "Filter to
   the two the rule flagged."
7. [1:00] click, "Show Evidence" on question 3, "Which data structure removes elements in first in, first out order?",
   then wait 3 s for the evidence panel to open inline. "Both models answered this without seeing the answer key. Both
   chose Queue. The answer key says Stack."
8. [1:12] scroll, to the evidence panel showing the served models "MiniMaxAI/MiniMax-M2.7" and "moonshotai/Kimi-K2.6",
   the two distinct Request ID values, and both "Receipt" fields reading "Verified". "Two different models on the Gonka
   network. Two request IDs, both receipts verified. You can check them. That proves the reasoning did not come out of
   our server."
9. [1:26] scroll, to "All Attempts" on question 3. "A third attempt came back with no verified receipt. An answer
   without a receipt is not counted, and Cekgu keeps it on the record anyway."
10. [1:36] click, "Key Corrected", then click the "B" bubble under "Corrected Key", then click "Record Decision", then
    wait 2 s for the summary to update. "Cekgu doesn't change anything. The educator does, and the record keeps both.
    The machine verdict stays exactly where it was."
11. [1:48] scroll, back over the twelve questions on this record. "This sample has no Unverified question, so we skip
    that beat rather than invent one: all twelve questions got two receipt-verified answers, so nothing reached the
    Unverified branch. If one had, Cekgu would refuse to invent consensus."
12. [2:00] click, "Records", then wait 3 s for /records to settle. "Back in Records, the corrected disposition is kept
    on the sample."
13. [2:08] click, "New Check", then wait 3 s for /new-check to settle. "And it runs on live questions too."
14. [2:13] click, "Fill With Demo Content", then wait 1 s. "One click fills a one-question check."
15. [2:16] click, "Submit Check", then wait 2 s for the new record to appear. "Start a check and walk away. It's a
    queue, not a spinner."
16. [2:24] wait, 6 s, holding on the new record showing "Queued". "A live model call takes minutes, so it stays Queued
    here. That is the fail-closed design, not a failure."

Segment 1 ends at 2:30.

## Segment 2, the deck

1. [2:30] Slide 01, Cover, 12 seconds. "We're Team M1KU, and we built Cekgu. Cekgu checks a quiz before a single student
   sits it."
2. [2:42] Slide 02, Problem, 12 seconds. "Here's one question from a twelve-question quiz: which data structure removes
   elements first in, first out? The answer key says Stack. The answer is Queue."
3. [2:54] Slide 03, User, 12 seconds. "We built this for one private tutor who sets the quiz and hears about it when a
   student disputes a question. What comes back is one record with a result on every question, and her own decision
   saved next to the verdict, not instead of it."
4. [3:06] Slide 04, Objective, 12 seconds. "Cekgu turns twelve questions into three: two possible key errors, one
   possible ambiguity, nine clear. Those are the live counts on our public sample."
5. [3:18] Slide 05, Concept, 12 seconds. "Neither model is shown the answer key, and neither sees the other's answer. We
   compare the two answers to each other first, and only then to the answer key."
6. [3:30] Slide 06, Demo, 12 seconds. "That is the question Cekgu flagged. Cekgu flags it for a person to check; it does
   not touch her answer key."
7. [3:42] Slide 07, Proof, 12 seconds. "Every answer comes with a GonkaRouter request ID. Paste either ID into that
   receipts URL and the gateway tells you which model served it, which is what proves the reasoning did not come out of
   our server."
8. [3:54] Slide 08, Build, 12 seconds. "One Bun process, one gateway, and every inference call goes to GonkaRouter.
   There is no other AI provider in this repository, and a test asserts it on every run."
9. [4:06] Slide 09, Challenges, 12 seconds. "We measured before we built, and it went against us, so we built a queue
   that marks a question Unverified rather than guessing. On forty clean-control runs it flagged nothing. Not one."
10. [4:18] Slide 10, Business, 12 seconds. "We charge for questions checked, not tokens. And I'll say it before you do:
    nobody has paid us anything. This is a price to test."
11. [4:30] Slide 11, Close, 12 seconds. "We accept losing marks when we're wrong. Not when the paper is. Check the paper
    before the students sit it."

Deck arithmetic: 11 slides x 12 s = 132 s, starting at 2:30 and ending at 4:42.

## Fallbacks

- If sign-in fails: say so out loud, then open /sample directly. The public sample record opens signed out, so every
  record beat from the filter through the disposition can still be captured there before moving to the deck.
- If the sample record does not load: say so out loud. The Guest workspace is shared and other guests' records may sit
  in it, so type "Introductory" into "Search" to find the row rather than scrolling. The sample is stored evidence and
  needs no gateway; stay on it and offer a live receipt lookup instead.
- If the new check errors: do not wait in silence. Say that it is Queued and that the design says you may leave it, then
  move on to the deck. If the gateway is slow or rate-limited, say so out loud and continue, because the sample record
  proves the product on its own.
- If the deck timing runs long: cut words, never speed up. On slide 02 cut the sample question line and keep the
  headline. On slide 10 cut the plan list and keep the last sentence about the price being untested.

## Assumptions

- The landing page's own link to sign-in has no label given in the inputs, so the script opens /sign-in by URL instead
  of clicking a label.
- The sample record is reached through the Guest records library at /records and opened at /records/:id, since the
  required order is dashboard, then sample record; the public /sample route is used only as the fallback.
- The exact text of the Guest warning banner is not specified in the inputs, so it is referred to only as the Guest
  warning banner and never quoted.
- The on-screen request ID field may render as "Request Id"; the screen wins over this script, and the IDs are read off
  the screen rather than recited.
- Each wait duration (1 to 6 seconds per navigation) is an assumption sized to fit the 2:30 demo; adjust the surrounding
  timestamps together if the app loads slower.
- The sample record is reset before recording, so the FIFO question starts with no disposition on it; the reset itself
  is not part of the recording.
- The Guest workspace may contain other guests' records; only the sample row is scripted and nothing else in the library
  is relied on.
