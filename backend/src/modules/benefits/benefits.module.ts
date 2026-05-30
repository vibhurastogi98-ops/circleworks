import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { BenefitsController } from './benefits.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [BenefitsController],
})
export class BenefitsModule {}
