import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
