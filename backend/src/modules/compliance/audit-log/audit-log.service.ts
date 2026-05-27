import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogPiiService } from './audit-log-pii.service';
import {
  createCursorPaginationEnvelope,
  DEFAULT_CURSOR_LIMITS,
  parseCursorPagination,
} from '@/common/pagination/cursor-pagination';

interface CreateAuditLogInput {
  companyId: string;
  actorId?: string;
  actorName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  fieldName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

interface ListAuditLogsInput {
  companyId?: string;
  viewerId: string;
  viewerRole?: string;
  limit?: number;
  cursor?: string;
  direction?: string;
}

interface CreateWorkflowAutomationAuditLogInput {
  companyId: string;
  workflowId: string;
  workflowName: string;
  actionType: string;
  entityType: string;
  entityId: string;
  changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  timestamp?: string;
}

const CIPHER_ALGORITHM = 'aes-256-gcm';

@Injectable()
export class AuditLogService {
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly piiService: AuditLogPiiService,
  ) {
    const configuredKey = this.configService.get<string>('AUDIT_LOG_ENCRYPTION_KEY');
    const fallbackKey = this.configService.get<string>('JWT_SECRET') || 'dev-audit-log-key';

    if (!configuredKey && this.configService.get<string>('NODE_ENV') === 'production') {
      throw new InternalServerErrorException('AUDIT_LOG_ENCRYPTION_KEY is required in production');
    }

    this.encryptionKey = createHash('sha256').update(configuredKey || fallbackKey).digest();
  }

  async createAuditLog(input: CreateAuditLogInput) {
    const maskedChange = input.fieldName
      ? this.piiService.maskChangeForAuditLog(input.fieldName, input.oldValue, input.newValue, input.actorRole)
      : {
          oldValue: this.stringifyForAudit(input.oldValue),
          newValue: this.stringifyForAudit(input.newValue),
          displayValue: undefined,
        };

    const auditLogDelegate = this.getAuditLogDelegate();

    return auditLogDelegate.create({
      data: {
        companyId: input.companyId,
        actorId: input.actorId,
        actorName: input.actorName,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        fieldName: input.fieldName,
        oldValueEncrypted: this.encrypt(maskedChange.oldValue),
        newValueEncrypted: this.encrypt(maskedChange.newValue),
        displayValueEncrypted: maskedChange.displayValue ? this.encrypt(maskedChange.displayValue) : null,
        ipAddress: input.ipAddress,
        metadata: input.metadata || {},
      },
    });
  }

  async createWorkflowAutomationAuditLog(input: CreateWorkflowAutomationAuditLogInput) {
    const firstChange = input.changedFields[0];

    return this.createAuditLog({
      companyId: input.companyId,
      actorName: 'Workflow Automation',
      action: input.actionType,
      resourceType: input.entityType,
      resourceId: input.entityId,
      fieldName: firstChange?.field,
      oldValue: firstChange?.oldValue,
      newValue: firstChange?.newValue,
      ipAddress: 'Automation',
      metadata: {
        immutable: true,
        source: 'workflow_automation',
        workflowId: input.workflowId,
        workflowName: input.workflowName,
        changedFields: input.changedFields,
        executedAt: input.timestamp || new Date().toISOString(),
        author: `Workflow Automation: ${input.workflowName}`,
      },
    });
  }

