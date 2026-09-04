<a id="readme-top"></a>

# Cekgu

<div align="center">

<img src="img/banner.svg" alt="Cekgu — review multiple-choice papers before learners see them" width="100%">

<p>
  <strong>Review a practice paper before learners depend on it.</strong><br>
  Cekgu gives an educator two independent blind readings, a fixed verdict, and
  the evidence needed to make the final call.
</p>

![Bun](https://img.shields.io/badge/Bun-14151A?style=for-the-badge&logo=bun&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/Neon_Postgres-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![GonkaRouter](https://img.shields.io/badge/GonkaRouter-B3202F?style=for-the-badge)

[Live demo](https://cekgu-op7lf5dspq-as.a.run.app) · [Sample report](https://cekgu-op7lf5dspq-as.a.run.app/sample) ·
[GitHub](https://github.com/MUBA-M1KU/Cekgu) · [X](https://x.com/Cekgu0903)

<sub>Built by Team M1KU for the MUBA Blockchain Hackathon 2026, GonkaRouter — AI for Society track.</sub>

</div>

Cekgu is a pre-publication review tool for educators writing multiple-choice practice papers. It flags disagreement,
possible key errors, and reader-declared ambiguity without replacing subject expertise or making the decision for them.

[TOC]

## About the project

A wrong answer key can reward a guess and penalise a learner who understood the subject. A question with two defensible
answers can do the same. Both problems are often noticed only after learners have seen the paper.

Cekgu puts an evidence step before publication. The educator supplies a small multiple-choice paper and its answer key.
Two model families independently solve each item without seeing that key. Cekgu compares the readings with each other,
then with the key, and presents the applicable verdict and evidence for the educator to inspect.

The product is for practice papers and synthetic examples, not confidential final examinations. It does not certify
correctness, prove a question is unambiguous, or replace institutional assessment review.

<p align="right"><a href="#readme-top">back to top</a></p>

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="img/shot-landing.webp" alt="Cekgu landing page" width="100%"></td>
    <td width="50%"><img src="img/shot-sample.webp" alt="Cekgu public sample report" width="100%"></td>
  </tr>
  <tr>
    <td><sub>The public explanation and entry point.</sub></td>
    <td><sub>A signed-out, inspectable benchmark report.</sub></td>
  </tr>
</table>

<img src="img/shot-evidence.webp" alt="Item evidence showing two served models, request IDs, receipt states, and a timed-out attempt" width="100%">

The item-evidence view keeps the two readings, served-model identities, Gonka Request IDs, public-receipt links, and
rejected attempts together. A timed-out or rejected reading is recorded; it does not silently count toward a verdict.

<p align="right"><a href="#readme-top">back to top</a></p>

## How it works

1. **Prepare a paper.** Type a small multiple-choice set with its answer key, or upload a scan or photograph and correct
   the generated draft.
1. **Read independently.** The key stays hidden while two distinct model families solve each item through GonkaRouter.
1. **Admit evidence.** A reading counts only after its request succeeds, identifies a valid option, has no fallback
   signal, and matches its public Gonka receipt.
1. **Apply one rule.** Cekgu evaluates the first two admitted readings from distinct served models against the supplied
   key.
1. **Make the human decision.** The educator records whether to correct the key, revise wording, confirm the key,
   dismiss the flag, or retry.

<img src="img/diagram-check-path.svg" alt="Cekgu check path from paper to human decision" width="100%">

| Verdict                | Meaning                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| **Unverified**         | Fewer than two distinct receipt-verified readings survived.           |
| **Split Opinion**      | The two readers chose different options.                              |
| **Possible Ambiguity** | Both readers declare more than one defensible option.                 |
| **Clear**              | Both readers chose the supplied key after earlier rules did not fire. |
| **Possible Key Error** | Both readers chose the same non-key option.                           |

The verdict is an attention signal, not a mark. In particular, Cekgu detects reader disagreement and ambiguity a reader
declares; it never detects ambiguity directly.

<p align="right"><a href="#readme-top">back to top</a></p>

## GonkaRouter integration

The MUBA track requires all AI reasoning and verification to run through [GonkaRouter](https://api.gonkarouter.io),
cross-verification by at least two models, visible Gonka Request IDs, and explicit consensus logic. Cekgu provides each
of those requirements in the product, not only in its source code.

- **Reasoning and verification:** every question-solving, structuring, evidence admission, and verdict-related inference
  goes through the GonkaRouter gateway.
- **Cross-verification:** a verdict needs two admitted readings from distinct served models. Fewer than two produces
  **Unverified**, never a guess.
- **Visible provenance:** every admitted reading displays its Gonka Request ID and a link to its public receipt. The
  receipt confirms gateway metadata such as the served model; it is not cryptographic or on-chain proof.
- **Consensus:** the fixed five-verdict rule above compares two blind readings before the educator's key. The rule that
  fired is displayed with the result.

<img src="img/diagram-round.svg" alt="Two model families read one item in parallel, with retries and failed attempts recorded" width="100%">

### The upload boundary

An uploaded image or PDF is first sent to Google's Gemini API to transcribe the words printed on it. That is the sole
non-reasoning boundary: it creates a draft only, cannot answer questions or invent an answer key, and does not create a
record. GonkaRouter then structures the transcription and handles every later reasoning or verification step.

This boundary is documented and guarded in the repository. See
[TRD section 20](TRD.md#20-reading-a-paper-from-an-upload) for the measured rationale and
[`only-gonkarouter.test.ts`](../src/server/gateway/only-gonkarouter.test.ts) for the enforcement test.

<p align="right"><a href="#readme-top">back to top</a></p>

## Architecture

<img src="img/diagram-topology.svg" alt="Cekgu architecture showing browser, application server, database, GonkaRouter, Gemini transcription boundary, and public receipts" width="100%">

The browser talks to a Hono application hosted on Cloud Run. The application stores accounts, records, review decisions,
and attempt evidence in PostgreSQL. A bounded worker queue requests independent readings through GonkaRouter, retrieves
receipts, and fails closed when valid evidence is insufficient.

Checks are asynchronous because the decentralised network can be slow or unavailable. The educator can return to a saved
record, inspect recorded attempts, and decide what to do with an **Unverified** item rather than receiving a
manufactured answer.

<p align="right"><a href="#readme-top">back to top</a></p>

## Tech stack

| Layer                | Technology                               | Purpose                                          |
| -------------------- | ---------------------------------------- | ------------------------------------------------ |
| Client               | React 19, React Router, Vite, TypeScript | Review, evidence, and public pages               |
| Server               | Bun, Hono, Zod                           | API, validation, and queue orchestration         |
| Data                 | PostgreSQL, Drizzle ORM                  | Accounts, records, and review history            |
| AI                   | GonkaRouter                              | Blind reads, structuring, verification, receipts |
| Upload transcription | Google Gemini API                        | Printed-text transcription only                  |
| Hosting              | Google Cloud Run                         | Deployed application                             |
| Testing              | Bun test, Playwright, Biome, Prettier    | Unit, browser, lint, and document checks         |

The detailed integration, API contracts, model measurements, queue policy, and test evidence live in [TRD](TRD.md). The
product decisions and business-model hypotheses live in [PRODUCT](PRODUCT.md).

<p align="right"><a href="#readme-top">back to top</a></p>

## Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.x
- PostgreSQL and the environment configuration described in [TRD section 8](TRD.md#8-configuration-contract)
- A GonkaRouter API key for live model calls

### Install and run

```sh
bun install
bun run dev
```

The client dev server is served by Vite and the API server runs through Bun. Use the deployed
[live demo](https://cekgu-op7lf5dspq-as.a.run.app) when a local database or gateway key is not available.

### Verify

```sh
bun run lint
bun run typecheck
bun test
bun run e2e
bun run check:anchors
```

`bun run e2e` covers deterministic browser paths. The live external-model flow is deliberately opt-in because gateway
latency and availability vary; run it only with an authorised environment and treat **Unverified** as a valid result.

<p align="right"><a href="#readme-top">back to top</a></p>

## Submission links

| Deliverable        | Link or status                                                         |
| ------------------ | ---------------------------------------------------------------------- |
| Project repository | [github.com/MUBA-M1KU/Cekgu](https://github.com/MUBA-M1KU/Cekgu)       |
| Deployed app       | [cekgu-op7lf5dspq-as.a.run.app](https://cekgu-op7lf5dspq-as.a.run.app) |
| Public evidence    | [Sample report](https://cekgu-op7lf5dspq-as.a.run.app/sample)          |
| Project social     | [X: @Cekgu0903](https://x.com/Cekgu0903)                               |
| Pitch deck         | [`demo/pitch-deck.pdf`](demo/pitch-deck.pdf)                           |
| MVP demo video     | Pending [#47](https://github.com/MUBA-M1KU/Cekgu/issues/47)            |
| Track              | MUBA Blockchain Hackathon 2026 — GonkaRouter, AI for Society           |

The pitch deck covers the problem, objective, motivation and challenges, commercialisation and business model,
technology stack and track, and the overall concept. The MVP video is deliberately marked pending until the final
deployed flow is recorded; this README does not substitute a draft for it.

The business model is a hypothesis, not revenue evidence: a free tier and pilot plans are designed around questions
checked, while no checkout is represented as implemented. See [PRODUCT business model](PRODUCT.md#business-model).

<p align="right"><a href="#readme-top">back to top</a></p>

## Responsible use and notices

Do not submit confidential final papers, unreleased examination content, personal data, learner identifiers, marks,
passwords, or any material you do not have permission to share. This applies to private accounts and to Guest access.

Guest access is one shared workspace: other guests can view and delete what a guest adds, and guest-created records are
scheduled to expire after 24 hours. Private-record deletion hides a record and schedules app-database removal after 30
days; external processors may retain content under their own policies.

The following concise demo notices are part of this submission branch and need owner re-review against the deployed
release before publication:

- [Terms](legal/terms.md)
- [Privacy](legal/privacy.md)
- [Acceptable use](legal/acceptable-use.md)

Tororo and Hijiki are Live2D sample characters, not Cekgu originals. The full attribution and release-review requirement
appear in the [terms](legal/terms.md).

<p align="right"><a href="#readme-top">back to top</a></p>

## Repository layout

```text
docs/
├── README.md          Judge-facing project overview, setup, links, and limits
├── PRODUCT.md         Product direction, users, business model, and scope
├── PRD.md             Product requirements and acceptance criteria
├── TRD.md             Canonical technical reference and GonkaRouter details
├── DESIGN.md          Visual system and interaction design
├── brief.md           Hackathon rules and submission requirements
├── demo/              Pitch and demonstration materials
├── img/               README diagrams and screenshots
├── legal/             Draft demo terms, privacy, and acceptable-use notices
├── source/            Organizer material and research sources
├── submission/        Devfolio field draft and submission assets index
└── testing/           Desktop acceptance evidence for the deployed product

src/
├── client/            React application
└── server/            Hono API, worker queue, gateway, and persistence

drizzle/               Database schema and migrations
e2e/                   Playwright browser tests
.github/workflows/     CI and deployment workflows
Dockerfile             Cloud Run container build
```

## Further reading

- [Product](PRODUCT.md) — audience, scope, decisions, and business model
- [Product requirements](PRD.md) — user stories and acceptance criteria
- [Technical reference](TRD.md) — integration details and measured behaviour
- [Design](DESIGN.md) — visual and interaction decisions
- [Hackathon brief](brief.md) — event and track source of truth
