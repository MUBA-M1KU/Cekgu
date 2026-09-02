# Verification: Angka, Tested For Agreement

**VIABLE, 78/100.** Above the 70 bar, not LOCK. The mechanism is honest track fit and the corpus is public, but the
user-pain evidence is indirect: the one documented 2025 misreporting case is a semantic error (cost read as loss), not a
dropped digit, and no Malaysian journalist was found stating the retyping pain in their own words. The ranked risks are
under [Risks Ranked](#risks-ranked).

**The candidate.** Agreement-gated extraction of figures from Malaysian official PDFs (LKAN, Hansard written replies,
budget documents) by three models from three labs via GonkaRouter, published only on two-of-three agreement, splits
queued for a human with the source paragraph and a Gonka request id per reading.

**Method.** Verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md). Budget: 15 search/fetch calls, all used. Where a
search returned nothing on the point, the line says "negative result". Nothing below says "nobody does this". In tables
the source is a reference link; its definition, at the end of the section, carries the article title. Definitions used
in more than one section sit at the end of the file.

Contents:

1. [Phenomenon And Data](#phenomenon-and-data)
1. [Incumbents](#incumbents)
1. [Users](#users)
1. [Track Fit](#track-fit)
1. [Predicted Competition](#predicted-competition)
1. [Scores](#scores)
1. [Novelty Test](#novelty-test)
1. [Kill Criteria](#kill-criteria)
1. [Risks Ranked](#risks-ranked)
1. [Negative Results Recorded](#negative-results-recorded)

## Phenomenon And Data

### LKAN Cadence And Format 2024-26

Three series a year, tabled in the February, July and October sittings. Confirmed dates:

| Series | Content                                                                         | Tabled      | Source                                                         |
| ------ | ------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| 2/2024 | Activities of federal ministries and bodies                                     | 4 Jul 2024  | [LKAN portal]                                                  |
| 3/2024 | Penyata Kewangan Kerajaan Persekutuan Tahun 2023                                | 14 Oct 2024 | [LKAN portal]                                                  |
| 1/2025 | Penyata Kewangan Agensi Persekutuan Tahun 2023                                  | 24 Feb 2025 | [CMD.4.2025]                                                   |
| 2/2025 | Five programmes across seven ministries, total cost RM48.873bn                  | 21 Jul 2025 | [Malay Mail, 24 Jul 2025]                                      |
| 3/2025 | 14 documents incl. Federal Govt Financial Statement 2024 and 3 state statements | 6 Oct 2025  | [Parlimen media statement 3/2025], [BusinessToday, 6 Oct 2025] |
| 1/2026 | Penyata Kewangan Agensi Persekutuan Tahun 2024 plus an activities report        | 23 Feb 2026 | [LKAN portal], both marked "BAHARU"                            |

Implication for second use: LKAN 2/2026 was tabled in the July 2026 sitting and LKAN 3/2026 lands in the October 2026
sitting, roughly five weeks after Demo Day. The next drop is dated and public.

Format facts:

- The tabled report is a command paper PDF on parlimen.gov.my (CMD.4.2025 above) and on lkan.audit.gov.my. The portal
  fetch returned titles, dates and view counts only. **Page counts and file sizes: negative result** within budget
- No CSV, Excel or API is offered on lkan.audit.gov.my (portal fetch, 2 Sep 2026). The Auditor General's Dashboard
  tracks follow-up status of raised issues, not the underlying figures: Jabatan Audit Negara, "AGD - Auditor General's
  Dashboard V3.0", https://agdashboard.audit.gov.my/. 44 issues from LKAN 2/2025 were uploaded there: The Star,
  "Parliament approves Auditor-General's Report 2/2025", 23 Jul 2025,
  https://www.thestar.com.my/news/nation/2025/07/23/parliament-approves-auditor-general039s-report-22025
- data.gov.my holds one archived 2018 MAMPU dataset, issue categories for one ministry, not figures: MAMPU, "Laporan
  Ketua Audit Negara Mengikut Kategori Isu di Kementerian Pertahanan",
  https://archive.data.gov.my/data/dataset/laporan-ketua-audit-negara-mengikut-kategori-isu-di-kementerian-pertahanan.
  **Figure-level LKAN dataset on data.gov.my: negative result**
- JPA publishes a follow-up status PDF, again a PDF: JPA, "Status Tindakan Susulan Laporan Ketua Audit Negara Tahun
  2015 - 2025", 10 Oct 2025, https://docs.jpa.gov.my/docs/pnerbitan/2025/LKAN_10102025.pdf

[LKAN portal]:
  https://lkan.audit.gov.my/
  'Jabatan Audit Negara, Laporan Ketua Audit Negara (LKAN), portal listing, fetched 2 Sep 2026'
[CMD.4.2025]:
  https://parlimen.gov.my/ipms/eps/2025-02-24/CMD.4.2025%20-%20CMD4.2025.pdf
  'Parlimen Malaysia, command paper CMD.4.2025, 24 Feb 2025'
[Malay Mail, 24 Jul 2025]:
  https://www.malaymail.com/news/malaysia/2025/07/24/dewan-rakyat-passes-auditor-generals-report-22025-ministries-respond-to-audit-findings/184971
  "Dewan Rakyat passes Auditor-General's Report 2/2025, ministries respond to audit findings"
[Parlimen media statement 3/2025]:
  https://www.parlimen.gov.my/images/webuser/bkk/Kenyataan%20Media%20Laporan%20Ketua%20Audit%20Negara%203-2025.pdf
  'Parlimen Malaysia, Kenyataan Media Laporan Ketua Audit Negara 3/2025'
[BusinessToday, 6 Oct 2025]:
  https://www.businesstoday.com.my/2025/10/06/federal-accounts-for-2024-found-in-good-order-says-auditor-general/
  'Federal Accounts For 2024 Found In Good Order, Says Auditor-General'

### Hansard And Written Replies

- Digital Hansard covers Dewan Negara, Dewan Rakyat and Kamar Khas with keyword and phrase search and per-sitting pages
  such as /hansard/dewan-rakyat/2026-02-12: Parlimen Malaysia, "Hansard Digital | Digital Hansard", fetched 2 Sep 2026,
  https://hansard.parlimen.gov.my/. The landing page does not mention written replies or an API. **Written replies on
  the Digital Hansard portal: negative result**
- Sitting transcripts circulate as "Naskhah belum disemak" (unrevised copy) PDFs, e.g. CLJ Law mirror, "PENYATA RASMI
  PARLIMEN DEWAN RAKYAT", 18 Nov 2020, https://www.cljlaw.com/files/hansard/DR/pdf/DR-18112020.pdf
- Written replies were "printed and handed out to all MPs, but are not available on-line for the public"; Sinar obtained
  5,000+ scanned replies through MP Ong Kian Ming's office and put them full-text online at pardocs.sinarproject.org.
  "Detailed statistics are in scanned tables, can be made more accessible as open data." Khairil Yusof, Sinar Project,
  "Hidden Data in Parliamentary Documents", 28 May 2018,
  https://sinarproject.org/open-parliament/notes/hidden-data-in-parliamentary-documents. This is the retyping evidence:
  the note calls for community contributions to extract and standardise the tables, which is hand transcription by
  another name. It is eight years old; **no 2023-26 statement of the same pain was found: negative result**

### Documented Misreporting 2023-26

- **The strongest case.** Within 24 hours of LKAN 2/2025 being tabled, the Auditor-General stated that RM48.873bn was
  the total cost of the audited programmes "and this amount does not represent any leakages or losses, as reported by
  several media portals", adding that such statements "have the potential to create confusion and unfounded negative
  perceptions of the country's financial management." Bernama via The Star, "Auditor-General's Report: RM48.873bil
  represents total cost of audited projects, not amount of leakages or losses", 22 Jul 2025,
  https://www.thestar.com.my/news/nation/2025/07/22/auditor-generals-report-rm48873bil-is-total-cost-of-audits-not-leakages-or-losses-says-wan-suraya.
  The government fact-check portal carried the same correction in Malay: "jumlah ini bukan ketirisan atau kerugian
  seperti yang dilaporkan dalam beberapa portal media". Sebenarnya.my, "Penjelasan Berkenaan Laporan Media Berkaitan
  Laporan Ketua Audit Negara 2/2025", 22 Jul 2025,
  https://sebenarnya.my/penjelasan-berkenaan-laporan-media-berkaitan-laporan-ketua-audit-negara-2-2025/
- **Figure drift observed in the search results themselves.** The AG's figure is RM48.873bn. Secondary coverage carries
  RM48.78bn: The Exchange Asia, "Audit Uncovers Major Issues in RM48.78b Worth of Government Projects Across Seven
  Ministries",
  https://theexchangeasia.com/audit-uncovers-major-issues-in-rm48-78b-worth-of-government-projects-across-seven-ministries/;
  Made in Malaysia, "Auditor General Report Malaysia 2025: RM48.78B Flagged",
  https://madeinmalaysia.com.my/auditor-general-report-malaysia-2025/; a LinkedIn post, "Malaysia's 2025
  Auditor-General's Report reveals RM48.78...",
  https://www.linkedin.com/posts/wemanage-procurement_rm4878-billion-in-irregularities-what-the-activity-7358122337751220225-5POc.
  The Edge rounded to "over RM48 bil": The Edge Malaysia, "Auditor General finds serious irregularities, weaknesses at
  govt projects, programmes worth over RM48 bil", https://theedgemalaysia.com/node/763341. Whether 48.78 is a
  transcription slip or a different sub-total was not checked against the report; that check is exactly what Angka would
  do
- **Caveat.** The documented 2025 case is a semantic misreading (cost read as loss) rather than a dropped digit or
  juta-versus-ribu error. **A named Malaysian minister or outlet misquoting million for billion from an official report
  in 2023-26: negative result.** The pitch should lead with the real case, not the hypothetical one

## Incumbents

### Malaysia

| Incumbent             | What it covers                                                                                                    | What it structurally cannot do                                                                       | Source                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Sinar Project pardocs | 5,000+ scanned written replies, full-text searchable; CKAN at data.sinarproject.org; Open Parliament sub-projects | Volunteer-run with no inference budget; the 2018 note asks the community to extract tables by hand   | [Sinar pardocs about]; [Sinar open parliament]; [Sinar GitHub]                               |
| Digital Hansard       | Searchable sitting transcripts, three chambers                                                                    | Search returns speeches, not a figure table with provenance; written replies not on the landing page | [Digital Hansard]                                                                            |
| AG Dashboard v3.0     | Follow-up status of raised issues                                                                                 | Tracks issues the AG chose to raise, not every figure in the report                                  | [AG Dashboard]                                                                               |
| data.gov.my           | One archived 2018 LKAN dataset, issue categories, one ministry                                                    | Nothing at figure level; nothing after 2018 found                                                    | MAMPU archive link under [LKAN Cadence And Format 2024-26](#lkan-cadence-and-format-2024-26) |
| TI-M, CAP, C4         | Press analysis of each LKAN series                                                                                | They read and comment; they do not publish a verified table                                          | [TI-M]; [CAP]                                                                                |

[Sinar open parliament]: https://sinarproject.org/open-parliament 'Open Parliament'
[Sinar GitHub]: https://github.com/Sinar
[Digital Hansard]: https://hansard.parlimen.gov.my/
[AG Dashboard]: https://agdashboard.audit.gov.my/ "AGD - Auditor General's Dashboard V3.0"
[TI-M]:
  http://transparency.org.my/pages/news-and-events/press-releases/ti-m-demands-accountability-and-reform-following-auditor-general-s-report-2-2025
  "TI-M Demands Accountability and Reform Following Auditor-General's Report 2/2025"
[CAP]:
  https://consumer.org.my/strengthening-public-accountability-after-the-2025-auditor-generals-report/
  "Strengthening Public Accountability After the 2025 Auditor General's Report"

### Global Extraction Products

- **Extend** ships a Review Agent that makes "a critical second pass over every extraction" and human-in-the-loop on
  every tier: Extend, "Extend vs. Reducto: Document AI Comparison (2026)",
  https://www.extend.ai/resources/extend-vs-reducto-document-ai-comparison; "Reducto Review: Features & Alternatives Mar
  2026", https://www.extend.ai/resources/reducto-review-features-pricing-alternatives. That is one vendor's second pass,
  not independent labs, and there is no third-party receipt per reading
- **Reducto** uses multi-pass OCR plus vision-language models: Reducto, "Docling vs LlamaParse vs Unstructured vs
  Reducto: Document Parser Comparison", https://llms.reducto.ai/document-parser-comparison. **Agreement gating across
  independent models in Reducto, LlamaParse or Unstructured: negative result**
- **Sensible** launched agentic workflows in 2025-26; no consensus gate found: Kognitos, "Automate Data Extraction with
  Agentic AI: A 2026 Guide", https://www.kognitos.com/blog/automate-data-extraction-agentic-ai-2026/
- **Google Document AI, Tensorlake, Roe AI: negative result** within budget

What they structurally cannot do: their business is that the pipeline is the trust. A closed single-vendor extractor
cannot hand a journalist a receipt from three independent labs that a reader can verify on-chain without the vendor.
GonkaRouter's request id per reading is the moat, and it is exactly the thing a well-resourced vendor would not add
because it makes their own model replaceable.

### The Mechanism Is Published Research

Agreement-gated extraction is not novel as a mechanism. Judges who know the space can cite:

- MADP: parallel LLM backends "applying consensus voting to identify agreed-upon values while flagging discrepancies for
  human review": arXiv, "MADP: A Multi-Agent Pipeline for Sustainable Document Processing with Human-in-the-Loop", 2026,
  https://arxiv.org/pdf/2605.17159
- bioRxiv, "Multi-Model AI Consensus Pipeline for Automated Data Extraction", 17 Feb 2026,
  https://www.biorxiv.org/content/10.64898/2026.02.17.706322v1.full.pdf
- medRxiv, "Employing Consensus-Based Reasoning with Locally Deployed LLMs for Enabling Structured Data Extraction from
  Surgical Pathology Reports", 22 Apr 2025, https://www.medrxiv.org/content/10.1101/2025.04.22.25326217.full.pdf
- PMC, "Beyond human gold standards: A multimodel framework for automated abstract classification and information
  extraction", agreement across small open models gave >95% precision with uncertain cases flagged,
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12873610/
- arXiv, "Beyond Logprobs: A Multi-Signal Confidence Engine for LLM-Based Document Field Extraction", 2026,
  https://arxiv.org/pdf/2606.24420. Its finding that a value clash and a one-model-silent case are different signals is
  worth copying into the consensus rule

The novelty claim must therefore be: this mechanism applied to this corpus, for this user, with a public per-reading
receipt. Not "we invented consensus extraction". Say that out loud before a judge does.

### Journalism Tools

- Aleph extracts names, addresses, phone numbers, registration numbers and emails with spaCy NER; Aleph Pro launched
  December 2025: OCCRP, "Named Entity and Pattern Extraction",
  https://docs.aleph.occrp.org/developers/explanation/entity-extraction/; GIJN, "Aleph Pro Tutorial: How to Get the Most
  from OCCRP's Updated Investigative Data Platform",
  https://gijn.org/stories/aleph-pro-tutorial-occrp-updated-investigative-data-platform/. Numbers are not an extracted
  entity class and there is no multi-model check
- DocumentCloud: **2025-26 AI extraction features: negative result** within budget
- **A journalism tool that verifies numbers against the source with multiple models: negative result**

## Users

Who opens it on a Monday, with evidence that they already read LKAN:

| User                   | Evidence                                                                                                                                                                 | Source                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| The Edge business desk | Three LKAN stories across 2025 including "Malaysia's auditor general flags concerns in 15 federal agencies' 2024 financial statements", and the constitutional-row piece | [The Edge, 15 agencies]; [The Edge, constitutional row] |
| Malaysiakini           | "Auditor-general's report recommends review of PTPTN collection"; runs a C4 Center tag page                                                                              | [Malaysiakini, PTPTN]; [Malaysiakini, C4 tag]           |
| The Sun                | "Auditor-General uncovers 273 new issues in latest audit report"                                                                                                         | [The Sun, 273 issues]                                   |
| TI-M, CAP, C4 Center   | Press releases within days of each series (links under [Malaysia](#malaysia)); C4, "Annual Report 2025"                                                                  | [C4 Annual Report 2025]                                 |
| MP research officers   | Sinar's pardocs was built with "the research team of the office of MP Serdang, Ong Kian Ming"                                                                            | [Sinar pardocs about]                                   |
| PAC secretariat        | "compiles reports based on the Hansard"                                                                                                                                  | [Wikipedia, PAC Malaysia]                               |

Stated pain about reading LKAN: the AG's 22 July 2025 correction is the only 2025 statement found, and it is the
publisher's pain about readers, not a reader's pain about the document. **A journalist or NGO staffer quoted on the
difficulty of reading LKAN, 2023-26: negative result.** Bersih and IDEAS: negative result on LKAN-specific work within
budget. The team should get one sentence from one named reporter before Demo Day; it is a phone call, not a search.

[The Edge, 15 agencies]: https://theedgemalaysia.com/node/793591
[The Edge, constitutional row]: https://theedgemalaysia.com/node/763727
[Malaysiakini, PTPTN]: https://www.malaysiakini.com/news/735455
[Malaysiakini, C4 tag]: https://www.malaysiakini.com/en/tag/c4%20center
[The Sun, 273 issues]:
  https://thesun.my/news/malaysia-news/people-issues/auditor-general-uncovers-273-new-issues-in-latest-audit-report/
[C4 Annual Report 2025]: https://c4center.org/annual-report-2025/
[Wikipedia, PAC Malaysia]:
  https://en.wikipedia.org/wiki/Public_Accounts_Committee_(Malaysia)
  'Public Accounts Committee (Malaysia)'

## Track Fit

**Does agreement-gated extraction honestly satisfy the requirements?** Yes, and better than the worked example does.

- "Two or more models cross-verify": every paragraph goes to three labs blind to each other. Remove one and the product
  degrades to a single-reader with no confidence signal; remove two and it does not exist. The requirement is
  load-bearing, not bolted on
- "Explicit consensus logic": the rule is one sentence a judge can repeat. Normalise the value (RM, juta, ribu, bilion,
  thousands separators), require two identical readings, otherwise queue. Following arXiv 2606.24420, treat "two agree,
  one different" and "two agree, one silent" as different queue priorities
- "Request IDs surfaced per inference step": the natural unit is one request id per reading per paragraph, so three per
  row. The UI shows them beside the source text. This is the only concept in the shortlist where the request id sits
  next to the exact sentence it reads
- **The honest limitation to state first.** Consensus does not catch correlated input error. If pdf.js drops a digit
  before any model sees it, all three agree on the wrong number. The source paragraph beside each reading is the
  mitigation, and it should be said in the pitch before a judge says it in Q&A

**Is it a data-quality trick?** Only if the disagreement queue is hidden. If the split view is the home screen and the
verified table is what you get after clearing it, the disagreement is the product, which is what the rubric says this
track structurally rewards.

**Is it in the banned RAG cluster?** Adjacent, not inside. What makes it unrecognisable from "RAG over government docs":

| RAG over government docs       | Angka                                                                |
| ------------------------------ | -------------------------------------------------------------------- |
| User asks a question           | User drops a document; nobody asks anything                          |
| Model generates an answer      | Model reads a paragraph and returns fields; no free text is produced |
| Output is prose with citations | Output is a table row with three request ids and a source paragraph  |
| Confidence is implicit         | Confidence is a count: 3, 2, or queued                               |
| Second use is another question | Second use is the next LKAN series, on a known date                  |

The one place it touches the Fact Checker cluster is v2, the draft checker. Keep v2 as the last 30 seconds of the demo,
not the headline, or a judge will file the whole thing under the worked example.

## Predicted Competition

**Convergence count: 2 recognisably similar, 0 to 1 structurally the same.** Defended:

- Of roughly 30 teams, the doc's worked example and the LLM brainstorm list predict 8 to 12 claim fact-checkers, 3 to 5
  multilingual assistants, 2 to 3 accessibility tools and 3 to 5 knowledge engines over government documents
- Of the knowledge-engine teams, Hansard and the budget are the obvious Malaysian corpora, so expect 1 to 2 "ask
  Parliament" chatbots. Those are recognisably similar in input only
- An LLM brainstorm produces "chat over documents", not "extraction with a disagreement queue and no chat". The rubric
  notes that almost nobody starts from the stack capability. The ceiling for a structurally identical entry is one team
  that read the same arXiv papers
- The fact-checker teams check social-media claims, not a writer's own draft against a table they built. v2 overlaps
  them in shape but not in workflow

## Scores

| Dimension              | Weight  |  Score | One-line reasoning                                                                                                      |
| ---------------------- | ------- | -----: | ----------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      |     19 | Mechanism is published research (MADP, bioRxiv 2026); corpus, user and per-reading receipt are not                      |
| Real user, real Monday | 20      |     14 | AG corrected "several media portals" within 24 hours; figure drift visible across outlets; pain is inferred, not quoted |
| Track fit              | 20      |     18 | Consensus is the product, not a step; a request id per reading per paragraph is the natural unit                        |
| Demo moment            | 15      |     11 | The split-with-source-beside-it view lands, but only if extraction is pre-run and one page goes live                    |
| Buildability           | 20      |     16 | PDFs public, pdf.js plus three chat calls per paragraph; token cost and Malay accuracy unverified                       |
| **Total**              | **100** | **78** | Above the 70 bar                                                                                                        |

## Novelty Test

1. **Convergence count:** 2 recognisably similar (Hansard or budget chatbots), 0 to 1 identical, see
   [Predicted Competition](#predicted-competition). Unrecognisable because there is no question, no generated prose, and
   the disagreement queue is the home screen. Passes.
2. **Incumbent test:** Sinar pardocs (full text, hand-extracted tables, volunteer), Extend Review Agent (single-vendor
   second pass), MADP and bioRxiv 2026 (research, no product). Structurally cannot: a closed vendor cannot issue a
   third-party-verifiable receipt from three independent labs without making its own model replaceable. Passes.
3. **Second-use test:** An Edge or Malaysiakini reporter, Monday 6 October 2026 or the nearest sitting day, when LKAN
   3/2026 is tabled; and again in February 2027 for 1/2027. What changed: a new 14-document series and a table that
   already exists for the previous two. Passes.

## Kill Criteria

| Criterion                                                       | Triggered? | Why                                                                                                                                            |
| --------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Convergence above five with execution as the differentiator     | No         | Estimated 2; differentiator is the absence of a question and the presence of a queue                                                           |
| Incumbent answer is "nobody"                                    | No         | Sinar, Extend, Reducto, MADP named above                                                                                                       |
| GonkaRouter requirements fit only by adding an unneeded feature | No         | Three readers and a consensus rule are the product                                                                                             |
| Demo needs more than 90 seconds of setup                        | Borderline | A full series cannot be extracted live in five minutes. Pre-run the report, extract one page live, open one real split. Passes only if pre-run |
| Buildability depends on data or access we do not have           | No         | CMD.4.2025 confirmed as a public PDF on parlimen.gov.my; lkan.audit.gov.my lists every series                                                  |

## Risks Ranked

1. **The demo split may not appear on clean text.** LKAN command papers are text-native PDFs; digit drops between three
   models reading the same clean paragraph will be rare. Expect splits on agency attribution, unit ("juta" vs "bilion"),
   and what a figure means (cost vs loss). Pick a page in advance that produces a real split and say so honestly
2. **Token cost.** A 14-document series at three calls per paragraph is thousands of calls. Demo on one chapter;
   AGENTS.md forbids idle burn and the tutorial's rate limits apply
3. **Malay accuracy of DeepSeek, MiniMax and Kimi on audit prose is unverified.** Spend the first hour on a 20-paragraph
   sample and measure the three-way agreement rate before committing the UI
4. **Correlated OCR error.** State it on the first slide; it is the question a technical judge will ask
5. **Real-user evidence is inferred.** One quoted sentence from one named reporter closes the gap; get it this week

**Strongest fact:** within 24 hours of LKAN 2/2025 being tabled, the Auditor-General corrected "several media portals"
that had reported RM48.873bn of audited programme cost as leakages or losses, and secondary coverage of the same report
carries RM48.78bn. Whether that is a transcription slip or a different sub-total is unchecked, and checking it against
the report is the job.

**Biggest risk:** the user-pain evidence is indirect. The documented 2025 case is a semantic misreading, not a dropped
digit, and no Malaysian journalist was found stating the retyping pain in their own words; on the build side, clean
text-native LKAN pages may give three readers nothing to split on, so the demo page must be chosen in advance.

## Negative Results Recorded

- LKAN page counts and file sizes on lkan.audit.gov.my
- Written replies on the Digital Hansard landing page
- A 2023-26 statement of the retyping pain (only Sinar 2018 found)
- A named million-for-billion misquote from an official report, 2023-26 (only the cost-vs-loss case found)
- Agreement gating in Reducto, LlamaParse, Unstructured, Google Document AI, Tensorlake, Roe AI
- DocumentCloud AI features 2025-26
- A journalism tool that verifies numbers against source with multiple models
- Bersih or IDEAS work specific to LKAN
- A figure-level LKAN dataset on data.gov.my

[Sinar pardocs about]: https://pardocs.sinarproject.org/about 'About - Parliamentary Documents'
