import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { AutomationsController } from './automations.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [AutomationsController],
})
export class AutomationsModule {}
