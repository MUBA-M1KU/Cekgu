# Vendored agent skills

`.agents/skills/` is the canonical, tool-agnostic skill directory; `.claude/skills/` symlinks into it. This file records
where each skill came from, what was changed on the way in, and what was deliberately left out.

**37 skills.** 36 in `.agents/skills/` — 7 hackathon, 8 business, 14 superpowers, 3 taste, 4 utility — plus
`impeccable`. All are optional: invoke one when the task matches, not as a checkpoint before every action.

**`impeccable` is the one exception** to the symlink layout. It lives in `.claude/skills/` as a real directory, because
`.claude/settings.json` wires a hook to `scripts/hook.mjs` inside it.

Contents:

1. [Where the skills came from](#where-the-skills-came-from)
1. [Skills that cannot be reinstalled](#skills-that-cannot-be-reinstalled)
1. [Installing and updating](#installing-and-updating)
1. [Choosing between them](#choosing-between-them)
1. [Where superpowers disagrees with this repo](#where-superpowers-disagrees-with-this-repo)
1. [Deliberately not taken](#deliberately-not-taken)
1. [Permissions](#permissions)
1. [Hooks](#hooks)

## Where the skills came from

29 are tracked in `skills-lock.json`. The other 8 have no reachable source.

| Source                             | Skills                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [obra/superpowers]                 | The 14 superpowers                                                                                                   |
| [Leonxlnx/taste-skill]             | `design-taste-frontend`, `high-end-visual-design`, `image-to-code`                                                   |
| [phuryn/pm-skills]                 | `competitor-analysis`, `strategy-red-team`, `beachhead-segment`, `lean-canvas`, `market-sizing`, `value-proposition` |
| [ailabs-393/ai-labs-claude-skills] | `startup-validator`                                                                                                  |
| [owl-listener/designer-skills]     | `jobs-to-be-done`                                                                                                    |
| [graphify-labs/graphify]           | `graphify`                                                                                                           |
| [mattpocock/skills]                | `handoff`, `diagnosing-bugs`                                                                                         |
| [pbakaus/impeccable]               | `impeccable`                                                                                                         |

[obra/superpowers]: https://github.com/obra/superpowers
[Leonxlnx/taste-skill]: https://github.com/Leonxlnx/taste-skill
[phuryn/pm-skills]: https://github.com/phuryn/pm-skills
[ailabs-393/ai-labs-claude-skills]: https://github.com/ailabs-393/ai-labs-claude-skills
[owl-listener/designer-skills]: https://github.com/owl-listener/designer-skills
[graphify-labs/graphify]: https://github.com/graphify-labs/graphify
[mattpocock/skills]: https://github.com/mattpocock/skills
[pbakaus/impeccable]: https://github.com/pbakaus/impeccable

Sources were identified by **content diff**, not by name: `jobs-to-be-done` had three same-named registry candidates at
1.3%, 1.0% and 99.9% similarity.

`diagnose` was renamed to **`diagnosing-bugs`**, its upstream name, on reinstall. At 73% it is the weakest match of the
set: a best guess, not a confirmed one.

## Skills that cannot be reinstalled

> **The seven `hackathon-*` skills cannot be reinstalled, and these copies are the only ones that exist.** Their source,
> `bernieweb3/hackathon-ai-devkit`, 404s. skills.sh still indexes it but stores only an index and clones from GitHub for
> content, so `skills add` and `skills use` both fail. Recover from git history if they are ever deleted.

They are deliberately kept out of `skills-lock.json`: a lock entry would invite `skills update` to overwrite the
retargeting below.

**Retargeting matters here.** These came from a **Qwen Brainrot Hackathon** repo that hardcoded a Creativity 50 /
Presentation 30 / Qwen Integration 20 rubric, a 2-hour on-site rebuild, a 1080x1080 poster and community voting. **All
of it is wrong for MUBA.** Each skill's frontmatter was rewritten and a `> ## This Event` block added with our real
constraints, which **wins wherever the body below still names the old rules**. The generic method underneath is
unchanged. Residual Qwen references survive inside `hackathon-shared-resources/knowledge/` and `playbooks/`; the
`This Event` block is the override.

`claude-in-chrome` is the eighth. It was transcribed from the version Claude Code ships **inside its binary**, so there
is nothing to install from. It can drift as Claude Code updates; the built-in wins on mechanics.

## Installing and updating

```bash
bunx skills add <owner/repo> -a claude-code -s <skill> -s <skill> -y
```

Four things the CLI does that this layout does not want:

- **`-s a,b,c` silently matches nothing.** Pass **one `-s` per skill**. A comma list fails with "No matching skills
  found".
- **It installs to `.claude/skills/<name>/` as a real directory.** Move it to `.agents/skills/<name>/`, then
  `ln -s ../../.agents/skills/<name> .claude/skills/<name>`.
- **Without `-s` it installs every skill in the repo.** Always pass `-s`. `phuryn/pm-skills` carries 68,
  `owl-listener/designer-skills` over 100. A long skill list makes an agent pick worse.
- **`-a universal` writes the gitignored `/agent/` tree.** Never use it. `-a claude-code` only.

`impeccable` is the exception to the relocation: it stays a real directory, because that is where its hook path points.

**After any install**, confirm every `.claude/skills/*` entry resolves, `.claude/skills/impeccable/scripts/hook.mjs`
still exists, and the seven `hackathon-*` skills still carry their `> ## This Event` block.

## Choosing between them

| Skill                                                           | Use for                                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `hackathon-idea-generator` / `-idea-scoring`                    | Concept exploration, then ranking against the rubric                       |
| `hackathon-scope-cutter` / `-wow-detector`                      | Cutting scope when behind; finding the demo moment                         |
| `hackathon-demo-script` / `-judge-simulator`                    | The video and pitch; the adversarial dry run                               |
| `hackathon-shared-resources`                                    | Reference library the other six load from                                  |
| `startup-validator`, `competitor-analysis`, `strategy-red-team` | Is the concept worth building, and who already does it                     |
| `value-proposition`, `jobs-to-be-done`, `beachhead-segment`     | Why anyone switches, and to whom we sell first                             |
| `lean-canvas`, `market-sizing`                                  | The business on one page, and a defensible number                          |
| `design-taste-frontend`                                         | Frontend that does not look templated. **The taste tool**                  |
| `high-end-visual-design` / `image-to-code`                      | Polish on a working UI; a design image into markup                         |
| `diagnosing-bugs` / `handoff` / `graphify`                      | A bug that resisted the first fix; context handoff; architecture questions |
| `claude-in-chrome`                                              | The real browser. Read it before any browser tool call                     |

The eight business skills, **not `brainstorming`**, are what concept selection runs on. `brainstorming` is an
architecture skill whose output is a design doc: right once a concept is locked, wrong for deciding whether to build it.

The deck's required **Problem Statement**, **Motivation and Challenges** and **Commercialisation and Business Model**
sections map onto the business skills directly.

### Taste sets the target, impeccable hits it

**Do not start with `impeccable`.**

1. Brief inference from `design-taste-frontend`; state the one-line Design Read
1. Check what exists. The design system is recorded, not reinvented per screen
1. Execute with `impeccable` (`craft`, then `layout` / `typeset` / `colorize`)
1. Audit with `impeccable critique` **and** the `design-taste-frontend` pre-flight
1. Adjust with `polish` / `bolder` / `quieter` for a **named** problem

## Where superpowers disagrees with this repo

`using-superpowers` says to invoke a relevant skill **before any response, including clarifying questions**, and
`brainstorming` opens with "You MUST use this before any creative work". Both are gates. **Availability beats mandate
here** — reach for a skill when the task calls for it.

Two exceptions where the superpowers framing is right:

- **`verification-before-completion`.** Never claim something works without having run it and read the output. Shipping
  fast is not claiming falsely.
- **`using-git-worktrees`.** Two agents in one working tree collide. Not hypothetical: it happened in the source repo on
  2026-08-22, when `git add -A` in one session swept another's in-progress files into an unrelated commit.

`systematic-debugging` overlaps `diagnosing-bugs`. Pick one, not both.

## Deliberately not taken

**GSD (67 skills).** Thin pointers into a global `~/.claude/get-shit-done/` runtime. 67 entries is the single biggest
degrader of skill selection, and they do nothing without the runtime. Already available globally if a task needs phase
planning.

**Ten of the 13 taste-skill packages** — brandkit, imagegen-\*, minimalist-ui, industrial-brutalist-ui,
stitch-design-taste, redesign-existing-projects, gpt-taste, full-output-enforcement, design-taste-frontend-v1. Not
wrong, but a long list makes an agent pick worse. Re-add any the same way.

## Permissions

`.claude/settings.json` is **strict JSON**: a `//` comment or trailing comma is a syntax error, so the reasoning lives
here instead. It previously lived in a top-level `description` key, which is not in the schema.

The posture is deliberately broad so the harness does not stop to ask during the build sprint. What stays denied is the
short list a human should own: merging a PR, deleting the repo, rewriting published history, `git reset --hard`, and
`rm -rf /`.

Three rules that are easy to get wrong:

- **Use `Edit(./**)`, never `Write(./**)`.** Claude Code consults path rules only for `Read` and `Edit`. A `Write`,
  `NotebookEdit`, `Glob` or `MultiEdit` path rule is accepted, never checked, and warns at startup. An `Edit` rule
  already covers Write.
- **Use `Read(./.env)` plus `Read(./.env.*)`.** That is the documented pattern, and a `Read` deny also blocks Edit and
  Write on the same path.
- **The deny entry for a forced push is prefix-matched**, so prefixing the same command with `rtk` slips past it.
  `guard-git.sh` is what actually stops that, which is why both exist.

**A deny rule cannot carry exceptions.** `Read(./.env.*)` therefore also blocks the committed `.env.example`, which no
agent can edit. That is the cost of the documented pattern; narrowing it to the real env filenames is the only way out,
and it trades a little safety for the convenience.

## Hooks

Four guards in `.claude/settings.json`, each exiting 0 on any internal failure so a broken guard can never wedge a
session.

| Hook               | Event             | Does                                                                                      |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------- |
| `session-brief.sh` | SessionStart      | Branch, uncommitted count, days to deadline                                               |
| `env-drift.mjs`    | SessionStart      | Reports a local `.env` disagreeing with `.env.example`. Names keys, never values          |
| `guard-git.sh`     | PreToolUse(Bash)  | Blocks unreviewed pushes to `main` and `git add .env`. **The only one that can stop you** |
| `format-edited.sh` | PostToolUse(Edit) | Formats edited files with Biome or Prettier. Silent, never blocks                         |

`guard-git.sh` matches on the command substring, so an `rtk`-prefixed command is caught too. It also false-positives on
any command whose _text_ contains those patterns, including writing this file: use the Write tool, not an inline
heredoc.

### Hooks that were removed

Both are recoverable from git history.

- **`no-em-dash-or-emoji.mjs`**, which refused any edit introducing an em dash or emoji. The source repo runs
  plain-ASCII house style; this repo does not, and `AGENTS.md` never stated such a rule. It was never wired.
- **The impeccable `Stop` hook**, a whole-session design pass on every turn end, including sessions touching no UI.
  Restore it when frontend work starts:

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
