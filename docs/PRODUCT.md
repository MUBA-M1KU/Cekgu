# Cekgu product definition

Cekgu is the canonical product name for the concept evaluated as **Vetting Room** during selection. This document owns
**who the product serves, why it should exist, the experience it promises, the demo moment and the scope ladder**.
[`PRD.md`](PRD.md) will turn this definition into requirements and acceptance criteria; [`TRD.md`](TRD.md) owns the
architecture, contracts and schemas. Where those documents eventually disagree, the TRD is technical truth.

The concept is selected with one evidence-driven change: Cekgu is an **asynchronous review service**, not an instant
full-paper checker. The
[3 September mechanism benchmark](superpowers/research/three-day-rescore.md#the-mechanism-benchmark--failed-3-september)
returned no wrong two-model verdicts, but only 13 of 24 item-runs obtained two receipt-verified readings within 90
seconds and none did so within 30 seconds. The product must make waiting, retrying and **Unverified** honest states.

Contents:

1. [The decision](#the-decision)
1. [The problem](#the-problem)
1. [Evidence and unknowns](#evidence-and-unknowns)
1. [Customer system](#customer-system)
1. [Beachhead segment](#beachhead-segment)
1. [Jobs to be done](#jobs-to-be-done)
1. [Value proposition](#value-proposition)
1. [Product principles](#product-principles)
1. [The core loop](#the-core-loop)
1. [Verdicts and human decisions](#verdicts-and-human-decisions)
1. [Records and accounts](#records-and-accounts)
1. [The product surface](#the-product-surface)
1. [The scope ladder](#the-scope-ladder)
1. [Business model](#business-model)
1. [Acquisition and retention](#acquisition-and-retention)
1. [Success measures](#success-measures)
1. [The demo moment](#the-demo-moment)
1. [Live2D mascot feasibility](#live2d-mascot-feasibility)
1. [Risks and boundaries](#risks-and-boundaries)
1. [Sources](#sources)

## The decision

**Product name.** Cekgu, a compact Malaysian wordplay on “check” and “cikgu”. It is the selected working name, not a
completed trademark or domain clearance.

**Category.** Pre-publication quality assurance for multiple-choice assessments.

**One-line product.** Independent AI models sit each question blind before the learner does; Cekgu shows the educator
which answer keys and wording deserve a human second look.

**Product promise.** Cekgu reduces the chance that a learner loses marks because the assessment was wrong, without
pretending that model agreement certifies a question as correct.

**Commercial shape.** Self-serve prosumer SaaS. An individual educator can discover, try and pay for Cekgu without an
institutional sales process. “B2C” describes the buying motion; students are beneficiaries, not customers with access to
unreleased questions.

**Strategic wedge.** Start with recurring, lower-sensitivity practice content. Do not ask a university to upload a
confidential final examination to a decentralised inference network as the first use case.

## The problem

An educator can write a sound question and still publish a defective assessment. The most damaging failures are small: a
wrong answer key, two defensible answers, missing context or wording that changes the intended meaning. A single bad
item can cost a learner marks and force the educator to investigate, communicate, remark or withdraw a question after
the damage is visible.

Human moderation already exists because the risk is real. UiTM's final-examination guidance says papers must be vetted
thoroughly by a faculty examination or vetting committee, while also treating final papers as confidential
([UiTM][uitm-vetting]). Cekgu complements that practice. It does not replace the committee, approve the paper or grade
the learner.

The current alternatives leave a gap:

- **Self-review** is fast but anchored to the author's intended answer
- **A colleague re-solving the paper** is useful but consumes scarce subject-expert time on every item
- **A single general AI chat** offers one opaque opinion, may anchor on a supplied key and cannot prove independent
  model families produced the result
- **Enterprise assessment platforms** offer broad authoring and workflow systems, but are heavy for an individual
  educator who only needs a preflight check
- **Post-exam item analysis** can repair marks later; it cannot prevent the first unfair result

Cekgu's job is deliberately narrower: spend machine time on every item so the educator can spend human attention only
where the risk light fires.

## Evidence and unknowns

The product must separate measured facts from attractive assumptions.

| Claim                                                                  | State                                                  | Consequence                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Malaysian universities use formal paper vetting                        | Supported by institutional guidance                    | Position Cekgu as a first pass, not a replacement                      |
| Two blind model readings can expose planted key errors                 | Supported in the 3 September benchmark                 | Keep blind solving as the product mechanism                            |
| Every completed two-model verdict in that benchmark was correct        | Measured on 13 item-runs, not a general accuracy claim | Show the result, sample size and limitations together                  |
| GonkaRouter can return two models quickly enough for a full paper live | Refuted in the benchmark window                        | Queue work, retry and fail closed                                      |
| Independent tutors create enough assessments to feel recurring pain    | `[ASSUMPTION]`                                         | Validate through interviews before claiming product-market fit         |
| An individual educator will pay RM29 per month                         | `[ASSUMPTION]`                                         | Treat pricing as a test, not revenue evidence                          |
| Educators will accept decentralised processing of practice content     | `[ASSUMPTION]`                                         | Disclose the boundary and prohibit confidential content in version one |
| Visible receipts increase buyer trust                                  | `[ASSUMPTION]`                                         | Measure receipt opens and ask users whether they matter                |

The immediate validation target is not “Do students dislike unfair marks?” That answer is obvious but does not prove a
market. The useful question is whether a person who publishes questions repeatedly will change their workflow and pay to
catch defects before release.

## Customer system

Three different people surround one Cekgu record. Product language must not collapse them into one vague “user”.

| Role            | Version-one person                                                             | Value received                                              |
| --------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **Buyer**       | Independent tutor, course creator or owner-operator of a small tuition service | Faster quality control without enterprise procurement       |
| **Operator**    | The educator writing or moderating the questions                               | A prioritised review queue and a record of what was checked |
| **Beneficiary** | The learner who eventually sits the assessment                                 | Fewer avoidable marks lost to bad keys or unclear wording   |

### Primary operator

The primary operator publishes multiple-choice quizzes or practice papers several times per month. They are
subject-competent, time-poor and personally accountable when an item is challenged. They use a laptop to prepare the
assessment but may check progress or reopen a record on a phone.

They do not want an AI to take authorship. They want a second pair of eyes, a short list of risks and enough evidence to
make their own decision.

### People deliberately not served first

- **Students checking a live or leaked exam.** They should never have access to unreleased content
- **Large universities buying institution-wide software.** Procurement, confidentiality, roles and data residency make
  this a later B2B product
- **High-stakes licensing bodies.** Their validation and security burden is beyond a hackathon MVP
- **Essay markers.** Rubric interpretation and grading are different products
- **Anyone seeking an answer generator.** Cekgu evaluates supplied questions; it does not create a replacement paper

## Beachhead segment

The first segment is **Malaysia-based independent tutors and course creators who publish recurring, lower-sensitivity
multiple-choice practice sets**. The demo uses introductory Computer Science questions because the team can adjudicate
them credibly; the product is not limited to Computer Science.

The segment wins on access and safety. The team can reach individual educators without institutional procurement,
practice content is less sensitive than a final paper, and repeated publishing creates a reason to return. The choice
remains a hypothesis until real interviews occur.

| Candidate segment                      | Burning pain                         | Willingness to pay | Winnability | Referral potential | Decision                                           |
| -------------------------------------- | ------------------------------------ | ------------------ | ----------- | ------------------ | -------------------------------------------------- |
| Independent tutors and course creators | Medium-high                          | Medium             | High        | High               | **Beachhead**                                      |
| Individual university lecturers        | High                                 | Low-medium         | Medium      | Medium             | Social-impact adopter after confidentiality review |
| Training and certification publishers  | High                                 | High               | Low-medium  | Medium             | First B2B expansion                                |
| University departments                 | High                                 | High but slow      | Low         | Medium             | Later institutional tier                           |
| Students                               | Emotionally high, operationally weak | Low                | Low         | High               | Beneficiary, not customer                          |

These ratings are strategic estimates, not customer research. Ten conversations with people who publish questions are
the minimum evidence before using phrases such as “validated demand” or “willingness to pay”.

## Jobs to be done

**Core job.** When I am about to publish a quiz or practice paper, I want an independent second check of every keyed
multiple-choice question, so I can fix questionable items before learners see them without asking a colleague to
re-solve the whole paper.

**Functional job.** Find likely key errors, ambiguous wording and unresolved model disagreement; inspect the evidence;
record the final human decision.

**Emotional job.** Feel confident that avoidable defects were considered, without surrendering professional judgment to
a black box.

**Social job.** Be seen by learners and peers as a careful, fair educator who can explain how an assessment was
reviewed.

| Job stage | Educator question                       | Cekgu response                                                                |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| Define    | What am I checking and for whom?        | Capture title, subject, language and assessment context                       |
| Prepare   | Are the questions structured correctly? | Validate stems, options and answer keys before any model call                 |
| Submit    | Can I start this and keep working?      | Create the record immediately and place items in a bounded queue              |
| Monitor   | Is anything happening?                  | Show item-level progress, retries and current availability honestly           |
| Inspect   | Which questions deserve attention?      | Prioritise possible key errors, ambiguity, splits and unverified items        |
| Decide    | What should I change?                   | Show independent readings while keeping the resolution with the educator      |
| Record    | Can I prove what I reviewed?            | Preserve inputs, verdicts, decisions, model identities and request receipts   |
| Reuse     | Can I return for the next revision?     | Keep private history and allow a resolved record to be reopened or duplicated |

## Value proposition

### Who

An individual tutor, course creator or lecturer who writes repeated multiple-choice assessments and can adopt a
self-serve tool without waiting for procurement.

### Why

They need to release fair, defensible questions, but re-solving every item with another subject expert costs time and
self-review is vulnerable to the author's own assumptions.

### What happens before Cekgu

The educator rereads the paper, asks a colleague when one is available, pastes selected questions into a general AI
chat, or discovers the defect only after learners answer. Evidence and decisions are scattered across messages and
documents.

### How Cekgu helps

Cekgu withholds the supplied key while distinct models answer independently through GonkaRouter. It verifies the model
identity attached to each request receipt, applies a fixed fail-closed rule and produces an account-scoped review record
that the educator resolves.

### What happens after Cekgu

The educator sees a short, ordered queue instead of rereading every item equally. They can correct a key, revise
wording, dismiss a flag or retry an unavailable check, then retain the reasoning trail with the assessment.

### Alternatives

ExamEval already offers AI item-flaw analysis and can identify likely mis-keys when supplied with an answer or
explanation ([ExamEval][exameval]). CramKit already blind re-answers its own practice bank with two model families
([CramKit][cramkit]). Cekgu's honest distinction is external-paper intake for a self-serve educator, a visible
GonkaRouter receipt for every admitted reading, a fixed fail-closed decision rule and an educator-owned resolution
record. These are differentiators, not a permanent moat.

**Concise value proposition.** Cekgu turns independent AI readings into a focused pre-publication review queue, so an
educator can catch questionable keys and wording before learners are affected while keeping every decision human and
traceable.

## Product principles

1. **Protect learner marks, not AI authority.** The social outcome is a fairer assessment; the model is only a risk
   sensor.
1. **Blind first, compare second.** A model never sees the key or another model's response before committing its own
   reading.
1. **Fail closed.** Fewer than two distinct, receipt-verified model families means **Unverified**, never a verdict.
1. **Show provenance at the point of trust.** Model names and Gonka Request IDs sit beside the reading they support, not
   on a distant technical page.
1. **Records are the product memory.** A submitted check exists as a record immediately, survives navigation and keeps
   the human resolution.
1. **Async is normal.** Cekgu sets an expectation of minutes, lets the educator leave and reports partial progress
   rather than trapping them behind a spinner.
1. **Privacy claims stay smaller than reality.** Version one excludes confidential final papers and student personal
   data because prompts traverse a decentralised network.
1. **Friendly never means frivolous.** A mascot may reduce anxiety and explain state; it never celebrates a defect,
   obscures evidence or blocks the work.
1. **No automatic correction.** Cekgu suggests where to look. Only the educator changes a key, wording or disposition.

## The core loop

1. **Enter.** The visitor signs into a private account or deliberately enters the shared Guest account.
1. **Start a check.** They name the assessment, add its subject and language, then enter one or more multiple-choice
   questions with options and a keyed answer.
1. **Validate locally.** Cekgu catches missing stems, duplicate options, absent keys and malformed item numbers before
   spending an inference request.
1. **Create the record.** Submission writes an account-scoped record immediately with **Queued** status. Closing the tab
   does not lose the check.
1. **Read blind.** At least two distinct GonkaRouter model families answer each item independently without the supplied
   key or each other's output.
1. **Verify provenance.** Only readings with the required request headers and a matching public receipt may enter the
   decision rule.
1. **Classify.** Cekgu compares the admitted readings with one another and only then with the educator's key.
1. **Review.** The record opens with risky items first, while clean items remain available as the control.
1. **Resolve.** The educator corrects the key outside or inside the record, revises wording, dismisses the flag, or
   requests another attempt. Cekgu stores the chosen disposition.
1. **Return.** The completed record remains in account history for reopening, selection, deletion, duplication or export
   according to the account plan.

### Asynchronous behaviour

The queue works item by item with bounded concurrency. A record can contain **Complete**, **Running** and **Unverified**
items at the same time. Results appear as they become admissible; the paper summary never treats missing readings as
agreement.

After the retry budget is exhausted, Cekgu stops consuming requests and marks the item **Unverified**. The educator can
continue reviewing completed items and choose **Retry Verification** later. A paid launch product sends an email when a
record changes from processing to ready; the submission demo relies on in-app status.

## Verdicts and human decisions

### Machine verdicts

| Verdict                | Minimum evidence                                                                                                                     | Meaning shown to the educator             | Never means                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | --------------------------------- |
| **Clear**              | Two distinct verified readings select the supplied key; a single reader's extra defensible option is shown as evidence, never a flag | No issue found by this check              | Certified correct                 |
| **Possible Key Error** | Two distinct verified readings independently select the same non-key option                                                          | Recheck the answer key first              | Cekgu changed the key             |
| **Possible Ambiguity** | Two distinct verified readings identify more than one defensible option                                                              | Recheck the stem, assumptions and options | Every learner will be confused    |
| **Split Opinion**      | Two distinct verified readings commit incompatible single answers                                                                    | Expert judgment is required               | Majority vote may silently decide |
| **Unverified**         | Fewer than two distinct receipt-verified readings survive the attempt                                                                | The evidence threshold was not reached    | The question is good or bad       |

The product does not collapse these states into a percentage confidence score. A precise-looking score would hide the
different operational actions each state requires, so the five states above stay the signal an educator acts on.

A Truth Score from 0 to 100 is shown **beside** them, not instead of them, because the GonkaRouter track brief asks for
one. It is computed from the two readings the verdict already used and adds granularity the categories cannot carry —
two Clear items score 100 and 88 when one had a reader that hedged. It never decides anything: no disposition, attention
count or record status reads it. See [`PRD.md` FR-VERDICT-5](PRD.md#verdicts) and
[`TRD.md` section 14](TRD.md#truth-score). This is not an accuracy percentage, which still needs the labelled set named
in [Success measures](#success-measures).

### Human dispositions

Every non-clear item begins **Unreviewed**. The educator may record one of five decisions:

- **Key Corrected** — the supplied key was changed
- **Wording Revised** — the stem or options were changed
- **Key Confirmed** — the educator reviewed the evidence and retained the original key
- **Flag Dismissed** — the model concern was irrelevant or wrong
- **Retry Requested** — the item needs another independent attempt

Machine verdict and human disposition remain separate. History must show what Cekgu observed and what the educator
decided; rewriting the former after a human edit would destroy the audit trail.

### Record-level status

- **Queued** — the record exists and awaits capacity
- **Checking** — at least one item is running or waiting for another verified model
- **Ready** — every item has reached a machine verdict, including **Unverified** where necessary
- **In Review** — the educator has started dispositions but unresolved attention items remain
- **Resolved** — every attention item has a human disposition
- **Deleted** — removed according to the account's deletion policy

## Records and accounts

Every submitted check creates one record in the current account. A record is not merely a saved report; it is the
durable container for the entire review.

### What a record keeps

- Assessment title, subject, language and optional context
- Original question stems, options and supplied keys
- Record and item lifecycle states with timestamps
- Each admitted model's selected option, concise rationale, requested and served model identity
- Every inference attempt, its requested model and any Gonka Request ID returned, including attempts later rejected
- Receipt status, served-model identity and a link or affordance to inspect provenance for every completed attempt
- Machine verdicts and explanations of which fixed rule fired
- Human dispositions and any revised key or wording
- Retry history without counting the same model twice
- Export metadata so a downloaded report can be traced to its record version

The product stores no learner answers, marks, names or identifiers in version one. Cekgu reviews assessment content, not
student performance.

### Private accounts

An authenticated account has a private records library. The owner can open a row, select one or many records, duplicate
a record, export it, or choose **Delete Records**. Deletion first moves private records to **Trash** for 30 days so an
accidental bulk action is recoverable; **Delete Permanently** is explicit.

Signing out does not stop queued work. Reopening the account returns the user to the same status and partial results.

### The shared Guest account

The auth page includes **Sign In as Guest**. It enters one shared user account rather than creating an anonymous private
session. Clicking the button is the acceptance action; there is no extra consent checkbox, but the consequence is stated
immediately beside it:

> **Shared demo workspace. Anything you add can be viewed or deleted by other guests. Do not enter real, personal or
> confidential exam content.**

The same warning remains visible as a banner inside the Guest workspace. Every guest can open, select and delete
guest-created records because all guests are acting as the same account. Guest records expire after 24 hours and have no
recovery promise. A protected, clearly labelled sample record remains read-only so the public demo cannot be erased.

The shared account has strict item, size and rate limits. Those controls reduce abuse; they do not make guest content
private. Product copy must never use “anonymous” as a synonym for “private”.

### Records library behaviour

The default view sorts newest records first and shows title, subject, question count, status, attention count and last
updated time. Filters cover status, subject and items needing attention. Search covers record title and question text.

Selecting rows reveals contextual bulk actions rather than leaving destructive controls always visible. Opening a row
enters the record workspace. Delete names the record or count in a confirmation and explains the different private and
Guest recovery behaviour before proceeding.

## The product surface

The complete SaaS surface is larger than the hackathon slice. The page map below records the intended product so the
submission can show a coherent destination without pretending every page ships this week.

### Public and access pages

| Page                                          | Primary purpose                                                                                    | Submission slice                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Home**                                      | Explain the learner harm, educator value and one clear call to try Cekgu                           | Required                                       |
| **How It Works**                              | Show blind reading, fixed verdicts, human control and receipts in plain language                   | May live as a Home section                     |
| **Sample Report**                             | Let anyone inspect the labelled 12-question benchmark without creating content                     | Required and central to the demo               |
| **Pricing**                                   | Explain Free and Plus value, limits and cancellation                                               | Honest pilot pricing; no fake checkout         |
| **Trust & Privacy**                           | Explain GonkaRouter processing, record ownership, Guest sharing and forbidden confidential content | Required copy, may live within FAQ             |
| **FAQ**                                       | Answer accuracy, timing, data, receipts, human review and billing objections                       | Compact submission version                     |
| **Sign In**                                   | Offer private sign-in and the disclosed **Sign In as Guest** path                                  | Required                                       |
| **Terms**, **Privacy** and **Acceptable Use** | Set account, deletion, content and platform boundaries                                             | Launch requirement; concise demo notices first |

### Product pages

| Page               | Primary purpose                                                               | Submission slice                            |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| **Dashboard**      | Show recent records, usage, processing work and a clear **New Check** action  | Required                                    |
| **New Check**      | Capture assessment metadata and structured multiple-choice items              | Required; typed input only                  |
| **Check Progress** | Show queue position, per-item progress, retries and the ability to leave      | Required, may be the record workspace state |
| **Record Review**  | Summarise verdicts, prioritise attention items and capture human dispositions | Required                                    |
| **Item Evidence**  | Compare blind readings, model identities, request IDs and the rule that fired | Required as the technical proof moment      |
| **Records**        | Search, filter, select, open, duplicate, export and delete account records    | Required with open, select and delete       |
| **Notifications**  | Manage ready, failed and retry email preferences                              | Paid launch                                 |
| **Templates**      | Reuse assessment metadata and import shapes                                   | Later                                       |

### Account and service pages

| Page                      | Primary purpose                                                          | Submission slice                                    |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| **Profile & Preferences** | Manage display name, language, theme and accessibility choices           | Minimal account identity only                       |
| **Usage & Billing**       | Show plan, question allowance, invoices, payment method and cancellation | Pricing hypothesis only; no submission payment flow |
| **Data & Security**       | Export account data, delete account and review active sessions           | Deleting every record, and the retention notice     |
| **Help**                  | Provide product guidance, status and contact support                     | FAQ and one support route                           |
| **Service Status**        | Disclose model availability incidents and degraded queue behaviour       | Later public status page; in-app status now         |

### Navigation model

Public navigation stays focused on **How It Works**, **Sample Report**, **Pricing** and **Sign In**. The signed-in
product uses **Dashboard**, **New Check**, **Records** and **Settings** as its stable primary destinations. A record is
the route back to progress, results and evidence; these are states of one object, not disconnected tools.

The mascot never becomes a navigation item or chat assistant merely because it is animated. Cekgu is a review workflow,
not a conversational character product.

## The scope ladder

### Submission floor

The smallest complete story for 5 September includes:

- Cekgu identity and a concise public explanation
- Private account entry plus the clearly disclosed shared Guest account
- A structured typed-input flow for a small multiple-choice set
- Immediate account-scoped record creation
- A bounded asynchronous queue using at least two distinct GonkaRouter model families
- No-fallback and receipt eligibility checks before any answer enters a verdict
- The five machine verdicts, including ordinary **Unverified** handling
- A record review with summary counts, item filters and human dispositions
- A model-evidence view with every Gonka Request ID visible
- Records that can be opened, selected and deleted
- One protected sample record containing the real benchmark evidence
- A deployed URL that stays useful when one model is unavailable

### Paid launch product

After the submission, a credible individual subscription adds:

- Paste and CSV import with a preview before submission
- Bahasa Malaysia and English product copy and question handling
- Private long-term records, duplication, Trash recovery and PDF/CSV export
- Completion, partial-failure and retry notifications
- Usage meter, monthly and annual billing, receipts and self-serve cancellation
- Search, filters and reusable assessment metadata
- A support path, product status, privacy controls and account data export/deletion
- Calibrated quality reporting based on a larger labelled evaluation set

### Expansion product

Only after repeat individual use is demonstrated:

- Small-team workspaces with owner, editor and reviewer roles
- Commenting, assignment and approval history
- Question-bank versioning and comparison between revisions
- LMS and assessment-platform integrations
- Organisation policies, approved model sets and retention controls
- Institution-specific deployment or data arrangements
- Additional item types after separate labelled validation

### Explicitly outside version one

- Confidential final examinations without written institutional approval
- Student answer checking, grading, appeals or score changes
- Essay, code-execution or mathematical-proof marking
- Question generation as a substitute for authoring
- Automatic key changes or automatic paper approval
- PDF/OCR ingestion on the demo's critical path
- Plagiarism detection, proctoring or learner surveillance
- Claims that consensus is truth, cryptographic proof or an on-chain transaction
- A full animated mascot if the review loop and receipt trail are not already stable

## Business model

Pricing is a hypothesis designed around the unit of value: **questions checked**, not model tokens. The model cost is
invisible to the buyer; the product charges for saved attention, reusable records and dependable retries.

| Plan             | Price hypothesis                 | Intended customer                                  | Product boundary                                                                   |
| ---------------- | -------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Guest**        | RM0                              | Evaluator or curious visitor                       | Shared public records, protected sample, low limits, 24-hour expiry                |
| **Free**         | RM0                              | Individual educator testing a real workflow        | Private account, 20 questions per month, 30-day history                            |
| **Cekgu Plus**   | RM29 per month or RM290 per year | Tutor or course creator with recurring assessments | 300 questions per month, full history, exports, notifications and priority retries |
| **Cekgu Studio** | RM79 per month                   | Small training operator                            | 1,500 questions, three collaborators and shared bank features after launch         |

`[ASSUMPTION]` None of these prices or allowances is validated. The pricing page should call them pilot plans until
interviews and conversion data support firmer language.

### Upgrade moments

A user should encounter an upgrade only when they understand the value: after a successful private sample, when they
need to keep history beyond the free window, export a report, process another recurring set or receive priority retries.
Do not paywall the explanation of a risk already found.

### Billing expectations

A paid product needs monthly and annual choices, Malaysian Ringgit pricing, transparent allowances, invoice history,
payment-method management, failed-payment recovery and self-serve cancellation. The hackathon submission should not
build a decorative checkout. It should show the business model honestly and spend engineering time on the proof loop.

## Acquisition and retention

### Acquisition

- A public sample report makes the mechanism understandable before sign-up
- The shared Guest account removes setup friction while making its risks unmistakable
- Outreach begins with tutor and course-creator communities the team can reach directly
- A redacted report link can demonstrate careful review without exposing the question bank
- The student-fairness story earns attention; the educator-time-saving result earns repeat use

### Activation

The activation event is not account creation. A user activates when they submit at least three questions, receive an
admissible report and record one human disposition. This proves they experienced the full job rather than only watching
AI output.

### Retention loop

Recurring assessment creation drives return. A completed record becomes the starting point for the next revision;
duplication preserves metadata, while change history shows whether a previously flagged item was fixed. A reminder can
be tied to the educator's chosen publication date, never to arbitrary daily engagement.

### Lifecycle communication

The paid product sends only operationally useful messages: record ready, record partially unverified, retry completed,
allowance nearly used, payment failed and requested deletion approaching permanence. Marketing email requires separate
consent from service notifications.

## Success measures

**North-star measure.** Number of assessment records in which an educator resolves at least one evidence-backed
attention item before publication.

This measure joins product use to the promised outcome. Raw model calls, sign-ups and time spent in the app are not
success by themselves.

| Area                  | Measure                                                           | Why it matters                                           |
| --------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| Activation            | Share of new private accounts reaching one resolved record        | Tests whether the product loop is understandable         |
| Utility               | Human-confirmed key errors or wording revisions per 100 questions | Measures useful catches, not flags alone                 |
| Precision guardrail   | Clean labelled controls falsely flagged per 100 questions         | Prevents attention savings from becoming alert fatigue   |
| Reliability guardrail | Share of item-runs ending **Unverified** after retries            | Exposes whether the service is dependable enough to sell |
| Speed                 | Median and 95th-percentile record turnaround                      | Sets an honest async expectation                         |
| Trust                 | Share of attention items whose evidence or receipt is opened      | Indicates whether provenance supports decisions          |
| Retention             | Educators completing another record within 30 days                | Tests recurrence                                         |
| Revenue               | Free-to-Plus conversion and paid monthly retention                | Tests the pricing hypothesis                             |
| Safety                | Confidential-content reports and Guest-warning acknowledgements   | Detects misuse of the product boundary                   |

The benchmark's 13 correct completed verdicts are a feasibility signal, not a launch quality target. A broader labelled
set across subjects, languages and item difficulty is required before publishing an accuracy percentage.

## The demo moment

The demo must show a risk light working, not models producing text.

### Two-minute product flow

1. **0–15 seconds — stakes.** “We accept losing marks when we are wrong. We should not lose them because the answer key
   was wrong.” Enter through **Sign In as Guest**, with the shared-workspace warning visible.
1. **15–30 seconds — record.** Open the protected 12-question Computer Science sample. Show eight clean controls, two
   planted key errors and two ambiguous items in one preserved review record.
1. **30–55 seconds — reveal.** Filter to **Possible Key Error** and open the FIFO question whose supplied key says
   **Stack**. Both independent readers selected **Queue**.
1. **55–75 seconds — proof.** Show the two served model names, distinct Gonka Request IDs, receipt status and the fixed
   rule that produced the flag.
1. **75–95 seconds — human control.** Choose **Key Corrected**. The machine verdict remains in history while the human
   resolution updates the record summary.
1. **95–110 seconds — honest failure.** Open an **Unverified** item and explain that one model timed out, so Cekgu
   refused to invent consensus.
1. **110–120 seconds — repeatability.** Return to **Records**, show that the review persists, then start one new item
   and leave it checking asynchronously rather than waiting on stage.

### Demo resilience

The protected sample is assembled from the measured benchmark's recorded readings and public request IDs; nothing in it
is fabricated. Items that never obtained two verified readings appear as **Unverified** rather than being filled in, so
the sample's verdict counts follow whichever benchmark pass or rerun is loaded, and the two-minute flow above must be
rehearsed against the loaded sample.

The live submission creates a genuine queued record but is not required to finish during the pitch. If it does finish,
that is a bonus reveal. If a model is unavailable, the visible **Checking** or **Unverified** state proves the
fail-closed design rather than breaking the story.

The strongest visual beat is the change from a crowded paper summary to one obvious action: inspect the key marked
**Stack**. The strongest technical beat is the receipt-backed proof that two distinct models independently chose
**Queue**.

## Live2D mascot feasibility

### Decision

**Cekgu ships the Live2D mascot animated and state-driven, never as a still picture.** It loads after the record content
and never blocks input, results or evidence, but a static image is only the reduced-motion and load-failure fallback,
not the shipped default.

The supplied Tororo & Hijiki archive is healthy and contains deployable runtime material for two cats; the runtime files
are committed under `public/live2d/` and the authoring sources are not. The pair is unusually relevant: two visibly
distinct readers can make “two independent model families” understandable before the technical explanation begins.

This is a product-feasibility decision, not the branding design. Logo shape, mascot identity, palette and generated
concept art belong in the later branding round requested by the team.

### Supplied asset assessment

| Finding              | Assessment                                                                     | Product consequence                                                                 |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Archive integrity    | All 43 entries pass the ZIP integrity check                                    | Technically intact for a compatibility spike                                        |
| Runtime completeness | Each cat has `.moc3`, a 2048px texture, model, physics, pose and display files | Contains the normal embedded runtime set                                            |
| Motion set           | Three idle entries plus flick and tap groups, nine motion files per cat        | Enough for idle, checking and reaction states without new rigging                   |
| Interaction metadata | Eye-blink and lip-sync parameter groups exist; hit areas are empty             | Blinking is straightforward; custom clickable body regions need deliberate handling |
| Runtime weight       | About 1.35 MB per cat before the SDK; about 2.70 MB for both                   | Lazy-load in the review workspace and never block first content paint               |
| Authoring sources    | About 9.89 MB of `.cmo3` and `.can3` files                                     | Do not ship editor sources to the browser                                           |
| Model generation     | Converted from Cubism 2.1 and marked for SDK 3.0/Cubism 3.2 support            | Run a compatibility spike against the chosen current Web SDK before commitment      |

The official Cubism SDK for Web is intended for programmatic browser rendering and Live2D publishes TypeScript web
samples ([Live2D SDK][live2d-web], [official samples][live2d-samples]). The current application framework is not yet
chosen, so the TRD must later select the runtime and record its licence, bundle and browser implications.

### Product role

The mascot should explain system state, not become a second interface competing with the record.

| Product state        | Mascot behaviour                                                     | Required static fallback                 |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| Idle dashboard       | One calm idle cycle, then reduced motion                             | Resting cat pose                         |
| Checking             | The two cats inspect independently; no fake percentage animation     | Two reading poses with plain status text |
| Agreement with key   | Brief calm acknowledgement                                           | Neutral check pose                       |
| Attention item found | One restrained alert reaction, never celebration                     | Concerned pose beside the verdict label  |
| Split opinion        | Cats face different directions while the evidence panel explains why | Paired contrasting poses                 |
| Unverified           | Tired or waiting pose with **Retry Verification** nearby             | Waiting pose and explicit error text     |
| Resolved             | Short closing motion after the human decision                        | Small resolved badge; no confetti        |

The two cats represent independent readers, not permanent vendor identities. Actual model names remain text labels tied
to receipts because availability can change which model families complete a record.

### Accessibility and performance contract

- Live2D loads after core record content and never delays input, results or evidence
- `prefers-reduced-motion`, a user **Reduce Motion** setting and low-power/mobile fallback disable continuous animation
- Keyboard and screen-reader workflows never depend on touching or seeing the mascot
- State text remains authoritative; animation cannot be the only failure or success signal
- The mascot cannot cover question text, actions, receipts or destructive confirmations
- A failed WebGL, SDK or asset load swaps to a static image without an error modal
- Animation pauses when off-screen or when the tab is hidden
- Mobile may use one static cat or hide the character when space is constrained
- No microphone, camera, voice or continuous pointer tracking belongs in version one

The reviewed CukaiPandai reference follows the right isolation principle but uses static PNGs rather than Live2D: its
mascot images are decorative, ignore pointer events, shrink in compact layouts and disappear where the viewport cannot
support them. Cekgu should preserve those layout and accessibility properties even if its presentation layer becomes
animated. No code or assets from that prior project may be reused under this hackathon's originality rule.

### Licensing and originality gate

Tororo & Hijiki are Live2D original sample characters, not team-owned Cekgu IP. Live2D says General Users and
Small-Scale Enterprises below its stated sales threshold may use the sample commercially or non-commercially, subject to
the Free Material License Agreement and the sample-data terms ([sample page][tororo-hijiki], [sample
terms][sample-terms]). The Cubism SDK has a separate publication-licence regime ([SDK licence][sdk-license]).

**Decision, 3 September 2026.** The team lead accepted responsibility for the sample-asset and SDK terms and for the
required attribution, so the mascot is no longer gated on a licence review before deployment. This document is not legal
advice; the facts above stay on record.

If the team accepts and follows the applicable terms, the hackathon can honestly describe the cats as licensed sample
assets integrated during the event, never as an original team character. For a durable brand, the better post-hackathon
path is original Cekgu character art and a new rig. An image-generation model can help explore a character sheet later,
but it cannot output a production `.moc3` rig; that still requires Live2D authoring and motion work.

### Recommendation

Build both cats animated behind a feature flag alongside the review loop, with the state-to-motion mapping above. Switch
the flag on for the demo once the golden review flow, records and receipts pass and the frame budget holds on the demo
machine. The review loop and the receipt trail remain the definition of done; the animated duo is what makes the
two-reader idea land in the first ten seconds.

## Risks and boundaries

### Product risks

- **Availability may make paid service unreliable.** The queue, retries and **Unverified** state reduce dishonesty but
  do not create capacity. Track unverified rate before selling a turnaround promise
- **False flags may waste more time than they save.** Labelled controls and human dispositions must measure precision,
  not just catch count
- **The buyer may not pay.** Student sensitivity proves social importance, not an educator budget
- **The category has incumbents.** Cekgu must win on a transparent, focused workflow rather than “first AI exam checker”
- **Practice content may still be sensitive.** Clear acceptable-use copy and deletion are necessary but not equivalent
  to institutional security approval
- **A shared Guest account can be abused.** Make its sharing conspicuous, cap it, expire its content and protect only
  the official sample
- **A cute mascot can undermine trust.** Keep it quiet at evidence and deletion moments; the record, not the character,
  owns authority

### Claims Cekgu may make

- Independent model families answered the item blind when matching receipts exist
- A fixed rule produced the displayed risk state
- The educator recorded a specific human disposition
- The benchmark caught planted defects whenever it reached admissible consensus in the measured sample

### Claims Cekgu may not make

- The paper is certified error-free
- Agreement proves truth or independence of training data
- The receipt is cryptographic or on-chain proof
- A missing second model implies the item is safe
- Cekgu replaces a subject expert, vetting committee or institutional policy
- Confidential papers are safe to upload merely because the account is private

## Sources

- [Three-day rescore and second opinion](superpowers/research/three-day-rescore.md#the-second-opinion) — selection,
  competitor correction, plain-language pitch and the measured mechanism benchmark
- [Disagreement as product](superpowers/research/disagreement-as-product.md) — why blind independence, a written rule
  and later human adjudication are necessary
- [Multi-model capability](superpowers/research/multi-model-capability.md) — what distinct model families do and do not
  prove
- [TRD](TRD.md) — measured gateway behaviour, receipt eligibility and all eventual application architecture
- [MUBA brief](brief.md#how-we-are-judged) — deadline, deliverables and judging priorities
- [UiTM final-examination guidance][uitm-vetting] — institutional vetting and confidentiality
- [ExamEval mis-key guidance][exameval] and [CramKit verification][cramkit] — direct product and mechanism prior art
- [Tororo & Hijiki sample page][tororo-hijiki], [sample-data terms][sample-terms], [Cubism SDK for Web][live2d-web],
  [Cubism Web samples][live2d-samples] and [SDK publication licence][sdk-license] — mascot compatibility and licence
  boundaries

[uitm-vetting]:
  https://fskm.uitm.edu.my/v4/images/quality/proseduroperasi/PKO09-Penyediaan-Kertas-Soalan-Peperiksaan-Akhir.pdf
[exameval]: https://www.exameval.com/articles/flaws/miskeyed-answer
[cramkit]: https://cramkit.com/how-we-verify
[tororo-hijiki]: https://www.live2d.com/en/learn/sample/tororo-hijiki/
[sample-terms]: https://www.live2d.com/en/learn/sample/model-terms/
[live2d-web]: https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web/
[live2d-samples]: https://github.com/Live2D/CubismWebSamples
[sdk-license]: https://www.live2d.com/en/sdk/license/
