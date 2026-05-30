import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { TimeController } from './time.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [TimeController],
})
export class TimeModule {}
