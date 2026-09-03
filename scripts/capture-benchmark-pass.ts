// A real benchmark pass, run through the product's own queue against the live gateway. Every
// reading, request id and receipt in the output came from a call this script made; nothing is
// written by hand. Authorised by AlaskanTuna on 3 September.
//
// The paper is a twelve-item subset of the committed evaluation set, not a reconstruction, so the
// sample's questions can be diffed against a file in git. Selection rule, applied in file order:
// the two mis-keyed items three-day-rescore.md names by name, the first two ambiguous items, and
// the first eight clean items. The twelve are then emitted in the evaluation set's own order.
process.env.DATABASE_URL ??= 'postgres://cekgu@localhost:5432/cekgu'

const OUT = './src/server/fixtures/benchmark-pass.json'

const { callGonka } = await import('../src/server/gateway/client')
const { solverPrompt } = await import('../src/server/gateway/reading')
const { runRound } = await import('../src/server/queue/round')
const { healthyOrder, recordOutcome } = await import('../src/server/queue/health')
const { Semaphore } = await import('../src/server/queue/semaphore')

type EvalItem = {
  id: string
  intended: 'clean' | 'mis_keyed' | 'ambiguous'
  stem: string
  options: { letter: string; text: string }[]
  key: string
}

const set = await Bun.file('./src/server/fixtures/evaluation-set.json').json()
const all: EvalItem[] = set.items

const NAMED_MIS_KEYS = ['fifo-structure', 'dns-role']
const chosen = new Set<string>(NAMED_MIS_KEYS)
for (const item of all.filter((i) => i.intended === 'ambiguous').slice(0, 2)) chosen.add(item.id)
for (const item of all.filter((i) => i.intended === 'clean').slice(0, 8)) chosen.add(item.id)

const paper = all.filter((item) => chosen.has(item.id))
if (paper.length !== 12) throw new Error(`selected ${paper.length} items, expected 12`)

const design: Record<string, number> = {}
for (const item of paper) design[item.intended] = (design[item.intended] ?? 0) + 1
console.log(`paper: ${paper.length} items ${JSON.stringify(design)}`)
console.log(`order: ${paper.map((i) => i.id).join(', ')}\n`)

const gate = new Semaphore(4)
const out: unknown[] = []
const started = Date.now()
let verifiedItems = 0

for (const [index, spec] of paper.entries()) {
  const prompt = solverPrompt({ stem: spec.stem, options: spec.options }, set.subject, set.language)
  const attempts: Record<string, unknown>[] = []

  const result = await runRound(prompt, spec.options, spec.key, {
    call: async (model: string, text: string) => {
      const release = await gate.acquire()
      try {
        return await callGonka(model, text)
      } finally {
        release()
      }
    },
    order: () => healthyOrder(),
    onOutcome: recordOutcome,
    onAttempt: async (attempt: Record<string, unknown>) => {
      attempts.push({
        requestedModel: attempt.requestedModel,
        servedModel: attempt.servedModel,
        requestId: attempt.requestId,
        devshardId: attempt.devshardId,
        fallbackHeader: attempt.fallbackHeader,
        httpStatus: attempt.httpStatus,
        receiptStatus: attempt.receiptStatus,
        receiptJson: attempt.receiptJson,
        readingJson: attempt.readingJson,
        latencyMs: attempt.latencyMs,
        // AttemptRow carries both as real Dates. Dropping them made every seeded attempt share its
        // item's insert time, which left the attempts table with no order to sort by.
        startedAt: attempt.startedAt.toISOString(),
        finishedAt: attempt.finishedAt.toISOString(),
        admitted: attempt.admitted,
        rejectionReason: attempt.rejectionReason
      })
    }
  })

  if (result.verdict !== 'unverified') verifiedItems += 1
  out.push({ stem: spec.stem, options: spec.options, key: spec.key, attempts })

  const models = new Set(attempts.filter((a) => a.admitted).map((a) => a.servedModel))
  console.log(
    `[${String(index + 1).padStart(2)}/12] ${spec.id.padEnd(24)} ${spec.intended.padEnd(10)} ` +
      `-> ${result.verdict.padEnd(19)} ${attempts.length} attempts, ${models.size} distinct models ` +
      `(${Math.round((Date.now() - started) / 1000)}s)`
  )

  await Bun.write(
    OUT,
    `${JSON.stringify(
      {
        pass: 'capture-2026-09-03',
        capturedAt: new Date().toISOString(),
        record: { title: set.title, subject: set.subject, language: set.language, context: set.context },
        items: out
      },
      null,
      2
    )}\n`
  )
}

console.log(`\n${verifiedItems} of 12 items reached a verdict, in ${Math.round((Date.now() - started) / 1000)}s`)
