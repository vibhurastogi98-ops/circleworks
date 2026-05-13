import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import {
  QUEUE_ATS_SCORING,
  QUEUE_EMAIL_DELIVERY,
  QUEUE_PAYROLL_PROCESSING,
  QUEUE_PDF_GENERATION,
  QUEUE_SYNC_ACCOUNTING,
} from "./queue.constants";
import { sec02WorkerSettings } from "./sec02-worker-settings";

/**
 * Stub processors — replace with real payroll / email / PDF / GL sync / ATS logic.
 * Concurrency matches Sec. 02 architecture (per-queue global worker concurrency).
 */
@Processor({ name: QUEUE_PAYROLL_PROCESSING }, { concurrency: 2, settings: sec02WorkerSettings })
export class PayrollProcessingConsumer extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessingConsumer.name);
  async process(job: Job): Promise<void> {
    this.logger.debug(`payroll-processing ${job.id}`);
  }
}

@Processor({ name: QUEUE_EMAIL_DELIVERY }, { concurrency: 50, settings: sec02WorkerSettings })
export class EmailDeliveryConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailDeliveryConsumer.name);
  async process(job: Job): Promise<void> {
    this.logger.debug(`email-delivery ${job.id}`);
  }
}

@Processor({ name: QUEUE_PDF_GENERATION }, { concurrency: 10, settings: sec02WorkerSettings })
export class PdfGenerationConsumer extends WorkerHost {
  private readonly logger = new Logger(PdfGenerationConsumer.name);
  async process(job: Job): Promise<void> {
    if (job.name === "payroll-run-report") {
      this.logger.log(
        `pdf-generation payroll-run-report job=${job.id} runId=${(job.data as { runId?: string })?.runId} companyId=${(job.data as { companyId?: number })?.companyId}`
      );
      return;
    }
    this.logger.debug(`pdf-generation ${job.id} name=${job.name}`);
  }
}

@Processor({ name: QUEUE_SYNC_ACCOUNTING }, { concurrency: 5, settings: sec02WorkerSettings })
export class SyncAccountingConsumer extends WorkerHost {
  private readonly logger = new Logger(SyncAccountingConsumer.name);
  async process(job: Job): Promise<void> {
    this.logger.debug(`sync-accounting ${job.id}`);
  }
}

@Processor({ name: QUEUE_ATS_SCORING }, { concurrency: 20, settings: sec02WorkerSettings })
export class AtsScoringConsumer extends WorkerHost {
  private readonly logger = new Logger(AtsScoringConsumer.name);
  async process(job: Job): Promise<void> {
    this.logger.debug(`ats-scoring ${job.id}`);
  }
}
