import { Hono } from 'hono'
import { structurePaper } from '../extract/structure'
import { callGonka } from '../gateway/client'
import { healthyOrder } from '../queue/health'
import { gatewaySemaphore } from '../queue/semaphore'
import type { AppEnv } from '../session'
import { ACCEPTED_TYPES, MAX_BYTES, transcribe, transcriptionUnavailable } from '../transcribe/gemini'

// TRD section 16. Two steps, and the order of them is the design: a vision model turns the upload
// into the words printed on it, then a Gonka model turns those words into questions, options and a
// key. Only the second step decides anything, and it is the one that carries a request id.
//
// This produces a DRAFT. It does not create a record and it never queues a check — the educator
// reads what came back, corrects it, and submits it themselves. A wrong extraction that submits
// itself would put the product's name on a claim nobody read.
// A ceiling on the whole structuring step, not on one call. callGonka already stops a single call
// at 90 s, so three families in sequence can spend four and a half minutes before anyone is told
// anything — and a teacher watching an upload has given up long before that. Measured on the real
// gateway on 4 September, one paper took 120 s because the first family in the order was rate
// limited and the round only found a healthy one on the third try. This is what turns that into a
// sentence they can act on.
const STRUCTURE_CEILING_MS = 75_000

export const extractRoutes = new Hono<AppEnv>()

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
  const structured = await Promise.race([
    structurePaper(read.text, {
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

  if (!structured.ok) {
    return c.json({ error: { code: 'not_structured', message: structured.reason } }, 422)
  }

  return c.json({ draft: structured.draft, provenance: structured.provenance, warnings: structured.warnings })
})
