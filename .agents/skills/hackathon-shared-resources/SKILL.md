---
name: hackathon-shared-resources
description: >-
  Reference library (knowledge, playbooks, templates) backing the other hackathon-* skills — they load these files via relative paths. Rarely invoked directly; consult its knowledge/ docs for winning patterns, demo psychology, and MVP strategy.
---

> ## This Event
>
> This skill was vendored from a prior hackathon repo and **retargeted**. The
> generic method below is unchanged; these are the real constraints. Where the
> body still names another event's rules, this block wins.
>
> | | |
> | --- | --- |
> | **Event** | MUBA Blockchain Hackathon 2026 |
> | **Track** | GonkaRouter - AI for Society |
> | **Build window** | 26 Aug to 5 Sept 2026, ~10 days, remote |
> | **Submission** | Devfolio by 5 Sept, 23:59 MYT. No submission = disqualified |
> | **Deliverables** | Pitch deck, GitHub repo, socials link, deployed URL, MVP video (~2 min) |
> | **Demo Day** | 6 Sept, APU, physical. 5 min pitch + 5 min Q&A |
> | **Rubric** | Technical Implementation 30 / Practicality & Impact 30 / Presentation & Clarity 20 / UX & Design 10 / Originality |
> | **Track rules** | All inference through GonkaRouter; >= 2 models cross-verifying; Gonka Request IDs shown per step |
>
> **There is no on-site rebuild.** Any instruction about a 2-hour rebuild, a
> 1080x1080 poster, community voting, a Qwen model, or a Creativity 50 /
> Presentation 30 / Qwen Integration 20 rubric belongs to a different event and
> does not apply. Full rules: `docs/brief.md`.

# hackathon-shared-resources

This package holds the shared resources used across the skills in the **hackathon-ai-devkit** suite.

## Contents

- **`knowledge/`**: Best practices, winning patterns, and reference architectures.
- **`templates/`**: Standard markdown templates (e.g. PRD, ADR, Pitch Deck, Demo Script).
- **`playbooks/`**: Context and time-boxed strategies (e.g. 24h, 36h, 48h workflows).

This folder is designed to be installed alongside the other skills in the suite to provide contextual knowledge and reference templates for the AI agent.
