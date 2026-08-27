<a id="top"></a>

# MUBA Blockchain Hackathon 2026 — GonkaRouter Track

Workspace for our entry to the **MUBA Blockchain Hackathon 2026**, competing in the
**GonkaRouter — AI for Society** track.

|                         |                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Submission deadline** | 5 September 2026, 23:59 MYT ([Devfolio](https://muba-hackathon.devfolio.co/overview)) |
| **Demo Day**            | 6 September 2026 — APU, physical attendance required                                  |
| **Track prize**         | 1,200 USDT (1st) · 800 USDT (2nd)                                                     |
| **Status**              | 📋 Concept not locked — application stack not chosen                                  |

---

<a id="the-one-rule-that-governs-everything"></a>

## The One Rule That Governs Everything

> **All AI reasoning must run through GonkaRouter** (`https://api.gonkarouter.io`).
> A direct call to OpenAI, Anthropic or Gemini anywhere in the product path disqualifies the entry.

Plus: **≥2 models cross-verifying**, and **Gonka Request IDs surfaced in the UI** for every inference step.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="start-here"></a>

## Start Here

| File                           | What's In It                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **[`brief.md`](brief.md)**     | The whole hackathon in one page — dates, rules, deliverables, judging, people |
| [`../AGENTS.md`](../AGENTS.md) | Project instructions for agentic tools (and humans)                           |

**Work in progress lives in the [Issues board](https://github.com/MUBA-M1KU/dev/issues)**
(`gh issue list`), not in a checklist in this file.

### Source Material From The Organizers

| File                                                                             | Source                                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`source/opening-ceremony-transcript.md`](source/opening-ceremony-transcript.md) | Opening ceremony, 26 Aug — Whisper transcript, cleaned & sectioned |
| [`source/gonkarouter-challenge.md`](source/gonkarouter-challenge.md)             | Official track challenge doc                                       |
| [`source/gonkarouter-tutorial.md`](source/gonkarouter-tutorial.md)               | GonkaRouter setup — API, models, client wiring, limits             |

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="getting-started"></a>

## Getting Started

```bash
bun install                  # dev tooling + husky hooks
cp .env.example .env         # then paste your GonkaRouter sk-… key
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

### Commands

| Command             | Does                                       |
| ------------------- | ------------------------------------------ |
| `bun install`       | Dev tooling, and wires the husky git hooks |
| `bun run lint`      | Biome check                                |
| `bun run format`    | Biome + Prettier write                     |
| `bun run typecheck` | `tsc --noEmit`, once `src/` exists         |
| `gh issue list`     | The TODO board                             |

There is no Python stack — the application stack is not chosen yet, and gets
decided in `TRD.md`. Two optional per-machine tools, `rtk` and `graphify`, are
documented in [`agent-tooling.md`](agent-tooling.md); neither is a dependency.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="how-work-ships"></a>

## How Work Ships

**`main` is PR-gated.** Branch as `<type>/<slug>`, open a PR with `gh pr create`,
merge with `gh pr merge --squash --delete-branch`. A human merges; nobody merges
their own PR.

**Implementation is gated on three docs.** `PRODUCT.md` (who and why), `PRD.md`
(what, and what is out of scope) and `TRD.md` (how) must all exist before any
build work starts. `DESIGN.md` joins them when frontend work does. See
[`../AGENTS.md`](../AGENTS.md).

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="layout"></a>

## Layout

```
docs/
  README.md              this file - the GitHub-facing readme
  brief.md               hackathon facts - the working reference
  PRODUCT.md             who, why, the demo moment - written before implementation
  PRD.md                 what: requirements, acceptance criteria, out of scope
  TRD.md                 how: architecture, contracts, schemas. Canonical
  DESIGN.md              the design system, once frontend work starts
  coding-guidelines.md   behavioural coding rules, referenced by AGENTS.md
  agent-tooling.md       rtk and graphify, both optional and per-machine
  source/                organizer material (append-only record)
  superpowers/research/  cited findings from concept exploration
  demo/                  pitch script, deck template, assets
.agents/skills/          36 skills (committed source of truth)
.claude/skills/          symlinks into .agents/skills/, plus impeccable as a real dir
.claude/agents/          pitch-smith
.claude/hooks/           session brief, env drift, git guard, formatter
```

`PRODUCT.md`, `PRD.md`, `TRD.md` and `DESIGN.md` are listed above but **not written
yet** — see [issue #5](https://github.com/MUBA-M1KU/dev/issues/5). Source layout is
not decided; add it here when it is.

Skill provenance and what each hook does: [`../.agents/skills/VENDORED.md`](../.agents/skills/VENDORED.md).

The repo root deliberately has **no README** — it lives here.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>
