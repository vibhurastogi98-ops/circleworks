import { Worker, type Job } from "bullmq";

import { QUEUE_AUTOMATION_RUNS, bullmqConnectionFromEnv } from "@/lib/bullmq-redis";
import type { AutomationQueuePayload } from "@/lib/automations/queue";
import { processAutomationRun } from "@/lib/automations/processor";

export function createAutomationWorker() {
  const connection = bullmqConnectionFromEnv();
  if (!connection) {
    throw new Error("REDIS_URL is required to start the automation worker");
  }

  return new Worker<AutomationQueuePayload>(
    QUEUE_AUTOMATION_RUNS,
    async (job: Job<AutomationQueuePayload>) => {
      await processAutomationRun(job.data.runId);
      return { runId: job.data.runId };
    },
    {
      connection,
      concurrency: 5,
      autorun: true,
    },
  );
}
