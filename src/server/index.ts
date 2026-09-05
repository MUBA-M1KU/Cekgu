import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { db } from './db'
import { env } from './env'
import { startGuestSweep } from './guest'
import { startHealthMirror } from './queue/health'
import { startWorker } from './queue/worker'
import { startRetentionSweep } from './retention'
import { api } from './routes'
import { SAMPLE_PASS_PATH, seedSample } from './sample'
import { seedGuestUser } from './seed'

const CLIENT_DIR = './dist/client'

if (env.migrateOnStart) await migrate(db, { migrationsFolder: './drizzle' })
await seedGuestUser()
if (env.migrateOnStart) await seedSample(SAMPLE_PASS_PATH)
if (env.workerEnabled) {
  startGuestSweep()
  startRetentionSweep()
  startHealthMirror()
  await startWorker()
}

const app = new Hono()

app.route('/api', api)
app.all('/api/*', (c) => c.json({ error: { code: 'not_found', message: 'Unknown API route.' } }, 404))

app.use('/*', serveStatic({ root: CLIENT_DIR }))
app.get('*', serveStatic({ path: `${CLIENT_DIR}/index.html` }))

// Bun closes a connection after 10 s with nothing on it, and two of our routes stream over a socket
// that is legitimately silent for far longer: the record assistant writes only when the agent calls
// a tool (routes/chat.ts:69), so the final answer round — the slowest, a whole reply's worth of
// prose — sends nothing at all until it is done. The socket was being cut at 12 s mid-answer, Hono's
// streamSSE closed cleanly on the error, and the client read a clean EOF as "The answer did not
// arrive". A short question survived and a detailed one did not, which is what made it look
// intermittent rather than broken.
//
// 255 is Bun's maximum and stays under Cloud Run's 300 s request timeout, so the gateway budget in
// chat/gonka.ts is what bounds an answer now, not the socket underneath it.
const server = Bun.serve({ port: env.port, fetch: app.fetch, idleTimeout: 255 })

console.log(`cekgu listening on http://localhost:${server.port}`)
