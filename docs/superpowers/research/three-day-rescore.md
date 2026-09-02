# The three-day rescore

Every live concept in [`candidate-concepts.md`](candidate-concepts.md), rescored on 2 September 2026 against the build
window actually left, with five prior-art checks run the same day and a second opinion recorded on 3 September. This is
the Markdown mirror of the rendered report "The Three-Day Rescore", published as a private Claude artifact; this file is
the version of record.

**Method.** One evaluator scored 22 concepts on [`RUBRIC.md`](RUBRIC.md) with Buildability rebased to roughly 2.5 days.
Five prior-art searches were run by delegated agents with live web search, each under a fifteen-call budget, so a
negative result is weaker than a positive one. A second evaluator then challenged the recommendation against Round 11,
the team's experience and newly found competitors. Real User scores are reasoned, not researched with users, and are
`[ASSUMPTION]` throughout, as in the ledger. Interpretation is marked where it appears.

Contents:

1. [The verdict](#the-verdict)
1. [The second opinion](#the-second-opinion)
1. [The window](#the-window)
1. [Verified on 2 September](#verified-on-2-september)
1. [The rescore](#the-rescore)
1. [Rank 1: Vetting Room](#rank-1-vetting-room)
1. [Ranks 2 to 5](#ranks-2-to-5)
1. [Kills that hold](#kills-that-hold)
1. [How to read the ledger](#how-to-read-the-ledger)
1. [Next 72 hours](#next-72-hours)
1. [Sources](#sources)

## The verdict

The ledger's ten rounds scored buildability against nine days. About two and a half remain once the doc gate and the
submission deliverables are paid for. Rescored against that clock, one concept clears the rubric's bar of 70.

| Verdict      | Concept            | Now | Ledger                       | Why                                                                     |
| ------------ | ------------------ | --: | ---------------------------- | ----------------------------------------------------------------------- |
| **Hold**     | Vetting Room       |  74 | 85, Round 9 rank 2           | Correct when verified; the live two-model availability gate failed      |
| **Fold in**  | Same-Model-Twice   |  68 | 92, Round 8 rank 1           | The router declares substitution in a header. A feature, not a product  |
| **Fallback** | Bil Elektrik Faham |  65 | 73 as Bil Tinggi, Round 4 #3 | Only if the pick is rejected and the EEI band table is found on day one |

**Vetting Room** in one line: three models from three labs sit the exam blind before the students do. Where they
disagree with the key, or with each other, the lecturer looks. It is text-only with no external data, and it is the only
candidate whose control set and aggregate can be shown live.

The 3 September prior-art correction reduces Vetting Room's Novelty score from 18 to 12 and its pre-benchmark total from
80 to 74. No other score was raised to compensate. It still clears the rubric's numeric bar, but the mechanism test
below blocks an unconditional lock: the case now rests on whether the team accepts an asynchronous, retrying workflow
rather than the one-minute full-paper live run originally pitched.

## The second opinion

**Pre-test recommendation, 3 September 2026.** Lock Vetting Room for product documentation and stop comparing concepts
unless the mechanism benchmark fails its written kill criteria. It failed on availability and latency, although every
consensus it did reach was correct. Vetting Room therefore remains the selected concept but is on an architecture hold,
not ready for synchronous full-paper implementation. This is a second opinion on the research, not user research and not
proof that an institution will pay.

### The product in plain language

Vetting Room is a safety check for multiple-choice questions before students sit the exam. A lecturer supplies a
question and its answer key. Independent models answer the question without seeing the key or one another; the product
then compares those answers and asks the lecturer to inspect only the possible key errors and ambiguous questions.

If a Computer Science question asks which data structure follows FIFO, but the key mistakenly says **Stack**, two
independent answers of **Queue** produce **Possible key error**. The system does not change the paper or grade a
student. It gives the lecturer an early warning and leaves the decision with a person.

> **"As students, we accept losing marks when we are wrong. What feels unfair is losing marks because the exam itself
> was wrong. Vetting Room lets independent AI reviewers check each question before the paper reaches us. It flags a
> possible wrong key or a question with more than one defensible reading, shows the lecturer why, and leaves the final
> decision with them. Check the exam before the exam checks us."**

### Why this selection fits the team and the track

- **The harm is immediately understood.** Students know why one incorrect mark matters, while lecturers know the cost of
  corrections, remarking and appeals after an exam
- **The team can speak from experience.** Four Computer Science students can supply and explain a credible CS question
  set without pretending to be insurance, legal or medical experts
- **The technical requirement is the product.** Blind model answers, a fixed disagreement rule and a request ID for
  every answer are necessary to the warning, not additions made for judging
- **The input and decision rule are small.** Typed multiple-choice questions need no OCR, live search, private dataset
  or external institution. The measured gateway tail still makes a synchronous full-paper run unsafe; the team must
  choose an asynchronous queue, bounded retries and a smaller live demo before this becomes a buildability strength

### Who benefits, who uses and who pays

| Role            | First segment                                            | Value received                                                |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| **Beneficiary** | University students                                      | Fewer avoidable marks lost to a wrong key or unclear question |
| **Operator**    | Lecturer, moderator or assessment editor                 | A focused review queue before release                         |
| **Buyer**       | Department, training provider or certification publisher | Less review effort, fewer corrections and a reusable QA trail |

`[ASSUMPTION]` Willingness to pay has not been tested. Universities may already consider human vetting sufficient, and
their confidentiality rules may block unreleased papers from a decentralised network. The cleaner first commercial
segment is therefore a training provider, certification publisher or practice-question bank with recurring,
lower-sensitivity content. Universities remain the social-impact story and a later segment, not a promised first sale.

### The competitive reality

Two products are direct evidence that the problem and mechanism are not inventions; three enterprise platforms are
strong alternatives to buying another tool.

| Alternative                     | What it already does                                                                   | Honest distinction for Vetting Room                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [ExamEval][exameval-miskeyed]   | Educator-facing AI analysis can flag a likely mis-key when a key or explanation exists | Blind, separately receipted model readings and a public rule instead of one opaque result |
| [CramKit][cramkit-verify]       | Blind re-answers its own practice bank with two model families and adjudicates splits  | A lecturer brings an external paper and controls the final review                         |
| [FastTest][fasttest-item-bank]  | Secure enterprise item bank with human review stages and an audit trail                | A lightweight pre-screen rather than a full test-development platform                     |
| [Questionmark][questionmark-ai] | AI-assisted authoring, item banking and collaborative review                           | Checks an existing key through independent solvers instead of generating another draft    |
| [Elsevier][elsevier-assessment] | Nursing assessment authoring plus post-exam item analysis and regrading                | Cross-checks before students sit the paper and is not tied to one discipline              |

These differences are useful positioning, not a structural moat. Any well-resourced incumbent could copy the workflow;
Vetting Room must win this hackathon through a complete, transparent implementation and a clearer demo.

### The why-not questions

- **Why not paste the paper into ChatGPT?** A single chat is one opinion, can anchor on the supplied key and does not
  prove that independent model families reached the result. Vetting Room withholds the key during each solve, verifies
  distinct model receipts and shows disagreement instead of hiding it
- **Why not rely on the existing human vetting committee?** Keep it. Vetting Room is a first-pass risk light that lets
  the committee spend its limited attention on flagged items; it never approves the paper or overrules a reviewer
- **Why not fix the key after the exam?** Post-exam analysis can repair a score, but only after students are affected
  and staff must investigate, communicate and remark. The product moves one check before release
- **Why not use one stronger model?** One confident answer cannot reveal its own blind spot. Two or more genuinely
  distinct models create the disagreement signal, and fewer than two receipt-verified answers yields **Unverified**,
  never a verdict
- **Why not use ExamEval or copy CramKit?** ExamEval is the direct incumbent and CramKit already demonstrates the blind
  multi-family mechanism. The narrow answer is an educator-facing review of an external paper with visible Gonka Request
  IDs, receipt-verified model identity and an explicit consensus rule. Do not claim the category is new
- **Why not choose Tuntut, Round 11's 84-point leader?** Its score omitted team and judge domain fit. Its live verdict
  prompt produced zero model disagreement, while its legal, medical and privacy stakes demand expertise the team does
  not have. Vetting Room gives the team a more credible story and a cleaner, directly adjudicable demo
- **Why would anyone pay?** `[ASSUMPTION]` A recurring question-bank operator may pay to reduce reviewer time and catch
  defects before publication. That claim needs a buyer conversation; student sensitivity proves importance, not a budget
- **Why would a lecturer upload a confidential final paper?** Many should not. UiTM's own guideline calls final papers
  confidential, and decentralised node operators can see prompt plaintext. Version one must use past papers, practice
  questions and lower-sensitivity banks unless an institution explicitly approves otherwise

### The mechanism benchmark — failed 3 September

**Method.** Twelve typed CS questions: eight clean controls, two deliberately mis-keyed items and two deliberately
ambiguous items. MiniMax and Kimi answered each item blind twice with a cache-busting nonce, `X-Gonka-No-Fallback: true`
and a 90-second evidence cutoff. Every admitted reading had a public receipt whose served model matched the requested
model. The answer key stayed local until classification.

Two preliminary runs were rejected as invalid rather than counted against the product. Putting all twelve items in one
prompt made all three models exceed 30 seconds, reproducing the known long-prompt failure. Sending 36 item-level calls
at once then returned
`{"error":{"code":"rate_limited","message":"too many concurrent requests for this account; lower your parallelism and retry"}}`
across the account. The valid run processed two questions at a time, four concurrent calls, which the gateway accepted.

| Result                                     | Pass 1    | Pass 2    | Acceptance threshold                |
| ------------------------------------------ | --------- | --------- | ----------------------------------- |
| Receipt-verified two-model item verdicts   | 10 of 12  | 3 of 12   | 12 of 12 in both passes             |
| Clean: correct / false flag / unverified   | 8 / 0 / 0 | 1 / 0 / 7 | At most one false flag; none absent |
| Mis-keyed: correct / unverified            | 2 / 0     | 1 / 1     | 2 / 0 in both passes                |
| Ambiguous: correct / unverified            | 0 / 2     | 1 / 1     | 2 / 0 in both passes                |
| Items with two verified models within 30 s | 0 of 12   | 0 of 12   | 12 of 12 in both passes             |
| MiniMax receipt-verified completions       | 12 of 12  | 12 of 12  | Supporting evidence                 |
| Kimi receipt-verified completions          | 10 of 12  | 3 of 12   | Supporting evidence                 |

**Accuracy finding.** All 13 item verdicts that obtained two distinct receipts matched the planted state, and no clean
item was falsely flagged. The two verified mis-key verdicts in pass 1 independently chose **Queue** over the planted
**Stack** key and **domain-to-IP translation** over the planted **encryption** key for the same reasons. MiniMax also
identified both ambiguous controls in pass 1, but Kimi timed out, so the fail-closed rule correctly returned
**Unverified** rather than counting one opinion twice.

Two publicly queryable examples preserve the evidence: pass 1's DNS key error used MiniMax request
`req-1788368110223424388-206439` and Kimi request `req-1788368110204753015-206436`; pass 2's application-layer ambiguity
used MiniMax request `req-1788368796315365277-209871` and Kimi request `req-1788368796379822838-209881`.

**Latency and availability finding.** MiniMax completed 24 of 24 calls, but only 13 inside 30 seconds; successful calls
ranged from 14.3 to 73.8 seconds. Kimi completed 13 of 24, none inside 30 seconds; successful calls ranged from 35.1 to
82.7 seconds. Separate one-item health probes returned an upstream `429` and then a 90-second timeout from DeepSeek, so
it could not replace Kimi during this window.

**Verdict: failed.** The classification rule is promising, but the written gate required every planted defect to reach
its intended state in both passes and two verified models inside 30 seconds. Neither happened. The evidence supports an
asynchronous review queue with bounded retries and an **Unverified** state; it does not support the original synchronous
full-paper demo. Choosing that architecture changes the demo and needs team approval before `PRODUCT.md` is written.

## The window

The rubric scores Buildability as "nine days, our team". Round 4 argued in terms of five. Today is Tuesday 2 September.
What is actually left, once the things that are not build work are subtracted:

| Item                                                                                                         | Cost           | Why it cannot be skipped                                                 |
| ------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| `PRODUCT.md` and `PRD.md`                                                                                    | 3 to 4 h       | The gate is binary. Neither exists, and AGENTS.md forbids code first     |
| Deployed URL, README on the integration, deck with five required sections, 2-minute video, socials, Devfolio | most of 5 Sept | No Devfolio submission means no pitching. The deck sections are mandated |
| **Build**                                                                                                    | **≈ 2.5 days** | 3 Sept, 4 Sept and the morning of 5 Sept, for a team of two to four      |

So the question is no longer "which concept wins in nine days". It is: **which concept ships as a deployed, working demo
in two and a half days**, including the call layer [`../../TRD.md`](../../TRD.md) already specifies: the no-fallback
header, the receipt check, the request-id record and reasoning-tag stripping. Three things lose most of their
buildability points under that clock:

- Vision on the critical path. Kimi is the only model that can see, and it was timing out on roughly four requests in
  five when the research was written on 30 and 31 August
- A scraped or fetched data source the team does not already hold
- A live web-search round trip inside the demo

## Verified on 2 September

Each check was run by a delegated agent with live web search. Every product named was returned by a search; negative
results are stated as negative. Full citations are in [Sources](#sources).

### Vetting Room: prior art and institutional practice

**Correction, 3 September: AI exam vetting and blind multi-model review both have prior art.**
[ExamEval][exameval-miskeyed] says its educator-facing analysis can check whether a mis-key is likely when a correct
answer or explanation is supplied. [CramKit][cramkit-verify] blind re-answers its own certification practice questions
with two model families, holds back any disagreement, sends flags to a third adjudicator and retains human review for
unresolved cases. The earlier claim that no product sits the paper was false.

**The narrower product surface remains distinct, but not defensible as a moat.** CramKit describes an internal quality
pipeline for its own question bank, while Vetting Room accepts a lecturer's external paper and makes each model reading,
request ID, receipt check and fixed decision rule visible. ExamEval's cited public pages do not describe independent
model families or per-inference provenance. Both incumbents could add those features; the pitch must say "receipt-backed
pre-vetting for your paper", never "the first AI to check an exam".

**The mechanism exists in research.** [Amiri-Margavi et al.][arxiv-2411-16797] use inter-model consensus across four
models to judge answer reliability and question ambiguity, on LLM-generated questions with no key. A medRxiv paper of 4
May 2026 uses multi-LLM disagreement to find human annotation errors in clinical data `[NEEDS SOURCE]` for the URL. No
paper was found that runs multiple solvers against a real answer key to flag mis-keyed exam items.

**Vetting is real and named.** UiTM's final-examination guideline says every question paper must be vetted thoroughly by
the faculty's Examination or Vetting Committee, and also calls final papers confidential documents
([UiTM][uitm-vetting]). Vetting committees are also documented at UniSZA (a two-level structured procedure), UMT
(guideline dated 5 March 2019), UPSI, UMPSA and USIM.

MQA's "Guidelines to Good Practices: Assessment of Students" (2019) is summarised as requiring internal and external
vetting; the PDF body was unparsable, so that is `[NEEDS SOURCE]`. No confirmed public answer-key error was found; the
Examinations Syndicate denied SPM Biology errors in December 2018.

### Tawaran Uni Sah: problem evidence and incumbent

**The evidence is thin.** One Universiti Malaya warning about fake offer letters, [Berita Harian, August
2017][bharian-um]. Adjacent cases are a job scam using UM's name (Malay Mail, 20 February 2018) and a fake RM4,000
scholarship with a RM200 upfront fee (Kosmo, 5 January 2023). No case of a family paying a deposit on a fake admission
offer was found, and nothing since 2023. No MOHE, UPU or PDRM statement was found.

**The official channel already does the job.** The [UPU portal][upu] offers an applicant login, "Semakan Keputusan", and
the [MyUPU guide][myupu] describes printing the offer from UPUOnline. UPU publishes no dataset, API or fee table. EMGS
checks MQA accreditation for international students, not letter authenticity. No student-side verification product
exists; [Qryptal][qryptal] sells issuer-side signed-QR offer letters, with no Malaysian client.

### Bil Elektrik Faham: tariff sources and incumbent

**The tariff is not officially printed anywhere fetchable.** Component rates are consistent across
[paultan.org][paultan-tariff], SoyaCincau and Lowyat, but [TNB's tariff page][mytnb-tariff] offers only a quick-guide
download, and the Suruhanjaya Tenaga press release PDF returned 404. The Energy Efficiency Incentive band table, which
applies to every household under 1,000 kWh, was not found in any source.

| Component                   | Figure, press-sourced                                       | Official page found        |
| --------------------------- | ----------------------------------------------------------- | -------------------------- |
| Energy charge               | 27.03 sen/kWh up to 1,500 kWh; 37.03 above                  | No                         |
| Capacity charge             | 4.55 sen/kWh                                                | No                         |
| Network charge              | 12.85 sen/kWh                                               | No                         |
| Retail charge               | RM10 per month, waived at or below 600 kWh                  | No                         |
| Automatic Fuel Adjustment   | 0.00 in July 2025; −1.45 in August 2025; +3.59 in July 2026 | Monthly, Single Buyer site |
| Energy Efficiency Incentive | Up to 25 sen/kWh below 1,000 kWh, sliding; bands not found  | No                         |
| Service tax                 | 8%; the 600 kWh threshold not found in any fetched text     | No                         |
| KWTBB levy                  | 1.6%, except domestic at or below 300 kWh                   | No                         |

`[NEEDS SOURCE]` Every figure above needs the official quick guide before it goes on a slide or into a recomputation.

**TNB itemises bills since 1 July 2025** (Malay Mail, 1 July 2025), and lists a bill calculator; third-party calculators
exist at paultan.org, getsolar.ai and calculatormalaysia.com. No photo-to-recompute-to-explain tool was found, Malaysian
or generic beyond bill-checker apps. TNB has twice had to deny viral fake tariff schedules (FMT, 5 June 2025; Malay
Mail, 2 April 2026, with an MCMC complaint) and blamed a myTNB app glitch for high readings (Malay Mail, 8 July 2025).

### Hound: prior art, search and ethics

**Not a product anywhere.** The attacker-and-rewrite loop exists only as papers and research code. [AURA][aura] (29
May 2026) runs its search attacker once and calls an agentic attacker in every rewrite round "impractical". The nearest
tools are username-based dossier scripts and local disclosure-detection extensions, which are the redaction class.

**Search is unverified through the gateway.** Moonshot's own API exposes a server-side [`$web_search`
builtin][kimi-search] at $0.005 per successful call; GonkaRouter's docs never mention it, and the "Search" badge on its
models page is untested. Without it the attacker needs an external search API, which runs off-gateway.

**The field's norm is to withhold the agent.** [Lermen et al.][lermen] (25 February 2026): "do not publish the agent,
exact prompts, or tool configurations". Provider policies ban identifying private individuals; GeoSpy closed public
access after press contact in January 2025. The hackathon requires publishing the repo.

### Model Changelog and Same-Model-Twice: attestation and gateways

**Substitution is already self-declared.** [GonkaRouter's docs][gonkarouter-docs] state that a substitution is never
silent, a header names the requested and served model, and the receipts endpoint needs no auth at 60 calls per minute
per IP. Same-Model-Twice therefore re-checks what the router announces. Phala's RedPill gateway already publishes
[signed, unauthenticated per-request receipts][redpill] naming the served model; every mainstream gateway gates logs by
account key, and [Lin et al.][lin-substitution] found silent substitution across ten of them.

**Governance-pinned commits have no exact match.** [Tinfoil][tinfoil] binds a HuggingFace commit's weight hash into TEE
attestation, off-chain and ungoverned; Allora hashes model fingerprints on-chain; no network was found pinning served
models to commits by public vote. Gonka's `hf_commit` field is real, in `model.proto`, and its FAQ records Qwen3-235B
retired by proposal 78. Model Changelog's novelty holds; its track fit does not.

### Not verified: two facts that block the call layer

Two things every candidate depends on could not be measured, because no key was exported in the session shell and `.env`
is on the permissions deny list: **Kimi's vision success rate today**, and **whether `x-request-id` survives a streamed
response**, the ledger's open question 1. `[ASSUMPTION]` The two probes below are unrun; whether the OpenAI surface
accepts `image_url` content parts is itself untested.

```shell
# Does the request id arrive on a streamed response? Headers only, body discarded.
curl -sD - -o /dev/null https://api.gonkarouter.io/v1/chat/completions \
  -H "Authorization: Bearer $GONKA_API_KEY" -H "content-type: application/json" \
  -H "X-Gonka-No-Fallback: true" \
  -d '{"model":"deepseek-ai/DeepSeek-V4-Flash-0731","max_tokens":1024,"stream":true,
       "messages":[{"role":"user","content":"Reply with just: pong"}]}' | grep -i -E 'x-request-id|x-gonka'
```

```shell
# Five vision calls to Kimi with any small PNG. Count the 200s and read the times.
IMG=$(base64 < any-small.png | tr -d '\n')
printf '{"model":"moonshotai/Kimi-K2.6","max_tokens":1024,"messages":[{"role":"user","content":[{"type":"text","text":"What colour is this image? One word."},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' "$IMG" > vision.json
for i in 1 2 3 4 5; do
  curl -s -m 90 -w '\nHTTP %{http_code} in %{time_total}s\n' https://api.gonkarouter.io/v1/chat/completions \
    -H "Authorization: Bearer $GONKA_API_KEY" -H "content-type: application/json" \
    -H "X-Gonka-No-Fallback: true" -d @vision.json
done
```

## The rescore

Weights are the rubric's: Novelty 25, Real User 20, Track Fit 20, Demo 15, Buildability 20. Under 70 is a no.
Buildability is scored against 2.5 days. Real User is capped at 8 where the honest second-use answer is "they probably
wouldn't". "Prev" is the ledger's last recorded total where one exists; Rounds 8 and 9 used different column names, so
those totals were never comparable with these. Concepts the ledger already killed on evidence were not rescored.

|   # | Concept             | From   | Prev | Nov | User | Fit | Demo | Build | Total | Verdict  |
| --: | ------------------- | ------ | ---: | --: | ---: | --: | ---: | ----: | ----: | -------- |
|   1 | **Vetting Room**    | R9 #2  |   85 |  12 |   15 |  18 |   12 |    17 |    74 | Hold     |
|   2 | Hound               | R9 #1  |   94 |  23 |   12 |  17 |   13 |     6 |    71 | No       |
|   3 | Due Process         | R9 #4  |   77 |  17 |   10 |  18 |    9 |    14 |    68 | No       |
|   4 | Same-Model-Twice    | R8 #1  |   92 |  14 |    6 |  20 |   10 |    18 |    68 | Fold in  |
|   5 | Bil Elektrik Faham  | R10 #2 |   73 |  12 |   15 |  16 |   12 |    10 |    65 | Fallback |
|   6 | Bahasa Nenek        | R7 #1  |    — |  20 |    9 |  14 |    8 |    12 |    63 | No       |
|   7 | Lying Roundabout    | R7     |    — |  16 |    6 |  13 |   13 |    14 |    62 | No       |
|   8 | Who's Your AI       | R9 #5  |   83 |  14 |    5 |  12 |   13 |    18 |    62 | No       |
|   9 | Beat The Blind      | R9 #3  |   85 |  15 |   10 |  16 |   13 |     8 |    62 | No       |
|  10 | Model Changelog     | R4 #1  |   83 |  18 |    8 |  12 |   10 |    13 |    61 | No       |
|  11 | Mutation Mail       | R7     |    — |  14 |    4 |  14 |   12 |    17 |    61 | No       |
|  12 | Missing 2%          | R4 #5  |   71 |  10 |   14 |   9 |   11 |    17 |    61 | No       |
|  13 | Resit Check         | R4 #4  |   73 |  12 |   13 |  13 |   11 |    11 |    60 | No       |
|  14 | MLM Kenal           | R7     |    — |   8 |   12 |  12 |   12 |    15 |    59 | No       |
|  15 | Show Me The Machine | R8 #2  |   81 |  16 |    7 |  13 |    8 |    12 |    56 | No       |
|  16 | Ubat Mak            | R10 #3 |    — |   6 |   14 |  15 |   12 |     7 |    54 | No       |
|  17 | Router Weather      | R8 #5  |   78 |  10 |    7 |  12 |    8 |    17 |    54 | No       |
|  18 | The Effort Audit    | R8 #4  |   77 |  14 |    8 |  10 |    8 |    12 |    52 | No       |
|  19 | Tawaran Uni Sah     | R10 #1 |    — |  11 |    7 |  15 |   10 |     7 |    50 | No       |
|  20 | Saman Sah Ke?       | R10 #4 |    — |   6 |    9 |  14 |   10 |    10 |    49 | No       |
|  21 | Unreceipted         | R8 #3  |   78 |  15 |    5 |   8 |    7 |    12 |    47 | No       |
|  22 | Cek Dividen KWSP    | R10 #5 |    — |   7 |    8 |   8 |    7 |    16 |    46 | No       |

### Why each row landed where it did

- **Vetting Room.** Text-only, no external data, the rule is the product, control and aggregate demonstrable live. Its
  weakness is a nod rather than a gasp, and plaintext exposure of unreleased papers
- **Hound.** Clears 70 and still fails: search through the gateway is unverified and an off-gateway search API trips
  kill criterion 5; publishing the attacker conflicts with the field's norm, and the repo is a required deliverable
- **Due Process.** The same shape as the pick with a weaker demo. It needs a community and an appeal to exist first, and
  nothing on stage adjudicates who was right
- **Same-Model-Twice.** Fit is perfect because it is the requirement itself. The router self-declares substitution, the
  TRD already mandates the check, and RedPill publishes signed receipts. Its users are other teams, for three days
- **Bil Elektrik Faham.** A real monthly need and a demonstrable ChatGPT failure, but the ground truth is not officially
  printed, the EEI table is missing, TNB already itemises, and photos put Kimi on the critical path
- **Bahasa Nenek.** The mechanism is unoccupied, but nothing on stage can adjudicate Penang Hokkien and the models'
  dialect competence is unmeasured. A queue is a quiet demo
- **Lying Roundabout.** A game about model identity, not cross-verification of anything. Fun, and not AI for Society
- **Who's Your AI.** The best single demo beat in the ledger and nothing to open on Monday. Steal the beat: the receipt
  reveals the machine
- **Beat The Blind.** A real-time multiplayer game with Kimi vision on the critical path, in 2.5 days. Kahoot is the
  incumbent
- **Model Changelog.** Novelty survived the search, but the models are the subject rather than the verifiers, so
  consensus logic would be bolted on: kill criterion 3. Infrastructure, not society
- **Mutation Mail.** A demonstration of information loss, watched once
- **Missing 2%.** A statutory-rate calculator wearing three models. Buildable in a day, which is the problem
- **Resit Check.** The spec's legal bug, the conflicting SST rate and the CAPTCHA on the registry are all unresolved
- **MLM Kenal.** Inside the scam-checker cluster, the most crowded line in the track at eight predicted teams
- **Show Me The Machine.** Needs an institution on the other side of the receipt. None will be there on Sunday
- **Ubat Mak.** A wrong dose is real harm; the ledger's own pressure test removed the dialect claim, and what remains is
  a saturated label reader
- **Router Weather.** A dashboard, which the ledger rejected five times for good reason
- **The Effort Audit.** Both parties to the invoice must be on the network. No claim is cross-verified, only a token
  count
- **Tawaran Uni Sah.** Round 10's pick fails the check it never ran: thin evidence, UPU login already shows the real
  offer, no data source, one use per life, and the scam cluster next door
- **Saman Sah Ke?** Scam-checker cluster; the fine schedule can be hardcoded, so the models decorate
- **Unreceipted.** No reasoning step at all, so requirements 2 and 4 cannot be met
- **Cek Dividen KWSP.** Annual, dull, a calculator. The ledger's own words were "safest and dullest"

Two rows need a reading note. **Hound** is the only concept besides the pick above 70, and it is a no anyway, because
the rubric's kill criteria are absolute. It is the strongest post-hackathon idea in the ledger. **Same-Model-Twice**
scores a perfect 20 on fit because it is the track requirement itself; that is exactly why it belongs inside the product
rather than being the product.

## Rank 1: Vetting Room

> **"Paste the paper and the key. Three models from three labs sit it blind. Where they disagree with your key, or with
> each other, you look. Everything else passes."**

Malaysian universities already run a human version of this: a vetting committee of at least two colleagues reads every
final paper before it is set. That committee is the institution's only defence against a mis-keyed item, which takes a
mark from every student who answered correctly, and against an ambiguous stem, which turns a test of knowledge into a
test of guessing the setter.

Vetting Room makes the second opinion cheap and independent, and leaves the decision with the lecturer.

### Why the four requirements are the mechanism, not a costume

- **All reasoning on GonkaRouter.** Every solve is a gateway call. There is no other inference in the product
- **Two or more models cross-verifying.** Three solvers from three labs is the product. The research's own number
  applies: error correlation is about 0.40 for one model resampled and about 0.08 across model families, per
  [`disagreement-as-product.md`](disagreement-as-product.md), and the value of a second opinion is entirely that gap
- **Request IDs per step.** Each item shows three request ids and devshard ids, plus a receipt check that the models
  that answered were distinct. That is Same-Model-Twice, folded in as a feature
- **Explicit consensus logic.** The divergence rule below is fixed before any answer is seen and printed on the screen.
  It is the whole interface

### The divergence rule, written before the answers are seen

| Pattern across the verified solvers                                      | Verdict            | What the lecturer sees                                          |
| ------------------------------------------------------------------------ | ------------------ | --------------------------------------------------------------- |
| All match the key                                                        | Pass               | Nothing. It stays quiet                                         |
| Two or more agree with each other, not with the key, for the same reason | Possible key error | The solvers' shared answer and their reason, beside the key     |
| Solvers split, and give different defensible readings of the stem        | Ambiguous          | The readings side by side, with the words each solver leaned on |
| Fewer than two receipt-verified distinct models answered                 | Unverified         | No verdict, ever. The item is re-queued                         |

The "same reason" condition on key errors matters. Two models sharing a popular misconception will agree and be wrong
together; requiring the same rationale and showing it keeps the flag honest, and the interface calls every flag a
review, never a verdict.

### The demo, in the three beats the research prescribes

| Time         | On screen                                                                                                                                  | What it proves                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 0:00 to 0:20 | A 20-item past-year paper pasted with its key. Run. Three models answer every item in parallel; request ids render as they land            | The pipeline is real and fast                                                                       |
| 0:20 to 0:40 | Seventeen items pass silently. Three flag. Open the ambiguous one: two models read "which of the following is not" one way, one the other  | Neither model is obviously wrong. A single model would have been confident                          |
| 0:40 to 0:60 | The control and the aggregate: zero flags on clean items, all three planted defects caught. Then one item's receipts: two different models | The flag is a working risk light, not an always-on alarm, and the second opinion is another machine |

The aggregate needs a labelled set. Planting three known defects in a real 20-item paper is cheap and honest; say on
stage that they were planted.

### The 2.5-day cut

#### What ships

- Paste multiple-choice items with a key, or upload a text file
- The call layer per TRD section 4: no-fallback header, receipt check, reasoning-tag stripping, one provenance record
  per call
- Three blind solvers per item, in parallel, answers normalised to a schema before comparison
- The four-outcome rule, printed on screen
- Paper view with a chip per item; item view with the three readings and their request ids
- Deferred hedge on Kimi: a second copy after about two seconds; a two-of-three verdict is shown as two-of-three
- A seeded 20-item paper for the demo

#### What is cut, and said so

- Photographed papers. Vision is Kimi-only and unreliable
- The leak scout that searches Chegg and Quizlet. Kimi's search builtin is unverified through the gateway
- Arithmetic verification through a calculator tool on MiniMax. A stretch if day two is clean
- Short-answer and essay items with rubrics
- LMS integration, accounts, history

### Weaknesses to say before a judge asks

- **Unreleased papers on a decentralised network.** Node operators can see plaintext. Version one is for question banks
  and past-year papers; live final papers are a faculty policy decision. No account links a request to a lecturer, and
  receipts never carry the prompt. State this in the first minute
- **"I can paste my paper into ChatGPT."** One model shown the key anchors on it and rationalises. Solvers that never
  see the key or each other, from three labs, with a rule fixed in advance, is a second-opinion design, and the
  aggregate bar shows the difference
- **Easy papers are all-pass.** Strong models make the tool quiet on undergraduate basics. That is the control working,
  but the demo needs a hard paper
- **The base design is symmetric.** Three text solvers are interchangeable, which
  [`multi-model-capability.md`](multi-model-capability.md) calls variance rather than structure. The value is
  decorrelation and the pattern rule, not capability asymmetry; the calculator tool and the leak scout are the
  asymmetries, and they are stretches
- **Models are not students.** An item can be clear to a model and ambiguous to a nineteen-year-old. The tool flags one
  class of defect, key errors and structurally ambiguous stems, and says that it does not measure difficulty or
  discrimination
- **Text only.** Diagram and circuit items are out until vision is dependable

### The novelty test, answered

- **Convergence count: zero to one** of about thirty teams. The predicted field in
  [`competitor-scan.md`](competitor-scan.md) is consumer checkers with a phone; a lecturer-side exam QA tool remains an
  unlikely hackathon duplicate, but it is an existing product category
- **Direct incumbent: ExamEval. Mechanism incumbent: CramKit.** ExamEval can flag a likely mis-key, and CramKit already
  blind re-answers with two model families. Vetting Room's narrower distinction is external-paper intake with visible,
  receipt-verified model identity and a fixed four-state rule. That is useful and demoable, but incumbents could copy it
- **Second use:** the same lecturer, three weeks later, with the next quiz and the bank they revised after the first
  flags

### Against the official rubric

- **Technical Implementation, 30.** A complete pipeline with fan-out, receipt-verified distinctness, normalisation,
  hedging and a printed rule, demonstrable end to end
- **Practicality and Impact, 30.** A specific, named, recurring need with an existing institutional practice. The
  audience is lecturers rather than the vulnerable public the track's examples name; say that plainly
- **Presentation and Clarity, 20, and UX and Design, 10.** A list with chips is easy to make excellent and hard to make
  loud
- **Originality.** Moderate. The category and blind multi-family mechanism have prior art; transparent Gonka receipts
  and an educator-controlled review surface are the track-specific distinction

## Ranks 2 to 5

### Hound, 71

Still the most original concept in the ledger, and the search confirmed nobody ships it. It fails on the clock: the
attacker needs web search, Kimi's builtin is unverified through the gateway, and an external search API is access the
team does not have. It also fails on publication: the field's norm is to publish findings and withhold the agent, and
the repo is a required deliverable. Keep it for after Demo Day.

### Due Process, 68

The same shape as Vetting Room, with the rule-defect verdict as its elegant third outcome. It loses on demo: no
community, no appeal, and nothing on stage that later adjudicates who was right. If Vetting Room is rejected for the
confidentiality concern, this is the same architecture on a text nobody needs to keep secret.

### Same-Model-Twice, 68

The router declares substitution in a header, the TRD already requires the receipt check, and RedPill has published
signed receipts since before this hackathon. As a product it is a monument to a header. As the slide in "how it works",
it is the strongest technical proof any team in this track can show: two different machines, verifiable by anyone, per
item.

### Bil Elektrik Faham, 65

The need is real and monthly, and the ChatGPT-from-memory failure is genuinely demonstrable: a model answering from its
weights applies the abolished tiers.

But no official page prints the tariff, the Energy Efficiency Incentive table that decides most households' bills could
not be found, TNB has itemised bills since July 2025, and every photo goes through Kimi. Take it only if the team
rejects the pick, with typed input as the primary path and the incentive table in hand by the end of day one.

## Kills that hold

Thirteen kills stand and none is worth reviving. Each was killed on evidence rather than taste, and the evidence has not
changed:

- **Frozen Friend.** Proposal 87 removed the model it would pin to
- **You Decide.** No public testnet, and the vote is the concept
- **Dua Keping.** RipCheck, CartLens, a granted patent, and a single model that caught the planted discrepancy anyway
- **Servis Apa Ni.** No public per-variant service-schedule dataset exists
- **Relief Saya.** Liability against the user
- **Liar's Court.** No cheating slashes exist
- **Who Holds Your Words.** One entity holds 71% of collateral
- **The Model Morgue.** Corpus verified but thin
- **Check The Label.** Honest, buildable, low hook
- **Nothing To Revoke.** Undone by its own Q&A
- **AI On Paper.** Both halves are commodities
- **Receipt N3.** A monument to absence
- **The Missing Stair.** Single model

## How to read the ledger

- **The rounds are not comparable.** Rounds 8 and 9 scored Hook and 3-Model where the rubric says Novelty and Fit, and
  their ranks were not sorted by total; the file admits the override rationale was never recorded. A 94 in Round 9 and
  an 83 in Round 4 are not on one scale
- **Round 10 has no numbers.** It reweighted for social benefit without scoring against the instrument, and its rank 1
  carried an explicit note that no prior-art check had been run. The check above kills it
- **Buildability was scored for five to nine days everywhere.** Rebased to 2.5, the field collapses to one concept above
  70
- **Round 10's shape puts the least reliable component on the critical path.** Every candidate in it starts with a
  photograph, which means Kimi, the model the research itself measured at roughly four timeouts in five
- **The pendulum.** Rounds 4 to 9 optimised Novelty, the one criterion the organizers leave unweighted. Round 10
  overcorrected into the banned clusters. The pick above is the one concept that scores on both halves
- **Two open questions block the call layer regardless of concept:** whether the request id survives streaming, and
  Kimi's reliability today. Both are two curl commands away

## Next 72 hours

1. **Tonight.** Lock the concept on a team call. Then write `PRODUCT.md` and `PRD.md`, with the 2.5-day cut above as the
   scope ladder. Nothing else can start before both exist
2. **Tonight, five minutes.** Run the two probes with the key in the shell. If the request id is missing on streamed
   responses, the app does not stream. If Kimi is still failing four in five, the deferred hedge is not optional
3. **3 September.** The call layer first, exactly as TRD section 4 specifies, returning one provenance record per call.
   Then the rule, the seeded paper and the paper view
4. **4 September.** Item view, the control and aggregate, hedging, deploy, and the `DESIGN.md` pass. Freeze features at
   the end of the day
5. **5 September.** README on the GonkaRouter integration, deck with the five required sections, the 2-minute video,
   socials, Devfolio before 23:59. Dispatch `pitch-smith` the moment the build is frozen

## Sources

Accessed 2026-09-02 unless an entry says otherwise.

- Amiri-Margavi et al., "Enhancing Answer Reliability Through Inter-Model Consensus of LLMs", arXiv 2411.16797, v2 24
  February 2025: <https://arxiv.org/abs/2411.16797>
- "Multi-LLM Disagreement as a Scalable Detector of Human Annotation Errors in Structured Data from Clinical Free-Text",
  medRxiv, 4 May 2026 `[NEEDS SOURCE]` for the URL
- ExamEval, "Miskeyed Answer, Item Writing Flaws": <https://www.exameval.com/articles/flaws/miskeyed-answer>
- CramKit, "How CramKit verifies every question", accessed 2026-09-03: <https://cramkit.com/how-we-verify>
- UiTM, "Guidelines on Preparation of Final Examination Questions Papers", accessed 2026-09-03:
  <https://fskm.uitm.edu.my/v4/images/quality/proseduroperasi/PKO09-Penyediaan-Kertas-Soalan-Peperiksaan-Akhir.pdf>
- Assessment Systems Corporation, "Enterprise Item Bank Software for Stronger Assessment", accessed 2026-09-03:
  <https://assess.com/item-banking/>
- Questionmark, "Online Exam Test Software & Exam Authoring", accessed 2026-09-03:
  <https://www.questionmark.com/platform/flexible-authoring/>
- Elsevier, "Elsevier's Assessment Builder", accessed 2026-09-03:
  <https://www-prod.elsevier.com/products/elseviers-assessment-builder>
- UMT, "Garis Panduan Penyediaan Kertas Soalan Peperiksaan Akhir", 5 March 2019; UniSZA structured vetting procedure,
  ResearchGate; MQA "Guidelines to Good Practices: Assessment of Students", 2019, PDF body unverified
- Berita Harian, "Jangan terpedaya surat tawaran palsu, UM", August 2017:
  <https://www.bharian.com.my/berita/nasional/2017/08/310508/jangan-terpedaya-surat-tawaran-palsu-um>
- Malay Mail, "Beware of job scam using UM's name", 20 February 2018:
  <https://www.malaymail.com/news/malaysia/2018/02/20/beware-of-job-scam-using-ums-name/1581859>
- Kosmo, "Dakwa diugut sindiket tawar biasiswa palsu", 5 January 2023:
  <https://www.kosmo.com.my/2023/01/05/dakwa-diugut-sindiket-tawar-biasiswa-palsu/>
- UPU portal, fetched 2 September 2026: <https://upu.mohe.gov.my/>; MyUPU, "Cara semak keputusan UPU":
  <https://myupu.my/panduan/cara-semak-keputusan-upu/>; MQA register:
  <https://www2.mqa.gov.my/mqr/english/eakrbyipta.cfm>; EMGS guidelines:
  <https://visa.educationmalaysia.gov.my/guidelines>
- Qryptal, "Ensuring Secure Admissions", 14 May 2024:
  <https://www.qryptal.com/blog/generating-verifiable-admission-offer-letters-for-students/>
- paultan.org, "TNB new electricity tariff calculation from July 2025", 21 June 2025:
  <https://paultan.org/2025/06/21/tnb-new-electricity-tariff-calculation-from-july-2025/>; SoyaCincau, 21 June 2025:
  <https://soyacincau.com/2025/06/21/tnb-domestic-electricity-tariff-structure-july-2025-impact-changes/>
- Suruhanjaya Tenaga, "Jadual elektrik baharu", search summary only:
  <https://www.st.gov.my/jadual-elektrik-baharu-lebih-236-juta-pengguna-domestik-semenanjung-nikmati-kadar-lebih-adil>
- TNB tariff page, quick-guide download only: <https://www.mytnb.com.my/tariff>; bill calculator, inputs not rendered:
  <https://www.mytnb.com.my/residential/understand-your-bill/bill-calculator>
- Malay Mail, "New TNB itemised electricity bills will help consumers better understand, manage energy use", 1 July
  2025; "TNB says high consumption rates seen on myTNB app due to glitch", 8 July 2025; "TNB denies viral claims of
  April electricity tariff hike, lodges complaint with MCMC", 2 April 2026. FMT, "Viral tariff schedule is fake, says
  TNB", 5 June 2025
- Li, Wen and Li, "AURA", arXiv 2605.30848, 29 May 2026: <https://arxiv.org/abs/2605.30848>
- Moonshot AI, "Use Kimi API's Internet Search Functionality": <https://platform.kimi.ai/docs/guide/use-web-search>;
  pricing: <https://platform.kimi.ai/docs/pricing/tools>
- Lermen et al., arXiv 2602.16800, 25 February 2026: <https://arxiv.org/abs/2602.16800>; Joseph Cox, 404 Media, on
  GeoSpy, 20 January 2025
- GonkaRouter docs, receipts endpoint and substitution header: <https://gonkarouter.io/docs>; gonka-ai/gonka,
  `inference-chain/proto/inference/inference/model.proto`; Gonka FAQ, proposal 78: <https://gonka.ai/docs/FAQ>
- Tinfoil, "How Tinfoil Proves Exactly What Model Is Running", 3 February 2026: <https://tinfoil.sh/blog>; Dstack-TEE
  private-ai-gateway receipts: <https://github.com/Dstack-TEE/private-ai-gateway>
- Lin et al., arXiv 2604.21083, silent model substitution across ten gateways, 22 April 2026:
  <https://arxiv.org/abs/2604.21083>
- OpenRouter, generation lookup requires an API key: <https://openrouter.ai/docs/api-reference/get-a-generation>
- Error-correlation figures, arXiv 2601.22290 via [`disagreement-as-product.md`](disagreement-as-product.md):
  <https://arxiv.org/html/2601.22290v1>

[exameval-miskeyed]: https://www.exameval.com/articles/flaws/miskeyed-answer
[cramkit-verify]: https://cramkit.com/how-we-verify
[uitm-vetting]:
  https://fskm.uitm.edu.my/v4/images/quality/proseduroperasi/PKO09-Penyediaan-Kertas-Soalan-Peperiksaan-Akhir.pdf
[fasttest-item-bank]: https://assess.com/item-banking/
[questionmark-ai]: https://www.questionmark.com/platform/flexible-authoring/
[elsevier-assessment]: https://www-prod.elsevier.com/products/elseviers-assessment-builder
[arxiv-2411-16797]: https://arxiv.org/abs/2411.16797
[bharian-um]: https://www.bharian.com.my/berita/nasional/2017/08/310508/jangan-terpedaya-surat-tawaran-palsu-um
[upu]: https://upu.mohe.gov.my/
[myupu]: https://myupu.my/panduan/cara-semak-keputusan-upu/
[qryptal]: https://www.qryptal.com/blog/generating-verifiable-admission-offer-letters-for-students/
[paultan-tariff]: https://paultan.org/2025/06/21/tnb-new-electricity-tariff-calculation-from-july-2025/
[mytnb-tariff]: https://www.mytnb.com.my/tariff
[aura]: https://arxiv.org/abs/2605.30848
[kimi-search]: https://platform.kimi.ai/docs/guide/use-web-search
[lermen]: https://arxiv.org/abs/2602.16800
[gonkarouter-docs]: https://gonkarouter.io/docs
[redpill]: https://github.com/Dstack-TEE/private-ai-gateway
[lin-substitution]: https://arxiv.org/abs/2604.21083
[tinfoil]: https://tinfoil.sh/blog
