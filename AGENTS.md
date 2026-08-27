# AGENTS.md

Canonical, tool-agnostic project instructions. Every agentic tool works from this
file; `CLAUDE.md` only points here. **Read [`docs/brief.md`](docs/brief.md) before
acting** - deadlines, rules and the judging rubric.

---

## Project

**MUBA Blockchain Hackathon 2026**, track **GonkaRouter - AI for Society**.
Repo: `github.com/MUBA-M1KU/dev` (private).

**Submission deadline: 5 Sept 2026, 23:59 MYT**, on Devfolio. No submission means
disqualification from pitching. Every other event fact lives in
[`docs/brief.md`](docs/brief.md), which is the single source of truth for them;
organizer source material is in `docs/source/`.

---

## Track Requirements

Non-negotiable, from `docs/source/gonkarouter-challenge.md`:

1. **All AI reasoning runs through GonkaRouter** (`https://api.gonkarouter.io`). A direct OpenAI, Anthropic or Gemini call anywhere in the product path disqualifies the entry
2. **At least two models cross-verify.** Multi-model consensus
3. **Gonka Request IDs are surfaced in the UI** for every inference step. This is the on-chain proof: wire it through from the first commit, not at the end
4. **Explicit consensus logic** for model disagreement. The organizers call this "a major plus"

Gateway setup, model ids, client wiring and rate limits:
`docs/source/gonkarouter-tutorial.md`.

---

## How To Work

**Proceed without asking** on anything you can name a sensible default for:
picking a library, file layout, naming or approach; installing a dependency;
refactoring your own code mid-task; writing tests, docs or types you judge
necessary; fixing a bug in code you are already touching. If two approaches are
close, pick one and say which. **A reversible decision made now beats a correct
decision made after a ten minute conversation.**

**Stop and ask only for these six.** If it is not on this list, proceed:

1. **A track requirement is at risk.** Routing inference off GonkaRouter, dropping to one model, or losing the Request ID trail
2. **The change would break something already working**, and you cannot avoid it
3. **`bun run lint` or `bun run typecheck` fails and you cannot fix it.** Say what fails and what you tried
4. **Two pieces of work genuinely conflict** and shipping both is impossible
5. **A credential or external account is missing** and you cannot proceed
6. **The work would change the demo** in a way the team has not agreed to

**The bar for shipping.** Work is ready when the checks pass and it does what was
asked. It need not be complete, elegant or final. **Partial work that runs beats
finished work still sitting on a branch on 5 September.** If you are behind, cut
scope, not the quality of what ships. **Demo-first:** if it will not appear in the
2-minute video or the 5-minute pitch, it is not a priority.

---

## The Gate Before Implementation

**No implementation starts until `docs/` holds all three.** Cheap to write,
expensive to skip: without them the first days produce code nobody agreed to, and
the deck's required sections get invented at the end from whatever got built.

| File              | Answers                                                                        | Owns                                              |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| `docs/PRODUCT.md` | **Who and why.** The user, their problem, the demo moment, the scope ladder    | The spine. Everything downstream cites it         |
| `docs/PRD.md`     | **What.** Requirements, user stories, acceptance criteria, what is out of scope | Scope. What `hackathon-scope-cutter` cuts against |
| `docs/TRD.md`     | **How.** Architecture, API contracts, data models, schemas, decision rationale  | Technical truth. Canonical over this file         |

`docs/DESIGN.md` joins them when frontend work starts, and owns the design system:
palette, type pairing, radius and border treatment, spacing scale.

**The gate is binary.** If the three are not all present, the answer to "can I
start building" is no. Say so, and write the missing one. The deck's five required
sections map onto these, so writing them now is writing the deck early.

---

## How To Report

If reading your message takes longer than doing the thing, you have cost time.

- **Lead with what happened.** First sentence answers "what is the state of things now?" No preamble, no restating the request
- **Three to five sentences** for a normal update. Longer only when something broke and the detail is needed
- **Say what a human should do, or say nothing is needed.** Never leave someone guessing whether they are blocked
- **No status theatre.** Do not narrate steps, list what you rejected, or summarise what you already said
- **When something breaks, give the error verbatim.** Paste the trace, then say in one plain sentence what it means
- **No jargon without a plain-language gloss.** Use the real term once with the plain version attached

---

## Tech Stack And Commands

| Tool                                 | Role                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| **Bun**                              | Package manager and script runner                                        |
| **Biome**                            | Lint and format for JS, TS, JSON, CSS, HTML                              |
| **TypeScript**                       | `tsc --noEmit`; strict, `noUncheckedIndexedAccess`                       |
| **commitlint + husky + lint-staged** | Conventional Commits on `commit-msg`; staged files linted on `pre-commit` |
| **GonkaRouter**                      | The only permitted inference path                                        |

```bash
bun install          # dev tooling; also wires husky hooks
bun run lint         # biome check .
bun run format       # biome format --write .
bun run typecheck    # tsc --noEmit, once src/ exists
```

