export const WEBSOCKET_EVENTS = {
  connected: 'connected',
  roomsJoined: 'rooms.joined',
  roomsLeft: 'rooms.left',
  payrollRunStatusUpdate: 'payroll.run.status_update',
  payrollRunCompleted: 'payroll.run.completed',
  payrollApprovalRequired: 'payroll.approval.required',
  payrollDirectDepositSent: 'payroll.direct_deposit.sent',
  employeeCreated: 'employee.created',
  employeeUpdated: 'employee.updated',
  employeeTerminated: 'employee.terminated',
  employeeClockedIn: 'employee.clocked_in',
  employeeClockedOut: 'employee.clocked_out',
  timePtoRequested: 'time.pto.requested',
  timePtoApproved: 'time.pto.approved',
  timePtoDenied: 'time.pto.denied',
  timeOvertimeAlert: 'time.overtime.alert',
  atsCandidateApplied: 'ats.candidate.applied',
  atsCandidateStageChanged: 'ats.candidate.stage_changed',
  atsOfferSigned: 'ats.offer.signed',
  expenseSubmitted: 'expense.submitted',
  expenseApproved: 'expense.approved',
  expenseDenied: 'expense.denied',
  notificationNew: 'notification.new',
  notificationBatchUpdate: 'notification.batch_update',
  complianceAlertNew: 'compliance.alert.new',
  systemMaintenanceScheduled: 'system.maintenance.scheduled',
  featureAnnouncement: 'feature.announcement',
} as const;

export type WebSocketEventName =
  (typeof WEBSOCKET_EVENTS)[keyof typeof WEBSOCKET_EVENTS];

export interface WebSocketServerToClientEvents {
  [WEBSOCKET_EVENTS.connected]: {
    userId: string;
    companyId: string;
    rooms: string[];
    timestamp: string;
  };
  [WEBSOCKET_EVENTS.roomsJoined]: { rooms: string[]; timestamp: string };
  [WEBSOCKET_EVENTS.roomsLeft]: { rooms: string[]; timestamp: string };
  [WEBSOCKET_EVENTS.payrollRunStatusUpdate]: {
    runId: string;
    status: string;
    progress: number;
  };
  [WEBSOCKET_EVENTS.payrollRunCompleted]: {
    runId: string;
    totalGross: number;
    employeeCount: number;
  };
  [WEBSOCKET_EVENTS.payrollApprovalRequired]: {
    runId: string;
    approverIds: string[];
  };
  [WEBSOCKET_EVENTS.payrollDirectDepositSent]: { runId: string };
  [WEBSOCKET_EVENTS.employeeCreated]: { employee: unknown };
  [WEBSOCKET_EVENTS.employeeUpdated]: {
    employeeId: string;
    changedFields: string[];
  };
  [WEBSOCKET_EVENTS.employeeTerminated]: {
    employeeId: string;
    lastDay: string;
  };
  [WEBSOCKET_EVENTS.employeeClockedIn]: {
    employeeId: string;
    timestamp: string;
  };
  [WEBSOCKET_EVENTS.employeeClockedOut]: {
    employeeId: string;
    timestamp: string;
    hoursWorked: number;
  };
  [WEBSOCKET_EVENTS.timePtoRequested]: {
    requestId: string;
    employeeId: string;
    dates: string[];
  };
  [WEBSOCKET_EVENTS.timePtoApproved]: { requestId: string };
  [WEBSOCKET_EVENTS.timePtoDenied]: { requestId: string };
  [WEBSOCKET_EVENTS.timeOvertimeAlert]: {
    employeeId: string;
    hoursThisWeek: number;
  };
  [WEBSOCKET_EVENTS.atsCandidateApplied]: {
    jobId: string;
    candidateId: string;
    candidateName: string;
  };
  [WEBSOCKET_EVENTS.atsCandidateStageChanged]: {
    candidateId: string;
    fromStage: string;
    toStage: string;
  };
  [WEBSOCKET_EVENTS.atsOfferSigned]: { candidateId: string; jobId: string };
  [WEBSOCKET_EVENTS.expenseSubmitted]: {
    expenseId: string;
    employeeId: string;
    amount: number;
  };
  [WEBSOCKET_EVENTS.expenseApproved]: { expenseId: string };
  [WEBSOCKET_EVENTS.expenseDenied]: { expenseId: string };
  [WEBSOCKET_EVENTS.notificationNew]: { notification: unknown };
  [WEBSOCKET_EVENTS.notificationBatchUpdate]: unknown;
  [WEBSOCKET_EVENTS.complianceAlertNew]: {
    alertId: string;
    severity: string;
    description: string;
  };
  [WEBSOCKET_EVENTS.systemMaintenanceScheduled]: {
    startAt: string;
    duration: number;
  };
  [WEBSOCKET_EVENTS.featureAnnouncement]: {
    title: string;
    description: string;
    ctaUrl?: string;
  };
}
