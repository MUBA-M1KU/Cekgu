# TRD, the technical reference

Canonical technical truth for this project. Where this file and any other disagree, **this file wins** — including
[`../AGENTS.md`](../AGENTS.md).

**Scope today: the GonkaRouter gateway only.** Application architecture, data models and hosting are not decided and are
marked as open at the foot. This document exists early because the gateway is the one part of the stack the track fixes
for us, so it can be pinned before the concept is.

The initial verified sections were measured against the live API on **2026-08-29** with our own key. Receipt and
fallback behaviour was verified on **2026-08-31** and is dated where introduced. Where a measurement contradicts
organizer material, the measurement is recorded and the contradiction is named.

Contents:

1. [Gateway, base URLs and auth](#1-gateway-base-urls-and-auth)
1. [Endpoints](#2-endpoints)
1. [Models, measured](#3-models-measured)
1. [Request IDs and provenance](#4-request-ids-and-provenance) — the track's hard requirement
1. [Verified gotchas](#5-verified-gotchas)
1. [Rate limits and timeouts](#6-rate-limits-and-timeouts)
1. [Error codes](#7-error-codes)
1. [Configuration contract](#8-configuration-contract)
1. [Open decisions](#9-open-decisions)

## 1. Gateway, base URLs and auth

`https://api.gonkarouter.io` fronts the decentralised Gonka compute network. It speaks **two wire protocols on one
key**.

### The base URL is not one value

**This is the single easiest thing to get wrong.** The correct base URL depends on which SDK you point at it, because
each appends a different path:

| Client style                             | `base_url` to set               | SDK appends         | Resulting path         |
| ---------------------------------------- | ------------------------------- | ------------------- | ---------------------- |
| **OpenAI** (`openai`, LangChain, …)      | `https://api.gonkarouter.io/v1` | `/chat/completions` | `/v1/chat/completions` |
| **Anthropic** (`anthropic`, Claude Code) | `https://api.gonkarouter.io`    | `/v1/messages`      | `/v1/messages`         |

Verified 2026-08-29:

```text
/v1/messages         -> 200
/v1/chat/completions -> 200
/v1/v1/messages      -> 404      # what you get if an Anthropic SDK is given the /v1 base URL
/messages            -> 404      # every real path is under /v1
```

**Do not carry a single `GONKA_BASE_URL` variable.** It cannot serve both surfaces. See
[the configuration contract](#8-configuration-contract).

> The GonkaRouter dashboard displays `https://api.gonkarouter.io/v1` as _the_ Base URL with no qualification. That is
> correct for the OpenAI surface and wrong for the Anthropic one.

### Auth headers

Either header works, on both surfaces:

```text
x-api-key: sk-…
Authorization: Bearer sk-…
```

One key covers every model. No per-model access requests.

## 2. Endpoints

| Method | Path                          | Protocol  | Notes                                                              |
| ------ | ----------------------------- | --------- | ------------------------------------------------------------------ |
| `POST` | `/v1/chat/completions`        | OpenAI    | Streaming supported via `"stream": true`                           |
| `POST` | `/v1/messages`                | Anthropic | Full Messages API: streaming and tool use                          |
| `GET`  | `/v1/models`                  | OpenAI    | **The authoritative model list.** See [models](#3-models-measured) |
| `GET`  | `/v1/receipts/{x-request-id}` | Gateway   | Public, no-auth metadata for a completed request                   |

### Minimal working calls

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

## 3. Models, measured

### Only three model ids work, and they are not the ones the website shows

`GET /v1/models` returns exactly three ids. **These are the only strings the API accepts:**

```text
deepseek-ai/DeepSeek-V4-Flash-0731
MiniMaxAI/MiniMax-M2.7
moonshotai/Kimi-K2.6
```

The **Models page at gonkarouter.io/models displays short ids** — `deepseek-v4-flash-0731`, `kimi-k2-6`, `minimax-m2-7`.
Every one of them fails:

```text
kimi-k2-6              -> 400  "model not available for your channel"
kimi-k2.6              -> 400  "model not available for your channel"
minimax-m2-7           -> 400  "model not available for your channel"
deepseek-v4-flash-0731 -> 400  "model not available for your channel"
```

> The workshop deck says _"copy the model id exactly as it appears on `/models`"_ and _"copy whatever the Models page
> shows for your key"_. Followed literally against the **web page**, that advice produces a 400 every time. The
> dashboard's own API Reference panel uses the vendor-prefixed id, so their site contradicts itself.
>
> **Rule: trust `GET /v1/models`, never the web page.**

### Measured behaviour

Single request, `max_tokens=1024`, one-sentence factual prompt, OpenAI surface, 2026-08-29:

| Model                                | Latency | Output tokens | `<think>` leak | Max output | Capabilities                                             |
| ------------------------------------ | ------: | ------------: | -------------- | ---------: | -------------------------------------------------------- |
| `deepseek-ai/DeepSeek-V4-Flash-0731` |   2.3 s |            19 | **No**         |         1M | chat, function                                           |
| `MiniMaxAI/MiniMax-M2.7`             |   2.5 s |           121 | **Yes**        |       192K | chat, function, reasoning, cache                         |
| `moonshotai/Kimi-K2.6`               |   8.6 s |            77 | No             |       262K | chat, function, reasoning, cache, **vision**, **search** |

Capabilities are as flagged on the Models page. Latency is one sample on one network — treat it as an order of
magnitude, not a benchmark.

**Availability, measured 2026-09-02.** That evening Kimi-K2.6 timed out on every call at 60–90 s, while DeepSeek
answered in 0.7–5 s and MiniMax in 2–50 s. Design for Kimi being absent. Provenance and the MiniMax failure pattern are
in [`superpowers/research/gateway-capabilities.md`](superpowers/research/gateway-capabilities.md#latency-and-hedging).

**Parallel fan-out works.** Three concurrent requests, one per model, completed in **16.2 s wall clock** — bounded by
the slowest model, not the sum. Each returned its own distinct `x-request-id`. Multi-model consensus is therefore a
fan-out, not a queue.

### Which model to use for what

The track requires **at least two models cross-verifying**. Nothing stops us using all three, and at these prices there
is no reason not to.

| Role                       | Model             | Why                                                                                                                                                      |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast path / first pass** | DeepSeek-V4-Flash | 2.3 s and clean output. Jack: _"speed-tuned, answers directly, no visible reasoning trace."_ Carol: _"logical reasoning and more complex tasks."_        |
| **Deep verifier**          | Kimi-K2.6         | Carol named it for _"long-text analysis, summarization, and fact checking."_ The only model here with **vision** and **search**. Slowest — budget for it |
| **Third opinion / agents** | MiniMax-M2.7      | Carol: _"multi-turn conversation, AI agents and assistants."_ Jack: _"agent-native, elite coding, stable long-chain tool calling"_                       |

Two consequences worth deciding around:

- **Only Kimi has `search`.** If the build needs grounding against live web data rather than model priors, Kimi is the
  only option on this gateway. That is a real constraint on any verification-shaped concept.
- **DeepSeek does not reason visibly, the other two do.** If the product has to _show_ its reasoning, DeepSeek is the
  wrong model for the step being shown, regardless of its speed.

## 4. Request IDs and provenance

**The track requires Gonka Request IDs surfaced in the UI for every inference step.** This is where they come from.

Every response carries two headers:

```text
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
| Raw `fetch` / `httpx`, reading `.headers`          | Yes                  |
| OpenAI SDK — `client.chat.completions.create(...)` | No, discarded        |
| OpenAI SDK — `.with_raw_response.…`                | Yes                  |
| Anthropic SDK — `.with_raw_response.…`             | Yes                  |

The body ids are **not** substitutes: the Anthropic surface returns `msg_…` and the OpenAI surface returns
`devshard-65275-1926`. Neither is the gateway's request id.

**Streaming, verified 2026-09-02.** `x-request-id` survives a streamed response: the header was present on a
`stream: true` call, the first SSE chunk arrived, and the public receipt for that id returned `"stream": true`.
Streaming costs nothing in provenance.

> **Design consequence.** Whatever wraps the gateway must return
> `(content, request_id, devshard_id, requested_model, served_model, receipt_status, usage)` as one record, from the
> first commit. Retrofitting provenance after the call layer exists means rewriting every call site, and the track fails
> without it.

### Cross-verification validity contract

**Verified 2026-08-31:** when a requested model is saturated, the gateway may silently serve a different model and
report the substitution only in `X-Gonka-Fallback`. A pair requested from two models can therefore become the same model
twice unless the call layer fails closed.

Every reasoning request must:

1. Send `X-Gonka-No-Fallback: true`.
2. Capture `x-request-id`, `x-devshard-id` and `X-Gonka-Fallback` from the raw response.
3. Reject the response if `X-Gonka-Fallback` is present, even if the body is otherwise successful.
4. Query `GET /v1/receipts/{x-request-id}` and require the receipt's `model` to equal `requested_model`.
5. Admit a result to consensus only when at least two successful records have different `served_model` values.

Failure at any step returns **verification unavailable**, never a consensus answer. The receipt is unsigned gateway
metadata: it makes the serving model publicly inspectable, but it is not cryptographic or on-chain proof.

## 5. Verified gotchas

| #   | Gotcha                                     | Detail                                                                                                                                                        |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`<think>` leaks into MiniMax content**   | `MiniMaxAI/MiniMax-M2.7` emits raw `<think>…` inside the message content, on **both** surfaces. Verified twice. Must be stripped before display or comparison |
| 2   | **Kimi leaks a stray `</think>`**          | Observed `" p </think> pong"` on a short reply. Same stripping applies                                                                                        |
| 3   | **Low `max_tokens` yields reasoning only** | At `max_tokens=64`, MiniMax spent all 64 on `<think>` and returned no answer. **Keep `max_tokens >= 1024`**                                                   |
| 4   | **Website model ids are wrong**            | See [models](#3-models-measured). Trust `GET /v1/models`                                                                                                      |
| 5   | **`/v1` asymmetry between protocols**      | See [the base URL rule](#1-gateway-base-urls-and-auth)                                                                                                        |
| 6   | **Prompt caching unsupported**             | The gateway does not implement Anthropic's prompt-caching headers. Disable client-side (`DISABLE_PROMPT_CACHING=1` for Claude Code)                           |
| 7   | **Silent model fallback**                  | Send `X-Gonka-No-Fallback: true`; reject `X-Gonka-Fallback`; verify the served model via the public receipt before consensus                                  |
| 8   | **Identical request bodies are cached**    | Byte-identical bodies in 70–190 ms for a repeated identical request at `temperature: 0.8`, each with a fresh id and receipt. Detail below                     |
| 9   | **Long prompts yield reasoning only**      | On prompts around 1,500 tokens MiniMax failed roughly one call in three, once as raw reasoning with no JSON. Detail below                                     |

**Stripping reasoning tags is not optional.** A consensus step that compares raw outputs will compare one model's answer
against another model's internal monologue. Strip `<think>…</think>` and any orphaned tag before anything reads the
content.

**Gotcha 8, measured 2026-09-02.** Repeated identical request bodies at `temperature: 0.8` returned byte-identical
content in 70–190 ms, and each repeat still received a fresh `x-request-id` and its own receipt. Add a nonce to every
body in a multi-sample design, and read a receipt as proof that the gateway logged a request, not that a fresh inference
ran.

**Gotcha 9, measured 2026-09-02.** On prompts around 1,500 tokens MiniMax failed roughly one call in three: a 524 after
114 s, two aborts at 114 s, and one reply that was raw reasoning with no JSON — gotcha 3 at prompt scale. A deferred
hedge is mandatory.

## 6. Rate limits and timeouts

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

## 7. Error codes

| Code  | Meaning                                                                           |
| ----- | --------------------------------------------------------------------------------- |
| `400` | Unknown model id — `"model not available for your channel"`                       |
| `401` | Missing or invalid key — `"missing Authorization or x-api-key header"`            |
| `404` | Wrong path. The request reached the gateway; the route does not exist             |
| `429` | Rate limited or exact model unavailable with fallback disabled. Balance untouched |

A `404` is a URL problem, never a key or model problem — those are `401` and `400`.

## 8. Configuration contract

`.env` is gitignored and holds the key. `.env.example` carries the names, **never the values.**

```bash
GONKA_API_KEY=                                          # sk-… from the Dashboard

# Two base URLs, because the SDKs append different paths. See section 1.
GONKA_BASE_URL_OPENAI=https://api.gonkarouter.io/v1     # OpenAI-style clients
GONKA_BASE_URL_ANTHROPIC=https://api.gonkarouter.io     # Anthropic-style clients

# Exact ids from GET /v1/models. Case- and slash-sensitive. Not the website's.
GONKA_MODEL_FAST=deepseek-ai/DeepSeek-V4-Flash-0731
GONKA_MODEL_DEEP=moonshotai/Kimi-K2.6
GONKA_MODEL_THIRD=MiniMaxAI/MiniMax-M2.7
```

**Account state, 2026-08-29:** balance **20.00 USDT**, monthly cost 0.00 after 9 test requests and 1,011 tokens. Tokens
are unlimited for the event; email Jack if the credit is ever exhausted.

## 9. Open decisions

Not yet decided. Each gets a subsection here, with the reasoning, once it is.

| Decision                    | Blocked on              |
| --------------------------- | ----------------------- |
| Application framework       | Concept (`PRODUCT.md`)  |
| Hosting for the live demo   | Framework               |
| Persistence, if any         | Concept                 |
| Consensus algorithm         | Concept                 |
| How provenance is displayed | Concept and `DESIGN.md` |

**What is already fixed regardless of concept:** the gateway, the model ids returned by `GET /v1/models`, the two base
URLs, the no-fallback contract, receipt verification, and the requirement that every call returns its `x-request-id`
alongside its content. The domain-specific disagreement algorithm remains open; the distinct-model eligibility gate does
not.
