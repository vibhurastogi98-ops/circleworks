import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayrollStatus } from '@prisma/client';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get('payroll-summary')
  async payrollSummary(@Query('companyId') companyId?: string) {
    const where = {
      ...(companyId ? { companyId } : {}),
      status: PayrollStatus.PROCESSED,
    };
    const totals = await this.crud.prismaClient.payrollRun.aggregate({
      where,
      _sum: {
        totalGrossPay: true,
        totalTaxes: true,
        totalDeductions: true,
        totalNetPay: true,
      },
      _count: true,
    });

    return {
      runs: totals._count,
      totalGrossPay: totals._sum.totalGrossPay || 0,
      totalTaxes: totals._sum.totalTaxes || 0,
      totalDeductions: totals._sum.totalDeductions || 0,
      totalNetPay: totals._sum.totalNetPay || 0,
    };
  }

  @Get('headcount')
  async headcount(@Query('companyId') companyId?: string) {
    const where = {
      ...(companyId ? { companyId } : {}),
      deletedAt: null,
    };
    const [total, byStatus, byDepartment] = await Promise.all([
      this.crud.prismaClient.employee.count({ where }),
      this.crud.prismaClient.employee.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.crud.prismaClient.employee.groupBy({
        by: ['departmentId'],
        where,
        _count: { _all: true },
      }),
    ]);

    return { total, byStatus, byDepartment };
  }

  @Get('tax-liability')
  async taxLiability(@Query('companyId') companyId?: string) {
    const where = {
      ...(companyId ? { companyId } : {}),
      status: PayrollStatus.PROCESSED,
    };
    const taxes = await this.crud.prismaClient.payrollRun.aggregate({
      where,
      _sum: { totalTaxes: true },
      _count: true,
    });

    return {
      processedRuns: taxes._count,
      taxLiability: taxes._sum.totalTaxes || 0,
    };
  }

  @Get('custom')
  async customFromQuery(@Query() query: Record<string, any>) {
    return this.runCustomReport(query.entity || 'employees', query);
  }

  @Post('custom')
  async customFromBody(@Body() body: any) {
    return this.runCustomReport(body.entity, body.filters || {});
  }

  private runCustomReport(entity: string, filters: Record<string, any>) {
    const delegates: Record<string, string> = {
      employees: 'employee',
      payrollRuns: 'payrollRun',
      payroll: 'payrollRun',
      candidates: 'candidate',
      expenses: 'expense',
      timeEntries: 'timeEntry',
      benefits: 'benefitPlan',
    };
    const delegate = delegates[entity];
    if (!delegate) {
      throw new BadRequestException('Unsupported report entity');
    }

    return this.crud.list(delegate, filters, {
      companyScoped: true,
      defaultLimit: Number(filters.limit || 50),
      maxLimit: 500,
    });
  }
}
