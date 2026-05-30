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

@Controller('benefits')
@UseGuards(AuthGuard('jwt'))
export class BenefitsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('plans')
  async listPlans(@Query() query: Record<string, any>) {
    return this.crud.list('benefitPlan', query, {
      companyScoped: true,
      filterMap: { type: 'type', isActive: 'isActive' },
      searchFields: ['name', 'description', 'type'],
      include: { enrollments: true },
    });
  }

  @Post('plans')
  async createPlan(@Body() body: any) {
    return this.crud.create('benefitPlan', body);
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.crud.get('benefitPlan', id, { include: { enrollments: true } });
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('benefitPlan', id, body);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.crud.update('benefitPlan', id, { isActive: false });
  }

  @Get('enrollments')
  async listEnrollments(@Query() query: Record<string, any>) {
    return this.crud.list('benefitEnrollment', query, {
      filterMap: {
        employeeId: 'employeeId',
        planId: 'planId',
        status: 'status',
      },
      include: { employee: true, plan: true },
    });
  }

  @Post('enrollments')
  async createEnrollment(@Body() body: any) {
    return this.crud.create('benefitEnrollment', body);
  }

  @Put('enrollments/:id')
  async updateEnrollment(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('benefitEnrollment', id, body);
  }

  @Delete('enrollments/:id')
  async deleteEnrollment(@Param('id') id: string) {
    return this.crud.remove('benefitEnrollment', id);
  }

  @Get('oe')
  async listOpenEnrollment(@Query() query: Record<string, any>) {
    return this.crud.list('openEnrollment', query, {
      companyScoped: true,
      filterMap: { isActive: 'isActive' },
      orderBy: { startDate: 'desc' },
    });
  }

  @Post('oe')
  async createOpenEnrollment(@Body() body: any) {
    return this.crud.create('openEnrollment', body);
  }

  @Put('oe/:id')
  async updateOpenEnrollment(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('openEnrollment', id, body);
  }

  @Get('qle')
  async listQle(@Query() query: Record<string, any>) {
    return this.crud.list('qle', query, {
      filterMap: { employeeId: 'employeeId', type: 'type' },
      orderBy: { eventDate: 'desc' },
    });
  }

  @Post('qle')
  async createQle(@Body() body: any) {
    return this.crud.create('qle', body);
  }

  @Put('qle/:id')
  async updateQle(@Param('id') id: string, @Body() body: any) {
    return this.crud.update('qle', id, body);
  }

  @Get('cobra')
  async cobra(@Query() query: Record<string, any>) {
    const terminatedEmployees = await this.crud.prismaClient.employee.findMany({
      where: {
        ...(query.companyId ? { companyId: query.companyId } : {}),
        status: 'TERMINATED',
      },
      include: { benefits: { include: { plan: true } } },
      orderBy: { terminationDate: 'desc' },
    });

    return {
      data: terminatedEmployees.map((employee) => ({
        employeeId: employee.id,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        terminationDate: employee.terminationDate,
        eligiblePlans: employee.benefits,
        status: employee.benefits.length > 0 ? 'eligible' : 'not_applicable',
      })),
    };
  }
}
