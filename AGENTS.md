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

## Proceed Without Asking

- Picking a library, file layout, naming, or approach. Choose the obvious one.
- Installing a dependency you need.
- Refactoring your own code mid-task.
- Writing tests, docs, or types you judge necessary.
- Fixing a bug you find in code you are already touching.
- Anything where you can name a sensible default. Take it, and note it.

If two approaches are close, pick one and say which. Do not open a question about
it. **A reversible decision made now beats a correct decision made after a ten
minute conversation.**

## Stop And Ask Only For These

This list is short on purpose. If it is not on this list, proceed.

1. **A track requirement is at risk.** Routing inference off GonkaRouter, dropping
   to one model, or losing the Request ID trail. Any of those disqualifies us.
2. **The change would break something already working**, and you cannot avoid it.
3. **`bun run lint` or `bun run typecheck` fails and you cannot fix it.** Say what
   fails and what you tried.
4. **Two pieces of work genuinely conflict** and shipping both is impossible.
5. **A credential or external account is missing** and you cannot proceed.
6. **The work would change the demo** in a way the team has not agreed to.

Everything else: build it, ship it, and write down what you did.

## The Bar For Shipping

Work is ready when the checks pass and it does what was asked. It is not required
to be complete, elegant, or final. **Partial work that runs beats finished work
still sitting on a branch on 5 September.**

If you are behind, **cut scope, do not cut the quality of what ships.** Half a
feature that works demos fine. A whole feature that throws does not.

---

## How To Report

If reading your message takes longer than doing the thing, you have cost time.
That is the failure mode to avoid.

- **Lead with what happened.** First sentence answers "what is the state of things
  now?" No preamble, no restating the request, no "I will now proceed to".
- **Three to five sentences for a normal update.** Longer only when something
  broke and the detail is needed to fix it.
- **Say what a human should do, or say nothing is needed.** Never leave someone
  guessing whether they are blocked.
- **No status theatre.** Do not narrate steps, list what you considered and
  rejected, or summarise what you already said. Report the outcome.
- **When something breaks, give the error verbatim.** Do not paraphrase a stack
  trace. Paste it, then say in one plain sentence what it means.
- **No jargon without a plain-language gloss.** Use the real term once with the
  plain version attached, so a newcomer learns it instead of being talked around.

---

## Repo Layout

