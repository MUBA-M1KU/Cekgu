# Research

Cited findings from concept exploration, kept so a later agent or a teammate with none of your context can reuse them
without redoing the work.

The folder name records that this research is driven by the **superpowers** skills. It carries no obligation to use them
for every file that lands here.

## Read the rubric first

**[`RUBRIC.md`](RUBRIC.md) before generating any candidate.** It carries the scoring weights, the three-part novelty
test, and the list of concept clusters that are already exhausted. Ideation that skips it produces the same shortlist
every other team gets from the same prompt.

## What is here

| File                                                       | Holds                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`RUBRIC.md`](RUBRIC.md)                                   | The scoring instrument. Read before generating any candidate                                             |
| [`candidate-concepts.md`](candidate-concepts.md)           | Ten-round ledger; Round 10 is current and earlier rankings remain as history                             |
| [`three-day-rescore.md`](three-day-rescore.md)             | Every live concept rescored on 2 Sept 2026 for the 2.5 build days left, with that day's prior-art checks |
| [`multi-model-capability.md`](multi-model-capability.md)   | The permutation test, and what three distinct models buy that one cannot                                 |
| [`competitor-scan.md`](competitor-scan.md)                 | Prior art per candidate, predicted competition, the regulatory opening                                   |
| [`gateway-capabilities.md`](gateway-capabilities.md)       | What the gateway does, and what a Gonka Request ID does and does not prove                               |
| [`disagreement-as-product.md`](disagreement-as-product.md) | When multi-model divergence is a real signal, and the tests that certify it                              |

## What belongs here

One file per topic, named `<topic>.md`: measured gateway and model capabilities, candidate concepts, rankings against
the rubric, competitor scans, red-team findings.

**Not here:** summaries of the rules ([`../../brief.md`](../../brief.md)), organizer material
([`../../source/`](../../source/)), or a locked product decision. Research informs a decision; it is not the record of
one.

## How to write it

- **Lead with the finding**, then the evidence. Not a narrative of the search.
- **Cite every claim** with publisher, title, date, URL and date accessed. An uncited number is unusable.
- **Separate interpretation from evidence**, and say in the text which is which.
- **Mark gaps.** `[ASSUMPTION]` for believed but unchecked, `[NEEDS SOURCE]` for unverified.
- **Follow [`../../markdown-style.md`](../../markdown-style.md)** for structure, headings and when a table beats a list.

Never present an assumption as a researched fact, or an AI-generated statement as user research.

The candidate ledger is the exception to archiving: it retains every round because the corrections are part of the
decision record. When any other research artifact is superseded, move it to `archive/round-N/` with a short note on
**why it was cut**. A documented dead end stops being repeated; a deleted one gets walked again.
