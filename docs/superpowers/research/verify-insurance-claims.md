# Verification: rejected insurance claims, tested for ambiguity

**VIABLE, 84/100.** Not LOCK, for two reasons set out in [Why not LOCK](#why-not-lock): the disagreement rate on real
clauses is unmeasured, and "three LLMs disagree" is not the same thing as legal ambiguity in Malaysia.

**One correction to the candidate before anything else.** The Ombudsman for Financial Services (OFS) was merged with the
Securities Industry Dispute Resolution Center into the **Financial Markets Ombudsman Service (FMOS)** on 1 January 2025.
Every reference to "OFS" in the product, pitch and complaint template must say FMOS. Sources:

- Bank Negara Malaysia, "Operationalisation of Financial Ombudsman Scheme",
  https://www.bnm.gov.my/-/operationalisation-of-financial-ombudsman-scheme
- BIS, Jessica Chew Cheng Lian speech at the launch of FMOS, 21 Jan 2025, https://www.bis.org/review/r250121g.htm

**Method.** Verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md). 15 search/fetch calls used (the budget). Three
fetches failed (Lexology 403, Malay Mail 403, Counterforce Wikipedia 404); where a figure comes only from a search
digest rather than a fetched page it is marked **[digest]**, this file's grade of `[NEEDS SOURCE]`. Every claim carries
publisher, title, date and URL. In tables the source is a reference link; its definition, at the end of the section,
carries the article title.

Contents:

