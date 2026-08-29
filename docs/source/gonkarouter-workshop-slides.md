# GonkaRouter Workshop — Slide Deck

> **Source** — `workshop-gonka-router.html`, the deck presented at the GonkaRouter developer workshop, 27 Aug 2026, 9:00
> PM MYT on Microsoft Teams. Presented by **Jack**, GonkaRouter Tech Lead. **Method** — text extracted from the HTML
> deck (26 slides). Bilingual 中文/English throughout; the English is reproduced here, with Chinese kept only where it
> carries something the English does not. **Captured** — 2026-08-29. Companion:
> [`gonkarouter-workshop-transcript.md`](gonkarouter-workshop-transcript.md) for what was actually said.

**Deck title:** _Ship Smarter AI Apps at Zero Cost / 0 成本部署更智能的 AI 应用_

---

## What This Adds Over What We Already Had

| New fact                                                                            | Supersedes                                                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| DeepSeek's full id is **`deepseek-ai/DeepSeek-V4-Flash-0731`**                      | `gonkarouter-tutorial.md` only had the short `deepseek-v4-flash-0731`                      |
| The $20 credit is a **one-time signup credit**, full stop                           | The tutorial doc noted an unresolved "$20 one-time vs $20/day for 7 days" ambiguity        |
| **No wallet required** — email or Google sign-in; a wallet matters only for top-ups | The tutorial video showed a MetaMask "Connect your wallet" modal as the entry point        |
| Rate quoted as **from $0.0013 / 1M tokens**                                         | `/models` showed $0.0012. The rate floats with network utilisation; both are point-in-time |
| **Unlimited tokens for the whole event**                                            | Confirms Carol's ceremony statement from a second, written source                          |

---

## Agenda

| #   | Section                                                                           |
| --- | --------------------------------------------------------------------------------- |
| 01  | **Why Gonka Router** — what Gonka is, and why one unified endpoint matters        |
| 02  | **Build an AI app, live** — key → connect → switch models → demo → best practices |
| 03  | **Live Q&A** — integration blockers, debugged together                            |

---

## Part 1 — Why Developers Need GonkaRouter

### The Problem, As They Frame It

> _"The friction between your idea and your first API call."_

| Pain                                                          |                                 |
| ------------------------------------------------------------- | ------------------------------- |
| A foreign credit card stands between you and your first token | Blocking for Malaysian students |
| Every vendor: its own SDK, auth and billing                   | Switching cost                  |
| Plumbing is the worst place to spend a prototype's budget     | Time cost                       |
| Comparing models means juggling several accounts              | Evaluation cost                 |

### Their Answer

- **$20 one-time free credit** — start before you pay
- **One API, both protocols** — OpenAI _and_ Anthropic wire formats
- **Change the base URL** — existing code just works, ~5 minutes
- **One flat rate for every model**, input and output alike

> _"Turn days of integration into minutes."_

### What Gonka Is

A **decentralised AI compute network** — _"AI compute is the new currency"_. Mainnet is live.

|                           |                                                                     |
| ------------------------- | ------------------------------------------------------------------- |
| **Decentralised compute** | Proof-of-work built on transformer inference. **Audited by CertiK** |
| **Frontier open models**  | Kimi-K2.6, MiniMax-M2.7, DeepSeek-V4-Flash all live today           |
| **Settled in GNK**        | Web3-native settlement. Backed by **Coatue** and **Slow Ventures**  |

> **Gonka is the compute network. Gonka Router is the developer-facing front door.**

### The Architecture, As They Draw It

```
Your app                 →  Gonka Router          →  Gonka network        →  Kimi · MiniMax · DeepSeek
OpenAI / Anthropic SDK      Auth · billing · routing   Decentralised compute   Frontier open models
```

**1 API key · 2 wire protocols · N models.** _"Integrate once — model changes, routing and settlement stay on our
side."_

### Direct vs. Router

| Dimension       | Direct to each vendor        | GonkaRouter               |
| --------------- | ---------------------------- | ------------------------- |
| **Integration** | One SDK & auth per vendor    | One API, two protocols    |
| **Payment**     | Foreign card or subscription | $20 free credit + crypto  |
| **Pricing**     | Per-model, often marked up   | One flat rate, all models |
| **Switching**   | New SDK, new auth            | Change one string         |

