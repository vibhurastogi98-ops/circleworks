/** Sec. 02 — BullMQ queue names */
export const QUEUE_PAYROLL_PROCESSING = "payroll-processing";
export const QUEUE_EMAIL_DELIVERY = "email-delivery";
export const QUEUE_PDF_GENERATION = "pdf-generation";
export const QUEUE_SYNC_ACCOUNTING = "sync-accounting";
export const QUEUE_ATS_SCORING = "ats-scoring";

export const QUEUE_NAMES = [
  QUEUE_PAYROLL_PROCESSING,
  QUEUE_EMAIL_DELIVERY,
  QUEUE_PDF_GENERATION,
  QUEUE_SYNC_ACCOUNTING,
  QUEUE_ATS_SCORING,
] as const;
