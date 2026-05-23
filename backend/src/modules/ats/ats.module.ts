import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/prisma/prisma.module';
import { QUEUE_EMAIL_DELIVERY } from '@/queues/queue.constants';
import { WebsocketsModule } from '../websockets/websockets.module';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';

@Module({
  imports: [
    PrismaModule,
    WebsocketsModule,
    BullModule.registerQueue({ name: QUEUE_EMAIL_DELIVERY }),
  ],
  controllers: [AtsController],
  providers: [AtsService],
  exports: [AtsService],
})
export class AtsModule {}
