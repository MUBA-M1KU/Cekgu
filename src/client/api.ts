import type { CreateRecordInput } from '../shared/schemas'

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
