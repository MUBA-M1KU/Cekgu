import { and, eq, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { ChatMessage } from '../../shared/chat'
import { toMessages } from '../chat/citations'
import { agentUnavailable, ask } from '../chat/gemini'
import { db } from '../db'
import { records } from '../db/schema'
import { recordDetail } from '../records/queries'
import { type AppEnv, sessionOf } from '../session'

// POST /api/records/:id/chat. The agent is scoped to one record and cannot see another: the record
// is loaded here, by id, against this session, and passed to the tools as the only thing they read.
// There is no cross-record search and no tool that takes a record id, which is what keeps a prompt
// injected into an uploaded paper from reaching somebody else's questions.

const MAX_QUESTION = 500
const MAX_HISTORY = 8

export const chatRoutes = new Hono<AppEnv>()

function invalid(message: string, code = 'invalid_request') {
  return { error: { code, message } } as const
}

chatRoutes.post('/records/:id/chat', async (c) => {
  if (agentUnavailable()) {
    return c.json(invalid('The assistant is switched off on this deployment.', 'agent_disabled'), 503)
  }

  const body = (await c.req.json().catch(() => null)) as { question?: unknown; history?: unknown } | null
  const question = typeof body?.question === 'string' ? body.question.trim() : ''

  if (!question) return c.json(invalid('Ask a question first.'), 422)
  if (question.length > MAX_QUESTION) {
    return c.json(invalid(`Keep the question under ${MAX_QUESTION} characters.`), 422)
  }

  const id = c.req.param('id')
  const detail = await recordDetail(id)
  if (!detail) return c.json(invalid('That record does not exist.', 'not_found'), 404)

  // The sample is readable by anyone, exactly as GET /api/sample is, so a judge signed in as Guest
  // can interrogate the preserved evidence. Every other record is its owner's alone.
  if (!detail.isSample) {
    const [owned] = await db
      .select({ id: records.id })
      .from(records)
      .where(and(eq(records.id, id), eq(records.userId, sessionOf(c).user.id), isNull(records.deletedAt)))
      .limit(1)

    if (!owned) return c.json(invalid('That record does not exist.', 'not_found'), 404)
  }

  // Only the prose is carried back, never the resolved citations: they are rebuilt from the record
  // on every turn, so a client that edits a request id in its history changes nothing.
  const history = Array.isArray(body?.history)
    ? body.history
        .filter((entry): entry is ChatMessage => typeof entry === 'object' && entry !== null && 'text' in entry)
        .slice(-MAX_HISTORY)
        .map((entry) => String(entry.text))
    : []

  // Streamed rather than answered in one piece, so the tools the agent calls are visible while it
  // is calling them. A grounded answer that arrives with no account of how it was found asks to be
  // taken on trust, which is the one thing this product does not do.
  return streamSSE(c, async (stream) => {
    const answer = await ask(detail, question, history, (name, args) => {
      const position = typeof args.position === 'number' ? args.position : null
      void stream.writeSSE({ event: 'tool', data: JSON.stringify({ name, position }) })
    })

    if (!answer.ok) {
      await stream.writeSSE({ event: 'failed', data: JSON.stringify({ message: answer.reason }) })
      return
    }

    await stream.writeSSE({
      event: 'messages',
      data: JSON.stringify({ messages: toMessages(answer.text, detail, answer.provenance) })
    })
  })
})
