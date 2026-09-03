# GonkaRouter setup and integration notes

How to get a key, smoke-test the gateway, and wire it into each client, drawn from the official tutorial video and the
live docs.

> **Source** — YouTube: _"GonkaRouter Tutorial: Powerful AI Models, Nearly Free to Use"_ ([1uWmLGPoBCM][video], 56s,
> uploaded 2026-06-10 by _Gonka Router_), cross-checked against the live docs at <https://gonkarouter.io/docs> and
> <https://gonkarouter.io/models>. Captured 2026-08-26. Frames were read directly for on-screen commands; captions used
> for narration.

[video]: https://www.youtube.com/watch?v=1uWmLGPoBCM

Contents:

1. [The domain changed since the video](#the-domain-changed-since-the-video)
1. [1. What GonkaRouter is](#1-what-gonkarouter-is)
1. [2. Getting an API key](#2-getting-an-api-key)
1. [3. The 30-second smoke test](#3-the-30-second-smoke-test)
1. [4. Models](#4-models)
1. [5. Wiring it into clients](#5-wiring-it-into-clients)
1. [6. Limits and specifications](#6-limits-and-specifications)
1. [7. Error-code cheat sheet](#7-error-code-cheat-sheet)
1. [8. Implications for our build](#8-implications-for-our-build)

## The domain changed since the video

- **In the video, June 2026:** `https://api.gonkascan.com`
- **Live docs today, canonical:** **`https://api.gonkarouter.io`**

Both hosts respond, but **use `api.gonkarouter.io`** — every snippet in the current docs is tested against it. The
video's screenshots are otherwise still accurate.

## 1. What GonkaRouter is

- An **AI inference gateway** fronting the **Gonka Network**, a decentralised compute network.
- It exposes frontier **open-weight** models through **two protocol surfaces**:
  - **OpenAI-compatible** → `POST /v1/chat/completions`
  - **Anthropic Messages API** → `POST /v1/messages`, streaming and tool use included
- Because of that dual surface, existing clients work unmodified: Claude SDK, Claude Code CLI, Cursor, OpenClaw,
  WorkBuddy, Continue.dev, Cline, Aider.

## 2. Getting an API key

| Step | Action                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| 1    | Open the **Dashboard** at gonkarouter.io                                                                         |
| 2    | Sign in — **email or Google** (docs) / **Connect MetaMask** wallet (video UI, with a _Continue as guest_ option) |
| 3    | **Create API Key** → give it a label → copy the `sk-…` value                                                     |
| 4    | New accounts get a **one-time $20 free credit** (the docs also mention a `$20/day for 7 days` variant)           |

**Dashboard layout**, from the video: sidebar = `Dashboard · Chat · Models · Transactions`, plus a **Deposit** button
and connected-wallet chip. Dashboard cards = **Balance** (USDT) · **Monthly Cost** · **Requests** · **Tokens**,
alongside **API Key** and **Base URL** panels and a live **API Reference**.

The challenge doc states participants get **unlimited free token credits** during the event, so the $20 credit is not
the binding constraint for us.

## 3. The 30-second smoke test

Run this before wiring up any SDK. A `200` with a `content[].text` field means everything else on this page will work.

```bash
KEY="sk-xxxxxx"   # paste your real key

curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "moonshotai/Kimi-K2.6",
    "max_tokens": 1024,
    "messages": [{"role":"user","content":"Reply with just: pong"}]
  }'
```

Expected, abridged:

```json
{
  "id": "msg_…",
  "type": "message",
  "role": "assistant",
  "model": "moonshotai/Kimi-K2.6",
  "content": [{ "type": "text", "text": " pong" }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 15, "output_tokens": 43 }
}
```

Auth accepts **either** header: `x-api-key: sk-…` **or** `Authorization: Bearer sk-…`.

## 4. Models

| Model                 | Short id                 | Max output | Capabilities                                     | Released   |
| --------------------- | ------------------------ | ---------- | ------------------------------------------------ | ---------- |
| **Kimi-K2.6**         | `kimi-k2-6`              | 262K       | chat, vision, function, reasoning, cache, search | 2026-05-09 |
| **MiniMax-M2.7**      | `minimax-m2-7`           | 192K       | chat, function, reasoning, cache                 | 2026-05-29 |
| **DeepSeek-V4-Flash** | `deepseek-v4-flash-0731` | 1M         | chat, function                                   | 2026-07-31 |
| Qwen3-235B-FP8        | —                        | —          | seen in the in-app Chat model picker             | —          |

**Pricing** — `$0.0012 / 1M tokens`, **same rate for input and output**, dynamically adjusted by network utilisation:
above 60% utilisation the price goes up, below 40% it goes down, and between 40 and 60% it is unchanged.

### Model id gotchas

- **Vendor-prefixed ids are case- and slash-sensitive.** `moonshotai/Kimi-K2.6` works; `Kimi-K2.6` returns
  `model not available for your channel`.
- Two catalogs exist: vendor-prefixed (`MiniMaxAI/MiniMax-M2.7`, `moonshotai/Kimi-K2.6`) and short (`kimi-k2.6`). **Copy
  exactly what the /models page shows for your key.**
- Recommended in the docs for the Anthropic surface: `MiniMaxAI/MiniMax-M2.7`.

## 5. Wiring it into clients

### 5a. Anthropic and the Claude SDK

Override `base_url` and `api_key`; everything else is stock Anthropic.

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://api.gonkarouter.io",
    api_key="sk-xxxxxx",
)

msg = client.messages.create(
    model="moonshotai/Kimi-K2.6",
    max_tokens=1024,          # keep >= 1024 — reasoning tokens eat into this
    messages=[{"role": "user", "content": "Reply with just: pong"}],
)
text = next((b.text for b in msg.content if getattr(b, "text", None)), "")
```

```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  baseURL: 'https://api.gonkarouter.io',
  apiKey: process.env.GONKA_API_KEY!
})
```

Streaming works via the idiomatic helpers (`client.messages.stream(...)` and `stream.text_stream`).

### 5b. Claude Code CLI, the exact incantation

This is the part the video walks through on screen.

```bash
npm install -g @anthropic-ai/claude-code
claude --version   # -> 1.x.x

# Isolated HOME so Claude Code does NOT reuse your existing OAuth session
mkdir -p /tmp/gonka-claude-home

HOME=/tmp/gonka-claude-home \
ANTHROPIC_BASE_URL=https://api.gonkarouter.io \
ANTHROPIC_AUTH_TOKEN=sk-xxxxxx \
ANTHROPIC_MODEL=moonshotai/Kimi-K2.6 \
ANTHROPIC_SMALL_FAST_MODEL=moonshotai/Kimi-K2.6 \
DISABLE_PROMPT_CACHING=1 \
claude
```

| Env var                       | Why it matters                                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `HOME=/tmp/gonka-claude-home` | Without it the CLI reads `~/.claude/credentials`, finds your Anthropic OAuth session, and **silently ignores** `ANTHROPIC_AUTH_TOKEN` — billing your Anthropic account instead |
| `ANTHROPIC_BASE_URL`          | **Domain root, no `/v1`** — the CLI appends `/v1/messages` itself                                                                                                              |
| `ANTHROPIC_AUTH_TOKEN`        | Your `sk-…` key, sent as `x-api-key`. Note it is `_AUTH_TOKEN`, **not** `_API_KEY`                                                                                             |
| `ANTHROPIC_MODEL`             | Primary reasoning model — pin to a Gonka id, slashes preserved                                                                                                                 |
| `ANTHROPIC_SMALL_FAST_MODEL`  | Sidecar tasks (file summaries, planner checks) — set the same so nothing leaks off-gateway                                                                                     |
| `DISABLE_PROMPT_CACHING=1`    | The gateway does not implement Anthropic's prompt-caching headers                                                                                                              |

**Verify routing** by running `/status` inside the REPL — it should print `https://api.gonkarouter.io` as the base URL.
**To keep history**, swap `/tmp/gonka-claude-home` for a persistent path like `~/.gonka-claude-home`.

Optional shell wrapper:

```bash
gonka-claude() {
  HOME=/tmp/gonka-claude-home \
  ANTHROPIC_BASE_URL=https://api.gonkarouter.io \
  ANTHROPIC_AUTH_TOKEN="${GONKA_API_KEY:?set GONKA_API_KEY in your shell}" \
  ANTHROPIC_MODEL=moonshotai/Kimi-K2.6 \
  ANTHROPIC_SMALL_FAST_MODEL=moonshotai/Kimi-K2.6 \
  DISABLE_PROMPT_CACHING=1 \
  claude "$@"
}
```

_PowerShell only:_ if `claude.ps1` is blocked, run
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once. Not needed in `cmd`.

### 5c. Cursor IDE

| Field                        | Value                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| OpenAI Base URL              | `https://api.gonkarouter.io/v1` ← **the `/v1` suffix is required here** |
| OpenAI API Key               | your `sk-…` key                                                         |
| Model name                   | exact id from `/models`, e.g. `moonshotai/Kimi-K2.6`                    |
| Max output tokens (Advanced) | `4096`                                                                  |

> **Cursor Free plan will not work.** The free tier blocks Named Models — it shows _"Named models unavailable. Free
> plans can only use Auto"_ and silently routes to its own provider. Your gateway is never called. **Cursor Pro only.**
> Free alternatives that accept the same base URL and key: **Continue.dev, Cline, Aider**.

Also turn off Cursor's built-in Anthropic and OpenAI models, or Cursor will try to verify `gpt-4o` against your key and
fail.

### 5d. OpenClaw

OpenClaw does **not** read `ANTHROPIC_BASE_URL`. Register a custom provider instead.

```json5
// /tmp/gonka-provider.json5
{
  models: {
    providers: {
      gonka: {
        baseUrl: 'https://api.gonkarouter.io',
        apiKey: 'sk-xxxxxx',
        auth: 'api-key',
        api: 'anthropic-messages',
        models: [{ id: 'moonshotai/Kimi-K2.6', name: 'Kimi-K2.6' }]
      }
    }
  }
}
```

```bash
nvm install 22 && nvm use 22          # Node >= 22.12 required
npm install -g openclaw

openclaw config patch --file /tmp/gonka-provider.json5 --dry-run
openclaw config patch --file /tmp/gonka-provider.json5

openclaw config set gateway.mode local   # required, else daemon refuses to start
openclaw daemon restart
openclaw gateway status                  # -> running, probe ok, 127.0.0.1:18789

openclaw infer model run --model "gonka/moonshotai/Kimi-K2.6" --prompt "Reply with just: pong" --json
```

- The model id is `gonka/<real-id>` — provider prefix **plus** the full slashed id.
- `--local` bypasses the daemon, which is good for CI; omit it to route through port 18789.

### 5e. WorkBuddy (v5.3.11)

**The Interface URL field takes the full endpoint, not a base URL:**

| URL                                              | Result |
| ------------------------------------------------ | ------ |
| `https://api.gonkarouter.io`                     | 404    |
| `https://api.gonkarouter.io/v1`                  | 404    |
| `https://api.gonkarouter.io/v1/chat/completions` | works  |

Provider must be **Custom** — the named Kimi, MiniMax and Zhipu entries point at those vendors, not your gateway. Output
is hard-capped at **4096 tokens**, or 3072 if `max_tokens` is omitted; asking for more is silently clamped.

## 6. Limits and specifications

Production-verified by GonkaRouter, last checked 2026-06-19.

| Limit                  | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| Burst capacity         | ≥ 200 concurrent requests                                 |
| Sustainable throughput | ≤ 1000 req/min                                            |
| Throttling threshold   | sustained > 1500 req/min → `429`                          |
| `429` behaviour        | **does not consume balance** — back off 30–60s and retry  |
| Streaming hard cap     | 10 minutes wall-clock per request                         |
| Streaming idle cap     | 90 seconds with no new chunk → upstream connection closed |
| Context window         | MiniMax-M2.7 → 200K tokens                                |

## 7. Error-code cheat sheet

| Code  | Meaning                                                                |
| ----- | ---------------------------------------------------------------------- |
| `400` | Unknown model id                                                       |
| `401` | Invalid / missing key (`missing Authorization or x-api-key header`)    |
| `404` | Wrong path — request reached the router but the route isn't registered |
| `429` | Rate limited (balance untouched)                                       |

## 8. Implications for our build

- **Multi-model consensus is cheap and easy.** Kimi-K2.6, MiniMax-M2.7 and DeepSeek-V4-Flash all sit behind one key and
  one base URL. The challenge explicitly rewards cross-model verification.
- **We can drive our own agents through it** — Claude Code, Continue or Cline via the env-var pattern above, which
  doubles as a demoable "built on Gonka" story.
- **Capture the request id.** The challenge requires displaying **Gonka Request IDs** per inference step as proof of
  decentralised execution. Plumb that through from day one, not at the end.
- **Budget for the 4096-token output cap** on the OpenAI surface, and the 90s streaming idle cap for long reasoning
  chains.
- **Pin exact model ids** in config, and read them from `/models` with our own key before hardcoding.
