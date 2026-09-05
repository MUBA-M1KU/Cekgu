import { env } from '../env'

// THE FIRST OF THE TWO CALLS IN THIS PRODUCT THAT DO NOT GO TO GONKAROUTER. This directory and
// src/server/chat/ are the only ones allowed to name another provider's host —
// src/server/gateway/only-gonkarouter.test.ts fails the build if the name appears anywhere else,
// including in the reasoning path.
//
// The track's mandatory rule binds AI *reasoning and verification logic* to the Gonka Network. This
// is neither. It turns pixels and PDF bytes into the words already printed on the page, and it is
// forbidden by its own prompt from deciding anything about them. Every judgement — which text is a
// question, which strings are its options, which option the key names — is made afterwards by two
// Gonka models that each carry a request id. See docs/TRD.md section 20.
//
// The reason it exists at all is measured: of the three families the gateway served when this was
// decided, only Kimi-K2.6 reported vision, and it was the slowest of them (TRD section 3). The
// gateway has since delisted Kimi-K2.6 entirely (issue #239), so no family behind GonkaRouter
// reports vision at all and the argument is now stronger than when it was written. A one-model
// transcription step could not be cross-verified in any case, so putting it on the gateway would
// spend the demo path's slowest model on the one job that needs no judgement.

// Pick the id on measured availability, not on the docs. Every candidate below is a real id present
// in GET /v1beta/models; being listed is not the same as answering. Measured 4 September against a
// three-question paper: `gemini-2.5-flash` 200 in 5.9 s and correct, `gemini-3.5-flash` 200 and
// correct, `gemini-flash-latest` 200 but 33.9 s, `gemini-3-flash-preview` 503 "experiencing high
// demand", `gemini-3.5-flash-lite` no response at all across three attempts — a 60 s timeout, a
// 503, and a 90 s timeout. An unavailable model does not fail fast, so the route's own ceiling is
// what turns it into a sentence rather than a hang.
const HOST = 'https://generativelanguage.googleapis.com'
const TIMEOUT_MS = 60_000

// Gemini takes a PDF as inline data the same way it takes an image, which is why there is no PDF
// library here and no native canvas dependency in the container. One path serves both.
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
export const MAX_BYTES = 10 * 1024 * 1024

// Transcribe, do not interpret. Every "do not" here is a judgement this step must leave to the
// Gonka models downstream, because a transcriber that guesses a missing key produces a draft the
// receipts cannot be held against.
const PROMPT = `Transcribe this exam paper exactly as printed, in reading order.

Rules:
- Copy the words that are there. Never correct spelling, grammar, or a factual error.
- Never answer a question, never mark an option correct, and never supply a key that is not printed.
- Keep question numbers and option letters exactly as they appear.
- If a passage is unreadable, write [unreadable] in its place rather than guessing.
- Output plain text only. No commentary, no markdown, no explanation of what you did.`

// The transcriber's own receipt. It is not a Gonka request id and must never be displayed as one —
// this step is outside the gateway by decision, and naming its provenance is how that decision stays
// visible rather than becoming an unexplained gap. Requirement 4 asks for an id per inference step;
// this is the honest answer for the one step that has no Gonka call to have one.
export type TranscriptionProvenance = { provider: 'gemini'; responseId: string | null; model: string | null }

export type Transcription =
  | { ok: true; text: string; provenance: TranscriptionProvenance }
  | { ok: false; reason: string }

export function transcriptionUnavailable(): boolean {
  return env.gemini === null
}

export async function transcribe(bytes: Uint8Array, mimeType: string): Promise<Transcription> {
  // The input is checked before the configuration, so these two answers do not depend on whether a
  // key happens to be set. The route already answers 503 ahead of this when uploads are off.
  if (!ACCEPTED_TYPES.includes(mimeType)) return { ok: false, reason: 'That file type is not supported.' }
  if (bytes.byteLength > MAX_BYTES) return { ok: false, reason: 'That file is larger than 10 MB.' }

  const gemini = env.gemini
  if (!gemini) return { ok: false, reason: 'Uploads are switched off on this deployment.' }

  let response: Response
  try {
    response = await fetch(`${HOST}/v1beta/models/${gemini.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': gemini.apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: Buffer.from(bytes).toString('base64') } }
            ]
          }
        ],
        generationConfig: { temperature: 0 }
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (cause) {
    const aborted = cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError')
    return {
      ok: false,
      reason: aborted
        ? `Reading the file took longer than ${TIMEOUT_MS / 1000} seconds.`
        : 'We could not read that file.'
    }
  }

  if (response.status !== 200)
    return { ok: false, reason: `We could not read that file. The reader answered ${response.status}.` }

  let text: string
  let provenance: TranscriptionProvenance
  try {
    const body = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
      responseId?: string
      modelVersion?: string
    }
    text = (body.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim()
    // modelVersion is what actually served, which need not be the id we asked for — the same
    // distinction the gateway's receipt draws between requested and served.
    provenance = { provider: 'gemini', responseId: body.responseId ?? null, model: body.modelVersion ?? gemini.model }
  } catch {
    return { ok: false, reason: 'We could not read that file.' }
  }

  // An empty transcription is a photo of nothing useful, not a paper. Saying so here is kinder than
  // letting the Gonka step spend an inference producing an empty draft.
  if (text.length === 0) return { ok: false, reason: 'We could not find any text on that page.' }

  return { ok: true, text, provenance }
}
