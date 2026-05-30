import { Queue } from "bullmq";

import { QUEUE_AUTOMATION_RUNS, bullmqConnectionFromEnv } from "@/lib/bullmq-redis";

export type AutomationQueuePayload = {
  automationId: number;
  runId: number;
  triggerEvent: string;
  context?: Record<string, unknown>;
};

export async function enqueueAutomationRun(payload: AutomationQueuePayload) {
  const connection = bullmqConnectionFromEnv();
  if (!connection) {
    return { queued: false, reason: "skipped-no-redis" as const, jobId: null };
  }

  const queue = new Queue<AutomationQueuePayload>(QUEUE_AUTOMATION_RUNS, { connection });
  try {
    const job = await queue.add("automation.run", payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 30_000 },
      removeOnComplete: 500,
      removeOnFail: 1_000,
    });

    return {
      queued: true,
      reason: "queued" as const,
      jobId: job.id != null ? String(job.id) : null,
    };
  } finally {
    await queue.close();
  }
}
