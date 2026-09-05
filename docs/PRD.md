# Cekgu product requirements

This document owns **what Cekgu must do for the 5 September submission**: functional requirements with stable ids,
acceptance criteria, non-functional limits, user stories, the demo as an acceptance test, and what is out of scope. It
cites [`PRODUCT.md`](PRODUCT.md) for who the product serves and why, and [`TRD.md`](TRD.md) for how the gateway,
provenance and data are handled. Where a requirement here and the TRD disagree, the TRD is technical truth.

Each requirement id is stable. Cite `FR-VERDICT-3` in an issue, a PR or a test name and it will still mean the same
thing after this file is edited. Retired ids are never reused.

Contents:

1. [Goals and non-goals](#goals-and-non-goals)
1. [Users](#users)
1. [Functional requirements](#functional-requirements)
   1. [Public pages](#public-pages)
   1. [Accounts and entry](#accounts-and-entry)
   1. [Starting a check](#starting-a-check)
   1. [The queue](#the-queue)
   1. [Verdicts](#verdicts)
   1. [Records](#records)
   1. [Evidence](#evidence)
   1. [The sample record](#the-sample-record)
   1. [The mascot](#the-mascot)
1. [Non-functional requirements](#non-functional-requirements)
1. [User stories](#user-stories)
1. [The submission demo as an acceptance test](#the-submission-demo-as-an-acceptance-test)
1. [Out of scope](#out-of-scope)
1. [Traceability](#traceability)
1. [Open questions](#open-questions)

## Goals and non-goals

Version one is the [submission floor](PRODUCT.md#submission-floor) of the scope ladder, built as the
[asynchronous review service](PRODUCT.md#asynchronous-behaviour) the 3 September benchmark demanded.

### Goals

- Every keyed multiple-choice item an educator submits is read blind by two distinct GonkaRouter model families, and the
  educator sees which items deserve a human second look
- Every inference attempt is traceable to a Gonka request id and a public receipt, visible where the reading is shown
- The product stays honest under real gateway conditions: it queues, retries within a budget, and reports **Unverified**
  rather than inventing agreement
- A judge can open the deployed URL, enter as a guest, and walk the two-minute flow on a protected sample record without
  waiting on live inference

### Non-goals

- Certifying an assessment as correct, or changing anything in it automatically
- Serving institutions, confidential final papers or learner data
- Any feature from the [paid launch](PRODUCT.md#paid-launch-product) or [expansion](PRODUCT.md#expansion-product) rungs
  of the ladder, however small it looks

## Users

**The educator** is the [primary operator](PRODUCT.md#primary-operator): an independent tutor or course creator who
publishes multiple-choice practice sets several times a month, is subject-competent and time-poor, and is personally
accountable when an item is challenged. They prepare on a laptop, check progress on a phone, and want a short list of
risks with evidence, not an AI that takes authorship.

**The guest visitor** is anyone evaluating Cekgu without an account, entering the one shared Guest account. They accept
that other guests can see and delete what they add, they may submit a small real check, and they must be able to inspect
the protected sample record even if every live model is unavailable at that moment.

**The judge on demo day** watches the five-minute pitch, may open the deployed URL during Q&A, and reads the README.
They are scoring the four track requirements and the rubric in [`brief.md`](brief.md#how-we-are-judged). They need the
request ids, the model names and the consensus rule visible on the screen, not described in a slide.

## Functional requirements

Acceptance criteria are written so a reviewer can check each one against the deployed URL. Chrome text in criteria uses
the product's TitleCase for buttons, labels and headings and sentence case for body, helper and error text, per
[design standards](../AGENTS.md#design-standards).

### Public pages

**FR-PUBLIC-1.** The home page states the learner harm, the educator value and one primary call to try Cekgu, with the
product name and identity visible.

- Given a signed-out visitor opens the root URL, then the page names Cekgu, explains in plain language that independent
  models read each question blind and that the educator decides, and shows a primary **Sign In** action
- The page links to **Sample Report** and **Pricing**, and to the trust copy required by FR-PUBLIC-2

**FR-PUBLIC-2.** Trust and privacy copy explains GonkaRouter processing, record ownership, Guest sharing and the
prohibition on confidential content. It may live as a section of the home page or FAQ.

- The copy states that prompts traverse a decentralised inference network and that confidential final papers and learner
  personal data must not be entered
- The copy states that a receipt is gateway metadata, not cryptographic or on-chain proof

**FR-PUBLIC-3.** A pricing page presents the four plans in [Business model](PRODUCT.md#business-model) as pilot plans,
with no checkout, payment form or fake purchase flow.

- Every price is labelled as a pilot plan and no control collects payment details
- The **Guest** plan row describes the shared workspace and 24-hour expiry

### Accounts and entry

**FR-AUTH-1.** A visitor can sign in to a private account whose records library is visible only to that account.

- Given two private accounts each create a record, when either opens **Records**, then only its own records are listed
- Signing out does not stop queued or checking work, and signing back in shows the same status and partial results

**FR-AUTH-2.** The sign-in page offers **Sign In as Guest**, which enters one shared Guest account rather than creating
a private session.

- Given a visitor clicks **Sign In as Guest**, then no email, password or consent checkbox is requested and the visitor
  lands in the Guest workspace
- Two visitors who both enter as guests see the same records library and can each open and delete the other's records

**FR-AUTH-3.** The Guest warning text is shown beside the **Sign In as Guest** button and again as a persistent banner
inside the Guest workspace, word for word as [PRODUCT.md](PRODUCT.md#the-shared-guest-account) states it.

- The text beside the button and in the banner both read: **Shared demo workspace. Anything you add can be viewed or
  deleted by other guests. Do not enter real, personal or confidential exam content.**
- The banner is visible on every Guest page without scrolling at 375 px wide. It carries a single dismiss control, and
  dismissal is remembered in that browser. Dismissing hides the strip, not the disclosure: the same sentence stays
  beside the **Sign In as Guest** button and in Settings under Account, so a returning guest can always read it. A
  browser that refuses storage keeps showing the banner
- No product copy uses the word "anonymous" to describe the Guest account

**FR-AUTH-4.** Guest-created records expire 24 hours after creation and carry no recovery promise.

- Given a guest record is 24 hours old, then it is no longer listed and its URL returns a not-found state
- The Guest records library shows each record's expiry time

**FR-AUTH-5.** The Guest account carries a per-question size limit that private accounts do not.

- Each question is at most 2,000 characters across stem and options
- **The count limits were removed on 4 September**, at the owner's request. A guest record took at most 12 questions and
  the account held at most 20 non-sample records; neither is enforced now. A demo that hits a wall on stage costs more
  than a shared workspace somebody could fill, and what bounds that workspace is the 24-hour sweep in FR-AUTH-4 rather
  than a count
- The remaining limit is enforced on the server, not only in the form

### Starting a check

**FR-CHECK-1.** **New Check** captures assessment title, subject, language and optional context, then one or more
multiple-choice items as structured typed input: stem, two to six options and one keyed option.

- Given the educator fills the form, then the questions are stored as structured fields rather than as pasted prose
- An upload may prefill those fields (FR-CHECK-5), but it never submits them and never bypasses
  [FR-CHECK-2](#starting-a-check): the educator reviews and edits a draft like any other typed input
- The language value is stored on the record and passed to the reading prompt as metadata

**FR-CHECK-2.** Local validation rejects a malformed set before any inference request is spent.

- A missing stem, fewer than two options, a duplicate option, an absent key or a key that matches no option blocks
  submission with a sentence-case error beside the field
- Given a set with one invalid item, when the educator submits, then no gateway call is made and the record is not
  created

**FR-CHECK-3.** Submitting a valid set creates the record immediately with status **Queued** and navigates to the record
workspace.

- Given the educator submits, then the record row exists in **Records** before any model has answered
- Given the educator closes the tab during **Queued** or **Checking**, when they return, then the record and its
  progress are intact

**FR-CHECK-4.** On the shared Guest account, **New Check** says so and offers a paper that fills every field in one
action. A demo on a projector must not open with typing.

- The control is offered only to the Guest account. A private account is not shown it
- Given it is used, then title, subject, language, context, three questions with their options and all three keys are
  filled, and the form is submittable without another keystroke
- A second control reverses it, so a presenter can go back to an empty form on stage
- The copy says what is in the paper, never what the readers will decide about it

**FR-CHECK-5.** An educator may upload a photograph or a PDF of a paper instead of typing it, and the fields are
prefilled from what it says.

- Accepts `image/png`, `image/jpeg`, `image/webp` and `application/pdf`, to 10 MB. Anything else is refused before a
  request is spent
- **It prefills and stops.** No record is created and no check is queued: the educator reviews and edits the draft, and
  [FR-CHECK-2](#starting-a-check) still applies to it exactly as to typed input
- The draft lands whole or not at all. Given any failure, then the form is unchanged and the reason is shown in a
  sentence the educator can act on
- Given a request is in flight, then the form's fields are locked, so nothing typed during the wait can be replaced by
  the draft when it arrives
- The Gonka request id for the structuring step is displayed with the result, per
  [NFR-PROV-3](#non-functional-requirements)
- Given `GEMINI_API_KEY` is unset, then the control reports that uploads are off and every other route is unaffected

**The transcription step is the product's one call outside GonkaRouter**, and it is bounded by
[NFR-SEC-1](#non-functional-requirements). Its instructions forbid it answering a question, marking an option correct or
supplying a key that is not printed, so every judgement about what the words mean is made by Gonka models afterwards.

### The queue

**FR-QUEUE-1.** Items are processed by a bounded queue that never exceeds four concurrent gateway calls for the account
across all records.

- Given three records are submitted at once, then the gateway never sees more than four in-flight calls from this
  deployment
- A `429` from the gateway is retried after backoff and counts as an attempt; it never surfaces as a verdict

**FR-QUEUE-2.** Each item is read by two distinct model families, chosen from whichever of the three
[measured families](TRD.md#3-models-measured) are currently available, without the supplied key or the other family's
output in the prompt.

- The reading prompt contains the stem and options only; a review of the prompt log shows no key and no other model's
  response
- Given one family is returning errors or timeouts, then the queue pairs the remaining two rather than waiting
- Each request body carries a nonce so repeated identical items are not served from the gateway cache

**FR-QUEUE-3.** Each attempt has a 90-second evidence cutoff and a deferred hedge, and each family gets at most three
attempts per verification round, hedges included.

- An attempt that returns nothing admissible by 90 seconds is recorded as timed out
- A hedge attempt to the same family launched before the cutoff counts as one of that family's attempts; only one
  reading per family enters the verdict, and the others are recorded and discarded
- When a family exhausts its three attempts the third family takes its seat; a round in which two families cannot both
  produce an admitted reading ends in **Unverified**

**FR-QUEUE-4.** The record workspace shows honest per-item progress while checking: which item is running, which
families have answered, retries and current availability.

- Every item shows one of **Queued**, **Running**, **Complete** or **Unverified**
- No progress indicator shows a percentage or a fake countdown; elapsed time and attempt counts are the only numbers

**FR-QUEUE-5.** The educator can request another round for an **Unverified** item with **Retry Verification** without
resubmitting the record.

- Given an **Unverified** item, when **Retry Verification** is chosen, then a new round starts with a fresh attempt
  budget and earlier attempts remain in the item's history
- Retrying never counts a reading from an earlier round twice

### Verdicts

**FR-VERDICT-1.** A reading enters the verdict rule only after it passes the
[cross-verification validity contract](TRD.md#cross-verification-validity-contract): no-fallback header sent, no
fallback header present, receipt fetched, served model equal to requested model.

- Given the gateway substitutes a model and reports it in `X-Gonka-Fallback`, then the reading is stored as rejected
  with the reason and does not enter the rule
- Given the receipt's model differs from the requested model, then the reading is stored as rejected with the reason

**FR-VERDICT-2.** Fewer than two admitted readings from distinct served-model families always yields **Unverified**,
never any other verdict.

- Given two admitted readings from the same family, then the verdict is **Unverified** and the explanation says a second
  family did not answer
- Given one admitted reading and one rejected reading, then the verdict is **Unverified**

**FR-VERDICT-3.** With two admitted readings from distinct families, the item receives exactly one of the five machine
verdicts defined in [Machine verdicts](PRODUCT.md#machine-verdicts), by comparing the readings with each other before
comparing them with the supplied key.

- Both select the key: **Clear**. An extra defensible option reported by only one reader is shown in the evidence view
  and never flags the item, because a single opinion never decides
- Both select the same non-key option: **Possible Key Error**
- Both identify more than one defensible option: **Possible Ambiguity**
- Both commit to incompatible single answers: **Split Opinion**

**FR-VERDICT-4.** The rule that fired is printed on screen beside every verdict in plain words, naming the readings and
the key, so the consensus logic is explicit to a reader who has not seen this document.

- Given the FIFO sample item, then the item shows text equivalent to "Both readers chose Queue. The supplied key is
  Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error"
- The screen also states the fail-closed rule in one sentence wherever **Unverified** is shown

**FR-VERDICT-5.** A verdict is never _replaced_ by a percentage, score or confidence number. **Amended 6 September
2026**, superseding the original wording, which forbade a number anywhere. The GonkaRouter track brief asks for a Truth
Score from 0 to 100 and the original requirement made that impossible to meet; the compliance audit recorded it as the
one unmet mandatory item.

What the original decision was protecting is kept. PRODUCT.md's reason was that "a precise-looking score would hide the
different operational actions each state requires" — so the score is additive, never a substitute:

- The five-outcome verdict remains the primary signal on every item, in words, and is what the disposition controls and
  the attention count key off. Nothing in the product routes off the number
- No verdict chip contains a number. The score sits beside the chip as a separate mark, and the chip is unchanged
- The score is derived from the same two readings the rule used, by a pure function over them
  ([TRD section 14](TRD.md#truth-score)), so it cannot disagree with the verdict beside it
- **Unverified** carries no score at all, rather than a zero, so a missing reading is never rendered as a bad key
- Any record-level figure is shown with the number of items it was computed over

This requirement does **not** license an accuracy or correctness percentage. Publishing one still needs the labelled set
named in [Success measures](PRODUCT.md#success-measures).

### Records

**FR-RECORD-1.** A record keeps everything listed in [What a record keeps](PRODUCT.md#what-a-record-keeps), and no
learner name, answer, mark or identifier.

- Every field in that list is present on a completed record and survives reload
- The data model has no field for learner data, and the form has no input for it

**FR-RECORD-2.** A record moves through **Queued**, **Checking**, **Ready**, **In Review**, **Resolved** and **Deleted**
as defined in [Record-level status](PRODUCT.md#record-level-status), and the record workspace shows the current status.

- **Ready** is reached only when every item has a machine verdict, including **Unverified**
- **Resolved** is reached only when every non-clear item has a human disposition

**FR-RECORD-3.** The record review shows summary counts per verdict, orders attention items first, and lets the educator
filter items by verdict.

- Given a record with clean and flagged items, when it opens, then flagged items appear before **Clear** items and
  **Clear** items remain reachable
- A filter for each of the five verdicts exists and the count on each filter matches the items shown

**FR-RECORD-4.** Every non-clear item starts **Unreviewed** and the educator may record one of the five
[human dispositions](PRODUCT.md#human-dispositions); the machine verdict stays unchanged in history.

- Given **Key Corrected** is chosen with a new key, then the item shows both the original machine verdict and the
  disposition, and the summary counts update
- Choosing a disposition never triggers an inference call except **Retry Requested**, which behaves as FR-QUEUE-5

**FR-RECORD-5.** The records library lists records newest first with title, subject, question count, status, attention
count and last updated time, and opening a row enters the record workspace.

- Given five records, then they appear in creation order, newest first, with all six columns populated
- Keyboard navigation can open any row

**FR-RECORD-6.** Rows can be selected singly or in bulk, and **Delete Records** appears only when a selection exists.

- Given no selection, then no destructive control is visible
- Given three selected rows, when **Delete Records** is chosen, then the confirmation names the count and explains the
  recovery behaviour of the current account before proceeding

**FR-RECORD-7.** Deletion behaves differently for private and Guest accounts, and the confirmation says which applies.

- A private deletion is a soft delete retained for 30 days; the restore surface is a paid-launch feature and is not
  required here
- A Guest deletion is immediate and the confirmation says there is no recovery
- A soft-deleted private record is destroyed once its 30 days are up, without anyone asking

**FR-RECORD-8.** Settings carries a **Delete All Records** control and states how long the account keeps data. This is
the erasure path a person exercising their PDPA rights reaches for, so it is deliberately not the same action as
FR-RECORD-6.

- The default retention is 3 months for a private account, counted from the last time a record was opened or changed,
  and 24 hours for Guest. Settings states the one that applies to the account reading it
- Given the control is confirmed, then every record the account holds is destroyed immediately, including anything
  already in Trash, and nothing is recoverable
- The protected sample is refused and the result says so, on Guest as on any other route (FR-SAMPLE-2)
- On Guest the confirmation says the workspace is shared, so the deletion takes records other guests added

### Evidence

**FR-EVIDENCE-1.** Every item has an evidence view that shows, for each admitted reading, the served model name, the
selected option, the concise rationale, the Gonka request id and the receipt status side by side.

- Given the FIFO sample item, then two distinct model names, two distinct request ids and two receipt statuses are
  visible on one screen without opening another page
- The request id is selectable text, not an image or a truncated tooltip

**FR-EVIDENCE-2.** Every inference attempt is listed, including rejected, hedged, timed-out and retried attempts, with
its requested model and the request id if one was returned.

- Given an attempt timed out with no response headers, then the row says no request id was returned and why
- Given a rejected attempt, then the row shows its request id and the rejection reason

**FR-EVIDENCE-3.** Each request id offers an affordance to inspect its public receipt, and the served model from the
receipt is displayed beside the requested model.

- Given a request id, when the receipt affordance is used, then the served model and stream flag from the receipt are
  shown or the fetch failure is stated
- Model reasoning tags leaked into content are stripped before display, per [gotcha 1](TRD.md#5-verified-gotchas)

**FR-EVIDENCE-4.** The two readings in the evidence view come from different served models; the view never places two
readings from the same family side by side as if they were independent.

- Given only one family answered, then the second column shows the missing family's attempt history, not a duplicate

### The sample record

**FR-SAMPLE-1.** One sample record exists in the Guest account containing the 12 typed Computer Science questions from
[the mechanism benchmark](superpowers/research/three-day-rescore.md#the-mechanism-benchmark--failed-3-september), with
recorded readings and public request ids from a real pass; nothing in it is fabricated.

- Every request id in the sample resolves to a public receipt whose model matches the displayed served model
- Items that never obtained two verified readings in the loaded pass appear as **Unverified**, not filled in

**How the loaded pass satisfies this, 3 September.** The twelve items are a subset of
`src/server/fixtures/evaluation-set.json`, which is the benchmark's own paper — its `fifo-structure` and `dns-role`
entries are the two mis-keys the write-up names, word for word. The subset is both of those, the first two items
labelled ambiguous and the first eight labelled clean, and their stems, options and keys are byte-identical to that
file, so the sample's questions can be diffed against the repository.

Two caveats belong with that claim:

- **They are not provably the identical twelve pass 1 used**, because pass 1's per-item output no longer exists. They
  are drawn from the same committed set and include the two items it is known to have contained. All 32 request ids were
  confirmed to resolve with matching models.
- **The second bullet is currently satisfied vacuously**: every item obtained two verified readings, so there is no
  Unverified item in the sample.

**FR-SAMPLE-2.** The sample record is protected: it cannot be deleted, its questions, readings and verdicts cannot be
edited, and it is labelled as the sample.

- Given a guest selects the sample row, then **Delete Records** excludes it and says so
- The record header carries a visible **Sample** label and a sentence explaining that it is preserved benchmark evidence

**FR-SAMPLE-3.** Human dispositions on the sample can be recorded so the demo beat works, and a **Reset Sample** action
returns every sample item to **Unreviewed**.

- Given a guest records **Key Corrected** on the FIFO item, then the summary updates and the machine verdict remains
- Given **Reset Sample** is chosen, then every disposition on the sample is cleared and nothing else changes

**FR-SAMPLE-4.** The sample is reachable signed out through **Sample Report** as a read-only view, so a judge can
inspect it without entering the Guest account.

- Given a signed-out visitor opens **Sample Report**, then the verdict summary, item evidence and request ids are all
  visible and no disposition control is offered

### The mascot

**FR-MASCOT-1.** The two-cat Live2D mascot ships animated and state-driven in the review workspace behind a feature
flag, following the [state-to-motion mapping](PRODUCT.md#product-role) in PRODUCT.md.

- Given the flag is off, then no mascot asset or SDK is requested by the page
- Given the flag is on, then each product state in the mapping produces the described motion and the record state text
  remains authoritative

**FR-MASCOT-2.** The mascot loads after record content and never blocks input, results, evidence or destructive
confirmations.

- Given a slow connection, then the record verdicts and evidence are interactive before the mascot has loaded
- At no viewport width does the mascot overlap question text, actions, request ids or a confirmation dialog

**FR-MASCOT-3.** The mascot respects `prefers-reduced-motion` and a user **Reduce Motion** setting, and degrades to a
static image on load failure.

- Given `prefers-reduced-motion: reduce`, then the static fallback pose is shown and no continuous animation runs
- Given the SDK, WebGL or an asset fails, then a static image appears and no error modal is shown

**FR-MASCOT-4.** The mascot is never a navigation item, a chat surface or the only signal of any state, and animation
pauses when the tab is hidden or the mascot is off screen.

- Keyboard and screen-reader users can complete every flow without the mascot rendering at all

**FR-MASCOT-5.** The attribution for the Tororo & Hijiki sample assets and the Cubism SDK is recorded in the repository
documentation. It is **not** rendered in the product.

- The attribution names the assets as Live2D sample characters, not as Cekgu's own
- AlaskanTuna removed it from the frontend on 3 September and accepted responsibility for the licence position. It was
  previously a footer on every page. Note that the Live2D Free Material License Agreement does carry attribution
  conditions, so this is a decision the team lead owns rather than a detail the build settled
- It remains in [`README.md`](README.md) and [`TRD.md`](TRD.md), which is where a licence review would look

## Non-functional requirements

**NFR-PERF-1.** Record creation responds in under 1 second from submit to the record row existing, measured on the
deployed URL.

**NFR-PERF-2.** Each item reaches a machine verdict or **Unverified** within 5 minutes at the 95th percentile, measured
from the moment its first attempt is dispatched. Record-level turnaround is a
[success measure](PRODUCT.md#success-measures), not a promise.

**NFR-PERF-3.** The deployment never has more than four concurrent gateway calls in flight for the account.

**NFR-PROV-1.** Every reasoning call sends `X-Gonka-No-Fallback: true`, and any response carrying `X-Gonka-Fallback` is
rejected regardless of body content.

**NFR-PROV-2.** No reading enters a verdict before its receipt at `GET /v1/receipts/{x-request-id}` has been fetched and
its served model checked against the requested model.

**NFR-PROV-3.** The request id is displayed in the UI for every inference attempt that returned one, and its absence is
stated for attempts that did not.

**NFR-PROV-4.** Every reasoning call sets `max_tokens` to at least 1024 and reasoning tags are stripped from content
before comparison or display.

**NFR-SEC-1.** Every call that reasons or verifies goes to `api.gonkarouter.io`. Exactly one non-reasoning call may go
elsewhere: the transcription step in `src/server/transcribe/`, which turns an uploaded image or PDF into the words
printed on it under instructions forbidding it to answer, to mark an option correct or to supply an absent key. No
provider SDK is installed anywhere. Checkable by searching the repository for provider hostnames and SDK imports, and
asserted by `src/server/gateway/only-gonkarouter.test.ts`, which fails the build if a hostname appears outside that one
directory or if that directory imports the verdict rule or the record schema.
[`TRD.md` section 20](TRD.md#20-reading-a-paper-from-an-upload) holds the decision and its measurements.

**NFR-SEC-2.** The GonkaRouter key lives only on the server; it never appears in a client bundle, a URL or a repository
file other than a gitignored `.env`.

**NFR-SEC-3.** The product stores no learner answers, marks, names or identifiers.

**NFR-UX-1.** Every page is usable at 375 px wide with no horizontal scrolling of the body.

**NFR-UX-2.** Every flow, including sign in, submitting a check, filtering, recording a disposition and deleting
records, is operable by keyboard alone with a visible focus state.

**NFR-UX-3.** Verdict and status are never conveyed by colour alone; each carries a text label.

**NFR-UX-4.** Chrome text uses TitleCase and body, helper, error, placeholder and empty-state text uses sentence case,
per [design standards](../AGENTS.md#design-standards), checked against rendered text.

**NFR-UX-5.** `prefers-reduced-motion` disables continuous animation everywhere, not only for the mascot.

**NFR-OPS-1.** The deployed URL remains useful when one model family is unavailable: the sample opens, new checks queue,
and items pair the remaining families or end **Unverified**.

**NFR-OPS-2.** The README documents the GonkaRouter integration so a judge can find the call layer, the validity
contract and where request ids are rendered without reading the code.

## User stories

| Story                                                                                                      | Requirements                            |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| As an educator, I sign in and see only my own records                                                      | FR-AUTH-1, FR-RECORD-5                  |
| As an educator, I type a small quiz and am told about a missing key before anything is sent                | FR-CHECK-1, FR-CHECK-2                  |
| As an educator, I submit and can close the tab, then come back to the same progress                        | FR-CHECK-3, FR-QUEUE-4, FR-AUTH-1       |
| As an educator, I open a ready record and see the risky items first with the rule that flagged each        | FR-RECORD-3, FR-VERDICT-3, FR-VERDICT-4 |
| As an educator, I compare two blind readings and their receipts before deciding                            | FR-EVIDENCE-1, FR-EVIDENCE-3            |
| As an educator, I record Key Corrected and the original verdict stays in history                           | FR-RECORD-4, FR-RECORD-2                |
| As an educator, I see an Unverified item, understand why, and retry it later                               | FR-VERDICT-2, FR-QUEUE-5, FR-EVIDENCE-2 |
| As an educator, I select several old records and delete them with a clear warning                          | FR-RECORD-6, FR-RECORD-7                |
| As an educator, I delete everything my account holds and see how long data is kept                         | FR-RECORD-8                             |
| As a presenter, I fill the check form in one action so a live demo does not open with typing               | FR-CHECK-4, FR-AUTH-2                   |
| As a guest, I enter with one click and am told plainly that others can see and delete my records           | FR-AUTH-2, FR-AUTH-3                    |
| As a guest, I try a real three-question check and it queues                                                | FR-AUTH-5, FR-CHECK-3, FR-QUEUE-1       |
| As a guest, I cannot delete the sample but I can reset my dispositions on it                               | FR-SAMPLE-2, FR-SAMPLE-3                |
| As a judge, I open the sample signed out and see two model names and two request ids on one screen         | FR-SAMPLE-4, FR-EVIDENCE-1              |
| As a judge, I verify a request id against the public receipt during Q&A                                    | FR-EVIDENCE-3, FR-SAMPLE-1              |
| As a judge, I grep the repo and find one fenced transcription call and every reasoning call on GonkaRouter | NFR-SEC-1, NFR-OPS-2                    |

## The submission demo as an acceptance test

The [two-minute product flow](PRODUCT.md#two-minute-product-flow) must be executable against the deployed URL with the
sample record loaded, on the demo machine, with the mascot flag in whichever state is planned for the pitch. The test
passes only if every step passes; a live model outage must not fail it.

1. Given the sign-in page, when **Sign In as Guest** is clicked, then the Guest workspace opens with the warning banner
   visible. Covers FR-AUTH-2, FR-AUTH-3
1. Given the Guest records library, when the sample row is opened, then the record shows its verdict summary counts,
   with the counts matching the loaded benchmark pass and **Unverified** items present where that pass had them. Covers
   FR-SAMPLE-1, FR-RECORD-3
1. Given the sample record, when the **Possible Key Error** filter is chosen and the FIFO item is opened, then the
   supplied key reads **Stack** and both readings read **Queue**. Covers FR-RECORD-3, FR-VERDICT-3
1. Given the FIFO item, then two served model names, two distinct request ids, two receipt statuses and the printed rule
   are on one screen. Covers FR-EVIDENCE-1, FR-EVIDENCE-3, FR-VERDICT-4
1. Given the FIFO item, when **Key Corrected** is chosen, then the disposition is stored, the summary updates and the
   machine verdict is still shown. Covers FR-RECORD-4, FR-SAMPLE-3
1. Given an **Unverified** sample item, when opened, then the attempt history shows which family timed out and the
   fail-closed sentence is printed. Covers FR-VERDICT-2, FR-EVIDENCE-2
1. Given **Records**, then the sample still shows the disposition, and when a new one-item check is submitted, then its
   record appears as **Queued** within 1 second and the presenter can leave it. Covers FR-CHECK-3, NFR-PERF-1

Before each rehearsal and before the pitch, **Reset Sample** is run so step 5 starts from **Unreviewed**.

## Out of scope

Verbatim from [Explicitly outside version one](PRODUCT.md#explicitly-outside-version-one) in PRODUCT.md:

- Confidential final examinations without written institutional approval
- Student answer checking, grading, appeals or score changes
- Essay, code-execution or mathematical-proof marking
- Question generation as a substitute for authoring
- Automatic key changes or automatic paper approval
- PDF or image ingestion **on the demo's critical path**. It exists as an affordance beside typed input, not as a step
  the demo depends on
- Plagiarism detection, proctoring or learner surveillance
- Claims that consensus is truth, cryptographic proof or an on-chain transaction
- A full animated mascot if the review loop and receipt trail are not already stable

Also out of this document's scope, because the ladder places them after submission:

- Paste and CSV import
- Bahasa Malaysia product copy
- Trash restore, duplication and export
- Email notifications and billing
- Library search and filters
- Every expansion-rung feature

## Traceability

Each [submission floor](PRODUCT.md#submission-floor) bullet maps to the requirements that deliver it.

| Submission floor bullet                                                       | Requirements                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Cekgu identity and a concise public explanation                               | FR-PUBLIC-1, FR-PUBLIC-2, FR-PUBLIC-3                   |
| Private account entry plus the clearly disclosed shared Guest account         | FR-AUTH-1, FR-AUTH-2, FR-AUTH-3, FR-AUTH-4, FR-AUTH-5   |
| A structured typed-input flow for a small multiple-choice set                 | FR-CHECK-1, FR-CHECK-2                                  |
| Immediate account-scoped record creation                                      | FR-CHECK-3, NFR-PERF-1                                  |
| A bounded asynchronous queue using at least two distinct GonkaRouter families | FR-QUEUE-1, FR-QUEUE-2, FR-QUEUE-3, NFR-PERF-3          |
| No-fallback and receipt eligibility checks before any answer enters a verdict | FR-VERDICT-1, NFR-PROV-1, NFR-PROV-2                    |
| The five machine verdicts, including ordinary Unverified handling             | FR-VERDICT-2, FR-VERDICT-3, FR-VERDICT-4, FR-QUEUE-5    |
| A record review with summary counts, item filters and human dispositions      | FR-RECORD-2, FR-RECORD-3, FR-RECORD-4                   |
| A model-evidence view with every Gonka Request ID visible                     | FR-EVIDENCE-1, FR-EVIDENCE-2, FR-EVIDENCE-3, NFR-PROV-3 |
| Records that can be opened, selected and deleted                              | FR-RECORD-5, FR-RECORD-6, FR-RECORD-7, FR-RECORD-8      |
| One protected sample record containing the real benchmark evidence            | FR-SAMPLE-1, FR-SAMPLE-2, FR-SAMPLE-3, FR-SAMPLE-4      |
| A deployed URL that stays useful when one model is unavailable                | NFR-OPS-1, FR-QUEUE-2, FR-QUEUE-4                       |

The mascot (FR-MASCOT-1 to FR-MASCOT-5) is not a floor bullet. It ships behind its flag per the
[3 September decision](PRODUCT.md#decision) and the flag is turned on for the demo only after the floor passes.

## Open questions

- **Which benchmark pass seeds the sample record.** ~~Decided 3 September: pass 1~~ — **superseded 3 September.** Pass
  1's per-item output does not exist in this repository; only two of its request ids survive, quoted in
  [`three-day-rescore.md`](superpowers/research/three-day-rescore.md#the-mechanism-benchmark--failed-3-september). The
  sample is seeded instead from `capture-2026-09-03`, a fresh pass over a twelve-item subset of the committed
  `src/server/fixtures/evaluation-set.json`, run through the shipped queue. Three consequences follow:
  - It verified **12 of 12** against the ten this clause required, and both planted key errors were caught
  - **It contains no Unverified item**, where pass 1 had two. The acceptance test's step 6 has no Unverified verdict to
    demonstrate and step 2's "Unverified items present where that pass had them" now passes vacuously; the rehearsal
    script is being rewritten around a rejected attempt instead, of which the pass has plenty
  - One of the two ambiguous items was reported **Clear**, which is a false negative rather than an abstention, and is
    stated in the README's limitations
- **Guest limit values.** The 12-question, 2,000-character and 20-record limits in FR-AUTH-5 are defaults chosen here
  because PRODUCT.md fixes none. They stand until the team changes them
- **Private sign-in mechanism.** Resolved in [`TRD.md`](TRD.md): Better Auth with Google sign-in and email plus
  password. This document only requires that the library is private
