import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { ReceiptLookup } from '../../shared/types'
import { getReceipt } from '../api'
import { Card, CardBody, CardHead } from '../components/Card'
import { ExternalLink } from '../components/ExternalLink'
import { ChevronLeftIcon } from '../components/icons'

export const RECEIPT_BASE = 'https://api.gonkarouter.io/v1/receipts/'

/** The route this product links to for a request id. The gateway URL is shown, never navigated. */
export const receiptPath = (requestId: string) => `/receipt/${encodeURIComponent(requestId)}`

function ms(value: number | null): string {
  if (value === null) return 'not reported'
  return value < 1000 ? `${value} ms` : `${(value / 1000).toFixed(1)} s`
}

function when(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="type-caption">{label}</dt>
      <dd className="type-mono break-all">{children}</dd>
    </>
  )
}

/**
 * One request id, and what the gateway says about it.
 *
 * The link this replaces went straight to the gateway's JSON. That is honest but unreadable: a
 * judge following it during Q&A got a wall of snake_case in a browser tab and had to be told what
 * they were looking at. This page names every field, then hands them the same raw URL so they can
 * check that this page is not making it up.
 *
 * The lookup goes through our own server because api.gonkarouter.io sends no
 * Access-Control-Allow-Origin, so a browser on this origin cannot read the response directly. The
 * route is a read-through and adds nothing: the endpoint behind it needs no key, which is what
 * makes the raw link below worth offering.
 */
export function ReceiptView() {
  const { requestId = '' } = useParams()
  const [lookup, setLookup] = useState<ReceiptLookup | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setLookup(null)
    setFailed(false)
    getReceipt(requestId)
      .then(setLookup)
      .catch(() => setFailed(true))
  }, [requestId])

  const raw = `${RECEIPT_BASE}${requestId}`
  const receipt = lookup?.receipt ?? null

  return (
    <>
      <header className="page-head">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="type-caption inline-flex items-center gap-1 text-ink-muted hover:text-ink"
          >
            <ChevronLeftIcon size={15} />
            Back
          </button>
          <h1 className="page-title mt-3">Gonka Receipt</h1>
          <p className="type-mono mt-2 break-all text-ink-muted">{requestId}</p>
        </div>
      </header>

      <div className="page-grid">
        <Card className="col-span-12 lg:col-span-7">
          <CardHead
            title="What the Gateway Recorded"
            description="Read from the gateway's public receipts endpoint at the moment this page loaded. Nothing here is stored by Cekgu."
          />
          <CardBody>
            {failed ? (
              <p className="type-ui text-ink-muted">We could not reach our own server to look this up.</p>
            ) : lookup === null ? (
              <div className="grid gap-3">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            ) : receipt ? (
              <dl className="fact-list type-ui">
                <Row label="Served model">{receipt.model}</Row>
                <Row label="Outcome">
                  {receipt.outcome} · {receipt.status_code}
                </Row>
                <Row label="Recorded at">{when(receipt.created_at)}</Row>
                <Row label="Devshard">{receipt.x_devshard_id ?? 'not reported'}</Row>
                <Row label="Tokens">{receipt.total_tokens ?? 'not reported'}</Row>
                <Row label="Time to first token">{ms(receipt.ttft_ms)}</Row>
                <Row label="Duration">{ms(receipt.duration_ms)}</Row>
                <Row label="Streamed">{receipt.stream ? 'yes' : 'no'}</Row>
              </dl>
            ) : (
              /* Three different facts, and the page says which. A receipt that was never written
                 is the gateway answering; a gateway we could not reach is not an answer. */
              <p className="type-ui text-ink-muted">
                {lookup.status === 'invalid'
                  ? 'That is not a Gonka request id. They are shaped req-<number>-<number>.'
                  : lookup.status === 'unreachable'
                    ? 'The gateway did not answer just now. The receipt may still exist; try the link below.'
                    : 'The gateway has no receipt for this request id.'}
              </p>
            )}
          </CardBody>

          {lookup?.status === 'not_found' ? (
            <div className="card-foot">
              <p className="type-caption max-w-[62ch] text-ink-muted">
                A receipt is written a moment after the response, so a very recent call can read as absent. An id from a
                call that was rejected before it reached a model never gets one at all.
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHead title="Check It Yourself" />
          <CardBody>
            <p className="type-ui text-ink-muted">
              The endpoint is public and needs no key. Open it and compare it against the fields on the left.
            </p>
            <div className="rounded-control bg-well p-3">
              <p className="type-mono break-all">{raw}</p>
            </div>
            <ExternalLink href={raw} className="btn btn-outline">
              Open the Gateway Receipt
            </ExternalLink>
            <p className="type-caption text-ink-muted">
              It is gateway metadata, not cryptographic proof and not an on-chain transaction. It records that the
              gateway logged a call and which model served it.
            </p>
          </CardBody>
          <div className="card-foot">
            <Link to="/sample" className="btn btn-ghost btn-sm">
              See a Record These Came From
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}