1. [Phenomenon: a live public issue in Malaysia, 2024-2026](#phenomenon-a-live-public-issue-in-malaysia-2024-2026)
1. [Legal doctrine and the ombudsman process](#legal-doctrine-and-the-ombudsman-process)
1. [Ground truth: FMOS publishes case summaries with outcomes](#ground-truth-fmos-publishes-case-summaries-with-outcomes)
1. [Incumbents](#incumbents)
1. [Predicted competition](#predicted-competition)
1. [Scores against RUBRIC.md](#scores-against-rubricmd)
1. [Why not LOCK](#why-not-lock)

## Phenomenon: a live public issue in Malaysia, 2024-2026

Yes, strongly, and it is still running as of last month.

| Fact                                                | Figure                                                                                                                                                                                                                                                                                                                                                              | Source                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| BNM interim measures on medical repricing announced | 20 Dec 2024; premium rises from medical claims inflation spread over a minimum of 3 years; at least 80% of policyholders to see yearly adjustment under 10%; one-year pause for those aged 60+ on the minimum plan; lapsed 2024 policies reinstatable without new underwriting; measures run to end 2026                                                            | [CodeBlue, Dec 2024], [Galen Centre, 20 Dec 2024], [PIAM], [Milliman]       |
| FMOS first-year volume                              | 3,253 complaints received, 2,268 disputes resolved since 17 Jan 2025 **[digest]**                                                                                                                                                                                                                                                                                   | [Malay Mail, 23 Jan 2026]                                                   |
| Health insurance complaints at FMOS                 | 112 complaints (3.4% of total) as of Q3 2025; 83 (74%) resolved; about RM1.24 million in estimated cost savings **[digest, attribution to the Malay Mail piece not confirmed because the fetch returned 403]**                                                                                                                                                      | [Malay Mail, 23 Jan 2026]                                                   |
| Specialist survey on guarantee-letter (GL) denials  | 855 private-hospital specialists surveyed; 67% report GL revocation or denial after admission or treatment; insurers request lipid profile or blood sugar results clinicians considered irrelevant; quote: "Being overweight is not a pre-existing condition"                                                                                                       | [CodeBlue, 15 Oct 2025]                                                     |
| FOMCA on rejections                                 | Nearly 30% of policyholders experienced a partial or full claim rejection in the past two years; 24% of those said the reason was never clearly explained; premiums for over-60s up two to threefold in two years, up to 300%; some Malaysians taking loans to pay premiums; complaint and appeal process "cumbersome", especially for the elderly **[digest]**     | [The Sun, 2025 or 2026], [CodeBlue, Mar 2025], [FOMCA, 2025], [FOMCA, 2026] |
| Still in the news last month                        | Consumer coverage of premium hikes                                                                                                                                                                                                                                                                                                                                  | [The Rakyat Post, 18 Aug 2026]                                              |
| FMOS's own account of why claims are rejected       | Four reasons: (1) policy exclusions and limitations, (2) breach of conditions, (3) non-disclosure and misrepresentation, (4) failure to safeguard the vehicle. Disputes "often concern interpretation of what constitutes medically necessary care". FMOS "goes beyond strict technical compliance; we evaluate every dispute based on fairness and reasonableness" | [FMOS, 22 Jul 2026], syndicated by [Malaysiakini]                           |
| Historical baseline                                 | OFS received 10,323 complaints in 2015, 6,039 (58.5%) insurance-related                                                                                                                                                                                                                                                                                             | [The Edge Malaysia]                                                         |

**Reading of the evidence.** The issue is real, current, and has a regulator, a consumer body and the medical profession
all on record in 2024-2026. One caution for scoping: the two most common rejection grounds in the FMOS and CodeBlue
material are **non-disclosure / pre-existing condition** and **"medically necessary"** determinations.

The first is a factual dispute, not a clause-wording dispute, and the product does not help with it. The second is
exactly a wording dispute and is where the product lands. Say this out loud in the pitch rather than let a judge find
it.

[CodeBlue, Dec 2024]:
  https://codeblue.galencentre.org/2024/12/bank-negara-caps-medical-insurance-premium-hikes-at-10-for-most-policyholders/
  'Bank Negara Caps Medical Insurance Premium Hikes At 10% For Most Policyholders'
[Galen Centre, 20 Dec 2024]:
  https://galencentre.org/2024/12/20/bank-negara-interim-measures-on-health-insurance-and-takaful-products-are-temporary-but-welcomed/
  'BNM Interim Measures On MHIT Products Are Temporary But Welcomed'
[PIAM]: https://piam.org.my/medical-health-insurance-and-takaful-repricing/ 'Interim Measures for MHIT Policyholders'
[Milliman]:
  https://www.milliman.com/en/insight/asia-e-alert-malaysia-interim-measures-takaful-products
  'Malaysia: Interim measures on MHIT products'
[Malay Mail, 23 Jan 2026]:
  https://www.malaymail.com/news/malaysia/2026/01/23/finance-ministry-fmos-handled-3253-complaints-in-its-first-year-resolving-over-2200-cases/206441
  'Finance Ministry: FMOS handled 3,253 complaints in its first year, resolving over 2,200 cases'
[CodeBlue, 15 Oct 2025]:
  https://codeblue.galencentre.org/2025/10/deny-delay-revoke-specialists-reveal-health-insurance-underbelly-in-malaysia/
  "Alifah Zainuddin, 'Deny, Delay, Revoke': Specialists Reveal Health Insurance Underbelly In Malaysia"
[The Sun, 2025 or 2026]:
  https://thesun.my/news/malaysia-news/fomca-sounds-alarm-over-surging-insurance-premiums/
  'Fomca sounds alarm over surging insurance premiums (date not captured)'
[CodeBlue, Mar 2025]:
  https://codeblue.galencentre.org/2025/03/malaysians-taking-loans-to-pay-for-health-insurance-fomca/
  'Malaysians Taking Loans To Pay For Health Insurance: Fomca'
[FOMCA, 2025]:
  https://www.fomca.org.my/v1/index.php/fomca-di-pentas-media/fomca-di-pentas-media-2025/1899-insurance-industry-must-provide-clear-explanations-for-premium-hikes-fomca
  'Insurance industry must provide clear explanations for premium hikes'
[FOMCA, 2026]:
  https://www.fomca.org.my/v1/index.php/fomca-di-pentas-media/fomca-di-pentas-media-2026/2076-addressing-medical-inflation-in-malaysia
  'Addressing Medical Inflation in Malaysia'
[The Rakyat Post, 18 Aug 2026]:
  https://www.therakyatpost.com/living/2026/08/18/malaysians-cant-keep-up-with-their-medical-insurance-price-hike/
  "Malaysians Can't Keep Up With Their Medical Insurance Price Hike"
[FMOS, 22 Jul 2026]:
  https://www.fmos.org.my/en/why-insurance-and-takaful-claims-get-rejected-the-most-common-reasons-we-see-at-fmos/
  'Why insurance and takaful claims get rejected: The most common reasons we see at FMOS'
[Malaysiakini]: https://www.malaysiakini.com/finance-news/780252 'Syndication of the FMOS piece of 22 Jul 2026'
[The Edge Malaysia]:
  https://theedgemalaysia.com/article/most-disputes-involve-insurance-claims-%E2%80%94-ofs
  'Most disputes involve insurance claims — OFS (date not captured; reports 2015 figures)'

## Legal doctrine and the ombudsman process

### Contra proferentem in Malaysian insurance law

**Yes, applied by the Federal Court.** _Malaysia Motor Insurance Pool v Teirumeniyar Sinagara Vella_ [2019], Federal
Court, affirms that where a term is ambiguous it is construed against the party who prepared it. Malaysian courts
construe an exception clause contra proferentem against the insurer where there is sufficient doubt or ambiguity as to
whether the exception applies; where the clause is clear the court gives effect to it even if the outcome is unfair
**[digest; the Lexology fetch returned 403, so author and date are not captured]**.

- Lexology, "Will the Contra Proferentem Rule Remain Relevant for Insurance Contracts in Malaysia?", date not captured,
  https://www.lexology.com/library/detail.aspx?g=909e9474-ddb4-4e73-b7d1-248afc120d68
- Global CSRC (academic), "The Legal Saga of Exclusion Clauses in Malaysia",
  https://publishing.globalcsrc.org/ojs/index.php/rope/article/download/1130/805/

**Two limits the pitch must respect:**

- **The rule is a last resort.** The same commentary says it has been "watered down" and is applied only where genuine
  ambiguity cannot be resolved by ordinary principles of construction. Three models disagreeing is evidence that
  reasonable readers differ; it is not, by itself, legal ambiguity.
- **FMOS decides on "fairness and reasonableness"**, not strict construction (FMOS, 22 Jul 2026, above). The complaint
  draft should lead with fairness and reasonableness for FMOS and cite contra proferentem as the court-law backstop, not
  the reverse.

### FMOS jurisdiction and process

| Question       | Answer                                                                                                                                                                                                | Source                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Monetary limit | Direct financial loss not exceeding **RM250,000**, stated for banking, insurance/takaful and capital markets alike. No separate motor third-party property damage sub-limit appears on the scope page | [FMOS scope]                              |
| Free?          | Yes, free of charge to financial consumers **[digest; the scope page itself does not state cost]**                                                                                                    | [Insurance Business Asia], [FMOS FAQ]     |
| Sequence       | Complain to the insurer first; the insurer issues a final decision; refer to FMOS within **6 months** of that final decision                                                                          | [FMOS scope], [FMOS filing guide], [BJAK] |
| Finality       | Disputes with a final or binding FMOS (or predecessor OFS) decision cannot be reopened without new material evidence                                                                                  | [FMOS scope]                              |
| Name           | FMOS since 1 Jan 2025 (OFS + SIDREC)                                                                                                                                                                  | BNM and BIS sources in the introduction   |

[FMOS scope]: https://www.fmos.org.my/en/our-scope/ 'What FMOS Can and Cannot Handle'
[Insurance Business Asia]:
  https://www.insurancebusinessmag.com/asia/news/breaking-news/malaysia-launches-financial-ombudsman-49932.aspx
  'Malaysia launches financial ombudsman'
[FMOS FAQ]: https://www.fmos.org.my/en/faq/
[FMOS filing guide]:
  https://www.fmos.org.my/en/filing-a-complaint-with-fmos-what-to-expect-and-what-you-need-to-know/
  'Filing a Complaint with FMOS: What to Expect'
[BJAK]:
  https://bjak.my/blog/car-insurance/how-to-dispute-a-rejected-car-insurance-claim-your-rights
  'How to Dispute a Rejected Car Insurance Claim'

## Ground truth: FMOS publishes case summaries with outcomes

**Yes.** FMOS runs a public case-studies section with individual dispute pages, and both the OFS 2024 and FMOS 2025
annual reports are public PDFs.

- FMOS, "FMOS Case Studies – Real Examples of Resolution in Malaysia", https://www.fmos.org.my/en/case-studies/
- FMOS, "FMOS Case Studies - Insurance Policy: Medical Hospitalisation Policy Exclusion",
  https://www.fmos.org.my/en/medical-hospitalisation-policy-exclusion/. The claimant ("Raju") was repudiated under the
  30-day waiting period, the 120-day Specified Illness clause and a weight-loss-treatment exclusion; gallstones were
  found incidentally after both periods and the treating doctor did not link them to super-obesity **[digest]**. This is
  precisely the shape of dispute the product targets.
- FMOS, "OFS 2024 Annual Report", PDF published Jul 2025,
  https://www.fmos.org.my/wp-content/uploads/2025/07/OFS_2024-Annual-Report.pdf
- FMOS, "FMOS Annual Report 2025", PDF published Apr 2026,
  https://www.fmos.org.my/wp-content/uploads/2026/04/FMOS-Annual-Report-2025.pdf
- FMOS, "The OFS Annual Report 2024 Now Available",
  http://www.fmos.org.my/en/the-ofs-annual-report-2024-now-available-honouring-the-legacy-embracing-the-future/

**What is not verified.** The count of case studies (the index page was not fetched; budget) and whether the clause
wording appears **verbatim** or paraphrased. The one case fetched via digest names the clauses (waiting period,
Specified Illness, weight-loss exclusion) but reads as a paraphrase.

Expect a labelled set in the tens, not hundreds, with outcomes but with clause text that has to be reconstructed from a
real policy wording. Insurers publish their policy PDFs, so this is a chore, not a blocker.

## Incumbents

### Malaysia, consumer-side

**Negative result.** No Malaysian tool that contests claim rejections was found. What exists is guidance content and
document storage:

- BJAK (motor insurance aggregator) how-to blog, cited under
  [FMOS jurisdiction and process](#fmos-jurisdiction-and-process)
- Bowtie Malaysia (insurer) blog, "Navigating Insurance Claim Denials in Malaysia",
  https://gobowtie.com/my/en/blog/insurance-claim-denials/
- FEV3R, "Insurance Claim Rejection in Malaysia: What to Do",
  https://www.feverasia.com/insurance-claim-rejection-malaysia/ (an app that stores medical documents for claims; it
  does not contest anything)

Insurer-side chatbots were excluded per the brief.

### Global AI appeal tools

| Tool                                                | What it does                                                                                                                          | Price                   | Multi-model or ambiguity measure?                                                   | Source                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Counterforce Health (Durham NC, founded early 2025) | Reads denial letter and policy, generates an appeal letter for patients and clinics; claims 70% success; appeal prep under 60 seconds | Free                    | **Not reported.** No source mentions more than one model or any disagreement signal | [Axios Raleigh, 20 Aug 2025], [Counterforce homepage], [Wikipedia] (fetch 404) |
| Claimable                                           | Appeals medication coverage decisions, files the paperwork                                                                            | About USD 50 per appeal | Not reported                                                                        | [Stateline, 20 Nov 2025]                                                       |
| Fight Health Insurance                              | Open-source appeal generator (appears in the search result set; details not fetched, so treat as named-only)                          | Free                    | Not reported                                                                        | [CareYaya]                                                                     |
| ChatGPT prompt workflows                            | Consumer press guides to drafting appeals with a single chatbot                                                                       | Free                    | No                                                                                  | [US News]                                                                      |

**Negative result on the specific mechanism.** No tool found, in Malaysia or globally, that (a) runs independent models
blind to each other on the clause, (b) treats their disagreement as the ambiguity signal, or (c) declines to draft when
they agree the exclusion applies.

[Axios Raleigh, 20 Aug 2025]:
  https://www.axios.com/local/raleigh/2025/08/20/using-ai-to-fight-back-against-insurance-denials-counteforce
  'RTP startup uses AI to fight health insurance denials'
[Counterforce homepage]: https://www.counterforcehealth.org/
[Wikipedia]: https://en.wikipedia.org/wiki/Counterforce_Health 'Counterforce Health'
[Stateline, 20 Nov 2025]:
  https://stateline.org/2025/11/20/patients-deploy-bots-to-battle-health-insurers-that-deny-care/
  'AI vs. AI: Patients deploy bots to battle health insurers that deny care'
[CareYaya]:
  https://www.careyaya.org/resources/blog/ai-tools-patients-health-insurance-denials
  'AI Tools Every Patient Can Use to Overturn Health-Insurance Claim Denials'
[US News]:
  https://health.usnews.com/wellness/articles/use-ai-to-help-fight-a-health-insurance-denial
  'How AI Can Help Fight a Health Insurance Denial by Writing an Appeal'

## Predicted competition

**Convergence count: 1 (range 0-2) of roughly 30 teams.**

Insurance claim rejection is not in the rubric's banned clusters and it is not what "AI for society, Malaysia,
multi-model consensus, fact checker" returns from a frontier model; the LLM brainstorm goes to scam checkers, subsidy
navigators, mental health, tutoring, flood alerts.

The nearest banned neighbour is "legal-aid Q&A and tenancy or employment rights bots", and a team in that cluster would
build a general contract explainer, not a rejection-letter pipeline with an ombudsman complaint as output. The one path
in: a Malaysian team that starts from the news (BNM measures, FOMCA, the CodeBlue survey) rather than from a model. That
is a plausible one team, which is why the count is 1 and not 0.

What makes ours unrecognisable from a generic "explain my policy" bot: the disagreement is the output, the complaint
attaches each model's reading with its Gonka request id as evidence, and the tool stays silent when all three agree.

## Scores against RUBRIC.md

| Dimension              | Weight  | Score  | Reasoning                                                                                                                                                                          |
| ---------------------- | ------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      | 20     | Convergence 1; incumbents named with a structural gap; the "stays quiet on agreement" behaviour is the opposite of every appeal generator's design                                 |
| Real user, real Monday | 20      | 15     | Nearly 30% of policyholders hit a rejection in two years (FOMCA); the repeat user is a clinic's insurance desk (67% of specialists see GL denials) more than one policyholder      |
| Track fit              | 20      | 19     | Three labs reading blind, disagreement surfaced, request ids attached to a legal document as provenance: the requirements are the product, not a bolt-on                           |
| Demo moment            | 15      | 13     | Paste clause and letter, three readings appear, they split, complaint drafts. Lands in under a minute with a real FMOS case; loses 2 because the split has to actually happen live |
| Buildability           | 20      | 17     | Inputs are pasted text, labelled set is public, no partner needed; risk in Bahasa Malaysia policy wordings and in tuning prompts so the split rate is honest                       |
| **Total**              | **100** | **84** | Above 70; survives the novelty test                                                                                                                                                |

### The novelty test

1. **Convergence count:** 1 (0-2). Defended under [Predicted competition](#predicted-competition).
2. **Incumbent test:** Counterforce Health, Claimable, Fight Health Insurance in the US; nobody in Malaysia. What they
   structurally cannot do:
   - They are advocacy generators whose success metric is overturn rate, so they cannot credibly tell a user "your
     exclusion applies, do not file"; a neutral ambiguity reading is not their product.
   - They are wired to US appeal law (ACA external review, state insurance commissioners) and the US market; the
     Malaysian route (insurer final decision, then FMOS within 6 months, RM250,000 cap, contra proferentem per _MMIP v
     Teirumeniyar_ [2019] FC) is a different legal object, and a US startup's economics give no reason to build it.
   - They cannot hand the ombudsman an auditable trail of independent readings; a single-vendor model produces one
     opinion with no provenance.
3. **Second-use test:** The policyholder returns twice by design: once when the insurer replies to the first complaint
   (to re-run with the insurer's stated justification) and once at FMOS filing. The heavier repeat user is the private
   hospital's insurance desk or a specialist's clinic manager, who sees GL denials weekly (CodeBlue survey, 855
   specialists, 67%). Name that person in `PRODUCT.md`.

### Kill criteria

| Criterion                                                   | Triggered? | Why                                                                      |
| ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| Convergence above five with execution as differentiator     | No         | Count is 1; differentiator is the mechanism, not polish                  |
| Incumbent answer is "nobody does this"                      | No         | Three named globally; Malaysia is a stated negative result, not "nobody" |
| GonkaRouter requirements fit only via an unneeded feature   | No         | The three-model blind read is the feature                                |
| Demo needs more than 90 seconds of setup                    | No         | One paste, one click                                                     |
| Buildability depends on data, access or partnership we lack | No         | FMOS case studies and insurer policy PDFs are public                     |

## Why not LOCK

Two reasons, both fixable within the nine days:

1. **The disagreement rate on real clauses is unmeasured.** If DeepSeek, MiniMax and Kimi agree on 95% of real FMOS
   cases, the demo has no moment and the product is a letter-writer. First task: run ten FMOS case-study clauses through
   the three models and record the split rate before writing a line of UI.
2. **LLM disagreement is not legal ambiguity.** Contra proferentem is a last-resort doctrine in Malaysia and FMOS
   decides on fairness and reasonableness. A judge who knows this will ask. The honest framing: "three independent
   readers split on this wording; that is a reason to complain, and here is the doctrine you cite when you do." Never
   claim the tool determines ambiguity.

Also fix the name: FMOS, not OFS, everywhere.

**Strongest fact:** FOMCA reports nearly 30% of policyholders had a claim partially or fully rejected in the past two
years and 24% of them were never given a clear reason, while FMOS itself says the recurring dispute is over what
"medically necessary" means. The wording dispute is documented by the adjudicator.

**Biggest risk:** the split rate. Everything else is writing.
