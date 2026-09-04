import type { CreateRecordInput, DispositionInput } from '../shared/schemas'
import type { AccountStats, Health, ReceiptLookup, RecordDetail, RecordSummary } from '../shared/types'

export type CreateRecordResponse = { id: string; status: string; itemCount: number; expiresAt: string | null }

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

// The records API is #29. Until it lands, VITE_MOCK_API=true answers the contract from
// TRD section 15 so the screens can be built and looked at. import.meta.env is statically
// replaced at build time, so none of this survives a production bundle.
const MOCK = import.meta.env.VITE_MOCK_API === 'true'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { code: string; message: string } } | null
    throw new ApiError(
      body?.error?.code ?? 'unknown',
      body?.error?.message ?? 'Something went wrong, try again in a moment.',
      response.status
    )
  }

  return (await response.json()) as T
}

export async function createRecord(input: CreateRecordInput): Promise<CreateRecordResponse> {
  if (MOCK) {
    return {
      id: crypto.randomUUID(),
      status: 'queued',
      itemCount: input.items.length,
      expiresAt: null
    }
  }

  return request<CreateRecordResponse>('/api/records', { method: 'POST', body: JSON.stringify(input) })
}

export async function getRecord(id: string): Promise<RecordDetail> {
  if (MOCK) {
    const { mockRecord } = await import('./mock-record')
    return mockRecord(id)
  }

  return request<RecordDetail>(`/api/records/${id}`)
}

export async function recordDisposition(
  recordId: string,
  itemId: string,
  input: DispositionInput
): Promise<RecordDetail> {
  if (MOCK) {
    const { mockDisposition, mockRecord } = await import('./mock-record')
    mockDisposition(itemId, input)
    return mockRecord(recordId)
  }

  await request(`/api/records/${recordId}/items/${itemId}/disposition`, {
    method: 'POST',
    body: JSON.stringify(input)
  })
  return getRecord(recordId)
}

export async function retryItem(recordId: string, itemId: string): Promise<RecordDetail> {
  if (MOCK) return getRecord(recordId)

  await request(`/api/records/${recordId}/items/${itemId}/retry`, { method: 'POST' })
  return getRecord(recordId)
}

// FR-QUEUE-4: the workspace follows a checking record over SSE and falls back to polling
// GET /api/records/:id every 3 seconds if the stream will not open or drops twice.
export function subscribeToRecord(id: string, onChange: () => void): () => void {
  if (MOCK) return () => {}

  let drops = 0
  let source: EventSource | null = null
  let poll: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    if (poll) return
    poll = setInterval(onChange, 3000)
  }

  function open() {
    source = new EventSource(`/api/records/${id}/events`)
    source.addEventListener('item', onChange)
    source.addEventListener('record', onChange)
    source.onerror = () => {
      source?.close()
      drops += 1
      if (drops >= 2) startPolling()
      else open()
    }
  }

  open()

  return () => {
    source?.close()
    if (poll) clearInterval(poll)
  }
}

export type RecordQuery = { q?: string; status?: string; attention?: boolean }

export async function listRecords(query: RecordQuery = {}): Promise<RecordSummary[]> {
  if (MOCK) {
    const { mockRecordList } = await import('./mock-record')
    return mockRecordList(query)
  }

  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.status) params.set('status', query.status)
  if (query.attention) params.set('attention', 'true')
  const suffix = params.size > 0 ? `?${params}` : ''

  const body = await request<{ records: RecordSummary[] }>(`/api/records${suffix}`)
  return body.records
}

export type DeleteResult = {
  deleted: string[]
  skipped: { id: string; reason: string }[]
  mode: 'trash' | 'immediate'
}

export async function deleteRecords(ids: string[]): Promise<DeleteResult> {
  if (MOCK) {
    const { mockDelete } = await import('./mock-record')
    return mockDelete(ids)
  }

  return request<DeleteResult>('/api/records', { method: 'DELETE', body: JSON.stringify({ ids }) })
}

// FR-RECORD-8. Erasure of everything the account holds, Trash included. Distinct from
// deleteRecords, which is per-record and soft for a private account.
export async function deleteAllRecords(): Promise<DeleteResult> {
  return request<DeleteResult>('/api/account/records', { method: 'DELETE' })
}

export async function getHealth(): Promise<Health> {
  if (MOCK) return { models: [], windowMinutes: 15, mascotEnabled: true }

  return request<Health>('/api/health')
}

export async function getStats(): Promise<AccountStats> {
  if (MOCK) {
    const { mockStats } = await import('./mock-record')
    return mockStats()
  }

  return request<AccountStats>('/api/stats')
}

// Through our own server, never the gateway directly: api.gonkarouter.io sends no
// Access-Control-Allow-Origin, so a browser on this origin cannot read the response even though
// anyone can curl it. The route is a read-through and adds no authority.
export async function getReceipt(requestId: string): Promise<ReceiptLookup> {
  return request<ReceiptLookup>(`/api/receipts/${encodeURIComponent(requestId)}`)
}

// Better Auth's own sign-out. It answers 403 without an Origin header, which a browser always
// sends, so this works from the app and not from a bare curl.
export async function signOut(): Promise<void> {
  await request<{ success: boolean }>('/api/auth/sign-out', { method: 'POST', body: '{}' })
}

export async function getSample(): Promise<RecordDetail> {
  if (MOCK) {
    const { mockRecord } = await import('./mock-record')
    return mockRecord('sample')
  }

  return request<RecordDetail>('/api/sample')
}
