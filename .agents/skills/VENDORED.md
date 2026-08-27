# Agent Skills

`.agents/skills/` is the canonical, tool-agnostic skill directory. `.claude/skills/`
symlinks into it.

**One exception:** `impeccable` lives in `.claude/skills/` as a **real directory**,
not a symlink, because `.claude/settings.json` wires a hook to a script path
inside it (`scripts/hook.mjs`).

Everything here is **optional**. Invoke a skill when the task matches it.

**37 skills total.** 36 live in `.agents/skills/` - 7 hackathon, 8 business/strategy,
14 superpowers, 3 taste, 4 utility - plus `impeccable` in `.claude/skills/`.

---

## Retargeted From A Prior Hackathon

| Skill | Use For |
| ----- | ------- |
| `hackathon-idea-generator` | Concept exploration before anything locks |
| `hackathon-idea-scoring` | Ranking candidates against the rubric |
| `hackathon-scope-cutter` | Cutting scope when behind |
| `hackathon-wow-detector` | Finding the demo moment |
| `hackathon-demo-script` | The 2-minute video and the 5-minute pitch |
| `hackathon-judge-simulator` | Adversarial dry-run before submission |
| `hackathon-shared-resources` | Reference library the others load from |

**Retargeted** matters here. These came from a **Qwen Brainrot Hackathon** repo and
hardcoded that event: a Creativity 50 / Presentation 30 / Qwen Integration 20 rubric,
a 2-hour on-site rebuild, a 1080x1080 poster, community voting. **All of it is wrong
for MUBA.** Each skill's frontmatter was rewritten and a `> ## This Event` block
added at the top of the body with our real constraints, which wins wherever the
body below still names the old rules. The generic method underneath is unchanged.

Residual references to Qwen, posters or a 2-hour rebuild survive inside
`hackathon-shared-resources/knowledge/` and `playbooks/`. They were left alone
because the surrounding advice is generic; the `This Event` block is the override.

---

## Business And Strategy

