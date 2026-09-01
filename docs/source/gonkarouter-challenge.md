# GonkaRouter track challenge brief

The official track brief, reorganised from the organizers' Google Doc with nothing dropped.

> **Source** — [Google Doc: _Hackathon Challenge: AI for Society_ / 黑客松赛题：AI 与公共价值][doc]. Retrieved
> 2026-08-26. The original is bilingual (EN/中文); this is the English content.

[doc]: https://docs.google.com/document/d/1T_SSkoD_NkOtQGH3yRz9Gpy1mvrQXaEPiEjV9JsVydA/

## Summary

- **Track** — AI for Society, real-world AI in the public domain
- **Hard requirement** — **all** AI reasoning must run on the Gonka Network via GonkaRouter
- **Scope** — open-ended. The four directions below are _inspiration, not constraints_
- **Flagship example** — AI Fact Checker. This doc calls it a **preferred application**; the live track reveal did not
- **Prizes** — 1st **1,200 USDT** · 2nd **800 USDT** · Top 10 gets 20M free tokens/month for 3–6 months
- **Tagline** — _"Verify the World on Gonka.ai"_

## 1. The four suggested directions

| Direction                            | What it is                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **AI Fact Checker**                  | Cross-verify news / social media using multiple models → on-chain **Truth Score** with a fully traceable reasoning trail        |
| **Multilingual AI Public Assistant** | Censorship-free AI access layer for education, medical consultation, legal literacy — aimed at non-English-speaking communities |
| **AI Accessibility Tools**           | Assistants for users with visual, hearing, or cognitive impairments                                                             |
| **Open Knowledge Engine**            | Decentralised Q&A / knowledge-retrieval system on Gonka inference                                                               |

**The doc's own word for the Fact Checker is "preferred"**, and it spends the rest of its length specifying that one
direction.

> **Do not read that as what the judges want.** At the opening ceremony, Carol — GonkaRouter's own track-reveal speaker,
> alongside judges Jack and Rain — never named a fact checker as a direction. She mentioned "fact checking" once, as a
> **capability of Kimi-K2.6**, and closed with: _"The core idea of our track is actually very simple: use AI to build
> something truly useful and solve real-world problems."_ See
> [`opening-ceremony-transcript.md`](opening-ceremony-transcript.md), the GonkaRouter track reveal at 00:27.
>
> Written brief says "preferred example". Live track reveal says "open". **Both are primary sources and they do not
> agree.** Treat the fact checker as the best-specified option, not as the expected answer.

## 2. The flagship example, in detail

### The pitch

> Build a decentralised **"Truth Engine"** that uses multi-model AI inference to verify the authenticity of news, social
> media claims, or digital media (text/images) **in real time**.

### The framing, worth reusing in our deck

In an era of deepfakes and AI-generated misinformation, **centralised fact-checkers are often accused of bias**. Gonka's
decentralised network is positioned as the answer: a **neutral, verifiable, transparent** source of truth.

### Required core functionality

| #   | Feature                        | Detail                                                                                       |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | **Claim Extraction**           | Accept a URL, tweet, or text snippet as input                                                |
| 2   | **Decentralised Verification** | Gonka-hosted models analyse the claim against real-time web data or internal knowledge bases |
| 3   | **Truth Score & Reasoning**    | Output a **0–100% Truth Score** plus a detailed **Reasoning Trace** explaining the verdict   |
| 4   | **Transparency UI**            | Dashboard showing the result **and the specific Gonka Request ID for each inference step**   |

## 3. Technical requirements

### Mandatory

**All AI reasoning and verification logic MUST run on the Gonka Network** via the official inference gateway
(`gonkarouter.io`). Non-negotiable: a project calling OpenAI or Anthropic directly is disqualified from this track.

### Strongly encouraged

**Multi-Model Consensus** — use **at least two different models** (the doc names **MiniMax** and **Kimi**) to
cross-verify claims and ensure neutrality.

### Provided

**Free access** — all participants receive **unlimited free token credits** for development during the hackathon.

## 4. Developer tips, straight from the organisers

| Tip                         | What they are actually asking for                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **The "Neutrality" Prompt** | Prompts must instruct models to stay objective and **cite specific evidence** for conclusions                                            |
| **Cross-Model Comparison**  | _"If two models disagree, how does your system handle the conflict?"_ — building explicit **Consensus Logic** is called **a major plus** |
| **On-Chain Proof**          | **Always display the Gonka Request ID** — it's what proves the truth wasn't generated by a centralised server                            |

These three read as a scoring rubric in disguise. Consensus-conflict handling is the one where most teams will
hand-wave.

## 5. Prizes and incentives

| Award             | Value                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| First prize (×1)  | **1,200 USDT** cash                                                                                          |
| Second prize (×1) | **800 USDT** cash                                                                                            |
| Top 10            | **20 million free tokens / month** on GonkaRouter for **3–6 months** post-event, to keep the project running |
| Ecosystem support | Standout projects may be **integrated into the official Gonka ecosystem** as a public utility tool           |

## 6. Submission criteria, track-specific

| #   | Deliverable           | Requirement                                                            |
| --- | --------------------- | ---------------------------------------------------------------------- |
| 1   | **Live Demo URL**     | A web app where users paste a link/text and get a verification report  |
| 2   | **GitHub Repository** | Clean code with **clear documentation on the GonkaRouter integration** |
| 3   | **Video Pitch**       | **2 minutes**, showing a _live fact-check in action_                   |

These sit **on top of** the event-wide submission requirements — pitch deck, socials link, deployed app link, MVP video
on Devfolio. See [`../brief.md`](../brief.md).

## 7. Reading between the lines

- **The Request ID is the differentiator.** Every team will produce a score; far fewer will surface per-step provenance.
  It's mentioned twice — in core functionality _and_ in the tips.
- **"Consensus Logic" is the named bonus.** Disagreement handling should be a visible, explainable feature, not an
  averaging function buried in a helper.
- **The written brief and the live reveal disagree on how open the track is.** ~80% of this doc specifies the Fact
  Checker and calls it "preferred". The track reveal at the ceremony framed it as open and named no direction at all.
  Whatever we build, it has to satisfy the same explicit requirements — multi-model, traceable, transparent, publicly
  useful — because those are stated in sections 2 and 3 and are not in dispute.
- **Post-event token grants imply they want something that keeps running.** Judges will likely favour projects with a
  plausible life after Demo Day.
