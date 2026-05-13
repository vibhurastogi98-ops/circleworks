/**
 * In-process ring buffer of realtime events per company (Sec. 02 REST fallback).
 * For multi-instance production, back this with Redis or a durable event store.
 */

const MAX_PER_COMPANY = 500;
const buffers = new Map<number, RealtimeEventRecord[]>();

export type RealtimeEventRecord = {
  id: string;
  ts: string;
  type: string;
  payload: Record<string, unknown>;
};

function push(companyId: number, rec: RealtimeEventRecord) {
  const list = buffers.get(companyId) ?? [];
  list.push(rec);
  if (list.length > MAX_PER_COMPANY) {
    list.splice(0, list.length - MAX_PER_COMPANY);
  }
  buffers.set(companyId, list);
}

export function recordCompanyRealtimeEvent(
  companyId: number,
  type: string,
  payload: Record<string, unknown> = {}
): RealtimeEventRecord {
  const ts = new Date().toISOString();
  const id = `${companyId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const rec: RealtimeEventRecord = { id, ts, type, payload };
  push(companyId, rec);
  return rec;
}

export function getCompanyEventsSince(companyId: number, sinceIso: string): RealtimeEventRecord[] {
  const sinceMs = Date.parse(sinceIso);
  if (Number.isNaN(sinceMs)) return [];
  const list = buffers.get(companyId) ?? [];
  return list.filter((e) => Date.parse(e.ts) > sinceMs);
}
