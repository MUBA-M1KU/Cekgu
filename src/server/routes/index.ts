import { Hono } from 'hono'

// Routes from TRD section 15 mount here. Unmatched /api paths get a JSON 404 from src/server/index.ts.
export const api = new Hono()
