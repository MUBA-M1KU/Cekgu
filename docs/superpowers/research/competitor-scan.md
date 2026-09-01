# Competitor Scan

Two separate questions, both answered here: **what will the other teams in this track build**, and **what already exists
commercially** for each concept we considered. The second is the Incumbent Test from
[`RUBRIC.md`](RUBRIC.md#2-the-incumbent-test), run properly with live search rather than from memory.

**Method.** Predicted-competition modelling by a delegated model. Commercial prior art from web search on 2026-08-30 —
every product named below was returned by a search, not recalled. Where a search found nothing, that is stated as a
negative result, not as proof of absence.

---

## Prior Art For Our Own Candidates

**This section killed more candidates than the rubric did.** Read it before reviving anything.

| Concept                                   | Prior Art Found                                                                                                                                                                                                        | Verdict                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Exam question ambiguity**               | [ExamEval](https://www.exameval.com/articles/flaws/unfocused-unclear-open-stem) — AI exam analysis that flags unfocused, unclear and open stems                                                                        | **Direct incumbent**            |
| **Contract / clause ambiguity**           | [Malbek](https://www.malbek.io/blog/contract-intelligence-2026), [Sirion](https://www.sirion.ai/library/contract-insights/contract-intelligence-conflicting-terms-solutions/), Spellbook, Luminance, Ironclad, Evisort | **Saturated**                   |
| **Tender / RFP contradiction**            | [ContraVault AI](https://www.contravault.com/) ships a literal "Contradiction Finder" plus pre-bid clarification generation; QuickBid detects conflicting clauses                                                      | **Direct incumbent**            |
| **Disagreement as an uncertainty signal** | [DiscoUQ, arXiv:2603.20975](https://arxiv.org/abs/2603.20975) — structured inter-agent disagreement analysis; [Trust or Escalate](https://arxiv.org/pdf/2407.18370), ICLR 2025                                         | **Published research**          |
| **Independence / entanglement audit**     | [arXiv:2604.07650](https://arxiv.org/abs/2604.07650) auditing behavioural entanglement between LLMs; [correlated agreement blindness](https://arxiv.org/html/2607.19899v1), PAAMS 2026                                 | **Published, no product found** |
| **Auditable determination record**        | Nothing found. C2PA writes provenance at creation; verifiers only read manifests                                                                                                                                       | **Gap**                         |

### The Load-Bearing Correction

An earlier draft claimed psychometric item analysis "requires students to have already sat the exam", making
pre-administration ambiguity detection structurally novel. **That claim is false.** Ofqual-regulated boards, ETS and
Cambridge Assessment embed non-counting **pre-test items** in live papers specifically to obtain item statistics before
a question counts. This has been standard practice for decades. Any concept resting on that differentiator loses it.

### Two Findings That Constrain Everything

**Multi-model cross-checking is a shipping product trend, not an insight.** Contract intelligence vendors describe the
2026 shift as "ensemble LLM architectures, where multiple LLMs work together, cross-referencing and reconciling
outputs". Our mechanism is their roadmap item.

**Nothing productises the audit of whether consensus is meaningful.** The search returned academic frameworks for
detecting correlated agreement and behavioural entanglement, and no commercial tool. `[ASSUMPTION]` A negative search
result is weaker than a positive one; treat this gap as probable, not certain.

---

## Predicted Competition In This Track

Modelled as ~30 teams brainstorming from near-identical prompts. Counts are estimates, not measurements, and sum to more
than 30 because most teams stack two or three tropes into one project.

| Rank | Concept                                                                                                               | Est. Teams |
| ---- | --------------------------------------------------------------------------------------------------------------------- | ---------: |
| 1    | WhatsApp scam-message checker with trust score                                                                        |          8 |
| 2    | Multilingual fake-news claim checker                                                                                  |          5 |
| 3    | Multilingual government-services chatbot                                                                              |          4 |
| 4    | Job-scam offer checker                                                                                                |          3 |
| 5    | Health-misinformation checker                                                                                         |          3 |
| 6    | Investment / crypto scheme checker                                                                                    |          3 |
| 7–25 | Legal explainer, halal label scanner, OKU reader, live captioning, Hansard checker, flood-rumour checker, and similar |   1–2 each |

### The Shared Signature

Judges will see the same artefact repeatedly: a Next.js and Tailwind app, a central verdict card with a 0–100 score and
a green/amber/red pill, a monospace Request ID chip with a copy icon, a "Model A vs Model B" split panel, and a demo
that opens on a scam-loss statistic and closes on a hash slide.

**The three that become actively tiresome** are the WhatsApp scam checker, the multilingual government chatbot, and the
generic news fact-checker. The track's own flagship example is the most duplicated and most shallowly implemented
concept in it.

### The Structural Observation

> Every predicted project **resolves** disagreement into a verdict. Every unlikely project **harvests** disagreement as
> the product. Every predicted project has a consumer with a phone; every unlikely project has a professional with a
> backlog.

Useful as a direction, but see [`candidate-concepts.md`](candidate-concepts.md) — harvesting disagreement turned out to
have its own trap.

---

## Commercial Landscape: AI Output Verification

Seven products examined. **All seven sell to the team that built the AI system.** None sells to the party receiving an
AI output from someone else.

| Product       | Serves                                       | Pricing                      |
| ------------- | -------------------------------------------- | ---------------------------- |
| Braintrust    | Production AI teams — Stripe, Vercel, Zapier | Free tier; from $249/mo      |
| Galileo       | Enterprise AI dev teams                      | Free 5k traces; from $100/mo |
| Arize Phoenix | AI engineers; open source                    | Free self-host; $50/mo cloud |
| Patronus AI   | Regulated-domain teams                       | $10–20 per 1k API calls      |
| Promptfoo     | Engineering teams, CI-native                 | Free OSS; enterprise custom  |
| Future AGI    | AI product teams                             | Not stated                   |
| Lakera        | AI security, adjacent                        | Not stated                   |

**Why the recipient is unserved, structurally.** Every detection method needs something the recipient does not have:
groundedness checks need the retrieval context, receipt verification needs the execution trace and signing key,
probe-based methods need model internals. The only recipient-accessible methods are generic — and naive self-consistency
detects just 45% of hallucinations at a 12% false-positive rate.

The market framing is explicit in the category's own marketing: these tools exist to "catch bad outputs **before users
do**". The user is the threat the tool protects the builder from, never the customer.

---

## Regulatory Pressure

Relevant because it creates a buyer who is newly obliged and has no tooling.

**EU AI Act Article 50 became enforceable 2 August 2026** — four weeks before this hackathon. Penalties reach **€15M or
3% of worldwide turnover**. `[NEEDS SOURCE]` One source stated €7.5M/1.5%; three others state €15M/3%, and the lower
figure appears to be a misreading of the Article 99 tiers. Verify against EUR-Lex before it goes on a slide.

| Obligation | Binds    | Requirement                                                                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 50(1)      | Provider | People must be informed they are interacting with an AI system                                                                   |
| 50(2)      | Provider | Synthetic output marked machine-readably as artificially generated                                                               |
| 50(4)      | Deployer | Deepfakes disclosed regardless of intent; AI-generated public-interest text disclosed unless a human editor takes responsibility |

**It reaches Malaysia.** Scope follows output and user location, not establishment. `[ASSUMPTION]` Whether a purely
non-EU _deployer_ with EU-facing output is caught is not explicitly settled in the sources read.

**C2PA cannot close the gap.** It certifies edit history, not truth. A screenshot removes the manifest entirely, most
platforms strip it on re-encode, forged-but-valid manifests are demonstrable, and **it does not work for plain text at
all** — there is no container to embed into, and copy-paste carries nothing. Critically, absence of a manifest is not
evidence of "not AI".

**The unmet need:** no tool produces a signed, timestamped, defensible record of "we examined this artifact on date X,
ran checks Y, concluded Z" that a regulator or court would accept.

---

## Sources

All accessed 2026-08-30.

- Search-returned vendors: [ExamEval](https://www.exameval.com/), [ContraVault](https://www.contravault.com/),
  [Malbek](https://www.malbek.io/blog/contract-intelligence-2026),
  [Sirion](https://www.sirion.ai/library/contract-management/contract-ambiguity/),
  [Spellbook](https://spellbook.com/learn/ai-legal-contract-review-faster-analysis)
- [Braintrust hallucination-tool survey 2026](https://www.braintrust.dev/articles/best-hallucination-detection-tools-2026)
  · [Galileo](https://www.galileo.ai/) · [Patronus](https://www.patronus.ai/) ·
  [Arize Phoenix](https://phoenix.arize.com/) ·
  [Lakera](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models)
- [arXiv:2603.10060](https://arxiv.org/html/2603.10060v1) · [arXiv:2603.20975](https://arxiv.org/abs/2603.20975) ·
  [arXiv:2604.07650](https://arxiv.org/abs/2604.07650)
- Article 50:
  [SSL.com](https://www.ssl.com/article/eu-ai-act-article-50-a-complete-guide-to-ai-transparency-compliance/) ·
  [Shibolet](https://www.shibolet.com/en/eu-ai-act-article-50/) ·
  [C2PA Viewer](https://c2paviewer.com/articles/eu-ai-act-content-credentials) ·
  [TrueScreen on C2PA limits](https://truescreen.io/articles/c2pa-standard-history-limitations/)

---

## Round 2 Prior Art

Searched 2026-08-30 against the round 2 candidates in [`candidate-concepts.md`](candidate-concepts.md).

| Candidate                         | Prior Art                                                                                                                                                                                                                                                                                                                                                                                                                                  | Verdict                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Description sufficiency audit** | [Alt Audit](https://altaudit.com/wcag-compliance), [AltText.ai](https://alttext.ai/blog/wcag-alt-text-guide), [WebAbility](https://www.webability.io/blog/image-accessibility) all check whether alt text **exists**, plus heuristics (length, `alt="image"`)                                                                                                                                                                              | **Gap is real.** None measures information sufficiency                                                                  |
| **Gig-worker appeal memo**        | [FareShare](https://arxiv.org/pdf/2505.08904) — academic tool helping _labour organisers estimate lost wages_; [Worker Info Exchange](https://www.cambridge.org/core/journals/the-economic-and-labour-relations-review/article/confronting-algorithmic-management-using-subject-access-requests-insights-using-the-case-of-food-deliveries/C9E469DA7A3348AFC15CBF48FFB0926B) runs UK subject-access-request casework against "robo-firing" | Closer than comfortable. Neither is Malaysian, multi-model, or statute-specific — but "nobody does this" would be false |
| **AI-cheating defence**           | [GPTZero sells a "Writing Report"](https://gptzero.me/news/falsely-accused-of-ai-cheating/) to prove authorship — the accuser also selling the defence; plus student-discipline law firms                                                                                                                                                                                                                                                  | Crowded genre                                                                                                           |
| **Shrinkflation**                 | Subreddits, press databases, consumer apps                                                                                                                                                                                                                                                                                                                                                                                                 | Concept crowded; the two-chain instrument is the fresh part                                                             |

### The Quantified Gaps

**Accessibility.** Automated tooling reliably detects only **30–40% of WCAG issues**; the remaining **60–70% require
human review** for context — explicitly including _whether alt text is meaningful_. **16.2%** of home-page images have
no alt text, and a further **10.8%** carry junk values.

**Algorithmic deactivation.** Platforms overturn **80%** of deactivation decisions on appeal. Malaysia's **Gig Workers
Act 2025 (Act 872) came into force 31 March 2026**, covering over **1.6 million workers**: it creates a Gig Workers
Tribunal, caps deactivation at **14 days** without an inquiry, requires notice and an opportunity to be heard, and
awards reactivation plus **50% of expected earnings** where a worker is cleared. Failing to provide human review can
draw compensation orders. Recorded because the _problem_ remains excellent even though the concept was killed on
mechanism.

**AI-text detection.** Detectors disagree wildly on identical text — human passages score **5.9%–36.9%** AI-likelihood
depending on tool, and outcomes track _"detector design and thresholds rather than consistent evidence of authorship"_.
False positives run **5–20%** on native English and up to **61%** on non-native writing; Stanford found **61%** of TOEFL
essays misclassified. In early 2026 an Adelphi University student flagged "100% AI" won a ruling calling the finding
_"without valid basis"_. Vanderbilt, Yale, MIT and Stanford have disabled or restricted detection. OpenAI discontinued
its own detector.

### Malaysian Accessibility Law — A Soft Hook

`[NEEDS SOURCE]` beyond secondary summaries. The **PWD Act 2008 Art. 28** requires essential services including digital
platforms to be accessible, and Digital Accessibility Guidelines exist, but **Malaysia has no nationwide web
accessibility mandate** equivalent to the European Accessibility Act. Any buyer argument must rest on EU
extraterritorial reach and institutional reputation, not Malaysian statute.
