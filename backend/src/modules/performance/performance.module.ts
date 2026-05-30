import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { PerformanceController } from './performance.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [PerformanceController],
})
export class PerformanceModule {}
