# MUBA Blockchain Hackathon 2026, GonkaRouter Track

Our entry to the **MUBA Blockchain Hackathon 2026**, in the **GonkaRouter - AI for Society** track.

|                         |                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Submission deadline** | 5 September 2026, 23:59 MYT ([Devfolio](https://muba-hackathon.devfolio.co/overview)) |
| **Demo Day**            | 6 September 2026, APU, physical attendance required                                   |
| **Track prize**         | 1,200 USDT (1st) · 800 USDT (2nd)                                                     |
| **Status**              | Concept not locked, application stack not chosen                                      |

---

## The One Rule That Governs Everything

> **All AI reasoning must run through GonkaRouter** (`https://api.gonkarouter.io`). A direct call to OpenAI, Anthropic
> or Gemini anywhere in the product path disqualifies the entry.

Plus **two or more models cross-verifying**, and **Gonka Request IDs surfaced in the UI** for every inference step.

---

## Start Here

| File                           | What's In It                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| [`brief.md`](brief.md)         | The whole hackathon: dates, rules, deliverables, judging, people |
| [`../AGENTS.md`](../AGENTS.md) | Project instructions for agentic tools, and humans               |

Work in progress lives in the [Issues board](https://github.com/MUBA-M1KU/dev/issues), not in a checklist here.

### Source Material From The Organizers

| File                                                                                     | Source                                                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`source/opening-ceremony-transcript.md`](source/opening-ceremony-transcript.md)         | Opening ceremony, 26 Aug. Whisper transcript, cleaned and sectioned |
| [`source/gonkarouter-challenge.md`](source/gonkarouter-challenge.md)                     | Official track challenge doc                                        |
| [`source/gonkarouter-tutorial.md`](source/gonkarouter-tutorial.md)                       | GonkaRouter setup: API, models, client wiring, limits               |
| [`source/gonkarouter-workshop-slides.md`](source/gonkarouter-workshop-slides.md)         | Workshop deck, 27 Aug. The authority on model ids and wiring        |
| [`source/gonkarouter-workshop-transcript.md`](source/gonkarouter-workshop-transcript.md) | Workshop recording. Q&A rulings not in the deck                     |

---

## Getting Started

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

| Command             | Does                               |
| ------------------- | ---------------------------------- |
| `bun run lint`      | Biome check, then Prettier check   |
| `bun run format`    | Both formatters, writing in place  |
| `bun run typecheck` | `tsc --noEmit`, once `src/` exists |
| `gh issue list`     | The TODO board                     |

Biome covers JS, TS, JSON, CSS and HTML; Prettier covers the Markdown and YAML it cannot, wrapping prose at 120 to match
`biome.json`'s `lineWidth`. There is no `.prettierignore`, so every Markdown file is formatted, `docs/source/` and the
vendored skills included. Only the contents of fenced code blocks are left alone.

---

## How Work Ships

**`main` is PR-gated.** Branch as `<type>/<slug>`, open a PR with `gh pr create`, merge with
`gh pr merge --squash --delete-branch`. A human merges; nobody merges their own PR.

**Implementation is gated on three docs.** `PRODUCT.md` (who and why), `PRD.md` (what, and what is out of scope) and
`TRD.md` (how) must all exist before build work starts. `DESIGN.md` joins them when frontend work does.

---

## Layout

```
docs/
  README.md              this file, the GitHub-facing readme
  brief.md               hackathon facts, the single source of truth
  PRODUCT.md             who, why, the demo moment
  PRD.md                 what: requirements, acceptance criteria, out of scope
  TRD.md                 how: architecture, contracts, schemas. Canonical
  DESIGN.md              the design system, once frontend work starts
  coding-guidelines.md   behavioural coding rules, referenced by AGENTS.md
  agent-tooling.md       rtk and graphify, both optional and per-machine
  source/                organizer material, append-only
  superpowers/research/  RUBRIC.md and cited findings from concept exploration
  demo/                  pitch script, deck, assets
.agents/skills/          36 skills, the committed source of truth
.claude/skills/          symlinks into .agents/skills/, plus impeccable as a real dir
.claude/agents/          pitch-smith
.claude/hooks/           session brief, env drift, git guard, formatter
```

`PRODUCT.md`, `PRD.md`, `TRD.md` and `DESIGN.md` are listed but **not written yet**. Source layout is not decided; add
it here when it is.

Skill provenance and what each hook does: [`../.agents/skills/VENDORED.md`](../.agents/skills/VENDORED.md).

The repo root deliberately has **no README**. It lives here.
