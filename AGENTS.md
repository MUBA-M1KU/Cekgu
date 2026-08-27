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

Event facts live in `docs/brief.md`. Organizer source material lives in `docs/source/`.

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

**Demo-first.** If it will not appear in the 2-minute video or the 5-minute
pitch, it is not a priority.

---

## The Gate Before Implementation

**No implementation starts until `docs/` holds all three of these.** They are
cheap to write and expensive to skip: without them the first days produce code
nobody agreed to, and the deck's required sections get invented at the end from
whatever happened to get built.

| File              | Answers                                                                                         | Owns                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `docs/PRODUCT.md` | **Who and why.** The user, their problem, the demo moment, the scope ladder                     | The spine. Everything downstream cites it             |
| `docs/PRD.md`     | **What.** Requirements, user stories, acceptance criteria, what is explicitly out of scope      | Scope. What `hackathon-scope-cutter` cuts against     |
| `docs/TRD.md`     | **How.** Architecture, API contracts, data models, schemas, pipeline detail, decision rationale | Technical truth. Canonical over anything in this file |

A fourth arrives when frontend work starts:

| File             | Answers                                                                                   | Owns                                                          |
| ---------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `docs/DESIGN.md` | **What it looks like.** Palette, type pairing, radius and border treatment, spacing scale | The design system. Written once, then recorded not reinvented |

**The gate is binary.** If `PRODUCT.md`, `PRD.md` and `TRD.md` are not all present,
the answer to "can I start building" is no. Say so, and write the missing one.

Three consequences worth stating outright:

- **`docs/TRD.md` is canonical for architecture**, not this file and not a
  `docs/architecture.md`. Once it exists, technical decisions get recorded there.
- **The PRD is what scope gets cut against.** "Out of scope", written down on day
  one, is the only thing that makes a day-eight cut a decision rather than a panic.
- **The deck's five required sections map onto these.** Problem Statement and
  Overall Concept come from `PRODUCT.md`, Technology Stacks from `TRD.md`. Writing
  them now is writing the deck early, not extra work.

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
  PRODUCT.md             who, why, the demo moment - written before implementation
  PRD.md                 what: requirements, acceptance criteria, out of scope
  TRD.md                 how: architecture, contracts, schemas. Canonical
  DESIGN.md              the design system, once frontend work starts
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

**Application framework, database and hosting are not chosen yet.** They get chosen and justified in `docs/TRD.md`; this table stays an inventory of what is installed.

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

Knowledge-graph commands are in the Graphify appendix.

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
- **Changes are surgical.** See Karpathy guideline 3 in the appendix.

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

### README vs TRD

`docs/README.md` and `docs/TRD.md` may both describe architecture. They differ in
**depth and audience**, not in subject.

|              | `docs/README.md`                                                                                      | `docs/TRD.md`                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Audience** | Readers - judges, external reviewers, anyone landing on the repo                                      | Developers implementing against it                                       |
| **Depth**    | High-level narrative: the WHATs, HOWs and WHYs                                                        | Canonical implementation-level technical reference                       |
| **Contains** | Architecture overview, diagrams for notable components and pipelines, setup, constraints, limitations | API contracts, data models, schemas, pipeline detail, decision rationale |
| **Rule**     | Anything an outside reader legitimately needs must live here                                          | Never duplicate the README's narrative. Go deeper instead                |

Both are committed, so "it is in the TRD" is a valid answer for implementation
detail - but **not** for anything a reviewer needs to understand the system.
**A judge reads the README.** The track brief asks for "clean code with clear
documentation on the GonkaRouter integration", and this is where they look.

`README.md` lives in **`docs/`**, not the repo root. GitHub renders
`docs/README.md` as the repository landing page, so it is still the front door -
keep links relative to `docs/`.

### README Structure And Density

The README is **scanned, not studied.** A reviewer decides what to read from
headings, tables and bold lead-ins, so a section that is correct but dense is a
section that does not get read. These rules apply to `docs/README.md`
specifically and are stricter than the general Conciseness rule above.

**Density, in order of how often each is broken:**

- **No prose block over four lines.** If a paragraph runs longer it is a list, a
  table, or two paragraphs. Split on the seam between the claim and its
  justification: the claim leads, the reasoning follows.
- **Three or more consecutive bolded-lead-in paragraphs are a table.** A run of
  `**Claim.** explanation` blocks reads as a wall. Two columns - claim, and how it
  is enforced - says the same thing and can be skimmed.
- **An enumeration inside a sentence is a list.** Any sentence naming three or
  more vendors, fields, states or controls belongs in bullets or a table.
  Semicolons separating list items are the tell.