### The Cost Claim, With Their Own Numbers

|                  |                               |
| ---------------- | ----------------------------- |
| **$20**          | one-time signup credit        |
| **from $0.0013** | per 1M tokens, input = output |
| **$0**           | subscriptions, seats, cards   |

**A real account they showed:** after **1.77M requests** and **4.35B tokens**, the $20 credit still had **$18.26 left**.

> The rate floats with the Gonka network; `/pricing` shows the live number. _"Either way, $20 goes a very long way in
> prototyping."_

### What People Are Building

Agents & automation · coding assistants (Cursor, Claude Code, Cline, Aider) · chat & long-context Q&A · document and
data processing · RAG · prototyping.

---

## Part 2 — Hands-On, Five Steps

> **1** Get a key → **2** 30-second smoke test → **3** connect an SDK → **4** swap models → **5** best practices

### Step 1 — Sign Up And Get A Key

|             |                                                                                 |
| ----------- | ------------------------------------------------------------------------------- |
| Sign-in     | **Email or Google. No wallet required** — a wallet only matters when you top up |
| Base URL    | `https://api.gonkarouter.io`                                                    |
| Auth header | `x-api-key: sk-…` **or** `Authorization: Bearer sk-…` (either works)            |
| Credit      | Every new account gets **$20**, one time                                        |

**Four things worth knowing up front:**

- OpenAI-style requests go to **`/v1/chat/completions`**
- Anthropic-style requests go to **`/v1/messages`**
- **One key covers every model** — no per-model access requests
- **A `429` never costs you balance** — back off and retry

### Step 2 — The 30-Second Smoke Test

```bash
KEY="sk-xxxxxx"

curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V4-Flash-0731",
    "max_tokens": 1024,
    "messages": [{"role":"user","content":"Reply with just: pong"}]
  }'
```

Expect `"role":"assistant"`, a `content[].text` of `pong`, and usage token counts.

### Step 3 — Connect An SDK

**OpenAI-compatible** — exactly two lines change:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxx",
    base_url="https://api.gonkarouter.io/v1",   # note the /v1
)
```

**Anthropic-compatible** — `/v1/messages` is fully implemented, streaming and tool use included:

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://api.gonkarouter.io",   # no /v1 - the SDK appends /v1/messages
    api_key="sk-xxxxxx",
)

msg = client.messages.create(
    model="moonshotai/Kimi-K2.6",
    max_tokens=1024,          # >= 1024, leave room for reasoning tokens
    messages=[{"role": "user", "content": "Reply with just: pong"}],
)
```

> ⚠️ **The `/v1` asymmetry is a real trap.** OpenAI-style needs it in the base URL; Anthropic-style must not have it.
> Same gateway, different rule per protocol.

**No code required** — Cursor IDE (Pro only; Continue.dev / Cline / Aider are the free alternatives), Claude Code CLI
(env vars + isolated `HOME`), OpenClaw (custom `gonka` provider), and _"any client that lets you set a base URL"_ —
LangChain, LlamaIndex, Vercel AI SDK.

### Step 4 — Switching Models

Same code, one string changed. **Ids are case- and slash-sensitive.**

| Model                                    | Id                                   | Best for                                                                                                       | Specs                                |
| ---------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **DeepSeek-V4-Flash** _(new, just live)_ | `deepseek-ai/DeepSeek-V4-Flash-0731` | Speed-tuned: fast chat, summarisation, extraction, code help. **Answers directly, no visible reasoning trace** | 1M · function · low latency          |
| **Kimi-K2.6**                            | `moonshotai/Kimi-K2.6`               | Long-context reasoning, code-heavy work, strong agent behaviour                                                | 262K · vision · function · reasoning |
| **MiniMax-M2.7**                         | `MiniMaxAI/MiniMax-M2.7`             | Agent-native, elite coding, stable long-chain tool calling                                                     | 192K · reasoning · function          |

**All three share one rate**, input and output alike. _"Change models without changing wallets."_

### The Live Demo — A Streaming Skeleton

