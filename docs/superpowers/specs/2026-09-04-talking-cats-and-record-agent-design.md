# Talking cats and the record agent

Design contract for two features on `/record/:id`, agreed 4 September. The cats gain a voice; clicking them opens a
grounded chat about the record. This file is the integration contract every worker builds against.

Contents:

1. [Decisions taken](#decisions-taken)
1. [The seat rule](#the-seat-rule)
1. [What the cats say](#what-the-cats-say)
1. [Voice, captions and mute](#voice-captions-and-mute)
1. [The chat](#the-chat)
1. [The provider decision and its consequences](#the-provider-decision-and-its-consequences)
1. [Shared types](#shared-types)
1. [Work split](#work-split)

## Decisions taken

| Question         | Decision                                                  | Who       |
| ---------------- | --------------------------------------------------------- | --------- |
| Cat identity     | **Seats**, not model families                             | chaosiris |
| Automatic speech | Summary only, never per item. Non-spammy is a requirement | chaosiris |
| Voice engine     | **Web Speech API**, browser-native. No DashScope          | chaosiris |
| Chat transcript  | Each cat speaks its **own seat's** lines                  | chaosiris |
| Chat model       | **Gemini** via `GEMINI_API_KEY`                           | chaosiris |
| Scope            | All three tiers                                           | chaosiris |
| Mute control     | Minimalist icon beside the stage, persisted               | chaosiris |

## The seat rule

`src/client/components/EvidencePanel.tsx` already binds the cats to seats and states why:

> The cats are the two SEATS, never a particular model: which family serves a seat varies per item, so a fixed
> cat-to-model mapping would be a lie.

**Tororo is Reader A. Hijiki is Reader B.** A voice is bound to a seat and never moves. The family that filled the seat
is named in the caption and the citation pill, read from `attempt.servedModel`, never assumed.

This is not a style preference. TRD section 3 measures the rotation, and issue #200 confirms it in production the night
before submission: Kimi down outright, DeepSeek failing every real reading, one verified reading in seven attempts. A
voice bound to Kimi would be silent or lying on most items.

## What the cats say

They say what their reader actually said. Nothing is generated: every line is a template filled from
`attempts[].reading` and the stored verdict, so the whole tier works with the gateway down and costs no inference.

### Automatic, at most two utterances per record

Fires once, when the record reaches `ready`. Never per item.

- **Tororo, always** — the summary. "Three questions need a look. Two key errors and a split."
- **Tororo, when nothing is flagged** — "Nothing flagged. All twelve agreed with your key."
- **Hijiki, only when a split exists** — "We disagree on question nine." This is the one case where the two seats
  genuinely differ, so it is the one case worth a second voice.

Nothing else speaks on its own. Clear items are silent, because silence is the signal that nothing is wrong, and
speaking eight of twelve items would bury the three that matter.

### On demand, per item

A **Play** control in the evidence panel replays that item's exchange. This is where the per-item seat lines live, and
it is what the demo video uses: deterministic, repeatable, no gateway.

| Verdict            | Tororo (Reader A)                           | Hijiki (Reader B)                    |
| ------------------ | ------------------------------------------- | ------------------------------------ |
| Possible key error | "Question four. I read Queue."              | "So did I. The key says Stack."      |
| Possible ambiguity | "Question seven. B or C both work for me."  | "Same here. Two defensible answers." |
| Split opinion      | "Question nine. I read B."                  | "I read D."                          |
| Unverified         | "Question two. Only one reading came back." | **Silent**                           |
| Clear              | Nothing                                     | Nothing                              |

Three deliberate choices. **Hijiki's silence on Unverified is the meaning of Unverified** — the second reader is absent,
and `motions.ts` already has him stay still there. **Split Opinion ends in silence**, with the caption carrying "No
verdict. This one is yours." **Nothing is celebratory**: DESIGN.md says a result is a fact, not an event, so the
register is two readers reporting flatly.

## Voice, captions and mute

**Engine.** `window.speechSynthesis`. No key, no network, no provider host, so `only-gonkarouter.test.ts` is untouched
and no second track exemption is needed.

**Voice selection.** `getVoices()` filtered on `lang` prefix `en`, then a name heuristic to separate two voices. When
fewer than two distinct voices exist, fall back to one voice separated by pitch and rate: Tororo higher and slightly
faster, Hijiki lower and slower. When `speechSynthesis` is absent entirely, captions still render and nothing throws.

**Captions are not optional.** Every utterance renders as a bubble above its cat carrying the served model and the
request-id pill. Audio is an enhancement over a caption, never the only channel. This is what makes the feature work
muted, under `prefers-reduced-motion`, and on a projector with no audio — the likely case at APU.

**Mute.** A minimalist icon button beside the stage, persisted in `localStorage` under `cekgu.mute` following the
`cekgu.motion` pattern in `preferences.ts`. Muted stops audio only; captions and motion continue. Reduced motion does
not imply mute and mute does not imply reduced motion; they are separate switches over separate senses.

**Accessibility consequence.** The stage is `aria-hidden` and `pointer-events-none` today because it is decorative.
Making it clickable makes it interactive, so the click target becomes a real `<button>` with an accessible name ("Ask
About This Record"), keyboard reachable, with the canvas still `aria-hidden` inside it.

## The chat

**A reader of the record, never a third opinion.** PRODUCT.md names as a competing alternative "a single general AI chat
[that] offers one opaque opinion, may anchor on a supplied key and cannot prove independent model families produced the
result". The agent retrieves and explains what the two verified readers already said. Asked to adjudicate — "so which
answer is right?" — it declines and points at the verdict and the decision that belongs to the educator. That refusal is
the product principle rendered as a conversation, not a limitation.

**Tools**, read-only and scoped to one record id, thin wrappers over `src/server/records/queries.ts`:

| Tool                       | Answers                                                |
| -------------------------- | ------------------------------------------------------ |
| `record_summary()`         | Title, subject, status, counts by verdict              |
| `list_items({verdict?})`   | Position, stem, verdict, one-line reason               |
| `get_item({position})`     | Full stem, options, key, verdict, reason, dispositions |
| `get_readings({position})` | Both admitted readings with model, request id, receipt |
| `get_attempts({position})` | Every attempt including rejected ones, with the reason |

`get_attempts` is how the agent answers "why is this Unverified?" — the honest answer is in the rejected attempts.

**Citations.** Tool results carry citation tokens the model emits inline. The client strips them from the prose and
renders pills beneath the bubble. A sentence with no pill is visibly ungrounded, which is the point.

| Token                 | Pill                      | Action                          |
| --------------------- | ------------------------- | ------------------------------- |
| `[item:4]`            | `Item 4`                  | Scrolls to and expands item 4   |
| `[reading:4:A]`       | `Reader A · MiniMax-M2.7` | Opens that item's evidence      |
| `[receipt:req-1788…]` | `req-1788…503197`         | Opens the existing receipt view |

**Seat lines.** When the agent quotes a reading it speaks as that seat: the bubble carries the cat, the served model and
the request-id pill, and that cat plays `Tap` on the modal stage. Prose that is not a quotation comes from Cekgu with no
cat.

**The modal.** Fixed size, floating, both cats on a stage inside it. `Stage.tsx:8` freezes on any `[role="dialog"]`, so
the modal's own stage needs a scoped opt-out or it will freeze itself. The record page's stage should freeze, which it
already does for free.

## The provider decision and its consequences

The chat's model call goes to Gemini by the team's decision, recorded above. Three consequences are handled rather than
discovered:

1. **`only-gonkarouter.test.ts` gains a second named exemption.** The test is never deleted or weakened. The exemption
   is one directory, `src/server/chat/`, added with the date, the decider and the reasoning in the file, exactly as the
   transcription exemption is. Assertion 3, that `gateway/`, `queue/`, `extract/` and `shared/` name no provider host at
   all, is unchanged and still binds
1. **`docs/README.md:115` becomes false and must be corrected.** It currently tells judges Gemini is "the sole"
   exception and that GonkaRouter "handles every later reasoning or verification step". A judge reads the README, so a
   stale claim there is worse than the exception it hides
1. **The chat turn carries no Gonka request id.** It is labelled `Gemini · <responseId>` and is visually distinct from a
   Gonka receipt pill, following the precedent `transcribe/gemini.ts` already set: "It is not a Gonka request id and
   must never be displayed as one." Every **cited** fact still carries a real Gonka request id and a public receipt,
   because the readings are Gonka's. That distinction is what keeps the surface honest

**`CHAT_PROVIDER=gemini|gonka` is a one-word switch**, both paths built, so the decision is reversible without a code
change if a judge or a teammate objects.

**`gemini-3.5-flash-lite` must not be used.** TRD section 20 measured it on 4 September: no response across three
attempts, a 60 s timeout, a `503`, and a 90 s timeout. Chat reads `CHAT_MODEL`, separate from `GEMINI_MODEL`, defaulting
to the measured-good `gemini-2.5-flash` at 5.9 s.

## Shared types

```ts
// src/shared/chat.ts
export type Seat = 0 | 1

export type Citation =
  | { kind: 'item'; position: number }
  | { kind: 'reading'; position: number; seat: Seat; model: string; requestId: string | null }
  | { kind: 'receipt'; requestId: string; model: string | null }

/** Named apart from Gonka provenance on purpose. See src/server/transcribe/gemini.ts. */
export type ChatProvenance = { provider: 'gemini' | 'gonka'; responseId: string | null; model: string | null }

export type ChatMessage = {
  id: string
  role: 'user' | 'agent'
  /** Which seat is speaking, or null when the line is Cekgu's own rather than a quoted reading. */
  seat: Seat | null
  text: string
  citations: Citation[]
  provenance: ChatProvenance | null
}
```

```ts
// src/client/mascot/speech.ts
export type Utterance = {
  seat: Seat
  /** Spoken aloud. Short: this is heard, not read. */
  text: string
  /** Rendered in the bubble. May carry more than the spoken line. */
  caption: string
  cite: { model: string; requestId: string | null } | null
}

export function summaryUtterances(record: RecordDetail): Utterance[]
export function itemUtterances(item: Item): Utterance[]
```

## Work split

| Piece                                        | Owner        |
| -------------------------------------------- | ------------ |
| `src/client/mascot/speech.ts` and its tests  | opencode     |
| `src/server/chat/tools.ts` and its tests     | devin        |
| Chat modal shell, transcript, citation pills | peer session |
| Voice layer, mute control, stage integration | this session |
| Gemini chat route, fence exemption, README   | this session |
