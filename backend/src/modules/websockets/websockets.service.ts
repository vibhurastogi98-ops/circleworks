import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { WEBSOCKET_EVENTS } from './websocket-events';

export type WorkflowActionType =
  | 'update_field'
  | 'create_task'
  | 'send_email'
  | 'change_status';

export type WorkflowEntityType = 'employee' | 'task' | 'job' | 'onboarding';

export interface WorkflowActionExecutedPayload {
  workflowId: string;
  workflowName: string;
  triggeredBy: 'automation';
  actionType: WorkflowActionType;
  entityType: WorkflowEntityType;
  entityId: string;
  changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  timestamp: string;
}

@Injectable()
export class WebsocketsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  // Payroll Events
  emitPayrollRunStatusUpdate(
    companyId: string,
    data: { runId: string; status: string; progress: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.payrollRunStatusUpdate,
      data,
    );
  }

  emitPayrollRunCompleted(
    companyId: string,
    data: { runId: string; totalGross: number; employeeCount: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.payrollRunCompleted,
      data,
    );
  }

  emitPayrollApprovalRequired(
    companyId: string,
    data: { runId: string; approverIds: string[] },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.payrollApprovalRequired,
      data,
    );
  }

  emitPayrollDirectDepositSent(companyId: string, data: { runId: string }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.payrollDirectDepositSent,
      data,
    );
  }

  // Employee Events
  emitEmployeeCreated(companyId: string, data: { employee: any }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.employeeCreated,
      data,
    );
  }

  emitEmployeeUpdated(
    companyId: string,
    data: { employeeId: string; changedFields: string[] },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.employeeUpdated,
      data,
    );
  }

  emitEmployeeTerminated(
    companyId: string,
    data: { employeeId: string; lastDay: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.employeeTerminated,
      data,
    );
  }

  emitEmployeeTerminationInitiated(
    companyId: string,
    data: {
      id: number;
      terminationDate: string;
      terminationType: string;
      finalPayDate: string | null;
      companyId: number | null;
      timestamp: string;
    },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      'employee.termination.initiated',
      data,
    );
  }

  emitEmployeeAccessRevoked(
    companyId: string,
    data: { id: number; terminationDate: string; timestamp: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      'employee.access.revoked',
      data,
    );
  }

  emitEmployeeCobraTriggered(
    companyId: string,
    data: { id: number; terminationDate: string; timestamp: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      'employee.cobra.triggered',
      data,
    );
  }

  emitEmployeeAutoCreatedFromAts(
    companyId: string,
    data: { employeeId: string; candidateId: string; personalEmail?: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      'employee.auto_created_from_ats',
      data,
    );
  }

  emitEmployeeClockedIn(
    companyId: string,
    data: { employeeId: string; timestamp: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.employeeClockedIn,
      data,
    );
  }

  emitEmployeeClockedOut(
    companyId: string,
    data: { employeeId: string; timestamp: string; hoursWorked: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.employeeClockedOut,
      data,
    );
  }

  // Time Events
  emitTimePtoRequested(
    companyId: string,
    data: { requestId: string; employeeId: string; dates: string[] },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.timePtoRequested,
      data,
    );
  }

  emitTimePtoApproved(companyId: string, data: { requestId: string }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.timePtoApproved,
      data,
    );
  }

  emitTimePtoDenied(companyId: string, data: { requestId: string }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.timePtoDenied,
      data,
    );
  }

  emitTimeOvertimeAlert(
    companyId: string,
    data: { employeeId: string; hoursThisWeek: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.timeOvertimeAlert,
      data,
    );
  }

  // Hiring Events
  emitAtsCandidateApplied(
    companyId: string,
    data: { jobId: string; candidateId: string; candidateName: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.atsCandidateApplied,
      data,
    );
  }

  emitAtsCandidateStageChanged(
    companyId: string,
    data: { candidateId: string; fromStage: string; toStage: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.atsCandidateStageChanged,
      data,
    );
  }

  emitAtsOfferSigned(
    companyId: string,
    data: { candidateId: string; jobId: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.atsOfferSigned,
      data,
    );
  }

  // Expense Events
  emitExpenseSubmitted(
    companyId: string,
    data: { expenseId: string; employeeId: string; amount: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.expenseSubmitted,
      data,
    );
  }

  emitExpenseApproved(companyId: string, data: { expenseId: string }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.expenseApproved,
      data,
    );
  }

  emitExpenseDenied(companyId: string, data: { expenseId: string }) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.expenseDenied,
      data,
    );
  }

  // Notification Events
  emitNotificationNew(userId: string, data: { notification: any }) {
    this.eventsGateway.emitToUser(
      userId,
      WEBSOCKET_EVENTS.notificationNew,
      data,
    );
  }

  emitNotificationBatchUpdate(userId: string, data: any) {
    this.eventsGateway.emitToUser(
      userId,
      WEBSOCKET_EVENTS.notificationBatchUpdate,
      data,
    );
  }

  // Workflow Automation Events
  emitWorkflowActionExecuted(
    companyId: string,
    data: WorkflowActionExecutedPayload,
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      'workflow.action.executed',
      data,
    );
  }

  // Compliance Events
  emitComplianceAlertNew(
    companyId: string,
    data: { alertId: string; severity: string; description: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.complianceAlertNew,
      data,
    );
  }

  // System Events
  emitSystemMaintenanceScheduled(
    companyId: string,
    data: { startAt: string; duration: number },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.systemMaintenanceScheduled,
      data,
    );
  }

  emitFeatureAnnouncement(
    companyId: string,
    data: { title: string; description: string; ctaUrl?: string },
  ) {
    this.eventsGateway.emitToCompany(
      companyId,
      WEBSOCKET_EVENTS.featureAnnouncement,
      data,
    );
  }
}
