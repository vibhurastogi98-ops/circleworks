import type { ConnectionOptions } from "bullmq";

export const QUEUE_PDF_GENERATION = "pdf-generation";
export const QUEUE_AUTOMATION_RUNS = "automation-runs";

/** Parse `REDIS_URL` for BullMQ (matches backend `queues.module.ts`). */
export function bullmqConnectionFromEnv(): ConnectionOptions | null {
  const urlStr = process.env.REDIS_URL;
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 6379,
      password: u.password || undefined,
      username: u.username || undefined,
    };
  } catch {
    return null;
  }
}
