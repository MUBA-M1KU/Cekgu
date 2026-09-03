import { Hono } from 'hono'
import { readSample, resetSample } from '../sample'
import { type AppEnv, isGuest, sessionOf } from '../session'

// GET is public by PUBLIC_PATHS in ./index.ts: a judge opens the Sample Report signed out
// (FR-SAMPLE-4). The reset below is not public, so the session gate runs for it.
export const sampleRoutes = new Hono<AppEnv>()

sampleRoutes.get('/sample', async (c) => {
  const sample = await readSample()
  if (!sample) {
    return c.json(
      {
        error: {
          code: 'sample_not_loaded',
          message: 'The sample record has not been loaded into this deployment yet.'
        }
      },
      404
    )
  }

  return c.json(sample)
})

// FR-SAMPLE-3. Guest only, because the sample lives in the Guest workspace and the rehearsal runs
// there; a private account resetting shared demo evidence is not a case the product has.
sampleRoutes.post('/sample/reset', async (c) => {
  if (!isGuest(sessionOf(c))) {
    return c.json({ error: { code: 'forbidden', message: 'Only the Guest workspace can reset the sample.' } }, 403)
  }

  const reset = await resetSample()
  if (!reset) {
    return c.json({ error: { code: 'sample_not_loaded', message: 'There is no sample record to reset.' } }, 404)
  }

  return c.json({ reset: true })
})
