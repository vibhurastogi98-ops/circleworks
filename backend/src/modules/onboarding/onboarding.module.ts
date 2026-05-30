import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
