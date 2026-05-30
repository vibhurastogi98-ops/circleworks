import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('automations')
@UseGuards(AuthGuard('jwt'))
export class AutomationsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('automation', query, {
      companyScoped: true,
      filterMap: { isActive: 'isActive', createdById: 'createdById' },
      searchFields: ['name', 'description', 'trigger', 'action'],
      include: { runs: true, createdBy: true },
    });
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.crud.create('automation', {
      ...body,
      createdById: body.createdById || req.user?.id,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('automation', id, {
      include: { runs: true, createdBy: true },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('automation', id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crud.update('automation', id, { isActive: false });
  }

  @Get(':id/runs')
  async runs(@Param('id') id: string) {
    return this.crud.prismaClient.automationRun.findMany({
      where: { automationId: id },
      orderBy: { executedAt: 'desc' },
    });
  }

  @Post(':id/runs')
  async createRun(@Param('id') id: string, @Body() body: any) {
    return this.crud.create('automationRun', {
      automationId: id,
      status: body.status || 'queued',
      result: body.result,
    });
  }
}
