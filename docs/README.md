# MUBA Blockchain Hackathon 2026, GonkaRouter track

Our entry to the MUBA Blockchain Hackathon 2026, in the **GonkaRouter — AI for Society** track. This is the landing page
for anyone arriving at the repo; the deeper documents are linked from [Start here](#start-here).

- **Submission deadline** — 5 September 2026, 23:59 MYT, on [Devfolio][devfolio]
- **Demo Day** — 6 September 2026, APU, physical attendance required
- **Track prize** — 1,200 USDT first place, 800 USDT second
- **Live demo** — <https://cekgu-op7lf5dspq-as.a.run.app>, deployed from `main` on every merge
- **Status** — Cekgu selected; `PRODUCT.md`, `PRD.md` and `TRD.md` written, so the build gate is open. Stack decided:
  Bun, Hono, React, Neon Postgres, Cloud Run. The client and server scaffold is deployed

[devfolio]: https://muba-hackathon.devfolio.co/overview

## The one rule that governs everything

> **All AI reasoning must run through GonkaRouter** (`https://api.gonkarouter.io`). A direct call to OpenAI, Anthropic
> or Gemini anywhere in the product path disqualifies the entry.

Plus **two or more models cross-verifying**, and **Gonka Request IDs surfaced in the UI** for every inference step.

## Start here

- [`brief.md`](brief.md) — the whole hackathon: dates, rules, deliverables, judging, people
- [`PRODUCT.md`](PRODUCT.md) — Cekgu's customer, problem, product loop, pages, scope, business model and demo moment
- [`PRD.md`](PRD.md) — requirements with stable ids, acceptance criteria, the demo as an acceptance test
- [`TRD.md`](TRD.md) — the measured GonkaRouter reference, then the application: architecture, hosting, data model,
  queue, consensus rule, API
- [`superpowers/research/README.md`](superpowers/research/README.md) — eleven-round concept research and ranked
  candidates
- [`../AGENTS.md`](../AGENTS.md) — project instructions for agentic tools, and humans

Work in progress lives in the [Issues board](https://github.com/MUBA-M1KU/dev/issues), not in a checklist here.

### Source material from the organizers

| File                             | Source                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| [Opening ceremony][ceremony]     | Opening ceremony, 26 Aug. Whisper transcript, cleaned and sectioned |
| [Challenge brief][challenge]     | Official track challenge doc                                        |
| [Tutorial notes][tutorial]       | GonkaRouter setup: API, models, client wiring, limits               |
| [Workshop deck][deck]            | Workshop deck, 27 Aug. The authority on model ids and wiring        |
| [Workshop transcript][recording] | Workshop recording. Q&A rulings not in the deck                     |

[ceremony]: source/opening-ceremony-transcript.md
[challenge]: source/gonkarouter-challenge.md
[tutorial]: source/gonkarouter-tutorial.md
[deck]: source/gonkarouter-workshop-slides.md
[recording]: source/gonkarouter-workshop-transcript.md

## Getting started

```bash
bun install                  # dev tooling and the husky git hooks
cp .env.example .env         # then paste your GonkaRouter key
```

Verify the gateway before writing any code:

```bash
curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"moonshotai/Kimi-K2.6","max_tokens":1024,
       "messages":[{"role":"user","content":"Reply with just: pong"}]}'
```

| Command              | Does                               |
| -------------------- | ---------------------------------- |
| `bun run test:guard` | Merge and main-branch guard tests  |
| `bun run lint`       | Biome check, then Prettier check   |
| `bun run format`     | Both formatters, writing in place  |
| `bun run typecheck`  | `tsc --noEmit`, once `src/` exists |
| `bun test`           | Unit tests                         |
| `bun run e2e`        | Playwright smoke against a deploy  |
| `gh issue list`      | The TODO board                     |

### The smoke pass

`bun run e2e` tests a **deployed URL**, never a local build. It defaults to production and takes any other deployment
through `E2E_BASE_URL`, so the same command checks a preview before a rehearsal:

```bash
bun run e2e                                                        # production
E2E_BASE_URL=https://pr-42---cekgu-op7lf5dspq-as.a.run.app bun run e2e   # a preview
```

Browsers are not installed by `bun install`; run `bunx playwright install chromium` once. The same pass runs
automatically after every production deploy, so a deploy that serves a broken build fails the run rather than waiting
for someone to open the URL.

It currently asserts that the shell serves, that a client route falls back to it rather than 404ing, that an API path is
refused without a session, that Sign In as Guest returns a usable session, and that an unknown API path answers JSON
once signed in. The four demo-path steps from [TRD section 18](TRD.md#18-testing) — the Guest banner, the sample record
and its counts, the Possible Key Error filter and the two request ids in an evidence panel — are present as skipped
tests naming the issue that unblocks each, so a green run never implies the demo path is covered.

Biome covers JS, TS, JSON, CSS and HTML; Prettier covers the Markdown and YAML it cannot, wrapping prose at 120 to match
`biome.json`'s `lineWidth`. There is no `.prettierignore`, so every Markdown file is formatted, `docs/source/` and the
vendored skills included. Only the contents of fenced code blocks are left alone.

## How it works

Cekgu is a pre-publication check for multiple-choice questions. An educator types a small quiz, with the answer key, and
gets back a record that says which items deserve a human second look. Each question is sent, without its key, to two
different AI models on the Gonka network, and each model answers it blind. Cekgu then compares the two readings with
each other before comparing them with the educator's key: if both readers pick the key, the item is **Clear**; if both
pick the same other option, **Possible Key Error**; if both see more than one defensible option, **Possible Ambiguity**;
if they disagree, **Split Opinion**. Fewer than two verified readings means **Unverified**, never a guess. The educator
records what they decided, and the record keeps every model reading, every request id and every human decision. The work
runs in a queue, so a check can take minutes and the educator can leave and come back.

The interface is English only for the submission; Bahasa Malaysia would be a second locale, selected from Profile &
Preferences.

### GonkaRouter integration

Every inference call goes to `https://api.gonkarouter.io` from one server-side client, `src/server/gateway/client.ts`.
There is no other AI provider anywhere in the code, which a search for provider hostnames confirms.

- **Where the request ids come from.** Each GonkaRouter response carries an `x-request-id` header. The client reads it
  off the raw response before parsing the body, stores it with the attempt, and the evidence view shows it beside the
  reading it belongs to, as selectable text with a link to the public receipt. Detail:
  [Request IDs and provenance](TRD.md#4-request-ids-and-provenance)
- **How the receipt check works.** The client asks the gateway not to substitute models, rejects any response that says
  it did, then fetches `GET /v1/receipts/<id>` and requires the receipt's model to match the one requested. A reading
  that fails any step is kept, marked rejected with the reason, and never counts. Two readings count as independent only
  when their receipts name different models. Detail:
  [Cross-verification validity contract](TRD.md#cross-verification-validity-contract) and
  [Consensus rule](TRD.md#14-consensus-rule)
- **What the consensus rule is.** A pure function over the first two admitted readings from distinct models: fewer than
  two gives Unverified; different answers give Split Opinion; both listing several defensible options gives Possible
  Ambiguity; a shared answer equal to the key gives Clear; otherwise Possible Key Error. The rule that fired is printed
  next to every verdict. Detail: [the rule table](TRD.md#the-rule)

The receipt is gateway metadata that makes the serving model publicly inspectable. It is not cryptographic or on-chain
proof, and the product says so.

## How work ships

**`main` is PR-gated.** Branch as `<type>/<slug>`, open a PR with `gh pr create`, then merge the verified head with
`gh pr merge <number> --squash --delete-branch --match-head-commit <40-character-head-sha>`. Agents may merge without
per-PR human approval when the PR is non-draft and mergeable, all required checks and fresh project verification pass,
and there is no unresolved Critical or Important review finding or known regression. Direct and force pushes to `main`
remain forbidden.

**Implementation is gated on three docs.** `PRODUCT.md` (who and why), `PRD.md` (what, and what is out of scope) and
[`TRD.md`](TRD.md) (how) must all exist before build work starts. `DESIGN.md` joins them when frontend work does.

## Repository layout

```text
docs/
  README.md              this file, the GitHub-facing readme
  brief.md               hackathon facts, the single source of truth
  markdown-style.md      the Markdown style guide every doc here follows
  PRODUCT.md             who, why, the demo moment
  PRD.md                 what: requirements, acceptance criteria, out of scope
  TRD.md                 how: architecture, contracts, schemas. Canonical
  DESIGN.md              the design system, once frontend work starts
  coding-guidelines.md   behavioural coding rules, referenced by AGENTS.md
  agent-tooling.md       rtk and graphify, both optional and per-machine
  source/                organizer material
  superpowers/research/  RUBRIC.md and cited findings from concept exploration
  demo/                  pitch script, deck, assets
src/
  client/                the React single-page app
  server/                Hono API under /api, the GonkaRouter client, the queue worker
  shared/                types, zod schemas and the verdict rule, used by both
public/                  static assets: brand/ and the Live2D mascot runtime files
drizzle/                 database migrations, committed
.github/workflows/       CI on pull request with a preview URL, deploy on merge
Dockerfile               the Cloud Run image
.agents/skills/          36 skills, the committed source of truth
.claude/skills/          symlinks into .agents/skills/, plus impeccable as a real dir
.claude/agents/          pitch-smith
.claude/hooks/           session brief, env drift, git guard, formatter
```

`DESIGN.md`, `src/`, `drizzle/`, `.github/workflows/` and the `Dockerfile` are listed but **not written yet**; only
`public/live2d/` exists. The layout is decided in [`TRD.md`](TRD.md#repository-layout).

The repo root deliberately has **no README**. It lives here.

## See also

- [`markdown-style.md`](markdown-style.md) — the style guide every document in this tree follows
- [`../.agents/skills/VENDORED.md`](../.agents/skills/VENDORED.md) — skill provenance, permissions, and what each hook
  does
- [Devfolio submission page][devfolio] — the disqualification gate
