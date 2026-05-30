import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
