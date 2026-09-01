# Coding guidelines

Behavioural rules that reduce common LLM coding mistakes, from
[Karpathy's observations](https://x.com/karpathy/status/2015883857489522876). Kept out of [`AGENTS.md`](../AGENTS.md) so
it is not reloaded into every session.

**[`AGENTS.md`](../AGENTS.md) outranks this file wherever they disagree**, and the callout below is where they actually
do.

> **Where this conflicts with [How to work](../AGENTS.md#how-to-work), that section wins.** Guideline 1 says to stop and
> ask when something is unclear. In this repo, across a ten day build, you do not. Pick the reading that ships, state
> the assumption, and keep going. Stop only for the six cases in **Stop and ask only for these**. The rest of guideline
> 1, surfacing tradeoffs and not hiding confusion, still applies: say the assumption out loud, just do not wait on an
> answer.

## 1. Think before coding

- State assumptions explicitly.
- If multiple interpretations exist, say so, then pick one and proceed.
- If a simpler approach exists, say so. Push back when warranted.

## 2. Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: would a senior engineer call this overcomplicated? If yes, simplify.

## 3. Surgical changes

Touch only what you must. Clean up only your own mess.

- Do not improve adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match existing style even if you would do it differently.
- Notice unrelated dead code? Mention it, do not delete it.
- Remove imports and variables that **your** change orphaned. Leave pre-existing dead code alone unless asked.

The test: every changed line traces directly to what was asked.

## 4. Goal-driven execution

Turn tasks into verifiable goals, then loop until verified.

- "Add validation" becomes "write tests for invalid inputs, then make them pass"
- "Fix the bug" becomes "write a test that reproduces it, then make it pass"
- "Refactor X" becomes "ensure tests pass before and after"

Strong success criteria let you loop on your own. Weak criteria force check-ins, which is exactly the cost
[Proceed without asking](../AGENTS.md#how-to-work) exists to avoid.
