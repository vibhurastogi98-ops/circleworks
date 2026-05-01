import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { PayrollService } from './payroll.service';

@Module({
  imports: [PrismaModule, WebsocketsModule],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
