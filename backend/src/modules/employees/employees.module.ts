import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { EmployeesService } from './employees.service';

@Module({
  imports: [PrismaModule, WebsocketsModule],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
