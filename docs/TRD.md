# TRD, the technical reference

Canonical technical truth for this project. Where this file and any other disagree, **this file wins** — including
[`../AGENTS.md`](../AGENTS.md).

**Two halves.** Sections 1 to 8 are the GonkaRouter gateway, measured against the live API and canonical regardless of
product. Sections 9 to 18 are the Cekgu application: architecture, hosting, data model, auth, queue, consensus rule,
API, provenance display, mascot runtime and tests, and section 19 indexes the decisions. They implement
[`PRODUCT.md`](PRODUCT.md) and satisfy [`PRD.md`](PRD.md), and cite requirement ids where a section discharges one.

The initial verified sections were measured against the live API on **2026-08-29** with our own key. Receipt and
fallback behaviour was verified on **2026-08-31**; availability and account concurrency were measured again on
**2026-09-03** and are dated where introduced. Where a measurement contradicts organizer material, the measurement is
recorded and the contradiction is named.

The application decisions were taken on **2026-09-03**, and the application described in sections 9 to 19 shipped that
day and is deployed. Where this half of the document describes gateway behaviour, it remains a measurement record rather
than a description of our code.

Contents:

1. [Gateway, base URLs and auth](#1-gateway-base-urls-and-auth)
1. [Endpoints](#2-endpoints)
1. [Models, measured](#3-models-measured)
1. [Request IDs and provenance](#4-request-ids-and-provenance) — the track's hard requirement
1. [Verified gotchas](#5-verified-gotchas)
1. [Rate limits and timeouts](#6-rate-limits-and-timeouts)
1. [Error codes](#7-error-codes)
1. [Configuration contract](#8-configuration-contract)
1. [Application architecture](#9-application-architecture)
1. [Hosting and CI/CD](#10-hosting-and-cicd)
1. [Data model](#11-data-model)
1. [Auth and the Guest account](#12-auth-and-the-guest-account)
1. [Queue and worker](#13-queue-and-worker)
1. [Consensus rule](#14-consensus-rule)
1. [API contracts](#15-api-contracts)
1. [Provenance display](#16-provenance-display)
1. [Mascot runtime](#17-mascot-runtime)
1. [Testing](#18-testing)
1. [Decided](#19-decided)
1. [Reading a paper from an upload](#20-reading-a-paper-from-an-upload) — the one non-Gonka call

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

**Availability, measured 2026-09-02, about 22:40 MYT.** Later the same evening the roles swapped:
`deepseek-ai/DeepSeek-V4-Flash-0731` returned `429` on every call, sequential single requests included, with
`X-Gonka-No-Fallback: true` set, body
`{"error":{"message":"rate limit exceeded: too many concurrent requests","type":"upstream_error"}}`, while Kimi answered
in about 50 s and MiniMax in 8–23 s. Single run.

**Interpretation, not yet shown to generalise.** Upstream availability rotates across the three models within a single
evening. Treat the labs as interchangeable readers, run on whichever two are up, and prove distinctness by receipt
rather than by which model was asked for. Detail in
[`superpowers/research/gateway-capabilities.md`](superpowers/research/gateway-capabilities.md#measured-2-september-2026).

**Availability, measured 2026-09-03, 00:49–01:08 MYT.** In a controlled two-pass benchmark of 12 short CS questions,
MiniMax completed **24 of 24** item calls, while Kimi completed **13 of 24** before a 90-second cutoff. Kimi had no
completion inside 30 seconds, and separate short health probes returned an upstream `429` and then a 90-second timeout
from DeepSeek.

Of 24 item-runs, 13 obtained two receipt-verified model families and none obtained two within 30 seconds. Full method
and request-id examples are in
[`three-day-rescore.md`](superpowers/research/three-day-rescore.md#the-mechanism-benchmark--failed-3-september).

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
4. Poll `GET /v1/receipts/{x-request-id}` until it answers, then require the receipt's `model` to equal
   `requested_model`. The receipt lags the response and a single immediate fetch always misses it, which is
   [gotcha 11](#5-verified-gotchas).
5. Admit a result to consensus only when at least two successful records have different `served_model` values.

Failure at any step returns **verification unavailable**, never a consensus answer. The receipt is unsigned gateway
metadata: it makes the serving model publicly inspectable, but it is not cryptographic or on-chain proof.

## 5. Verified gotchas

| #   | Gotcha                                               | Detail                                                                                                                                                         |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`<think>` leaks into MiniMax content**             | `MiniMaxAI/MiniMax-M2.7` emits raw `<think>…` inside the message content, on **both** surfaces. Verified twice. Must be stripped before display or comparison  |
| 2   | **Kimi leaks a stray `</think>`**                    | Observed `" p </think> pong"` on a short reply. Same stripping applies                                                                                         |
| 3   | **Low `max_tokens` yields reasoning only**           | At `max_tokens=64`, MiniMax spent all 64 on `<think>` and returned no answer. **Keep `max_tokens >= 1024`**                                                    |
| 4   | **Website model ids are wrong**                      | See [models](#3-models-measured). Trust `GET /v1/models`                                                                                                       |
| 5   | **`/v1` asymmetry between protocols**                | See [the base URL rule](#1-gateway-base-urls-and-auth)                                                                                                         |
| 6   | **Prompt caching unsupported**                       | The gateway does not implement Anthropic's prompt-caching headers. Disable client-side (`DISABLE_PROMPT_CACHING=1` for Claude Code)                            |
| 7   | **Silent model fallback**                            | Send `X-Gonka-No-Fallback: true`; reject `X-Gonka-Fallback`; verify the served model via the public receipt before consensus                                   |
| 8   | **Identical request bodies are cached**              | Byte-identical bodies in 70–190 ms for a repeated identical request at `temperature: 0.8`, each with a fresh id and receipt. Detail below                      |
| 9   | **Long prompts yield reasoning only**                | On prompts around 1,500 tokens MiniMax failed roughly one call in three, once as raw reasoning with no JSON. Detail below                                      |
| 10  | **Account concurrency is below the published burst** | A 36-call item fan-out returned account-level `429` responses instructing us to lower parallelism; four concurrent calls were accepted. Detail below           |
| 11  | **The receipt is written asynchronously**            | `GET /v1/receipts/{id}` returns `404` immediately after the response and `200` about a second later. Verifying inline fails closed on every call. Detail below |

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

**Gotcha 11, measured 2026-09-03.** The public receipt is not there when the response is. Six calls across MiniMax and
Kimi all returned `404` from `GET /v1/receipts/{x-request-id}` on the first fetch after the body was read, and `200`
between 664 ms and 808 ms later. Path, auth and query-string variants were all `404` in that window, so this is
propagation delay rather than a wrong URL — the endpoint is unauthenticated and takes the id exactly as the header gives
it.

**A client that verifies the receipt inline and fails closed on `404` produces `unverified` for every item and no
verdict ever renders.** Poll with a short interval and a budget of a few seconds instead; the shipped client polls at
250 ms intervals with a 5 s budget. The body is:

```json
{
  "x_request_id": "req-1788416980465962869-369929",
  "x_devshard_id": "70158",
  "model": "moonshotai/Kimi-K2.6",
  "created_at": "2026-09-03T06:29:40Z",
  "outcome": "success",
  "status_code": 200,
  "stream": false,
  "total_tokens": 19,
  "ttft_ms": 4,
  "duration_ms": 4
}
```

**The fallback substitution, reproduced 2026-09-03.** `deepseek-ai/DeepSeek-V4-Flash-0731` was saturated, which made the
guard in [section 4](#cross-verification-validity-contract) demonstrable on one pair of calls:

- **With `X-Gonka-No-Fallback: true`:** `429`, `rate limit exceeded: too many concurrent requests`, no `x-request-id` at
  all.
- **Without the header:** `200`, `X-Gonka-Fallback: deepseek-ai/DeepSeek-V4-Flash-0731 -> MiniMaxAI/MiniMax-M2.7`.

The body's own `model` field read `MiniMaxAI/MiniMax-M2.7`. So a DeepSeek and MiniMax pair requested without the header
would have been MiniMax twice, and nothing in the response body would have said so. Note the header's format is
`<requested> -> <served>`, and that the `429` carries no `x-request-id`, so a rejected call has no receipt to show.

**Gotcha 10, measured 2026-09-03.** A 36-call item-level fan-out produced account-level `429` responses. A controlled
wave of four concurrent calls was accepted.

```json
{
  "error": {
    "code": "rate_limited",
    "message": "too many concurrent requests for this account; lower your parallelism and retry"
  }
}
```

This is one account and one window, so four is a measured safe point, not a documented limit. Bound concurrency and
retry `429`; do not launch one request per item across a paper at once.

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

The published burst did not hold for our account on 3 September. `429` does not consume balance, but aggressive fan-out
is not safe for latency or UX. Use a bounded queue, back off and retry, and treat four concurrent calls as a measured
safe point rather than a guaranteed ceiling.

## 7. Error codes

| Code  | Meaning                                                                           |
| ----- | --------------------------------------------------------------------------------- |
| `400` | Unknown model id — `"model not available for your channel"`                       |
| `401` | Missing or invalid key — `"missing Authorization or x-api-key header"`            |
| `404` | Wrong path. The request reached the gateway; the route does not exist             |
| `429` | Rate limited or exact model unavailable with fallback disabled. Balance untouched |

A `404` is a URL problem, never a key or model problem — those are `401` and `400`.

## 8. Configuration contract

`.env` is gitignored and holds the values locally. `.env.example` carries the names, **never the values.** In production
every variable below is a Cloud Run environment variable set at deploy time from a GitHub Actions secret of the same
name; see [Hosting and CI/CD](#10-hosting-and-cicd). Secret Manager is not used.

```bash
GONKA_API_KEY=                                          # sk-… from the Dashboard. Server only, never in the client bundle
GONKA_BASE_URL_OPENAI=https://api.gonkarouter.io/v1     # The product uses the OpenAI surface only. See section 1

DATABASE_URL=                                           # Neon Postgres connection string, pooled, sslmode=require

BETTER_AUTH_SECRET=                                     # 32+ random bytes; signs sessions
BETTER_AUTH_URL=                                        # Public origin of the deployment, no trailing slash
GOOGLE_CLIENT_ID=                                       # Google OAuth web client
GOOGLE_CLIENT_SECRET=

GUEST_EMAIL=                                            # The one seeded Guest user. See section 12
GUEST_PASSWORD=                                         # Used server-side only by POST /api/auth/guest

MASCOT_ENABLED=false                                    # FR-MASCOT-1 feature flag. true for the demo
```

The three model ids are not configuration. They are a constant list in `src/server/gateway/models.ts`. **They are not
verified against `GET /v1/models` at start**, which was the intention when this section was first written and is not
what shipped: a renamed id would surface as a `400` on the first call of a round rather than as a loud failure at boot.
The gateway has returned the same three ids on every check since 29 August, so the exposure is a gateway rename during
the event, and the round's own rejection path records it as an attempt with its reason rather than losing it.

**Adding the check now would be worse than the gap it closes**, which is the reason it is not a to-do. A boot-time
`GET /v1/models` makes the process's ability to start depend on the gateway being reachable, and
[gotcha 10](#5-verified-gotchas) is account-level rate limiting that reaches every endpoint. A window like the twenty
minutes DeepSeek spent returning `429` on 3 September would then have meant no deploy succeeding and Cloud Run holding
no healthy revision to route to: a total outage manufactured by the guard against a partial one.

The queue's whole design treats the gateway as unreliable and degrades around it, and boot must not treat it as a
precondition. The Anthropic surface is unused by the product; the base-URL rule in
[section 1](#1-gateway-base-urls-and-auth) still stands for anyone pointing Claude Code at the gateway.

**`.env.example` carries exactly the names above**, with their comments and empty values, and is committed. The
`env-drift` hook compares `.env` against it, so the two files change together. Two further variables exist in the
server's environment and deliberately do not appear here: `MIGRATE_ON_START` and `WORKER_ENABLED`, both defaulting to
on, which only a preview revision sets to `false`. They are explained in [section 10](#10-hosting-and-cicd), because
they are a deployment concern rather than part of the contract a developer fills in. `PORT` defaults to `8080`.

**Account state, 2026-08-29:** balance **20.00 USDT**, monthly cost 0.00 after 9 test requests and 1,011 tokens. Tokens
are unlimited for the event; email Jack if the credit is ever exhausted.

## 9. Application architecture

One Bun process serves everything: a Hono HTTP server that exposes the JSON API under `/api`, serves the built React
client from the same origin, and runs the queue worker in-process. There is no separate worker service, no message
broker and no edge runtime.

**Why one process.** The queue is bounded at four gateway calls in flight for the whole account
([gotcha 10](#5-verified-gotchas), FR-QUEUE-1, NFR-PERF-3). A single process holds that cap in one in-memory semaphore
with nothing to coordinate. Splitting API and worker would need a shared counter and a second deployable two days before
submission, for no gain the demo can show. Same-origin serving removes CORS and cookie-domain configuration from the
critical path, and Bun runs TypeScript directly so the server has no build step.

### Repository layout

```text
src/
  client/            Vite + React 19 single-page app, TypeScript strict, Tailwind v4
  server/            Hono on Bun: /api routes, static serving, the queue worker
    db/              the Drizzle schema and the pooled connection
    gateway/         the hand-rolled fetch client, reading admission, the model-id constant (sections 14 and 8)
    queue/           claim, round, hedge, health, semaphore, worker (section 13)
    records/         the query layer the records routes call
    routes/          one file per resource in section 15
    fixtures/        the committed evaluation set and the benchmark pass the sample is seeded from
    index.ts         entry point: migrate, seed the Guest user and sample, start the worker, listen
  shared/            TypeScript types, zod schemas, verdict.ts (the rule as a pure function)
public/              static assets, copied into the client build as-is
  brand/             logo, favicon, the still mascot PNGs
  live2d/            tororo/runtime and hijiki/runtime, committed Cubism runtime files
drizzle/             SQL migrations generated by drizzle-kit, committed
e2e/                 Playwright: smoke.e2e.ts against a deployed URL, flow.e2e.ts behind E2E_FLOW=1
.github/workflows/   ci.yml (pull request) and deploy.yml (main)
Dockerfile           multi-stage on oven/bun:1
vite.config.ts       client build, dev proxy of /api to the server
drizzle.config.ts    schema path, migrations folder, DATABASE_URL
```

`src/shared` is imported by both halves and contains no I/O. Anything that touches `fetch`, the database or the DOM
lives on its own side. The zod schemas in `src/shared` validate API bodies on the server and form input on the client
from one definition, which is what keeps FR-CHECK-2's server-side checks equal to the client's.

### Stack

| Layer             | Choice                                        | Reason                                                                                  |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Runtime, packages | Bun                                           | Already the project's runner; runs TypeScript without a compile step                    |
| HTTP              | Hono                                          | Small, typed, runs on Bun natively, streams SSE without an adapter                      |
| Client            | Vite 8, React 19, React Router 8, Tailwind v4 | Fast build, no framework server to host; the app is one SPA behind `/api`               |
| Language          | TypeScript 7, strict                          | `noUncheckedIndexedAccess`; the shared types are the contract between the halves        |
| ORM               | Drizzle with drizzle-kit migrations           | Schema in TypeScript, SQL migrations committed, Better Auth adapter exists              |
| Auth              | Better Auth                                   | Google OAuth and email/password with a Drizzle adapter, sessions in Postgres            |
| Validation        | zod, in `src/shared`                          | One schema for the form and the API boundary                                            |
| Lint, format      | Biome for code, Prettier for Markdown         | Unchanged from the tooling table in [`AGENTS.md`](../AGENTS.md#tech-stack-and-commands) |
| Tests             | `bun test`, Playwright                        | See [Testing](#18-testing)                                                              |

The client talks to the server only through the contracts in [section 15](#15-api-contracts). The GonkaRouter key never
reaches the client (NFR-SEC-2); every inference call originates in `src/server/gateway`.

## 10. Hosting and CI/CD

### Cloud Run

One Cloud Run service, `cekgu`, in GCP project `muba-m1ku`, region `asia-southeast1`. The container image lives in the
Artifact Registry Docker repository `cekgu` in the same region, at
`asia-southeast1-docker.pkg.dev/muba-m1ku/cekgu/cekgu`.

| Setting         | Value                        | Why                                                                            |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| Min instances   | 1                            | The worker must exist to drain the queue when nobody is looking                |
| CPU allocation  | Always allocated             | Request-only CPU would freeze the worker between HTTP requests                 |
| Max instances   | 1                            | The four-call cap is an in-memory semaphore; two instances would make it eight |
| Memory          | 1 GiB                        | Headroom for the in-process worker and the Neon connection pool                |
| Request timeout | 300 s                        | SSE connections in section 15 stay open; the client reconnects after this      |
| Ingress, auth   | All traffic, unauthenticated | The app does its own auth; judges open the URL cold                            |

**Why Cloud Run, and one region.** The team lead's GCP project is the account the team can reach by CLI today, and Cloud
Run is the one managed runtime there that keeps a process alive between requests without a VM to patch. Singapore is the
closest region to the Kuala Lumpur demo and to the Neon database, so the two hops the product cannot avoid, browser to
server and server to database, are both short. Multi-region would only add a second place for the worker to be.

The Dockerfile is multi-stage on `oven/bun:1`: stage one runs `bun install --frozen-lockfile` and `bun run build` for
the client; stage two copies `src/`, `drizzle/`, `public/` and the built client, and starts with
`bun src/server/index.ts`. The server runs pending migrations at start, so a deploy that adds a migration needs no
separate step.

### GitHub Actions

Two workflows. Authentication to GCP is `google-github-actions/auth` with `credentials_json` from the repository secret
`GCP_SA_KEY`, a JSON key for a service account holding **Cloud Run Admin**, **Artifact Registry Writer** and **Service
Account User**. Workload identity federation would be better and is a post-hackathon change; a JSON key is one
`gcloud iam service-accounts keys create` away and nothing here outlives the event.

**On pull request** (`ci.yml`), in order, failing fast:

1. `bun install --frozen-lockfile`
1. `bun run lint`
1. `bun run typecheck`
1. `bun test`
1. Build the image, tag it with the commit SHA, push to Artifact Registry
1. `gcloud run deploy cekgu --image <sha image> --tag pr-<number> --no-traffic --set-env-vars ...`

The tagged revision gets its own URL, `https://pr-<number>---cekgu-<hash>.asia-southeast1.run.app`, and the job posts it
as a PR comment. Any teammate's PR gets one; it serves no production traffic. A second job, triggered on the PR closing,
runs `gcloud run services update-traffic cekgu --remove-tags pr-<number>` so revisions do not accumulate.

**On merge to `main`** (`deploy.yml`): the same steps, then `gcloud run deploy cekgu --image <sha image>` with traffic,
so the production URL always runs the head of `main`.

**Traffic is routed explicitly, and the routing is asserted.** A preview deploy rewrites the service's traffic block
from the implicit "latest revision" pointer to an explicit revision pin. Once pinned, a plain `gcloud run deploy`
uploads a new revision and **does not move traffic to it**, while still reporting success.

That failure is silent, and it happened: production served the #19 scaffold through four later deploys before anyone
noticed. `GET /` answers 200 on every revision, so only `POST /api/auth/guest`, which exists in one revision and not the
other, exposed it. Three steps in `deploy.yml` close it:

1. Deploy the image.
2. Route with `gcloud run services update-traffic cekgu --to-revisions <revision>=100`, naming the revision that run
   built rather than `--to-latest`, which a concurrent preview deploy could win.
3. Re-read the service and fail the run unless the revision serving 100% is **the one that run deployed** and `GET /`
   returns 200.

Step 3 compares against that revision rather than against the service's newest, because a preview deploy for any open
pull request creates newer revisions continuously; comparing against those failed a deploy whose traffic was in fact
correct. Removing a tag with `update-traffic --remove-tags` and routing with `--to-revisions` both leave other tags
intact, so preview URLs on open pull requests survive a production deploy.

### Configuration at deploy time

Every variable in [section 8](#8-configuration-contract) is a GitHub Actions secret of the same name and is passed on
every deploy, preview and production alike, with `--env-vars-file` rather than `--set-env-vars`.

- **Do not "fix" that back.** `--set-env-vars` is comma-delimited and a Neon connection string can contain a comma.
  gcloud's custom-delimiter escape hatch does not save it either, because `@`, `|` and `:` all occur in connection
  strings and passwords. The file form is JSON, which gcloud's YAML parser accepts, so every value survives verbatim.
- **The variable list lives once**, in `.github/scripts/render-env-vars.sh`. A name with no repository secret is omitted
  rather than written empty, so the server sees it unset.
- **Secret Manager is explicitly not used.** It would add IAM bindings, a second console and a `--set-secrets` mapping
  to keep in step, for a key that already lives in GitHub's secret store and is rotated by pasting a new value.

Cloud Run environment variables are visible to anyone with viewer access to the project; that is the whole team, which
is the intended audience.

Previews share production's values, including `DATABASE_URL`, so a preview writes to the production database. That is
acceptable for a two-day window with one shared Guest workspace, and is stated here so nobody is surprised. It has two
consequences:

- **Google OAuth on a preview URL fails the redirect-URI check**, because only the production origin is registered.
  Previews are tested through Guest and email sign-in instead.
- **`BETTER_AUTH_URL` is set to the production origin**, yet `POST /api/auth/guest` on a preview sets a cookie for the
  preview origin only, because Better Auth derives the cookie domain from the request rather than from that variable.

**Sharing the database is not the same as sharing the right to change it.** A preview revision additionally sets
`MIGRATE_ON_START=false` and `WORKER_ENABLED=false`. Without them, opening a preview URL — which CI posts on the pull
request so that people click it — boots an unreviewed revision that applies that branch's pending migrations to the
production database and starts its own copy of every background timer against production rows. `--min-instances 0`
narrows the window to "while a tab is open"; it does not close it.

Both variables default to on when unset, so production, local development and a developer's own `.env` are unaffected,
and neither name belongs in [section 8](#8-configuration-contract). A preview still serves the full UI and API against
production data, which is what this section wanted; it simply cannot alter the schema or delete rows on a timer.

## 11. Data model

Neon Postgres, Singapore region (`ap-southeast-1`), one database, one schema. Drizzle ORM defines the tables in
`src/server/db/schema.ts`; `drizzle-kit generate` writes SQL into `drizzle/`, and the server applies pending migrations
at start.

**Why Neon and Postgres.** Records are the product memory ([product principle 5](PRODUCT.md#product-principles)), so
they need a database that survives a redeploy, which rules out SQLite on Cloud Run's ephemeral disk. The queue claim in
[section 13](#13-queue-and-worker) relies on `SELECT ... FOR UPDATE SKIP LOCKED`, which Postgres has and a document
store does not. Neon is a managed Postgres with a free tier, a Singapore region, and a connection string, which is all
the project needs from a database vendor this week.

### Entities

A **user** owns **records**. A record is one submitted check and holds its **items**, one per multiple-choice question.
Each item accumulates **attempts**, one row per gateway call including hedges, retries and rejected calls, and
**dispositions**, one row per human decision. Verdicts live on the item; attempts carry the provenance that justifies
the verdict; dispositions never overwrite either (FR-RECORD-4). Better Auth owns `user`, `session`, `account` and
`verification` and the schema for those four is generated by its CLI, not written by hand.

The one denormalisation is `items.verdict`, which is derivable from the item's admitted attempts. It is stored because
the records library needs attention counts per record (FR-RECORD-5) without a join over every attempt.

### Schema

```ts
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema"; // generated by Better Auth: user, session, account, verification

export const recordStatus = pgEnum("record_status", [
  "queued",
  "checking",
  "ready",
  "in_review",
  "resolved",
]);
export const itemStatus = pgEnum("item_status", ["queued", "running", "done"]);
export const verdict = pgEnum("verdict", [
  "clear",
  "possible_key_error",
  "possible_ambiguity",
  "split_opinion",
  "unverified",
  "pending",
]);
export const receiptStatus = pgEnum("receipt_status", [
  "pending",
  "verified",
  "mismatch",
  "missing",
]);
export const dispositionKind = pgEnum("disposition_kind", [
  "key_corrected",
  "wording_revised",
  "key_confirmed",
  "flag_dismissed",
  "retry_requested",
]);

export const records = pgTable("records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  language: text("language").notNull(),
  context: text("context"),
  status: recordStatus("status").notNull().default("queued"),
  isSample: boolean("is_sample").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("records_user_id_deleted_at_idx").on(table.userId, table.deletedAt),
]);

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  recordId: uuid("record_id")
    .notNull()
    .references(() => records.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  stem: text("stem").notNull(),
  options: jsonb("options")
    .$type<{ letter: string; text: string }[]>()
    .notNull(),
  key: text("key").notNull(),
  verdict: verdict("verdict").notNull().default("pending"),
  verdictReason: text("verdict_reason"),
  status: itemStatus("status").notNull().default("queued"),
  attemptsUsed: integer("attempts_used").notNull().default(0),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
}, (table) => [
  index("items_record_id_status_idx").on(table.recordId, table.status),
  index("items_status_idx").on(table.status),
  unique("items_record_id_position_key").on(table.recordId, table.position),
]);

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  requestedModel: text("requested_model").notNull(),
  servedModel: text("served_model"),
  requestId: text("request_id"),
  devshardId: text("devshard_id"),
  fallbackHeader: text("fallback_header"),
  httpStatus: integer("http_status"),
  receiptStatus: receiptStatus("receipt_status").notNull().default("pending"),
  receiptJson: jsonb("receipt_json"),
  readingJson: jsonb("reading_json").$type<Reading>(),
  latencyMs: integer("latency_ms"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  admitted: boolean("admitted").notNull().default(false),
  rejectionReason: text("rejection_reason"),
}, (table) => [
  index("attempts_item_id_started_at_idx").on(table.itemId, table.startedAt),
]);

export const dispositions = pgTable("dispositions", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  kind: dispositionKind("kind").notNull(),
  revisedKey: text("revised_key"),
  revisedText: text("revised_text"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("dispositions_item_id_created_at_idx").on(table.itemId, table.createdAt),
]);

export const modelHealth = pgTable("model_health", {
  model: text("model").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  successes: integer("successes").notNull().default(0),
  failures: integer("failures").notNull().default(0),
  medianLatencyMs: integer("median_latency_ms"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

Notes on the shape:

- `records.status` has no `deleted` value. Deletion is `deleted_at`; a soft-deleted private record is filtered from
  every list and is purged by `sweepRetiredRecords` once `TRASH_DAYS` have passed (FR-RECORD-7). A Guest deletion is a
  hard `DELETE` and cascades
- `records.updated_at` is what retention is measured from, so a record still being worked on does not age out
  (FR-RECORD-8)
- `records.expires_at` is set to creation plus 24 hours for Guest records and left null for private ones (FR-AUTH-4)
- `items.options` is an ordered array of `{letter, text}`; `items.key` is a letter. Learner data has no column anywhere
  (NFR-SEC-3, FR-RECORD-1)
- `attempts.request_id` is nullable because a timed-out call returns no headers, and the row still exists so the
  evidence view can say so (FR-EVIDENCE-2, NFR-PROV-3)
- `attempts.reading_json` is the parsed [reading](#14-consensus-rule) after tag stripping; the raw content is not stored
- A disposition of kind `retry_requested` marks a round boundary: the rule considers attempts whose `started_at` is
  after the latest such disposition, so a retry never counts an earlier reading twice (FR-QUEUE-5)
- `model_health` is the on-disk mirror of the worker's in-memory stats, one row per model, written every 30 seconds and
  read by `GET /api/health`
- `items.claimed_at` records when the worker took the item. A claim older than the fifteen-minute lease in
  [section 13](#13-queue-and-worker) is released back to `queued`, so a crash mid-round does not strand an item
- The unique constraint on `(record_id, position)` is what makes an item's position in the paper its identity, so a
  duplicated submission cannot produce two item 3s

## 12. Auth and the Guest account

Better Auth with the Drizzle adapter, sessions stored in Postgres and carried by an HTTP-only cookie. Two sign-in
methods: Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and email plus password. Better Auth mounts at
`/api/auth/*`; its own endpoints are not repeated in [section 15](#15-api-contracts).

**Why Better Auth.** The PRD's open question was whether private accounts use links, passwords or a provider. Google
covers the tutor with a Gmail account, password covers everyone else and the seeded Guest, and Better Auth ships both
with a Drizzle adapter so the session table is a migration, not code. Writing session handling by hand is the kind of
work that looks like an afternoon and costs the demo.

### The shared Guest account

The Guest account is one ordinary user row, seeded at server start if missing, whose email is `GUEST_EMAIL`. There is no
guest role, flag or column: a request is a Guest request when `session.user.email === GUEST_EMAIL`, and the Guest
limits, warning banner and deletion behaviour key off that one comparison.

`POST /api/auth/guest` signs the caller into that user server-side. The handler calls Better Auth's email sign-in with
`GUEST_EMAIL` and `GUEST_PASSWORD` from the environment and forwards the resulting `Set-Cookie` to the browser. The
password never leaves the server and is never shown to a visitor. Every guest therefore holds a session on the same user
and shares one library, which is exactly what [PRODUCT.md](PRODUCT.md#the-shared-guest-account) asks for (FR-AUTH-2).

Server-side limits on Guest requests (FR-AUTH-5): **12 items** per record, **2,000 characters** per item across stem and
options, **20 non-sample records** at once.

The worker runs two sweeps. `sweepExpiredGuestRecords` runs every five minutes and hard-deletes Guest records whose
`expires_at` has passed. `sweepRetiredRecords` runs hourly, hard-deletes any record whose `deleted_at` is more than
`TRASH_DAYS` old, and hard-deletes any record untouched for `RETENTION_DAYS` (FR-RECORD-7, FR-RECORD-8). Both windows
live in `src/shared/schemas.ts` because Settings prints them, so the notice and the sweep cannot drift apart. The hourly
cadence is deliberate: the shorter of the two windows is thirty days.

Both sweeps exempt `is_sample = true`. The sample record is owned by the Guest user, is the one record with that flag,
and is refused by every mutating route except dispositions (FR-SAMPLE-2, FR-SAMPLE-3).

## 13. Queue and worker

The worker is a loop inside the server process. It claims one queued item at a time, runs its reading round, writes the
verdict, and goes back for the next. It discharges FR-QUEUE-1 to FR-QUEUE-3 and NFR-OPS-1.

**Why this shape.** The 3 September benchmark ([section 3](#3-models-measured)) showed that no item obtained two
verified readings inside 30 seconds and that a 36-call fan-out was refused. A queue with a small fixed cap is the only
design that is honest about that: it never tells the gateway to do more than four things, it makes waiting an ordinary
state, and it lets the record fill in item by item while the educator does something else.

### Claiming

```sql
UPDATE items SET status = 'running'
WHERE id = (
  SELECT id FROM items WHERE status = 'queued'
  ORDER BY record_id, position
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *
```

`SKIP LOCKED` means a second worker, or the same worker after a crash-restart, never claims an item another loop already
holds, and a crashed claim is released with its transaction. On start the worker resets any item left in `running` to
`queued`, because a Cloud Run restart mid-round leaves no one to finish it.

A claim also carries a **fifteen-minute lease**. `items.claimed_at` is stamped when the item is taken, and a sweep
returns any item whose claim is older than the lease to `queued`. `SKIP LOCKED` protects against two workers racing; the
lease protects against the case it cannot see, which is a worker that took an item and then died without its transaction
rolling back — a Cloud Run instance replaced mid-round leaves exactly that.

### One round

1. Take the **healthy set**: the three model ids ordered by rolling 15-minute success rate, then median latency, from
   the in-memory health stats. A model with zero successes and at least three failures in the window is excluded —
   unless fewer than two would remain, in which case the excluded families are **demoted to the end of the order rather
   than dropped**. One candidate cannot produce two distinct readings, so dropping the second guarantees **Unverified**
   without a call being attempted, and a struggling family is strictly better than a certain failure.

   **The trade is not free.** When a family really is down, demoting it turns an instant **Unverified** into a slow one:
   the seat now spends up to three attempts of 90 s on it before moving. On a projector that is an item resolving in
   half a minute against four and a half.

1. Request the top two families **in parallel**, each through the [gateway client](#14-consensus-rule) and each holding
   one slot of the global semaphore of **4**
1. **Deferred hedge:** if a call has not returned after **45 s**, fire a duplicate of the same call to the same model,
   holding another slot. Whichever returns first is the candidate; the other is recorded and discarded
1. **Hard cutoff** at **90 s** per call. A call past the cutoff is aborted and recorded as timed out with no request id
   A second ceiling of **120 s** bounds the whole call including its receipt poll, because a receipt fetch that never
   resolves would otherwise hold a seat open indefinitely; it is the outer bound, and the 90 s cutoff is what the
   evidence view names.
1. If one family fails, after rejection, timeout or a non-200, try the **third family** for that seat
1. Each model has a **retry budget of three attempts per item** per round, hedges included. When both seats have an
   admitted reading, or every family in the healthy set has exhausted its budget, the round ends
1. Apply the [rule](#14-consensus-rule) to the admitted readings and write `items.verdict` and `items.verdict_reason`

Every call, admitted or not, is one row in `attempts`. A `429` is recorded, counted against the budget, and retried
after a 30-second backoff (FR-QUEUE-1). The hedge fires at 45 s rather than the tech lead's 1.5–2 s because our measured
floor is different: nothing completed under 30 s on 3 September, so a 2 s hedge would double every call for no gain, and
45 s still catches the 60–90 s tail that [gotcha 9](#5-verified-gotchas) describes.

**Revised from 25 s to 45 s, measured 3 September.** At 25 s the hedge fired on nearly every call: Kimi answered an
eight-token prompt in 24.8 s and a solver prompt in 52.7 s, and MiniMax's median moved between 12.6 s and 29 s across
two runs an hour apart.

Almost every reading therefore cost two gateway calls and two of the four semaphore slots, and that doubling is what
produces the account-level `429`s in [gotcha 10](#5-verified-gotchas). Those failures are what marks a family unhealthy,
and a round left with one healthy candidate cannot produce two distinct readings at all — so the hedge meant to rescue a
slow call was manufacturing the outage it was hedging against.

**25 s was an arithmetic slip rather than a judgement call**, and it is worth naming so nobody reintroduces it. The
paragraph above justifies rejecting a 2 s hedge because "nothing completed under 30 s on 3 September" — and 25 s is also
below that floor. The sentence refutes 25 s exactly as it refutes 2 s, fifteen words apart.

The hedge also duplicates **the same model**, not a third family, so firing it below the completion floor puts a second
concurrent call into the model already struggling. 45 s is weakly dominant: when the gateway is fast the hedge never
fires and the constant does not matter, and when it is slow 45 s is what stops the doubling.

**Deriving the threshold from the rolling median** the health ring already keeps is the principled version, and it is
deliberately not done here. A behaviour change to the queue this close to the deadline is a bad trade, and a constant
that can be reasoned about beats an adaptive rule that cannot. The retry budget, not the hedge, is what sits closest to
NFR-PERF-2's five-minute p95: three attempts at 90 s plus a 30 s backoff is 360 s on one family.

The budget is **three** attempts per family, matching the PRD's FR-QUEUE-3. The measured Kimi completion rate of 13 of
24 makes a third attempt worth its cost, and three parallel attempts of at most 90 s each stay inside the PRD's
five-minute verdict target.

### Record status

After each item the worker recomputes the record: `checking` while any item is `queued` or `running`, `ready` when every
item is `done` (FR-RECORD-2). `in_review` and `resolved` are set by the disposition route, not the worker.

### Health

Per model, the worker keeps a ring of the last 15 minutes of outcomes and latencies in memory and mirrors them to
`model_health` every 30 seconds. `GET /api/health` reads the table so the status display survives a restart with the
last known picture rather than an empty one.

## 14. Consensus rule

### Gateway client

`src/server/gateway/client.ts` is a hand-rolled `fetch` against the OpenAI surface, because the SDK discards the
response headers that carry the request id ([section 4](#4-request-ids-and-provenance)). It implements the
[validity contract](#cross-verification-validity-contract) and nothing else:

1. `POST {GONKA_BASE_URL_OPENAI}/chat/completions` with headers `Authorization: Bearer`, `content-type` and
   `X-Gonka-No-Fallback: true`
1. The body carries `max_tokens: 1024` and the prompt with a trailing comment line `// nonce: <uuid>` so byte-identical
   items are not served from the gateway cache ([gotcha 8](#5-verified-gotchas), FR-QUEUE-2)
1. Read `x-request-id`, `x-devshard-id` and `X-Gonka-Fallback` from the response headers before touching the body
1. Strip `<think>…</think>` and any orphaned tag from the content ([gotcha 1](#5-verified-gotchas), NFR-PROV-4)
1. Parse the reading JSON
1. `GET /v1/receipts/{x-request-id}` and require its `model` to equal the requested model

Step 6 polls rather than fetches once, because the receipt is written asynchronously ([gotcha 11](#5-verified-gotchas)).
Step 5 is not the client's: parsing the reading needs the item's option letters and the client takes a model and a
string, so `admitReading` in `src/server/gateway/reading.ts` does it as part of the admission test below.

It returns one provenance record:

```ts
type Provenance = {
  content: string;
  requestId: string | null;
  devshardId: string | null;
  requestedModel: string;
  servedModel: string | null; // from the receipt, never from what was requested
  fallbackHeader: string | null;
  receiptStatus: "verified" | "mismatch" | "missing";
  receipt: Receipt | null; // the receipt body, for attempts.receipt_json
  httpStatus: number | null; // null when the call never returned
  latencyMs: number;
  error: string | null; // the first failed step, or null
};
```

`receipt`, `httpStatus` and `error` are columns in [`attempts`](#11-data-model) and this is the only layer that sees
them; `error` becomes `attempts.rejection_reason` when the admission test refuses the call.

### The reading

The solver prompt contains the stem, the lettered options, and the record's subject and language as metadata. It
**never** contains the supplied key or another model's output (FR-QUEUE-2). It asks for exactly this JSON:

```json
{
  "answer": "<option letter>",
  "defensible": ["<letters>"],
  "reason": "<two sentences>"
}
```

`answer` is the one option the model commits to; `defensible` lists every option it considers defensible, which should
include `answer`; `reason` is shown beside the reading in the evidence view.

### Admission and distinctness

A reading is **admitted** when all of these hold, and rejected with the first failing one as `rejection_reason`:

1. HTTP 200
1. No `X-Gonka-Fallback` header (NFR-PROV-1)
1. Receipt fetched and its `model` equals the requested model (NFR-PROV-2, FR-VERDICT-1)
1. The content parses as the reading JSON
1. `answer` is one of the item's option letters

Two admitted readings are **distinct** when their receipt `model` values differ. Distinctness is proven by receipt, not
by which model was asked for, because availability rotated across all three models within one evening
([section 3](#3-models-measured)).

### The rule

The rule is a pure function in `src/shared/verdict.ts`, applied to exactly the first two admitted distinct readings of
the current round, in the order below. It is the [machine verdict table](PRODUCT.md#machine-verdicts) made executable
(FR-VERDICT-2, FR-VERDICT-3).

```ts
import type { Option, Reading, Verdict } from "./types";

export function verdict(
  readings: Reading[],
  key: string,
  options: Option[],
): { verdict: Verdict; reason: string };
```

`Reading`, `Verdict` and `Option` live in [`src/shared/types.ts`](../src/shared/types.ts) and are imported, not
redeclared here; the client needed them before this function existed. `options` is the item's option list, and it is a
parameter because `answer` and `key` are option **letters** while FR-VERDICT-4 requires the printed reason to name
options in words — "Both readers chose Queue. The supplied key is Stack." A letter with no matching option falls back to
the letter itself rather than rendering an empty string.

| Check, in order                                       | Verdict                | Reason shown                                                                        |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| Fewer than two admitted readings with distinct models | **Unverified**         | Fewer than two distinct, receipt-verified readings survived, so no verdict is given |
| The two `answer` values differ                        | **Split Opinion**      | Reader A chose X and reader B chose Y; expert judgment is required                  |
| Both `defensible` lists have more than one letter     | **Possible Ambiguity** | Both readers found more than one defensible option                                  |
| The shared `answer` equals `key`                      | **Clear**              | Both readers chose the key                                                          |
| Otherwise                                             | **Possible Key Error** | Both readers chose X; the supplied key is Y                                         |

The order matters and is a decision, not an accident. Disagreement is checked before ambiguity so two readers who both
hedge but commit to different answers are a split, not an ambiguity. Ambiguity is checked before the key so that an item
both readers answered "correctly" while each saw two defensible options is still flagged. One case PRODUCT.md's table
does not cover, where only one reader lists more than one defensible option, falls through to **Clear** or **Possible
Key Error** on the shared answer; the reason text names the single reader's second option so the educator sees it.

**The rule must be unit-tested before any UI is written.** The table above is the test case list, plus the two edge
cases: same model twice (Unverified) and a `defensible` list that omits `answer` (treated as if it included it).

## 15. API contracts

All routes are JSON under `/api`, require a session cookie unless marked public, and validate bodies with the zod
schemas in `src/shared`. Errors are `{ "error": { "code": string, "message": string } }` with 400 for validation, 401
for no session, 403 for a record the session does not own or a mutation the sample refuses, 404 for a missing or expired
record, and 429 for a Guest limit. Timestamps are ISO 8601. Better Auth's own routes under `/api/auth/*` are documented
by Better Auth.

### `POST /api/records`

Creates a record and its items with status `queued`, returns within one second (FR-CHECK-3, NFR-PERF-1).

```json
{
  "title": "Week 4 data structures quiz",
  "subject": "Computer Science",
  "language": "en",
  "context": "First-year practice set",
  "items": [
    {
      "stem": "Which structure is first in, first out?",
      "options": [
        { "letter": "A", "text": "Stack" },
        { "letter": "B", "text": "Queue" }
      ],
      "key": "A"
    }
  ]
}
```

Response `201`: `{ "id": "<uuid>", "status": "queued", "itemCount": 1, "expiresAt": null }`. Guest limits are enforced
here (FR-AUTH-5); validation failures name the item index and field (FR-CHECK-2).

### `GET /api/records`

Lists the session's records, newest first, excluding soft-deleted ones (FR-RECORD-5). Query: `status`, `subject`,
`attention=true` to keep only records with at least one non-clear, non-pending item, `q` to search title and stem text.

```json
{
  "records": [
    {
      "id": "<uuid>",
      "title": "…",
      "subject": "…",
      "status": "ready",
      "itemCount": 12,
      "attentionCount": 4,
      "isSample": true,
      "expiresAt": null,
      "updatedAt": "2026-09-03T10:00:00Z"
    }
  ]
}
```

### `GET /api/records/:id`

The whole record: items in position order, each with its attempts newest first and its dispositions oldest first. Also
the polling fallback for the events route.

```json
{
  "id": "<uuid>",
  "title": "…",
  "subject": "…",
  "language": "en",
  "context": null,
  "status": "ready",
  "isSample": false,
  "expiresAt": null,
  "counts": {
    "clear": 8,
    "possible_key_error": 2,
    "possible_ambiguity": 1,
    "split_opinion": 0,
    "unverified": 1,
    "pending": 0
  },
  "items": [
    {
      "id": "<uuid>",
      "position": 1,
      "stem": "…",
      "options": [{ "letter": "A", "text": "Stack" }],
      "key": "A",
      "status": "done",
      "verdict": "possible_key_error",
      "verdictReason": "Both readers chose B. The supplied key is A.",
      "attemptsUsed": 2,
      "attempts": [
        {
          "id": "<uuid>",
          "requestedModel": "MiniMaxAI/MiniMax-M2.7",
          "servedModel": "MiniMaxAI/MiniMax-M2.7",
          "requestId": "req-1788016913316163460-503197",
          "devshardId": "65725",
          "fallbackHeader": null,
          "httpStatus": 200,
          "receiptStatus": "verified",
          "reading": { "answer": "B", "defensible": ["B"], "reason": "…" },
          "latencyMs": 14300,
          "startedAt": "…",
          "finishedAt": "…",
          "admitted": true,
          "rejectionReason": null
        }
      ],
      "dispositions": [
        {
          "id": "<uuid>",
          "kind": "key_corrected",
          "revisedKey": "B",
          "revisedText": null,
          "note": null,
          "createdAt": "…"
        }
      ]
    }
  ]
}
```

### `DELETE /api/records`

Body `{ "ids": ["<uuid>", …] }`. For a private session, sets `deleted_at` on each owned record; for the Guest session,
hard-deletes. The sample is skipped and named in the response (FR-RECORD-6, FR-RECORD-7, FR-SAMPLE-2). Response:
`{ "deleted": ["<uuid>"], "skipped": [{ "id": "<uuid>", "reason": "sample" }], "mode": "trash" | "immediate" }`.

### `DELETE /api/account/records`

No body. Hard-deletes every record owned by the session, private and Guest alike, including rows already carrying a
`deleted_at`. This is FR-RECORD-8 erasure rather than the `DELETE /api/records` soft path, and the difference is
deliberate: a control labelled **Delete All Records** that left a recoverable copy for thirty days would be untrue. The
sample is skipped and named, which is what keeps the demo record alive when a guest presses it. Response is the same
shape as `DELETE /api/records`, with `mode` always `"immediate"`.

### `POST /api/records/:id/duplicate`

Copies title, subject, language, context and the items' stems, options and keys into a new `queued` record owned by the
session, with no attempts or dispositions. Response `201`, same shape as `POST /api/records`. The sample may be
duplicated; the copy is an ordinary record.

### `POST /api/records/:id/items/:itemId/disposition`

Body `{ "kind": "key_corrected", "revisedKey": "B", "revisedText": null, "note": null }`. Appends a disposition
(FR-RECORD-4); `key_corrected` requires `revisedKey`, `wording_revised` requires `revisedText`. `retry_requested` also
re-queues the item exactly as the retry route does. Recomputes the record's `in_review` or `resolved` status and returns
`{ "item": <item as above>, "recordStatus": "in_review" }`. Allowed on the sample.

### `POST /api/records/:id/items/:itemId/retry`

Re-queues an `unverified` item with a fresh budget (FR-QUEUE-5). Records a `retry_requested` disposition so the round
boundary is in history. Response `{ "item": <item>, "recordStatus": "checking" }`.

### `GET /api/records/:id/events`

Server-sent events. Each event is `event: item` or `event: record` with a JSON `data` line carrying the item or the
record summary (`id`, `status`, `counts`) as above. A comment line every 20 seconds keeps the connection alive. The
client falls back to polling `GET /api/records/:id` every 3 seconds if the stream fails to open or drops twice
(FR-QUEUE-4).

### `GET /api/sample`

**Public.** Returns the record with `is_sample = true` in the same shape as `GET /api/records/:id`, dispositions
included, so the signed-out Sample Report renders the same evidence read-only (FR-SAMPLE-4).

### `POST /api/sample/reset`

**Guest only.** `PUBLIC_PATHS` lists `/api/sample` but not `/api/sample/reset`, so the session gate runs here. No body.
Deletes every `dispositions` row belonging to the sample's items and sets the record back to `ready`, returning every
sample item to Unreviewed before a rehearsal (FR-SAMPLE-3). Response `200`: `{ "reset": true }`, `403` `forbidden` for a
private session, `404` `sample_not_loaded` when no sample is seeded.

### `POST /api/auth/guest`

**Public.** No body. Signs the caller into the Guest user as described in [section 12](#12-auth-and-the-guest-account)
and returns `{ "user": { "id": "…", "isGuest": true } }` with the session cookie set (FR-AUTH-2).

### `GET /api/session`

**Public**, and registered ahead of the session gate so a signed-out caller gets an answer rather than a 401. Returns
who the caller is and whether this is the shared Guest account, which the client cannot work out for itself because the
Guest test is a comparison against server configuration.

```json
{
  "user": { "id": "…", "email": "…", "name": "…" },
  "isGuest": true
}
```

Signed out, the body is `{ "user": null, "isGuest": false }`.

### `GET /api/health`

**Public.** Per-model rolling health from `model_health`, plus the mascot flag so the client learns it without a second
config route.

```json
{
  "models": [
    {
      "model": "MiniMaxAI/MiniMax-M2.7",
      "successRate": 1.0,
      "medianLatencyMs": 21000,
      "healthy": true
    }
  ],
  "windowMinutes": 15,
  "mascotEnabled": false
}
```

## 16. Provenance display

The evidence view is the track's proof moment and is where FR-EVIDENCE-1 to FR-EVIDENCE-4, FR-VERDICT-4 and NFR-PROV-3
are discharged on screen, not in a document.

**In the item evidence view** every attempt is a row, newest first, carrying:

- Requested model, and served model from the receipt
- The request id as selectable text, and a link to `https://api.gonkarouter.io/v1/receipts/<id>`
- Devshard id, and latency in seconds
- A receipt status chip reading **Verified**, **Mismatch**, **Missing** or **Pending**
- Whether the attempt was admitted, with the rejection reason if not

An attempt that returned no headers shows **No request id returned** and the reason in place of the link. The two
admitted readings sit above the attempt list side by side with model name, chosen option, defensible options and reason.
Beneath them is the verdict with `verdict_reason` printed in full, for example "Both readers chose Queue. The supplied
key is Stack. Rule: two verified readings agree on a non-key option, so Possible Key Error". When only one family
answered, the second column shows that seat's attempt history, never a duplicate reading.

**In the record summary** the counts by verdict from `GET /api/records/:id` are the filter chips, each with its count,
attention verdicts first and **Clear** last (FR-RECORD-3). Wherever **Unverified** appears the fail-closed sentence is
printed beside it.

**The public sample page** renders the same components from `GET /api/sample` with every disposition control removed.
Model names, request ids and receipt chips are text, so a judge can copy an id into the receipt URL during Q&A. The
receipt is gateway metadata, not on-chain proof, and the trust copy says so (FR-PUBLIC-2).

## 17. Mascot runtime

The two cats ship animated and state-driven by the team lead's decision of 3 September
([PRODUCT.md](PRODUCT.md#live2d-mascot-feasibility)), behind `MASCOT_ENABLED`. This section discharges FR-MASCOT-1 to
FR-MASCOT-5.

**Runtime.** `pixi.js` 7 and `pixi-live2d-display`, imported from its Cubism 4 build, as npm dependencies. The Cubism
Core script `live2dcubismcore.min.js` is not on npm under a redistributable licence and is loaded in `index.html` from
Live2D's own CDN with `defer`, so a missing core is a load failure the fallback handles, not a build failure. Models
load from `/live2d/tororo/runtime/tororo.model3.json` and `/live2d/hijiki/runtime/hijiki.model3.json`, about 2.7 MB in
total, and are requested only after the record has rendered and only when the flag is on.

**Why this runtime.** The official Cubism Web SDK is a framework with its own build; `pixi-live2d-display` wraps the
same core in one PixiJS display object with a `motion(group)` call, which is the whole API this mapping needs. The
models are converted Cubism 2.1 rigs marked for Cubism 3, and the library's Cubism 4 build reads `.model3.json` files of
that generation.

**Motion groups**, as declared in both `model3.json` files: `Idle` (3 motions), `FlickUp` (1), `FlickDown` (1), `Tap`
(3), `Flick` (1). The mapping is the [product role table](PRODUCT.md#product-role) expressed in those groups:

| Product state        | Tororo               | Hijiki               | Notes                                           |
| -------------------- | -------------------- | -------------------- | ----------------------------------------------- |
| Every state          | `Idle` loops         | `Idle` loops         | The base layer; motions below play over it      |
| Checking             | `Tap`, alternating   | `Tap`, alternating   | One cat at a time; no progress animation        |
| Attention item found | `FlickUp` once       | `FlickUp` once       | Fired when a non-clear verdict lands            |
| Split Opinion        | `FlickDown` once     | `Flick` once         | The two cats react differently, on purpose      |
| Unverified           | `Idle` at half speed | `Idle` at half speed | The waiting pose; **Retry Verification** nearby |
| Resolved             | `Tap` once           | `Tap` once           | After the human disposition, never confetti     |

**Fallbacks.** `prefers-reduced-motion: reduce` or the user's Reduce Motion setting stops the loop on the first idle
frame. A failed WebGL context, core script or asset swaps the canvas for the still PNG in `public/brand/` with no error
surfaced. The canvas is `aria-hidden`, ignores pointer events, pauses on `visibilitychange` and when scrolled off
screen, and is hidden below 768 px wide. State text on the record remains the only authoritative signal.

Tororo and Hijiki are Live2D sample characters, used under the Live2D Free Material License Agreement, and are not
Cekgu's own. Built with the Live2D Cubism SDK. That attribution used to render as a footer on every page; AlaskanTuna
removed it from the frontend on 3 September and owns the licence position, so it lives here and in the README instead
(FR-MASCOT-5).

## 18. Testing

`bun test`: 194 pass, 72 skip, 0 fail, 266 tests across 24 files; the Playwright pass: 9 passed, 1 skipped.

- `src/shared/verdict.test.ts`: every row of the [rule table](#14-consensus-rule) plus the two edge cases, with the
  reason text asserted
- `src/server/gateway/client.test.ts`: the gateway client with a mocked `fetch`, covering a clean 200, a
  `X-Gonka-Fallback` response, a receipt whose model mismatches, a `<think>`-wrapped body, unparseable JSON, a 429 and a
  timeout. Each asserts the returned provenance record and the rejection reason
- `src/server/queue/claim.concurrency.test.ts`: two concurrent claims never take the same item, a crashed claim is
  released, and the semaphore never exceeds four
- `src/server/retention.sweep.test.ts`: a record either side of each of the two windows, so a flipped comparison fails
  rather than only a wrong window, and the sample surviving however old it is
- `src/server/routes/account.test.ts`: erasure taking a private account's Trash with its live records, the sample
  refused and named, and another account untouched

**The database-backed suites are opt-in, and are run one file at a time.** They are the 72 skips in the count above,
opting in through `TEST_DATABASE_URL`. Each truncates the database it connects to, so running them together in one
process makes them clear each other's fixtures mid-run, which is also why they refuse any host but localhost. One file
at a time, against a throwaway Postgres:

```bash
docker run -d --name cekgu-test -e POSTGRES_PASSWORD=x -e POSTGRES_DB=cekgu -p 55432:5432 postgres:18-alpine
export TEST_DATABASE_URL='postgres://postgres:x@127.0.0.1:55432/cekgu'

bun test src/server/sample.test.ts                    # 17 pass
bun test src/server/guest.sweep.test.ts               # 5 pass
bun test src/server/retention.sweep.test.ts           # 5 pass
bun test src/server/queue/claim.concurrency.test.ts   # 8 pass
bun test src/server/routes/records.test.ts            # 23 pass
bun test src/server/routes/account.test.ts            # 6 pass
```

**The Playwright pass** runs against a **deployed URL**, never a local build: production by default, any other
deployment through `E2E_BASE_URL`, and automatically after every production deploy. It asserts rendered content rather
than that a root element is attached, because an attached root passes against a blank page, against a failed fetch shown
as an empty state, and against a React error boundary.

The CI order in [section 10](#10-hosting-and-cicd) runs `bun test` before the image is built, so a broken rule never
gets a preview URL.

## 19. Decided

Every decision that was open on 2 September is now a section above.

| Decision                                                  | Section                                  |
| --------------------------------------------------------- | ---------------------------------------- |
| Application framework, repository layout                  | [9](#9-application-architecture)         |
| Hosting, CI/CD, secrets                                   | [10](#10-hosting-and-cicd)               |
| Record persistence                                        | [11](#11-data-model)                     |
| Private sign-in mechanism, the Guest account              | [12](#12-auth-and-the-guest-account)     |
| Queue shape, concurrency, hedging, retry budget           | [13](#13-queue-and-worker)               |
| Exact consensus algorithm, gateway client, reading schema | [14](#14-consensus-rule)                 |
| API surface                                               | [15](#15-api-contracts)                  |
| How provenance is displayed                               | [16](#16-provenance-display)             |
| Mascot runtime and state mapping                          | [17](#17-mascot-runtime)                 |
| What is tested and where                                  | [18](#18-testing)                        |
| The one non-Gonka call, and its fence                     | [20](#20-reading-a-paper-from-an-upload) |

**What was fixed before any of this and still is:** the gateway, the model ids returned by `GET /v1/models`, the two
base URLs, the no-fallback contract, receipt verification, and the requirement that every call returns its
`x-request-id` alongside its content.

**What changed after this table was written.** Sections 9 to 18 were a plan when they were first committed and are now a
description: the service is deployed, the sample record is seeded and public, and the figures in section 18 come from
real runs. Two things in this half are still design rather than description, and are marked where they appear:

- The model-id list is not verified against the gateway at boot ([section 8](#8-configuration-contract))
- The hedge threshold is a constant rather than being derived from the rolling median
  ([section 13](#13-queue-and-worker))

Both are deliberate, and both are cheaper to state than to change two days before a submission.

## 20. Reading a paper from an upload

An educator photographs or scans a paper and New Check fills itself in. `POST /api/extract` is two steps, and the split
between them is the whole design.

| Step          | Runs on                     | Job                                                                 | May it decide anything? |
| ------------- | --------------------------- | ------------------------------------------------------------------- | ----------------------- |
| 1. Transcribe | Gemini, **not** the gateway | Pixels and PDF bytes to the words printed on them                   | **No**                  |
| 2. Structure  | **GonkaRouter**             | Those words to title, subject, language, questions, options and key | Yes                     |

The track's mandatory rule binds AI **reasoning and verification logic** to the Gonka Network, in the organizers' own
words. Copying printed words off a page is neither, and step 2 — every judgement in the feature — carries an
`x-request-id` like any other inference in the product. mrJiang's ruling permitting a third-party provider outside the
mandatory path is recorded in [`brief.md`](brief.md#non-negotiable-requirements).

**The organizers' own reference architecture draws the same line**, which is worth more than our reading of it. Their
mandatory list separates item 1, **Claim Extraction**, "accept a URL, tweet, or text snippet as input", from item 2,
**Decentralised Verification**, where "Gonka-hosted models analyse the claim"
([challenge doc](source/gonkarouter-challenge.md)). Input acquisition sits before and outside the reasoning step in
their structure, not only in ours. Step 1 here is that first item generalised from text to pixels.

### Why step 1 cannot be on the gateway

Two measured reasons, not a preference:

- **Only one family can see an image.** `moonshotai/Kimi-K2.6` is the sole model in [section 3](#3-models-measured)
  reporting vision, and at an 8.6 s median it is the slowest of the three
- **One reader cannot cross-verify itself.** A transcription step on the gateway would be a single-model inference by
  construction, so it would spend the demo path's slowest reader on the one job in the product that needs no judgement

### The route

`POST /api/extract`, session required, so the default gate in `src/server/routes/index.ts` covers it. Request is
`multipart/form-data` with one `file` field.

| Field       | Value                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accepts** | `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, 10 MB cap                                                                                               |
| **200**     | `{ draft, provenance: { requestId, servedModel, receiptStatus }, warnings: string[] }`                                                                              |
| **Errors**  | `{ error: { code, message } }` — 400 `no_file` / `bad_upload`, 413 `too_large`, 415 `unsupported_type`, 422 `unreadable` / `not_structured`, 503 `uploads_disabled` |

`draft` matches `createRecordSchema` in `src/shared/schemas.ts` exactly. **It prefills the form and stops.** No record
is created and no check is queued: a wrong extraction that submitted itself would put the product's name on a claim
nobody read. The route holds the same `gatewaySemaphore` the queue holds rather than a second one beside it, because
[gotcha 10](#5-verified-gotchas) measured account-level `429`s above four concurrent calls and an upload taking its own
slots would steal them from checks already running.

**Gemini accepts `application/pdf` as inline data**, so images and PDFs take one identical path. That is why there is no
PDF library and no native canvas in the container, and the absence is deliberate rather than missing.

### Measured, 4 September

End to end through the route with a session and a real three-question paper:

| Path       | Result            | Served                                                      |
| ---------- | ----------------- | ----------------------------------------------------------- |
| PNG, 45 KB | 200 in **35.3 s** | MiniMax, receipt verified, `req-1788534284315774569-844912` |
| PDF, 27 KB | 200 in **73.8 s** | MiniMax, receipt verified, `req-1788534328793024120-845199` |

**The file type is almost none of the cost.** Transcription alone was 6.1 s for the PNG and 8.0 s for the PDF; the
spread above is the gateway's. Structuring the same text, one family each:

| Family                               | Time   | Outcome                              |
| ------------------------------------ | ------ | ------------------------------------ |
| `MiniMaxAI/MiniMax-M2.7`             | 31.2 s | Correct, verified receipt            |
| `deepseek-ai/DeepSeek-V4-Flash-0731` | 0.5 s  | `429`, no request id, so unusable    |
| `moonshotai/Kimi-K2.6`               | 90.0 s | Cut off at `callGonka`'s own timeout |

`healthyOrder()` puts MiniMax first once the health ring has seen a window; on a cold instance the static order costs
half a second on DeepSeek before reaching it. **The route caps the structuring step at 100 s**, which sits just above
one complete attempt — 90 s for the call plus 5 s for its receipt. A lower ceiling can cut off a call that was about to
succeed, which is the worst outcome available: the reader waits the whole time and gets nothing.

### Configuration

Two names, both optional, added to the [section 8](#8-configuration-contract) contract and to
`.github/scripts/render-env-vars.sh`:

- **`GEMINI_API_KEY`** — absent, the route answers 503 and the rest of the product is unchanged
- **`GEMINI_MODEL`** — defaults to `gemini-2.5-flash`

**Verify the id against `GET /v1beta/models` before changing it**, the same rule [section 3](#3-models-measured) sets
for Gonka ids and for a sharper reason: an id that is not on that list does not `404`. Measured the same day,
`gemini-3-flash-preview` answered `503`, `gemini-flash-latest` took 33.9 s, and `gemini-2.5-flash` returned a correct
transcription in 5.9 s.

### How the boundary is enforced

`src/server/gateway/only-gonkarouter.test.ts` asserts three things rather than one:

1. A provider hostname may appear in `src/server/transcribe/` and **nowhere else** in `src/`
1. That directory may not import the verdict rule, the record schema, the round or the database
1. `gateway/`, `queue/`, `extract/` and `shared/` name **no** provider host at all, so widening the directory rule alone
   cannot move a decision across the line

Proven against the defect it names: planting the Gemini hostname in `src/server/queue/round.ts` fails assertion 3 by
file name. **Widening that exemption is a track requirement decision, not a refactor.**
