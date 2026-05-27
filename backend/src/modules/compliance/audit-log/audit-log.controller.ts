import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from './audit-log.service';

@Controller('compliance/audit-log')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async listAuditLogs(
    @Request() req: any,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('direction') direction?: string,
  ) {
    return this.auditLogService.listAuditLogs({
      companyId,
      viewerId: req.user.id,
      viewerRole: req.user.role,
      limit: limit ? Number(limit) : undefined,
      cursor,
      direction,
    });
  }
}
