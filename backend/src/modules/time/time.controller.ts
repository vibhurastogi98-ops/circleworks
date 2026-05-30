import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('time')
@UseGuards(AuthGuard('jwt'))
export class TimeController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('entries')
  async listEntries(@Query() query: Record<string, any>) {
    return this.crud.list('timeEntry', query, {
      companyScoped: true,
      filterMap: { employeeId: 'employeeId', status: 'status' },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }

  @Post('entries')
  async createEntry(@Body() body: any) {
    return this.crud.create('timeEntry', body);
  }

  @Put('entries/:id')
  async updateEntry(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('timeEntry', id, body);
  }

  @Delete('entries/:id')
  async deleteEntry(@Param('id') id: string) {
    return this.crud.remove('timeEntry', id);
  }

  @Get('timesheets')
  async listTimesheets(@Query() query: Record<string, any>) {
    return this.crud.list('timesheet', query, {
      companyScoped: true,
      filterMap: { employeeId: 'employeeId', status: 'status' },
      include: { employee: true },
      orderBy: { weekStart: 'desc' },
    });
  }

  @Post('timesheets')
  async createTimesheet(@Body() body: any) {
    const submittedAt =
      body.status === 'submitted' && !body.submittedAt
        ? new Date()
        : body.submittedAt;
    return this.crud.create('timesheet', { ...body, submittedAt });
  }

  @Put('timesheets/:id')
  async updateTimesheet(@Param('id') id: string, @Body() body: any) {
    const approvedAt =
      body.status === 'approved' && !body.approvedAt
        ? new Date()
        : body.approvedAt;
    return this.crud.update('timesheet', id, { ...body, approvedAt });
  }

  @Get('pto/policies')
  async listPtoPolicies(@Query() query: Record<string, any>) {
    return this.crud.list('ptoPolicy', query, {
      companyScoped: true,
      filterMap: { type: 'type', isActive: 'isActive' },
      searchFields: ['name', 'type'],
    });
  }

  @Post('pto/policies')
  async createPtoPolicy(@Body() body: any) {
    return this.crud.create('ptoPolicy', body);
  }

  @Put('pto/policies/:id')
  async updatePtoPolicy(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('ptoPolicy', id, body);
  }

  @Delete('pto/policies/:id')
  async deletePtoPolicy(@Param('id') id: string) {
    return this.crud.update('ptoPolicy', id, { isActive: false });
  }

  @Get('pto/requests')
  async listPtoRequests(@Query() query: Record<string, any>) {
    return this.crud.list('ptoRequest', query, {
      filterMap: { employeeId: 'employeeId', status: 'status', type: 'type' },
      include: { employee: true },
      orderBy: { startDate: 'desc' },
    });
  }

  @Post('pto/requests')
  async createPtoRequest(@Body() body: any) {
    return this.crud.create('ptoRequest', body);
  }

  @Put('pto/requests/:id')
  async updatePtoRequest(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('ptoRequest', id, body);
  }

  @Delete('pto/requests/:id')
  async deletePtoRequest(@Param('id') id: string) {
    return this.crud.remove('ptoRequest', id);
  }

  @Get('schedules')
  async listSchedules(@Query() query: Record<string, any>) {
    return this.crud.list('timeSchedule', query, {
      companyScoped: true,
      filterMap: { employeeId: 'employeeId' },
      orderBy: { weekStart: 'desc' },
    });
  }

  @Post('schedules')
  async createSchedule(@Body() body: any) {
    return this.crud.create('timeSchedule', body);
  }

  @Put('schedules/:id')
  async updateSchedule(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('timeSchedule', id, body);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Param('id') id: string) {
    return this.crud.remove('timeSchedule', id);
  }
}
