import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  QUEUE_ATS_SCORING,
  QUEUE_EMAIL_DELIVERY,
  QUEUE_PAYROLL_PROCESSING,
  QUEUE_PDF_GENERATION,
  QUEUE_SYNC_ACCOUNTING,
} from "./queue.constants";
import {
  AtsScoringConsumer,
  EmailDeliveryConsumer,
  PayrollProcessingConsumer,
  PdfGenerationConsumer,
  SyncAccountingConsumer,
} from "./queue-processors";
import { QueuesDlqListener } from "./queues-dlq.listener";

function redisConnectionOptions(config: ConfigService) {
  const urlStr = config.get<string>("REDIS_URL") || "redis://127.0.0.1:6379";
  const u = new URL(urlStr);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
    username: u.username || undefined,
  };
}

/** Sec. 02 — 1 initial attempt + 3 retries; backoff delays via worker settings */
const defaultJobOptions = {
  attempts: 4,
  backoff: { type: "custom" as const },
};

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: redisConnectionOptions(config),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: QUEUE_PAYROLL_PROCESSING, defaultJobOptions }),
    BullModule.registerQueue({ name: QUEUE_EMAIL_DELIVERY, defaultJobOptions }),
    BullModule.registerQueue({ name: QUEUE_PDF_GENERATION, defaultJobOptions }),
    BullModule.registerQueue({ name: QUEUE_SYNC_ACCOUNTING, defaultJobOptions }),
    BullModule.registerQueue({ name: QUEUE_ATS_SCORING, defaultJobOptions }),
  ],
  providers: [
    PayrollProcessingConsumer,
    EmailDeliveryConsumer,
    PdfGenerationConsumer,
    SyncAccountingConsumer,
    AtsScoringConsumer,
    QueuesDlqListener,
  ],
})
export class QueuesModule {}
