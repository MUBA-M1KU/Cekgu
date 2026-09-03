import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { db } from './db'
import { env } from './env'
import { startGuestSweep } from './guest'
import { startHealthMirror } from './queue/health'
import { startWorker } from './queue/worker'
import { api } from './routes'
import { SAMPLE_PASS_PATH, seedSample } from './sample'
import { seedGuestUser } from './seed'

const CLIENT_DIR = './dist/client'

if (env.migrateOnStart) await migrate(db, { migrationsFolder: './drizzle' })
await seedGuestUser()
if (env.migrateOnStart) await seedSample(SAMPLE_PASS_PATH)
if (env.workerEnabled) {
  startGuestSweep()
  startHealthMirror()
  await startWorker()
}

const app = new Hono()

app.route('/api', api)
app.all('/api/*', (c) => c.json({ error: { code: 'not_found', message: 'Unknown API route.' } }, 404))

app.use('/*', serveStatic({ root: CLIENT_DIR }))
app.get('*', serveStatic({ path: `${CLIENT_DIR}/index.html` }))

const server = Bun.serve({ port: env.port, fetch: app.fetch })

console.log(`cekgu listening on http://localhost:${server.port}`)
