# GonkaRouter Track — Challenge Brief

> **Source** — [Google Doc: _Hackathon Challenge: AI for Society_ / 黑客松赛题：AI 与公共价值](https://docs.google.com/document/d/1T_SSkoD_NkOtQGH3yRz9Gpy1mvrQXaEPiEjV9JsVydA/)
> Retrieved 2026-08-26. Original is bilingual (EN/中文); this is the English content reorganised, with nothing dropped.

---

## TL;DR

|                      |                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Track**            | AI for Society — real-world AI in the public domain                                   |
| **Hard requirement** | **All** AI reasoning must run on the Gonka Network via GonkaRouter                    |
| **Scope**            | Open-ended — the four directions below are _inspiration, not constraints_             |
| **Flagship example** | AI Fact Checker (explicitly called a **preferred application**)                       |
| **Prizes**           | 1st **1,200 USDT** · 2nd **800 USDT** · Top 10 → 20M free tokens/month for 3–6 months |
| **Tagline**          | _"Verify the World on Gonka.ai"_                                                      |

---

## 1. The four suggested directions

| Direction                            | What it is                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **AI Fact Checker** ⭐               | Cross-verify news / social media using multiple models → on-chain **Truth Score** with a fully traceable reasoning trail        |
| **Multilingual AI Public Assistant** | Censorship-free AI access layer for education, medical consultation, legal literacy — aimed at non-English-speaking communities |
| **AI Accessibility Tools**           | Assistants for users with visual, hearing, or cognitive impairments                                                             |
| **Open Knowledge Engine**            | Decentralised Q&A / knowledge-retrieval system on Gonka inference                                                               |

⭐ = the doc singles this out and spends the rest of its length specifying it, which is a strong signal about what judges expect.

---

## 2. The flagship example, in detail

### The pitch

> Build a decentralised **"Truth Engine"** that uses multi-model AI inference to verify the authenticity of news, social media claims, or digital media (text/images) **in real time**.

### The framing (worth reusing in our deck)

In an era of deepfakes and AI-generated misinformation, **centralised fact-checkers are often accused of bias**.
Gonka's decentralised network is positioned as the answer: a **neutral, verifiable, transparent** source of truth.

### Required core functionality

| #   | Feature                        | Detail                                                                                       |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | **Claim Extraction**           | Accept a URL, tweet, or text snippet as input                                                |
| 2   | **Decentralised Verification** | Gonka-hosted models analyse the claim against real-time web data or internal knowledge bases |
| 3   | **Truth Score & Reasoning**    | Output a **0–100% Truth Score** plus a detailed **Reasoning Trace** explaining the verdict   |
| 4   | **Transparency UI**            | Dashboard showing the result **and the specific Gonka Request ID for each inference step**   |

---

## 3. Technical requirements

### 🔴 Mandatory

- **All AI reasoning and verification logic MUST run on the Gonka Network** via the official inference gateway (`gonkarouter.io`).
  → _Non-negotiable. A project calling OpenAI/Anthropic directly is disqualified from this track._

### 🟡 Strongly encouraged

- **Multi-Model Consensus** — use **at least two different models** (the doc names **MiniMax** and **Kimi**) to cross-verify claims and ensure neutrality.

### 🟢 Provided

- **Free access** — all participants receive **unlimited free token credits** for development during the hackathon.

---

## 4. Developer tips (straight from the organisers)

| Tip                         | What they're actually asking for                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **The "Neutrality" Prompt** | Prompts must instruct models to stay objective and **cite specific evidence** for conclusions                                            |
| **Cross-Model Comparison**  | _"If two models disagree, how does your system handle the conflict?"_ — building explicit **Consensus Logic** is called **a major plus** |
| **On-Chain Proof**          | **Always display the Gonka Request ID** — it's what proves the truth wasn't generated by a centralised server                            |

> 💡 These three read as a scoring rubric in disguise. Consensus-conflict handling is the one where most teams will hand-wave.

---

## 5. Prizes & incentives

| Award                | Value                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| 🥇 First Prize (×1)  | **1,200 USDT** cash                                                                                          |
| 🥈 Second Prize (×1) | **800 USDT** cash                                                                                            |
| 🎖️ Top 10            | **20 million free tokens / month** on GonkaRouter for **3–6 months** post-event, to keep the project running |
| 🌱 Ecosystem support | Standout projects may be **integrated into the official Gonka ecosystem** as a public utility tool           |

---

## 6. Submission criteria (track-specific)

| #   | Deliverable           | Requirement                                                            |
| --- | --------------------- | ---------------------------------------------------------------------- |
| 1   | **Live Demo URL**     | A web app where users paste a link/text and get a verification report  |
| 2   | **GitHub Repository** | Clean code with **clear documentation on the GonkaRouter integration** |
| 3   | **Video Pitch**       | **2 minutes**, showing a _live fact-check in action_                   |

> ⚠️ These sit **on top of** the event-wide submission requirements (pitch deck, socials link, deployed app link, MVP video on Devfolio). See `docs/brief.md`.

---

## 7. Reading between the lines

- **The Request ID is the differentiator.** Every team will produce a score; far fewer will surface per-step provenance. It's mentioned twice — in core functionality _and_ in the tips.
- **"Consensus Logic" is the named bonus.** Disagreement handling should be a visible, explainable feature, not an averaging function buried in a helper.
- **The track is open-ended but the doc isn't.** ~80% of the text specifies the Fact Checker. A non-fact-checker submission needs to map itself onto the same rubric (multi-model, traceable, transparent, publicly useful).
- **Post-event token grants imply they want something that keeps running.** Judges will likely favour projects with a plausible life after Demo Day.
