# MUBA Blockchain Hackathon 2026 — GonkaRouter Track

Workspace for our entry to the **MUBA Blockchain Hackathon 2026**, competing in the
**GonkaRouter — AI for Society** track.

|                         |                                                      |
| ----------------------- | ---------------------------------------------------- |
| **Submission deadline** | 5 September 2026, 23:59 MYT (Devfolio)               |
| **Demo Day**            | 6 September 2026 — APU, physical attendance required |
| **Track prize**         | 1,200 USDT (1st) · 800 USDT (2nd)                    |
| **Status**              | 📋 Concept not locked — application stack not chosen |

---

## The One Rule That Governs Everything

> **All AI reasoning must run through GonkaRouter** (`https://api.gonkarouter.io`).
> A direct call to OpenAI, Anthropic or Gemini anywhere in the product path disqualifies the entry.

Plus: **≥2 models cross-verifying**, and **Gonka Request IDs surfaced in the UI** for every inference step.

---

## Start Here

| File                           | What's In It                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **[`brief.md`](brief.md)**     | The whole hackathon in one page — dates, rules, deliverables, judging, people |
| [`../AGENTS.md`](../AGENTS.md) | Project instructions for agentic tools (and humans)                           |

### Source Material From The Organizers

| File                                                                             | Source                                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`source/opening-ceremony-transcript.md`](source/opening-ceremony-transcript.md) | Opening ceremony, 26 Aug — Whisper transcript, cleaned & sectioned |
| [`source/gonkarouter-challenge.md`](source/gonkarouter-challenge.md)             | Official track challenge doc                                       |
| [`source/gonkarouter-tutorial.md`](source/gonkarouter-tutorial.md)               | GonkaRouter setup — API, models, client wiring, limits             |

---

## Getting Started

```bash
bun install                  # dev tooling + husky hooks
cp .env.example .env.local   # then paste your GonkaRouter sk-… key
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

| Command               | Does                               |
| --------------------- | ---------------------------------- |
| `bun run lint`        | Biome check                        |
| `bun run format`      | Biome + Prettier write             |
| `bun run typecheck`   | `tsc --noEmit`                     |
| `uv sync`             | Python deps                        |
| `uv run ruff check .` | Python lint                        |
| `graphify .`          | Build the codebase knowledge graph |

---

## Layout

```
docs/
  README.md              this file - the GitHub-facing readme
  brief.md               hackathon facts - the working reference
  source/                organizer material (append-only record)
  superpowers/research/  cited findings from concept exploration
.agents/skills/          skills (committed source of truth)
.claude/skills/          symlinks into .agents/skills/
```

The repo root deliberately has **no README** — it lives here.

---

## Next Up

- [ ] Register the team on Devfolio · everyone submits LinkedIn for verification
- [ ] Join the Discord GonkaRouter track channel
- [ ] **GonkaRouter workshop — 27 Aug, 9 PM, Microsoft Teams** (register on Luma)
- [ ] Create an API key, run the smoke test above
- [ ] Lock the concept → record the application stack in `../AGENTS.md`
