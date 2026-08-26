# Research

Cited findings produced during concept exploration, kept so a later agent — or a
teammate with none of your context — can reuse them without redoing the work.

The folder name records that this research is driven by the **superpowers**
skills (`brainstorming`, `dispatching-parallel-agents`,
`verification-before-completion`). It carries no obligation to use them for every
file that lands here.

## What Belongs Here

One file per topic, named `<topic>.md`. For this track, expect roughly:

| File                     | Covers                                                          |
| ------------------------ | --------------------------------------------------------------- |
| `gonka-capabilities.md`  | What the gateway and its three models can actually do, measured |
| `concept-pool.md`        | Candidate concepts before ranking                               |
| `concept-ranking.md`     | Scores against the judging rubric, with reasoning               |
| `competitor-analysis.md` | Who already does this, directly and indirectly                  |
| `red-team.md`            | The load-bearing assumptions, attacked before a judge does it   |

## What Does Not Belong Here

- **Summaries of the hackathon rules.** Those live in `docs/brief.md`.
- **Organiser material.** That lives in `docs/source/`, verbatim.
- **A locked product decision.** Research informs it; it is not the record of it.

## How To Write It

These files get read later by someone with none of your context. Write for that
reader.

- **Lead with the finding**, then the evidence. Not a narrative of the search.
- **Cite every factual claim.** Publisher, title, date, URL, and the date accessed.
  A number with no source cannot be reused by anyone.
- **Separate evidence from interpretation**, and say in the text which is which.
- **Mark gaps honestly:** `[ASSUMPTION]` for something believed but unchecked,
  `[NEEDS SOURCE]` for a claim that could not be verified.
- Never present an assumption as a researched fact, and never present an
  AI-generated statement as user research.
- Tables and short sections over paragraphs. TitleCase headings.

## Archiving

When a round of exploration is superseded, move it to `archive/round-N/` with a
short `README.md` saying **why it was cut**. A dead end that is documented stops
being repeated; a dead end that is deleted gets walked again.
