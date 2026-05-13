import Redis from "ioredis";
import { cacheKeys, cacheTtlSec } from "@/lib/cache-keys";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!redis) {
    redis = new Redis(url, { maxRetriesPerRequest: 2, enableReadyCheck: true });
  }
  return redis;
}

export async function setCacheJson(key: string, value: unknown, ttlSec: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.set(key, JSON.stringify(value), "EX", ttlSec);
}

export async function getCacheJson<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  const raw = await r.get(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function delCacheKeys(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (!r || keys.length === 0) return;
  await r.del(...keys);
}

/** Invalidate employee-related caches after any employee mutation. */
export async function invalidateEmployeeCaches(companyId: number, employeeId?: number): Promise<void> {
  const keys = [cacheKeys.companyEmployees(companyId), cacheKeys.companyDashboard(companyId)];
  if (employeeId != null) keys.push(cacheKeys.employeeProfile(employeeId));
  await delCacheKeys(...keys);
}
