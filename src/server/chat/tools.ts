import { attentionItems, SEAT_LABEL, type Seat, seatedAttempts } from '../../shared/chat'
import type { Item, ItemVerdict, RecordDetail } from '../../shared/types'

export type ToolName = 'record_summary' | 'list_items' | 'get_item' | 'get_readings' | 'get_attempts'
export type ToolResult = { ok: true; data: unknown } | { ok: false; error: string }

function truncateStem(stem: string): string {
  const chars = [...stem]
  if (chars.length <= 160) return stem
  return `${chars.slice(0, 159).join('')}…`
}

function isItemVerdict(value: unknown): value is ItemVerdict {
  return (
    value === 'clear' ||
    value === 'possible_key_error' ||
    value === 'possible_ambiguity' ||
    value === 'split_opinion' ||
    value === 'unverified' ||
    value === 'pending'
  )
}

function resolveItem(record: RecordDetail, position: unknown): { ok: true; item: Item } | { ok: false; error: string } {
  if (typeof position !== 'number' || !Number.isFinite(position)) {
    return { ok: false, error: 'Position is required and must be a number.' }
  }
  const item = record.items.find((i) => i.position === position)
  if (!item) return { ok: false, error: `No item at position ${position} in this record.` }
  return { ok: true, item }
}

export function recordSummary(record: RecordDetail): ToolResult {
  return {
    ok: true,
    data: {
      title: record.title,
      subject: record.subject,
      language: record.language,
      status: record.status,
      itemCount: record.items.length,
      attentionCount: attentionItems(record).length,
      counts: record.counts
    }
  }
}

export function listItems(record: RecordDetail, verdict?: unknown): ToolResult {
  if (verdict !== undefined && !isItemVerdict(verdict)) {
    return { ok: false, error: `Invalid verdict: ${verdict}.` }
  }
  const data = record.items
    .filter((item) => verdict === undefined || item.verdict === verdict)
    .map((item) => ({
      position: item.position,
      stem: truncateStem(item.stem),
      verdict: item.verdict,
      verdictReason: item.verdictReason,
      decided: item.dispositions.length > 0
    }))
  return { ok: true, data }
}

export function getItem(record: RecordDetail, position: unknown): ToolResult {
  const resolved = resolveItem(record, position)
  if (!resolved.ok) return resolved
  const item = resolved.item
  return {
    ok: true,
    data: {
      position: item.position,
      stem: item.stem,
      options: item.options,
      key: item.key,
      verdict: item.verdict,
      verdictReason: item.verdictReason,
      attemptsUsed: item.attemptsUsed,
      dispositions: item.dispositions
    }
  }
}

export function getReadings(record: RecordDetail, position: unknown): ToolResult {
  const resolved = resolveItem(record, position)
  if (!resolved.ok) return resolved
  const item = resolved.item
  const seated = seatedAttempts(item)
  const data: unknown[] = []
  for (const [index, attempt] of seated.entries()) {
    if (!attempt.reading) continue
    if (index !== 0 && index !== 1) continue
    const seat: Seat = index
    data.push({
      seat,
      seatLabel: SEAT_LABEL[seat],
      model: attempt.servedModel,
      requestId: attempt.requestId,
      receiptStatus: attempt.receiptStatus,
      answer: attempt.reading.answer,
      defensible: attempt.reading.defensible,
      reason: attempt.reading.reason
    })
  }
  return { ok: true, data }
}

export function getAttempts(record: RecordDetail, position: unknown): ToolResult {
  const resolved = resolveItem(record, position)
  if (!resolved.ok) return resolved
  const item = resolved.item
  const data = item.attempts.map((attempt) => ({
    requestedModel: attempt.requestedModel,
    servedModel: attempt.servedModel,
    requestId: attempt.requestId,
    receiptStatus: attempt.receiptStatus,
    httpStatus: attempt.httpStatus,
    latencyMs: attempt.latencyMs,
    admitted: attempt.admitted,
    rejectionReason: attempt.rejectionReason
  }))
  return { ok: true, data }
}

export function runTool(record: RecordDetail, name: string, args: Record<string, unknown>): ToolResult {
  switch (name) {
    case 'record_summary':
      return recordSummary(record)
    case 'list_items':
      return listItems(record, args.verdict)
    case 'get_item':
      return getItem(record, args.position)
    case 'get_readings':
      return getReadings(record, args.position)
    case 'get_attempts':
      return getAttempts(record, args.position)
    default:
      return { ok: false, error: `Unknown tool: ${name}.` }
  }
}