- **One idea per block.** A paragraph that states a rule, justifies it, then cites
  a section is three blocks.
- **Trim before restructuring** when the content is not load-bearing, but **never
  drop a measured figure, a citation, a section reference, or a limitation** to
  save space. Reformatting must be lossless - verify by grepping the claims out of
  the old version and back into the new.

**Navigation, applied to every top-level (`##`) section:**

- **A `---` divider before each section**, so the page reads as blocks rather than
  a scroll.
- **A back-to-top link at the foot of each section**, right-aligned, pointing at an
  `<a id="top"></a>` anchor on the first line of the file:
  ```html
  <div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>
  ```
- **Any heading that is linked to needs an explicit `<a id="..."></a>` above it.**
  GitHub's auto-generated slug drops a leading emoji but keeps the hyphen the
  space left behind, and an emoji carrying a variation selector makes the result
  unpredictable. A reviewer clicks a broken anchor once and does not try again.

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

## How Work Ships

**`main` is PR-gated. No stray commits.** `.claude/hooks/guard-git.sh` enforces it
by blocking `git push origin main` and any force push to `main`; the only push to
`main` that ever happened was the initial scaffold.

1. **Branch.** `<type>/<short-slug>`, matching the commit types below:
   `feat/consensus-panel`, `fix/request-id-missing`, `docs/pitch-script`.
2. **Commit** in Conventional Commits form. commitlint runs on `commit-msg`.
3. **Push the branch** and open a PR with `gh pr create`.
4. **Merge with** `gh pr merge --squash --delete-branch`, so no residue is left.

**Small fixes still go through a branch.** The overhead is one command and the
alternative is a `main` nobody can review or revert cleanly.

`gh pr merge` is in the `permissions.deny` list in `.claude/settings.json`.
Merging is a human action - propose the PR, do not merge it yourself.

## TODOs Live In GitHub Issues

**The repository Issues page is the TODO board.** Not a markdown checklist, not a
`docs/plan.md`, not a comment in the code.

```bash
gh issue list                          # what is open
gh issue create -t "..." -b "..."      # add one
gh issue view <n>                      # read one
gh issue close <n>                     # done
```

Why: a checklist in a file goes stale, conflicts on merge, and is invisible to
whoever is not in that file. Issues are visible to the whole team, link to the PR
that closes them, and survive a context reset.

**Reference the issue in the PR** so merging closes it: `Closes #12`.

A short-lived, in-session task list is fine and does not belong in Issues. Anything
that outlives the session does.

---

## Critical Do-Nots

- **Do not** call an AI provider directly — everything goes through GonkaRouter.
- **Do not** import or adapt code written before 26 Aug 2026.
- **Do not** commit `.env` or any `sk-…` key. `.env.example` is committed and carries the key names, never the values.
- **Do not** commit directly to `main`, force-push, rewrite published history, or delete a branch other than a merged feature branch.
- **Do not** merge your own PR. Propose it; a human merges.
- **Do not** track TODOs in a markdown file. They go in GitHub Issues.
- **Do not** hardcode model ids without verifying them against `/v1/models` — they are case- and slash-sensitive.
- **Do not** create `docs/architecture.md` or a second README. Architecture lives in `docs/TRD.md`; the README lives at `docs/README.md`.
- **Do not** start implementation before `docs/PRODUCT.md`, `docs/PRD.md` and `docs/TRD.md` all exist.
- **Do not** rewrite `docs/source/` transcripts. They are the verbatim record.
- **Do not** commit a path that only exists on your machine. `~/CS/...`, `/home/<you>/...`, `C:\Users\...`, `\\wsl.localhost\...` and scratch dirs under `/tmp` are all invisible to everyone else. Name the tool, not your copy of it. Standard, machine-independent locations like `~/.claude/` or `~/.codex/` are fine.
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
| `session-brief.sh` | SessionStart      | Branch, uncommitted count, days to the deadline                                  |
| `env-drift.mjs`    | SessionStart      | Reports a local `.env` disagreeing with `.env.example`. Names keys, never values |
| `guard-git.sh`     | PreToolUse(Bash)  | Blocks direct and force pushes to `main`, and `git add .env`                     |
| `format-edited.sh` | PostToolUse(Edit) | Biome-formats edited JS/TS. Silent, never blocks                                 |

A fifth hook, `no-em-dash-or-emoji.mjs`, is present but **not wired** - see
`VENDORED.md` for why and how to turn it on.

---

## Git Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/): `<type>[scope]: <description>` — single imperative sentence, lowercase, no trailing period.

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.

Enforced locally by commitlint via the husky `commit-msg` hook. Commit when a unit of work is complete and verified.

---

# Appendix: Reference Blocks

