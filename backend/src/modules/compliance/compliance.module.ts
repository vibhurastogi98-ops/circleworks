import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditLogController } from './audit-log/audit-log.controller';
import { AuditLogPiiService } from './audit-log/audit-log-pii.service';
import { AuditLogService } from './audit-log/audit-log.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogPiiService, AuditLogService],
  exports: [AuditLogService, AuditLogPiiService],
})
export class ComplianceModule {}