**Application framework, database and hosting are not chosen yet.** They get chosen
and justified in `docs/TRD.md`; this table is an inventory of what is installed.
There is no Python stack. **Markdown and YAML are formatted by nothing** since
Prettier was removed, so match the surrounding style by hand.

`rtk` and `graphify`, both optional and per-machine, are documented in
[`docs/agent-tooling.md`](docs/agent-tooling.md). The layout tree lives in
[`docs/README.md`](docs/README.md#layout), because a reviewer must read it without
opening this file. Source layout is not decided; add it there when it is.

---

## CLI First, Always

Reach for a CLI before a dashboard: `gh` for GitHub, `bun` for Node. Clicking
through a dashboard leaves no trace, cannot be handed to a teammate, and cannot be
repeated tomorrow.

**If the CLI is missing, say so immediately and give the install command.** Do not
route a human through the web UI as a workaround.

**If no CLI exists, drive the browser yourself.** Pick by whether the task needs a
logged-in session:

| Task                                                             | Tool                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Behind a login: Devfolio, the GonkaRouter dashboard, OAuth       | `claude-in-chrome`. Read its `SKILL.md` first; it carries banned actions |
| Our own deployed app: smoke tests, screenshots, checking a render | Playwright, headless. Scriptable, needs no human                        |

Headless Chromium cannot see the desktop browser's cookies, which is the whole
reason that split exists.

**Never type a password, card number or API key into a form** for someone, and
never accept terms or submit a form on their behalf. Read the screen, do the
navigation, hand back the one action that is theirs. **Screenshot what you did.**

---

## Code Style

- **Biome is authoritative:** single quotes, no semicolons, no trailing commas, 120-char lines, 2-space indent. Do not hand-format against it
- **Types:** no `any`; prefer `unknown` plus narrowing. Validate at system boundaries
- **Error handling:** validate at boundaries; do not wrap internal framework calls in try/catch
- **Comments:** default to none. Comment only when the *why* is non-obvious. Never describe *what* the code does
- **Changes are surgical.** See [guideline 3](docs/coding-guidelines.md#3-surgical-changes)

---

## Documentation Hygiene

- **TitleCase for every heading, subheading, bold lead-in label and table header.** Body prose, full sentences and commit subjects stay sentence case. Acronyms and proper names keep their form: AI, API, PR, MUBA, Gonka, Kimi
- **Forward-looking only.** Apply this to what you write or touch. Do not sweep existing docs to conform
- **Do not reformat received sources, transcripts or installed skills.** `docs/source/` is append-only and is the verbatim record
- **No clumped prose.** No block over four lines. Three or more consecutive bolded-lead-in paragraphs are a table. An enumeration of three or more items inside a sentence is a list
- **Never drop a measured figure, a citation, a section reference or a limitation** to save space. Reformatting must be lossless
- **Never create a second file overlapping an existing one.** Update the existing file

### README vs TRD

Both may describe architecture. They differ in **depth and audience**, not subject.

|              | `docs/README.md`                                                  | `docs/TRD.md`                                     |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| **Audience** | Judges, external reviewers, anyone landing on the repo            | Developers implementing against it                |
| **Depth**    | High-level narrative: the whats, hows and whys                    | Canonical implementation-level reference          |
| **Contains** | Architecture overview, diagrams, setup, constraints, limitations  | API contracts, data models, schemas, rationale    |
| **Rule**     | Anything an outside reader needs must live here                   | Never duplicate the README. Go deeper instead     |

"It is in the TRD" is a valid answer for implementation detail, **not** for
anything a reviewer needs. **A judge reads the README.** The track brief asks for
"clean code with clear documentation on the GonkaRouter integration", and that is
where they look. It lives in `docs/`, not the repo root, and GitHub renders it as
the landing page, so keep links relative to `docs/`.

---

## Design Standards

Anything a judge can see is held to a professional standard: the demo UI, the
README, the deck. **UX & Design is 10 points and Presentation & Clarity is 20**, a
fifth of the score, and Demo Day is humans watching a pitch on a projector.

The bar: **the work must not look generated.** A competent but templated screen has
failed the task, not partly done it. The tells to avoid:

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

**Structure must mean something.** If a design uses numbering, an eyebrow, a
divider or a state chip, that device has to carry real information. A numbered list
of unordered things is a lie told in layout.

**UI text follows Documentation Hygiene.** TitleCase for nav items, buttons,
section headings, card titles, table headers, tab labels, menu items, modal titles
and form labels. Sentence case for body copy, helper text, placeholders, tooltips,
errors, empty states and toasts. `Save Changes`, but `We could not reach the model,
try again in a moment.`

**Claude Code cannot generate images.** Delegate to Codex, which needs no API key:

```bash
codex exec --skip-git-repo-check "<prompt>. Use your image generation tool. Save to /absolute/path/<name>.png"
```

Give it an absolute path, and resize before anything lands in the repo. Use the
`brandkit` skill for art direction rather than hand-writing a prompt.

**Nothing visual is done until all four are true.** State them when you report:

1. `impeccable critique` has run and its findings are addressed or consciously declined
2. The `design-taste-frontend` pre-flight check passes
3. The screen has been viewed at demo scale, not just in a wide editor pane
4. TitleCase has been checked against rendered text, not source

---

## How Work Ships

**`main` is PR-gated. No stray commits.** `.claude/hooks/guard-git.sh` enforces it.

1. **Branch.** `<type>/<short-slug>`, matching the commit types below
2. **Commit** in [Conventional Commits](https://www.conventionalcommits.org/) form: `<type>[scope]: <description>`, a single imperative sentence, lowercase, no trailing period. Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`
3. **Push the branch** and open a PR with `gh pr create`
4. **A human merges** with `gh pr merge --squash --delete-branch`. Merging is denied to agents in `.claude/settings.json`

Small fixes still go through a branch. The overhead is one command; the alternative
is a `main` nobody can review or revert cleanly.

**TODOs live in GitHub Issues**, not a markdown checklist, a `docs/plan.md`, or a
code comment. A checklist in a file goes stale, conflicts on merge, and is
invisible to anyone not in that file. Reference the issue in the PR so merging
closes it: `Closes #12`. A short-lived, in-session task list is fine; anything that
outlives the session is not.

```bash
gh issue list                          # what is open
gh issue create -t "..." -b "..."      # add one
gh issue close <n>                     # done
```

---

## Critical Do-Nots

- **Do not** call an AI provider directly. Everything goes through GonkaRouter
- **Do not** import or adapt code written before 26 Aug 2026
- **Do not** commit `.env` or any `sk-…` key. `.env.example` carries key names, never values
- **Do not** commit directly to `main`, force-push, rewrite published history, or delete a branch other than a merged feature branch
- **Do not** merge your own PR. Propose it; a human merges
- **Do not** track TODOs in a markdown file
- **Do not** hardcode model ids without verifying them against `/v1/models`. They are case- and slash-sensitive
- **Do not** create `docs/architecture.md` or a second README
- **Do not** start implementation before `PRODUCT.md`, `PRD.md` and `TRD.md` all exist
- **Do not** rewrite `docs/source/`. It is the verbatim record
- **Do not** edit `docs/demo/` outside the `pitch-smith` subagent. It owns those files
- **Do not** burn GonkaRouter tokens on idle experimentation
- **Do not** miss the Devfolio submission. No submission means no pitching

---

## Skills, Subagents And Hooks

**37 skills are committed** and all are optional: invoke one when the task matches,
not as a checkpoint before every action. Your tool already lists them with
descriptions, so the inventory is not repeated here. Provenance, what was
retargeted, what was deliberately not taken, and what each hook does:
[`.agents/skills/VENDORED.md`](.agents/skills/VENDORED.md).

Three things the listing does not tell you:

- **`brainstorming` is not the ideation skill.** It shapes a build once a concept is locked. The eight business skills are what concept selection runs on
- **Taste sets the target, `impeccable` hits it.** Do not start with `impeccable`
- **The `hackathon-*` skills were retargeted.** Their bodies still name a different event's rules. The `> ## This Event` block at the top of each wins

**One subagent.** `pitch-smith` owns `docs/demo/` - the pitch script, the deck, the
PDF and the 2-minute video script, and nothing else. Dispatch it once the build is
frozen, or earlier to draft against what already works.

**Four hooks** are wired in `.claude/settings.json`, each exiting 0 on internal
failure so a broken guard never wedges a session. Only one can stop you:
`guard-git.sh` blocks a direct or force push to `main` and `git add .env`. The
other three are informational.

---

## Appendix: Standing References

Moved out of this file so they are not reloaded into every session. **The sections
above outrank them wherever they disagree.**

| Reference | Lives In | Applies |
| --------- | -------- | ------- |
| **Coding Guidelines (Andrej Karpathy)** | [`docs/coding-guidelines.md`](docs/coding-guidelines.md) | Always. Guideline 1 is overridden by **How To Work** above; the file says so at the top |
| **RTK (Rust Token Killer)** | [`docs/agent-tooling.md`](docs/agent-tooling.md#rtk-rust-token-killer) | Only if `which rtk` finds it |
| **Graphify** | [`docs/agent-tooling.md`](docs/agent-tooling.md#graphify-codebase-knowledge-graph) | Only if `which graphify` finds it, and only once there is real code |

Two rules from them that change behaviour even if you never open them:

- **Changes are surgical.** Every changed line traces to what was asked. Do not refactor, reformat or improve adjacent code you were not sent to touch
- **`rtk` does not defeat the git guard, but it does defeat the deny list.** The hook matches the command substring, so `rtk git push origin main` is blocked. The `permissions.deny` entries are prefix-matched and are not. That is why both exist
