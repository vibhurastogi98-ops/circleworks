import { Injectable } from '@nestjs/common';
import { WebsocketsService } from '../websockets/websockets.service';

@Injectable()
export class PayrollService {
  constructor(private readonly websocketsService: WebsocketsService) {}

  async updatePayrollRunStatus(companyId: string, runId: string, status: string, progress: number) {
    // Update database...

    // Emit WebSocket event
    this.websocketsService.emitPayrollRunStatusUpdate(companyId, {
      runId,
      status,
      progress,
    });
  }

  async completePayrollRun(companyId: string, runId: string, totalGross: number, employeeCount: number) {
    // Complete payroll run in database...

    // Emit WebSocket event
    this.websocketsService.emitPayrollRunCompleted(companyId, {
      runId,
      totalGross,
      employeeCount,
    });
  }

  async submitPayrollForApproval(companyId: string, runId: string, approverIds: string[]) {
    // Submit for approval...

    // Emit WebSocket event
    this.websocketsService.emitPayrollApprovalRequired(companyId, {
      runId,
      approverIds,
    });
  }

  async sendDirectDeposit(companyId: string, runId: string) {
    // Send ACH payments...

    // Emit WebSocket event
    this.websocketsService.emitPayrollDirectDepositSent(companyId, {
      runId,
    });
  }
}