```
docs/
  README.md              GitHub-facing readme (the repo root has none by design)
  brief.md               the hackathon in one page - the working reference
  source/                organizer material, verbatim and append-only
  superpowers/research/  cited findings from concept exploration
  demo/                  the pitch script, the deck, the PDF, and its assets
.agents/skills/          committed, tool-agnostic skills (source of truth)
.claude/skills/          symlinks into .agents/skills/, plus impeccable as a real dir
.claude/agents/          pitch-smith
.claude/hooks/           session brief, env drift, git guard, formatter
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

## CLI First, Always

Reach for a CLI before a dashboard: `gh` for anything GitHub, `bun` for everything
Node, `uv` for Python. Clicking through a dashboard leaves no trace, cannot be
handed to a teammate, and cannot be repeated tomorrow.

**If the CLI is missing, say so immediately and give the install command.** Do not
route a human through the web UI as a workaround, and do not go quiet about it.
One line is enough, then carry on with whatever else you can do.

**If no CLI exists for the job, drive the browser yourself.** Do not write a
click-by-click walkthrough of a dashboard. Pick the tool by whether the task needs
a logged-in session:

| Task                                                                      | Tool                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Anything behind a login: Devfolio, GonkaRouter dashboard, an OAuth screen | `claude-in-chrome`. Read `.agents/skills/claude-in-chrome/SKILL.md` first - it carries the banned actions |
| Our own deployed app: smoke tests, screenshots, checking a page renders   | Playwright, headless in WSL. Scriptable, needs no human                                                   |

Headless Chromium in WSL cannot see the Windows browser's cookies, which is the
whole reason that split exists. Do not reach for Playwright on a logged-in page
and expect a session.

Two rules on the authenticated path. **Never type a password, card number, or API
key into a form** for someone, and never accept terms or submit a form on their
behalf. Read the screen, do the navigation, then hand back the one action that is
theirs to take. And **screenshot what you did** - a dashboard change nobody can
diff is exactly the thing that gets lost.

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

- **TitleCase for every heading, subheading, bold lead-in label, and table header cell.** Body prose, full sentences, and commit subjects stay in sentence case. Capitalize the first and last word plus all principal words; lowercase articles, coordinating conjunctions and short prepositions unless they open or close the title. Acronyms and proper names keep their established form: AI, API, PR, KL, MUBA, Gonka, Kimi.
- **Forward-looking only.** Apply this to what you write or touch. Do not sweep existing docs to conform - a repo-wide retitle buries the real change in noise.
- **Do not reformat received sources, transcripts, or installed skills.** `.prettierignore` and `docs/source/` record those boundaries.
- **Conciseness:** No clumped prose. Break text into bullet points, tables, or other elements that lower reading cost.
- **`docs/brief.md` is the single source of truth for event facts.** Organizers have already changed things once (registration extended). When something changes, update `brief.md` and note the delta — never leave two files disagreeing.
- **`docs/source/` is append-only.** Do not rewrite it to match later beliefs; corrections belong in `brief.md`.
- **`docs/README.md` is the GitHub-facing README.** The repo root has no README by design.
- Never create a second file that overlaps an existing one. Update the existing file.

---

## Design Standards

Anything a judge can see is held to a professional standard: the demo UI, the
README, the deck. **UX & Design is 10 points and Presentation & Clarity is 20** -
a fifth of the score - and Demo Day is humans watching a five minute pitch on a
projector. Design here is not decoration, it is score.

The bar is easy to state and hard to clear: **the work must not look generated.**
A competent but templated screen has failed the task, not partly done it.

### Where The Design System Lives

We do not have one yet, because the concept is not locked. **The first person to
build UI defines it once and records it:** the palette, the type pairing, the
radius and border treatment, the spacing scale. After that it is recorded, not
reinvented. Do not invent a second palette on screen three, and do not import a
whole system verbatim from a reference library.

### The Anti-Slop Rules

Current AI design output clusters around a small number of looks. Producing one of
them here is a defect. The tells:

- Warm cream ground, serif display face, terracotta accent
- Near black with a single acid green or vermilion pop
- A purple to blue gradient hero on white
- Inter or Space Grotesk reached for as the safe default
- Everything centre aligned
- One large corner radius applied uniformly to every surface
- A coloured rail down the side of a rounded card
- Numbered markers, 01 and 02 and 03, on content that is not a sequence
- Three items in every list because three feels balanced
- Glassmorphism on a hero with no reason for depth
- A dark dashboard with neon chart lines and no data behind them

**Structure must mean something.** If a design uses numbering, an eyebrow, a
divider, or a state chip, that device has to carry real information. A numbered
list of unordered things is a lie told in layout.

### UI Text Follows Documentation Hygiene

The TitleCase rule is not only for markdown. In the interface:

- **TitleCase:** nav items, buttons, section headings, card titles, table headers,
  tab labels, menu items, modal titles, form field labels.
- **Sentence case:** body copy, helper text, placeholder text, tooltips, error
  messages, empty state descriptions, toast bodies. Anything that is a sentence.

`Save Changes` and `Export Report`, not `Save changes`. But `We could not reach the
model, try again in a moment.` stays a sentence.

### Images

**Claude Code cannot generate images.** Delegate to Codex, which has generation
built in and needs no API key:

```bash
codex exec --skip-git-repo-check "<prompt>. Use your image generation tool. Save to /absolute/path/<name>.png"
```

Give it an **absolute** path - Codex writes the original into
`~/.codex/generated_images/<session-id>/` and then copies it where you say. Output
is roughly 800 KB at 1254x1254, so **resize before anything lands in the repo.**
Use the `brandkit` skill for art direction rather than hand-writing a prompt.

### The Gate Before Anything Visual Ships

Nothing visual is done until all four are true. State them explicitly when you
report completion.

1. `impeccable critique` has run and its findings are addressed or consciously declined
2. The `design-taste-frontend` pre-flight check passes
3. The screen has been viewed at demo scale, not just in a wide editor pane
4. TitleCase has been checked against rendered text, not source

---

## Working Conventions

- **Deadline beats polish.** Hard stop on 5 Sept. A complete, narrow, demoable thing beats an ambitious half-thing.
- **Demo-first.** If it will not appear in the 2-minute video, it is not a priority.
- **CLI-first.** Configure via CLI over GUI where possible.
- **State the assumption, do not wait on it.** Surfacing a tradeoff is required; blocking on an answer is not. See Proceed Without Asking.
- **No secrets in the repo.** `.env.example` is committed; `.env` is gitignored. The GonkaRouter `sk-…` key lives in `.env` only, never in `.env.example`.
- **Graphify first for structure questions.** Once `graphify-out/graph.json` exists, treat "how does X work" / "what calls Y" as a `graphify query` before grepping or reading many files.

---

## Critical Do-Nots

- **Do not** call an AI provider directly — everything goes through GonkaRouter.
- **Do not** import or adapt code written before 26 Aug 2026.
- **Do not** commit `.env` or any `sk-…` key.
- **Do not** push, force-push, rewrite published history, or delete branches without explicit human authorization.
- **Do not** hardcode model ids without verifying them against `/v1/models` — they are case- and slash-sensitive.
- **Do not** create `docs/architecture.md` or a second README. Architecture decisions go in this file; the README lives at `docs/README.md`.
- **Do not** rewrite `docs/source/` transcripts. They are the verbatim record.
- **Do not** edit `docs/demo/` outside the `pitch-smith` subagent. It owns those files.
- **Do not** burn GonkaRouter tokens on idle experimentation.
- **Do not** miss the Devfolio submission. No submission = disqualified from pitching, no exceptions.

---

## Project Skills

37 skills are committed: 36 under `.agents/skills/` (source of truth;
`.claude/skills/` symlinks into it) plus `impeccable`. **Optional** - invoke one
when the task matches, not as a checkpoint before every action.

| Group                      | Skills                                                                                                                                                       | Reach For                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Hackathon** (7)          | `hackathon-idea-generator`, `-idea-scoring`, `-scope-cutter`, `-wow-detector`, `-demo-script`, `-judge-simulator`, `-shared-resources`                       | Concept selection, scope control, the demo and the pitch                                         |
| **Business** (8)           | `startup-validator`, `competitor-analysis`, `strategy-red-team`, `value-proposition`, `jobs-to-be-done`, `beachhead-segment`, `lean-canvas`, `market-sizing` | Deciding whether a concept is worth building, and the deck's business sections                   |
| **Superpowers** (14)       | `brainstorming`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `verification-before-completion`, `systematic-debugging`, and 8 more     | Process. Sets an approach before implementation carries it out                                   |
| **Taste** (3)              | `design-taste-frontend`, `high-end-visual-design`, `image-to-code`                                                                                           | Frontend that does not look templated                                                            |
| **Utility** (4)            | `diagnose`, `handoff`, `graphify`, `claude-in-chrome`                                                                                                        | Stuck bugs, context handoff, architecture questions, real-browser work                           |
| **`.claude/skills/` only** | `impeccable`                                                                                                                                                 | Building and fixing an actual interface. Real directory, not a symlink - a hook points inside it |

Three things worth knowing before reaching for one:

- **`brainstorming` is not the ideation skill.** It shapes a build once a concept
  is locked. The eight business skills are what concept selection runs on.
- **Taste sets the target, `impeccable` hits it.** Do not start with `impeccable`.
- **The `hackathon-*` skills were retargeted.** They came from a different event and
  their bodies still name its rules. The `> ## This Event` block at the top of each
  wins wherever they disagree.

