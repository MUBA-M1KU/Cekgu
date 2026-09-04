# Disagreement as product

The track's four requirements describe a shape: multi-model disagreement, made visible and auditable. This file records
**when that shape actually works**, because the naive version — run two models, flag when they differ — is measurably
weak and the literature says why.

**Method.** Literature synthesis by a delegated model from primary papers, fetched 2026-08-30. Numbers below are quoted
from the cited papers; interpretation is marked.

Contents:

1. [The finding that constrains everything](#the-finding-that-constrains-everything)
1. [Agreement is only evidence if errors are decorrelated](#agreement-is-only-evidence-if-errors-are-decorrelated)
1. [When disagreement is a lie](#when-disagreement-is-a-lie)
1. [What the demo must prove](#what-the-demo-must-prove)
1. [Established practice anchors](#established-practice-anchors)
1. [Sources](#sources)

## The finding that constrains everything

Disagreement can be made into a **product** only where three conditions hold **jointly**:

- **i.** Genuinely **decorrelated** second opinions are possible
- **ii.** A **written rule for divergence** exists, fixed _before_ the answers are seen
- **iii.** **Truth eventually adjudicates** — someone later finds out who was right

Condition **iii** is the one that kills most candidates. Domains without it — taste, strategy, aesthetics — can host
disagreement but cannot host a product made of it, because nothing ever disciplines the flag into being right.

Condition **ii** is what separates an established institutional practice from a mere culture of checking. In blinded
independent central review and in audit engagement-quality review, what happens on divergence is specified in advance.

## Agreement is only evidence if errors are decorrelated

The load-bearing number for any multi-model claim:

| Configuration                | Measured error correlation ρ |
| ---------------------------- | ---------------------------: |
| Same model, resampled        |                       ≈ 0.40 |
| **Different model families** |                   **≈ 0.08** |

Source: [arXiv:2601.22290][arxiv-2601-22290] §4.4.4. The same paper bounds correlated system error as
`P_corr(n, p, ρ) ≤ (1−ρ)·P_ind(n,p) + ρ·p` (Theorem 4) — as ρ → 1 consensus yields **zero** benefit and majority vote
inherits the shared error at full rate.

**Why this matters here.** Gonka serves three models from three different labs, which is the ρ ≈ 0.08 regime rather than
ρ ≈ 0.40. `[ASSUMPTION]` No source measures ρ for DeepSeek-V4 / Kimi-K2.6 / MiniMax-M2.7 specifically, and all three are
trained on substantially overlapping corpora, so this is favourable but not proven.

### What consensus buys, measured

| Result                                                              | Source                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Precision 73.1% → **93.9% (two models)** → **95.6% (three models)** | Probabilistic Consensus Framework, via arXiv:2601.22290 §2.2 |
| Self-consistency decoding: +17.9% GSM8K, +11.0% SVAMP, +12.2% AQuA  | Wang et al. 2023, via the same §2.2                          |
| Three LLMs critiquing each other: GPQA-diamond 46.9% → 68.2%        | ICE framework, via the same §2.2                             |

### What it does not buy

- **Naive self-consistency is weak.** Asking twice and flagging differences detected only **45% of injected
  hallucinations at a 12% false-positive rate**, +3–5 s and +$0.03/request. Structural evidence — signed execution
  receipts — hit **91% detection at 4% FPR** ([arXiv:2603.10060][arxiv-2603-10060], Table 3). Where real evidence is
  available it beats statistical agreement decisively.
- **Consensus measures stability, not grounding.** Claims resting purely on parametric knowledge were still correct only
  71.2% of the time (same paper, Table 6) — and that is exactly the regime where models _agree_ while having no
  independent evidence.
- **Agreement degrades as models converge.** ["Correlated agreement blindness"][arxiv-2607-19899] (PAAMS 2026) documents
  disagreement-gated oversight weakening as foundation models share pretraining and alignment.

**The limitation to state openly:** when several models agree, that agreement is evidence of correctness only to the
degree their errors are decorrelated. Multi-model consensus is a **calibrated confidence signal, not verification.**

## When disagreement is a lie

Divergence must be certified before it means anything. Concrete tests, all from the synthesis:

| Failure mode                          | Test                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **One model is simply weaker**        | Condition on solo accuracy; certify a pair only if both clear a domain accuracy floor                                                                                          |
| **Prompt sensitivity as certainty**   | **Paraphrase invariance** — meaning-preserving rewrites, re-ask the _same_ model, measure flips                                                                                |
| **Sampling noise**                    | **Variance decomposition** — sample each model _k_ times; only between-model variance in excess of within-model variance is signal. _The most important and most skipped test_ |
| **Wording differs, substance agrees** | Normalise to a controlled schema before comparing; count disagreement only at the semantic layer                                                                               |
| **Anchoring and sycophancy**          | Never show one model another's answer before it commits                                                                                                                        |
| **Shared blind spots**                | Plant items where consensus is known to be wrong; agreement there is _anti-informative_                                                                                        |
| **Unanswerable or style questions**   | Disagreement should rise monotonically with item difficulty. If it does not, it is style variance                                                                              |

**The synthesis test, the only one that matters:** on a labelled set, is the best single model materially _less_
accurate on flagged items than unflagged ones? If not, the disagreement is decorative.

## What the demo must prove

Not "models sometimes disagree" — every audience already believes that, which is why it does not land. It must prove
**the disagreement score is a working risk light**.

| Beat       | On screen                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **0–20s**  | One hard item. Models differ. Neither is obviously wrong. "A system shipping one of these would have been confident and wrong"    |
| **20–40s** | **The control.** Trivial items from the same domain, all models identical, zero flags. Proves the flag is not always-on           |
| **40–70s** | **The aggregate.** "Where models agreed, the best single model was right _X_%. Where they disagreed, _Y_%." That gap is the pitch |
| **70–90s** | The operational consequence in the user's existing workflow                                                                       |

**A second bar kills the obvious objection.** Show that self-reported confidence barely separates the two groups while
disagreement separates them sharply — disagreement finds errors the model does not know it has, which is the definition
of a second opinion.

### What makes it unconvincing

- **No ground truth on stage.** Without it the flag is a vibe. This is why condition **iii** is non-negotiable
- **No control set** — the audience assumes the flag fires constantly
- **Cherry-picked novelty questions**; the audience correctly suspects curation
- **Averaging as the straw man.** The honest baseline is the best single model plus its own confidence
- **Undisclosed model provenance.** Independence is the load-bearing premise; disclose it before being asked

## Established practice anchors

Where humans already pay for an independent second answer, the need is real and priced. The strongest anchors, with what
they cost:

| Practice                           | Institution                                           | Cost / latency                                                     |
| ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Mammography double reading         | NHS Breast Screening Programme, all screens           | Roughly doubles reader-hours — the main cost driver                |
| Pathology second review            | Required at NCI-designated centres for outside slides | Days to weeks; a few hundred dollars per case                      |
| Blinded independent central review | FDA/EMA pivotal trials with imaging endpoints         | Millions per trial; adjudication on every discordant pair          |
| Engagement quality review          | ISQM 1 / ISA 220, PCAOB inspected                     | Senior-partner time; adds weeks to signoff                         |
| Model risk effective challenge     | Fed SR 11-7, OCC 2011-12, PRA SS1/23                  | Thousands of validators as a distinct career track                 |
| Exam double-marking                | UK degree classification; ETS/Ofqual double-scoring   | Doubles marking cost; inter-rater reliability is a contractual KPI |
| Ensemble weather forecasting       | ECMWF/GFS, 30–50 perturbed members                    | The _spread_ is the product — nobody averages it away              |

**The pattern:** the second answer is produced independently, compared before the single answer is consumed, and
governed by a written rule about what divergence does. Most AI ensemble pipelines get the first and third wrong.

## Sources

All accessed 2026-08-30.

- [arXiv:2601.22290][arxiv-2601-22290] — consensus theory, correlation coefficients, Theorem 4
- [arXiv:2603.10060][arxiv-2603-10060] — self-consistency vs receipt-based detection, Tables 3, 4, 6
- [arXiv:2607.19899][arxiv-2607-19899] — correlated agreement blindness, PAAMS 2026
- [arXiv:2604.07650](https://arxiv.org/abs/2604.07650) — auditing behavioural entanglement between LLMs
- [arXiv:2603.20975](https://arxiv.org/abs/2603.20975) — DiscoUQ, structured disagreement analysis
- [Trust or Escalate, arXiv:2407.18370](https://arxiv.org/pdf/2407.18370) — ICLR 2025, selective evaluation with
  guarantees

[arxiv-2601-22290]: https://arxiv.org/html/2601.22290v1
[arxiv-2603-10060]: https://arxiv.org/html/2603.10060v1
[arxiv-2607-19899]: https://arxiv.org/html/2607.19899v1
