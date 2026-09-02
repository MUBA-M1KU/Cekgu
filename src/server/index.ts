import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { api } from './routes'

const CLIENT_DIR = './dist/client'

const app = new Hono()

app.route('/api', api)
app.all('/api/*', (c) => c.json({ error: { code: 'not_found', message: 'Unknown API route.' } }, 404))

app.use('/*', serveStatic({ root: CLIENT_DIR }))
app.get('*', serveStatic({ path: `${CLIENT_DIR}/index.html` }))

const port = Number(process.env.PORT ?? 8080)
const server = Bun.serve({ port, fetch: app.fetch })

console.log(`cekgu listening on http://localhost:${server.port}`)
