import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueEvents } from "bullmq";
import { QUEUE_NAMES } from "./queue.constants";

function connectionFromRedisUrl(urlStr: string) {
  const u = new URL(urlStr);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
    username: u.username || undefined,
  };
}

/**
 * After all retries exhausted, BullMQ emits failed on QueueEvents — log as admin/DLQ alert (Sec. 02).
 */
@Injectable()
export class QueuesDlqListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueuesDlqListener.name);
  private listeners: QueueEvents[] = [];

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>("REDIS_URL") || "redis://127.0.0.1:6379";
    const connection = connectionFromRedisUrl(url);

    for (const name of QUEUE_NAMES) {
      const qe = new QueueEvents(name, { connection });
      qe.on("failed", ({ jobId, failedReason }) => {
        this.logger.error(
          `[DLQ / admin alert] Queue "${name}" job ${jobId} exhausted retries: ${failedReason}`,
        );
      });
      void qe.waitUntilReady().catch((err) => this.logger.warn(`QueueEvents ${name} ready: ${err}`));
      this.listeners.push(qe);
    }
  }

  async onModuleDestroy() {
    await Promise.allSettled(this.listeners.map((l) => l.close()));
    this.listeners = [];
  }
}
