/**
 * lib/uploadLimits.ts — Section 35: File Upload Limits & Validation
 *
 * Upload constraints:
 *   Employee documents:  max 25MB, types: PDF / JPG / PNG / DOCX
 *   CSV imports:         max 10MB, max 5,000 rows
 *   Company logo:        max 2MB,  types: PNG / JPG / SVG
 *
 * On violation, return 413 with { error: 'file_too_large', max_size_mb: N }
 */

import { NextResponse } from "next/server";

// ─── Config ───────────────────────────────────────────────────────────────────

export const UPLOAD_LIMITS = {
  employeeDocument: {
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    maxSizeMb: 25,
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png", "docx"],
  },
  csvImport: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxSizeMb: 10,
    maxRows: 5000,
    allowedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    allowedExtensions: ["csv"],
  },
  companyLogo: {
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    maxSizeMb: 2,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
    allowedExtensions: ["png", "jpg", "jpeg", "svg"],
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_LIMITS;

// ─── Validation Helpers ────────────────────────────────────────────────────────

export interface UploadValidationResult {
  valid: boolean;
  response?: NextResponse;
}

/**
 * Validates a file upload against the category-specific limits.
 * Returns { valid: true } on success, or { valid: false, response } with a 413 / 415 error.
 *
 * Usage in a route handler:
 *   const check = validateUpload(file.size, file.type, 'employeeDocument');
 *   if (!check.valid) return check.response!;
 */
export function validateUpload(
  sizeBytes: number,
  mimeType: string,
  category: UploadCategory
): UploadValidationResult {
  const limits = UPLOAD_LIMITS[category];

  // Check MIME type
  if (!(limits.allowedMimeTypes as readonly string[]).includes(mimeType)) {
    return {
      valid: false,
      response: NextResponse.json(
        {
          error: "unsupported_file_type",
          allowed_types: limits.allowedMimeTypes,
          received: mimeType,
        },
        { status: 415 }
      ),
    };
  }

  // Check size
  if (sizeBytes > limits.maxSizeBytes) {
    return {
      valid: false,
      response: NextResponse.json(
        {
          error: "file_too_large",
          max_size_mb: limits.maxSizeMb,
          received_size_mb: parseFloat((sizeBytes / 1024 / 1024).toFixed(2)),
        },
        { status: 413 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Validates a CSV import specifically, including row count.
 * Pass in the raw CSV string to check row count.
 */
export function validateCsvImport(
  sizeBytes: number,
  mimeType: string,
  rawCsv?: string
): UploadValidationResult {
  // File size + type check
  const baseCheck = validateUpload(sizeBytes, mimeType, "csvImport");
  if (!baseCheck.valid) return baseCheck;

  // Row count check
  if (rawCsv) {
    const rowCount = rawCsv.split("\n").filter((line) => line.trim().length > 0).length - 1; // subtract header
    if (rowCount > UPLOAD_LIMITS.csvImport.maxRows) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            error: "csv_too_many_rows",
            max_rows: UPLOAD_LIMITS.csvImport.maxRows,
            received_rows: rowCount,
          },
          { status: 413 }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Returns the Content-Type limits summary for documentation / error messages.
 */
export function getUploadLimitsSummary() {
  return Object.entries(UPLOAD_LIMITS).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        max_size_mb: value.maxSizeMb,
        allowed_types: value.allowedExtensions,
        ...("maxRows" in value ? { max_rows: value.maxRows } : {}),
      };
      return acc;
    },
    {} as Record<string, object>
  );
}