```python
from openai import OpenAI

client = OpenAI(api_key="sk-xxxxxx", base_url="https://api.gonkarouter.io/v1")

def ask(question: str, model="deepseek-ai/DeepSeek-V4-Flash-0731"):
    stream = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": question}],
        stream=True,                     # streaming feels far better in a demo
    )
    for chunk in stream:
        print(chunk.choices[0].delta.content or "", end="", flush=True)

ask("Summarise this week's support tickets and list the top 3 recurring issues.")
```

> _"Streaming feels better in a demo — swap the model argument to run the same prompt through all three."_

### The WorkBuddy Demo And Its Gotchas

Five fields: Settings → Models → Add Model, Provider = **Custom**, Interface URL, API Key, Model Name.

|     | URL                                      | Result |
| --- | ---------------------------------------- | ------ |
| ✗   | `api.gonkarouter.io`                     | 404    |
| ✗   | `api.gonkarouter.io/v1`                  | 404    |
| ✓   | `api.gonkarouter.io/v1/chat/completions` | works  |

**Four things that will bite you:**

- **A 404 is almost always the URL.** A bad key returns `401`, an unknown model `400` — neither looks like a 404
- **Output caps at 4096 tokens.** Omitting `max_tokens` gives an even lower **3072**; asking for more is silently
  clamped
- **Model ids differ per plan.** Vendor-prefixed `MiniMaxAI/MiniMax-M2.7` and short `kimi-k2.6` are different catalogs —
  copy what `/models` shows for _your_ key
- **Relayed by WorkBuddy's own backend**, which is why its errors carry two ids. Quote the **Trace ID** to support

Verified against WorkBuddy **v5.3.11**.

### Step 5 — Best Practices

**Do this:**

- `max_tokens >= 1024`, leaving room for reasoning tokens
- Copy model ids verbatim from `/models`
- On `429`, back off 30–60s — **it costs you nothing**
- Stream long answers

**Verified production limits:**

| Limit                | Value                                   |
| -------------------- | --------------------------------------- |
| Burst                | ≥ 200 concurrent                        |
| Sustained            | ≤ 1000 req/min                          |
| Throttle threshold   | > 1500 req/min → `429`                  |
| Per-request hard cap | 10 minutes                              |
| Idle timeout         | 90 seconds closes the stream            |
| Prompt caching       | **Not supported** — disable client-side |

> **Their mnemonic:** _curl first → change the base URL → exact model id → back off on 429._

---

## Their Own FAQ

| Question                                   | Answer                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Do I need a wallet?**                    | No. Email or Google is enough. A wallet only matters when you top up                                |
| **How is this different from OpenRouter?** | Same idea, different foundation: decentralised compute, one flat rate, crypto billing, $20 to start |
| **Does the OpenAI SDK work?**              | Yes — change the base URL. Anthropic Messages is supported too                                      |
| **What when the credit runs out?**         | Top up, pay per token actually consumed. Nothing else                                               |

---

## Token Support For This Event

> **During the event: unlimited tokens.** _"Don't ration them."_ **After: teams that build something great keep 20M
> tokens/month for 3–6 months.**

This is the second independent confirmation — Carol said the same at the opening ceremony
([`opening-ceremony-transcript.md`](opening-ceremony-transcript.md) §00:39).

---

## Resources They Pointed At

|            |                                                |
| ---------- | ---------------------------------------------- |
| `/docs`    | WorkBuddy, Claude Code, Cursor — full examples |
| `/models`  | Exact ids and snippets                         |
| `/pricing` | The live per-token rate                        |

---

## What This Means For Our Build

- **Pin `deepseek-ai/DeepSeek-V4-Flash-0731`**, not the short id. Three vendor-prefixed ids now confirmed from a
  first-party deck.
- **The `/v1` asymmetry between protocols** is the single most likely wiring mistake. Worth a comment in whatever config
  file holds the base URL.
- **DeepSeek answers without a visible reasoning trace**, Kimi and MiniMax reason. For a consensus feature that has to
  _show_ its reasoning, that difference decides which model does what.
- **Unlimited tokens during the event** means multi-model cross-verification costs us nothing. No reason to run one
  model where the track rewards two.
- **`429` does not consume balance**, so aggressive parallel fan-out is safe as long as we back off.
