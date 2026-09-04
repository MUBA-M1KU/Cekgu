import { env } from '../env'

// THE ONE CALL IN THIS PRODUCT THAT DOES NOT GO TO GONKAROUTER, and the only file allowed to name
// another provider's host — src/server/gateway/only-gonkarouter.test.ts fails the build if the name
// appears anywhere else, including in the reasoning path.
//
// The track's mandatory rule binds AI *reasoning and verification logic* to the Gonka Network. This
// is neither. It turns pixels and PDF bytes into the words already printed on the page, and it is
// forbidden by its own prompt from deciding anything about them. Every judgement — which text is a
// question, which strings are its options, which option the key names — is made afterwards by two
// Gonka models that each carry a request id. See docs/TRD.md section 16.
//
// The reason it exists at all is measured: of the three families the gateway serves, only Kimi-K2.6
// reports vision, and it is the slowest of them (TRD section 3). A one-model transcription step
// could not be cross-verified in any case, so putting it on the gateway would spend the demo path's
// slowest model on the one job that needs no judgement.

// The model id is verified against GET /v1beta/models, the same rule the TRD sets for Gonka ids and
// for the same reason: measured 4 September, `gemini-3-flash-preview` answered 503 "experiencing
// high demand", `gemini-flash-latest` took 33.9 s, and `gemini-2.5-flash` returned a correct
// transcription of a three-question paper in 5.9 s. An id that is not in that list does not fail
// cleanly — it hangs until the timeout.
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

export type Transcription = { ok: true; text: string } | { ok: false; reason: string }

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
  try {
    const body = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    text = (body.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim()
  } catch {
    return { ok: false, reason: 'We could not read that file.' }
  }

  // An empty transcription is a photo of nothing useful, not a paper. Saying so here is kinder than
  // letting the Gonka step spend an inference producing an empty draft.
  if (text.length === 0) return { ok: false, reason: 'We could not find any text on that page.' }

  return { ok: true, text }
}
