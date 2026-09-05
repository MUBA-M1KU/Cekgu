# Cekgu demo video script

The 2-minute MVP video for the [Devfolio submission](../brief.md#what-we-submit). Screen capture and voice-over are
recorded separately. Owned by the `pitch-smith` subagent
([`.claude/agents/pitch-smith.md`](../../.claude/agents/pitch-smith.md)).

> **Two minutes exactly, and all of it is the running app.** [`../brief.md`](../brief.md#what-we-submit) asks for a
> 2-minute video and says to focus on the system demo, not slideware. Asked directly whether the video should cover
> theme and architecture or just the system, the organiser answered: more on the system, the demonstration of it
> ([opening ceremony, 00:39](../source/opening-ceremony-transcript.md)). So the deck does not appear in it at all.
>
> Recording this is issue #47.

## Before you record

- **Capture at 1920x1080**, the deployed URL in a clean browser window, no bookmarks bar, no notifications, cursor
  visible. Record the voice-over separately over the screen capture.
- **Reset the shared sample first**, so shot 7 starts with no decision on the item. There is no button: signed in as
  Guest, open the browser console on the app and run `await fetch('/api/sample/reset', { method: 'POST' })`. It answers
  `{"reset":true}`.
- **Use a fresh browser profile**, or clear `cekgu.guestBannerDismissed` from `localStorage`. The shared-workspace
  banner in shot 2 is dismissible and the dismissal is remembered.
- **The Guest workspace is shared** and it will hold other guests' records. Find the sample by typing `Introductory`
  into `Search`, never by scrolling.

## The shots

| #   | Time      | Visual                                                                                                                                                                                                                                                                | Voice-over                                                                                                                                                                                                                                            |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 0:00-0:13 | The landing page, held on the hero: the `Cekgu` wordmark and **Two readers see your paper before your learners do.** Cursor moves to **Try Cekgu Free** and clicks                                                                                                    | "A learner can understand a subject and still lose marks because the answer key is wrong. Cekgu gives every question an independent second look, before learners see it."                                                                             |
| 2   | 0:13-0:24 | Sign-in: two panes, no top bar, the guest warning under the button. Click **Sign In as Guest**. **Records** opens and the ink-black shared-workspace banner holds                                                                                                     | "For this demonstration we use Cekgu's shared Guest workspace and a public sample paper. Confidential papers and learner data do not belong here."                                                                                                    |
| 3   | 0:24-0:37 | Type `Introductory` into `Search`, open **Introductory computer science practice set**, the row with the **Sample** chip. Hold on the **Summary** heading and its chips: `Possible Key Error 2`, `Possible Ambiguity 1`, `Split Opinion 0`, `Unverified 0`, `Clear 9` | "This sample holds twelve computer science questions. Nine came back clear. Three need attention, so the educator goes straight to those instead of starting at question one."                                                                        |
| 4   | 0:37-0:54 | Click the **Possible Key Error** chip, which reads `2`. Twelve rows collapse to two. **Show Evidence** on the first in, first out question. The bubble row fills `A` and rings `B` twice                                                                              | "Here, the supplied key says Stack. But both independent readers chose Queue, and neither was shown the key. Cekgu identifies this as a possible key error, and explains why."                                                                        |
| 5   | 0:54-1:14 | **The receipt beat.** Hold the evidence panel: **Reader A** `moonshotai/Kimi-K2.6`, **Reader B** `MiniMaxAI/MiniMax-M2.7`, two different `Request Id` values, both `Receipt` fields reading `Verified`. _(Sample record from 3 September; Kimi delisted 5 Sept)_      | "To review a question, Cekgu sends its wording and options — without the supplied key — through GonkaRouter to two distinct model families. The educator can inspect each reading, the served model, the gateway request ID, and its receipt status." |
| 6   | 1:14-1:28 | Scroll to **All Attempts** on the same item. Three rows: two `Admitted`, one `Timed Out` carrying **The call passed the 90 second evidence cutoff.**                                                                                                                  | "The review stays honest when a model cannot complete its reading. Without two verified readings, Cekgu returns Unverified rather than presenting a false consensus."                                                                                 |
| 7   | 1:28-1:41 | **Key Corrected**, then the `B` bubble under **Corrected Key**, then **Record Decision**. The **Possible Key Error** chip stays exactly where it was                                                                                                                  | "Cekgu does not change an answer key automatically. The educator reviews the evidence and makes the final decision."                                                                                                                                  |
| 8   | 1:41-1:54 | Let the corrected question hold, then dissolve slowly to the landing hero                                                                                                                                                                                             | "With Cekgu, educators can catch possible key errors and ambiguous questions before learners see them — making every practice paper easier to review and explain."                                                                                    |
| 9   | 1:54-2:00 | The landing hero, the `Cekgu` wordmark and `cekgu-op7lf5dspq-as.a.run.app`, silent to the end                                                                                                                                                                         | No narration.                                                                                                                                                                                                                                         |

## Recording notes

- **Shot 5 shows the sample record from 3 September, still live at the gateway.** The two readers named there (Kimi and
  MiniMax) are the ones that were active on that date. Kimi was delisted by the gateway on 5 September. If presenting a
  live check today, the second reader is now `deepseek-ai/DeepSeek-V4-Flash-0731` — refer to it as "the second reader"
  rather than by name to avoid confusion with the recorded sample.
- **Shot 5 is the one that cannot be cut.** It is the track's proof obligation and the single frame that separates this
  entry from a prompt typed into a chat window. Hold it long enough to read a request id off the screen.
- **Do not claim certification, cryptographic proof, on-chain proof, automatic key changes, or guaranteed correctness.**
  The receipt is unsigned gateway metadata ([TRD, request ids and provenance](../TRD.md#4-request-ids-and-provenance)):
  it makes the serving model publicly inspectable, and that is all. Shot 5 says which model served the reading; shot 7
  says the human decided.
- **Do not speed up or cut around a slow model call.** If a call takes forty seconds, cut to the queued state and say
  so. A video that pretends the gateway is instant contradicts slide 08 of our own deck.
- **Shoot on the signed-in record, not on the public Sample Report.** `/sample` renders the same twelve items and the
  same receipts, but it is read-only: `ItemRow` drops the whole decision group there, so shot 7 has nothing to click.
  Shot 2 lands on `/records`, and shots 3 to 7 all happen on one `/records/:id` page with no navigation between them.
- **Shot 6 shows the mechanism, not the verdict.** This record has no Unverified item — the chip in shot 3 reads
  `Unverified 0` — so what is on screen is the one call that never came back, which is what the line is about. If the
  shot has seconds to spare, clear the filter and open question 1 instead: six rows that add up, two `Admitted`, two
  `Rate Limited` carrying the gateway's own words, one `Timed Out` at the cutoff, and a hedge that lost its own race. It
  costs a navigation back to the key error before shot 7. The table scrolls sideways either way, so frame the `Status`
  column and the reason under it and let `Request Id` sit off-frame — the ids are already in shot 5.
