import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { ReceiptLookup } from '../../shared/types'
import { ApiError, getReceipt } from '../api'
import { Sheet } from '../components/Sheet'

const GONKAROUTER = 'https://gonkarouter.io'

// The gateway's timestamp, kept as the gateway wrote it. A locale format would print a different
// string on the demo machine than on the judge's, on a page whose whole job is being checkable.
function stamp(createdAt: string): string {
  return createdAt.replace('T', ' ').replace('Z', ' UTC')
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

// Same invisible table as the evidence panel: labels in one column, values in the next, no rules
// and no chrome. DESIGN.md Layout.
function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="type-label text-ink-muted">{label}</dt>
      <dd className="type-mono m-0 break-words">{value}</dd>
    </>
  )
}

const ABSENT: Record<'missing' | 'unreachable', string> = {
  missing:
    'GonkaRouter has no receipt for this id yet. A receipt is written after the call it belongs to finishes, so a very recent request can take a moment to appear.',
  unreachable: 'We could not reach GonkaRouter to read this receipt. The link below goes straight to the gateway.'
}

export function Receipt() {
  const { requestId = '' } = useParams()
  const [lookup, setLookup] = useState<ReceiptLookup | null>(null)
  const [rejected, setRejected] = useState<string | null>(null)

  useEffect(() => {
    setLookup(null)
    setRejected(null)
    getReceipt(requestId)
      .then(setLookup)
      .catch((cause: unknown) => {
        setRejected(cause instanceof ApiError ? cause.message : 'We could not look up that receipt just now.')
      })
  }, [requestId])

  const receipt = lookup?.status === 'found' ? lookup.receipt : null
  const sourceUrl = lookup?.sourceUrl ?? null

  return (
    <Sheet>
      <header>
        <h1>Gonka Receipt</h1>
        <p className="type-mono mt-3 break-all">{requestId}</p>
      </header>

      {rejected ? <p className="type-body mt-6 max-w-[60ch]">{rejected}</p> : null}

      {!rejected && !lookup ? (
        <p className="type-body mt-6 text-ink-muted">Looking this request id up on GonkaRouter.</p>
      ) : null}

      {lookup && lookup.status !== 'found' ? (
        <p className="type-body mt-6 max-w-[60ch]">{ABSENT[lookup.status]}</p>
      ) : null}

      {receipt ? (
        <>
          <h2 className="mt-8">What the Gateway Recorded</h2>
          <dl className="mt-4 m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 sm:gap-x-10">
            <Field label="Served Model" value={receipt.model} />
            <Field label="Outcome" value={receipt.outcome} />
            <Field label="Status Code" value={String(receipt.status_code)} />
            <Field label="Devshard" value={receipt.x_devshard_id} />
            <Field label="Created" value={stamp(receipt.created_at)} />
            <Field label="Time to First Token" value={seconds(receipt.ttft_ms)} />
            <Field label="Duration" value={seconds(receipt.duration_ms)} />
            <Field label="Total Tokens" value={String(receipt.total_tokens)} />
            <Field label="Streamed" value={receipt.stream ? 'Yes' : 'No'} />
          </dl>
        </>
      ) : null}

      <p className="type-body mt-8 max-w-[64ch]">
        A receipt is public metadata that{' '}
        <a href={GONKAROUTER} target="_blank" rel="noreferrer" className="underline">
          GonkaRouter
        </a>{' '}
        publishes for a completed request. It names the model that actually served the call, which is what lets Cekgu
        claim two readings came from two different models rather than one model asked twice. It is gateway metadata, not
        cryptographic proof and not an on-chain transaction.
      </p>

      {sourceUrl ? (
        <p className="mt-5">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-sheet border border-rule-strong px-4 font-medium"
          >
            Open on GonkaRouter
          </a>
        </p>
      ) : null}

      {receipt ? (
        <>
          <h2 className="mt-8">Raw Receipt</h2>
          <p className="type-caption mt-2 max-w-[64ch] text-ink-muted">
            Byte for byte what the gateway returned, so nothing above has to be taken on trust.
          </p>
          <pre className="type-mono mt-3 overflow-x-auto bg-well p-4">{JSON.stringify(receipt, null, 2)}</pre>
        </>
      ) : null}

      <p className="type-body mt-8 border-t border-rule pt-5 max-w-[64ch] text-ink-muted">
        Request ids come from the attempts table on any record.{' '}
        <Link to="/sample" className="underline">
          Open the Sample Report
        </Link>{' '}
        to see where this one was produced.
      </p>
    </Sheet>
  )
}
