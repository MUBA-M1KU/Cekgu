# Verification: Akta Kata, Tested For Consistency

**VIABLE, 79/100.** The question is whether the law says what the government says it says. Not LOCK, for two reasons set
out in [What Would Move It To LOCK](#what-would-move-it-to-lock): the phenomenon is proven for ministers' assurances and
briefings, not for the formal Explanatory Statement the candidate names as its primary input, and the concept sits one
sentence away from the track's own Fact Checker example. Both are fixable in the `PRODUCT.md` framing, not in code.

**Method.** Verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md). Budget: 15 search/fetch calls, all used. Every
claim below carries publisher, title, date and URL. "Negative result" means the search returned nothing on the point,
not that nothing exists. In tables the source is a reference link; its definition, at the end of the section, carries
the article title. Definitions used in more than one section sit at the end of the file.

Contents:

1. [Phenomenon](#phenomenon)
1. [Data](#data)
1. [Incumbents](#incumbents)
1. [Ground Truth](#ground-truth)
1. [Predicted Competition](#predicted-competition)
1. [Scores](#scores)
1. [Novelty Test](#novelty-test)
1. [Kill Criteria](#kill-criteria)
1. [What Would Move It To LOCK](#what-would-move-it-to-lock)
1. [Sources Used](#sources-used)

## Phenomenon

The disputes found are between **what a minister or agency said** and **what the clause says**. None of the 15 calls
surfaced a case where the formal Penyata Huraian (Explanatory Statement, drafted by the AG's Chambers) was itself
accused of misstating a bill. That is a negative result with a product consequence, covered in
[What Would Move It To LOCK](#what-would-move-it-to-lock).

### Urban Renewal Bill 2025: The Clean Case

| Side             | Quote                                                                                                                                                                                                                                                                         | Source                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Government       | PM Anwar: "There will be no provision under the proposed act that could lead to owners...losing ownership of their property"                                                                                                                                                  | [FMT, 26 Feb 2025]           |
| Government       | Anwar on demographics: "If it is now 70% Malay, it will remain so because the owners will have full rights"                                                                                                                                                                   | [FMT, 26 Feb 2025]           |
| Clause           | Section 21(4): "once the consent threshold is secured, the remaining landowners who disagree will be subjected to compulsory acquisition"                                                                                                                                     | [Malaysian Bar, 27 Aug 2025] |
| Briefing vs text | "PLANMalaysia indicated during a recent briefing session that this matter will eventually be addressed in the Rules of the Act, there is no assurance that this would happen, as the power to make Regulations is vested solely in the Minister under section 29 of the Bill" | [Malaysian Bar, 27 Aug 2025] |
| Absence claim    | "The Bill provides no protection to non-participating landowners"; "Part IV of the Bill merely provides for mediation"                                                                                                                                                        | [Malaysian Bar, 27 Aug 2025] |
| Critic           | HBA's Chang Kim Loong: "a property could be compulsorily redeveloped even if 20% of the owners oppose it"                                                                                                                                                                     | [FMT, 26 Feb 2025]           |

Consent thresholds moved during the dispute, which is exactly the "someone later finds out" event that condition iii in
[`disagreement-as-product.md`](disagreement-as-product.md#the-finding-that-constrains-everything) needs: the draft set
80% under 30 years, 75% over 30, 51% abandoned (FMT, 26 Feb 2025); after the Parliamentary Select Committee on
Infrastructure, Transport and Communications met on 21 Aug 2025 the government revised to 80% regardless of age and
undertook to amend Clause 18 on demographic data (The Edge, "Urban Renewal Bill: Govt to raise consent threshold to 80%
for all projects, demographics to be considered as debate pushed back to next Parliament sitting", Aug 2025,
https://theedgemalaysia.com/node/768606). The Bar's position that thresholds "are set too low" and "risk undermining the
rights of minority owners" is at https://theedgemalaysia.com/node/767508 (The Edge, "Malaysia tables Urban Renewal Bill
to lower consent thresholds for redevelopment", Aug 2025).

Caveat: Anwar's quote is from February 2025, before tabling. The Bar statement is from August 2025 against the tabled
text. The product would have to date-stamp which draft a claim was made against; the candidate has not said so.

### Constitution (Amendment) Bill 2024, Citizenship: Effect Dispute, Partly Adjudicable

| Side       | Claim                                                                                                                                                        | Source                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Government | Home Minister Saifuddin: foundlings face no problem applying; all 142 applications 2014 to 2023 approved; changes "won't worsen statelessness"               | [Malay Mail, 19 Mar 2024]                              |
| Critic     | "these figures claimed by Saifuddin are simply not credible, and are starkly contrary to the experience of activists, NGOs and individual stateless persons" | [Aliran, 2024]                                         |
| Clause     | The bill amended Second Schedule Part II s.1(e) (citizenship by operation of law for the stateless born here) and Part III s.19(b) (foundlings)              | [MalaysiaNow, 22 Mar 2024]                             |
| Resolution | Cabinet dropped the s.1(e) and s.19B amendments; "The two provisions that will maintain the status quo are Section 1(e) and Section 19b"                     | [MalaysiaNow, 22 Mar 2024], [MalaysiaNow, 18 Mar 2024] |

The clause-level fact ("the bill removes citizenship by operation of law for s.1(e) cases") is adjudicable from text.
The minister's "won't worsen statelessness" is a prediction about administrative behaviour and is not. This is the
honest boundary the product must draw on screen.

[Malay Mail, 19 Mar 2024]:
  https://www.malaymail.com/news/malaysia/2024/03/19/amid-growing-concerns-home-minister-insists-citizenship-law-changes-wont-worsen-statelessness/124325
  "Amid growing concerns, Home Minister insists citizenship law changes won't worsen statelessness"
[Aliran, 2024]:
  https://m.aliran.com/civil-society-voices/saifuddin-is-wrong-the-stateless-face-huge-difficulties-in-applying-for-citizenship
  'Saifuddin is wrong, the stateless face huge difficulties in applying for citizenship'
[MalaysiaNow, 22 Mar 2024]:
  https://www.malaysianow.com/news/2024/03/22/government-drops-plan-to-deny-automatic-citizenship-to-foundlings-stateless-children
  'Government drops plan to deny automatic citizenship to foundlings, stateless children'
[MalaysiaNow, 18 Mar 2024]:
  https://www.malaysianow.com/news/2024/03/18/rights-body-schools-saifuddin-after-bizarre-defence-of-citizenship-law-changes
  "Rights body schools Saifuddin after 'bizarre' defence of citizenship law changes"

### Online Safety Bill 2024: Clause Readings Exist, The Contrast Is Implicit

| Side       | Claim                                                                                                                                                                                                                                                                                                                                                           | Source                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Government | Fahmi "insisted that amendments would no longer criminalize satire or parody" (this is the companion Act 588 amendment, same sitting)                                                                                                                                                                                                                           | [Global Voices, 16 Dec 2024] |
| Government | Act 588 amendment "serves as enforcement guide, not definitive, says Fahmi"                                                                                                                                                                                                                                                                                     | [Malay Mail, 17 Dec 2024]    |
| Explainer  | Law-firm reading: the Act "does not criminalise speech, nor does it seek to police individual users"                                                                                                                                                                                                                                                            | [RDS Law Partners]           |
| Clauses    | s.2(2) excludes "the private messaging feature"; s.13(3) says expression "shall not be limited unreasonably and disproportionately"; s.30(1) directions power; ss.54 to 57 search, seizure and data access without judicial oversight; ss.60 to 61 preservation and forced disclosure by written notice; First Schedule paras 3, 4, 6, 8 define harmful content | [ARTICLE 19, 11 Dec 2024]    |
| Vote       | Passed 77 to 55 on division after the opposition asked for referral to a PSSC                                                                                                                                                                                                                                                                                   | [ARTICLE 19, Dec 2024]       |

Negative result: ARTICLE 19's analysis "does not directly quote contrasting government statements". The "does not police
individual users" line against ss.54 to 61 is the product's kind of claim-clause pair, but no published source has yet
put them side by side. That is an opportunity and a warning: the demo would be the first to do it, so it must be right.

[Global Voices, 16 Dec 2024]:
  https://globalvoices.org/2024/12/16/online-safety-or-censorship-malaysias-parliament-passes-two-contentious-media-bills/
  "Online safety or censorship? Malaysia's parliament passes two contentious media bills"
[Malay Mail, 17 Dec 2024]:
  https://www.malaymail.com/news/malaysia/2024/12/17/act-588-amendment-focuses-on-excessive-vulgarity-serves-as-enforcement-guide-not-definitive-says-fahmi/160122
  'Act 588 amendment focuses on excessive vulgarity, serves as enforcement guide, not definitive, says Fahmi'
[RDS Law Partners]:
  https://www.rdslawpartners.com/post/from-platform-discretion-to-statutory-oversight-malaysia-s-online-safety-act-2025
  "From Platform Discretion To Statutory Oversight: Malaysia's Online Safety Act 2025"
[ARTICLE 19, Dec 2024]:
  https://www.article19.org/resources/malaysia-passage-of-the-online-safety-bill-a-grave-blow-to-foe/
  'Malaysia: Passage of Online Safety Bill a grave blow to free expression'

### Cyber Security Act 2024 And Gig Workers Act 2025: Negative Results

| Act                     | Finding                                                                                                                                                                                                                                                                               | Source                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Cyber Security Act 2024 | Negative result for any minister-versus-clause dispute. Closest: the Act "not setting out criteria or parameters which the Minister must consider for the designation of an NCII Sector Lead". Tabled 25 Mar 2024 by Gobind Singh Deo, gazetted 26 Jun 2024, in force 26 Aug 2024     | [Mayer Brown, Dec 2024], [NACSA Act 854]                         |
| Gig Workers Act 2025    | Negative result for a ministry "misconception" clarification. Critiques found are of substance, not misstatement: FMT, "Why the Gig Workers Act 2025 misses the mark", 6 Jul 2026; "The illusion of protection under the Gig Workers Act 2025" (Life News Agency). Passed 28 Aug 2025 | [FMT, 6 Jul 2026], [Life News Agency], [Malay Mail, 28 Aug 2025] |

[Mayer Brown, Dec 2024]:
  https://www.mayerbrown.com/en/insights/publications/2024/12/malaysias-new-cyber-security-act-2024-a-summary-and-brief-comparative-analysis
  "Malaysia's New Cyber Security Act 2024: A Summary and Brief Comparative Analysis"
[FMT, 6 Jul 2026]:
  https://www.freemalaysiatoday.com/category/opinion/2026/07/06/why-the-gig-workers-act-2025-misses-the-mark
  'Why the Gig Workers Act 2025 misses the mark'
[Life News Agency]:
  https://lifenewsagency.com/the-illusion-of-protection-under-the-gig-workers-act-2025/
  'The illusion of protection under the Gig Workers Act 2025'
[Malay Mail, 28 Aug 2025]:
  https://www.malaymail.com/amp/news/malaysia/2025/08/28/parliament-passes-landmark-gig-workers-bill-extending-long-overdue-protections-to-12-million-malaysians/189239

## Data

| Source                 | Status                                                                                                                                                                                                                                                                                     | Evidence                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Bills, parlimen.gov.my | Listing page exists; bills are PDFs under `parlimen.gov.my/ipms/eps/<date>/<DR or DN number>.pdf`. **Direct fetch failed: "unable to verify the first certificate"**, meaning the server's TLS chain is incomplete. A fetcher needs the intermediate CA bundled or the PDFs pre-downloaded | [Parlimen bills page]; example PDF [Parlimen DN.5.2025]                                        |
| Explanatory Statement  | "Most bills include the text of the Bill, the Explanatory Statement and any amendments to the Bill made in Committee"                                                                                                                                                                      | [University of Melbourne libguide]                                                             |
| Hansard                | PDFs per sitting day at `parlimen.gov.my/files/hindex/pdf/DR-ddmmyyyy.pdf`; a verbatim-preparation handbook exists. Committee stage examines the bill clause by clause                                                                                                                     | [Hansard DN 12 Dec 2019]; [Hansard verbatim handbook]; NDI, "Tatacara Parlimen Malaysia", 2021 |
| Passed acts            | Ministry-hosted PDFs exist, e.g. Act 872 Gig Workers Act 2025 on mohr.gov.my; Act 854 on nacsa.gov.my. lom.agc.gov.my was not fetched this session (budget), so its format is unverified                                                                                                   | [MOHR Act 872]; [NACSA Act 854]                                                                |
| Ministry explainers    | Partly text: MOHR runs an `aktapekerjagig2025` microsite; NACSA has an Act 854 page. **PLANMalaysia's URA briefing was oral** (the Bar refers to "a recent briefing session"), so the highest-value claims live in press reports, not FAQs                                                 | [Malaysian Bar, 27 Aug 2025]; [JHEKS MOHR]                                                     |
| Civic archives         | Sinar Project mirrors parliamentary and government documents; no analysis layer                                                                                                                                                                                                            | [Sinar Project pardocs]; [Sinar Project govdocs]; [Sinar GitHub]                               |

Unverified because the budget ran out: whether the 2024 to 2025 bill PDFs are born-digital text rather than scans. The
1993 Hansard PDFs in the index are almost certainly scans; recent bills from the AGC are expected to be text. Confirm
with one `pdftotext` run before committing to the pipeline.

[Parlimen bills page]:
  https://www.parlimen.gov.my/bills-dewan-rakyat.html?uweb=dr
  'Portal Rasmi Parlimen Malaysia, Rang Undang-Undang'
[Parlimen DN.5.2025]: https://parlimen.gov.my/ipms/eps/2025-09-04/DN.5.2025%20-%20DN5.2025.pdf
[University of Melbourne libguide]:
  https://unimelb.libguides.com/c.php?g=930183&p=6721988
  'Southeast Asian Region Countries Law: Legislation'
[Hansard DN 12 Dec 2019]: https://www.parlimen.gov.my/files/hindex/pdf/DN-12122019.pdf
[Hansard verbatim handbook]:
  https://www.parlimen.gov.my/images/webuser/dn/Buku%20Panduan%20Penyediaan%20Verbatim%20Penyata%20Rasmi%20Hansard.pdf
  'Buku Panduan Penyediaan Verbatim Penyata Rasmi (Hansard)'
[MOHR Act 872]: https://www.mohr.gov.my/aktapekerjagig2025/assets/documents/Act%20872.pdf
[JHEKS MOHR]:
  https://jheks.mohr.gov.my/index.php/en/gig-workers-bill-2025-tabled-in-parliament-landmark-move-to-protect-1-2-million-gig-workers/
  'Gig Workers Bill 2025 Tabled in Parliament'
[Sinar Project pardocs]: https://pardocs.sinarproject.org/ 'Parliamentary Documents'
[Sinar Project govdocs]: https://govdocs.sinarproject.org/ 'Malaysian Government Document Archives'
[Sinar GitHub]: https://github.com/Sinar

## Incumbents

| Incumbent                                          | What they do                                                                                                          | What they structurally cannot do                                                                                                                | Source                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Malaysian Bar press statements                     | Human, clause-level rebuttal of government claims; the closest existing product to Akta Kata's output                 | Scale past one statement per bill, weeks after tabling; cannot show three independent readings or a provenance trail                            | [Malaysian Bar, 27 Aug 2025]                        |
| ARTICLE 19, CIJ, Aliran, HBA, Family Frontiers     | Human clause analysis, published as advocacy                                                                          | Same, plus they are parties to the dispute, so their reading is discounted as opinion                                                           | [ARTICLE 19, 11 Dec 2024]                           |
| Law-firm client alerts on Lexology                 | Summaries of what a bill does for paying clients (Y Kong Wong, Rahmat Lim, RDS, Richard Wee, HSF Kramer, Mayer Brown) | Written to explain, not to contradict a minister; a firm's business depends on not being the one that called the government wrong               | [Y Kong Wong]; [HSF Kramer]                         |
| Sinar Project, UNDI18, MyConstitution              | Document archives, voter education, constitutional literacy                                                           | No analysis layer at all; MyConstitution is a Bar Council literacy campaign, not a tracker (negative result for a bill tracker under that name) | [Sinar open parliament]; [UNDI18 Wikipedia]         |
| BillTrack50 AI Assist                              | One-directional AI summary "looking at the title, state provided summary and bill text"                               | It consumes the official summary as an input, so it cannot audit it; US coverage only                                                           | [BillTrack50]                                       |
| Plural Policy                                      | Generative bill summaries; admits "the model confuses statute and bill text, giving an incorrect summary"             | Single model; the failure mode they describe is the one three blind readers are designed to catch                                               | [Plural Policy]                                     |
| CaseMark, Quorum                                   | Bill summaries and "AI bill tracking" for lobbyists                                                                   | Sell to the people who write the explainers; no incentive to publish disagreement                                                               | [CaseMark]; [Quorum]                                |
| NZ Parliamentary Counsel Office with Catalyst      | AI drafts the explanatory note from the bill, the inverse direction                                                   | The drafter cannot be the auditor of its own note; that is a property of being the government's drafting office, not a missing feature          | [NZ PCO]; Catalyst IT case study                    |
| Italy Chamber of Deputies GENAI4LEX-B              | Summarises committee amendments and checks bills against drafting standards                                           | Checks drafting standards, not truth of a ministry's public claims                                                                              | [TechPolicy.Press]                                  |
| GovTrack, TheyWorkForYou, LegiScan, Lexis, Westlaw | **Negative result.** The search returned no claim-versus-clause feature on any of them                                | Not applicable                                                                                                                                  | Search of 2 Sep 2026, query recorded in the session |

**Negative result on the core question:** no tool was found, Malaysian or global, that checks an official explainer
against clause text with any model, and none with multi-model disagreement. The Australian and UK rules that an
explanatory memorandum "must be accurate and not misleading, and must reflect the final form of the bill" (PM&C,
Legislation Handbook, Chapter 7,
https://www.pmc.gov.au/resources/legislation-handbook/chapter-7-preparing-support-material-explanatory-memorandum-and-second-reading-speech)
show the obligation exists on paper with no automated check behind it.

[Y Kong Wong]: https://www.ykwong.com.my/legal-update-urban-renewal-bill-2025/
[HSF Kramer]: https://www.hsfkramer.com/notes/employment/2025-posts/malaysia-gig-workers-bill-2025
[Sinar open parliament]: https://sinarproject.org/open-parliament
[UNDI18 Wikipedia]: https://en.wikipedia.org/wiki/UNDI18
[BillTrack50]: https://www.billtrack50.com/info/help/ai-assist-bill-summaries 'AI Generated Bill Summaries'
[Plural Policy]:
  https://pluralpolicy.com/blog/summarizing-bills-with-generative-ai/
  'Summarizing Bills With Generative AI'
[CaseMark]: https://casemark.com/workflows/bill-summary
[Quorum]: https://www.quorum.us/blog/ai-bill-tracking-advanced-legislative-intelligence/
[NZ PCO]:
  https://pco.govt.nz/about-us/legislative-data-and-technology/How-successful-is-AI-at-drafting-an-explanatory-note
  'How Successful Is AI At Drafting An Explanatory Note?'
[TechPolicy.Press]:
  https://www.techpolicy.press/governments-are-using-ai-to-draft-legislation-what-could-possibly-go-wrong/
  'Governments Are Using AI To Draft Legislation. What Could Possibly Go Wrong?'

## Ground Truth

| Claim type                         | Example                                                                                     | Adjudicable?                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Numeric or mechanical              | "80% consent", "75% for buildings over 30 years", "private messaging excluded" (OSA s.2(2)) | Yes, from text alone. The readers' answer is checkable by anyone with the PDF                 |
| Presence or absence of a provision | "no provision could lead to owners losing ownership" versus s.21(4) compulsory acquisition  | Yes. A clause exists or it does not. This is the product's strongest category                 |
| Delegated or deferred              | "will be addressed in the Rules" versus s.29 giving the Minister sole rule-making power     | Partly. The text proves the deferral; whether the Rules arrive is unfalsifiable until they do |
| Effect or prediction               | "won't worsen statelessness", "does not censor"                                             | No. A three-reader split here is opinion and must be labelled "contested", not "inconsistent" |

How the courts treat it: section 17A of the Interpretation Acts 1948 and 1967 (Act 388) directs that "a construction
that would promote the purpose or object underlying the Act, whether express or implied, shall be preferred" (Act 388
reprint, https://www.jkptg.gov.my/images/pdf/perundangan-tanah/Act_388-intepret.pdf). The Federal Court in PJD Regency
"revisited the Hansard of the 3rd Reading of the Housing Development (Control and Licensing) Bill on 25 March 1966, and
cited the words of Khaw Kai Boh, the then Minister" (Conventus Law, "Malaysia: The Dichotomy Between Social Legislation
And Contractual Interpretation: HDA 1966",
https://conventuslaw.com/report/malaysia-the-dichotomy-between-social-legislation/).

Two consequences. First, a minister's statement is legally relevant, so a gap between it and the clause is not a
pedantic finding; a court may later use the statement to read the clause. Second, and cutting the other way, the
explainer can legitimately shape the reading, so "the clause is the ground truth" is only true for the first two claim
types above. Condition iii is met in practice by three events that arrive within weeks of tabling: committee-stage
amendments (URA thresholds, 21 Aug 2025), government withdrawals (citizenship s.1(e) and s.19B, 22 Mar 2024), and the
minister's winding-up speech in Hansard.

## Predicted Competition

**Convergence count: 1 of roughly 30 teams**, defended as follows. The predictable brainstorm returns "legal chatbot for
tenants and workers" (banned cluster) and "fact-check social media claims" (the doc's own example). Neither has the
shape of this concept: the input is a pair of official documents, the unit of work is one claim against one clause,
there is no chat and no web retrieval, and the user is a journalist auditing the state rather than a citizen asking a
question. Expect two to three legal-explainer bots and zero to one Hansard summariser; a claim-versus-clause consistency
checker with blind readers is expected from at most one other team, and that team would have to have read the Bar's
statement to think of it.

It does not sit inside the legal-aid Q&A cluster: the product never answers a legal question for a person; it answers
"what does this clause say" for a document. It **does** sit next to the Fact Checker. A judge will say "this is the
fact-checker with a bill instead of a tweet". The written answer: the reference is a fixed authoritative text, not
retrieved evidence, so consensus is measured against the law rather than against what three models found online, and the
disagreement being surfaced is between the government and its own statute, which no news fact-checker frames.

## Scores

| Dimension              | Weight  |  Score | One-line reasoning                                                                                                   |
| ---------------------- | ------- | -----: | -------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      |     19 | Convergence count 1; incumbents named; second use is real. Deduction for Fact-Checker adjacency                      |
| Real user, real Monday | 20      |     14 | Bar, Article 19, HBA and FMT already do this by hand at clause level; nobody on the team has interviewed one of them |
| Track fit              | 20      |     19 | Three blind readers of one fixed clause, disagreement is the product, one request id per reading. Native, not bolted |
| Demo moment            | 15      |     12 | Anwar's "no owner loses ownership" against s.21(4) lands in 60 seconds pre-loaded; risk is a wall of text on screen  |
| Buildability           | 20      |     15 | Text only, public PDFs; claim-to-clause matching is the hard part; parlimen.gov.my TLS chain is broken for fetchers  |
| **Total**              | **100** | **79** | Above the 70 floor                                                                                                   |

## Novelty Test

1. **Convergence count:** 1, see [Predicted Competition](#predicted-competition).
2. **Incumbent test:** The Malaysian Bar and ARTICLE 19 do it by hand; BillTrack50 and Plural do the inverse with one
   model; NZ PCO drafts the explainer with AI. What they structurally cannot do: the Bar and NGOs are parties, so their
   reading is discounted; the summarisers consume the official summary as input; the PCO is the author of the note it
   would have to audit.
3. **Second-use test:** Mikha Chan at FMT, the Thursday after the PSC amends the Urban Renewal Bill: she reloads the
   amended clause text and the minister's new statement, re-runs the same claim list, and the s.21(4) flag either clears
   or does not. That is a real second open; the first open is the day the bill is tabled.

## Kill Criteria

| Criterion                                                       | Triggered? | Why                                                                                                                                |
| --------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Convergence above five with execution as the differentiator     | No         | Count is 1 and the differentiator is the input pair and the blind-reader shape, not polish                                         |
| Incumbent answer is "nobody does this"                          | No         | Bar, ARTICLE 19, BillTrack50, Plural, CaseMark, Quorum, NZ PCO, GENAI4LEX-B all named                                              |
| GonkaRouter requirements fit only by adding an unneeded feature | No         | Three blind readers and a per-reading request id are the product, not an add-on                                                    |
| Demo needs more than 90 seconds of setup                        | No         | Pre-load URA with the Anwar claim; the s.21(4) split is the first screen                                                           |
| Buildability depends on data or access we do not have           | No         | Public PDFs and press statements. Two caveats: parlimen.gov.my's broken TLS chain, and PDF text extraction unverified this session |

## What Would Move It To LOCK

1. One 20-minute call with a journalist or NGO researcher who has written a clause-level rebuttal (the FMT explainer's
   author, the Bar's secretariat, ARTICLE 19 Malaysia). Real User goes from 14 to 17 or drops the concept.
1. Reframe the primary input from "Explanatory Statement" to "any official description: ministerial statements, press
   releases, agency briefings, FAQs, and the Explanatory Statement". The evidence says the disputes live in the former.
1. Extract text from one 2025 bill PDF and confirm it is not a scan, and confirm a fetch of parlimen.gov.my works with
   the intermediate CA bundled.
1. Put the claim-type taxonomy from [Ground Truth](#ground-truth) on screen so a three-reader split on an effect claim
   is never shown as "the government is wrong".

**Strongest fact:** in February 2025 the Prime Minister said there would be "no provision under the proposed act that
could lead to owners...losing ownership of their property"; in August 2025 the Malaysian Bar read s.21(4) of the tabled
Urban Renewal Bill as subjecting dissenting owners to compulsory acquisition. A clause exists or it does not, and no
tool, Malaysian or global, was found that checks an official explainer against clause text with any model.

**Biggest risk:** the phenomenon is proven for ministers' assurances and briefings, not for the Explanatory Statement
the candidate names as its input, and a judge will file it beside the track's own Fact Checker unless the pitch says why
a fixed statute is not retrieved evidence.

## Sources Used

FMT 26 Feb 2025; Malaysian Bar 27 Aug 2025; The Edge nodes 767508 and 768606 (Aug 2025); Malay Mail 19 Mar 2024, 17 Dec
2024, 28 Aug 2025; Aliran (citizenship, 2024); MalaysiaNow 18 and 22 Mar 2024; ARTICLE 19 11 Dec 2024 and Dec 2024;
Global Voices 16 Dec 2024; RDS Law Partners; Mayer Brown Dec 2024; NACSA Act 854; MOHR Act 872; JHEKS MOHR; FMT 6 Jul
2026; Life News Agency; Portal Rasmi Parlimen Malaysia bills page and ipms/eps PDF; Parlimen Hansard PDFs and verbatim
handbook; NDI 2021; University of Melbourne libguide; Sinar Project pardocs, govdocs, GitHub; UNDI18 Wikipedia;
BillTrack50; Plural Policy; CaseMark; Quorum; NZ PCO and Catalyst IT; TechPolicy.Press; PM&C Legislation Handbook
Chapter 7; Act 388 reprint (JKPTG); Conventus Law on PJD Regency. Full URLs appear inline above.

[FMT, 26 Feb 2025]:
  https://www.freemalaysiatoday.com/category/nation/2025/02/26/the-urban-renewal-act-controversy-explained
  'Mikha Chan, The Urban Renewal Act controversy explained'
[Malaysian Bar, 27 Aug 2025]:
  https://www.malaysianbar.org.my/article/about-us/president-s-corner/pressstatements/press-release-malaysian-bar-s-position-on-the-urban-renewal-bill-2025
  "Mohamad Ezri Abdul Wahab, Press Release: Malaysian Bar's Position on the Urban Renewal Bill 2025"
[ARTICLE 19, 11 Dec 2024]:
  https://www.article19.org/resources/malaysia-online-safety-bill/
  'Malaysia: Concerns with the Online Safety Bill 2024'
[NACSA Act 854]: https://www.nacsa.gov.my/act854.php
