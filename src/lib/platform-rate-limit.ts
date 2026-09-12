/**
 * Rate limiting for /api/platform.
 * Uses ioredis if REDIS_URL is set, otherwise a per-process in-memory bucket
 * (safe for dev, and MVP-acceptable if we ship on a single Vercel region;
 * moving to Upstash Redis is a follow-up config change, not a code change).
 * See docs/platform-admin-spec.md §8.
 */

import Redis from "ioredis";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  redis.connect().catch(() => undefined);
  return redis;
}

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit({ key, limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const r = getRedis();
  if (r) {
    try {
      const bucketKey = `rl:${key}`;
      const count = await r.incr(bucketKey);
      if (count === 1) await r.pexpire(bucketKey, windowMs);
      const ttl = await r.pttl(bucketKey);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt: Date.now() + Math.max(0, ttl),
      };
    } catch {
      // Fall through to memory
    }
  }
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function clientKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}
