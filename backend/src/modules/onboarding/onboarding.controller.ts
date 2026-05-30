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

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('prehires')
  async listPrehires(@Query() query: Record<string, any>) {
    return this.crud.list('preHire', query, {
      companyScoped: true,
      filterMap: { status: 'status' },
      searchFields: ['firstName', 'lastName', 'email', 'position'],
    });
  }

  @Post('prehires')
  async createPrehire(@Body() body: any) {
    return this.crud.create('preHire', body);
  }

  @Put('prehires/:id')
  async updatePrehire(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('preHire', id, body);
  }

  @Delete('prehires/:id')
  async deletePrehire(@Param('id') id: string) {
    return this.crud.remove('preHire', id);
  }

  @Get('templates')
  async listTemplates(@Query() query: Record<string, any>) {
    return this.crud.list('onboardingTemplate', query, {
      companyScoped: true,
      searchFields: ['name', 'description'],
      include: { tasks: true },
    });
  }

  @Post('templates')
  async createTemplate(@Body() body: any) {
    return this.crud.create('onboardingTemplate', body);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('onboardingTemplate', id, body);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.crud.remove('onboardingTemplate', id);
  }

  @Get('tasks')
  async listTasks(@Query() query: Record<string, any>) {
    return this.crud.list('onboardingTask', query, {
      companyScoped: true,
      filterMap: {
        status: 'status',
        assigneeId: 'assigneeId',
        templateId: 'templateId',
      },
      searchFields: ['title', 'description'],
      include: { template: true },
    });
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    return this.crud.create('onboardingTask', body);
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    const completedAt =
      body.status === 'completed' && !body.completedAt
        ? new Date()
        : body.completedAt;
    return this.crud.update('onboardingTask', id, { ...body, completedAt });
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.crud.remove('onboardingTask', id);
  }
}