  async listAuditLogs(input: ListAuditLogsInput) {
    const viewerRole = await this.resolveViewerRole(input.viewerId, input.companyId, input.viewerRole);
    const auditLogDelegate = this.getAuditLogDelegate();
    const pagination = parseCursorPagination(
      {
        cursor: input.cursor,
        limit: input.limit,
        direction: input.direction,
      },
      DEFAULT_CURSOR_LIMITS.audit_logs,
    );
    const cursorDate = pagination.cursor ? new Date(pagination.cursor.sort_field) : null;

    if (pagination.cursor && (!cursorDate || Number.isNaN(cursorDate.getTime()))) {
      throw new BadRequestException({
        error: 'invalid_cursor',
        message: 'Cursor sort_field must be an ISO date.',
      });
    }

    const baseWhere = input.companyId ? { companyId: input.companyId } : {};
    const cursorWhere = pagination.cursor && cursorDate
      ? pagination.direction === 'next'
        ? {
            OR: [
              { createdAt: { lt: cursorDate } },
              { createdAt: cursorDate, id: { lt: pagination.cursor.id } },
            ],
          }
        : {
            OR: [
              { createdAt: { gt: cursorDate } },
              { createdAt: cursorDate, id: { gt: pagination.cursor.id } },
            ],
          }
      : {};
    const where = Object.keys(cursorWhere).length
      ? { AND: [baseWhere, cursorWhere] }
      : baseWhere;

    const [totalCount, logs] = await Promise.all([
      auditLogDelegate.count({ where: baseWhere }),
      auditLogDelegate.findMany({
        where,
        orderBy: [
          { createdAt: pagination.direction === 'next' ? 'desc' : 'asc' },
          { id: pagination.direction === 'next' ? 'desc' : 'asc' },
        ],
        take: pagination.limit + 1,
      }),
    ]);
    const hasMore = logs.length > pagination.limit;
    const pageLogs = logs.slice(0, pagination.limit);
    const orderedLogs = pagination.direction === 'prev' ? [...pageLogs].reverse() : pageLogs;
    const serializedLogs = orderedLogs.map((log: any) => this.serializeAuditLog(log, viewerRole));

    return createCursorPaginationEnvelope<any>(serializedLogs, {
      limit: pagination.limit,
      totalCount,
      hasNextPage: pagination.direction === 'next' ? hasMore : Boolean(pagination.cursor),
      hasPreviousPage: pagination.direction === 'prev' ? hasMore : Boolean(pagination.cursor),
      getCursorPayload: (log) => ({
        id: log.id,
        sort_field: new Date(log.createdAt).toISOString(),
      }),
    });
  }

  private serializeAuditLog(log: any, viewerRole: string) {
    const oldValue = this.decrypt(log.oldValueEncrypted);
    const newValue = this.decrypt(log.newValueEncrypted);
    const displayValue = log.displayValueEncrypted ? this.decrypt(log.displayValueEncrypted) : undefined;

    return {
      id: log.id,
      companyId: log.companyId,
      actorId: log.actorId,
      actorName: log.actorName,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      fieldName: log.fieldName,
      oldValue: log.fieldName ? this.piiService.maskForAuditLogDisplay(log.fieldName, oldValue, viewerRole) : oldValue,
      newValue: log.fieldName ? this.piiService.maskForAuditLogDisplay(log.fieldName, newValue, viewerRole) : newValue,
      displayValue: log.fieldName
        ? this.piiService.maskForAuditLogDisplay(log.fieldName, displayValue || newValue, viewerRole)
        : displayValue,
      ipAddress: log.ipAddress,
      metadata: log.metadata,
      createdAt: log.createdAt,
    };
  }

  private async resolveViewerRole(userId: string, companyId?: string, requestRole?: string) {
    if (requestRole === 'ADMIN') return 'admin';

    if (!companyId) return requestRole || 'employee';

    const membership = await this.prisma.userCompany.findFirst({
      where: { userId, companyId, isActive: true },
      select: { role: true },
    });

    return membership?.role || requestRole || 'employee';
  }

  private encrypt(value: unknown) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(CIPHER_ALGORITHM, this.encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(this.stringifyForAudit(value), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, ciphertext].map((part) => part.toString('base64')).join(':');
  }

  private decrypt(value?: string | null) {
    if (!value) return '';

    const [iv, authTag, ciphertext] = value.split(':').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv(CIPHER_ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  private stringifyForAudit(value: unknown) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }

  private getAuditLogDelegate() {
    return (this.prisma as any).auditLog;
  }
}