The three blocks below are standing references, not the primary directives.
**The sections above outrank them wherever they disagree.** One place they do is
called out immediately below.

<!-- andrej-karpathy-skills -->

# Coding Guidelines (Andrej Karpathy)

Behavioural guidelines that reduce common LLM coding mistakes, from
[Karpathy's observations](https://x.com/karpathy/status/2015883857489522876).

> **Where This Conflicts With Proceed Without Asking, That Section Wins.**
> Guideline 1 below says to stop and ask when something is unclear. In this repo,
> across a ten day build, you do not. Pick the reading that ships, state the
> assumption, and keep going. Stop only for the six cases in **Stop And Ask Only
> For These**. The rest of guideline 1 — surfacing tradeoffs and not hiding
> confusion — still applies: say the assumption out loud, just do not wait on an
> answer.

## 1. Think Before Coding

- State assumptions explicitly.
- If multiple interpretations exist, say so, then pick one and proceed.
- If a simpler approach exists, say so. Push back when warranted.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: would a senior engineer call this overcomplicated? If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Do not improve adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match existing style even if you would do it differently.
- Notice unrelated dead code? Mention it, do not delete it.
- Remove imports and variables that **your** change orphaned. Leave pre-existing
  dead code alone unless asked.

The test: every changed line traces directly to what was asked.

## 4. Goal-Driven Execution

Turn tasks into verifiable goals, then loop until verified.

- "Add validation" becomes "write tests for invalid inputs, then make them pass"
- "Fix the bug" becomes "write a test that reproduces it, then make it pass"
- "Refactor X" becomes "ensure tests pass before and after"

Strong success criteria let you loop on your own. Weak criteria force check-ins,
which is exactly the cost **Proceed Without Asking** exists to avoid.

<!-- andrej-karpathy-skills -->

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer)

## Golden Rule

**Only if `rtk` is installed** (`which rtk`). Not every teammate has it. If it is
missing, run commands directly and ignore this whole section.

**Prefix commands with `rtk`.** If RTK has a filter for that command it uses it,
otherwise it passes through unchanged. It is always safe to use.

Use it inside chains too:

```bash
# Wrong
git add . && git commit -m "msg" && git push

# Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## Commands That Matter Here

```bash
rtk git status / log / diff / add / commit / push    # 59 to 80 percent smaller
rtk gh pr view <n> / pr checks / issue list          # 26 to 87 percent
rtk tsc                                              # TS errors grouped by file
rtk lint                                             # Biome violations grouped
rtk bun run test                                     # failures only
rtk ls / read / grep / find                          # 60 to 75 percent
rtk err <cmd>                                        # errors only from any command
rtk gain                                             # savings so far
```

Git and `gh` passthrough works for every subcommand, including ones not listed.

`rtk` does not defeat the git guard. `.claude/hooks/guard-git.sh` matches on the
command substring, so `rtk git push origin main` and `rtk git add .env` are both
blocked exactly like their bare forms. Verified 2026-08-26.

It **does** defeat the `permissions.deny` list in `.claude/settings.json`, which
is prefix-matched: `Bash(git push --force*)` does not match `rtk git push
--force`. The hook is what actually stops that one, which is why both exist.

<!-- rtk-instructions v2 -->

<!-- graphify-instructions v1 -->

# Graphify: Codebase Knowledge Graph

## Golden Rule

**Only if `graphify` is installed** (`which graphify`). Not every teammate has it.
If it is missing, ignore this section and navigate the codebase normally.

Graphify builds a persistent, queryable map of the project so you answer
architecture questions from a compact graph instead of grepping and reading many
files.

## When to Use It

If `graphify-out/graph.json` exists, treat architecture and relationship questions
("how does X work", "what calls Y", "trace the data flow") as a **`graphify query`
first**, before grep or read:

```bash
graphify query "how does the router client reach config"   # BFS over the graph
graphify query "..." --budget 1500                          # cap the answer
graphify path "GonkaClient" "loadConfig"                    # shortest path
graphify explain "SomeNode"                                 # plain-language summary
```

Then drop to grep or Read for exact `file:line` evidence. **The graph gives you
the file, not the line.**

**Applies to every agent**, subagents included.

## Building and Refreshing

```bash
graphify .              # first build, about a minute, roughly 6 cents
graphify . --update     # incremental, after notable code changes
```

`graphify-out/` is derived and gitignored, so it is per-checkout and regenerating
is on you. Scope is set by `.graphifyignore`, which excludes config, `docs/`,
agent instructions and vendored skills — a graph full of prose and dependency
entries dilutes every query run against it.

**Not worth building on the bare scaffold.** Build it once there is real code.

<!-- graphify-instructions v1 -->
