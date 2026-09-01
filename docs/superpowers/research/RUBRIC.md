# Ideation rubric

The instrument we score candidate concepts against, before anything is built. It is **not** the organizers' rubric — it
is ours, built to predict theirs, with one dimension they leave unweighted made explicit because it is where this track
will actually be won or lost.

Official criteria live in [`../../brief.md`](../../brief.md). Read them first.

Contents:

1. [Why this exists](#why-this-exists)
1. [The weights](#the-weights)
1. [The novelty test](#the-novelty-test)
1. [Banned clusters](#banned-clusters)
1. [Two hard rules for generation](#two-hard-rules-for-generation)
1. [What this track structurally rewards](#what-this-track-structurally-rewards)
1. [Kill criteria](#kill-criteria)
1. [Using this rubric](#using-this-rubric)

## Why this exists

The organizers publish **Technical Implementation 30 / Practicality and Impact 30 / Presentation and Clarity 20 / UX and
Design 10**, and then list **Originality** with no weight at all.

An unweighted criterion is not an unused one. It is the tiebreaker among the many entries that all score well on the
weighted four — and on a track where the challenge doc hands every team the same worked example, a lot of entries will.

So Novelty carries real weight here even though it carries none on paper.

## The weights

| Dimension                  | Weight | The question                                                                     |
| -------------------------- | -----: | -------------------------------------------------------------------------------- |
| **Novelty**                |     25 | Of the teams in this track, how many ship something recognisably similar?        |
| **Real user, real Monday** |     20 | Is there a specific person with a specific pain, who would open it again Monday? |
| **Track fit**              |     20 | Do the four GonkaRouter requirements fit naturally, or are they bolted on?       |
| **Demo moment**            |     15 | Five minutes plus five of Q&A, on a projector, to humans                         |
| **Buildability**           |     20 | Nine days, our team, alongside everything else we owe                            |

**Under 70 is a no.** Not "needs work" — a different concept.

### Why these, and not the official four

- **Technical Implementation (30) is not a dimension here.** It is a consequence of Buildability and Track Fit. A
  concept cannot be scored on implementation quality before it exists; what can be scored is whether it _admits_ a
  complete implementation in the time we have. Rafael's line applies to every track: _"a complete implementation rather
  than a complex implementation."_
- **Practicality and Impact (30) splits** into Real User (is the pain real) and Track Fit (does our stack address it
  honestly). Thirty points of the official rubric is the single largest block, and Jack and Carol both described it in
  problem terms, not technology terms.
- **Presentation (20) and UX (10) collapse into Demo Moment.** Both are earned at the same instant: the thing on the
  projector. A concept with no legible moment cannot be presented well no matter who writes the script.
- **Novelty is promoted from unweighted to the largest single weight**, for the reason above.

## The novelty test

**Score above 15 only if you can answer all three.** Vague answers score zero; this test is the whole point of the
document.

### 1. The convergence count

Of the teams entering this track, how many ship something recognisably similar? **Answer with a number and defend it.**

More than about five is a fail. The reasoning has to name what specifically makes ours unrecognisable from theirs — not
"ours is better executed", which every team believes.

> **The mechanism to reason about:** almost every team will brainstorm with Claude or ChatGPT, from roughly the same
> prompt — "AI for social good hackathon ideas, Malaysia, decentralised inference". Those models are trained on the same
> corpus and steered by the same instruction tuning, so they converge hard. **The output set is predictable, which means
> it is avoidable.** See the [banned clusters](#banned-clusters) below.

### 2. The incumbent test

**Name who already does this.** Not "nobody" — that answer is almost always wrong, and a judge who knows the space will
find them during the 5-minute Q&A. Name them, then name what we do that they **structurally cannot**.

"Structurally cannot" means a property of their business or architecture, not a feature they have not shipped yet.
Anything a well-resourced incumbent could add in a sprint is not a moat, and saying so out loud is worse than not
raising it.

### 3. The second-use test

**Describe the second time someone opens it, and why.** Concretely: who, what day, what changed since the first time.

A tool used once is a demo. If the honest answer is "they probably wouldn't", the Real User score is capped at 8
regardless of anything else — and that is Jack's stated bar: _"solve specific needs in real life."_

## Banned clusters

**Treat these as disqualified unless the concept is genuinely unrecognisable from them.** This is the predicted output
of an LLM brainstorm against this brief, which is what most teams will be working from.

### Clusters from the challenge doc itself

The doc names four directions and specifies one at length. **Every team has read it.**

| Cluster                       | Why it is exhausted                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| **AI Fact Checker**           | The doc's own worked example, called a "preferred application" and specified over ~80% of its length |
| Multilingual public assistant | Named direction two                                                                                  |
| AI accessibility tools        | Named direction three                                                                                |
| Open knowledge engine / RAG   | Named direction four                                                                                 |

**On the Fact Checker specifically.** It is the single most likely concept in this track, by a wide margin. That is not
a reason it cannot win — it is a reason that winning with it requires beating a dozen teams at the same idea on
execution and demo alone, with novelty scoring near zero. Build it only with a deliberate, written answer to "why does
ours win the head-to-head", and expect the judges to have seen four before ours.

### Clusters from the predictable LLM brainstorm

Ask any frontier model for "AI for social good in Malaysia" and this set comes back. Assume several teams per line.

- Scam, fraud and phishing message checkers
- Government-service chatbots and subsidy or benefits navigators
- Mental-health companions and screening bots
- Medical symptom triage and hospital queue tools
- Legal-aid Q&A and tenancy or employment rights bots
- Tutors and study assistants for underserved students
- Resume, job-matching and gig-worker income tools
- Flood, haze and disaster alerting
- Food-waste and surplus-donation matching
- Carbon, recycling and sustainability trackers
- Elderly-care check-in assistants
- Bahasa Malaysia language and translation assistants

**If a concept lands in this list, it needs an unusually strong answer to the incumbent test to survive.** Several of
these have well-funded incumbents already operating in Malaysia.

## Two hard rules for generation

### Do not start from a problem list

Starting from "what social problems exist" produces exactly the list above, because that is what the training data
contains. **Start instead from one of:**

- **A stack capability.** What does three-model consensus with a per-step provenance trail make possible that
  single-model inference does not? That is a genuinely unusual primitive and almost nobody will build around it
  directly.
- **An odd data source.** Something public, messy, and not already wrapped in an API.
- **A workflow nobody has automated**, usually because it is too boring or too niche to have attracted a startup.
- **An incumbent's structural blind spot.** Something they cannot do without breaking their own business model.
- **A specific person's actual Tuesday.** Someone we can name, whose week we understand.

### Do not let a model pick the concept

Use models to pressure-test, cost, and red-team candidates. **Generating the shortlist with the same tool everyone else
is using is the mechanism that produces the convergence in the first place.** Sean said it plainly at the ceremony:

> _"Try **not** to get the idea from ChatGPT or Claude. Every idea there, we've actually thought of; some of us have
> already built it."_

That is a judge describing, in advance, how he will discount submissions.

## What this track structurally rewards

Composed from the four binding requirements, not from the example:

> **Take a question where one answer is not trustworthy on its own, put several independent models on it, and show the
> disagreement.**

The requirements are: all inference through GonkaRouter, **two or more models cross-verifying**, **Gonka Request IDs
surfaced per step**, and **explicit consensus logic** — which the doc singles out as "a major plus".

Read together, they describe a shape: **multi-model disagreement, made visible and auditable.** Most teams will treat
consensus as an averaging step buried in a helper and surface a single number. A concept where the **disagreement itself
is the product** fits the requirements natively rather than wearing them.

Fact-checking is the obvious application of that shape. **It is not the only one.** Any domain where a confident single
answer is dangerous and provenance matters has the same structure.

## Kill criteria

Stop work on a concept the moment any of these is true. Write down which one, and why, in the archive note.

- The convergence count is above five and the differentiator is execution quality.
- The incumbent test answer is "nobody does this".
- The GonkaRouter requirements only fit by adding a feature the product does not otherwise need.
- The demo moment needs more than 90 seconds of setup before it lands.
- Buildability depends on data, access, or a partnership we do not already have.

## Using this rubric

1. Generate candidates **without** an LLM writing the shortlist. `hackathon-idea-generator` structures the session; it
   does not choose.
1. Score each against the five dimensions. Record the numbers and the reasoning, not just the verdict.
1. Run the [novelty test](#the-novelty-test) in full on anything above 70. Most candidates die here, which is the point.
1. Take survivors to `competitor-analysis` and `strategy-red-team` before committing.
1. Write the winner up as `docs/PRODUCT.md`. Archive the rest under `archive/round-N/` with a note on **why each was
   cut** — a documented dead end stops being repeated.
