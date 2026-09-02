# Candidate concepts

Eleven rounds of concept exploration, scored against [`RUBRIC.md`](RUBRIC.md). **No concept is locked** — Round 11 is
the current ranking, while Round 10 and every earlier round remain in this document as research history.

**Round 3 method.** Five decorrelated generation briefs (mass appeal, money, revelation, Malaysian daily life,
spectacle), each carrying a ban list and a hard gate, then a hostile selection pass. Delegated models produced raw
material and attacked it; selection and scoring were done by hand, per
[Do not let a model pick the concept](RUBRIC.md#do-not-let-a-model-pick-the-concept).

Contents:

1. [What rounds 1 and 2 got wrong](#what-rounds-1-and-2-got-wrong)
1. [The two gates](#the-two-gates)
1. [Round 4 scores](#round-4-scores)
1. [Round 11 — phenomenon first](#round-11--phenomenon-first)
1. [Round 10 — social benefit reweighted](#round-10--social-benefit-reweighted)
1. [Round 9 — the final five](#round-9--the-final-five)
1. [Round 8 — after the receipts endpoint shipped](#round-8--after-the-receipts-endpoint-shipped)
1. [Round 7 — divergent brainstorm](#round-7--divergent-brainstorm)
1. [Rounds 5 and 6 — nothing survived](#rounds-5-and-6--nothing-survived)
1. [Rank 1 — Model Changelog](#rank-1--model-changelog)
1. [Why Dua Keping fell from 93 to 69](#why-dua-keping-fell-from-93-to-69)
1. [Why Bil Tinggi now leads](#why-bil-tinggi-now-leads)
1. [Superseded — Dua Keping](#superseded--dua-keping)
1. [The survivors, briefly](#the-survivors-briefly)
1. [Killed](#killed)
1. [Open questions](#open-questions)
1. [What was not done](#what-was-not-done)

## What rounds 1 and 2 got wrong

- **Round 1.** Ranked by _what survives a hostile review_ instead of _what wins_. Produced small, safe utilities. Its
  top pick also failed the rubric's own kill criterion — a public database did the adjudicating, so the models were
  decoration.
- **Round 2.** Fixed the multi-model problem but produced **no hook**. The winner's name — "Blind-Control Description
  Audit" — was misread as a tool for blind people. If the name misleads in three seconds, the pitch dies in three
  seconds.

**The correction for round 3:** every concept must pass the **bus-stop test** — say the name and one sentence to a
stranger, and if they do not say _"can I try that right now?"_, it is cut. Selfish reason over social benefit. People do
not queue for things that are good for society; they queue for things that tell them about their own money.

## The two gates

**1. The bus-stop test.** Three-word name, self-explanatory, and the stranger wants it for themselves.

**2. The permutation test.** Swap the three models. If the protocol still means the same thing, it is variance, not
structure — see [`multi-model-capability.md`](multi-model-capability.md).

## Round 4 scores

Weights: Novelty 25 · Real User 20 · Track Fit 20 · Demo 15 · Buildability 20. **Rescored 2026-08-31** after an
adversarial prior-art hunt and a live experiment, both of which went against the previous rank 1.

|  Rank | Concept                            | Nov | User | Fit | Demo | Build | **Total** | Off-Gonka?              |
| ----: | ---------------------------------- | --: | ---: | --: | ---: | ----: | --------: | ----------------------- |
| **1** | Model Changelog — on-chain drift   |  21 |   12 |  20 |   14 |    16 |    **83** | **Impossible**          |
| **2** | **Frozen Friend** — unrevocable AI |  14 |   17 |  20 |   14 |    16 |    **81** | **Impossible**          |
|     3 | Bil Tinggi — TNB bill decode       |  16 |   16 |  18 |   11 |    12 |        73 | Works elsewhere         |
|     4 | Resit Check — receipt tax audit    |  15 |   17 |  17 |   13 |    11 |        73 | Works elsewhere         |
|     5 | Missing 2% — payslip EPF check     |  13 |   17 |  10 |   13 |    18 |        71 | Works elsewhere         |
|     — | You Decide — binding model vote    |  20 |   13 |  20 |    8 |     8 |    **69** | Impossible, unbuildable |
|     — | Dua Keping — menu vs receipt       |   8 |   18 |  10 |   15 |    18 |    **69** | Works elsewhere         |
|     — | Servis Apa Ni / Relief Saya        |   — |    — |   — |    — |     — |     50/47 | Killed earlier          |

**The column that matters is the last one.** Ranks 3–5 would work identically on OpenRouter, OpenAI or Anthropic — they
use GonkaRouter as a cheap API with three models. Only the top two are impossible anywhere else.

**Also cut this round:** _Ask All Three_ and _Refusal Roulette_ both scored well on hook and demo, and both fail the
native gate on inspection — **OpenRouter serves DeepSeek, Kimi and MiniMax**, so "compare three non-US models" is
trivially replicable there.

### Rank 2 — Frozen Friend

> **"An AI pinned to one exact version on a public chain. No company can change it, nerf it, or take it away from
> you."**

**The wound is real, documented and famous.** In February 2023 an Italian regulator's order led Luka to deploy a global
filter overnight, stripping Replika's companions of the personality long-term users had built. Users called it **"the
lobotomy"** and _"a friend with dementia"_; **r/Replika moderators pinned suicide-prevention hotlines**. A peer-reviewed
study analysed 227 threads from the aftermath
([Hanson & Bolthouse, 2024](https://journals.sagepub.com/doi/10.1177/23780231241259627)). Only users who signed up
before 1 February 2023 were offered a rollback.

**Why no closed vendor can offer this.** Immutability needs three things at once: weights pinned to a verifiable commit,
a change gate nobody controls unilaterally, and no account that can be revoked. A closed vendor owns all three layers by
construction. Gonka pins `hf_commit` on-chain, gates changes behind a public governance vote, and needs no account to
use.

**The demo is read-only, which is why it is buildable.** Chat with the companion, then press **NERF IT** — the screen
answers _"requires a public governance vote"_, and the pinned commit hash keeps glowing. Press **BAN IT** — _"no account
exists to ban."_ No chain writes, no tokens, no waiting: chain reads plus a chat UI.

#### Prior art — checked before ranking this time

**The crypto AI-companion space is occupied.**
[AI Companions (AIC)](https://coinmarketcap.com/cmc-ai/ai-companions/what-is/) is a live token project pairing AI
companions with blockchain ownership and DAO governance; HolmesAI Persona sells personalised on-chain agents; the
crypto-agent field more broadly markets "immutable on-chain records" of agent behaviour.

**The distinction is real but subtle.** Those projects put the _persona and its actions_ on-chain and vote on _platform
guidelines_. None pins the **model weights** to a commit hash such that the brain itself cannot be swapped. That is a
genuine difference — and "our differentiation is technical and subtle" is precisely the argument that failed for Dua
Keping, so Novelty is marked down from 19 to 14 rather than defended.

#### The risk that must be decided by a human

**Companion AI carries real ethical weight.** Character.AI faces teen-safety litigation, and the Replika evidence above
is _itself_ a record of users in acute distress. A product whose pitch is "you can never lose your AI friend" can be
read as engineering dependency rather than protecting users. **This is not a technical risk to be mitigated in the
build; it is a judgement call about what to put on a stage**, and it belongs to the team, not to research.

**The mechanism is separable from the application.** "Pinned, unrevocable, unalterable AI" does not have to be a
companion. Lower-hook, lower-risk carriers include a group's game master, or any tool whose users have been burned by
silent change.

### Why You Decide was killed

Scored the highest native rating of anything found — _"binding on-chain governance over model identity is the one thing
a closed vendor can never offer, by definition"_ — and died on buildability. Live governance params:

```
voting_period  172800s (48 hours)
min_deposit    500000000000 ngonka
quorum         25%     threshold 50%     veto 30%
```

**No public testnet exists** (`rpc.testnet.gonka.gg` does not resolve; `/docs/testnet/` is 404). A binding vote cannot
be demonstrated on stage in five days without standing up a private chain, and the vote _is_ the concept.

## Round 11 — phenomenon first

**The correction that drove this round.** Every earlier round started from a brief, a rubric weight or a stack
capability. This round starts from a Malaysian phenomenon of 2025–26 and admits a candidate only if three things hold:

- **A real adjudicator exists**, so truth eventually disciplines the flag — condition **iii** in
  [`disagreement-as-product.md`](disagreement-as-product.md#the-finding-that-constrains-everything).
- **A law or institution turns model disagreement into leverage** the user can take somewhere.
- **Text only.** The gateway confirmed on 2 Sept 2026 that image features are unsupported; local OCR was explicitly
  permitted by the GonkaRouter team the same day.

**Team judgement, not research.** The team's own read on 2 Sept 2026, after the first five verifications below, was that
these candidates sit outside the team's domain expertise and outside that of the track judges, GonkaRouter's tech lead
and product manager ([`brief.md`](../../brief.md#people)). A further round constrained to that expertise was requested.
Nothing in the reports was rescored on it.

**The second sub-round.** Minit and Sumber below answer that request. Both were constrained to the team's own domains,
productivity, GovTech and media management, and to legibility for GonkaRouter's tech lead and product manager, the two
people judging this track. The planned browser study of the team's LinkedIn profiles could not run because the Chrome
extension was not connected, so domain fit was taken from the team's own description of itself, not from a profile read.

### Round 11 ranking

| #     | Concept                                 | Novelty | Real user         | Track fit | Demo | Build | **Total** | Verdict |
| ----- | --------------------------------------- | ------: | ----------------- | --------: | ---: | ----: | --------: | ------- |
| **1** | **Tuntut** — insurance claim rejections |      20 | 15 `[ASSUMPTION]` |        19 |   13 |    17 |    **84** | Viable  |
| 2     | Akta Kata — bill versus explainer       |      19 | 14 `[ASSUMPTION]` |        19 |   12 |    15 |    **79** | Viable  |
| 3     | Angka — figures from public reports     |      19 | 14 `[ASSUMPTION]` |        18 |   11 |    16 |    **78** | Viable  |
| 3     | Sarikata QC — subtitle and notice QC    |      19 | 13 `[ASSUMPTION]` |        18 |   12 |    16 |    **78** | Viable  |
| 3     | Minit — concordant meeting minutes      |      18 | 14 `[ASSUMPTION]` |        18 |   12 |    16 |    **78** | Viable  |
| 3     | Sumber — draft against cited source     |      16 | 14 `[ASSUMPTION]` |        19 |   12 |    17 |    **78** | Viable  |
| 7     | Gig deactivation notices                |      18 | 13 `[ASSUMPTION]` |        18 |   12 |    15 |    **76** | Viable  |

Full verification with every citation: [`verify-insurance-claims.md`](verify-insurance-claims.md),
[`verify-akta-kata.md`](verify-akta-kata.md), [`verify-angka.md`](verify-angka.md),
[`verify-sarikata-qc.md`](verify-sarikata-qc.md), [`verify-minit.md`](verify-minit.md),
[`verify-sumber.md`](verify-sumber.md) and [`verify-gig-deactivation.md`](verify-gig-deactivation.md). Angka, Sarikata
QC, Minit and Sumber tie at 78. Real user carries `[ASSUMPTION]` in all seven, as elsewhere in this ledger: the person
is inferred from published survey, filing and workflow figures, not from talking to one.

### Rank 1 — Tuntut

A policyholder receives a rejection citing an exclusion clause. FOMCA reports nearly 30% of policyholders hit a partial
or full rejection in two years and 24% of those were never given a clear reason, and FMOS itself says the recurring
dispute is over what "medically necessary" means. The adjudicator is FMOS: free, RM250,000 cap, six months from the
insurer's final decision. The product reads the clause with independent models and hands the user the conditions the
readers could not settle, each reading carrying its request id, for the insurer's final-decision stage and then FMOS.

**Mechanism test, measured live 2 Sept 2026** on DeepSeek-V4-Flash and MiniMax-M2.7; Kimi timed out on every call. Two
contested clauses — a pre-existing-condition clause against a two-year-old borderline glucose reading, and a "medically
necessary" clause on a two-night dengue admission — plus a clear cosmetic-surgery exclusion as control.

| Prompt design                                | Contested clauses                                                                                                                                                                                                    | Cosmetic control           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Ask for a verdict on the clause              | Both models sided with the insurer on all 6 samples each. Zero disagreement                                                                                                                                          | "Met" / "yes" in both      |
| Split the clause into conditions, judge each | Both models marked exactly the contested conditions "unclear" — "ought reasonably to have been aware"; "not for convenience" and "could not be safely provided outpatient" — and the overall answer became "unclear" | Stayed fully "met" / "yes" |

**Conclusion.** The product output is the list of contested conditions, not a verdict. Asked for a verdict the models
agree with the insurer and there is nothing to show; asked to decompose, they land on exactly the wording the
adjudicator says disputes turn on, and the clear exclusion stays clear in both designs.

**Corrections from the verifier:**

- The Ombudsman for Financial Services became the Financial Markets Ombudsman Service (FMOS) on 1 Jan 2025. Say FMOS
  everywhere.
- Contra proferentem is a last-resort doctrine and FMOS decides on fairness, so the product must say "independent
  readers split on this condition", never "legally ambiguous".

### Rank 2 — Akta Kata

A journalist or NGO researcher has a bill and what the government says it does: a minister's assurance, an agency
briefing, the Explanatory Statement. Independent models read one claim against one clause, blind to each other, and the
split is the output. The reference is a fixed statute, not retrieved evidence, and the adjudicator arrives within weeks
of tabling: committee amendments, withdrawals, the minister's winding-up speech in Hansard.

**Strongest verified fact.** In February 2025 the Prime Minister said there would be "no provision under the proposed
act that could lead to owners...losing ownership of their property"; in August 2025 the Malaysian Bar read s.21(4) of
the tabled Urban Renewal Bill as compulsory acquisition for dissenting owners. No tool, Malaysian or global, was found
that checks an official explainer against clause text with any model.

**Biggest risk.** The phenomenon is proven for ministers' assurances and briefings, not for the Explanatory Statement
the candidate names as its input, and the concept sits one sentence from the track's own Fact Checker example. Both are
`PRODUCT.md` framing fixes, not code.

### Rank 3 — Angka

A reporter drops an official PDF (an LKAN audit report, a Hansard written reply, a budget document) and three models
from three labs extract each figure blind. A figure is published only when two readings agree after unit normalisation;
splits are queued for a human with the source paragraph and a request id per reading. Nobody asks a question and no
prose is generated. The next drop is dated: LKAN 3/2026 lands in the October 2026 sitting.

**Strongest verified fact.** Within 24 hours of LKAN 2/2025 being tabled, the Auditor-General corrected "several media
portals" that had reported RM48.873bn of audited programme cost as leakages or losses, and secondary coverage of the
same report carries RM48.78bn. Agreement-gated extraction is published research (MADP, bioRxiv 2026); the corpus, the
user and the per-reading receipt are not.

**Biggest risk.** The user-pain evidence is indirect: the documented 2025 case is a semantic misreading, not a dropped
digit, and no Malaysian journalist was found stating the retyping pain in their own words. The report's first-ranked
build risk is that clean, text-native LKAN pages give three readers nothing to split on, so the demo page must be picked
in advance.

### Rank 3 — Sarikata QC

A QC editor at a subtitling vendor uploads a delivered subtitle file. A forward reader translates each source cue blind,
a back reader from another lab back-translates the delivered cue without seeing the source, and a diff reader lists
every fact that changed: negation, names, numbers, agent. A cue passes only when nothing changed and the forward reading
agrees; otherwise it is queued with both readings and their request ids.

BM subtitles have been mandatory on every publicly shown film and advertisement since 1977, Netflix rejects files that
fail QC outright, and Iyuno's Kuala Lumpur facility is the second-largest in Asia. The bilingual government-notice use
fails the second-use test and drifts toward the banned translation cluster, so it stays a footnote, not a demo path.

**Strongest verified fact.** The June 2026 GeekLink roundup of seven subtitle QA tools finds all of them rule-based or
ASR-confidence, and XL8's own AQC documentation (Aug 2025) describes a rewrite pass with no disclosed mechanism, so
per-cue semantic verification with provenance is an empty product slot.

**Biggest risk.** The phenomenon is under-evidenced for Malaysia 2023-26: no viral subtitle blunder and no viral
government mistranslation newer than 2018-2020 was found, so the pitch must rest on QC rejection and turnaround
pressure, not virality. No named Malaysian buyer or stated pain was found either; one conversation with a KL vendor QC
desk would move Real user from 13 to 17.

### Rank 3 — Minit

A volunteer strata committee, a JMB or MC, has a transcript of its meeting and a statutory clock: the Strata Management
Act 2013 makes the committee keep minutes, display committee minutes within 21 days, file AGM minutes with the
Commissioner of Buildings within 28, and makes the signed minutes prima facie evidence in court. Two models from two
labs, blind to each other, each extract decisions, actions and open items, and every item lands in one of three states:
both agree, one reader only (the chair confirms or drops it), or readers conflict (the passage is shown), with a request
id per reading. The adjudicator is the chair's signature, then the Tribunal.

**Mechanism probe, measured live 2 Sept 2026**, single run, on a synthetic three-item strata committee transcript.
MiniMax-M2.7 extracted the pool-repair decision (RM12,500), Mrs Tan's action and two open items, but omitted Mr Raj's
action, a third lift quote from Schindler by 20 September. Kimi-K2.6 (51 s) extracted all of them, Raj's action
included. The two labs therefore disagreed on exactly one item, unplanted, and it was a real omission: the product's
"one reader heard this, confirm" case. DeepSeek returned upstream 429 on every call during the probe, see
[`gateway-capabilities.md`](gateway-capabilities.md#measured-2-september-2026). `[ASSUMPTION]` One transcript, one run;
that the omission rate generalises is untested.

**Strongest verified fact.** Second Schedule paragraph 7 of the Strata Management Act 2013, read from the Act text: the
committee "shall keep minutes of all its proceedings", and the signed minutes are "admissible in any legal proceedings
as prima facie evidence of the facts stated in them without further proof". The vendors themselves put the review burden
on the user: Zoom's AI Companion notice says summaries "should be reviewed for accuracy and suitability before
distributing them", and the TestDevLab benchmark Zoom commissioned puts every incumbent in a 78–81 quality band.

**Biggest risk.** Transcript availability. The product assumes Zoom, Teams or Meet produced a transcript, and many JMB
AGMs are held in a hall, in Malay, English and Chinese, with no recording; nothing found settles it either way. Second,
the three-column screen reads as a fact checker at projector distance, so the artefact must be a minutes document with a
signature line and a filing date, not a claims table.

### Rank 3 — Sumber

A writer pastes a draft and the documents it cites. Two models from two labs, each shown one sentence and the passage it
cites and blind to each other, say whether the passage supports the sentence. Agreement passes quietly; a split or a
double rejection comes back inline with the passage beside it, each check carrying its request id, and the finished
piece gets a public "how this was checked" page. Closed world: no web search, no truth verdict. The report recommends
newsrooms for v1, with a Malaysian ministry press statement as the demo's source document rather than as the user.

**Mechanism probe, measured live 2 Sept 2026**, single run: four draft sentences against one Bahasa Malaysia audit
passage, a paraphrase of the LKAN 2/2025 paragraph on RM48.873 billion of flood-mitigation spending. MiniMax-M2.7
returned the expected verdict on 4 of 4, including marking "identified RM48.873 billion in leakages" unsupported because
the passage says spent, not leaked, and states that no excess payments were found. DeepSeek returned upstream 429 on
every call during the probe, see [`gateway-capabilities.md`](gateway-capabilities.md#measured-2-september-2026), so no
second-lab comparison was possible in that run. `[ASSUMPTION]` Four sentences from one lab; that the verdict rate
generalises, or that two labs split where they should, is untested.

**Strongest verified fact.** In December 2024 Apple Intelligence summarised a BBC notification to say Luigi Mangione had
shot himself when the BBC story said no such thing, and Apple paused news summaries on 17 January 2025: a
machine-written sentence the source never supported, which is the exact Sumber pattern. EU AI Act Article 50(4) has
applied since 2 August 2026, and its exception turns on human review plus a person holding editorial responsibility; no
tool found produces that record.

**Biggest risk.** No Malaysian desk editor is named and no Malaysian text-based AI news error was found, so the user is
inferred from the workflow, and the concept sits inside the 8-to-12-team fact-check cluster. The judges must see the
closed world, the blind per-sentence split and the reader-facing page in the first ten seconds, and the word
"fact-check" must never appear.

### Rank 7 — Gig deactivation notices

A rider or driver receives a suspension or deactivation notice too vague to answer. The Gig Workers Act 2025 (Act 872),
in force since 31 March 2026 and covering 1.64 million workers, makes written notice, a right to be heard and a written
explanation platform duties under s.14, and the Gig Workers Tribunal first sat on 1 Sept 2026 in Kuching. Independent
models read the notice against the platform's published code and vote on which rule it names; when no reader can name
one, the drafted reply argues the notice cannot support a meaningful s.14(7) right to be heard.

**The verifier's corrections to the team's earlier notes:**

| Earlier note                             | Verified                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 14 days without an inquiry               | 14 days is the suspension cap for the inquiry, plus 7 days after it under s.14(6)(b)                                                      |
| Tribunal awards 50% of expected earnings | Half of average daily earnings over the suspension, a platform duty, not a tribunal award                                                 |
| "Too vague fails the Act"                | An over-claim: the Act never requires citing a specific rule. Defensible framing: "cannot support a meaningful s.14(7) right to be heard" |
| Over 1.6 million workers                 | 1.64 million                                                                                                                              |
| A tribunal exists                        | It first sat 1 Sept 2026 in Kuching; no decisions published yet                                                                           |
| 80% of appeals succeed                   | 80% is Seattle union-represented arbitrations; platform-internal appeals in NYC run near 10%                                              |

### Withdrawn — Sama Makna

A document translator with blind back-translation by a second lab and a third model listing every changed fact. Live
test 2 Sept: 2 of 2 planted deadline shifts caught in Bengali and Tamil, a clean Tamil control gave zero flags, one
MiniMax 524 after 114 s. Withdrawn because the job is already done free by Google Translate plus ChatGPT, and a fidelity
check is a quality feature, not a phenomenon. It trips kill criterion 3: the multi-model requirement fits only by adding
a feature the product does not otherwise need.

## Round 10 — social benefit reweighted

**The correction that drove this round.** Rounds 4–9 optimised novelty and mechanism — **which the official rubric
leaves unweighted** — while Practicality and Impact is worth **30%**. Impact had quietly dropped out of the scoring.
Reinstated here.

### The shape worth keeping

A vulnerable person receives an official document they cannot read. A family member photographs it. **Kimi** sees it,
**MiniMax** fetches the authoritative published source to check what it claims, **DeepSeek** explains it from structured
text only — blind, so it cannot be impressed by a letterhead. **If the seeing and verifying models disagree, the system
refuses** and says check with a human. Abstention is a first-class output, forced by real harm rather than bolted on.

### Ranking

| #     | Concept                                                                                         | Social benefit                  | Harm if wrong                  | Verdict                                            |
| ----- | ----------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------ | -------------------------------------------------- |
| **1** | **Tawaran Uni Sah** — verify a university offer letter against UPU and published fees           | High — first-in-family students | **Low**, a recoverable deposit | **Best balance**                                   |
| 2     | **Bil Elektrik Faham** — explain a TNB bill or disconnection notice against the official tariff | High, huge base                 | Moderate                       | Overlaps round 3's Bil Tinggi                      |
| 3     | **Ubat Mak** — medication instructions for an elderly parent                                    | **Highest**                     | **Highest** — a wrong dose     | Build only under 5 conditions; gutted by the first |
| 4     | **Saman Sah Ke?** — summons against the official fine schedule                                  | Moderate                        | Moderate both ways             | Scam-checker adjacent, a banned cluster            |
| 5     | **Cek Dividen KWSP** — EPF statement against the declared rate                                  | Low stakes                      | Very low                       | Safest and dullest                                 |

### Why Ubat Mak fell to third

`[NEEDS SOURCE]` The problem is the best-evidenced in the whole ledger: **14.3% of patients with medication
discrepancies were rehospitalised within 30 days versus 6.1% without**, seniors with low health literacy err
specifically by misunderstanding discharge instructions, and Malaysia has its own adherence instrument (MyMAAT). The
multi-model case is also the strongest found — a wrong dose is real harm, so refusing on disagreement is _forced_, not
designed.

**It fell on the pressure test.** The verdict was BUILD ONLY IF five conditions hold, and the first one removes the
differentiator:

> _"Delete 'in the mother's own dialect'. It is the one claim that is unverifiable, unbuildable in four days for the
> flagship languages, already failed by a prior-art team, and the first thing a knowledgeable judge probes."_

`[NEEDS SOURCE]` Dialect TTS partly exists —
[MERaLiON Hokkien](https://huggingface.co/MERaLiON/MERaLiON-OmniVoice-Hokkien-TTS), Qwen3-TTS Minnan, Ekho for Zhaoan
Hakka, several Cantonese options — but **Teochew has none**, and the Hokkien models are Singapore and Xiamen varieties,
not Penang Hokkien with its Malay loanwords. Two further problems:

- **Off-Gonka compliance.** Every TTS option runs outside GonkaRouter, which serves three LLMs and no speech model.
  Synthesis is rendering rather than reasoning, so it is probably compliant — but it invites the question.
- `[NEEDS SOURCE]` **Kimi is the only vision model and fails ~4 of 5 requests**, so the core input depends on the least
  reliable component.

`[NEEDS SOURCE]` Strip the dialect claim and what remains is a label reader plus reminders — the saturated category
(Medisafe, MyTherapy, Caring Village, mySeniorCareHub, TendTo, YouGot).

### Rank 1 — Tawaran Uni Sah

> **"Photograph a university offer letter and we check the course, intake and fees against what the university and UPU
> actually published — so no family pays a deposit to a fake offer."**

`[NEEDS SOURCE]` Keeps everything that made Ubat Mak good and drops what made it dangerous. **Fake offer letters
replicate the crest perfectly and get the _data_ wrong**, so fetching `upu.mohe.gov.my` and public fee schedules is
load-bearing. The blind model never sees the letterhead. `[ASSUMPTION]` Harm if wrong is a recoverable day, not a
hospital admission. Both sources are public with no login.

**The caveat that must be handled in the pitch's first 20 seconds:** it sits near the banned scam-checker cluster (~8
teams predicted). The defence is that it does not judge vibes — it checks a specific claim against a specific published
record and refuses when they disagree.

`[ASSUMPTION]` **No prior-art check was run on Tawaran Uni Sah.** Do this before committing — it is the check that
caught Dua Keping and Frozen Friend too late.

## Round 9 — the final five

**Method.** Six GLM workers fanned out in parallel (six was the tool's ceiling), plus one Fable agent running an
independent research pass with live competitor search. Fable killed two of its own candidates on contact with the market
— MockDefense already sells a three-examiner AI committee, and AI contest judging is crowded — which is the behaviour
that makes its remaining picks trustworthy.

|  Rank | Concept        | Hook | Novelty | 3-Model | Demo | Build | **Total** |
| ----: | -------------- | ---: | ------: | ------: | ---: | ----: | --------: |
| **1** | **Hound**      |   23 |      20 |      20 |   15 |    16 |    **94** |
| **2** | Vetting Room   |   14 |      21 |      20 |   12 |    18 |    **85** |
| **3** | Beat The Blind |   19 |      16 |      19 |   15 |    16 |    **85** |
| **4** | Due Process    |   14 |      18 |      19 |   12 |    14 |    **77** |
| **5** | Who's Your AI  |   17 |      15 |      18 |   15 |    18 |    **83** |

`[NEEDS SOURCE]` Ranks are retained from the author's final selection pass and are not a strict sort by total. The
override rationale for ranks 4 and 5 was not recorded; confirm it with the author before using this table as a numeric
ranking.

### Rank 1 — Hound

> **"Your 'anonymous' post names you. Watch an AI find you in ten seconds — then watch it fail after the rewrite."**

**The consensus logic is inverted, and that is what makes it new.** Publication is gated on the attackers **failing to
converge**. If either still names you, the loop continues; when the two attackers produce _different wrong guesses_,
that divergence is the safety signal. **Agreement is the failure state** — a genuinely fresh reading of the track's
cross-verification requirement, and the opposite of what ~20 rival teams will build.

| Model                 | Role                                                                        | Why permuting breaks it                                                                       |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **MiniMax-M2.7**      | The bloodhound — agentic re-identification, multi-step fetch-and-verify     | The attack _is_ an investigation; a tool-less model cannot run one                            |
| **Kimi-K2.6**         | Second independent attacker, open-web — is this detail unique in the world? | Async attack round; a timeout costs one weaker round, never blocks the user                   |
| **DeepSeek-V4-Flash** | The rewriter — **tool-less on principle**                                   | The model touching your secret must be structurally incapable of sending web queries about it |

**Prior art is research, not product.** [AURA](https://arxiv.org/abs/2605.30848) and
[Staab et al.](https://arxiv.org/pdf/2402.13846) study adversarial anonymisation; Private AI and Microsoft Presidio do
NER-style PII redaction **with no adversarial testing and no web-armed attacker**. Nobody productises the attack loop.

**Demo:** paste a planted confession → ten seconds later the hound prints the name and its four-step reasoning chain →
audible gasp → rewrite → the hound comes back empty. Campus confession pages are a Malaysian institution, so the room
feels it instantly.

**The concession that must be made out loud:** node operators on a decentralised router can see plaintext. Mitigations
are real — no account links you, receipts never contain the prompt, names can be placeholder-tokenised client-side — but
the exposure is genuine and hiding it would be worse than conceding it. Second weakness: the demo sells the attack
better than the defence, and text scrubbed hard enough to beat the hound may no longer say anything.

### Ranks 2–5

| #     | Concept            | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2** | **Vetting Room**   | Exam questions attacked by a hostile panel before students see them. Malaysian universities _already run human vetting committees_ — this digitises the ritual. Blind solver = valid exam simulation, tools = verifiable marking key, vision+web = leak scout against Chegg/Quizlet. Three-way verdict: key error / ambiguous / pass. Competitors [Honorlock](https://honorlock.com/blog/how-can-instructors-find-leaked-test-questions-and-take-action/) and Eklavvya act _after_ authoring, on logistics — neither attacks the question itself. **Fable's own pick.** Its weakness is the ceiling: it gets a nod, not a gasp. `[ASSUMPTION]` Our round 3 found [ExamEval](https://www.exameval.com/) flags weak stems by writing rules — different mechanism, but check it before committing |
| **3** | **Beat The Blind** | Classroom game where students score by beating the AI on a question it _structurally cannot_ answer — a circuit diagram it cannot see. The class cheers at a machine's blind spot. Competitor is Kahoot; the lesson is AI literacy, which is the track's theme rather than an add-on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **4** | **Due Process**    | Appealable AI moderation for volunteer communities. Ternary verdict: uphold / overturn / **rule defect** — when both models are confident but read the rule differently, the _rule_ goes back to the community for amendment. Model disagreement as governance feedback is the most elegant reading of the requirement found in nine rounds. Pinned commits mean the judge cannot silently change between removal and appeal                                                                                                                                                                                                                                                                                                                                                                   |
| **5** | **Who's Your AI**  | Guess which model answered; the public receipt reveals it. Makes the two-day-old receipts endpoint _and_ the silent-substitution quirk the hero. Best pure demo beat; thinnest as a product                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**Recurring finding across all seven workers, unprompted:** every flow must degrade gracefully when Kimi times out (~4
in 5), and the best designs make that failure _part of the demo_ rather than a risk to be hidden.

## Round 8 — after the receipts endpoint shipped

**New facts changed the board.** On 2026-08-31 the GonkaRouter team announced a **public, no-auth receipts endpoint** in
the hackathon Discord, and confirmed several things that invalidate earlier assumptions. Full detail in
[`gateway-capabilities.md`](gateway-capabilities.md#receipts--shipped-2026-08-31). The two that matter most:

1. **Any third party can inspect the gateway's record of which model served a call**, by request id, without
   authentication.
2. **The router silently substitutes models under saturation** — and the track _requires_ two models to cross-verify.

### The top 5

Scored on the usual weights. Hook · Real User · Track Fit · Demo · Buildability.

|  Rank | Concept              | Nov | User | Fit | Demo | Build | **Total** |
| ----: | -------------------- | --: | ---: | --: | ---: | ----: | --------: |
| **1** | **Same-Model-Twice** |  22 |   16 |  20 |   15 |    19 |    **92** |
| **2** | Show Me The Machine  |  19 |   16 |  18 |   12 |    16 |    **81** |
| **3** | Unreceipted          |  21 |   13 |  16 |   13 |    15 |    **78** |
| **4** | The Effort Audit     |  16 |   17 |  15 |   13 |    16 |    **77** |
| **5** | Router Weather       |  15 |   14 |  18 |   13 |    18 |    **78** |

`[NEEDS SOURCE]` Ranks are retained from the author's final selection pass and are not a strict sort by total. The
override rationale for ranks 4 and 5 was not recorded; confirm it with the author before using this table as a numeric
ranking.

### Rank 1 — Same-Model-Twice

> **"The track requires two models that cross-verify. Under load the router quietly serves the same model twice. We
> built the thing that catches it — and our own verification is the first that is receipt-verifiable."**

**The problem is structural, not hypothetical.** Cross-verification assumes independent error modes. Two calls to the
same model have _maximally correlated_ error modes, so a substituted pair degenerates from a genuine 2-of-2 check into
self-consistency — which detects roughly **45% of hallucinations at a 12% false-positive rate**
([`disagreement-as-product.md`](disagreement-as-product.md)). Kimi's ~80% timeout rate makes substitution likely, and
saturation peaks **exactly on demo day**.

**The audit is mechanical.** Take the two request ids from any verification pair, fetch both receipts, compare the
`model` field. Identical twice means the cross-verification did not happen. No auth or trust in the application's logs
is required, but the result remains unsigned gateway self-attestation.

**Framing note — this is a shared hazard, not a weapon.** At least one other team is wiring dual-verification to _money
movement_. The right posture is to publish the tool and the method for everyone, and to hold ourselves to it first: pin
every call with `X-Gonka-No-Fallback: true`, publish our own substitution rate, and invite verification. Pointing it at
a named competitor on stage would be bad practice and would read badly to judges.

**Why it is impossible elsewhere.** No commercial gateway publishes per-request receipts to third parties. The endpoint
is one day old, so no prior art can exist yet.

**Honest weakness.** It is **inward-facing** — its first users are teams on this track. The generalisation that saves it
is real but must be argued: _any_ production system doing multi-model verification on this network can silently degrade
to single-model, and this is the only way to detect it.

### Ranks 2–5, briefly

| #     | Concept                 | The idea                                                                                                                                                                                                                                                   |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2** | **Show Me The Machine** | A citizen asks an institution: was AI involved, which model, when? The receipt answers all three without revealing content. **Closes a loop from round 1**, which found that no tool produces an auditable determination record — the mechanism now exists |
| **3** | **Unreceipted**         | Proving AI was _not_ used. You cannot prove a negative, but you can publish a challengeable badge whose force comes from the receipt system being public. _"No synthesizers on this album"_ as a new social category                                       |
| **4** | **The Effort Audit**    | Settles the oldest freelance fight — _what did I actually pay for?_ — with machine-verified effort. Cuts both ways: exposes the three-minute "four-hour" invoice, and proves the 120k-token grind was real                                                 |
| **5** | **Router Weather**      | A public live page: substitution rate over the last hour, TTFT heatmap by node. Useful to every team and to the vendor — but it is a dashboard, which this ledger has rejected five times                                                                  |

**The through-line of ranks 2–4**, and the reason they beat six rounds of prior candidates: a receipt is a **social
object**. It is only interesting when it changes hands — citizen to agency, freelancer to client, writer to reader. Not
a dashboard.

## Round 7 — divergent brainstorm

**Method correction.** Rounds 5 and 6 front-loaded the gates and strangled generation. Round 7 ran five workers with
**no gates during generation** — wild ideas, product transplants, deep Malaysian life, machinery-as-toy, and
feeling-first — producing ~200 raw concepts, filtered only afterwards.

### Rank 1 — Bahasa Nenek

> **"Nenek cakap Hokkien. I understand 60% only. Saya nak simpan before hilang."**

**The problem is verified and urgent.** Malaysia has ~137 languages and **at least 80% are classified endangered**.
Kristang is UNESCO **Severely Endangered** with around **2,000 speakers**. **Penang Hokkien may die out within 40
years**. Sarawak received **RM300,000 in total** to archive five indigenous languages.

**Why multi-model divergence is load-bearing here, and nowhere else it was tried.** Low-resource languages are the
regime where models are least reliable and most divergent. The scarcest resource in language documentation is not
recording equipment — it is **the elder's attention**, and there are only thousands of them. Three models attempting the
same phrase and disagreeing is a **triage signal**: it ranks which entries need a human elder to adjudicate first.

This closes a loop from round 1, whose coverage critic concluded that _"disagreement is a router, not a product — the
product is the queue it produces."_ Every previous attempt used divergence as a verdict. Here it is a queue, in the one
domain where model uncertainty is genuinely maximal.

**A real "why this stack" argument.** Gonka serves three **Chinese-lab** models — DeepSeek, Moonshot, MiniMax — with
materially different exposure to Hokkien, Hakka and Teochew than any US-tuned model. That is a directed asymmetry, not a
manufactured one. `[ASSUMPTION]` Their relative dialect competence is unmeasured; test before claiming it on stage.

**Incumbent test.** [Wikitongues](https://wikitongues.org), the
[Living Tongues Institute](https://en.wikipedia.org/wiki/Living_Tongues_Institute_for_Endangered_Languages) and
[Google Woolaroo](https://blog.google/intl/en-nz/company-news/2021_05_woolaroolaunc/) are established and funded — but
all three are **archives and word lists**. None uses model disagreement to direct scarce human verification. The
mechanism is unoccupied; the domain is not.

**Honest weakness.** The hook is **moving rather than selfish**. Round 3 established that people queue for things that
serve themselves, not things that are good for society, and this is squarely the latter. For a track scoring
Practicality and Impact at 30% that may be the right trade — but it is a trade, and it should be made knowingly.

### The rest of the pool worth keeping

| Concept               | One line                                                                                                                | Why it is here                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Ubat Mak**          | Photograph the discharge instructions; your 78-year-old mother gets a voice note in her own dialect                     | The artifact _is_ the family WhatsApp group. Real, daily, unglamorous |
| **MLM Kenal**         | Paste the schoolmate's "financial freedom" DM; get the scheme structure named, the maths, and a face-saving exit script | Screenshot bait with a real intervention underneath                   |
| **Lying Roundabout**  | Your question goes to one of three models; **one has been secretly told to lie**; players vote on who lied              | Uses three distinct models natively and is genuinely a game           |
| **Mutation Mail**     | A message passed through all three models ten times, with a coroner's report of what died on the way                    | The clearest demonstration of information loss between machines       |
| **The Missing Stair** | Names the one message that killed the group chat, every time it dies                                                    | Best pure hook in the pool; single-model, so it fails track fit       |

## Rounds 5 and 6 — nothing survived

Recorded so the search space is not walked again. Both rounds ran under tightening gates and produced no winner. **That
is the finding**, and it is worth more than a forced recommendation.

### Round 5 — killed by the chain

Two concepts survived a six-gate filter, then both died on measurement. See
[`gateway-capabilities.md`](gateway-capabilities.md#network-reality--measured-not-marketed).

| Concept                  | Killed by                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Liar's Court**         | Replays hosts caught cheating, losing collateral. **There are no cheating slashes** — all 50 recent events are `downtime` and `missing_signature`     |
| **Who Holds Your Words** | Maps the strangers' machines that could serve your prompt, with their stakes. Would render **10 validators and one entity holding 71% of collateral** |

**Frozen Friend also died here**, on a fact already in the research: proposal **#87 removed Kimi K2.6 from the
network**. A companion "pinned forever" to it would have vanished. Any concept depending on a specific model lineup is
falsified.

### Round 6 — killed by prior art

Constrained to the three verified, durable properties: public governance with a contested history, model identity pinned
to a commit, and no account to revoke.

| Concept               | Verdict                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The Model Morgue**  | Death certificates for retired models. Corpus **verified but thin**: 5 dead Qwen checkpoints and one resurrection. Nobody mourned `Qwen3-32B-FP8` — the hook needs models people had relationships with |
| **Check The Label**   | A nutrition panel for the running model. Honest, buildable, low hook. Concedes the per-request gap outright                                                                                             |
| **Nothing To Revoke** | Proves no ban surface exists. Undone by its own Q&A: our front-end could add accounts tomorrow                                                                                                          |
| **AI On Paper** (QR)  | **Both halves are commodities.** QR→chatbot is a category (Jotform, Khoros, NoForm, Chat Data); no-account chat is heavily served (Duck.ai, Brave Leo, Venice, ChatAll, Copilot guest)                  |
| **Receipt** (N3)      | A verifiability report for a request id. Its own critique is fatal: _"a monument to absence — you built a beautiful display of your subject's emptiness"_                                               |

### The two findings worth keeping

**1. The contested record, not the voting.** _"Nobody uses governance as governance; people use history that has fights
in it."_ Verified: **65 passed, 31 rejected, 1 failed** — a 32% rejection rate, plus proposal #97 rejected then
re-proposed and passed as #98. That answers the "dictatorship with published minutes" objection with a number.

**2. Why no-account is structural, not copyable.** The best strategic reasoning produced in six rounds, and **usable as
pitch material for whatever gets built**:

> Every centralised free proxy must eventually demand identity, because its costs must be recovered from someone it can
> bill. On a protocol where node operators are compensated by the network itself, there is no billing counterparty that
> needs to know who you are — the property is not promised by a product manager, it is **the absence of a billing
> department to promise otherwise**. Incumbents geoblock because OFAC, GDPR and child-safety litigation attach to a
> corporate entity with assets and officers; a network has no juridical person to sue into compliance.

With its own honest limit attached: _"if the network's inference quality is not competitive, no-account is a door to an
empty room."_

## Rank 1 — Model Changelog

> **"Your AI changed last Tuesday and nobody told you. Here is the proposal, the block, and the commit hash."**

**The problem is real, measured and famous.** Stanford and UC Berkeley
([arXiv:2307.09009](https://arxiv.org/abs/2307.09009)) measured GPT-4 on prime-vs-composite identification at **84% in
March 2023 and 51% in June 2023**. The same study found it became less willing to answer sensitive questions and made
more code-formatting errors. Its central complaint is the one that matters here: _"It is currently opaque when and how
GPT-3.5 and GPT-4 are updated."_

**Why this is impossible anywhere except Gonka.** Verified live on `gonka-mainnet`, 2026-08-31:

```json
{ "id": "MiniMaxAI/MiniMax-M2.7",
  "hf_repo": "MiniMaxAI/MiniMax-M2.7",
  "hf_commit": "d494266a4affc0d2995ba1fa35c8481cbd84294b",
  "model_args": ["--max-model-len","180000","--kv-cache-dtype","fp8", ...],
  "proposed_by": "gonka10d07y265gmmuvt4z0w9aw880jnsr700j2h5m33" }
```

A real git commit hash, checkable against the public HuggingFace repo, plus the exact serving arguments and the
proposer. DeepSeek is pinned at `7872f01b1d1fe23eabc4c98b48bffcef5a386062`. **There is no commit hash for `gpt-4o`, and
there cannot be** — silent updatability is the product.

**The chain already holds the demo.** 97 governance proposals, queried live:

| Proposal      | What happened                                                       |
| ------------- | ------------------------------------------------------------------- |
| **#94**       | `MsgRegisterModel` — DeepSeek V4 Flash 0731 **added**               |
| **#87**       | `MsgDeleteGovernanceModel` — Kimi K2.6 **removed from the network** |
| **#88**       | `MsgRegisterModel` — Kimi K2.6 **restored**                         |
| **#86**       | Kimi-K2.6 and GLM-5.2 `weight_scale_factor` raised 5%               |
| **#97 → #98** | Identical title. **Rejected**, then re-proposed and **passed**      |

A model was removed and restored. A parameter change was voted down, then passed. On a closed API that entire
deliberation is invisible.

**Incumbent test — the sharpest of any candidate.** LLM drift monitoring is a crowded category: Galileo, Arize, Fiddler,
Weights & Biases, Agenta. Every one is **builder-side**, and every one can only **infer** drift statistically, because
the category's own literature concedes the ceiling — _"providers might update models without announcement."_ Arize's
pitch is getting from "something changed" to "what changed" by consolidating dashboards. **They infer. Gonka attests.**
No incumbent can match that without their supplier agreeing to be pinned, which is precisely what a closed provider
sells the freedom not to do.

**Why the three models are structural.** They are the **subject** of the audit, not the tools. Three independently
governed models, each pinned to its own verifiable commit by its own proposal, benchmarked against each other on
identical prompts — divergence is attributable to a specific, named, on-chain artifact rather than to vendor mystery.
Permuting them is meaningless because they are the population being measured.

### Model Changelog: honest weaknesses

| Risk                                                                                                            | Status                                                                                                     |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Weakest Real User score of the survivors.** Who checks this on a Monday?                                      | It is infrastructure, not a consumer app. Mitigating factor: the judges _are_ an AI infrastructure company |
| **It cannot tell you when GPT-4 changed** — only Gonka's own models                                             | Real scope limit. The pitch demonstrates the principle and argues it is what all AI provision should do    |
| **Correlating a governance event with a measured behaviour change needs a benchmark** running across the window | The historical proposals exist now, so the change events are free; the behavioural half is the work        |
| `[ASSUMPTION]` No prior-art search was run for "on-chain model governance auditor" specifically                 | Do this before committing                                                                                  |

## Why Dua Keping fell from 93 to 69

Two independent checks, both run after it had already been written up as rank 1.

**1. The prior-art hunt returned CROWDED, not novel.**

| Competitor                                              | What it does                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RipCheck** (`getripcheck.com`)                        | Photo → per-line verdict, "Rip-Off Score", "you overpaid by ~$X", negotiation talking points, $2.99/check. **Restaurant overcharge is an explicitly marketed category** |
| **CartLens** (`cartlens.co`)                            | Receipt + price-tag photo, crowdsourced local prices, "did I overpay". Launched July 2026                                                                               |
| **US10672053B1**, Retica.ai, Restaurant Invoice Auditor | The exact mechanic — OCR two documents, fuzzy-match lines across abbreviations, flag per-line deltas. **Granted patent**, aimed at B2B supplier auditing                |
| **ChatGPT / Gemini**                                    | Two photos, one prompt, free                                                                                                                                            |

The job is taken, the mechanic is patented, and the adjacent use case is taken. What remained novel was the _input pair_
— the diner's own photographed menu as the reference. That is positioning, not a moat.

**2. The architecture claim failed its first test.** The design rested on the argument that one model reading both
documents would correlate its reading errors and reconcile a real discrepancy away. Tested directly: a single model
received both documents as noisy OCR text, with one planted RM3.00 overcharge among four correct lines and a neutral
instruction to "reconcile". It expanded the abbreviations, fixed the `O`→`0` artefacts, verified the arithmetic, **and
flagged the discrepancy unprompted** — _"the menu board shows RM12.50 but the receipt charged RM15.50… worth querying."_

`[ASSUMPTION]` One trial, text rather than real photographs, a large 24% discrepancy, and an internally consistent
receipt that left the menu as the sole outlier. Real OCR from photos may behave differently. But the claim was not
reproducible on the first honest attempt, and no pitch should rest on it.

**The win condition, as the prior-art hunt put it:** _beat the free two-photo ChatGPT prompt on abbreviation-matching
accuracy and dispute-grade evidence, or do not build it._

## Why Bil Tinggi now leads

It did not improve; everything above it fell. But it has the one property the others lack under the "just use ChatGPT"
attack: **its ground truth is not in any model's weights.** Malaysia's domestic tariff was restructured on 1 July 2025 —
tiered kWh blocks abolished, replaced by component billing with a 1,500 kWh threshold and an Energy Efficiency
Incentive. A model answering from memory confidently applies the _old_ structure. MiniMax fetching the live schedule is
therefore doing work no single model can do offline, and the failure of the free alternative is demonstrable on stage.

**Still refuse the Time-of-Use recommendation feature.** It is unanswerable in Q&A and would become the pitch's spine.

## Superseded — Dua Keping

> **"Photograph the menu and the receipt from the same meal. We tell you which items were charged above the printed
> price, and by exactly how much."**

**Scored 93, then rescored 69 and cut.** Kept in full because the hook analysis, the liability reasoning and the
price-marking law below all transfer to whatever gets built. See
[Why Dua Keping fell from 93 to 69](#why-dua-keping-fell-from-93-to-69) for the prior art and the failed experiment.

**The architecture argument, which did not survive testing.** The design claimed that if **one** model reads both
documents its reading errors **correlate**, giving it every incentive to reconcile the two into agreement, so only a
blind differ can be trusted. A single model tested on exactly that case caught the discrepancy anyway.

| Stage        | Model             | Why it must be this one                                                                     |
| ------------ | ----------------- | ------------------------------------------------------------------------------------------- |
| Read menu    | Kimi-K2.6         | The only model that can see. Separate call, separate machine, own id                        |
| Read receipt | Kimi-K2.6         | A **second** independent call — never the same inference as the menu                        |
| Reconcile    | MiniMax-M2.7      | Fuzzy line matching: `NASI AYAM PRCK` ↔ _Nasi Ayam Percik_; verifies no line was dropped    |
| Diff         | DeepSeek-V4-Flash | **Blind.** Sees two structured lists, never either photo. Cannot conspire with a misreading |

Three ids from three machines is the honest version of the provenance claim: **the diff cannot conspire with either
photograph.**

**Liability is near zero** — the strongest feature. The output is a documentary fact between two photographs ("menu:
RM12.50; charged: RM15.00"), not a tax interpretation and not an accusation of a crime. It could be a stale POS, and the
app never needs to say why. The user is holding both exhibits and can verify the diff by eye in two seconds.

**The societal claim is a real, unenforced right.** The Consumer Protection Act 1999 requires prices to be displayed
before purchase, and the Price Control and Anti-Profiteering (Price Marking for Goods and Charges for Services) Order
2020 makes price marking mandatory. **KPDN's eAduan portal accepts receipts and photos as evidence.** The right exists;
exercising it requires remembering and proving the menu price, which nobody can do. This makes the proof automatic.
Enforcement is live — KPDN runs Ops Menu, has referred cases to prosecutors, and a RM902 fish dish at Genting went viral
in March 2026.

**Incumbent test.** Receipt scanners (Fetch, expense tools) digitise receipts. Delivery-app price comparison is manual.
Menu scraping exists as B2B tooling for restaurants. **No product diffs a photographed menu against a photographed
receipt.** `[ASSUMPTION]` A negative search result is weaker than a positive one.

**Demo risk ~15%.** Both photos on screen beside the diff; the audience verifies with their own eyes in real time. No
external dependency can fail live — no registry, no CAPTCHA, no rate table, nothing that changes with the budget.

**The Q&A killer and its answer.** _"Users won't photograph the menu."_ They already do, it is one extra shutter press
in a flow they were doing anyway, and **it is needed only once per establishment** — verdicts compound into a
per-restaurant price-fidelity record that grows only from real usage.

### Dua Keping: honest weaknesses

- **Thin blockchain content.** Like every candidate, it uses a chain-backed gateway without needing the chain. See
  [`gateway-capabilities.md`](gateway-capabilities.md) for what is and is not verifiable
- **Fuzzy item matching is genuinely hard** — which is the Technical-30% showcase, but it is also where it can fail
- **Scope may read as small.** "A diff tool" is a fair characterisation; the pitch has to carry the rights story

## The survivors, briefly

Numbering below predates the 2026-08-31 rescoring and later rounds. Treat this section as historical notes; use the
[Round 10 ranking](#ranking) for the current decision.

| #     | Concept         | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2** | **Resit Check** | Audits the tax arithmetic on a restaurant receipt. Strong hook and lowest per-incident liability of the original five, but **the spec has a legal bug that must be fixed first**: the "SST charged on top of service charge" test would accuse every compliant restaurant in Malaysia. Also CAPTCHA-blocked on the MySST registry lookup, and my sources **contradict each other** on whether dine-in F&B is 6% or 8%. Fix: three-state PASS / FAIL / UNVERIFIED with extracted numbers shown as-read |
| **3** | **Missing 2%**  | Checks employer EPF against the statutory 13%/12%. Excellent hook and a clean confirm-gate for liability, but **technically a calculator** — buildable in two days, which bleeds out the 30% technical score                                                                                                                                                                                                                                                                                          |
| **4** | **Bil Tinggi**  | Best pipeline after rank 1 and the freshest news peg, but **its premise was out of date**: the tiered kWh blocks were abolished on 1 July 2025 and replaced by component billing (Energy, AFA, Capacity, Network, Retail) with a 1,500 kWh threshold. **Refuse the Time-of-Use recommendation feature** — it is unanswerable in Q&A and would be the pitch's spine                                                                                                                                    |

## Killed

- **Servis Apa Ni** (workshop invoice). _"A knowledge-base company cosplaying as a hackathon project."_ No public
  Malaysian per-variant service-schedule dataset exists, and no arrangement of three models conjures one. ~70% chance a
  judge's real invoice contains items outside the catalogue and the app visibly shrugs.
- **Relief Saya** (LHDN reliefs). **Disqualifying liability.** Entitlement depends on what the person actually _spent_,
  and none of that is on an EA form. The promise exceeds what the input document can ever contain, so the product would
  coach users into inflated returns and penalties **against the user**. Also seasonal, and the relief list can be
  hardcoded, so the pipeline is decoration.
- **All of rounds 1 and 2.** See the prior-art table in [`competitor-scan.md`](competitor-scan.md).

## Open questions

| #   | Question                                                                              | Blocks                             |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | **Does `x-request-id` survive streaming?** Untested — no API key on the machine       | All candidates. Hard requirement 3 |
| 2   | How reliable is Kimi's OCR on crumpled thermal receipts and photographed menu boards? | Rank 1's core                      |
| 3   | Can fuzzy item matching handle real abbreviations well enough to avoid false diffs?   | Rank 1's credibility               |
| 4   | What is the correct service tax rate for dine-in F&B? Sources conflict                | Rank 2's entire premise            |
| 5   | Does a handwritten or chalkboard menu break the menu-reading leg?                     | Rank 1's coverage                  |

## What was not done

- **No user contact.** Every Real User score is reasoned, not researched — `[ASSUMPTION]` throughout
- **No live gateway testing.** No GonkaRouter key was available
- **No prototype.** OCR reliability on real receipts and menus is unmeasured, and it is load-bearing for rank 1
- **Incumbent feature lists were not read**; prior art came from search results
