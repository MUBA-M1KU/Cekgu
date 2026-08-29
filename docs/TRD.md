<a id="top"></a>

# TRD — Technical Reference

Canonical technical truth for this project. Where this file and any other disagree, **this file wins** — including
`AGENTS.md`.

**Scope today: the GonkaRouter gateway only.** Application architecture, data models and hosting are not decided and are
marked as open at the foot. This document exists early because the gateway is the one part of the stack the track fixes
for us, so it can be pinned before the concept is.

Everything in the Verified sections was measured against the live API on **2026-08-29** with our own key. Where a
measurement contradicts organizer material, the measurement is recorded and the contradiction is named.

---

## Contents

| §                   | Section                                                       |
| ------------------- | ------------------------------------------------------------- |
| [1](#s1-gateway)    | Gateway, Base URLs And Auth                                   |
| [2](#s2-endpoints)  | Endpoints                                                     |
| [3](#s3-models)     | Models — Measured, And Which To Use                           |
| [4](#s4-provenance) | Request IDs And Provenance — **the track's hard requirement** |
| [5](#s5-gotchas)    | Verified Gotchas                                              |
| [6](#s6-limits)     | Rate Limits And Timeouts                                      |
| [7](#s7-errors)     | Error Codes                                                   |
| [8](#s8-config)     | Configuration Contract                                        |
| [9](#s9-open)       | Open Decisions                                                |

---

<a id="s1-gateway"></a>

## 1. Gateway, Base URLs And Auth

`https://api.gonkarouter.io` fronts the decentralised Gonka compute network. It speaks **two wire protocols on one
key**.

### The Base URL Is Not One Value

**This is the single easiest thing to get wrong.** The correct base URL depends on which SDK you point at it, because
each appends a different path:

| Client style                             | `base_url` to set               | SDK appends         | Resulting path           |
| ---------------------------------------- | ------------------------------- | ------------------- | ------------------------ |
| **OpenAI** (`openai`, LangChain, …)      | `https://api.gonkarouter.io/v1` | `/chat/completions` | `/v1/chat/completions` ✓ |
| **Anthropic** (`anthropic`, Claude Code) | `https://api.gonkarouter.io`    | `/v1/messages`      | `/v1/messages` ✓         |

**Verified 2026-08-29:**

```
/v1/messages       -> 200
/v1/chat/completions -> 200
/v1/v1/messages    -> 404      # what you get if an Anthropic SDK is given the /v1 base URL
/messages          -> 404      # every real path is under /v1
```

**Do not carry a single `GONKA_BASE_URL` variable.** It cannot serve both surfaces. See [§8](#s8-config).

> The GonkaRouter dashboard displays `https://api.gonkarouter.io/v1` as _the_ Base URL with no qualification. That is
> correct for the OpenAI surface and wrong for the Anthropic one.

### Auth

Either header works, on both surfaces:

```
x-api-key: sk-…
Authorization: Bearer sk-…
```

One key covers every model. No per-model access requests.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s2-endpoints"></a>

## 2. Endpoints

| Method | Path                   | Protocol  | Notes                                                  |
| ------ | ---------------------- | --------- | ------------------------------------------------------ |
| `POST` | `/v1/chat/completions` | OpenAI    | Streaming supported via `"stream": true`               |
| `POST` | `/v1/messages`         | Anthropic | Full Messages API: streaming and tool use              |
| `GET`  | `/v1/models`           | OpenAI    | **The authoritative model list.** See [§3](#s3-models) |

### Minimal Working Calls

```bash
# Anthropic surface
curl -s https://api.gonkarouter.io/v1/messages \
  -H "x-api-key: $GONKA_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"moonshotai/Kimi-K2.6","max_tokens":1024,
       "messages":[{"role":"user","content":"Reply with just: pong"}]}'

# OpenAI surface
curl -s https://api.gonkarouter.io/v1/chat/completions \
  -H "Authorization: Bearer $GONKA_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"deepseek-ai/DeepSeek-V4-Flash-0731","max_tokens":1024,
       "messages":[{"role":"user","content":"Reply with just: pong"}]}'
```

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s3-models"></a>

## 3. Models — Measured, And Which To Use

### 🔴 Only Three Model Ids Work, And They Are Not The Ones The Website Shows

`GET /v1/models` returns exactly three ids. **These are the only strings the API accepts:**

```
deepseek-ai/DeepSeek-V4-Flash-0731
MiniMaxAI/MiniMax-M2.7
moonshotai/Kimi-K2.6
```

The **Models page at gonkarouter.io/models displays short ids** — `deepseek-v4-flash-0731`, `kimi-k2-6`, `minimax-m2-7`.
Every one of them fails:

```
kimi-k2-6              -> 400  "model not available for your channel"
kimi-k2.6              -> 400  "model not available for your channel"
minimax-m2-7           -> 400  "model not available for your channel"
deepseek-v4-flash-0731 -> 400  "model not available for your channel"
```

> ⚠️ The workshop deck says _"copy the model id exactly as it appears on `/models`"_ and _"copy whatever the Models page
> shows for your key"_. Followed literally against the **web page**, that advice produces a 400 every time. The
> dashboard's own API Reference panel uses the vendor-prefixed id, so their site contradicts itself.
>
> **Rule: trust `GET /v1/models`, never the web page.**

### Measured Behaviour

Single request, `max_tokens=1024`, one-sentence factual prompt, OpenAI surface, 2026-08-29:

| Model                                | Latency | Output tokens | `<think>` leak | Max output | Capabilities                                             |
| ------------------------------------ | ------: | ------------: | -------------- | ---------: | -------------------------------------------------------- |
| `deepseek-ai/DeepSeek-V4-Flash-0731` |   2.3 s |            19 | **No**         |         1M | chat, function                                           |
| `MiniMaxAI/MiniMax-M2.7`             |   2.5 s |           121 | **Yes**        |       192K | chat, function, reasoning, cache                         |
| `moonshotai/Kimi-K2.6`               |   8.6 s |            77 | No             |       262K | chat, function, reasoning, cache, **vision**, **search** |

Capabilities are as flagged on the Models page. Latency is one sample on one network — treat it as an order of
magnitude, not a benchmark.

**Parallel fan-out works.** Three concurrent requests, one per model, completed in **16.2 s wall clock** — bounded by
the slowest model, not the sum. Each returned its own distinct `x-request-id`. Multi-model consensus is therefore a
fan-out, not a queue.

### Recommendation

The track requires **at least two models cross-verifying**. Nothing stops us using all three, and at these prices there
is no reason not to.

| Role                       | Model             | Why                                                                                                                                                      |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast path / first pass** | DeepSeek-V4-Flash | 2.3 s and clean output. Jack: _"speed-tuned, answers directly, no visible reasoning trace."_ Carol: _"logical reasoning and more complex tasks."_        |
| **Deep verifier**          | Kimi-K2.6         | Carol named it for _"long-text analysis, summarization, and fact checking."_ The only model here with **vision** and **search**. Slowest — budget for it |
| **Third opinion / agents** | MiniMax-M2.7      | Carol: _"multi-turn conversation, AI agents and assistants."_ Jack: _"agent-native, elite coding, stable long-chain tool calling"_                       |

**Two consequences worth deciding around:**

- **Only Kimi has `search`.** If the build needs grounding against live web data rather than model priors, Kimi is the
  only option on this gateway. That is a real constraint on any verification-shaped concept.
- **DeepSeek does not reason visibly, the other two do.** If the product has to _show_ its reasoning, DeepSeek is the
  wrong model for the step being shown, regardless of its speed.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s4-provenance"></a>

## 4. Request IDs And Provenance

**The track requires Gonka Request IDs surfaced in the UI for every inference step.** This is where they come from.

Every response carries two headers:

```
x-request-id:  req-1788016913316163460-503197
x-devshard-id: 65725
```

- **`x-request-id`** is the per-inference identifier. This is the one to display. Distinct per request, including across
  a parallel fan-out.
- **`x-devshard-id`** identifies the node that served it. Useful supporting evidence that the work was distributed.

**They are HTTP headers, not body fields.** Any client wrapper that returns only the parsed JSON body **will throw them
away**. This matters for how we call the gateway:

| Approach                                           | Gets `x-request-id`? |
| -------------------------------------------------- | -------------------- |
| Raw `fetch` / `httpx`, reading `.headers`          | ✅ Yes               |
| OpenAI SDK — `client.chat.completions.create(...)` | ❌ No, discarded     |
| OpenAI SDK — `.with_raw_response.…`                | ✅ Yes               |
| Anthropic SDK — `.with_raw_response.…`             | ✅ Yes               |

The body ids are **not** substitutes: the Anthropic surface returns `msg_…` and the OpenAI surface returns
`devshard-65275-1926`. Neither is the gateway's request id.

> **Design consequence.** Whatever wraps the gateway must return `(content, request_id, devshard_id, model, usage)` as
> one record, from the first commit. Retrofitting provenance after the call layer exists means rewriting every call
> site, and the track fails without it.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s5-gotchas"></a>

## 5. Verified Gotchas

| #   | Gotcha                                     | Detail                                                                                                                                                        |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`<think>` leaks into MiniMax content**   | `MiniMaxAI/MiniMax-M2.7` emits raw `<think>…` inside the message content, on **both** surfaces. Verified twice. Must be stripped before display or comparison |
| 2   | **Kimi leaks a stray `</think>`**          | Observed `" p </think> pong"` on a short reply. Same stripping applies                                                                                        |
| 3   | **Low `max_tokens` yields reasoning only** | At `max_tokens=64`, MiniMax spent all 64 on `<think>` and returned no answer. **Keep `max_tokens >= 1024`**                                                   |
| 4   | **Website model ids are wrong**            | See [§3](#s3-models). Trust `GET /v1/models`                                                                                                                  |
| 5   | **`/v1` asymmetry between protocols**      | See [§1](#s1-gateway)                                                                                                                                         |
| 6   | **Prompt caching unsupported**             | The gateway does not implement Anthropic's prompt-caching headers. Disable client-side (`DISABLE_PROMPT_CACHING=1` for Claude Code)                           |

**Stripping reasoning tags is not optional.** A consensus step that compares raw outputs will compare one model's answer
against another model's internal monologue. Strip `<think>…</think>` and any orphaned tag before anything reads the
content.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s6-limits"></a>

## 6. Rate Limits And Timeouts

Vendor-published, last checked by GonkaRouter 2026-06-19. Not independently verified by us.

| Limit                | Value                                               |
| -------------------- | --------------------------------------------------- |
| Burst                | ≥ 200 concurrent requests                           |
| Sustained            | ≤ 1000 req/min                                      |
| Throttle threshold   | sustained > 1500 req/min → `429`                    |
| **`429` cost**       | **Does not consume balance.** Back off 30–60 s      |
| Per-request hard cap | 10 minutes wall clock                               |
| Streaming idle cap   | 90 s with no chunk closes the connection            |
| Output cap           | 4096 tokens; omitting `max_tokens` defaults to 3072 |

Because `429` is free, aggressive parallel fan-out is safe provided we back off. Our own three-way fan-out is nowhere
near these ceilings.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s7-errors"></a>

## 7. Error Codes

| Code  | Meaning                                                                |
| ----- | ---------------------------------------------------------------------- |
| `400` | Unknown model id — `"model not available for your channel"`            |
| `401` | Missing or invalid key — `"missing Authorization or x-api-key header"` |
| `404` | Wrong path. The request reached the gateway; the route does not exist  |
| `429` | Rate limited. Balance untouched                                        |

A `404` is a URL problem, never a key or model problem — those are `401` and `400`.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s8-config"></a>

## 8. Configuration Contract

`.env` is gitignored and holds the key. `.env.example` carries the names, **never the values.**

```bash
GONKA_API_KEY=                                          # sk-… from the Dashboard

# Two base URLs, because the SDKs append different paths. See §1.
GONKA_BASE_URL_OPENAI=https://api.gonkarouter.io/v1     # OpenAI-style clients
GONKA_BASE_URL_ANTHROPIC=https://api.gonkarouter.io     # Anthropic-style clients

# Exact ids from GET /v1/models. Case- and slash-sensitive. Not the website's.
GONKA_MODEL_FAST=deepseek-ai/DeepSeek-V4-Flash-0731
GONKA_MODEL_DEEP=moonshotai/Kimi-K2.6
GONKA_MODEL_THIRD=MiniMaxAI/MiniMax-M2.7
```

**Account state, 2026-08-29:** balance **20.00 USDT**, monthly cost 0.00 after 9 test requests and 1,011 tokens. Tokens
are unlimited for the event; email Jack if the credit is ever exhausted.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>

---

<a id="s9-open"></a>

## 9. Open Decisions

Not yet decided. Each gets a subsection here, with the reasoning, once it is.

| Decision                    | Blocked on              |
| --------------------------- | ----------------------- |
| Application framework       | Concept (`PRODUCT.md`)  |
| Hosting for the live demo   | Framework               |
| Persistence, if any         | Concept                 |
| Consensus algorithm         | Concept                 |
| How provenance is displayed | Concept and `DESIGN.md` |

**What is already fixed regardless of concept:** the gateway, the three model ids, the two base URLs, and the
requirement that every call returns its `x-request-id` alongside its content.

<div align="right"><a href="#top">&#8593;&nbsp;Back to top</a></div>
