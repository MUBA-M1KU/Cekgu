# Gateway capabilities

What the GonkaRouter gateway can be relied on to do, and the two gaps that threaten a hard track requirement. Read
alongside [`../../TRD.md`](../../TRD.md), which is canonical for implementation detail; this file records the
**provenance and confidence** of each fact and the questions still open.

**Method.** Extracted from `../../TRD.md` and `../../source/` by a delegated model, then spot-checked against the same
files. Web claims in [What the Request ID actually proves](#what-the-request-id-actually-proves) were fetched from
primary sources on 2026-08-30. Interpretation is marked as such throughout.

Contents:

1. [The two findings that change design](#the-two-findings-that-change-design)
1. [Receipts — shipped 2026-08-31](#receipts--shipped-2026-08-31)
1. [The fallback trap](#the-fallback-trap)
1. [Latency and hedging](#latency-and-hedging)
1. [Track requirement clarified](#track-requirement-clarified)
1. [Endpoints](#endpoints)
1. [Models](#models)
1. [The Request ID](#the-request-id)
1. [Limits](#limits)
1. [What the Request ID actually proves](#what-the-request-id-actually-proves)
1. [Sources](#sources)

## The two findings that change design

| Finding                                                                 | Consequence                                                                                          |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **`x-request-id` is an HTTP response header, not a body field**         | Any client returning only parsed JSON discards it. The call layer must read raw responses            |
| **Nothing documents whether the request id survives streaming**         | Track requirement 3 depends on it. **Must be tested live before the call layer is frozen**           |
| **The chain is public and queryable** at `rpc.gonka.gg`, no API key     | Model registry, governance, reputation and slashing are all readable. See below                      |
| **A Request ID resolves to nothing public** — **SUPERSEDED 2026-08-31** | A public receipts endpoint shipped. See [Receipts](#receipts--shipped-2026-08-31)                    |
| **The router silently substitutes models under load**                   | **Threatens the track's multi-model requirement.** Send `X-Gonka-No-Fallback: true`                  |
| **Kimi-K2.6 is effectively unreliable right now**                       | ~4 of 5 requests time out. The vendor recommends DeepSeek and MiniMax. Kimi is the only vision model |

## Receipts — shipped 2026-08-31

**Announced in the hackathon Discord by the GonkaRouter tech lead and verified live by us the same day.** This
supersedes the earlier finding that a Request ID resolves to nothing.

```
GET https://api.gonkarouter.io/v1/receipts/{x-request-id}      # no auth required
```

Verified working against two ids, including one captured two days earlier:

```json
{"x_request_id":"req-1788016913316163460-503197","x_devshard_id":"65725",
 "model":"moonshotai/Kimi-K2.6","created_at":"2026-08-29T15:21:54Z","outcome":"success",
 "status_code":200,"stream":false,"total_tokens":19,"ttft_ms":709,"duration_ms":709}
```

| Property                                                     | Consequence                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **No authentication.** Anyone can query any id               | A third party can confirm a call happened without trusting the claimant |
| **Metadata only** — never prompt, response, identity or cost | Verifies _that_ and _which_, never _what_                               |
| Returns the **model that actually served it**                | The only way to detect a silent fallback after the fact                 |
| Includes `stream`, `ttft_ms`, `duration_ms`, `total_tokens`  | Timing and size are independently checkable                             |
| Rate-limited per IP                                          | Ask the vendor for a higher ceiling if batch-reconciling                |

**Signed receipts are on the roadmap, not shipped:** gateway-signed
`(request_hash, response_hash, model, timestamp, request_id)` under a published key. Streaming complicates it — the
signature has to arrive as a stream trailer. **Do not claim signatures exist.**

## The fallback trap

**The single most dangerous finding for this track.** When a requested model's upstream is saturated (429 after
retries), the gateway **serves a different model rather than failing**. It is flagged, but only in a response header
most teams will never read:

```
X-Gonka-Fallback: deepseek-ai/DeepSeek-V4-Flash-0731 -> MiniMaxAI/MiniMax-M2.7
X-Gonka-No-Fallback: true     # request header: enforce the exact model, get a real 429 instead
```

**Why this matters more here than anywhere else.** The track _requires_ two or more models to cross-verify. If a team
requests model A and model B and one is silently substituted, they may have received **the same model twice** — their
"independent cross-verification" is fake, their consensus is one opinion counted twice, and the claim on their slide is
untrue. Kimi's ~80% timeout rate makes substitution _likely_, not theoretical.

**Mitigation, mandatory for us:** send `X-Gonka-No-Fallback: true` on every verification call, read `X-Gonka-Fallback`
on every response, and confirm the serving model per call via the receipts endpoint.

## Latency and hedging

Vendor-confirmed and matching our own measurement: **the same model answers in under 1 s or takes 30–40 s** depending
which node picks up the request. Measured TTFT ranges **~1.5 s to ~17 s**. Node selection happens upstream and there is
**no route-to-fastest setting**.

The tech lead's own guidance, worth following verbatim:

1. **Keep hedging separate from cross-verification.** Racing two _different_ models and taking the first answer
   collapses a safety property into a latency tactic and destroys the independent second opinion. Hedge _within_ each
   check by sending a redundant copy of the _same_ check.
2. **Use a deferred hedge.** Fire the backup only if the primary has not responded within ~1.5–2 s — same tail
   reduction, roughly half the token cost.
3. **Pin the model per check** with `X-Gonka-No-Fallback: true`, and read `X-Devshard-ID` to see which node served it.

## Track requirement clarified

Asked directly in Discord and answered by the GonkaRouter team: **no separate testnet smart contract is required.** _"On
Gonka's side, there are no additional requirements... Just Gonka Request ID."_

## Endpoints

One host, `https://api.gonkarouter.io`, speaking two wire protocols. The `/v1` asymmetry is the most common wiring
mistake.

| Path                   | Protocol                      | Base URL the SDK expects                |
| ---------------------- | ----------------------------- | --------------------------------------- |
| `/v1/chat/completions` | OpenAI-compatible             | `https://api.gonkarouter.io/v1`         |
| `/v1/messages`         | Anthropic Messages-compatible | `https://api.gonkarouter.io` (no `/v1`) |
| `/v1/models`           | OpenAI-style, the model list  | —                                       |

Verified live in the TRD: `/v1/messages` → 200, `/v1/chat/completions` → 200, `/v1/v1/messages` → 404, `/messages`
→ 404. The GonkaRouter dashboard displays the `/v1` form as the single base URL, which is **wrong for the Anthropic
surface**.

Auth: either `x-api-key: sk-…` or `Authorization: Bearer sk-…` works on both surfaces. The Anthropic surface also
requires `anthropic-version: 2023-06-01`.

## Models

`GET /v1/models` returned exactly three ids. Case- and slash-sensitive, verbatim:

| Model ID                             | Reasoning trace | Notes                                                        |
| ------------------------------------ | --------------- | ------------------------------------------------------------ |
| `deepseek-ai/DeepSeek-V4-Flash-0731` | No              | Speed-tuned. Answers directly                                |
| `moonshotai/Kimi-K2.6`               | Yes             | Only model with vision and search                            |
| `MiniMaxAI/MiniMax-M2.7`             | Yes             | Leaks raw reasoning tags; strip before display or comparison |

`Qwen3-235B-FP8` appears in the in-app chat picker with no id and is **not** returned by `/v1/models`. Do not rely on
it.

**Three different labs.** DeepSeek, Moonshot and MiniMax are separate organisations, which matters for any claim that
their errors are decorrelated — see [`disagreement-as-product.md`](disagreement-as-product.md). They are nonetheless all
trained on substantially overlapping corpora, so independence is a matter of degree, not a given. `[ASSUMPTION]` No
source measures cross-family error correlation for these three specifically.

## The Request ID

The mechanism, from the TRD's live capture:

```
x-request-id:  req-1788016913316163460-503197
x-devshard-id: 65725
```

- `x-request-id` is the per-inference id, distinct per request including across parallel fan-out.
- `x-devshard-id` identifies the node that served it.
- Both are **HTTP headers**. The OpenAI and Anthropic SDKs discard them on default calls; use `.with_raw_response.…`.
- Body ids are not substitutes: the Anthropic body returns `msg_…`, the OpenAI body returns `devshard-65275-1926`.
  Neither is the gateway request id.

### Open questions

| Question                                             | Status                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Does `x-request-id` survive a streamed response?     | **NOT SPECIFIED IN ANY SOURCE.** Direct risk to a hard requirement |
| Does it appear on any SSE event?                     | Not mentioned anywhere                                             |
| Can a past request id be queried?                    | Yes — the public, no-auth `/v1/receipts/{x-request-id}` endpoint   |
| What is `x-devshard-id`'s format or queryable range? | Unstated                                                           |

**Untested as of 2026-08-30** — no GonkaRouter API key was available on the development machine, so the streaming
behaviour has not been checked. This is the highest-priority verification before any call layer is designed.

## Limits

Vendor-published, last checked by GonkaRouter 2026-06-19, **not independently verified**.

| Limit                  | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Burst                  | ≥ 200 concurrent requests                      |
| Sustained              | ≤ 1000 req/min; > 1500 → `429`                 |
| `429` cost             | Does not consume balance. Back off 30–60 s     |
| Per-request wall clock | 10 minutes                                     |
| Streaming idle timeout | 90 s with no chunk closes the connection       |
| Output cap             | 4096 tokens; omitting `max_tokens` yields 3072 |

The docs publish both a 4096-token output cap and per-model "max output" figures of 1M / 262K / 192K without reconciling
them. How the two interact is unspecified.

**Credits.**
$20 one-time signup credit; tokens explicitly unlimited during the event; email Jack for a top-up. A
demonstrated account spent under $2
across 1.77M requests and 4.35B tokens, so cost is not a design constraint here.

## What the Request ID actually proves

The honest answer matters, because a judge who knows this space will ask and an overclaim is fatal.

**Gonka's verification is statistical, not deterministic.** The whitepaper states the repetition rate is lowered "to as
little as 1-10%" and that "collectively, Hosts verify approximately one out of every 10 tasks". Verification is a
spot-check lottery: each host signs the transaction id to derive whether it must validate a given task. Frequency
escalates for low-reputation hosts.

The whitepaper concedes the epistemics directly: conclusions about malicious activity "are based on probabilities rather
than certainties, with considerations for both false positives and false negatives". Security rests on an honest
majority — sufficient when hosts representing more than 50% of voting weight confirm.

**Correction, 2026-08-31.** An earlier revision of this file stated that no public lookup exists, based on probing
`gonkascan.com`. **That was wrong.** The chain is fully public and queryable, through a different host that the first
pass never found. Verified live:

| Endpoint                                                     | Result                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `https://rpc.gonka.gg/status`                                | `200` — network `gonka-mainnet`, block 5,830,135, **`tx_index: on`**                               |
| `https://rpc.gonka.gg/cosmos/...` (Cosmos REST)              | `200` — app name `inference-chain`                                                                 |
| `https://gonka.gg`                                           | `200` — working block explorer                                                                     |
| `/chain-api/productscience/inference/…`                      | Full inference module: `start_inference`, `finish_inference`, `validation`, `revalidate_inference` |
| `/api/ch/slashing`, `/api/ch/tx/{hash}`, `/api/ch/address/…` | Indexed history, sub-second                                                                        |

No API key is required — the gateway is open access. Open-source tooling exists at `gonka-ai/gonka`,
`gonkalabs/tx-scanner` and `gonkalabs/rpc-pooler`, and the `inferenced` CLI works against `rpc.gonka.gg` directly. The
economic layer is queryable too: `collateral`, `slashing` (with participant, amount, reason and burned coins) and
`epoch_performance_summary`.

### A Request ID does not resolve on chain

**This is the load-bearing finding, and it corrects a second wrong claim.** A first pass said no public lookup existed.
A second pass found the chain wide open and inferred from `inference_pruning_epoch_threshold: 2` that inference records
are written and later pruned. **Deeper investigation says the truth is different and worse:**

> The `req-…` id resolves through the public receipts endpoint, but not on chain. It exists in the gateway operator's
> database. The chain holds **no per-request record for current-era traffic** — under the current devshard flow,
> per-request artifacts never touch mainnet. Settlement is aggregate: an escrow id yields a `state_root` plus per-slot
> cost and validity statistics, not your prompt, your output, or the validation of your specific result.

The pruning parameters above are real and were read live, but they govern the **legacy** inference flow. The
architecture page describes that legacy flow and **contradicts the current one** in exactly the detail that matters.
Gonka's own docs warn that "the ultimate source of truth is the code itself".

**Consequence for any product built here:** a Request ID is a **correlation id that resolves to an unsigned gateway
receipt**, not an on-chain receipt. Displaying it is honest; describing it as on-chain proof of a specific inference is
not, and a judge from Gonka would know.

### Network reality — measured, not marketed

Queried live 2026-08-31. **Read this before writing any pitch line about decentralisation, staking or trust.** Several
of the network's marketed differentiators are not currently demonstrable, and a judge from Gonka would know.

| Claim                                     | Measured reality                                                                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A market of many independent hosts        | **7,000 registered participants, but only 10 with `voting_power > 0`.** 5,532 carry a URL                                                                               |
| Host reputation guides routing            | **`reputation` is 0 for all 7,000.** The field exists and is unpopulated                                                                                                |
| Hosts stake collateral against dishonesty | 100 collateral entries, **~185 GNK total**, of which **one entity holds ~131 GNK — about 71%**                                                                          |
| Cheating hosts are slashed                | **Not observed.** All 50 recent slash events are `downtime` (29) and `missing_signature` (21) — standard Cosmos validator liveness. **Zero inference-cheating slashes** |
| ~10% of inferences are spot-checked       | The parameter exists (`validation_rate` 1000/10000). No enforcement events are visible                                                                                  |

**Consequence.** Any concept whose pitch is _"a stranger's GPU staked money on telling you the truth"_ is an overclaim
against the visible record. The slashing that happens is for being offline, not for lying. `[ASSUMPTION]` The mechanism
may exist in code and simply not have fired; that is a materially weaker statement than the marketing, and it is the one
we can defend.

**What this leaves as verified, durable and defensible** — the short list any concept must live within:

1. **Public governance over model identity**, with a real contested history — the process is permanent even though the
   models are not
2. **Model identity pinned to a verifiable commit hash**
3. **No account, so nothing to revoke or ban**

### Models churn — do not build on a specific lineup

Governance adds, removes and alters models regularly. This is verified, not hypothetical:

| Proposal | Effect                                             |
| -------- | -------------------------------------------------- |
| **#87**  | Kimi K2.6 **removed from the network entirely**    |
| **#88**  | Kimi K2.6 **restored**, v1 and v2 removed          |
| **#94**  | DeepSeek V4 Flash 0731 **added**                   |
| **#86**  | `weight_scale_factor` changed for Kimi and GLM-5.2 |

**Therefore any product that depends on which specific models exist — their personalities, their refusal boundaries, or
their continued availability — is already falsified.** A companion "pinned forever" to Kimi K2.6 would have vanished at
proposal #87. Model-agnosticism is a hard design constraint, not a nice-to-have.

### What is genuinely verifiable on chain

Verified live 2026-08-31 against `rpc.gonka.gg` and `node1.gonka.ai:8000`. This is the honest raw material for any chain
integration.

| Available                  | Detail                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model registry**         | Per-model `hf_repo` **and pinned `hf_commit`**, vLLM args, `units_of_compute_per_token`. You can verify which exact weights the network should be running |
| **Governance over models** | `MsgRegisterModel` / `MsgDeleteGovernanceModel`; live proposals, e.g. #98 "Increase DeepSeek V4 Flash weight_scale_factor to 0.246"                       |
| **Participant reputation** | Per-participant `balance`, `coins_owed`, `reputation`, `voting_power`                                                                                     |
| **Slashing**               | Participant, amount, fraction, reason (`missing_signature`), missed blocks, burned coins                                                                  |
| **Escrow settlement**      | `DevshardEscrow` with `validation_rate` defaulting to 1000/10000 — **corroborating the 10% spot-check rate**                                              |
| **Merkle proofs**          | ICS23 `proof_ops` on epoch participant data, with a public `POST /v1/verify-proof`                                                                        |
| **Pricing and epoch data** | Per-model `price_per_token`; epoch 378, length 15,391 blocks (~23h)                                                                                       |

**Independence caveat.** The only live public RPCs (`node1`/`node2.gonka.ai`) are operated by the project itself, and
the only full-history index is the explorer's own. There is no advertised community-run archive, so "independently
verifiable" is weaker than it sounds.

### Language that is true

> Every request goes through a gateway backed by a public Layer-1. The public receipt exposes serving metadata; the
> chain exposes model governance and aggregate settlement, not the prompt, output or validation of that specific
> response. Network spot-checks and incentives provide deterrence plus auditability, not cryptographic proof that any
> single answer is correct.

## Sources

| Source                                                                                                                                               | Accessed   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `../../TRD.md`, `../../source/gonkarouter-tutorial.md`, `../../source/gonkarouter-workshop-slides.md`                                                | 2026-08-30 |
| [Gonka whitepaper](https://gonka.ai/whitepaper.pdf) (§6, §7, Reputation, Verification challenges)                                                    | 2026-08-30 |
| [Gonka docs](https://docs.gonka.ai) — architecture, FAQ, developer quickstart                                                                        | 2026-08-30 |
| [Building open AI infrastructure — crypto.news](https://crypto.news/building-open-ai-infrastructure-inside-gonkas-vision-for-decentralized-compute/) | 2026-08-30 |
| [VeriLLM, arXiv:2509.24257](https://arxiv.org/abs/2509.24257) · [SoK: Blockchain-Based DeAI, arXiv:2411.17461](https://arxiv.org/abs/2411.17461)     | 2026-08-30 |
