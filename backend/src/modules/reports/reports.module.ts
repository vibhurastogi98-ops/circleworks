import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { ReportsController } from './reports.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
