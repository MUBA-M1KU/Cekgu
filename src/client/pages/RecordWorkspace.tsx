import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import type { ChatMessage, Citation } from '../../shared/chat'
import type { DispositionInput } from '../../shared/schemas'
import type { ItemVerdict, RecordDetail } from '../../shared/types'
import { askRecord, getRecord, recordDisposition, retryItem, subscribeToRecord } from '../api'
import { ChatModal } from '../chat/ChatModal'
import { followUpSuggestions, openingSuggestions } from '../chat/suggestions'
import type { TracedTool } from '../chat/ToolTrace'
import { Card, CardBody, CardHead } from '../components/Card'
import { ItemRow } from '../components/ItemRow'
import { StatusChip } from '../components/StatusChip'
import { ATTENTION_VERDICTS, VerdictFilters } from '../components/VerdictFilters'
import { Mascot } from '../mascot/Mascot'
import { count } from '../plural'

/**
 * The review document.
 *
 * It is the one screen in the product that is genuinely a document rather than a dashboard: a
 * paper read top to bottom, its items in the order an educator should work through them. So the
 * items keep the hairline rows DESIGN.md gives the sheet's own content, and the card grid is used
 * only to put a rail beside them.
 *
 * THE RAIL IS THE POINT OF THE CHANGE. The summary, the filters and the count of what is still
 * asking for a decision used to sit at the top of a page twelve items long, so by item four the
 * reader had lost every one of them and could not tell how much work was left without scrolling
 * back. They follow the reader down now.
 */
