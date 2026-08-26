# AGENTS.md

> **Canonical, tool-agnostic project instructions.** Every agentic tool (Claude Code, Codex, OpenCode, …) works from this file. Tool-specific adapters (`CLAUDE.md`) only point here.
> **Read [`docs/brief.md`](docs/brief.md) before acting** — deadlines, rules, and the judging rubric this project is built against.

---

## Project

**MUBA Blockchain Hackathon 2026** entry — track: **GonkaRouter — AI for Society**.
Repo: `github.com/MUBA-M1KU/dev` (private).

| Constraint              | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Submission deadline** | **5 Sept 2026, 23:59 MYT** — on Devfolio, or disqualified from pitching                                                        |
| **Demo Day**            | 6 Sept 2026, APU — physical                                                                                                    |
| **Team size**           | 2–4 members; no solo entries                                                                                                   |
| **Originality**         | Built from scratch during the hackathon window. Prior projects and privately pre-built frameworks are explicitly disqualifying |

Event facts live in `docs/brief.md`. Organizer source material lives in `docs/source/` — treat it as the append-only record of what was actually said.

---

## Track Requirements

Non-negotiable, from the official challenge doc (`docs/source/gonkarouter-challenge.md`):

1. **All AI reasoning runs through GonkaRouter** (`https://api.gonkarouter.io`). A direct OpenAI / Anthropic / Gemini call anywhere in the product path disqualifies the entry.
2. **At least two models cross-verify** — multi-model consensus.
3. **Gonka Request IDs are surfaced in the UI** for every inference step. This is the "on-chain proof"; wire it through from the first commit, not at the end.
4. **Explicit consensus logic** for model disagreement — the organizers call this "a major plus".

Gateway setup, model ids, client wiring and rate limits: `docs/source/gonkarouter-tutorial.md`.

---

## Repo Layout

```
docs/
  README.md              GitHub-facing readme (the repo root has none by design)
  brief.md               the hackathon in one page - the working reference
  source/                organizer material, verbatim and append-only
  superpowers/research/  cited findings from concept exploration
.agents/skills/          committed, tool-agnostic skills (source of truth)
.claude/skills/          symlinks into .agents/skills/
```

Source layout is not decided yet. Add it here when it is — do not pre-declare directories that do not exist.

---

## Tech Stack

Confirmed and installed:

| Tool                                 | Role                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| **Bun**                              | JS package manager and script runner (`bun install`, `bun run`, `bunx`)            |
| **Biome**                            | Lint + format for JS/TS/JSON                                                       |
| **Prettier**                         | Format for Markdown/YAML                                                           |
| **TypeScript**                       | `tsc --noEmit` typecheck; strict, `noUncheckedIndexedAccess`                       |
| **uv**                               | Python dependency + venv management, if and where Python is used                   |
| **Ruff**                             | Python lint + format (line length 120, target py312)                               |
| **commitlint + husky + lint-staged** | Conventional Commits enforced on `commit-msg`; staged files linted on `pre-commit` |
| **graphify**                         | Knowledge graph over the codebase; `.graphifyignore` keeps docs and tooling out    |
| **GonkaRouter**                      | The only permitted inference path (see Track Requirements)                         |

**Application framework, database and hosting are not chosen yet.** Record them here once they are, with the reason, rather than in a separate architecture doc.

---

## Commands

```bash
bun install          # install dev tooling; also wires husky hooks
bun run lint         # biome check .
bun run format       # biome format --write . && prettier --write .
bun run typecheck    # tsc --noEmit

uv sync              # install Python deps (only once Python code exists)
uv run ruff check .  # lint Python
```

```bash
graphify .           # build the knowledge graph (code-only, no API key needed)
graphify . --update  # refresh after notable code changes
graphify query "…"   # ask architecture/relationship questions before grepping
```

---

## Code Style

- **Formatting:** Biome and Prettier are authoritative — single quotes, no semicolons, no trailing commas, 120-char lines, 2-space indent. Do not hand-format against them.
- **Types:** No `any`; prefer `unknown` plus narrowing. Validate at system boundaries.
- **Error handling:** Validate at boundaries; do not wrap internal framework calls in try/catch.
- **Comments:** Default to none. Comment only when the _why_ is non-obvious. Never describe _what_ the code does.
- **Changes are surgical:** touch only what the task requires, match surrounding style, don't refactor what isn't broken.

> Full behavioral coding guidelines (Andrej Karpathy) are inherited from the user's global config.

---

## Documentation Hygiene

- **Formatting:** Headings, subheadings, bullet-point headings and table headings in TitleCase.
- **Conciseness:** No clumped prose. Break text into bullet points, tables, or other elements that lower reading cost.
- **`docs/brief.md` is the single source of truth for event facts.** Organizers have already changed things once (registration extended). When something changes, update `brief.md` and note the delta — never leave two files disagreeing.
- **`docs/source/` is append-only.** Do not rewrite it to match later beliefs; corrections belong in `brief.md`.
- **`docs/README.md` is the GitHub-facing README.** The repo root has no README by design.
- Never create a second file that overlaps an existing one. Update the existing file.

---

## Working Conventions

- **Deadline beats polish.** Hard stop on 5 Sept. A complete, narrow, demoable thing beats an ambitious half-thing.
- **Demo-first.** If it will not appear in the 2-minute video, it is not a priority.
- **CLI-first.** Configure via CLI over GUI where possible.
- **Ask before assuming.** State assumptions explicitly and surface tradeoffs rather than silently picking.
- **No secrets in the repo.** `.env.example` is committed; `.env` and `.env.local` are gitignored. The GonkaRouter `sk-…` key lives in `.env.local` only.
- **Graphify first for structure questions.** Once `graphify-out/graph.json` exists, treat "how does X work" / "what calls Y" as a `graphify query` before grepping or reading many files.

---

## Critical Do-Nots

- **Do not** call an AI provider directly — everything goes through GonkaRouter.
- **Do not** import or adapt code written before 26 Aug 2026.
- **Do not** commit `.env`, `.env.local`, or any `sk-…` key.
- **Do not** push, force-push, rewrite published history, or delete branches without explicit human authorization.
- **Do not** hardcode model ids without verifying them against `/v1/models` — they are case- and slash-sensitive.
- **Do not** create `docs/architecture.md` or a second README. Architecture decisions go in this file; the README lives at `docs/README.md`.
- **Do not** miss the Devfolio submission. No submission = disqualified from pitching, no exceptions.

---

## Project Skills (Proactive)

Committed under `.agents/skills/` (source of truth; `.claude/skills/` symlinks into it). **Invoke them proactively when their situation arises — do not wait to be asked.**

| Situation                                                | Skill                        |
| -------------------------------------------------------- | ---------------------------- |
| Product concept still open or being rethought            | `hackathon-idea-generator`   |
| Candidate concepts exist, need ranking                   | `hackathon-idea-scoring`     |
| Plan or feature list growing past the days remaining     | `hackathon-scope-cutter`     |
| Concept locked; shaping the demo                         | `hackathon-wow-detector`     |
| Preparing the 2-min video or 5-min pitch                 | `hackathon-demo-script`      |
| Deck drafted or demo scripted — harden before submission | `hackathon-judge-simulator`  |
| Need winning patterns, demo psychology, MVP strategy     | `hackathon-shared-resources` |

---

## Git Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/): `<type>[scope]: <description>` — single imperative sentence, lowercase, no trailing period.

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.

Enforced locally by commitlint via the husky `commit-msg` hook. Commit when a unit of work is complete and verified. **Never push unprompted.**
