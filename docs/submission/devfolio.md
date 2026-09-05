# Devfolio submission draft

> Working handoff for issue #50. Re-check every URL and asset in the Devfolio preview before the owner submits issue
> #43. The earlier deadline in `docs/brief.md`, 5 September 2026 at 23:59 MYT, is binding.

## Project name

Cekgu

## Tagline

Two blind AI readers before learners see it.

## Description

Cekgu is a pre-publication quality check for multiple-choice practice papers. It sends each question, without the
educator's answer key, to two distinct AI model families through GonkaRouter. A fixed rule compares their answers and
the supplied key, then shows Clear, Possible Key Error, Possible Ambiguity, Split Opinion or Unverified together with
the model evidence and public gateway receipt metadata. The educator makes and records the final decision.

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

Health filtering created a subtler failure. Removing every recently failing family could leave only one candidate, but
one family can never produce two distinct readings. The scheduler now demotes an unhealthy family while retaining at
least two candidates. A third family can take over a failed seat, and any round that still lacks two valid readings ends
as Unverified rather than guessing.

## Technologies used

- GonkaRouter and the Gonka decentralised inference network
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

Use these five real captures from the deployed project, uploaded to the team Drive folder on 4 September 2026:

1. `01-cover-landing.png` — landing page and product promise, 1440 × 810
2. `02-sample-report.png` — sample verdict summary, 1440 × 810
3. `03-evidence-receipts.png` — two served models, two request IDs and attempt history, 1440 × 810
4. `04-guest-records.png` — shared Guest records library, 1440 × 810
5. `05-new-check.png` — Guest warning and structured New Check form, 1440 × 810

The images are direct Playwright captures, not generated stand-ins. Preserve this order so the first image is the cover.

## Submission handoff

- Owner: `@AlaskanTuna`, final submission in issue #43
- Deadline: 5 September 2026 at 23:59 MYT; do not rely on Devfolio's later countdown
- Drive folder: <https://drive.google.com/drive/folders/1MxznywqLC6gTLZecfbg5HO9vPxwtFDKg?usp=sharing>
- Collected: final cover, five exported product screenshots and three LinkedIn URLs in Drive
- Missing: demo video URL
- Final check: links open, assets render, track is selected, team roster is correct and no placeholder text remains
