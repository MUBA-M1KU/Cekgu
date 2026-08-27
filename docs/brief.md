# MUBA Blockchain Hackathon 2026 - Brief

The single source of truth for event facts. Sourced from the official site, the opening ceremony (26 Aug) and the
GonkaRouter challenge doc; full detail lives in [`source/`](./source/). Records what the organizers stated, not our
status.

---

## The Event

|               |                                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| **Name**      | MUBA Blockchain Hackathon 2026, _"Hack the Future"_                              |
| **Host**      | MUBA, the Malaysia University Blockchain Association                             |
| **Co-hosts**  | APU · Monash Blockchain Club · UTAR Kampar · Taylor's University Blockchain Club |
| **Format**    | 11 days online build, then a physical pitch day                                  |
| **Our track** | **GonkaRouter - AI for Society**                                                 |
| **Site**      | [mubahack.xyz](https://www.mubahack.xyz/official_landing_page/code.html)         |
| **Devfolio**  | [muba-hackathon.devfolio.co](https://muba-hackathon.devfolio.co/overview)        |
| **Entry fee** | None                                                                             |

---

## Dates

| Date       | Time              | What                                                        |
| ---------- | ----------------- | ----------------------------------------------------------- |
| 26 Aug     | 8:00 PM           | Opening ceremony                                            |
| 27 Aug     | 8:00 PM           | Thetanuts Finance workshop                                  |
| **27 Aug** | **9:00 PM**       | **GonkaRouter workshop**, Jack, Tech Lead                   |
| 31 Aug     | 9:00 PM           | Sui workshop, Rafael, Mysten Labs                           |
| 1 Sept     | 5:00 PM           | UTAR Kampar bus reservation deadline                        |
| **5 Sept** | **11:59 PM**      | **Submission deadline**, and extended registration deadline |
| **6 Sept** | 8:00 AM - 6:00 PM | **Demo Day at APU**, physical                               |

**Registration was extended** from 25 Aug to 5 Sept 11:59 PM, announced at the ceremony and not yet reflected on the
website.

**Demo Day run sheet:** 08:00 registration · 09:00 opening · 10:00 pitching 1 · 13:00 lunch · 14:00 pitching 2 · 17:00
results · 17:30 closing and winners · 18:00 end.

---

<a id="live-sessions"></a>

## Live Sessions

Every online session runs on **Microsoft Teams**, not the platform originally announced. Each also has its own Luma
registration page.

| Session                    | When                | Speaker                          | Join                                                                               |
| -------------------------- | ------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| Opening ceremony           | 26 Aug, 8:00 PM     | Richard (MC) and sponsor reps    | [Teams](https://teams.microsoft.com/meet/482246276338881?p=plXqBqoKk4MS7PO9Qn)     |
| Thetanuts Finance workshop | 27 Aug, 8:00 PM     | Sean and Benjamin                | [Teams](https://teams.microsoft.com/meet/456497881747566?p=GwDwiV2omVke0iuTFa)     |
| **GonkaRouter workshop**   | **27 Aug, 9:00 PM** | **Jack**, Tech Lead, GonkaRouter | [**Teams**](https://teams.microsoft.com/meet/433187713146886?p=sv72xzbv19gF5r8p3V) |
| Sui workshop               | 31 Aug, 9:00 PM     | Rafael, Mysten Labs              | [Teams](https://teams.microsoft.com/meet/443261481200322?p=MA1J7VtyBw1UAmFbeX)     |

Only the GonkaRouter workshop is ours. The other two are other tracks, and optional.

---

## Eligibility And Team

| Rule                    | Detail                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Who**                 | Malaysian citizens and visa holders currently residing in Malaysia. No other background restriction                                               |
| **Team size**           | **2-4 members.** Solo entries are not allowed                                                                                                     |
| **Multiple teams**      | Not allowed. One team per person                                                                                                                  |
| **Verification**        | Each participant submits their LinkedIn                                                                                                           |
| **Physical attendance** | The site says mandatory for all members; the ceremony clarified **at least one member must attend**, all strongly encouraged. Attend the full day |
| **Team changes**        | Notify organizers via Discord if anyone withdraws                                                                                                 |
| **IP**                  | Participants own their project IP                                                                                                                 |

**Originality.** Must be built from scratch during the hackathon period. No prior projects and no copy-paste of past
work, **including privately pre-built frameworks owned by the team**. Improving on a prior idea is fine; reusing prior
code is not.

---

## What We Submit

By **5 Sept, 11:59 PM**, on [Devfolio](https://muba-hackathon.devfolio.co/overview). **No Devfolio submission means
disqualification from pitching.**

| #   | Deliverable          | Notes                                   |
| --- | -------------------- | --------------------------------------- |
| 1   | Pitch deck           | Required sections below                 |
| 2   | GitHub repo link     | With a README describing the project    |
| 3   | Project socials link | X preferred                             |
| 4   | Deployed app link    | If applicable, and for our track it is  |
| 5   | MVP video            | Focus on the system demo, not slideware |

**The deck must cover** the problem statement and project objective, motivation and challenges, commercialisation and
business model, technology stack and track chosen, and the overall concept.

**Our track adds** a live demo URL (paste a link or text, get a verification report), a GitHub repo with clear
documentation on the GonkaRouter integration, and a 2-minute video pitch showing a live fact-check.

---

## How We Are Judged

| Weight  | Criterion                  |
| ------- | -------------------------- |
| **30%** | Technical Implementation   |
| **30%** | Practicality and Impact    |
| **20%** | Presentation and Clarity   |
| **10%** | User Experience and Design |
| -       | Originality                |

Judges also weigh functionality, potential impact, novelty, UX, composability and integration, and business plan
viability. **All judges' decisions are final and binding.** The pitch is **5 minutes presentation plus 5 minutes Q&A.**

What sponsors said out loud, worth optimising for:

> **Rafael (Sui):** "We want a **complete** implementation rather than a **complex** implementation."
>
> **Sean (Thetanuts):** "It's not how complex your product is, it's how good your PMF is. Will any users actually use
> the app?"
>
> **Sean (Thetanuts):** "Try **not** to get the idea from ChatGPT or Claude, every idea there, we've already thought
> of."
>
> **Carol (GonkaRouter):** "Use AI to build something truly useful and solve real-world problems."

---

## Our Track: GonkaRouter, AI For Society

Full brief: [`source/gonkarouter-challenge.md`](./source/gonkarouter-challenge.md).

**Non-negotiable requirements.** Any of these missed disqualifies the entry:

1. **All** AI reasoning runs through GonkaRouter (`api.gonkarouter.io`). A direct OpenAI or Anthropic call disqualifies
   us
2. **Two or more models** cross-verifying, for multi-model consensus
3. **Gonka Request IDs displayed** per inference step, the on-chain proof
4. **Consensus logic** for model disagreement, called out as "a major plus"

| Award  | Value                                                  |
| ------ | ------------------------------------------------------ |
| 1st    | **1,200 USDT**                                         |
| 2nd    | **800 USDT**                                           |
| Top 10 | 20M free tokens per month for 3-6 months               |
| Bonus  | Possible integration into the official Gonka ecosystem |

**Suggested directions:** AI Fact Checker · Multilingual AI Public Assistant · AI Accessibility Tools · Open Knowledge
Engine. The challenge doc calls the Fact Checker a "preferred application" and specifies it at length, but the track
reveal named no direction and closed on "solve real-world problems". These are **inspiration, not constraints.**

| Model                 | Best For (Per Carol)                              | Max Output |
| --------------------- | ------------------------------------------------- | ---------- |
| **Kimi-K2.6**         | Long-text analysis, summarization, fact checking  | 262K       |
| **MiniMax-M2.7**      | Multi-turn conversation, AI agents and assistants | 192K       |
| **DeepSeek-V4-Flash** | Logical reasoning, complex tasks                  | 1M         |

Credits are unlimited free tokens for all participants during the hackathon. Setup:
[`source/gonkarouter-tutorial.md`](./source/gonkarouter-tutorial.md).

---

## People

| Track           | Name     | Role                                               |
| --------------- | -------- | -------------------------------------------------- |
| **GonkaRouter** | **Jack** | Tech Lead. Judge, mentor, runs the 27 Aug workshop |
| **GonkaRouter** | **Rain** | Product Manager. Judge, mentor                     |
| **GonkaRouter** | Carol    | Marketing. Presented the track                     |
| Sui             | Rafael   | Solutions Engineer, Mysten Labs. Judge and mentor  |
| Thetanuts       | Benjamin | Growth. Judge and mentor                           |
| Thetanuts       | Sean     | Full-stack Developer. Judge and mentor             |
| MUBA            | Richard  | MC and organizer                                   |

**Mentorship** runs in per-track Discord channels. Mentors give guidance and suggestions; they will not write code or
build features. Asking whether an idea is too ambitious is fair game.

---

## All Tracks And Prize Pool

| Sponsor         | Tier   | Track                         | Prizes                                        |
| --------------- | ------ | ----------------------------- | --------------------------------------------- |
| **Sui**         | Gold   | Payments and Stablecoins      | 750 / 500 / 250 USD                           |
| **Sui**         | Gold   | AI + Sui                      | 750 / 500 / 250 USD                           |
| **Thetanuts**   | Silver | Best product on Thetanuts SDK | 600 / 400 USD                                 |
| **Thetanuts**   | Silver | AI + Options                  | 500 / 300 / 200 USD                           |
| **GonkaRouter** | Silver | **AI for Society** (ours)     | **1,200 / 800 USDT** plus top-10 token grants |

Supporting sponsors: **StarGlobal** (Web3 recruitment) and **GCC** (EVM-compatible L1).

---

## Channels

| Channel                                                     | Use                                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Discord**                                                 | Rules (`hackathon-rules`), per-track mentor channels, Q&A follow-ups, team-finding |
| **[Devfolio](https://muba-hackathon.devfolio.co/overview)** | Registration and submission, the disqualification gate. Free to enter              |
| **Luma**                                                    | Per-workshop registration page                                                     |
| **Microsoft Teams**                                         | Where every online session runs. Join links in [Live Sessions](#live-sessions)     |
| **Instagram**                                               | `MUBA 2026`, announcements and updates                                             |
| **Slido**                                                   | Live Q&A during sessions                                                           |

---

## Admin

- **Prize payout** within 14 working days
- **Certificates** are digital, issued to participants
- **UTAR Kampar bus:** gather 5 AM, depart 6 AM, arrive APU 10 AM, return around 12 AM. Book by 1 Sept 5 PM; runs if
  more than 20 sign up. Seat holders get the limited lanyard and T-shirt
