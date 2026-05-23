import { BadRequestException } from '@nestjs/common';

export type CursorDirection = 'next' | 'prev';

export const MAX_CURSOR_LIMIT = 100;

export const DEFAULT_CURSOR_LIMITS = {
  employees: 25,
  payroll_runs: 20,
  audit_logs: 50,
} as const;

export interface CursorPayload {
  id: string;
  sort_field: string | number;
}

export interface CursorPaginationQuery {
  cursor?: string;
  limit?: string | number;
  direction?: string;
}

export interface ParsedCursorPagination {
  cursor: CursorPayload | null;
  limit: number;
  direction: CursorDirection;
}

export interface CursorPaginationEnvelope<T> {
  data: T[];
  pagination: {
    cursor_next: string | null;
    cursor_prev: string | null;
    has_next: boolean;
    has_prev: boolean;
    total_count: number;
  };
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string): CursorPayload | null {
  if (!cursor) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<CursorPayload>;

    if (!payload.id || payload.sort_field === undefined || payload.sort_field === null) {
      throw new Error('Cursor is missing id or sort_field');
    }

    return {
      id: String(payload.id),
      sort_field: payload.sort_field,
    };
  } catch {
    throw new BadRequestException({
      error: 'invalid_cursor',
      message: 'Cursor must be a base64 encoded {id, sort_field} payload.',
    });
  }
}

export function parseCursorPagination(
  query: CursorPaginationQuery,
  defaultLimit: number,
): ParsedCursorPagination {
  const limit = Number(query.limit ?? defaultLimit);
  const direction = query.direction ?? 'next';

  if (!Number.isInteger(limit) || limit < 1) {
    throw new BadRequestException({
      error: 'invalid_limit',
      message: 'Pagination limit must be a positive integer.',
      max_limit: MAX_CURSOR_LIMIT,
    });
  }

  if (limit > MAX_CURSOR_LIMIT) {
    throw new BadRequestException({
      error: 'limit_exceeded',
      message: `Pagination limit cannot exceed ${MAX_CURSOR_LIMIT}.`,
      max_limit: MAX_CURSOR_LIMIT,
    });
  }

  if (direction !== 'next' && direction !== 'prev') {
    throw new BadRequestException({
      error: 'invalid_direction',
      message: 'Pagination direction must be next or prev.',
    });
  }

  return {
    cursor: decodeCursor(query.cursor),
    limit,
    direction,
  };
}

export function createCursorPaginationEnvelope<T>(
  items: T[],
  options: {
    limit: number;
    totalCount: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    getCursorPayload: (item: T) => CursorPayload;
  },
): CursorPaginationEnvelope<T> {
  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const hasNextPage = options.hasNextPage ?? items.length === options.limit;

  return {
    data: items,
    pagination: {
      cursor_next: lastItem ? encodeCursor(options.getCursorPayload(lastItem)) : null,
      cursor_prev: firstItem ? encodeCursor(options.getCursorPayload(firstItem)) : null,
      has_next: hasNextPage,
      has_prev: options.hasPreviousPage ?? false,
      total_count: options.totalCount,
    },
  };
}
