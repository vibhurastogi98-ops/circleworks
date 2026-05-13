import type { WorkerOptions } from "bullmq";

/** Sec. 02 — 3 retries after initial attempt: delays 1s, 5s, 30s between attempts */
export const SEC02_RETRY_BACKOFF_MS = [1000, 5000, 30000] as const;

export const sec02WorkerSettings: NonNullable<WorkerOptions["settings"]> = {
  backoffStrategy: (attemptsMade: number): number => {
    return SEC02_RETRY_BACKOFF_MS[Math.min(attemptsMade - 1, SEC02_RETRY_BACKOFF_MS.length - 1)] ?? 30000;
  },
};
