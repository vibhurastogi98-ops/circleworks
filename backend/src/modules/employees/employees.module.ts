import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CrudModule } from '@/common/crud/crud.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { EmployeesService } from './employees.service';
import {
  DepartmentsController,
  EmployeesController,
  PositionsController,
} from './employees.controller';

@Module({
  imports: [PrismaModule, CrudModule, WebsocketsModule, WebhooksModule],
  controllers: [
    EmployeesController,
    DepartmentsController,
    PositionsController,
  ],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
