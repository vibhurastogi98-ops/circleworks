import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('compliance')
@UseGuards(AuthGuard('jwt'))
export class ComplianceController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('alerts')
  async listAlerts(@Query() query: Record<string, any>) {
    return this.crud.list('complianceAlert', query, {
      companyScoped: true,
      filterMap: { type: 'type', severity: 'severity' },
      searchFields: ['message', 'actionRequired', 'type', 'severity'],
    });
  }

  @Post('alerts')
  async createAlert(@Body() body: any) {
    return this.crud.create('complianceAlert', body);
  }

  @Put('alerts/:id')
  async updateAlert(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('complianceAlert', id, body);
  }

  @Get('filings')
  async listFilings(@Query() query: Record<string, any>) {
    return this.crud.list('complianceFiling', query, {
      companyScoped: true,
      filterMap: { type: 'type', status: 'status' },
      orderBy: { dueDate: 'asc' },
    });
  }

  @Post('filings')
  async createFiling(@Body() body: any) {
    const filedAt =
      body.status === 'filed' && !body.filedAt ? new Date() : body.filedAt;
    return this.crud.create('complianceFiling', { ...body, filedAt });
  }

  @Put('filings/:id')
  async updateFiling(@Param('id') id: string, @Body() body: any) {
    const filedAt =
      body.status === 'filed' && !body.filedAt ? new Date() : body.filedAt;
    return this.crud.update('complianceFiling', id, { ...body, filedAt });
  }

  @Get('i9')
  async listI9(@Query() query: Record<string, any>) {
    return this.crud.list('i9Verification', query, {
      filterMap: { employeeId: 'employeeId', status: 'status' },
    });
  }

  @Post('i9')
  async createI9(@Body() body: any) {
    const verifiedAt =
      body.status === 'verified' && !body.verifiedAt
        ? new Date()
        : body.verifiedAt;
    return this.crud.create('i9Verification', { ...body, verifiedAt });
  }

  @Put('i9/:id')
  async updateI9(@Param('id') id: string, @Body() body: any) {
    const verifiedAt =
      body.status === 'verified' && !body.verifiedAt
        ? new Date()
        : body.verifiedAt;
    return this.crud.update('i9Verification', id, { ...body, verifiedAt });
  }
}
