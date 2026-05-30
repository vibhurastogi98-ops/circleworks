import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { QUEUE_EMAIL_DELIVERY } from '@/queues/queue.constants';
import { WebsocketsModule } from '../websockets/websockets.module';
import {
  AtsController,
  CandidatesController,
  InterviewsController,
  JobsController,
  OffersController,
} from './ats.controller';
import { AtsService } from './ats.service';

@Module({
  imports: [
    PrismaModule,
    CrudModule,
    WebsocketsModule,
    BullModule.registerQueue({ name: QUEUE_EMAIL_DELIVERY }),
  ],
  controllers: [
    AtsController,
    JobsController,
    CandidatesController,
    InterviewsController,
    OffersController,
  ],
  providers: [AtsService],
  exports: [AtsService],
})
export class AtsModule {}