export function RecordWorkspace() {
  const { id = '' } = useParams()
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<ItemVerdict | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [tools, setTools] = useState<TracedTool[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const load = useCallback(() => {
    getRecord(id)
      .then(setRecord)
      .catch(() => setFailed(true))
  }, [id])

  useEffect(load, [load])
  useEffect(() => subscribeToRecord(id, load), [id, load])

  if (failed) {
    return (
      <Card>
        <CardBody>
          <h1 className="page-title">Record</h1>
          <p className="type-ui text-ink-muted">We could not open this record. It may have expired.</p>
        </CardBody>
      </Card>
    )
  }

  if (!record) {
    return (
      <Card>
        <CardBody>
          <div className="skeleton h-7 w-2/5" />
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-32 w-full" />
        </CardBody>
      </Card>
    )
  }

  // Flagged and undecided, which is what the sentence beside the chips says. The chips stay on the
  // machine's own tallies: they filter what Cekgu found, not what is left to do, and the two
  // numbers disagreeing after a decision is the point rather than a bug.
  const attentionCount = record.items.filter(
    (item) => ATTENTION_VERDICTS.includes(item.verdict) && item.dispositions.length === 0
  ).length
  const ordered = [...record.items].sort((a, b) => {
    const rank = (verdict: ItemVerdict) => (verdict === 'clear' ? 1 : 0)
    return rank(a.verdict) - rank(b.verdict) || a.position - b.position
  })
  const shown = filter ? ordered.filter((item) => item.verdict === filter) : ordered
  const decided = record.items.filter((item) => item.dispositions.length > 0).length

  async function onDisposition(itemId: string, input: DispositionInput) {
    setRecord(await recordDisposition(id, itemId, input))
  }

  async function onRetry(itemId: string) {
    setRecord(await retryItem(id, itemId))
  }

  // A citation pill is the claim that an answer came from THIS record, so following one has to land
  // on the item itself. The modal closes first: the item is behind it, and a scroll under an open
  // dialog moves something the reader cannot see.
  function onCite(citation: Citation) {
    if (citation.kind === 'receipt') return

    setChatOpen(false)
    setFilter(null)

    // After the close has painted, or the row is still under the backdrop when it is scrolled to.
    requestAnimationFrame(() => {
      const row = document.querySelector(`[data-item-position="${citation.position}"]`)
      row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  async function onAsk(question: string) {
    const asked: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      seat: null,
      text: question,
      citations: [],
      provenance: null
    }
    const history = [...messages, asked]
    setMessages(history)
    setTools([])
    setPending(true)

    try {
      // `messages`, not `history`: history already carries the question being asked, and the server
      // appends it again, so sending history put the same user turn in twice.
      const answer = await askRecord(id, question, messages, (event) =>
        setTools((seen) => [...seen, { ...event, id: crypto.randomUUID() }])
      )
      setMessages([...history, ...answer])
      // Fresh four after every answer, so the follow-ups track the conversation rather than
      // repeating the openers the reader has already dismissed once.
      setSuggestions(followUpSuggestions())
    } catch (error) {
      // The failure belongs in the transcript rather than in a toast: it is a turn in the
      // conversation, and a person needs to see which question did not get answered.
      setMessages([
        ...history,
        {
          id: crypto.randomUUID(),
          role: 'agent',
          seat: null,
          text: error instanceof Error ? error.message : 'The assistant could not answer that.',
          citations: [],
          provenance: null
        }
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title min-w-0">{record.title}</h1>
            <StatusChip status={record.status} />
            {record.isSample ? <span className="status-chip type-caption">Sample</span> : null}
          </div>
          <p className="type-caption mt-2 text-ink-muted">
            {record.subject} · {record.language === 'ms' ? 'Bahasa Malaysia' : 'English'} ·{' '}
            {count(record.items.length, 'question')}
          </p>
          {record.isSample ? (
            <p className="page-sub type-caption">
              This record is preserved benchmark evidence. Its questions, readings and verdicts cannot be edited or
              deleted.
            </p>
          ) : null}
        </div>
      </header>

      <div className="page-grid">
        <div className="col-span-12 xl:col-span-9">
          <Card flush>
            <CardHead
              title="Items"
              description="Anything asking for a decision first, then the questions that came back Clear."
              action={
                filter ? (
                  <button type="button" onClick={() => setFilter(null)} className="btn btn-ghost btn-sm">
                    Show All Items
                  </button>
                ) : undefined
              }
            />
            {shown.length === 0 ? (
              <div className="state-block" data-centre="true">
                <p className="type-ui">No item has that verdict.</p>
                <button type="button" onClick={() => setFilter(null)} className="btn btn-outline btn-sm">
                  Show All Items
                </button>
              </div>
            ) : (
              /* Hairlines, not tiles. DESIGN.md keeps level 0 for rows that are the sheet's own and
                 names the review document's items among them: these are the paper, read in order,
                 not a set of separate objects. */
              <ul className="m-0 list-none border-t border-rule p-0 px-5 sm:px-6">
                {shown.map((item) => (
                  <ItemRow key={item.id} item={item} onDisposition={onDisposition} onRetry={onRetry} readOnly={false} />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-span-12 order-first xl:order-none xl:col-span-3">
          <Card className="sticky-rail">
            <CardHead title="Summary" />
            <CardBody>
              {/* The chips are both the counts and the filter, so the same numbers are never printed
                  twice. DESIGN.md Layout. */}
              <VerdictFilters counts={record.counts} active={filter} onChange={setFilter} />
            </CardBody>
            <div className="card-foot">
              <div>
                {/* The number asking for a decision, so it is the one count in pen red.
                    DESIGN.md Colour.

                    Figure and phrase stay in one element. The demo acceptance test reads this line
                    as a single string, and it is also how a person reads it: "4 items need
                    attention" is one fact, not a number with a caption under it. */}
                <p className="attention-line" data-none={attentionCount === 0 ? 'true' : undefined}>
                  <span className="attention-figure">{attentionCount}</span>{' '}
                  {attentionCount === 1 ? 'item needs' : 'items need'} attention
                </p>
                {decided > 0 ? (
                  <p className="type-caption mt-2 text-ink-muted">
                    {count(decided, 'decision')} recorded. The verdicts above do not move when you decide.
                  </p>
                ) : null}
              </div>
            </div>

            <Mascot
              record={record}
              chatOpen={chatOpen}
              onOpenChat={() => {
                // Rolled on open rather than on mount, so a second visit to the same record offers
                // a different four.
                if (messages.length === 0) setSuggestions(openingSuggestions(record))
                setChatOpen(true)
              }}
            />
          </Card>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        messages={messages}
        pending={pending}
        tools={tools}
        suggestions={suggestions}
        onClose={() => setChatOpen(false)}
        onSend={onAsk}
        onCite={onCite}
      />
    </>
  )
}
