import { Hono } from 'hono'
import { fetchUrl } from '../extract/fetch-url'
import { structurePaper } from '../extract/structure'
import { callGonka } from '../gateway/client'
import { healthyOrder } from '../queue/health'
import { gatewaySemaphore } from '../queue/semaphore'
import type { AppEnv } from '../session'
import { ACCEPTED_TYPES, MAX_BYTES, transcribe, transcriptionUnavailable } from '../transcribe/gemini'

// TRD section 20. Two steps, and the order of them is the design: a vision model turns the upload
// into the words printed on it, then a Gonka model turns those words into questions, options and a
// key. Only the second step decides anything, and it is the one that carries a request id.
//
// This produces a DRAFT. It does not create a record and it never queues a check — the educator
// reads what came back, corrects it, and submits it themselves. A wrong extraction that submits
// itself would put the product's name on a claim nobody read.
// A ceiling on the whole structuring step, not on one call. callGonka already stops a single call
// at 90 s, and structurePaper races the families two at a time, so an order of three can still spend
// three minutes across two waves before anyone is told anything — and a teacher watching an upload
// has given up long before that.
//
// Set just above one complete attempt, 90 s for the call and 5 s for its receipt, rather than at
// a round number. A ceiling below that can cut off a call that was about to succeed, which is the
// worst outcome available: the reader waits the whole time and gets nothing. Above it, the only
// thing being refused is a SECOND family, and by then the wait is already indefensible.
//
// Measured end to end through this route on 4 September: a PNG answered in 35 s and the same paper
// as a PDF in 74 s, both correct, both on MiniMax. The spread is the gateway's, not the file's. Later
// that day the same PNG hit this ceiling twice running, which is what put the race in structurePaper.
const STRUCTURE_CEILING_MS = 100_000

// Both input paths end here, so a pasted link and an uploaded scan are structured by exactly the
// same Gonka step under exactly the same semaphore and ceiling.
async function structure(text: string) {
  return Promise.race([
    structurePaper(text, {
      call: async (model, prompt) => {
        const release = await gatewaySemaphore.acquire()
        try {
          return await callGonka(model, prompt)
        } finally {
          release()
        }
      },
      order: () => healthyOrder()
    }),
    new Promise<{ ok: false; reason: string }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: false,
            reason: `The readers took longer than ${STRUCTURE_CEILING_MS / 1000} seconds. Try again, or type the questions in.`
          }),
        STRUCTURE_CEILING_MS
      )
    )
  ])
}

export const extractRoutes = new Hono<AppEnv>()

// TRD section 20's third input, and the one the compliance audit called out as missing: a link.
// The page is fetched and reduced to its words by src/server/extract/fetch-url.ts, which calls no
// model at all, and only then does a Gonka model decide what the questions are.
//
// A link to an HTML page needs no transcription, so unlike the upload route this one works on a
// deployment with no GEMINI_API_KEY. A link to a PDF or an image still needs the transcriber, and
// says so rather than failing vaguely.
extractRoutes.post('/extract/url', async (c) => {
  let raw: unknown
  try {
    raw = (await c.req.json())?.url
  } catch {
    return c.json({ error: { code: 'bad_body', message: 'Send a JSON body with a url.' } }, 400)
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    return c.json({ error: { code: 'no_url', message: 'Paste a link to the paper.' } }, 400)
  }

  if (raw.length > 2048) {
    return c.json({ error: { code: 'url_too_long', message: 'That link is too long.' } }, 400)
  }

  const fetched = await fetchUrl(raw)
  if (!fetched.ok) {
    return c.json({ error: { code: 'unfetchable', message: fetched.reason } }, 422)
  }

  let text: string
  let transcription = null
  if (fetched.kind === 'text') {
    text = fetched.text
  } else {
    if (!ACCEPTED_TYPES.includes(fetched.contentType)) {
      return c.json(
        { error: { code: 'unsupported_type', message: 'That link is not a web page, a PDF or an image.' } },
        415
      )
    }
    if (transcriptionUnavailable()) {
      return c.json(
        {
          error: {
            code: 'uploads_disabled',
            message:
              'That link is a file, and file reading is switched off on this deployment. Paste a web page instead.'
          }
        },
        503
      )
    }
    if (fetched.bytes.byteLength > MAX_BYTES) {
      return c.json({ error: { code: 'too_large', message: 'That file is larger than 10 MB.' } }, 413)
    }

    const read = await transcribe(fetched.bytes, fetched.contentType)
    if (!read.ok) {
      return c.json({ error: { code: 'unreadable', message: read.reason } }, 422)
    }
    text = read.text
    transcription = read.provenance
  }

  const structured = await structure(text)
  if (!structured.ok) {
    return c.json({ error: { code: 'not_structured', message: structured.reason } }, 422)
  }

  return c.json({
    draft: structured.draft,
    provenance: structured.provenance,
    transcription,
    warnings: structured.warnings,
    source: fetched.finalUrl
  })
})

extractRoutes.post('/extract', async (c) => {
  if (transcriptionUnavailable()) {
    return c.json({ error: { code: 'uploads_disabled', message: 'Uploads are switched off on this deployment.' } }, 503)
  }

  let file: File | null = null
  try {
    const form = await c.req.formData()
    const field = form.get('file')
    file = field instanceof File ? field : null
  } catch {
    return c.json({ error: { code: 'bad_upload', message: 'That upload could not be read.' } }, 400)
  }

  if (!file) {
    return c.json({ error: { code: 'no_file', message: 'Choose a file to upload.' } }, 400)
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return c.json({ error: { code: 'unsupported_type', message: 'Upload a PNG, JPEG, WebP or PDF.' } }, 415)
  }

  if (file.size > MAX_BYTES) {
    return c.json({ error: { code: 'too_large', message: 'That file is larger than 10 MB.' } }, 413)
  }

  const read = await transcribe(new Uint8Array(await file.arrayBuffer()), file.type)
  if (!read.ok) {
    return c.json({ error: { code: 'unreadable', message: read.reason } }, 422)
  }

  // The same semaphore the queue holds, not a second one beside it. Gotcha 10 measured account
  // level 429s above four concurrent calls, and an upload that ignored the limit would take its
  // slots from the checks already running.
  const structured = await structure(read.text)

  if (!structured.ok) {
    return c.json({ error: { code: 'not_structured', message: structured.reason } }, 422)
  }

  // Two provenances, named apart on purpose. `provenance` is the Gonka receipt for the step that
  // decided something; `transcription` is the non-Gonka step's own id, carried so the UI can say
  // which is which rather than leaving the reader to notice one call has no receipt.
  return c.json({
    draft: structured.draft,
    provenance: structured.provenance,
    transcription: read.provenance,
    warnings: structured.warnings
  })
})
