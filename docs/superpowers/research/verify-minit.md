# Verification: Minit, Tested For Concordance

**VIABLE, 78/100.** Above the 70 line, not LOCK. The wedge is real and statutory: the Second Schedule of the Strata
Management Act 2013 makes the management committee keep minutes, publish them within 28 days, and makes the signed
minutes prima facie evidence in court. The phenomenon is real but thinly measured. Two things stand between VIABLE and
LOCK, ranked under [Open Risks](#open-risks): whether Malaysian JMB and MC meetings actually produce a transcript, and
whether the screen can be told apart from the dozen fact checkers the judges will see the same afternoon.

**The candidate.** Working name Minit (Malay for "minutes"). Meeting minutes that two independent AIs agree happened.
Two models from two labs, blind to each other, each extract decisions, actions (owner, date) and undecided items from
the same transcript; items are matched, then compared field by field, and every item lands in one of three states: both
agree (publish), one reader only (chair confirms or drops), readers conflict (show the passage). Each reading carries a
Gonka request id.

**Method.** Verified 2 September 2026 against [`RUBRIC.md`](RUBRIC.md). Budget: 15 search/fetch calls, plus a local read
of the Strata Management Act 2013 PDF that one fetch saved. Where a search found nothing it says "negative result".
Citations are inline by publisher, title and date; every URL is under [Sources](#sources).

Contents:

1. [Phenomenon: AI Note-Takers Invent And Omit](#phenomenon-ai-note-takers-invent-and-omit)
1. [Malaysian Wedge](#malaysian-wedge)
1. [Incumbents](#incumbents)
1. [Track Fit](#track-fit)
1. [Predicted Competition](#predicted-competition)
1. [Scores](#scores)
1. [Novelty Test](#novelty-test)
1. [Kill Criteria](#kill-criteria)
1. [Judge Legibility](#judge-legibility)
1. [Open Risks](#open-risks)
1. [Sources](#sources)

## Phenomenon: AI Note-Takers Invent And Omit

**Finding: real, vendor-admitted, weakly measured.** No peer-reviewed 2024-26 study measuring decision or action-item
hallucination rates in commercial note-takers surfaced. Negative result on that specific claim. What did surface:

- **Vendor admissions.** Zoom's AI Companion documentation, as reproduced on university IT pages: "Meeting Summaries,
  Questions, and Smart Recordings are based on machine-generated meeting transcripts and should be reviewed for accuracy
  and suitability before distributing them to other attendees" (University of Iowa ITS, "Zoom AI Companion",
  its.uiowa.edu/node/9381, undated; same text on Boston University and Cornell pages). Microsoft's Copilot recap UI
  carries "AI-generated content may be incorrect" (Microsoft Q&A threads on learn.microsoft.com, 2025-26). Both vendors
  put the review burden on the user, which is the gap Minit occupies
- **Measured quality band.** TestDevLab's benchmark, commissioned and published by Zoom: Zoom AI Companion 81.35%
  overall, Microsoft Copilot 80.75%, Webex 80.20%, Teams Intelligent Recap 78.63%; Zoom "16% fewer summary errors than
  Copilot" (Zoom, "Zoom AI Performance Report 2024", zoom.com/en/resources/ai-performance-report; Zoom blog "Putting AI
  quality first to enhance accessibility and collaboration"). Read it as a vendor-funded composite score, not an error
  rate; the useful fact is that every incumbent sits in a 78-81 band, so roughly a fifth of quality points are lost even
  by the winner
- **Third-party tests.** StackNova, "AI Meeting Summarizer Comparison 2026: 8 Tools Tested" (127 meetings, Jan-Mar
  2026): transcription accuracy Otter 96.8%, Fireflies 96.2%, Fathom 95.4%, tl;dv 93.6%; summary quality Otter 8.5/10,
  Fathom 8.2, tl;dv 7.6 with "noticeably weaker action item extraction". index.dev, "Otter vs Fireflies vs Fathom"
  (2025): action-item capture is "high across all the tools" only "where action items were spoken explicitly". Implicit
  decisions, which is what AGMs produce, are the untested case. Both are blogs with unaudited method
- **First-hand incident.** Writing Clear Science (Australia), "Zoom's AI Companion Meeting Summary was inaccurate, vague
  and full of errors", writingclearscience.com.au/ai-meeting-summary: a 90-minute workshop summary of "surprisingly poor
  quality". The page refused connection on fetch, so date and the itemised errors are unverified beyond the search
  snippet
- **Fabricated assignee.** A search snippet for the query on fabricated recaps reported a user whose AI Companion
  "assigned an action item to someone who was never even in the meeting, with no record of that person in the attendee
  list or transcript". The snippet sat among the Jamie review (meetjamie.ai/blog/zoom-ai-companion-review, a competitor)
  and Zoom community threads; attribution not verified by fetch. Treat as anecdote until fetched
- **Incident databases.** The AI Incident Database roundups for Nov 2025-Jan 2026 and May-Jul 2026 appeared in results
  with no meeting-summary incident in the snippets. Negative result

**What this supports in the pitch:** "the vendors themselves tell you to check the summary before you send it" is
citable verbatim. "X% of decisions are invented" is not; do not say it.

## Malaysian Wedge

**Finding: the statutory duty is exact and quotable, and the volunteer bodies carrying it have no secretary.** The
provisions below are read directly from the Act text (Laws of Malaysia, Act 757, Strata Management Act 2013, reprint
hosted at ongmaju.com, converted locally with pdftotext; link under [Sources](#sources)). The Second Schedule is applied
to the joint management body by s. 22(2), to the management corporation by s. 56(2), and to subsidiary management
corporations by a third provision (subsection (5) of the relevant section; number not captured).

Second Schedule, paragraph 7, "Keeping of records and accounts of management corporation":

- 7(1): "The management committee shall keep minutes of all its proceedings and minutes of general meetings."
- 7(2)(a): a copy of committee-meeting minutes "signed by the chairman of the meeting or the secretary" must be
  "displayed on the notice board within twenty-one days after the meeting"; 7(2)(b): the same for "a minute of any
  resolution", within twenty-one days after it is passed
- 7(3): the copy stays displayed "until it is replaced by a copy of the minutes of the subsequent meeting"
- 7(4): "The Commissioner may require the management committee to give each proprietor a copy of the minutes"
- 7(5): "The minutes of the meeting signed by the chairman of the meeting or the secretary shall be admissible in any
  legal proceedings as prima facie evidence of the facts stated in them without further proof."
- 7(8): "within twenty-eight days of a general meeting, file with the Commissioner certified true copies of" the audited
  accounts, "the resolutions passed at the general meeting" and "the minutes of the general meeting"
- 7(9): "within twenty-eight days of a general meeting extend copies of the minutes of the meeting to all proprietors or
  display the minutes of the meeting on the notice board"
- Paragraph 12(1): fourteen days' notice of any general meeting; 12(3)(a): an AGM notice must "be accompanied by a copy
  of the minutes of the last annual general meeting"

So the cadence is monthly (committee minutes, 21 days) plus annual (AGM minutes, 28 days, filed with the Commissioner of
Buildings, attached to next year's notice). That is the second-use answer, written into the law.

**Tribunal and dispute evidence.** The Tribunal for Housing and Strata Management resolved 11,361 cases in 2023 against
9,617 in 2022 (Malay Mail, "Housing and local govt minister says record 99.87pc housing and strata cases solved by
tribunal in 2023", 30 Jan 2024). That figure combines housing and strata claims. A reported case about AGM compliance:
Jaya One Management Corporation had held no AGM or EGM for more than 38 months after September 2020 (Focus Malaysia, "A
landmark case that upholds Malaysia's strata law & a stern lesson to all MC, JMB", date not captured). Mahwengkwai (law
firm), "Challenging a Strata Management Tribunal Award in Malaysia", confirms the Tribunal's jurisdiction covers
meetings and AGMs. **A Tribunal case turning specifically on the content of minutes: negative result.**

**Forum evidence.** Lowyat Forum, "Complain on JMB" (forum.lowyat.net/topic/3200536): "Both the JMB chairman and
management refused to show proof or minutes of committee decisions." Timetec (vendor blog), "The JMB Committee Handover
Problem": institutional memory lost at committee turnover. jmbmalaysia.my runs a dedicated JMB forum.

**Scale.** Number of strata schemes, JMBs or MCs nationwide: **negative result** across two searches. Proxies: about
1.95 million strata titles registered as at 2022 (ResearchGate, "A Case Study of Strata Lease Schemes in Malaysia",
snippet, unverified by fetch); 9,486 strata units launched in 2H 2024, up 7% (REHDA Institute, Property Industry Survey
2H 2024, April 2025); 242 developments in Sarawak issued strata titles as of 3 May (DayakDaily, year not captured). Ask
KPKT or a COB for the scheme count before the pitch; do not invent one.

**Public bodies.** Local Government Act 1976 (Act 171), consolidated text on CommonLII: minutes of all proceedings of
the local authority "shall be kept at the office of the local authority and shall at all reasonable times be open to the
inspection of any Councillor or rate-payer", who "may at all reasonable times make a copy of any part thereof without
fee"; committee minutes are not open to rate-payers "unless the local authority otherwise directs"; "All minutes shall
be confirmed and signed by the Chairman". Section number not verified. University senates, PTAs and NGO boards: not
searched; treat as unverified extensions of the wedge, not evidence.

## Incumbents

**Finding: named, plentiful, and none does a second independent reading.**

- **Note-takers (Otter, Fireflies, Fathom, tl;dv, Zoom AI Companion, Teams Copilot, Meet Gemini).** Every 2025-26
  comparison surfaced (StackNova, index.dev, usecarly, Software Rundown, Jamie) describes a single pipeline: one
  speech-to-text pass, one summary pass. Fathom is reported to use OpenAI Whisper for transcription (StackNova). No
  comparison mentions a cross-model check or a per-item confidence display. **Negative result on any verification
  feature.** The vendor disclaimers under
  [Phenomenon: AI Note-Takers Invent And Omit](#phenomenon-ai-note-takers-invent-and-omit) are the closest thing to one
- **Board portals.** Diligent ("Best Board Meeting Minutes Software 2026"; "The leading board meeting minutes software")
  drafts minutes and tracks action items with Diligent Boards AI. OnBoard has a "Minutes AI" product page. Boardable
  generates minutes from meetings held in Boardable Video. BoardPro uses AI for agendas. BoardBreeze's competitor blog
  claims "Most board portals don't generate AI minutes, and most AI minutes tools aren't board portals", that Diligent
  "doesn't convert recordings into AI-generated minutes" and that OnBoard's output is "meeting summaries and action
  lists — not formatted governance minutes with motion language and vote counts" (competitor claims, unverified). All
  are priced for corporate boards
- **Malaysian strata software.** iNeighbour (Timetec): e-payment, e-forms, notice delivery with proof, per-action
  activity logs, role permissions. No AI minutes feature surfaced. Vamos: **negative result**, no product page surfaced.
  PropertyGuru strata tools: **negative result**. StrataMax (Australia): not searched

**What they structurally cannot do.** Three properties, none of them a missing feature:

1. **A vendor cannot be its own second reader.** Otter could add a second model in a sprint, but a check run by the same
   party, on the same pipeline, with no external record of which model saw what, is a feature, not independence. Minit's
   readings come from two labs the user does not control, and the Gonka request id is a record neither lab nor Minit can
   rewrite
2. **Their business is "you do not have to read it".** A note-taker that flagged a third of its items as "one reader
   heard this" would be undermining its own promise. Minit's product is the flagged third
3. **They sell the recording, not the statutory document.** None outputs minutes shaped to paragraph 7 (signed, dated,
   resolutions listed, filed with the COB) at a price a volunteer JMB can pay. Board portals do the document but at
   corporate prices and without independent verification

## Track Fit

**Finding: honest, provided the unit of consensus is the item and disagreement is shown, not averaged.**

- **Two or more models cross-verify.** DeepSeek and MiniMax, blind to each other, each extract decisions, actions
  (owner, date) and undecided items from the same transcript. That is two independent inferences on the same question,
  which is the literal requirement
- **Explicit consensus logic.** Item-level matching, then field-level comparison (owner, date, decided-or-discussed),
  giving three states: both agree (publish), one reader only (chair confirms or drops), readers conflict (show the
  passage). The logic is the interface, not a helper. The judges' "major plus" is met on its face
- **Is it a data-quality trick?** Partly, and say so. Intersection of two extractors is a filter; if their errors are
  independent, the invented-item rate falls multiplicatively, and the one-reader list is where human attention goes. The
  honest framing is "two readers plus the chair", not "AI consensus". That framing also matches paragraph 7(5): the
  chairman's signature is what makes minutes evidence, so the chair-confirms step is the product, not a fallback
- **The matching step is itself a judgment.** If a third model matches items across the two extractions, the consensus
  becomes model-dependent again. Either use deterministic matching (embedding similarity with a threshold, shown) or
  make the matcher a third inference with its own request id and show it as a step
- **Ground truth for condition iii** (read as: a ground truth exists against which model disagreement can be settled).
  Three layers, each stronger than the last: the transcript settles "was it said"; the chair and attendees settle "was
  it decided"; paragraph 7(5) and the Tribunal settle "what does it count as". That is stronger than a fact checker's
  ground truth, which is the open web
- **Request ids per reading, per item.** Natural: each item carries two ids (three with a matcher). The share page with
  receipts is the on-chain proof surfaced in the UI

**Not verified:** GonkaRouter context length against a two-hour AGM transcript (20-30k words). Check the TRD's measured
limits before committing to whole-transcript extraction; chunking changes the consensus logic.

## Predicted Competition

**Estimate: 2 of ~30 teams ship something recognisably similar; 0-1 with a governance wedge.** Defence:

- "Meeting summariser" is the single most common LLM demo, so one or two generic ones are likely even in a social-good
  track. Neither will have item-level two-model concordance, because that is not how the brainstorm prompt shapes it
- "Strata AGM minutes" does not appear in the rubric's banned clusters, nor in the predictable-brainstorm list, nor in
  any "AI for social good Malaysia" output pattern. It is the rubric's "workflow nobody has automated because it is too
  boring"
- The real convergence risk is not other minutes tools; it is the **8-12 fact checkers** whose screens will also show
  two models agreeing or disagreeing on claims with evidence beside them. On a projector, Minit's three-column layout
  reads as "fact checker on a transcript". The judges will have seen four before ours

**Society or productivity?** As pitched to a corporate ("paste your Zoom transcript") it is a productivity tool and
loses the track. The wedge fixes it only if it leads: a volunteer committee, no secretary, a 28-day statutory clock, a
document that is evidence in court and filed with the Commissioner, and a Tribunal handling eleven thousand cases a
year. Open with the JMB chair, not with the transcript.

## Scores

| Dimension              | Weight  |  Score | One-line reasoning                                                                                                                                         |
| ---------------------- | ------- | -----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Novelty                | 25      |     18 | Convergence about 2; incumbents named with three structural gaps; second use is monthly by statute. Docked for fact-checker lookalike                      |
| Real user, real Monday | 20      |     14 | JMB chair with a 21/28-day clock and no secretary is specific and legally real. Docked because a transcript may not exist at a hall AGM in three languages |
| Track fit              | 20      |     18 | Item-level two-model concordance with three-state output is the requirement, not a bolt-on. Docked for the matcher being a hidden third judgment           |
| Demo moment            | 15      |     12 | Paste, three columns, click a flagged item, see the passage: lands in 60 seconds. Docked for looking like a fact checker at projector distance             |
| Buildability           | 20      |     16 | No data, access or partnership needed; a mock AGM transcript can be scripted. Docked for matching logic and transcript length against gateway limits       |
| **Total**              | **100** | **78** | Above 70: viable                                                                                                                                           |

## Novelty Test

1. **Convergence count: 2.** Generic meeting summarisers. What makes ours unrecognisable: the unit is a minute item with
   two request ids and a chair-confirm state, and the output is a paragraph 7 document, not a summary
2. **Incumbent test:** Otter, Fireflies, Fathom, tl;dv, Zoom, Microsoft, Google; Diligent, OnBoard, Boardable, BoardPro;
   iNeighbour. Structural gaps: a vendor cannot be its own independent reader; their promise is "do not read it" and
   ours is "read these five"; none ships the statutory document at a volunteer price
3. **Second use:** the JMB committee meets monthly and paragraph 7(2)(a) gives 21 days to post the minutes; the AGM
   minutes must accompany next year's notice under 12(3)(a). The second opening is the next committee meeting, with the
   previous minutes already in the tool as the "matters arising" input

## Kill Criteria

| Criterion                                                       | Triggered? | Why                                                                                 |
| --------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Convergence above five with execution as the differentiator     | No         | About 2                                                                             |
| Incumbent answer is "nobody does this"                          | No         | Eleven named                                                                        |
| GonkaRouter requirements fit only by adding an unneeded feature | No         | Concordance is the product                                                          |
| Demo needs more than 90 seconds of setup                        | No         | If a transcript is preloaded; paste is instant                                      |
| Buildability depends on data, access or a partnership not held  | No         | But a realistic Malaysian AGM transcript must be produced by us. Not a kill; a task |

None triggered.

## Judge Legibility

**Ten-second version: "Minutes two AIs agree happened. Anything only one heard, the chair confirms. Every line has a
receipt."** An infrastructure judge grasps that instantly and will immediately ask what the matcher is; have the answer.
Against their Reddit lead-finder reference: Minit is the same shape, a recurring job that keeps running on post-event
tokens, monthly per committee, and it is legible as a specific need ("the JMB has 28 days and no secretary") rather than
a copy of Otter. The risk for legibility is the screen, not the sentence: if it looks like a fact checker, the sentence
gets lost.

## Open Risks

1. **Transcript availability.** The product assumes Zoom, Teams or Meet produced a transcript. Many JMB AGMs are held in
   a hall, in Malay, English and Chinese, with no recording. Not verified either way; the single biggest hole.
   Mitigation to test: accept a phone recording plus a transcript from whatever the user has, or narrow the launch wedge
   to bodies that already meet online (student societies, NGO boards, hybrid MCs)
2. **Fact-checker lookalike** on the projector. Mitigation: make the artefact a minutes document with a signature line
   and a COB filing date, not a claims table
3. **The matcher.** Decide deterministic versus third-model before the TRD; it changes what "consensus" means
4. **Transcript length** against GonkaRouter context and rate limits; check the TRD's measured figures
5. **Legal weight.** Minit's output is a draft; the chair's signature makes it evidence. Frame as a feature; never claim
   the tool produces evidence

**Strongest fact:** Second Schedule paragraph 7 of the Strata Management Act 2013 makes the management committee keep
minutes, display committee minutes within 21 days and file AGM minutes with the Commissioner within 28, and makes the
signed minutes "admissible in any legal proceedings as prima facie evidence of the facts stated in them without further
proof". The cadence and the legal weight are written into the law, and the vendors themselves tell users to check the
summary before sending it.

**Biggest risk:** transcript availability. The product assumes a transcript exists, and many JMB AGMs are held in a
hall, in three languages, with no recording; nothing found this round settles it either way. Second, the three-column
screen reads as a fact checker at projector distance, which is where the sentence gets lost.

## Sources

Publisher, title, date, URL. Undated where the date was not captured.

- Laws of Malaysia, Act 757, Strata Management Act 2013, reprint (2017 upload),
  https://www.ongmaju.com/wp-content/uploads/2017/01/Strata-Management-Act-757-English.pdf (read locally; Second
  Schedule paragraphs 7 and 12, ss. 22(2) and 56(2))
- Malay Mail, "Housing and local govt minister says record 99.87pc housing and strata cases solved by tribunal in 2023",
  30 Jan 2024,
  https://www.malaymail.com/amp/news/malaysia/2024/01/30/housing-and-local-govt-minister-says-record-9987pc-housing-and-strata-cases-solved-by-tribunal-in-2023/115337
- Focus Malaysia, "A landmark case that upholds Malaysia's strata law & a stern lesson to all MC, JMB", undated,
  https://focusmalaysia.my/a-landmark-case-that-upholds-malaysias-strata-law-a-stern-lesson-to-all-mc-jmb/
- Mahwengkwai, "Challenging a Strata Management Tribunal Award in Malaysia", undated,
  https://mahwengkwai.com/challenging-strata-management-tribunal-award/
- Lowyat Forum, "Complain on JMB", undated, https://forum.lowyat.net/topic/3200536/all
- Timetec, "The JMB Committee Handover Problem", undated,
  https://www.timeteccloud.com/blog/the-jmb-committee-handover-problem/
- ResearchGate, "A Case Study of Strata Lease Schemes in Malaysia: Features and Uniqueness", 2022,
  https://www.researchgate.net/publication/366570854_A_Case_Study_of_Strata_Lease_Schemes_in_Malaysia_Features_and_Uniqueness
- REHDA Institute, "Property Industry Survey 2H 2024 & Market Outlook", April 2025,
  https://rehdainstitute.com/wp-content/uploads/2025/04/Snapshot-PIS-2H-2024-for-wesbite.pdf
- DayakDaily, "242 developments in Sarawak issued with strata titles as of May 3 this year", undated,
  https://dayakdaily.com/242-developments-in-sarawak-issued-with-strata-titles-as-of-may-3-this-year/
- CommonLII, Local Government Act 1976 consolidated text, https://www.commonlii.org/my/legis/consol_act/lga1976182/
- Zoom, "Zoom AI Performance Report 2024", 2024, https://www.zoom.com/en/resources/ai-performance-report/
- Zoom blog, "Putting AI quality first to enhance accessibility and collaboration", undated,
  https://preview.zoom.com/en/blog/ai-quality-for-accessibility-and-collaboration/
- University of Iowa ITS, "Zoom AI Companion" (reproduces Zoom's review-for-accuracy notice), undated,
  https://its.uiowa.edu/node/9381
- Microsoft Q&A, "recap permissions #copilot" and related threads (Copilot "AI-generated content may be incorrect"),
  2025-26, https://learn.microsoft.com/en-us/answers/questions/5867987/recap-permissions-copilot
- Writing Clear Science, "Zoom's AI Companion Meeting Summary was inaccurate, vague and full of errors", undated, fetch
  refused, https://www.writingclearscience.com.au/ai-meeting-summary/
- Jamie, "Zoom AI Companion Review: My Honest Feedback", 2025, competitor,
  https://www.meetjamie.ai/blog/zoom-ai-companion-review
- StackNova, "AI Meeting Summarizer Comparison 2026: 8 Tools Tested", 2026,
  https://stacknovahq.com/ai-productivity-workflows/ai-meeting-summarizer-comparison-2026
- index.dev, "Otter vs Fireflies vs Fathom: AI Meeting Note Tools Compared (2025)", 2025,
  https://www.index.dev/blog/otter-vs-fireflies-vs-fathom-ai-meeting-notes-comparison
- AI Incident Database, "AI Incident Roundup – November and December 2025 and January 2026" and "May, June, and July
  2026", https://incidentdatabase.ai/blog/incident-report-2025-november-december-2026-january/ and
  https://incidentdatabase.ai/blog/incident-report-2026-may-june-july
- Diligent, "Best Board Meeting Minutes Software 2026",
  https://www.diligent.com/resources/blog/best-ai-board-meeting-minutes and "The leading board meeting minutes
  software", https://www.diligent.com/features/boards/boards-minutes
- OnBoard, "Minutes AI | OnBoard AI Suite", https://www.onboardmeetings.com/onboard-ai/minutes-ai/
- BoardBreeze, "Best Board Portal with AI Minutes (2026 Comparison & Pricing)", 2026, competitor,
  https://appboardbreeze.com/blog/best-board-portal-ai-generated-minutes
- Timetec, "Joint Management Body Malaysia: Roles & Responsibilities" (iNeighbour features),
  https://www.timeteccloud.com/blog/joint-management-body-malaysia/
