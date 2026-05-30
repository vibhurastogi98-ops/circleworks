import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CompaniesController,
  InvitationsController,
} from './companies.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController, InvitationsController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
