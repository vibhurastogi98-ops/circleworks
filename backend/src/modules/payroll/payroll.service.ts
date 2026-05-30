import { Injectable } from '@nestjs/common';
import { PayrollStatus } from '@prisma/client';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly crud: PrismaCrudService,
    private readonly websocketsService: WebsocketsService,
    private readonly webhooksService: WebhooksService,
  ) {}

  async createRun(data: any) {
    const run = await this.crud.create('payrollRun', data, {
      include: { payStubs: true, schedule: true },
    });
    this.websocketsService.emitPayrollRunStatusUpdate(run.companyId, {
      runId: run.id,
      status: run.status,
      progress: 0,
    });
    void this.webhooksService.dispatch(run.companyId, 'payroll.run.created', {
      run,
    });
    return run;
  }

  async listRuns(query: Record<string, any>) {
    return this.crud.list('payrollRun', query, {
      companyScoped: true,
      defaultLimit: 20,
      filterMap: { status: 'status', scheduleId: 'scheduleId' },
      include: { payStubs: true, schedule: true },
      orderBy: { periodEnd: 'desc' },
    });
  }

  async getRun(runId: string) {
    return this.crud.get('payrollRun', runId, {
      include: {
        payStubs: { include: { employee: true } },
        schedule: true,
        achFile: true,
      },
    });
  }

  async updateRun(runId: string, data: any) {
    const { payStubs, ...runData } = data;
    const run = await this.crud.update('payrollRun', runId, runData, {
      include: { payStubs: true, schedule: true },
    });

    if (Array.isArray(payStubs)) {
      await Promise.all(
        payStubs.map((stub) =>
          this.crud.prismaClient.payStub.upsert({
            where: {
              runId_employeeId: {
                runId,
                employeeId: stub.employeeId,
              },
            },
            create: this.crud.normalizeData({
              ...stub,
              runId,
              grossPay: Number(stub.grossPay || 0),
              taxes: Number(stub.taxes || 0),
              deductions: Number(stub.deductions || 0),
              netPay: Number(stub.netPay || 0),
            }) as any,
            update: this.crud.normalizeData(stub) as any,
          }),
        ),
      );
    }

    this.websocketsService.emitPayrollRunStatusUpdate(run.companyId, {
      runId,
      status: run.status,
      progress: 10,
    });

    return this.getRun(runId);
  }

  async submitRun(runId: string, approverIds: string[] = []) {
    const run = await this.crud.update('payrollRun', runId, {
      status: PayrollStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    this.websocketsService.emitPayrollApprovalRequired(run.companyId, {
      runId,
      approverIds,
    });
    return run;
  }

  async approveRun(runId: string, approvedBy?: string) {
    const run = await this.crud.update('payrollRun', runId, {
      status: PayrollStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy,
    });
    this.websocketsService.emitPayrollRunStatusUpdate(run.companyId, {
      runId,
      status: run.status,
      progress: 50,
    });
    return run;
  }

  async processRun(runId: string, data: any = {}) {
    const run = await this.crud.update('payrollRun', runId, {
      status: PayrollStatus.PROCESSED,
      processedAt: new Date(),
    });

    await this.crud.prismaClient.achFile.upsert({
      where: { runId },
      create: {
        runId,
        fileContent: data.fileContent || `ACH batch for payroll run ${runId}`,
        fileName: data.fileName || `ach-${runId}.txt`,
        status: 'sent',
        batchNumber: data.batchNumber,
      },
      update: {
        status: 'sent',
        batchNumber: data.batchNumber,
      },
    });

    this.websocketsService.emitPayrollDirectDepositSent(run.companyId, {
      runId,
    });
    this.websocketsService.emitPayrollRunCompleted(run.companyId, {
      runId,
      totalGross: run.totalGrossPay,
      employeeCount: await this.crud.prismaClient.payStub.count({
        where: { runId },
      }),
    });
    void this.webhooksService.dispatch(run.companyId, 'payroll.run.processed', {
      runId,
      totalGross: run.totalGrossPay,
      totalNet: run.totalNetPay,
    });

    return this.getRun(runId);
  }

  async listPaystubs(runId: string) {
    return this.crud.prismaClient.payStub.findMany({
      where: { runId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaystub(runId: string, employeeId: string) {
    return this.crud.prismaClient.payStub.findUnique({
      where: { runId_employeeId: { runId, employeeId } },
      include: { employee: true, run: true },
    });
  }

  async listSchedules(query: Record<string, any>) {
    return this.crud.list('payrollSchedule', query, {
      companyScoped: true,
      filterMap: { isActive: 'isActive', frequency: 'frequency' },
      searchFields: ['name'],
      orderBy: { nextRunDate: 'asc' },
    });
  }

  async listTaxAccounts(query: Record<string, any>) {
    return this.crud.list('taxAccount', query, {
      companyScoped: true,
      filterMap: { accountType: 'accountType' },
    });
  }

  async listGarnishments(query: Record<string, any>) {
    return this.crud.list('garnishment', query, {
      companyScoped: true,
      filterMap: {
        employeeId: 'employeeId',
        isActive: 'isActive',
        type: 'type',
      },
    });
  }

  async history(query: Record<string, any>) {
    return this.crud.list('payrollRun', query, {
      companyScoped: true,
      where: { status: PayrollStatus.PROCESSED },
      include: { payStubs: true, achFile: true },
      orderBy: { processedAt: 'desc' },
    });
  }

  async updatePayrollRunStatus(
    companyId: string,
    runId: string,
    status: string,
    progress: number,
  ) {
    await this.crud.update('payrollRun', runId, { status });

    this.websocketsService.emitPayrollRunStatusUpdate(companyId, {
      runId,
      status,
      progress,
    });
  }

  async completePayrollRun(
    companyId: string,
    runId: string,
    totalGross: number,
    employeeCount: number,
  ) {
    await this.crud.update('payrollRun', runId, {
      status: PayrollStatus.PROCESSED,
      processedAt: new Date(),
      totalGrossPay: totalGross,
    });

    this.websocketsService.emitPayrollRunCompleted(companyId, {
      runId,
      totalGross,
      employeeCount,
    });
  }

  async submitPayrollForApproval(
    companyId: string,
    runId: string,
    approverIds: string[],
  ) {
    await this.submitRun(runId, approverIds);

    this.websocketsService.emitPayrollApprovalRequired(companyId, {
      runId,
      approverIds,
    });
  }

  async sendDirectDeposit(companyId: string, runId: string) {
    await this.processRun(runId);

    this.websocketsService.emitPayrollDirectDepositSent(companyId, {
      runId,
    });
  }
}
