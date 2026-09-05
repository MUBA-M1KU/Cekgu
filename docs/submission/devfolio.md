# Devfolio submission draft

> Working handoff for issue #50. Re-check every URL and asset in the Devfolio preview before the owner submits issue
> #43. **The deadline was extended to 6 September 2026 at 08:00 MYT.** The description and screenshot list below were
> refreshed on 6 September for the three capabilities added that morning; anything already pasted into Devfolio before
> then is out of date.

## Project name

Cekgu

## Tagline

Two blind AI readers before learners see it.

## Description

Cekgu is a pre-publication quality check for multiple-choice practice papers. It sends each question, without the
educator's answer key, to two distinct AI model families through GonkaRouter. A fixed rule compares their answers and
the supplied key, then shows Clear, Possible Key Error, Possible Ambiguity, Split Opinion or Unverified together with
the model evidence and public gateway receipt metadata. The educator makes and records the final decision.

Alongside the verdict, every question carries a Truth Score from 0 to 100, computed from the same two readings by a pure
function — no extra inference call, and no model asked how confident it feels. Before the readers run, a live web search
fetches pages relevant to the question and shows the same snippets to both of them; each reader reports whether that
evidence backed its answer, and every page is listed with a live link and the quoted text so the educator can check it.
The search is a retrieval step that runs no model, so all reasoning stays on GonkaRouter. A paper can be entered by
typing it, by pasting a link to a page that already holds the questions, or by uploading a scan.

The workflow is asynchronous because a decentralised inference network can be slow or unavailable. Cekgu keeps every
attempt, fails closed when it cannot obtain two receipt-verified readings from distinct models and lets an educator
return to the record later. It never claims to certify a paper, prove truth or replace subject expertise.

## The problem Cekgu solves

A small assessment defect can have a large human cost. A wrong answer key marks correct learners wrong; two defensible
answers reward whoever guessed the setter's intent. The problem is usually discovered only after publication, when an
educator must investigate complaints, communicate a correction and remark work.

Self-review is anchored to the author's intended answer, while asking a colleague to re-solve every item consumes scarce
subject-expert time. A single general AI chat provides only one opaque opinion. Cekgu gives every practice question two
blind readings, then directs human attention to the items where the readings or key disagree. It complements human
moderation; it does not approve confidential final examinations, grade learners or replace institutional review.

## Challenges we ran into

GonkaRouter was not an ordinary low-latency API. In measurement, a completion could appear before its public receipt;
the receipt arrived 664–808 ms later. A one-shot receipt lookup therefore rejected genuine readings. We changed the
client to poll within a bounded five-second receipt budget and still fail closed if the receipt never appears.

Our first hedge fired below the observed completion floor. Instead of rescuing slow calls, it duplicated them and helped
trigger the rate limiting it was meant to survive. We moved the hedge to 45 seconds, kept a hard 90-second evidence
cutoff and recorded both winner and loser so the evidence trail does not hide failed or duplicate attempts.

Adding live web search risked the track's one fatal rule, that all reasoning runs on GonkaRouter. Tavily will return an
LLM-written answer to a query if asked, and taking it would have put reasoning on a provider that is not the gateway. We
request results only, with `include_answer` hard-coded false, and a test asserts both that flag and that no generated
answer is ever read off the response. The retrieval directory is held by the same build-breaking guard as the two
documented provider exemptions: it may not import the verdict rule, the schema, the round or the gateway client.

Folding that evidence into the score needed the opposite restraint. Corroboration adjusts how much a reading counts, and
never which way it points, so a web page can never outrank two receipt-verified readings — a verdict moved by a page
nobody receipted would have no proof behind it. Finding nothing is exactly neutral, because most exam items have no page
that settles them and treating silence as doubt would mark down every good question on an unusual topic.

Health filtering created a subtler failure. Removing every recently failing family could leave only one candidate, but
one family can never produce two distinct readings. The scheduler now demotes an unhealthy family while retaining at
least two candidates. A third family can take over a failed seat, and any round that still lacks two valid readings ends
as Unverified rather than guessing.

## Technologies used

- GonkaRouter and the Gonka decentralised inference network
- Tavily search, for retrieval only — it runs no model and decides nothing
- TypeScript 7
- Bun
- Hono 4
- React 19 and React Router 8
- Vite 8 and Tailwind CSS 4
- Neon Postgres
- Drizzle ORM
- Google Cloud Run
- Playwright

## Track

GonkaRouter — AI for Society

## Repository URL

https://github.com/MUBA-M1KU/Cekgu

## Live project URL

https://cekgu-op7lf5dspq-as.a.run.app

## X URL

https://x.com/Cekgu0903

## Demo video URL

https://youtu.be/zFASN69yQr8

## Team

M1KU. Devfolio already shows two accepted members, which satisfies the event's two-to-four-member rule. The owner must
confirm the roster in the final preview.

## Team LinkedIn URLs

Three team-member LinkedIn URLs have been collected outside this repository. Store them in the team Drive folder, not in
Git.

They are stored and confirmed in the team Drive folder.

## Cover image

Use `01-cover-landing.png` from the team Drive folder. It is a 1440 × 810 capture of the deployed landing page from 4
September 2026. Devfolio's current project-submission guide says the first screenshot becomes the project cover; the
guide does not publish a required project-screenshot pixel size. Keep this 16:9 export unless the live form rejects it.

## Product screenshots

**The 4 September captures are out of date.** Three of the five screens changed on 6 September: the sample report and
the evidence panel now carry a Truth Score and the retrieved pages, and New Check offers a link beside the upload in one
card. Recapture from the deployment **after** the 6 September deploy, keeping the same order so the first image is the
cover:

1. `01-cover-landing.png` — landing page and product promise, 1440 × 810
2. `02-sample-report.png` — sample verdict summary **with its Truth Score**, 1440 × 810
3. `03-evidence-receipts.png` — two served models, two request IDs, **the pages retrieved from the web** and attempt
   history, 1440 × 810
4. `04-guest-records.png` — shared Guest records library, 1440 × 810
5. `05-new-check.png` — Guest warning and the **Start From a Paper** card offering a link or an upload, 1440 × 810

Refreshed versions of 2, 3 and 5 are already in the repository at `docs/assets/sample-report.png`,
`docs/assets/item-evidence.png` and `docs/assets/new-check.png` if a re-capture is not practical.

The images are direct Playwright captures, not generated stand-ins.

## Submission handoff

- Owner: `@AlaskanTuna`, final submission in issue #43
- Deadline: **6 September 2026 at 08:00 MYT**, extended from 5 September at 23:59
- Drive folder: <https://drive.google.com/drive/folders/1MxznywqLC6gTLZecfbg5HO9vPxwtFDKg?usp=sharing>
- Collected: final cover, five exported product screenshots and three LinkedIn URLs in Drive
- Missing: demo video URL
- Final check: links open, assets render, track is selected, team roster is correct and no placeholder text remains
- Before submitting: confirm the live URL serves the 6 September build, since the screenshots and description describe
  it. The Truth Score on the sample report is the quickest tell that the deploy landed
