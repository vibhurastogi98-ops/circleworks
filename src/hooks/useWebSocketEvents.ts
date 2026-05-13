import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketStore } from '@/store/useSocketStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from 'sonner';

export const useWebSocketEvents = () => {
  const queryClient = useQueryClient();
  const socket = useSocketStore((s) => s.socket);
  const { on, off } = useSocketStore();
  const { addNotification, incrementUnreadCount } = useNotificationStore();

  /** Sec. 02 — after WS reconnect, REST catch-up then refresh client caches */
  useEffect(() => {
    if (!socket) return;
    const onConnect = async () => {
      const { lastDisconnectIso } = useSocketStore.getState();
      if (!lastDisconnectIso) return;
      try {
        const res = await fetch(`/api/events?since=${encodeURIComponent(lastDisconnectIso)}`);
        if (res.ok) {
          await queryClient.invalidateQueries();
        }
      } catch (e) {
        console.warn("[WS catch-up] /api/events failed", e);
      } finally {
        useSocketStore.getState().clearLastDisconnectIso();
      }
    };
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    if (!socket) return;
    // Payroll Events
    const handlePayrollRunStatusUpdate = (data: { runId: string; status: string; progress: number }) => {
      queryClient.setQueryData(['payroll-run', data.runId], (oldData: any) => ({
        ...oldData,
        status: data.status,
        progress: data.progress,
      }));

      // Show progress overlay if user is on payroll run page
      if (window.location.pathname.includes('/payroll/run')) {
        // This would trigger a progress overlay component
        console.log('Payroll run progress:', data.progress);
      }
    };

    const handlePayrollRunCompleted = (data: { runId: string; totalGross: number; employeeCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success(`Payroll run completed: $${data.totalGross.toLocaleString()} for ${data.employeeCount} employees`);
    };

    const handlePayrollApprovalRequired = (data: { runId: string; approverIds: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.info('Payroll run requires approval');
    };

    const handlePayrollDirectDepositSent = (data: { runId: string }) => {
      queryClient.setQueryData(['payroll-run', data.runId], (oldData: any) => ({
        ...oldData,
        status: 'completed',
      }));
      toast.success('Direct deposit payments sent');
    };

    // Employee Events
    const handleEmployeeCreated = (data: { employee: any }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`New employee added: ${data.employee.firstName} ${data.employee.lastName}`);
    };

    const handleEmployeeUpdated = (data: { employeeId: string; changedFields: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.employeeId] });
    };

    const handleEmployeeTerminated = (data: { employeeId: string; lastDay: string }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.info('Employee termination processed');
    };

    const handleEmployeeTerminationInitiated = (data: { id: number; terminationDate: string; terminationType: string; finalPayDate: string | null; companyId: number | null }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['pto-requests'] });
      toast.warning(`Termination initiated — final pay due ${data.finalPayDate ?? 'next scheduled pay date'}`);
    };

    const handleEmployeeAccessRevoked = (data: { id: number; terminationDate: string }) => {
      queryClient.invalidateQueries({ queryKey: ['employee', String(data.id)] });
      toast.info('Employee platform access revoked');
    };

    const handleEmployeeCobraTriggered = (data: { id: number; terminationDate: string }) => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      queryClient.invalidateQueries({ queryKey: ['cobra'] });
      toast.info('COBRA eligibility event triggered — notice required within 14 days');
    };

    const handleEmployeeClockedIn = (data: { employeeId: string; timestamp: string }) => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      // Update live attendance panel
      queryClient.invalidateQueries({ queryKey: ['live-attendance'] });
    };

    const handleEmployeeClockedOut = (data: { employeeId: string; timestamp: string; hoursWorked: number }) => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['live-attendance'] });
    };

    // Time Events
    const handleTimePtoRequested = (data: { requestId: string; employeeId: string; dates: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['pto-requests'] });
      toast.info('New PTO request submitted');
    };

    const handleTimePtoApproved = (data: { requestId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['pto-requests'] });
      toast.success('PTO request approved');
    };

    const handleTimePtoDenied = (data: { requestId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['pto-requests'] });
      toast.error('PTO request denied');
    };

    const handleTimeOvertimeAlert = (data: { employeeId: string; hoursThisWeek: number }) => {
      toast.warning(`Overtime alert: Employee has worked ${data.hoursThisWeek} hours this week`);
    };

    // Hiring Events
    const handleAtsCandidateApplied = (data: { jobId: string; candidateId: string; candidateName: string }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.info(`${data.candidateName} applied for a position`);
    };

    const handleAtsCandidateStageChanged = (data: { candidateId: string; fromStage: string; toStage: string }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', data.candidateId] });
    };

    const handleAtsOfferSigned = (data: { candidateId: string; jobId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Offer signed! New hire incoming.');
    };

    const handleEmployeeAutoCreatedFromAts = (data: { employeeId: number; candidateId: number; personalEmail?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success(
        data.personalEmail
          ? `Employee created and pre-boarding invitation sent to ${data.personalEmail}`
          : 'Employee auto-created from ATS hire'
      );
    };

    // Expense Events
    const handleExpenseSubmitted = (data: { expenseId: string; employeeId: string; amount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.info(`Expense submitted: $${data.amount.toLocaleString()}`);
    };

    const handleExpenseApproved = (data: { expenseId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense approved');
    };

    const handleExpenseDenied = (data: { expenseId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.error('Expense denied');
    };

    // Notification Events
    const handleNotificationNew = (data: { notification: any }) => {
      addNotification(data.notification);
      incrementUnreadCount();
      toast.info(data.notification.title);
    };

    const handleNotificationBatchUpdate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    // Workflow Automation Events
    const handleWorkflowActionExecuted = (data: {
      workflowId: string;
      workflowName: string;
      triggeredBy: "automation";
      actionType: "update_field" | "create_task" | "send_email" | "change_status";
      entityType: "employee" | "task" | "job" | "onboarding";
      entityId: string | number;
      changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
      timestamp: string;
    }) => {
      // Cache invalidation per Section 02 rules
      if (data.entityType === "employee") {
        queryClient.invalidateQueries({ queryKey: ["employees", String(data.entityId)] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      }
      if (data.entityType === "task") {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      }
      if (data.actionType === "change_status") {
        queryClient.invalidateQueries({ queryKey: ["dashboard", data.entityType] });
      }
      queryClient.invalidateQueries({ queryKey: ["activity-feed"] });

      const firstField = data.changedFields[0]?.field;
      const summary = firstField
        ? `${data.workflowName} automatically updated ${firstField}`
        : `${data.workflowName} performed ${data.actionType.replace(/_/g, " ")}`;
      toast.info(summary, { description: "Automated" });
    };

    // Compliance Events
    const handleComplianceAlertNew = (data: { alertId: string; severity: string; description: string }) => {
      if (data.severity === 'critical') {
        // Show orange topbar banner
        toast.error(`Critical compliance alert: ${data.description}`, {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.warning(`Compliance alert: ${data.description}`);
      }
    };

    // System Events
    const handleSystemMaintenanceScheduled = (data: { startAt: string; duration: number }) => {
      toast.warning(`System maintenance scheduled for ${new Date(data.startAt).toLocaleString()}`);
    };

    const handleFeatureAnnouncement = (data: { title: string; description: string; ctaUrl?: string }) => {
      toast.success(data.title, {
        description: data.description,
        action: data.ctaUrl ? {
          label: 'Learn More',
          onClick: () => window.open(data.ctaUrl, '_blank'),
        } : undefined,
      });
    };

    // Register all event handlers
    on('payroll.run.status_update', handlePayrollRunStatusUpdate);
    on('payroll.run.completed', handlePayrollRunCompleted);
    on('payroll.approval.required', handlePayrollApprovalRequired);
    on('payroll.direct_deposit.sent', handlePayrollDirectDepositSent);

    on('employee.created', handleEmployeeCreated);
    on('employee.updated', handleEmployeeUpdated);
    on('employee.terminated', handleEmployeeTerminated);
    on('employee.termination.initiated', handleEmployeeTerminationInitiated);
    on('employee.access.revoked', handleEmployeeAccessRevoked);
    on('employee.cobra.triggered', handleEmployeeCobraTriggered);
    on('employee.clocked_in', handleEmployeeClockedIn);
    on('employee.clocked_out', handleEmployeeClockedOut);

    on('time.pto.requested', handleTimePtoRequested);
    on('time.pto.approved', handleTimePtoApproved);
    on('time.pto.denied', handleTimePtoDenied);
    on('time.overtime.alert', handleTimeOvertimeAlert);

    on('ats.candidate.applied', handleAtsCandidateApplied);
    on('ats.candidate.stage_changed', handleAtsCandidateStageChanged);
    on('ats.offer.signed', handleAtsOfferSigned);
    on('employee.auto_created_from_ats', handleEmployeeAutoCreatedFromAts);

    on('expense.submitted', handleExpenseSubmitted);
    on('expense.approved', handleExpenseApproved);
    on('expense.denied', handleExpenseDenied);

    on('notification.new', handleNotificationNew);
    on('notification.batch_update', handleNotificationBatchUpdate);

    on('compliance.alert.new', handleComplianceAlertNew);

    on('system.maintenance.scheduled', handleSystemMaintenanceScheduled);
    on('feature.announcement', handleFeatureAnnouncement);
    on('workflow.action.executed', handleWorkflowActionExecuted);

    // Cleanup function
    return () => {
      off('payroll.run.status_update', handlePayrollRunStatusUpdate);
      off('payroll.run.completed', handlePayrollRunCompleted);
      off('payroll.approval.required', handlePayrollApprovalRequired);
      off('payroll.direct_deposit.sent', handlePayrollDirectDepositSent);

      off('employee.created', handleEmployeeCreated);
      off('employee.updated', handleEmployeeUpdated);
      off('employee.terminated', handleEmployeeTerminated);
      off('employee.termination.initiated', handleEmployeeTerminationInitiated);
      off('employee.access.revoked', handleEmployeeAccessRevoked);
      off('employee.cobra.triggered', handleEmployeeCobraTriggered);
      off('employee.clocked_in', handleEmployeeClockedIn);
      off('employee.clocked_out', handleEmployeeClockedOut);

      off('time.pto.requested', handleTimePtoRequested);
      off('time.pto.approved', handleTimePtoApproved);
      off('time.pto.denied', handleTimePtoDenied);
      off('time.overtime.alert', handleTimeOvertimeAlert);

      off('ats.candidate.applied', handleAtsCandidateApplied);
      off('ats.candidate.stage_changed', handleAtsCandidateStageChanged);
      off('ats.offer.signed', handleAtsOfferSigned);
      off('employee.auto_created_from_ats', handleEmployeeAutoCreatedFromAts);

      off('expense.submitted', handleExpenseSubmitted);
      off('expense.approved', handleExpenseApproved);
      off('expense.denied', handleExpenseDenied);

      off('notification.new', handleNotificationNew);
      off('notification.batch_update', handleNotificationBatchUpdate);

      off('compliance.alert.new', handleComplianceAlertNew);

      off('system.maintenance.scheduled', handleSystemMaintenanceScheduled);
      off('feature.announcement', handleFeatureAnnouncement);
      off('workflow.action.executed', handleWorkflowActionExecuted);
    };
  }, [socket, queryClient, on, off, addNotification, incrementUnreadCount]);
};