# MUBA Blockchain Hackathon 2026, GonkaRouter track

Our entry to the MUBA Blockchain Hackathon 2026, in the **GonkaRouter — AI for Society** track. This is the landing page
for anyone arriving at the repo; the deeper documents are linked from [Start here](#start-here).

- **Submission deadline** — 5 September 2026, 23:59 MYT, on [Devfolio][devfolio]
- **Demo Day** — 6 September 2026, APU, physical attendance required
- **Track prize** — 1,200 USDT first place, 800 USDT second
- **Status** — Cekgu selected, product definition written, PRD and application stack not yet chosen

[devfolio]: https://muba-hackathon.devfolio.co/overview

## The one rule that governs everything

> **All AI reasoning must run through GonkaRouter** (`https://api.gonkarouter.io`). A direct call to OpenAI, Anthropic
> or Gemini anywhere in the product path disqualifies the entry.

Plus **two or more models cross-verifying**, and **Gonka Request IDs surfaced in the UI** for every inference step.

## Start here

- [`brief.md`](brief.md) — the whole hackathon: dates, rules, deliverables, judging, people
- [`PRODUCT.md`](PRODUCT.md) — Cekgu's customer, problem, product loop, pages, scope, business model and demo moment
- [`TRD.md`](TRD.md) — the measured GonkaRouter reference: base URLs, model ids, provenance headers, limits
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
| `gh issue list`      | The TODO board                     |

Biome covers JS, TS, JSON, CSS and HTML; Prettier covers the Markdown and YAML it cannot, wrapping prose at 120 to match
`biome.json`'s `lineWidth`. There is no `.prettierignore`, so every Markdown file is formatted, `docs/source/` and the
vendored skills included. Only the contents of fenced code blocks are left alone.

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
.agents/skills/          36 skills, the committed source of truth
.claude/skills/          symlinks into .agents/skills/, plus impeccable as a real dir
.claude/agents/          pitch-smith
.claude/hooks/           session brief, env drift, git guard, formatter
```

`PRD.md` and `DESIGN.md` are listed but **not written yet**. Source layout is not decided; add it here when it is.

The repo root deliberately has **no README**. It lives here.

## See also

- [`markdown-style.md`](markdown-style.md) — the style guide every document in this tree follows
- [`../.agents/skills/VENDORED.md`](../.agents/skills/VENDORED.md) — skill provenance, permissions, and what each hook
  does
- [Devfolio submission page][devfolio] — the disqualification gate