Vendored from [TolongLabs/agentic-ai-hackathon](https://github.com/TolongLabs/agentic-ai-hackathon).
These, not `brainstorming`, are what concept selection actually runs on.

| Skill | Use For |
| ----- | ------- |
| `startup-validator` | Viability read on a concept: demand, fit, positioning |
| `competitor-analysis` | Who already does this, directly and indirectly |
| `strategy-red-team` | Attacking a concept's load-bearing assumptions before a judge does |
| `value-proposition` | Why anyone switches, in JTBD terms |
| `jobs-to-be-done` | The job a user is actually hiring a solution for |
| `beachhead-segment` | Cutting to one segment. The cure for a broad idea |
| `lean-canvas` | The whole business on one page |
| `market-sizing` | A defensible number for the pitch |

> **`brainstorming` is not the ideation skill.** It is "Brainstorming Ideas Into
> Designs" - an architecture skill whose output is a design doc. Right tool once a
> concept is locked and someone has to shape the build; wrong tool for deciding
> whether the thing is worth building.

The deck's required **Problem Statement**, **Motivation and Challenges** and
**Commercialisation and Business Model** sections map onto these directly.

---

## Taste

`npx skills add Leonxlnx/taste-skill --all` pulls 13. We took 3.

| Skill | Use For |
| ----- | ------- |
| `design-taste-frontend` | Frontend that does not look templated. **The taste tool** |
| `high-end-visual-design` | Visual polish on a UI that already works |
| `image-to-code` | Turning a design image into markup |

The other ten (brandkit, imagegen-\*, minimalist-ui, industrial-brutalist-ui,
stitch-design-taste, redesign-existing-projects, gpt-taste,
full-output-enforcement, design-taste-frontend-v1) were left out. They are not
wrong, but a long skill list makes an agent pick worse. Re-add any of them the
same way if needed.

### Order Of Operations

**Do not start with `impeccable`.** Taste sets the target, `impeccable` hits it.

1. Run brief inference from `design-taste-frontend`, state the one-line Design Read.
2. Check what already exists. The design system is recorded, not reinvented per screen.
3. Execute with `impeccable` (`craft`, then `layout` / `typeset` / `colorize`).
4. Audit with `impeccable critique` **plus** the `design-taste-frontend` pre-flight. Both.
5. Adjust with `polish` / `bolder` / `quieter` for a **named** problem, not another lap.

UX & Design is 10 points and Presentation & Clarity is 20. The interface is a
fifth of the score.

---

## Utility

| Skill | Use For |
| ----- | ------- |
| `diagnose` | A bug that resisted the first fix. Reproduce, minimise, instrument |
| `handoff` | Compacting context for another agent or session |
| `graphify` | Architecture questions once there is enough code to graph |
| `claude-in-chrome` | Driving the real Windows browser. Read before any browser tool call |

`claude-in-chrome` is transcribed from the version Claude Code ships **inside its
binary** - there was nothing on disk to symlink. It can drift as Claude Code
updates; the built-in wins on mechanics if they ever disagree.

`graphify` needs the `graphify` binary installed globally. It is a thin pointer
otherwise.

---

## Superpowers (14)

`npx skills add obra/superpowers`. Process skills that set an approach before
implementation skills carry it out.

| Skill | Use For |
| ----- | ------- |
| `verification-before-completion` | Before claiming anything is done. Evidence before assertions |
| `using-git-worktrees` | Isolating parallel work. Two agents in one tree collide |
| `systematic-debugging` | A bug that resisted the first fix. Overlaps `diagnose`; pick one, not both |
| `brainstorming` | Shaping a build once the concept is locked. **Not** concept selection |
| `writing-plans` / `executing-plans` | A multi-step task worth writing down first |
| `dispatching-parallel-agents` | Two or more genuinely independent tasks |
| `subagent-driven-development` | Running an implementation plan through subagents in one session |
| `test-driven-development` | A bugfix where the test is the specification |
| `requesting-code-review` / `receiving-code-review` | Review passes on a diff |
| `finishing-a-development-branch` | Wrapping a branch up |
| `writing-skills` | Authoring a new skill |
| `using-superpowers` | The meta-skill. **Its central rule is not in force here** |

### Where Superpowers Disagrees With This Repo

`using-superpowers` says to invoke a relevant skill **before any response, including
clarifying questions**, and `brainstorming` opens with "You MUST use this before any
creative work". Both are gates.

**Availability beats mandate here.** Ten days is not long. Reach for a skill when
the task genuinely calls for it, not as a checkpoint before every action.

Two exceptions where the superpowers framing is right and should be followed:

- **`verification-before-completion`.** Never claim something works without having
  run it and read the output. Shipping fast does not mean claiming falsely.
- **`using-git-worktrees`.** Two agents editing one working tree collide. This is
  not hypothetical - it happened in the source repo on 2026-08-22, when a
  `git add -A` in one session swept another session's in-progress files into an
  unrelated commit.

`docs/superpowers/research/` is named for these skills. The name is a convention,
not an obligation to use them for every file that lands there.

---

## In `.claude/skills/` Only

| Skill | Why |
| ----- | --- |
| `impeccable` | Ships a detector hook. `.claude/settings.json` points at `.claude/skills/impeccable/scripts/hook.mjs`, so it must be a real directory at that path, not a symlink |

---

## Deliberately Not Taken

**GSD (67 skills).** Thin pointers into a global `~/.claude/get-shit-done/` runtime
(`npx get-shit-done-cc`). Skipped for two reasons: 67 entries is the single biggest
degrader of skill selection, and they do nothing without the runtime installed
anyway. Already available globally if a task turns out to need real phase planning.

**The remaining ten taste-skill packages.** See the Taste section.

---

## Hooks

`.claude/hooks/` carries four guards. All four are wired, and each exits 0 on any
internal failure so a broken guard can never wedge a session.

| Hook | Event | Does |
| ---- | ----- | ---- |
| `session-brief.sh` | SessionStart | Prints branch, uncommitted count, days to deadline |
| `env-drift.mjs` | SessionStart | Reports a local `.env` disagreeing with `.env.example`. Names keys, never values |
| `guard-git.sh` | PreToolUse(Bash) | Blocks direct/force push to `main` and `git add .env`. The only one that can stop you |
| `format-edited.sh` | PostToolUse(Edit) | Biome-formats edited JS/TS. Silent, never blocks |

A fifth hook shipped with the vendored set and has been **removed**:
`no-em-dash-or-emoji.mjs`, which refused any edit introducing an em dash or an
emoji. The source repo runs plain-ASCII house style. This repo does not: every
document in `docs/` uses em dashes as deliberate formatting, the event brief leans
on emoji as scan markers, and `AGENTS.md` itself never states such a rule. Keeping
an unenforced guard for a style nobody follows was the worst of both. Recover it
from git history if the house style is ever adopted for real.

**The impeccable `Stop` hook is also deliberately absent.** `.claude/settings.json`
wires impeccable's detector on `PostToolUse(Edit|Write|MultiEdit)`, where it
self-filters to UI files. The `Stop` entry ran a whole-session design pass on every
turn end, including sessions that touched no UI at all. Restore it when frontend
work starts:

```json
"Stop": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "[ ! -f \"${CLAUDE_PROJECT_DIR}/.claude/skills/impeccable/scripts/hook.mjs\" ] || node \"${CLAUDE_PROJECT_DIR}/.claude/skills/impeccable/scripts/hook.mjs\"",
        "timeout": 30,
        "statusMessage": "Design deep pass"
      }
    ]
  }
]
```