`.agents/skills/VENDORED.md` records where every skill came from, what was
retargeted, what was deliberately not taken, and what each hook does.

---

## Subagents

One, in `.claude/agents/`, pinned to its own model and effort.

| Agent         | Owns                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `pitch-smith` | `docs/demo/` - the pitch script, the deck, the PDF, and the 2-minute video script. Nothing else |

Dispatch `pitch-smith` once the build is frozen, or earlier to draft against what
already works. It does not touch `src/`, open issues, review PRs, or edit
`AGENTS.md` and `docs/brief.md`.

---

## Hooks

`.claude/settings.json` wires four guards. Each exits 0 on any internal failure -
a broken guard must never wedge a session.

| Hook               | Fires             | Does                                                                             |
| ------------------ | ----------------- | -------------------------------------------------------------------------------- |
| `session-brief.sh` | SessionStart      | Stage, branch, uncommitted count, days to the deadline                           |
| `env-drift.mjs`    | SessionStart      | Reports a local `.env` disagreeing with `.env.example`. Names keys, never values |
| `guard-git.sh`     | PreToolUse(Bash)  | Blocks direct and force pushes to `main`, and `git add .env`                     |
| `format-edited.sh` | PostToolUse(Edit) | Biome-formats edited JS/TS. Silent, never blocks                                 |

A fifth hook, `no-em-dash-or-emoji.mjs`, is present but **not wired** - see
`VENDORED.md` for why and how to turn it on.

---

## Git Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/): `<type>[scope]: <description>` — single imperative sentence, lowercase, no trailing period.

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.

Enforced locally by commitlint via the husky `commit-msg` hook. Commit when a unit of work is complete and verified. **Never push unprompted.**
