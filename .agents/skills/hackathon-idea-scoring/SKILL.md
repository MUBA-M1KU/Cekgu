---
name: hackathon-idea-scoring
description: >-
  Score and rank candidate concepts against the MUBA rubric (Technical Implementation 30 / Practicality & Impact 30 / Presentation & Clarity 20 / UX & Design 10 / Originality) plus the track's mandatory GonkaRouter requirements. Use immediately after hackathon-idea-generator, before recommending a concept.
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

# hackathon-idea-scoring

## Goal

Evaluate and rank candidate project ideas against a weighted scoring rubric aligned with hackathon judging criteria and team capabilities.

---

## Trigger Conditions

Use this skill when:

- A list of candidate ideas is available from `hackathon-idea-generator`
- `evaluation_axes` from `hackathon-track-analyzer` are confirmed
- The team must converge on a single idea before scoping begins
- Objective comparison is needed to resolve disagreement between team members
- Invoked directly after `hackathon-idea-generator`; output gates all subsequent phases

---

## Inputs

| Input                      | Type     | Required | Description                                        |
| -------------------------- | -------- | -------- | -------------------------------------------------- |
| `ideas`                    | object[] | Yes      | Ideas list from `hackathon-idea-generator`         |
| `evaluation_axes`          | object[] | Yes      | Scoring axes from `hackathon-track-analyzer`       |
| `team_skills`              | string[] | Yes      | Technologies and domains the team is proficient in |
| `hackathon_duration_hours` | integer  | Yes      | Total hours available                              |
| `team_size`                | integer  | Yes      | Number of team members                             |
| `weights`                  | object   | No       | Custom weight overrides per evaluation axis        |

---

## Outputs

| Output               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `scored_ideas`       | Each idea with scores per axis and total score |
| `ranking`            | Ordered list of ideas by total score           |
| `top_recommendation` | Single recommended idea with rationale         |
| `risk_flags`         | Concerns for each top-3 idea                   |
| `recommended_skills` | Suggested next skills to invoke                |

---

## Rules

1. Score every idea on every evaluation axis using a 1–5 scale.
2. Apply axis weights when computing total score; default weight is 1.0 if not specified.
3. Apply a `feasibility_penalty` (-0.5 per axis point) if the team lacks skills required.
4. Apply a `time_penalty` (-1.0) if the idea cannot realistically ship in `hackathon_duration_hours`.
5. Surface at least one risk flag per top-3 idea.
6. Select `top_recommendation` based on highest adjusted total score.
7. Break ties in favor of the idea with the highest feasibility score.

---

## Output Format

```yaml
scored_ideas:
  - id: '<idea-N>'
    title: '<title>'
    scores:
      - axis: '<axis name>'
        score: <1-5>
        notes: '<rationale>'
    penalties:
      - type: '<feasibility|time>'
        value: <number>
    total_score: <number>

ranking:
  - rank: <number>
    id: '<idea-N>'
    total_score: <number>

top_recommendation:
  id: '<idea-N>'
  title: '<title>'
  rationale: '<string>'

risk_flags:
  - id: '<idea-N>'
    risks:
      - '<risk>'

recommended_skills:
  - '<skill-name>'
```

---

## Example

**Input:**

```yaml
ideas:
  - id: 'idea-1'
    title: 'AnchorAI'
    risk_level: 'medium'
  - id: 'idea-3'
    title: 'CalmDraft'
    risk_level: 'low'
evaluation_axes:
  - axis: 'Innovation'
    weight: 1.5
  - axis: 'Impact'
    weight: 1.5
  - axis: 'Technical Execution'
    weight: 1.0
team_skills: ['Python', 'React', 'OpenAI API']
hackathon_duration_hours: 24
team_size: 3
```

**Output:**

```yaml
scored_ideas:
  - id: 'idea-1'
    title: 'AnchorAI'
    scores:
      - axis: 'Innovation'
        score: 4
        notes: 'Memory layer is novel; similar products exist but not for this audience'
      - axis: 'Impact'
        score: 5
        notes: 'Addresses acute unmet need at scale'
      - axis: 'Technical Execution'
        score: 3
        notes: 'Memory persistence adds integration complexity'
    penalties: []
    total_score: 17.5

  - id: 'idea-3'
    title: 'CalmDraft'
    scores:
      - axis: 'Innovation'
        score: 3
        notes: 'CBT journaling apps exist; GPT reframing is incremental'
      - axis: 'Impact'
        score: 4
        notes: 'Reaches self-directed users effectively'
      - axis: 'Technical Execution'
        score: 5
        notes: 'Well within team skills; highly shippable in 24h'
    penalties: []
    total_score: 16.5

ranking:
  - rank: 1
    id: 'idea-1'
    total_score: 17.5
  - rank: 2
    id: 'idea-3'
    total_score: 16.5

top_recommendation:
  id: 'idea-1'
  title: 'AnchorAI'
  rationale: 'Highest combined score on weighted innovation and impact axes; team has required skills.'

risk_flags:
  - id: 'idea-1'
    risks:
      - 'Memory persistence implementation may exceed time budget if OpenAI context window approach is chosen'

recommended_skills:
  - 'hackathon-scope-cutter'
```

---

## Context Files

### Knowledge Base

- `../hackathon-shared-resources/knowledge/hackathon-judging-criteria.md`
- `../hackathon-shared-resources/knowledge/hackathon-winning-patterns.md`
- `../hackathon-shared-resources/knowledge/hackathon-mvp-strategy.md`
- `../hackathon-shared-resources/knowledge/hackathon-common-failures.md`

### Playbooks

- `../hackathon-shared-resources/playbooks/hackathon-workflow.md`
