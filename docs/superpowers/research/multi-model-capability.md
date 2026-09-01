# Multi-model capability

The track requires two or more models to cross-verify. This file answers the question that requirement raises and that
most entries will dodge: **what do three distinct models actually buy that one model called three times does not?**

Most of the honest answer is "nothing", and knowing which part is the exception is what separates a real design from an
ensemble with better marketing.

**Method.** Literature-grounded analysis by a delegated model, then applied against the Gonka model roster. Claims about
what resampling cannot do are mechanical, not empirical. Interpretation is marked.

## The baseline that kills most claims

**One strong model sampled _N_ times at temperature is free, and it is strong.** Resampling varies the decoding. It
cannot vary the machine. So everything reachable by varying decoding alone — averaging, majority voting,
self-consistency, best-of-_N_, "cross-checking against yourself" — is available from a single model and **does not count
as a multi-model capability.**

What resampling can never vary:

| Fixed under resampling | Consequence                                                   |
| ---------------------- | ------------------------------------------------------------- |
| The weights            | Refusal geometry, tokeniser and capability set are all frozen |
| The training snapshot  | Cutoff is a scalar you cannot perturb                         |
| The training data      | And therefore its blind spots                                 |
| The trust root         | One weight hash, one vendor key, one compromise domain        |

## The permutation test

> **Swap the three models around in your design. If the protocol still means the same thing, you have variance, not
> structure.**

This is the gate. A design that passes uses what makes the models _different_. A design that fails is majority voting in
an audit costume, and a technical judge will find it in the first ninety seconds of Q&A.

**Corollary that matters more than it looks:** a design resting on inter-model **agreement** is exposed to the
correlated-witness attack — three models reached through one gateway, trained on overlapping web crawls, agreeing on a
corpus-shared belief is one opinion printed three times. A design resting on inter-model **difference** is immune,
because it never needed agreement to mean anything.

## What genuinely requires distinct machines

| Capability                           | Verdict                       | Mechanism                                                                                                       |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Structural capability gaps**       | STRONG                        | A model with no vision has a _guaranteed_ blind spot. No temperature opens its eyes                             |
| **Differing refusal boundaries**     | STRONG                        | Refusal is structural. You cannot sample your way past a boundary; its _location_ is information                |
| **Interrogation without disclosure** | STRONG                        | An auditor that architecturally could not see the question. Self-critique is anchored to the model's own sample |
| **Independent trust roots**          | STRONG                        | Three vendor identities and three failure domains. One model resampled is one key and one story                 |
| **Differing tokenisers**             | STRONG (narrow)               | Tokeniser-induced numeric errors are deterministic and identical across every resample                          |
| **Differing training cutoffs**       | STRONG as a _change detector_ | Disagreement dates a change to an interval. One model's knowledge is a point, not a span                        |
| **Attack-surface diversity**         | STRONG                        | An injection that transfers across three safety-tunings is a class vulnerability, not a quirk                   |
| **"Three models are more accurate"** | **WEAK**                      | Mostly false. Self-consistency matches or beats small heterogeneous ensembles, for free                         |
| **"Diverse cultural perspectives"**  | **WEAK**                      | Models trained on overlapping corpora do not have them. This is marketing                                       |

**The caveat any hostile judge will raise:** model independence is not data independence. All three crawled the same
web. Unanimous agreement on a popular misconception is unanimous and wrong.

## The asymmetry in the Gonka roster

This matters because it is specific to the models this track provides, and it is the strongest available answer to "why
this stack".

| Model                                | Vision  | Search  | Tool chains | Reasoning trace |
| ------------------------------------ | ------- | ------- | ----------- | --------------- |
| `moonshotai/Kimi-K2.6`               | **Yes** | **Yes** | Yes         | Yes             |
| `MiniMaxAI/MiniMax-M2.7`             | No      | No      | **Long**    | Yes             |
| `deepseek-ai/DeepSeek-V4-Flash-0731` | **No**  | No      | No          | No              |

**Kimi is the only model that can see. DeepSeek structurally cannot.** That is not an implementation detail — it is a
usable experimental control, and it is permutation-breaking. Swap the two and the protocol does not merely change
meaning, it becomes impossible.

### Directed asymmetries available here

**Symmetric disagreement is a smoke alarm** — someone is wrong, unknown who. **Directed disagreement is an instrument**
— the capability ordering predicts who is wrong and why, so disagreement becomes _localisation_.

- **Kimi → DeepSeek, the blind control.** Kimi answers from pixels; DeepSeek answers from text about the pixels.
  Agreement means the text carried the information. Divergence enumerates exactly what was lost.
- **MiniMax → DeepSeek, a directed audit.** MiniMax can _execute_ DeepSeek's claims — fetch the citation, run the code.
  DeepSeek has no reciprocal capability, so the audit relation is one-directional.
- **DeepSeek versus MiniMax, scaffold as the measured variable.** Error rate grows with derivation length for the
  unscaffolded model and is roughly length-invariant for the tool-chained one.

**Why the blind control cannot be faked within one model.** The one-model version — show the image, then ablate it and
resample — shares the same model's captioning and reasoning biases across both arms. An independent blind observer is
the honest experimental design, and it exists only when the blind observer is a genuinely different machine.

## The five defensible cores

Everything worth building here stands on one of these. The rest is ensemble folklore.

1. **Structural capability asymmetry** — blind controls, tool execution, refusal geometry
2. **Decorrelated implementation failures** — tokenisers, scaffolds
3. **Dated knowledge as an interval, not a point**
4. **Audit relations that cannot be self-referential**
5. **Inspectable request attribution** — exposing the gateway's account of which model served each inference

### Where attribution buys something real

The Request ID is the mechanism for core 5. A single system asserting "these were three distinct inferences" is
self-attestation — one key, one log, one story. Per-inference receipts let a party inspect the gateway's account of
distinctness without trusting our application logs.

**But see [`gateway-capabilities.md`](gateway-capabilities.md):** the public receipts endpoint now resolves a Gonka
Request ID to unsigned gateway metadata, including the model that actually served it. This makes attribution
inspectable, not cryptographic or on-chain proof. It buys something where a record will be challenged later —
arbitration, compliance, procurement. It buys nothing in a private workflow where the operator trusts itself.

## What we do not claim

- Not that three models beat one model's self-consistency on raw accuracy. Mostly false, and the baseline is free
- Not that cross-model agreement verifies corpus-shared beliefs. The web is one crawl
- Not that attribution is independently verified — today's receipts are unsigned gateway self-attestation, and even a
  future signature would attest distinct _machines_, not independent _epistemics_

## Sources

All accessed 2026-08-30.

- [arXiv:2601.22290](https://arxiv.org/html/2601.22290v1) — ensemble theory, error correlation, Theorem 4
- [arXiv:2603.10060](https://arxiv.org/html/2603.10060v1) — self-consistency vs structural evidence
- [arXiv:2604.07650](https://arxiv.org/abs/2604.07650) — auditing behavioural entanglement between LLMs
- [arXiv:2607.19899](https://arxiv.org/html/2607.19899v1) — correlated agreement blindness
- Model capabilities: [`gateway-capabilities.md`](gateway-capabilities.md), sourced from `../../TRD.md`
