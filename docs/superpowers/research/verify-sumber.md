# Verification: Sumber, tested for support

**VIABLE, 78/100.** Above the 70 bar, not LOCK. Wedge A (newsrooms) for v1, with Malaysian government press statements
as the demo's _source document_ rather than as the user; the reasoning is under [Recommendation](#recommendation). The
difference between 78 and LOCK is one named Malaysian desk editor, see
[Open items for the next round](#open-items-for-the-next-round).

**The candidate.** A writer pastes a draft and the documents it cites. Two models from two labs, each shown only one
sentence and the passage it cites, blind to each other, say whether the passage supports the sentence. Agreement passes
quietly; disagreement or double rejection comes back inline with the passage beside it. Every check carries a Gonka
request id; the finished piece gets a public "how this was checked" page. Closed world: no web search, no truth verdict.

**Method.** Round 11 phenomenon-first candidate, verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md) and the
[Regulatory pressure](competitor-scan.md#regulatory-pressure) section of `competitor-scan.md`. Fifteen search/fetch
calls used; every negative result is stated as such. Items marked **not verified this round** were not searched, and any
characterisation of them is from memory and must not go on a slide. In tables the source is a reference link; its
definition, at the end of the section, carries the article title.

Contents:

1. [Wedge A: newsrooms](#wedge-a-newsrooms)
1. [Wedge B: government communications](#wedge-b-government-communications)
1. [Wedge C: hallucinated citations](#wedge-c-hallucinated-citations)
1. [Incumbents](#incumbents)
1. [Predicted competition](#predicted-competition)
1. [Scores](#scores)
1. [Novelty test](#novelty-test)
1. [Kill criteria](#kill-criteria)
1. [Judge legibility](#judge-legibility)
1. [Recommendation](#recommendation)
1. [Open items for the next round](#open-items-for-the-next-round)

## Wedge A: newsrooms

### Incidents, 2024 to 2026

The Apple/BBC case is the exact Sumber pattern: a machine-written sentence that the source it summarised never
supported.

- **Dec 2024:** Apple Intelligence summarised a BBC notification to say Luigi Mangione had shot himself. The BBC story
  said no such thing. MacRumors, "BBC Calls Out Apple's AI Feature for Creating More Fake News Headlines", 6 Jan 2025,
  https://www.macrumors.com/2025/01/06/bbc-calls-out-apple-ai-creating-fake-news-titles/
- **Jan 2025:** further false summaries (Luke Littler "won" a championship before it began; Rafael Nadal "came out"),
  then Apple paused news and entertainment summaries. Axios, "Apple pauses AI-generated news alerts after fake headline
  notifications", 17 Jan 2025, https://www.axios.com/2025/01/17/apple-ai-news-alerts-fake-headlines. CBC, "Apple pulls
  AI-generated news summaries after feature repeatedly produced inaccurate headlines", Jan 2025,
  https://www.cbc.ca/lite/story/1.7434136. Reporters Without Borders called generative AI summaries "a danger to the
  public's right to reliable information" (same Axios piece)
- **18 May 2025:** the Chicago Sun-Times and Philadelphia Inquirer printed a syndicated "Heat Index" reading list in
  which 10 of 15 books did not exist; produced by King Features writer Marco Buscaglia partly with AI. Washington Post,
  "Chicago Sun-Times, Philadelphia Inquirer print AI-generated list with fake books", 20 May 2025,
  https://www.washingtonpost.com/style/media/2025/05/20/chicago-sun-times-philadelphia-inquirer-ai-books-summer-reading/.
  NPR, "How an AI-generated summer reading list got published in major newspapers", 20 May 2025,
  https://npr.org/2025/05/20/nx-s1-5405022/fake-summer-reading-list-ai. **Honest note:** a reading list cites no
  document, so Sumber as specified would not have caught this one. Use it as evidence of the pressure, not as a demo
- **CNET (2023), Bloomberg AI summaries, LA Times "Insights":** not verified this round. CNET is outside the 2024 to
  2026 window in any case

### Malaysia

- **Astro Awani** runs three AI news anchors; **RTM** launched an AI anchor ("Aaron Lim") for its Mandarin bulletin.
  Wikipedia, "Astro Awani", accessed 2 Sept 2026, https://en.wikipedia.org/wiki/Astro_Awani. Media and Communication
  (Cogitatio), "AI Adoption in Indonesian and Malaysian Journalism: A Comparative Mixed-Methods Study",
  https://www.cogitatiopress.com/mediaandcommunication/article/view/12395
- **Sin Chew Daily, April 2025:** published an AI-generated Jalur Gemilang without its crescent during Xi Jinping's
  visit; 13 police reports; staff disciplined. **Ministry of Education, April 2025:** apologised for an AI-generated
  classroom image showing a flag with two crescents. South China Morning Post, "AI errors over Malaysia's Jalur Gemilang
  flag spark national pride and controversy", April 2025,
  https://www.scmp.com/week-asia/politics/article/3308012/ai-errors-over-malaysias-jalur-gemilang-flag-spark-national-pride-and-controversy.
  Both are images, not text, but they establish that AI-output errors in Malaysian media are already a police-report
  matter
- **Malaysiakini, Jan 2026:** apologised for social media caption blunders and met Umno leaders. The Star, "Malaysiakini
  apologises for photo error", 14 Jan 2026,
  https://www.thestar.com.my/news/nation/2026/01/14/malaysiakini-apologises-for-photo-error. AI involvement is not
  stated; do not claim it
- **Oct 2024:** Lim Guan Eng publicly called out a news portal for misreporting his Budget 2025 speech. Malay Mail, 29
  Oct 2024,
  https://www.malaymail.com/amp/news/malaysia/2024/10/29/guan-eng-calls-out-news-portal-for-misreporting-his-budget-2025-speech-offers-to-meet-dpm-zahid-to-clear-any-confusion/155235.
  Human error, but exactly the "report versus source" mismatch Sumber checks, and a natural Malaysian demo shape
- **Market pressure:** Malaysian ad spend fell 22% in 2025 with a further 9.5% decline forecast for 2026; Astro Awani is
  the most trusted broadcast brand. Reuters Institute, Digital News Report 2026, Malaysia page,
  https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/malaysia (figures via search summary; confirm on
  the page before a slide)
- **Negative result:** no Malaysian text-based AI news error, and no published editorial-AI policy at The Star, Media
  Prima, Bernama or Malaysiakini, surfaced in this round's searches

### EU AI Act Article 50(4)

Confirmed. Applies from **2 August 2026**. Second subparagraph, verbatim (artificialintelligenceact.eu, "Article 50",
accessed 2 Sept 2026, https://artificialintelligenceact.eu/article/50/):

> Deployers of an AI system that generates or manipulates text which is published with the purpose of informing the
> public on matters of public interest shall disclose that the text has been artificially generated or manipulated. This
> obligation shall not apply where the use is authorised by law to detect, prevent, investigate or prosecute criminal
> offences or where the AI-generated content has undergone a process of human review or editorial control and where a
> natural or legal person holds editorial responsibility for the publication of the content.

Three corrections to how the competitor scan paraphrases it:

- The exception has **two limbs**: a process of human review or editorial control, **and** a person who holds editorial
  responsibility. "Unless a human editor takes responsibility" collapses them. Quote the text on the slide
- "Deployer" is "a natural or legal person, public authority, agency or other body using an AI system under its
  authority" (same page), so a newsroom or a ministry drafting with AI is the deployer, not the model vendor
- The Act does **not** require a record. It requires that review happened. The record is what makes the exception
  defensible when challenged, which is the gap the competitor scan calls the "auditable determination record". Say it
  that way; do not say the Act mandates it

**Whether any tool produces the editorial-responsibility record: negative result.** The closest thing found is
Clearbrief's Cite Check Report, an audit trail for law-firm partners (LawSites, "Clearbrief Launches Cite Check Report
to Give Law Firm Partners an Audit Trail Against AI Hallucinations", Dec 2025,
https://www.lawnext.com/2025/12/clearbrief-launches-cite-check-report-to-give-law-firm-partners-an-audit-trail-against-ai-hallucinations.html).
It is legal, internal to the firm, and not framed around Article 50.

The penalty tier for Article 50 breaches (the scan's `[NEEDS SOURCE]` on €15M/3%) was not verified this round.

## Wedge B: government communications

- **AI drafting is real and at scale.** "AI at Work 2.0", 5 Feb 2025: 445,000 public officers get Google Workspace
  generative AI; the 270-officer pilot (including Jabatan Digital Negara) used it for "drafting policy papers and
  written communications"; 97% reported saving 3.25 hours a week. Google Cloud press corner, 5 Feb 2025,
  https://www.googlecloudpresscorner.com/2025-02-05-445,000-Public-Officers-in-Malaysia-to-Benefit-from-Generative-AI-Under-the-AI-at-Work-2-0-Initiative-by-the-Ministry-of-Digital-and-Google-Cloud.
  Ministry of Digital,
  https://www.digital.gov.my/en-GB/siaran/Ministry-Of-Digital,-Through-NAIO,-Secures-AI-Training-For-445,000-Civil-Servants-Under-Google-AI-At-Work-2.0-Initiative
- **Guidelines exist:** National Guidelines on AI Governance and Ethics, MOSTI, Sept 2024,
  https://mastic.mosti.gov.my/storage/2024/09/THE-NATIONAL-GUIDELINES-ON-AI-GOVERNANCE-ETHICS.pdf. Public Sector AI
  Adoption Guidelines launch, Ministry of Digital,
  https://www.digital.gov.my/en-GB/siaran/Majlis-Peluncuran-Garis-Panduan-Pengadaptasian-Kecerdesan-Buatan-(AI)Sektor-Awam
- **Closest incident, March 2026:** Minister Johari declared the US-Malaysia trade agreement "null and void" after a US
  Supreme Court ruling; the ministry said he "misspoke"; his press secretary said the statement "remains". The Diplomat,
  "Confusion Reigns After Malaysian Minister Declares US Trade Agreement 'Null and Void'", March 2026,
  https://thediplomat.com/2026/03/confusion-reigns-after-malaysian-minister-declares-us-trade-agreement-null-and-void/.
  A spoken misstatement of an agreement, not a written statement misstating its own document
- **Negative result:** no 2024 to 2026 example of a Malaysian ministry or agency correcting a written statement that
  misstated its own report surfaced in this round

**Assessment.** The drafting-adoption fact is strong and the ministry press statement is the best _demo document_ in the
whole candidate. As a _user_ wedge it is weak: no incident, no named comms officer, and no route to one before 5
September. Use the statement as the source in the demo; do not pitch the agency as the buyer.

## Wedge C: hallucinated citations

- **Global scale:** Damien Charlotin's AI Hallucination Cases database held 1,668 decisions as of 2 July 2026 (US 1,163,
  UK 59); trajectory roughly 200 in mid-2025, 719 by Jan 2026, 1,227 by early April 2026, 1,598 by 9 June 2026; now five
  to ten new cases a day. Charlotin, https://www.damiencharlotin.com/hallucinations/. HAQQ, "AI Hallucination Cases: The
  1,598-Case Sanctions Tracker", June 2026, https://www.haqq.ai/blog/ai-legal-hallucination-audit. LegalAI Space,
  "1,600+ AI Hallucination Cases", July 2026, https://legalaispace.com/blog/ai-hallucination-cases-law-firms-2026.
  Seventeen US decisions on 31 March 2026 alone (Reason/Volokh, 6 April 2026,
  https://reason.com/volokh/2026/04/06/in-one-day-mar-31-17-u-s-court-decisions-noting-suspected-ai-hallucinations-in-court-filings/).
  Withers v. City of Aberdeen (N.D. Miss., 8 June 2026): both sides filed fake citations, trial cancelled, two lead
  attorneys suspended two years (HAQQ, above)
- **Region:** India's Supreme Court held citing AI-fabricated case law to be misconduct (Medianama, March 2026,
  https://www.medianama.com/2026/03/223-supreme-court-ai-fake-case-laws-misconduct/). Ireland's courts flagged cost
  sanctions (Irish Times, 5 Aug 2026,
  https://www.irishtimes.com/crime-law/2026/08/05/lawyers-could-face-sanctions-including-costs-if-ai-leads-to-fake-citations-in-court-cases/)
- **Malaysia:** the Malaysian Bar issued **Circular No. 242/2025** after a Singapore sanction, warning of hallucinated
  citations (Al Kabban, "Singapore Court Sanctions Lawyer for AI-Generated Case Law", 2025,
  https://alkabban.com/news/singapore-lawyer-sanctioned-ai-fake-case-legal-ethics/. the circular itself was not
  fetched). **Negative result** across two searches for a Malaysian court decision on AI-fabricated citations
- **Universities:** Universiti Malaya published a 2025 Academic Policy on AI
  (https://ias.um.edu.my/Student%20Affairs/Guideline/Compilation%20Policy%20&%20GP%20AI%20-%20Final%20V3.pdf) and, on 15
  March 2026, a Policy and Guidelines on AI in Teaching and Learning
  (https://spm.um.edu.my/2026/03/15/universiti-malaya-releases-policy-and-guidelines-on-the-use-of-artificial-intelligence-in-teaching-and-learning/).
  MQA issued an advisory note in 2023; NAIO is drafting an AI Act (The Vibes, "Balancing Innovation and Integrity",
  2025,
  https://www.thevibes.com/articles/education/109805/balancing-innovation-and-integrity-ais-role-in-higher-education-under-scrutiny).
  UKM, USM, UTM: negative result this round

**Assessment.** Best numbers, worst wedge. The legal search alone returned eight vendors selling citation verification
(Clearbrief, NexLaw, HAQQ, Habeas, GC AI, Vaquill, TheLawGPT, Westlaw Quick Check), and existence-checking needs a
case-law database we do not have. Sumber's source-bound design dodges the database, and it catches the harder failure
(real case, misquoted holding) that existence checks miss, but that distinction takes a lawyer to appreciate and the
judges are not lawyers. Keep the Charlotin curve as one slide of pressure evidence. Do not build for it.

## Incumbents

| Tool                                | Source-bound or web-search                                                        | Models                                 | Produces a record                                                     | Source                                              |
| ----------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| **Clearbrief** (Word add-in)        | Source-bound: reads each assertion against uploaded record, exhibits, transcripts | One, "classic" semantic score, no LLM  | Yes, Cite Check Report (Dec 2025), internal to the firm               | [Clearbrief]; [Legaltech Hub]; [LawSites, Dec 2025] |
| **Factiverse**                      | Web-search across engines plus a 350k fact-check store; live broadcast checking   | Proprietary transformer plus retrieval | Verdict with "supported rate" and evidence list, no third-party trail | [Factiverse blog]; [Hello Future]                   |
| **Originality.ai Fact Checker**     | Web-search: scans a document, searches online for each statement                  | One internal model                     | Downloadable citations/bibliography, not a check record               | [Originality.ai]                                    |
| **Grammarly Citation Finder**       | Web-search: flags unsupported statements, pulls in sources, formats them          | One                                    | No                                                                    | [Grammarly]                                         |
| **Westlaw Quick Check / Lexis+ AI** | Database: existence and negative treatment of cited authorities                   | One vendor each                        | Flags, no source-support record                                       | [CALL Bulletin, Nov 2025]; [Vaquill]                |
| Full Fact AI, Scite, ClaimBuster    | **Not verified this round**                                                       |                                        |                                                                       |                                                     |
| Perplexity / ChatGPT "verify"       | **Not verified this round**                                                       |                                        |                                                                       |                                                     |

Two figures from the sources above that belong beside the table: Vaquill reports the Stanford study in which Lexis+ AI
hallucinated on 17% of queries and Westlaw AI-Assisted Research on about 33%; and the field now has a benchmark, arXiv
2606.21155, "Who Checks the Citations? Benchmarking Legal Hallucination Detection", June 2026,
https://arxiv.org/html/2606.21155.

[Clearbrief]: https://clearbrief.com/
[Legaltech Hub]: https://www.legaltechnologyhub.com/vendors/clearbrief/ 'Legaltech Hub vendor page, Clearbrief'
[LawSites, Dec 2025]:
  https://www.lawnext.com/2025/12/clearbrief-launches-cite-check-report-to-give-law-firm-partners-an-audit-trail-against-ai-hallucinations.html
  'Clearbrief Launches Cite Check Report to Give Law Firm Partners an Audit Trail Against AI Hallucinations'
[Factiverse blog]:
  https://www.factiverse.ai/blog/how-factiverse-scans-the-web-to-tackle-misinformation-at-scale
  'How Factiverse Scans the Web to Tackle Misinformation at Scale'
[Hello Future]:
  https://hellofuture.orange.com/en/factiverse-reliable-ai-fact-checking-in-more-than-100-languages/
  'Hello Future (Orange), Factiverse: reliable AI fact-checking in more than 100 languages'
[Originality.ai]: https://originality.ai/automated-fact-checker 'Automated Fact-Checker'
[Grammarly]: https://www.grammarly.com/ai-agents/citation-finder 'Citation Finder'
[CALL Bulletin, Nov 2025]:
  https://bulletin.chicagolawlib.org/2025/11/detecting-ai-hallucinations-in-legal-materials/
  'Tools and strategies for detecting AI case citation hallucinations'
[Vaquill]: https://www.vaquill.ai/blog/lexis-ai-vs-westlaw-ai 'Lexis+ AI vs Westlaw AI 2026'

### What they structurally cannot do

- **The retrieval tools cannot stop issuing verdicts.** Factiverse, Originality.ai and Grammarly sell "is this true"
  against the open web. That is their product and their moat. They cannot run on an unpublished draft against private
  sources without abandoning it, and they cannot avoid a truth verdict because the verdict is what is billed
- **Clearbrief is the real incumbent, and its gap is independence, not features.** It is single-model by declared
  positioning ("no generative AI, so the checker cannot hallucinate"). Its proof is its own proprietary score, inside
  its own add-in, for US litigation, priced for law firms. It could add a second model in a sprint, so do not claim
  multi-model as the moat. What it cannot do is produce an attestation that is **not its own**: a receipt from two
  independent labs, resolvable by a reader at a public endpoint the vendor does not control. A vendor's audit log is
  self-attestation. That is the honest structural line, and it is the one the GonkaRouter judges will recognise as
  theirs
- **None produces a public per-piece check page** for the reader of the finished article. All of them report to the
  author

## Predicted competition

**Estimate: 8 to 12 of roughly 30 teams build a web-search fact checker; 1 to 2 build something recognisably Sumber.**

Defence:

- The challenge doc's worked example is "paste a link and get a verification report", specified over most of its length.
  The rubric already expects judges to have seen four before ours. A URL-in, verdict-out tool is the default LLM
  brainstorm output, so eight to twelve is conservative
- Sumber inverts the input contract: two things in (draft plus its sources), no retrieval, and the output is "your
  source does not say that" rather than "this is false". Teams do not converge on this because a demo that needs the
  user to supply the sources feels like more work than pasting a URL, and because the brainstorm prompt says
  "fact-check", which pulls toward truth verdicts
- Where the line blurs: a fact-checker team that also fetches the linked source and compares. From a projector, that
  looks like Sumber for about five seconds. The differentiators the judges must be shown are: the closed world (no
  search, ever), the per-sentence blind split between two labs, the passage rendered beside the sentence, and the
  reader-facing page

**Is it unrecognisable from the Fact Checker?** Not entirely, and the report should say so. It shares the primitive
(several models on a claim). It differs in input contract, output type, user and moment (writer before publication, not
reader after). Whether a judge sees the difference depends on the first ten seconds of the demo and on never using the
phrase "fact-check".

## Scores

| Dimension              | Weight  |  Score | One-line reasoning                                                                                                                                    |
| ---------------------- | ------- | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      |     16 | Convergence count 2 for the exact shape, but inside a 10-team fact-check cluster; incumbent named (Clearbrief) with a real but thin gap               |
| Real user, real Monday | 20      |     14 | The desk editor on an AI-assisted rewrite is concrete and recurring, but no Malaysian editor is named and no Malaysian text incident was found        |
| Track fit              | 20      |     19 | Two labs blind per sentence, a receipt per check, and the split _is_ the flag. This is the rubric's "disagreement is the product" shape, unforced     |
| Demo moment            | 15      |     12 | Paste, and the misstated sentence lights up with the passage beside it and one model dissenting. Under 30 seconds. Text on a projector is the risk    |
| Buildability           | 20      |     17 | Two calls per sentence, no retrieval, no database, no partner. Sentence-to-passage mapping is the one hard part; hand-pasted passages are fine for v1 |
| **Total**              | **100** | **78** | Above 70. Viable                                                                                                                                      |

## Novelty test

1. **Convergence count: 2.** Defended under [Predicted competition](#predicted-competition). Fails to 10-plus if the
   judges file it as a fact-checker, which is a presentation risk, not a concept flaw.
2. **Incumbent: Clearbrief**, then Factiverse, Originality.ai, Grammarly Citation Finder, Westlaw Quick Check. What
   Sumber does that they structurally cannot: independent, externally resolvable attestations from two labs the vendor
   does not own, and a public reader-facing check page. Multi-model alone is not the moat and should not be claimed as
   one.
3. **Second use:** the same desk editor, the next morning, on the next AI-assisted rewrite of a ministry statement. What
   changed is the draft. Alternatively the comms officer the next time Workspace Gemini drafts a statement from a
   40-page report. Both are weekly, not once.

## Kill criteria

| Criterion                                                 | Triggered? | Note                                                                                                                          |
| --------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Convergence above five with execution as differentiator   | No         | Two, and the differentiator is the input contract. Becomes Yes if pitched as a fact-checker                                   |
| Incumbent answer is "nobody does this"                    | No         | Clearbrief                                                                                                                    |
| GonkaRouter requirements fit only via a bolted-on feature | No         | The blind two-lab split per sentence is the feature                                                                           |
| Demo needs more than 90 seconds of setup                  | No         | Two pastes. Pre-load the sample                                                                                               |
| Buildability depends on data, access or a partnership     | No         | Wedge A and the demo use public documents. Wedge C would trip this if it needed a case-law database; source-bound v1 does not |

## Judge legibility

**Can two inference-infrastructure people grasp it in ten seconds with no Malaysian legal context? Yes, if it opens with
Apple, not with Article 50.**

The ten-second version: "Apple's AI told BBC readers a man had shot himself. He had not. The BBC story never said it.
Sumber reads the sentence and the source it cites, with two models that cannot see each other, and stops that sentence
before it ships."

What lands with these judges specifically:

- **"It never searches the web"** is an engineering constraint they will respect: closed world, deterministic inputs,
  reproducible, cheap. Say it in the first sentence
- **The disagreement is the product**, not an averaging step. That is what their four requirements describe
- **It keeps running.** Their reference customer is a Reddit lead-finding automation, a pipeline, not a chat app. Sumber
  is a pre-publish check that runs on every draft, and can be an API step. Post-event tokens have somewhere to go
- **The Article 50 angle is a footnote.** One line on one slide: "in the EU since 2 August, AI-drafted public-interest
  text needs a human editor to own it. This is the receipt." Do not explain the Act. Do not quote penalties that are not
  yet verified

## Recommendation

**Wedge A for v1**, with a Malaysian document pair in the demo: a ministry press statement as the source, a
Bernama-style or Star-style rewrite as the draft, one sentence seeded to overstate the source.

Why A over B and C:

- A has the only incident that is the exact Sumber pattern (Apple/BBC: a summary the source never supported), it needs
  no access, and it is legible with no Malaysian context
- B has real drafting adoption (445,000 officers) but no found incident and no reachable user before the deadline. Use
  its documents, not its buyer
- C has the best numbers and the worst field: eight vendors in one search, and a distinction only a lawyer appreciates

**Strongest fact:** in December 2024 Apple Intelligence summarised a BBC notification to say Luigi Mangione had shot
himself when the BBC story said no such thing, and by 17 January 2025 Apple had paused news summaries altogether. That
is the exact Sumber pattern, a machine-written sentence the source it summarised never supported. EU AI Act Article
50(4) has applied since 2 August 2026 and its exception turns on human review plus a person holding editorial
responsibility, which no tool found this round records.

**Biggest risk:** no Malaysian desk editor is named and no Malaysian text-based AI news error was found, so the user is
inferred from the workflow; and the concept sits inside a 10-team fact-check cluster, so the judges must be shown the
closed world, the blind per-sentence split and the reader-facing page in the first ten seconds, or it files as the fifth
fact checker of the afternoon.

## Open items for the next round

- Name one Malaysian desk editor or sub-editor who would run it Monday. This is the difference between 78 and a LOCK
- Verify the Article 99 penalty tier for Article 50 breaches against EUR-Lex before any figure goes on a slide
- Full Fact AI, Scite, ClaimBuster and Perplexity/ChatGPT verify features were not searched. One call each next round
- Confirm the Reuters Institute Malaysia 2026 ad-spend figures on the page itself
- Decide the passage-mapping approach for v1: hand-paste versus a third model proposing the passage (both checkers must
  see the identical passage, or the blind split is not a controlled comparison)
- Never say "fact-check" in the pitch, the README or the UI
