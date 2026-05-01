import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class WebsocketsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  // Payroll Events
  emitPayrollRunStatusUpdate(companyId: string, data: { runId: string; status: string; progress: number }) {
    this.eventsGateway.emitToCompany(companyId, 'payroll.run.status_update', data);
  }

  emitPayrollRunCompleted(companyId: string, data: { runId: string; totalGross: number; employeeCount: number }) {
    this.eventsGateway.emitToCompany(companyId, 'payroll.run.completed', data);
  }

  emitPayrollApprovalRequired(companyId: string, data: { runId: string; approverIds: string[] }) {
    this.eventsGateway.emitToCompany(companyId, 'payroll.approval.required', data);
  }

  emitPayrollDirectDepositSent(companyId: string, data: { runId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'payroll.direct_deposit.sent', data);
  }

  // Employee Events
  emitEmployeeCreated(companyId: string, data: { employee: any }) {
    this.eventsGateway.emitToCompany(companyId, 'employee.created', data);
  }

  emitEmployeeUpdated(companyId: string, data: { employeeId: string; changedFields: string[] }) {
    this.eventsGateway.emitToCompany(companyId, 'employee.updated', data);
  }

  emitEmployeeTerminated(companyId: string, data: { employeeId: string; lastDay: string }) {
    this.eventsGateway.emitToCompany(companyId, 'employee.terminated', data);
  }

  emitEmployeeClockedIn(companyId: string, data: { employeeId: string; timestamp: string }) {
    this.eventsGateway.emitToCompany(companyId, 'employee.clocked_in', data);
  }

  emitEmployeeClockedOut(companyId: string, data: { employeeId: string; timestamp: string; hoursWorked: number }) {
    this.eventsGateway.emitToCompany(companyId, 'employee.clocked_out', data);
  }

  // Time Events
  emitTimePtoRequested(companyId: string, data: { requestId: string; employeeId: string; dates: string[] }) {
    this.eventsGateway.emitToCompany(companyId, 'time.pto.requested', data);
  }

  emitTimePtoApproved(companyId: string, data: { requestId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'time.pto.approved', data);
  }

  emitTimePtoDenied(companyId: string, data: { requestId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'time.pto.denied', data);
  }

  emitTimeOvertimeAlert(companyId: string, data: { employeeId: string; hoursThisWeek: number }) {
    this.eventsGateway.emitToCompany(companyId, 'time.overtime.alert', data);
  }

  // Hiring Events
  emitAtsCandidateApplied(companyId: string, data: { jobId: string; candidateId: string; candidateName: string }) {
    this.eventsGateway.emitToCompany(companyId, 'ats.candidate.applied', data);
  }

  emitAtsCandidateStageChanged(companyId: string, data: { candidateId: string; fromStage: string; toStage: string }) {
    this.eventsGateway.emitToCompany(companyId, 'ats.candidate.stage_changed', data);
  }

  emitAtsOfferSigned(companyId: string, data: { candidateId: string; jobId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'ats.offer.signed', data);
  }

  // Expense Events
  emitExpenseSubmitted(companyId: string, data: { expenseId: string; employeeId: string; amount: number }) {
    this.eventsGateway.emitToCompany(companyId, 'expense.submitted', data);
  }

  emitExpenseApproved(companyId: string, data: { expenseId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'expense.approved', data);
  }

  emitExpenseDenied(companyId: string, data: { expenseId: string }) {
    this.eventsGateway.emitToCompany(companyId, 'expense.denied', data);
  }

  // Notification Events
  emitNotificationNew(userId: string, data: { notification: any }) {
    this.eventsGateway.emitToUser(userId, 'notification.new', data);
  }

  emitNotificationBatchUpdate(userId: string, data: any) {
    this.eventsGateway.emitToUser(userId, 'notification.batch_update', data);
  }

  // Compliance Events
  emitComplianceAlertNew(companyId: string, data: { alertId: string; severity: string; description: string }) {
    this.eventsGateway.emitToCompany(companyId, 'compliance.alert.new', data);
  }

  // System Events
  emitSystemMaintenanceScheduled(companyId: string, data: { startAt: string; duration: number }) {
    this.eventsGateway.emitToCompany(companyId, 'system.maintenance.scheduled', data);
  }

  emitFeatureAnnouncement(companyId: string, data: { title: string; description: string; ctaUrl?: string }) {
    this.eventsGateway.emitToCompany(companyId, 'feature.announcement', data);
  }
}