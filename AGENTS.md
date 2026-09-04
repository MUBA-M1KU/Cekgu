# AGENTS.md

Canonical, tool-agnostic project instructions. Every agentic tool works from this file; `CLAUDE.md` only points here.
**Read [`docs/brief.md`](docs/brief.md) before acting** — deadlines, rules and the judging rubric.

Contents:

1. [Project](#project)
1. [Track requirements](#track-requirements)
1. [How to work](#how-to-work)
1. [The gate before implementation](#the-gate-before-implementation)
1. [How to report](#how-to-report)
1. [Tech stack and commands](#tech-stack-and-commands)
1. [CLI first, always](#cli-first-always)
1. [Code style](#code-style)
1. [Documentation hygiene](#documentation-hygiene)
1. [Design standards](#design-standards)
1. [How work ships](#how-work-ships)
1. [Critical do-nots](#critical-do-nots)
1. [Skills, subagents and hooks](#skills-subagents-and-hooks)
1. [Appendix: standing references](#appendix-standing-references)

## Project

**MUBA Blockchain Hackathon 2026**, track **GonkaRouter - AI for Society**. Repo: `github.com/MUBA-M1KU/Cekgu`
(private).

**Submission deadline: 5 Sept 2026, 23:59 MYT**, on Devfolio. No submission means disqualification from pitching. Every
other event fact lives in [`docs/brief.md`](docs/brief.md), which is the single source of truth for them; organizer
source material is in [`docs/source/`](docs/source/).

## Track requirements

Non-negotiable, from [`docs/source/gonkarouter-challenge.md`](docs/source/gonkarouter-challenge.md):

1. **All AI reasoning and verification runs through GonkaRouter** (`https://api.gonkarouter.io`). Reasoning and
   verification, which is the organizers' own wording — see [`docs/brief.md`](docs/brief.md). One non-reasoning
   exception is permitted and it is exactly one: `src/server/transcribe/` turns an uploaded image or PDF into the text
   printed on it, because only Kimi has vision and a single reader cannot cross-verify anything.
   [`docs/TRD.md` section 20](docs/TRD.md#20-reading-a-paper-from-an-upload) holds the decision;
   `src/server/gateway/only-gonkarouter.test.ts` fails the build if a provider host appears anywhere else
1. **At least two models cross-verify.** Multi-model consensus
1. **Gonka Request IDs are surfaced in the UI** for every inference step. This is the on-chain proof: wire it through
   from the first commit, not at the end
1. **Explicit consensus logic** for model disagreement. The organizers call this "a major plus"

Gateway setup, model ids, client wiring and rate limits: [`docs/TRD.md`](docs/TRD.md) is canonical, measured against the
live API. [`docs/source/gonkarouter-workshop-slides.md`](docs/source/gonkarouter-workshop-slides.md) is the organizers'
own account.

## How to work

**Proceed without asking** on anything you can name a sensible default for: picking a library, file layout, naming or
approach; installing a dependency; refactoring your own code mid-task; writing tests, docs or types you judge necessary;
fixing a bug in code you are already touching. If two approaches are close, pick one and say which. **A reversible
decision made now beats a correct decision made after a ten minute conversation.**

**Stop and ask only for these six.** If it is not on this list, proceed:

1. **A track requirement is at risk.** Routing inference off GonkaRouter, dropping to one model, or losing the Request
   ID trail
1. **The change would break something already working**, and you cannot avoid it
1. **`bun run lint` or `bun run typecheck` fails and you cannot fix it.** Say what fails and what you tried
1. **Two pieces of work genuinely conflict** and shipping both is impossible
1. **A credential or external account is missing** and you cannot proceed
1. **The work would change the demo** in a way the team has not agreed to

**The bar for shipping.** Work is ready when the checks pass and it does what was asked. It need not be complete,
elegant or final. **Partial work that runs beats finished work still sitting on a branch on 5 September.** If you are
behind, cut scope, not the quality of what ships. **Demo-first:** if it will not appear in the 2-minute video or the
5-minute pitch, it is not a priority.

## The gate before implementation

**No implementation starts until `docs/` holds all three.** Cheap to write, expensive to skip: without them the first
days produce code nobody agreed to, and the deck's required sections get invented at the end from whatever got built.

| File              | Answers                                                                         | Owns                                              |
| ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `docs/PRODUCT.md` | **Who and why.** The user, their problem, the demo moment, the scope ladder     | The spine. Everything downstream cites it         |
| `docs/PRD.md`     | **What.** Requirements, user stories, acceptance criteria, what is out of scope | Scope. What `hackathon-scope-cutter` cuts against |
| `docs/TRD.md`     | **How.** Architecture, API contracts, data models, schemas, decision rationale  | Technical truth. Canonical over this file         |

`docs/DESIGN.md` joins them when frontend work starts, and owns the design system: palette, type pairing, radius and
border treatment, spacing scale.

**The gate is binary.** If the three are not all present, the answer to "can I start building" is no. Say so, and write
the missing one. The deck's five required sections map onto these, so writing them now is writing the deck early.

## How to report

If reading your message takes longer than doing the thing, you have cost time.

- **Lead with what happened.** First sentence answers "what is the state of things now?" No preamble, no restating the
  request
- **Three to five sentences** for a normal update. Longer only when something broke and the detail is needed
- **Say what a human should do, or say nothing is needed.** Never leave someone guessing whether they are blocked
- **No status theatre.** Do not narrate steps, list what you rejected, or summarise what you already said
- **When something breaks, give the error verbatim.** Paste the trace, then say in one plain sentence what it means
- **No jargon without a plain-language gloss.** Use the real term once with the plain version attached

## Tech stack and commands

| Tool                                 | Role                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------- |
| **Bun**                              | Package manager and script runner                                         |
| **Biome**                            | Lint and format for JS, TS, JSON, CSS, HTML                               |
| **Prettier**                         | Format for Markdown and YAML, the two Biome does not cover                |
| **TypeScript**                       | `tsc --noEmit`; strict, `noUncheckedIndexedAccess`                        |
| **commitlint + husky + lint-staged** | Conventional Commits on `commit-msg`; staged files linted on `pre-commit` |
| **GonkaRouter**                      | The only permitted inference path                                         |

```bash
bun install          # dev tooling; also wires husky hooks
bun run test:guard   # regression tests for merge and main-branch enforcement
bun run lint         # biome check . && prettier --check .
bun run format       # biome format --write . && prettier --write .
bun run typecheck    # tsc --noEmit, once src/ exists
```

**Application framework, database and hosting are not chosen yet.** They get chosen and justified in
[`docs/TRD.md`](docs/TRD.md); this table is an inventory of what is installed. There is no Python stack. **Prettier owns
Markdown and YAML, Biome owns everything else**, split by file extension rather than an ignore file. `.prettierrc.json`
mirrors every formatter setting `biome.json` states, so both wrap at 120 and neither can undo the other.
`embeddedLanguageFormatting` is off, so fenced code samples are never rewritten.

`rtk` and `graphify`, both optional and per-machine, are documented in [`docs/agent-tooling.md`](docs/agent-tooling.md).
The layout tree lives in [`docs/README.md`](docs/README.md#repository-layout), because a reviewer must read it without
opening this file. Source layout is not decided; add it there when it is.

## CLI first, always

Reach for a CLI before a dashboard: `gh` for GitHub, `bun` for Node. Clicking through a dashboard leaves no trace,
cannot be handed to a teammate, and cannot be repeated tomorrow.

**If the CLI is missing, say so immediately and give the install command.** Do not route a human through the web UI as a
workaround.

**If no CLI exists, drive the browser yourself.** Pick by whether the task needs a logged-in session:

- **Behind a login** — Devfolio, the GonkaRouter dashboard, OAuth: `claude-in-chrome`. Read its `SKILL.md` first; it
  carries banned actions
- **Our own deployed app** — smoke tests, screenshots, checking a render: Playwright, headless. Scriptable, needs no
  human

Headless Chromium cannot see the desktop browser's cookies, which is the whole reason that split exists.

**Never type a password, card number or API key into a form** for someone, and never accept terms or submit a form on
their behalf. Read the screen, do the navigation, hand back the one action that is theirs. **Screenshot what you did.**

## Code style

- **Biome is authoritative:** single quotes, no semicolons, no trailing commas, 120-char lines, 2-space indent. Do not
  hand-format against it
- **Types:** no `any`; prefer `unknown` plus narrowing. Validate at system boundaries
- **Error handling:** validate at boundaries; do not wrap internal framework calls in try/catch
- **Comments:** default to none. Comment only when the _why_ is non-obvious. Never describe _what_ the code does
- **Changes are surgical.** See [guideline 3](docs/coding-guidelines.md#3-surgical-changes)

## Documentation hygiene

**[`docs/markdown-style.md`](docs/markdown-style.md) is the style guide for every Markdown file in this repo.** It
covers document layout, headings, lists, code blocks, links, images and tables. Read it before restructuring a document.
The rules below are this project's additions to it, not a replacement.

- **Sentence case for headings, bold lead-in labels and table headers**, per the style guide. Acronyms and proper names
  keep their form: AI, API, PR, MUBA, Gonka, Kimi, Biome, Devfolio
- **Forward-looking only.** Apply this to what you write or touch. Do not sweep existing docs to conform
- **Never change a quotation.** In [`docs/source/`](docs/source/) the structure and our own framing follow the style
  guide, but an organizer's words are reproduced exactly. A reworded quote is a wrong quote
- **Do not reformat installed skills.** `.agents/skills/` and `.claude/skills/` carry vendored upstream content
- **No clumped prose.** No block over four lines. Three or more consecutive bolded-lead-in paragraphs are a list. An
  enumeration of three or more items inside a sentence is a list
- **A table must earn itself.** Use one for uniform data across two dimensions. A two-column table of labels and prose
  is a list; so is a one-column table
- **Never drop a measured figure, a citation, a section reference or a limitation** to save space. Reformatting must be
  lossless
- **Never create a second file overlapping an existing one.** Update the existing file

### README versus TRD

Both may describe architecture. They differ in **depth and audience**, not subject.

|              | `docs/README.md`                                                 | `docs/TRD.md`                                  |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------- |
| **Audience** | Judges, external reviewers, anyone landing on the repo           | Developers implementing against it             |
| **Depth**    | High-level narrative: the whats, hows and whys                   | Canonical implementation-level reference       |
| **Contains** | Architecture overview, diagrams, setup, constraints, limitations | API contracts, data models, schemas, rationale |
| **Rule**     | Anything an outside reader needs must live here                  | Never duplicate the README. Go deeper instead  |

"It is in the TRD" is a valid answer for implementation detail, **not** for anything a reviewer needs. **A judge reads
the README.** The track brief asks for "clean code with clear documentation on the GonkaRouter integration", and that is
where they look. It lives in `docs/`, not the repo root, and GitHub renders it as the landing page, so keep links
relative to `docs/`.

## Design standards

Anything a judge can see is held to a professional standard: the demo UI, the README, the deck. **UX and design is 10
points and presentation and clarity is 20**, a fifth of the score, and Demo Day is humans watching a pitch on a
projector.

The bar: **the work must not look generated.** A competent but templated screen has failed the task, not partly done it.
The tells to avoid:

- Warm cream ground, serif display face, terracotta accent
- Near black with a single acid green or vermilion pop
- A purple to blue gradient hero on white
- Inter or Space Grotesk as the safe default
- Everything centre aligned
- One large corner radius on every surface
- A coloured rail down the side of a rounded card
- Numbered markers on content that is not a sequence
- Three items in every list because three feels balanced
- Glassmorphism with no reason for depth
- A dark dashboard with neon chart lines and no data behind them

**Structure must mean something.** If a design uses numbering, an eyebrow, a divider or a state chip, that device has to
carry real information. A numbered list of unordered things is a lie told in layout.

**UI text has its own capitalization rule, separate from the docs.** TitleCase for nav items, buttons, section headings,
card titles, table headers, tab labels, menu items, modal titles and form labels. Sentence case for body copy, helper
text, placeholders, tooltips, errors, empty states and toasts. `Save Changes`, but
`We could not reach the model, try again in a moment.` The sentence-case rule in
[Documentation hygiene](#documentation-hygiene) governs Markdown files, not product chrome.

**Claude Code cannot generate images.** Delegate to Codex, which needs no API key:

```bash
codex exec --skip-git-repo-check "<prompt>. Use your image generation tool. Save to /absolute/path/<name>.png"
```

Give it an absolute path, and resize before anything lands in the repo. Use the `brandkit` skill for art direction
rather than hand-writing a prompt.

**Nothing visual is done until all four are true.** State them when you report:

1. `impeccable critique` has run and its findings are addressed or consciously declined
1. The `design-taste-frontend` pre-flight check passes
1. The screen has been viewed at demo scale, not just in a wide editor pane
1. Capitalization has been checked against rendered text, not source

## How work ships

**`main` is PR-gated. No stray commits.** `.claude/hooks/guard-git.sh` enforces it.

1. **Branch.** `<type>/<short-slug>`, matching the commit types below
1. **Commit** in [Conventional Commits](https://www.conventionalcommits.org/) form: `<type>[scope]: <description>`, a
   single imperative sentence, lowercase, no trailing period. Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`,
   `chore`, `style`, `perf`
1. **Push the branch** and open a PR with `gh pr create`
1. **Merge** the verified head with
   `gh pr merge <number> --squash --delete-branch --match-head-commit <40-character-head-sha>`. Capture `headRefOid`
   from `gh pr view`, verify and review that exact SHA, then put its literal value in the merge command. Agents are
   authorised to merge without per-PR human approval when all of these are true:
   - The PR targets `main`, is not a draft and GitHub reports it mergeable
   - Every required GitHub check passes
   - Fresh project verification passes against the PR head
   - There is no unresolved Critical or Important review finding and no known regression

If any condition cannot be verified, leave the PR open and report the blocker. Direct and force pushes to `main` remain
forbidden; autonomous merge authority does not bypass the PR gate. Never use `--admin` or `--auto` to override or defer
the gate.

Within this repository, this rule overrides any generic skill that presents integration as a human-choice menu. Once the
requested work is ready and the gate passes, merge it without asking again unless the user explicitly asks to leave the
PR open or in draft.

Small fixes still go through a branch. The overhead is one command; the alternative is a `main` nobody can review or
revert cleanly.

**TODOs live in GitHub Issues**, not a markdown checklist, a `docs/plan.md`, or a code comment. A checklist in a file
goes stale, conflicts on merge, and is invisible to anyone not in that file. Reference the issue in the PR so merging
closes it: `Closes #12`. A short-lived, in-session task list is fine; anything that outlives the session is not.

```bash
gh issue list                          # what is open
gh issue create -t "..." -b "..."      # add one
gh issue close <n>                     # done
```

## Critical do-nots

- **Do not** call an AI provider directly. Everything goes through GonkaRouter, with the single documented transcription
  exception in `src/server/transcribe/`. Widening that directory, or adding a second one, is a track requirement
  decision and not a refactor
- **Do not** import or adapt code written before 26 Aug 2026
- **Do not** commit `.env` or any `sk-…` key. `.env.example` carries key names, never values
- **Do not** commit directly to `main`, force-push, rewrite published history, or delete a branch other than a merged
  feature branch
- **Do not** merge a draft, conflicted, failing or known-breaking PR. Leave it open and report the blocker
- **Do not** track TODOs in a markdown file
- **Do not** hardcode model ids without verifying them against `/v1/models`. They are case- and slash-sensitive
- **Do not** create `docs/architecture.md` or a second README
- **Do not** start implementation before `PRODUCT.md`, `PRD.md` and `TRD.md` all exist
- **Do not** change a quotation in [`docs/source/`](docs/source/). Corrections go in `docs/brief.md`
- **Do not** commit a path that only exists on your machine. `~/CS/...`, `/home/<you>/...`, `C:\Users\...`,
  `\\wsl.localhost\...` and scratch dirs under `/tmp` are invisible to everyone else. Name the tool, not your copy of
  it. Machine-independent locations like `~/.claude/` are fine
- **Do not** edit `docs/demo/` outside the `pitch-smith` subagent. It owns those files
- **Do not** burn GonkaRouter tokens on idle experimentation
- **Do not** miss the Devfolio submission. No submission means no pitching

## Skills, subagents and hooks

**37 skills are committed** and all are optional: invoke one when the task matches, not as a checkpoint before every
action. Your tool already lists them with descriptions, so the inventory is not repeated here. Provenance, what was
retargeted, what was deliberately not taken, and what each hook does:
[`.agents/skills/VENDORED.md`](.agents/skills/VENDORED.md).

Three things the listing does not tell you:

- **`brainstorming` is not the ideation skill.** It shapes a build once a concept is locked. The eight business skills
  are what concept selection runs on
- **Taste sets the target, `impeccable` hits it.** Do not start with `impeccable`
- **The `hackathon-*` skills were retargeted.** Their bodies still name a different event's rules. The `> ## This Event`
  block at the top of each wins

**One subagent.** `pitch-smith` owns `docs/demo/` — the pitch script, the deck, the PDF and the 2-minute video script,
and nothing else. Dispatch it once the build is frozen, or earlier to draft against what already works.

**Four hooks** are wired in `.claude/settings.json`, each exiting 0 on internal failure so a broken guard never wedges a
session. Only one can stop you: `guard-git.sh` blocks unreviewed pushes to `main` and `git add .env`. The other three
are informational.

## Appendix: standing references

Moved out of this file so they are not reloaded into every session. **The sections above outrank them wherever they
disagree.**

| Reference                               | Lives in                                                                             | Applies                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Markdown style guide**                | [`docs/markdown-style.md`](docs/markdown-style.md)                                   | Every Markdown file in the repo                                                         |
| **Coding guidelines (Andrej Karpathy)** | [`docs/coding-guidelines.md`](docs/coding-guidelines.md)                             | Always. Guideline 1 is overridden by **How to work** above; the file says so at the top |
| **RTK (Rust Token Killer)**             | [`docs/agent-tooling.md`](docs/agent-tooling.md#rtk-the-rust-token-killer)           | Only if `which rtk` finds it                                                            |
| **Graphify**                            | [`docs/agent-tooling.md`](docs/agent-tooling.md#graphify-a-codebase-knowledge-graph) | Only if `which graphify` finds it, and only once there is real code                     |

Two rules from them that change behaviour even if you never open them:

- **Changes are surgical.** Every changed line traces to what was asked. Do not refactor, reformat or improve adjacent
  code you were not sent to touch
- **`rtk` does not defeat the git guard, but it does defeat the deny list.** The hook matches the command substring, so
  `rtk git push origin main` is blocked. The `permissions.deny` entries are prefix-matched and are not. That is why both
  exist
