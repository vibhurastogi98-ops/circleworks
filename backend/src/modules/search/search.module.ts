import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { SearchController } from './search.controller';

@Module({
  imports: [PrismaModule, CrudModule],
  controllers: [SearchController],
})
export class SearchModule {}
