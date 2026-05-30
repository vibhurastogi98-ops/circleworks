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

@Controller('performance')
@UseGuards(AuthGuard('jwt'))
export class PerformanceController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('reviews')
  async listReviews(@Query() query: Record<string, any>) {
    return this.crud.list('performanceReview', query, {
      filterMap: {
        employeeId: 'employeeId',
        reviewerId: 'reviewerId',
        status: 'status',
      },
      include: { employee: true, reviewer: true },
    });
  }

  @Post('reviews')
  async createReview(@Body() body: any, @Request() req: any) {
    return this.crud.create('performanceReview', {
      ...body,
      reviewerId: body.reviewerId || req.user?.id,
    });
  }

  @Put('reviews/:id')
  async updateReview(@Param('id') id: string, @Body() body: any) {
    const submittedAt =
      body.status === 'submitted' && !body.submittedAt
        ? new Date()
        : body.submittedAt;
    return this.crud.update('performanceReview', id, { ...body, submittedAt });
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string) {
    return this.crud.remove('performanceReview', id);
  }

  @Get('goals')
  async listGoals(@Query() query: Record<string, any>) {
    return this.crud.list('performanceGoal', query, {
      filterMap: {
        employeeId: 'employeeId',
        setById: 'setById',
        status: 'status',
      },
      searchFields: ['title', 'description'],
      include: { employee: true, setBy: true },
    });
  }

  @Post('goals')
  async createGoal(@Body() body: any, @Request() req: any) {
    return this.crud.create('performanceGoal', {
      ...body,
      setById: body.setById || req.user?.id,
    });
  }

  @Put('goals/:id')
  async updateGoal(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('performanceGoal', id, body);
  }

  @Delete('goals/:id')
  async deleteGoal(@Param('id') id: string) {
    return this.crud.remove('performanceGoal', id);
  }

  @Get('feedback')
  async listFeedback(@Query() query: Record<string, any>) {
    return this.crud.list('performanceFeedback', query, {
      filterMap: {
        employeeId: 'employeeId',
        giverId: 'giverId',
        category: 'category',
      },
      searchFields: ['content', 'category'],
      include: { setBy: true },
    });
  }

  @Post('feedback')
  async createFeedback(@Body() body: any, @Request() req: any) {
    return this.crud.create('performanceFeedback', {
      ...body,
      giverId: body.giverId || req.user?.id,
    });
  }

  @Put('feedback/:id')
  async updateFeedback(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('performanceFeedback', id, body);
  }

  @Delete('feedback/:id')
  async deleteFeedback(@Param('id') id: string) {
    return this.crud.remove('performanceFeedback', id);
  }
}
