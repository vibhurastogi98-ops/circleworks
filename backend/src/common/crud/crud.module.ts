import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaCrudService } from './prisma-crud.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaCrudService],
  exports: [PrismaCrudService],
})
export class CrudModule {}
