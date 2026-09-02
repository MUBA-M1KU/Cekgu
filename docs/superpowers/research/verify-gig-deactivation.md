# Verification: Gig Deactivation Notices, Tested For Specificity

**VIABLE, 76/100.** Passes the 70 bar and every kill criterion, but two things must change before it is written up as
`PRODUCT.md`: the legal framing is currently an over-claim, see [The Framing Problem](#the-framing-problem), and the
2025-26 Malaysian evidence that notices are vague is thin, see
[Vague Deactivations As A Live Complaint](#vague-deactivations-as-a-live-complaint).

**Method.** Verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md). Budget used: 15 of 15 search/fetch calls, plus a
local text extraction of the Act 872 PDF linked under [In Force Date](#in-force-date-the-team-is-correct). In tables the
source is a reference link; its definition, at the end of the section, carries the article title.

Contents:

1. [The Law](#the-law)
1. [The Phenomenon](#the-phenomenon)
1. [Ground Truth](#ground-truth)
1. [Incumbents](#incumbents)
1. [Predicted Competition](#predicted-competition)
1. [Scores](#scores)
1. [Novelty Test](#novelty-test)
1. [Kill Criteria](#kill-criteria)
1. [What Must Change Before PRODUCT.md](#what-must-change-before-productmd)

## The Law

### In Force Date: The Team Is Correct

Act 872 s.1(2) says the Act "comes into operation on a date to be appointed by the Minister by notification in the
Gazette". The appointed date was 31 March 2026.

- Human Resources Online, "Gig Workers Act 2025 now in force: What Malaysia's new rules mean for organisations in the
  gig economy", 2026,
  https://www.humanresourcesonline.net/gig-workers-act-2025-now-in-force-what-malaysia-s-new-rules-mean-for-organisations-in-the-gig-economy
- Business and Human Rights Resource Centre, "Malaysia: Gig Workers Act enters into force, extending legal protections
  to over 1.6 million workers", 2026,
  https://www.business-humanrights.org/en/latest-news/malaysia-gig-workers-act-enters-into-force-extending-legal-protections-to-over-16-million-workers/
- Bernama, "Act 872 Provides Greater Protection To 1.64 Million Gig Workers", 2026,
  https://bernama.com/en/news.php?id=2539439
- Primary text: Ministry of Human Resources, "Laws of Malaysia Act 872 Gig Workers Act 2025",
  https://www.mohr.gov.my/aktapekerjagig2025/assets/documents/Act%20872.pdf

Headcount correction: **1.64 million** (Bernama; ISEAS Perspective 2026/48, 7 July 2026), not "over 1.6 million".

### What Section 14 Actually Requires

Verbatim from Act 872, abridged only where marked.

| Sub-section | Text                                                                                                                                                                                                                                                                   | What it means for the product                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 14(1)       | Platform may deactivate if "(a) the deactivation is in accordance with the terms and conditions under the service agreement; or (b) there is misconduct committed by the gig worker"                                                                                   | The lawful grounds are the platform's own T&Cs or misconduct. Mapping a notice to a T&C rule is exactly the question the Act makes relevant |
| 14(3)       | "may modify or suspend the access ... for a period not exceeding fourteen days for the purpose of holding an inquiry"                                                                                                                                                  | The 14-day cap is for the inquiry suspension                                                                                                |
| 14(4)       | "shall notify the gig worker in respect of such modification or suspension ... by giving a notice in writing"                                                                                                                                                          | Written notice of suspension is mandatory                                                                                                   |
| 14(5)       | If no reason found: "(a) reactivate ... and (b) pay to the gig worker half of the amount of the average daily earnings for such modification or suspension periods ... calculated based on the earnings on the actual service day within thirty days period preceding" | Half of average daily earnings, computed on the prior 30 days of actual service days                                                        |
| 14(6)       | If grounds found, platform may "(a) terminate ... or (b) continue with the modification or suspension ... for a further period not exceeding seven days"                                                                                                               | A second, 7-day suspension is allowed after the inquiry                                                                                     |
| 14(7)       | "The platform provider shall give the right to be heard to the gig worker before taking any action under paragraph 6(a) or (b)"                                                                                                                                        | The hearing right attaches before termination or the extended suspension                                                                    |
| 14(8)       | After the 7 days "shall reactivate"                                                                                                                                                                                                                                    | Reactivation is a duty                                                                                                                      |
| 14(9)       | "shall give a written explanation to the gig worker for any decision made under subsection (6)"                                                                                                                                                                        | Written reasons are mandatory for the final decision                                                                                        |
| 14(10)      | "Any platform provider who contravenes subsection (4), (5), (7), (8) or (9) commits an offence"                                                                                                                                                                        | Breach is a criminal offence, not just a tribunal matter                                                                                    |

### Corrections To The Team's Competitor-Scan Paragraph

| Team wrote                                                                    | Correct                                                                                                                                                                                                                                                                                                                                                  | Source                      |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| "caps deactivation at 14 days without an inquiry"                             | 14 days is the cap on suspension _for_ the inquiry (s.14(3)); a further 7 days is allowed after it (s.14(6)(b)). Maximum non-terminating suspension is 21 days                                                                                                                                                                                           | Act 872 s.14(3), (6)(b)     |
| "awards reactivation plus 50% of expected earnings where a worker is cleared" | It is _half of average daily earnings for the suspension period_, based on actual service days in the preceding 30 days, and it is a platform duty under s.14(5)(b) rather than a tribunal award. The tribunal can enforce it under s.42(4)(c)                                                                                                           | Act 872 s.14(5)(b), s.42(4) |
| "Failing to provide human review can draw compensation orders"                | The Act never mentions human review. Contravening s.14(4), (5), (7), (8) or (9) is an offence (s.14(10)); the tribunal may order compensation under s.42(4)(a) and (i)                                                                                                                                                                                   | Act 872 s.14(10), s.42(4)   |
| "over 1.6 million workers"                                                    | 1.64 million                                                                                                                                                                                                                                                                                                                                             | Bernama; ISEAS 2026/48      |
| "creates a Gig Workers Tribunal"                                              | Correct. s.24 establishes it; s.33 gives jurisdiction over disputes referred by the Conciliator or Minister under Part IV; s.42(4)(d) lets it order that a worker "is entitled to perform his service or to access the digital intermediary system"; s.42(1) says awards where practicable within 30 days of the last hearing; s.44 appeal to High Court | Act 872 ss.24, 33, 42, 44   |

### Tribunal Status: Operating Since Yesterday, No Decisions Yet

- Free Malaysia Today, "Gig Workers Tribunal hears first case", 2 September 2026,
  https://www.freemalaysiatoday.com/category/nation/2026/09/02/gig-workers-tribunal-hears-first-case
  - First hearing 1 September 2026, Kuching labour office, Sarawak, before Deputy President Suzarika Sahak
  - Parties: a self-represented e-hailing worker v Grabcar Sdn Bhd
  - Subject: "the use and operation of the GrabCar platform, including its Saver Trips and Advance Booking features, as
    well as cashback incentives". **Not a deactivation case.** Adjourned for further testimony
  - The ministry says the tribunal has received filings on "account deactivation or suspension, loss of income, account
    reactivation" and platform issues, plus non-platform payment claims. **No counts were given**
- **Published tribunal decisions: negative result.** None exist as of 2 September 2026
- Secondary, unverified against KESUMA: maukerja.my, "Akta Pekerja Gig: Apa Hak Pekerja Gig Yang Anda Perlu Tahu",
  https://www.maukerja.my/career-advice/blog/ms/33862/akta-pekerja-gig-malaysia, says an **eAduan Gig** complaint portal
  opened 1 April 2026 and targets resolution within 21 working days. Verify on the KESUMA site before citing

### SEGiM: Not In The Act

A case-insensitive search of the extracted Act text for `segim` and `gig economy commission` returns 0 matches. The
Act's own body is the **Consultative Council** (Part VI, ss.46-68). SEGiM is a separate, Cabinet-approved commission:

- The Star, "Cabinet approves new commission to look into gig workers' welfare, says Zahid", 6 March 2026,
  https://www.thestar.com.my/news/nation/2026/03/06/cabinet-approves-new-commission-to-look-into-gig-workers039-welfare-says-zahid
- New Straits Times, "Cabinet approves gig economy commission to safeguard 1.2 million workers", March 2026,
  https://www.nst.com.my/news/nation/2026/03/1391391/cabinet-approves-gig-economy-commission-safeguard-12-million-workers
- Human Resources Online, "Malaysia sets up Gig Economy Commission ahead of Gig Workers Act 2025 enforcement", 2026,
  https://www.humanresourcesonline.net/malaysia-sets-up-gig-economy-commission-ahead-of-gig-workers-act-2025-enforcement
- ISEAS Perspective 2026/48, Lee Hwok Aun, "Gig Workers in Malaysia: Is the New Law a Good Deal?", 7 July 2026,
  https://www.iseas.edu.sg/articles-commentaries/iseas-perspective/2026-48-gig-workers-in-malaysia-is-the-new-law-a-good-deal-by-lee-hwok-aun/
  - Consultative body membership: chair and deputy (former senior civil servants), 7 government officials, 6 platform
    representatives, 6 gig-worker organisation representatives, 5 academics
  - Critique: "lack of mandatory data disclosure by platform providers"; no duty to report to a public authority

SEGiM's establishing instrument was not found in this pass (negative result). Say "Cabinet-approved March 2026, scope
limited to platform gig workers" and nothing stronger.

### The Framing Problem

**The Act does not require a platform to cite a specific rule.** This is the most important legal finding. s.14(4)
requires "a notice in writing"; s.14(9) requires "a written explanation". A notice that says "your account is suspended
pending investigation of a policy breach" arguably satisfies s.14(4) on its face.

So the product's line "too vague to answer = fails the Act's notice-and-hearing requirement" is an over-claim a judge
who has read s.14 will catch in Q&A.

The defensible framing: **a notice too vague for three independent readers to identify the rule cannot support a
meaningful right to be heard under s.14(7)**, because the worker cannot answer an accusation nobody can name. That is an
argument the drafted response makes to the platform or tribunal, not a statutory breach the product declares. The
s.14(1)(a) test, "in accordance with the terms and conditions", is what the rule-mapping actually probes.

## The Phenomenon

### Vague Deactivations As A Live Complaint

**2021-2022 (strong, but old):**

- Malaysiakini, "Delivery riders protest 'unfair' rating system at Foodpanda office", 2022,
  https://www.malaysiakini.com/news/615735. Persatuan Penghantar P-Hailing Malaysia (Penghantar) memorandum: riders
  "suspended for low order acceptance rates and terminated without being given a chance to defend themselves"
- Kosmo Digital, "Pekerja p-hailing tertekan, keliru", 25 March 2022,
  https://www.kosmo.com.my/2022/03/25/pekerja-p-hailing-tertekan-keliru/. Penghantar protest memoranda over accounts
  "suspended without valid reasons"; approximately 100 riders suspended for 10 days nationwide
- Persatuan Penghantar P-Hailing Malaysia Facebook post, "Foodpanda Malaysia segera hentikan diskriminasi terhadap
  Foodpanda riders Malaysia", https://www.facebook.com/penghantarmalaysia2020/posts/757199949934888/

**2025-2026 (thin):**

- FMT, 2 September 2026 (cited under [Tribunal Status](#tribunal-status-operating-since-yesterday-no-decisions-yet)):
  the tribunal holds deactivation, suspension and reactivation filings. No numbers
- The Rakyat Post, "Grab Driver Who Defended Islam On Camera Has Not Been Suspended, Company Confirms", 3 August 2026,
  https://www.therakyatpost.com/news/malaysia/2026/08/03/grab-driver-who-defended-islam-on-camera-has-not-been-suspended-company-confirms/
  and Sinar Daily, "Everything we know about the Grab driver, viral Quran remark video and account ban claim",
  https://www.sinardaily.my/article/739338/focus/deep-dive/everything-we-know-about-the-grab-driver-viral-quran-remark-video-and-account-ban-claim.
  Grab's public line: no account "would be suspended or deactivated without a proper investigation and clear evidence
  that company policies had been breached". Useful as the platform's stated standard, which the product tests
- **Negative result:** no 2025-26 Penghantar statement, news count, or platform figure specifically about vague or
  unexplained deactivations was found in this pass. The claim "vague notices are a live 2026 complaint" currently rests
  on the ministry's one sentence about tribunal filings. This is the weakest evidentiary leg

### Are The Codes Of Conduct Public Text?

| Platform             | Status                                                                                                                                                                                        | Source            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Foodpanda            | **Yes.** "Sistem pematuhan", Malay with English headers, 20+ named violations in three tiers (fraud actions, ID suspension, termination), no rule codes, appeal within **72 hours** of notice | [Foodpanda rules] |
| Grab                 | **Unverified.** help.grab.com carries appeal-process pages (Indonesia and Thailand locales surfaced); the Malaysian driver code of conduct page was not fetched                               | [Grab help]       |
| Lalamove, ShopeeFood | Not checked (negative result by omission, not by search)                                                                                                                                      |                   |

Consequence: Foodpanda has no rule numbers, so "same rule" must be defined as "same named violation category" from a
taxonomy the team writes. Ship Foodpanda first.

[Foodpanda rules]: https://pandariders.my/sistem-pematuhan/ 'Sistem pematuhan'
[Grab help]: https://help.grab.com/passenger/en-id/360000022027 'Grab help centre appeal-process page, Indonesia locale'

## Ground Truth

### Malaysian Decisions

- Tribunal: none published, see [Tribunal Status](#tribunal-status-operating-since-yesterday-no-decisions-yet)
- Earlier channels: Malay Mail, "In possible test case, former Grab driver reports firm for unfair dismissal", 4 January
  2020,
  https://www.malaymail.com/news/malaysia/2020/01/04/in-possible-test-case-former-grab-driver-reports-firm-for-unfair-dismissal/1824561
  (Industrial Relations Act s.20(1)); MyCC complaint 7 March 2019 by driver Mohamed Radzwan bin Abdul Wahab over a ban
  for "promoting other e-hailing services", via Lexology,
  https://www.lexology.com/library/detail.aspx?g=0b33bc80-4eda-4a38-8f72-edc53a6214ae
- **Malaysian appeal-overturn figure: negative result**

### The 80% Figure: Source Found, The Team's Phrasing Is Wrong

- Cornell ILR School, Andrew Wolf, "Just Cause for NYC Gig Workers Provides Human Review for Algorithmic Firings", 6
  November 2025,
  https://www.ilr.cornell.edu/carow/carow-policy/just-cause-nyc-gig-workers-provides-human-review-algorithmic-firings.
  Quotes University of Washington research on Seattle's Deactivation Rights Ordinance: "in 80% of arbitrations the
  driver's deactivation was overturned". Comparison: AALDEF study of 350 NYC drivers, "90% of drivers never got their
  jobs back"
- WageIndicator, Daniel Burcea, "Real stories of unfair deactivation: when a gig worker's account is blocked", 2025,
  https://wageindicator.org/what-we-do/news-stories/gig-blog/2025/platform-workers-deactivation/. "80% of drivers had
  their deactivations overturned when qualifying for representation"; "over half of all driver deactivations" were minor
  issues such as a scanned document instead of the original
- Search-snippet detail not confirmed against the primary study: 1,420 drivers over 19 months to January 2023; median
  time to reactivation fell from 11 weeks to 41 days with Driver Resolution Center representation. Treat as approximate
  until the University of Washington report itself is read

**Correction:** the figure is _arbitrators overturning platform decisions when the driver is represented by the Seattle
Driver Resolution Center_, not "platforms overturn 80% of deactivations on appeal". Platform-internal appeals in NYC ran
near **10%** success. That contrast is better for the product than the team's version: represented, well-argued appeals
succeed; unrepresented in-app appeals mostly do not.

## Incumbents

| Who                                                                       | What                                                                                    | What they structurally cannot do                                                                   |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Grab, Foodpanda in-app appeals (Foodpanda: 72-hour window)                | Platform-adjudicated appeal                                                             | Cannot be an independent reader of their own notice; the author of the accusation judges the reply |
| Persatuan Penghantar P-Hailing Malaysia                                   | Memoranda, protests, member advocacy                                                    | Not a tool; caseworker capacity, no per-notice analysis, no provenance trail                       |
| eAduan Gig portal (KESUMA, from 1 April 2026 per maukerja.my, unverified) | Filing channel to conciliation and tribunal                                             | Takes a complaint; does not help write one or test the notice                                      |
| [Worker Info Exchange] (UK)                                               | Data subject access requests, supported TfL licence appeals ("every appeal was upheld") | UK GDPR-based, human caseworkers, London-focused; no Malay, no Act 872, no Malaysian T&Cs          |
| [FareShare], ACM CSCW 2025 / [arXiv 2505.08904]                           | Lost-wage estimation for Washington's rideshare union to contest deactivations          | Computes money, not meaning; tied to Washington data and union workflow                            |
| [Gridwise appeal guide] (2026); [Terms.Law demand-letter templates]       | Static guides and paid US templates                                                     | Single-jurisdiction, single-author, no test of whether the notice is answerable                    |

**Multi-model disagreement or a specificity measure in any incumbent: negative result.** The search found no tool that
uses model disagreement as a signal, and no "AI deactivation appeal chatbot" marketed in 2025-26.

[Worker Info Exchange]: https://www.workerinfoexchange.org/
[FareShare]: https://doi.org/10.1145/3788052 'FareShare, ACM CSCW 2025'
[arXiv 2505.08904]: https://arxiv.org/abs/2505.08904
[Gridwise appeal guide]: https://gridwise.io/blog/gig-driver-deactivation-appeal
[Terms.Law demand-letter templates]:
  https://terms.law/Demand-Letters/Employment/california-rideshare-deactivation-demand.html

## Predicted Competition

**Estimate: 2 teams build something recognisably similar in domain; 0-1 in mechanism.**

The Act came into force five months ago, the tribunal sat for the first time yesterday, and "gig worker" is in two
banned clusters of `RUBRIC.md` ("Legal-aid Q&A ... employment rights bots", "gig-worker income tools"). A Claude or
ChatGPT brainstorm for "AI for society, Malaysia" surfaces a "know your rights under the Gig Workers Act" chatbot in
perhaps one run in eight. Across 30 teams that is 3-4 mentions, of which about half get built: **2**. Those are Q&A
explainers.

The distinguishing shape here, paste an accusation and let three blind readers vote on which rule it names, is a
stack-capability-first idea that does not appear in a problem-list brainstorm. A judge will recognise it as different
within the first 20 seconds of demo, provided the pitch leads with the notice and the three cards, not with "gig worker
rights".

## Scores

| Dimension              | Weight  |  Score | One-line reasoning                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------- | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      |     18 | Two domain neighbours predicted, zero on mechanism; incumbents named with real structural gaps; docked because it sits beside two banned clusters and the pitch must lead with the mechanism to escape them                                                                                                                               |
| Real user, real Monday | 20      |     13 | The rider with a 72-hour Foodpanda appeal window is real and urgent; second use exists (the s.14(6)(b) extension notice, the s.14(9) explanation, a Penghantar caseworker running many notices); docked because 2025-26 Malaysian evidence of _vague_ notices is one ministry sentence, and s.14(9) may make notices less vague over time |
| Track fit              | 20      |     18 | Three blind readers, disagreement as the product, request IDs attached to a filing: the requirements are the feature, not a bolt-on; docked because "same rule" needs a hand-written taxonomy per platform since Foodpanda publishes no rule codes                                                                                        |
| Demo moment            | 15      |     12 | Paste, three cards, converge or diverge, draft: lands under 90 seconds; needs two prepared notices (one vague, one specific) to show both branches                                                                                                                                                                                        |
| Buildability           | 20      |     15 | No partnership or private data; Foodpanda rules are public Malay text; Grab rules unverified; Malay-language notices must be read reliably by all three models                                                                                                                                                                            |
| **Total**              | **100** | **76** | Above the 70 bar                                                                                                                                                                                                                                                                                                                          |

## Novelty Test

1. **Convergence count:** 2 in domain, 0-1 in mechanism, see [Predicted Competition](#predicted-competition). Under
   five. What makes ours unrecognisable: the product's output is a verdict on the _notice_, not advice to the worker;
   disagreement between three labs is the measurement, not a bug to average away
2. **Incumbent test:** named under [Incumbents](#incumbents). Structural gap: platforms cannot be an independent reader
   of their own accusation; WIE and FareShare are jurisdiction-bound human or numeric tools; eAduan Gig is a mailbox
3. **Second-use test:** the same rider, day 14, when the s.14(6) decision arrives with its s.14(9) written explanation,
   pastes that to check whether the explanation now names a rule the first notice did not; or a Penghantar volunteer on
   a Monday morning with five members' notices from the weekend. Passes, so Real User is not capped at 8

## Kill Criteria

| Criterion                                                   | Triggered?         | Why                                                                                                         |
| ----------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Convergence above five with execution as the differentiator | No                 | Count is 2; differentiator is mechanism                                                                     |
| Incumbent answer is "nobody"                                | No                 | Six incumbents named                                                                                        |
| GonkaRouter fits only via an added feature                  | No                 | The three-reader vote is the product                                                                        |
| Demo needs more than 90 seconds of setup                    | No                 | One paste                                                                                                   |
| Buildability depends on data or access we lack              | **Flag, not kill** | Foodpanda's rules are public; Grab's are unverified. Scope to Foodpanda first and the dependency disappears |

## What Must Change Before PRODUCT.md

1. Replace "fails the Act's notice-and-hearing requirement" with "cannot support a meaningful s.14(7) right to be
   heard", see [The Framing Problem](#the-framing-problem)
2. Fix the four factual errors in the competitor-scan paragraph, see
   [Corrections To The Team's Competitor-Scan Paragraph](#corrections-to-the-teams-competitor-scan-paragraph), and the
   80% phrasing, see [The 80% Figure](#the-80-figure-source-found-the-teams-phrasing-is-wrong)
3. Find one 2025-26 Malaysian data point on vague notices: a Penghantar statement post-31 March 2026, or an eAduan Gig
   filing count from KESUMA. Without it, Real User stays at 13
4. Verify Grab Malaysia's driver code of conduct is public text, or scope the demo to Foodpanda
