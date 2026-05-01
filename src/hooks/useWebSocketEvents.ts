import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketStore } from '@/store/useSocketStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from 'sonner';

export const useWebSocketEvents = () => {
  const queryClient = useQueryClient();
  const { on, off } = useSocketStore();
  const { addNotification, incrementUnreadCount } = useNotificationStore();

  useEffect(() => {
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
    on('employee.clocked_in', handleEmployeeClockedIn);
    on('employee.clocked_out', handleEmployeeClockedOut);

    on('time.pto.requested', handleTimePtoRequested);
    on('time.pto.approved', handleTimePtoApproved);
    on('time.pto.denied', handleTimePtoDenied);
    on('time.overtime.alert', handleTimeOvertimeAlert);

    on('ats.candidate.applied', handleAtsCandidateApplied);
    on('ats.candidate.stage_changed', handleAtsCandidateStageChanged);
    on('ats.offer.signed', handleAtsOfferSigned);

    on('expense.submitted', handleExpenseSubmitted);
    on('expense.approved', handleExpenseApproved);
    on('expense.denied', handleExpenseDenied);

    on('notification.new', handleNotificationNew);
    on('notification.batch_update', handleNotificationBatchUpdate);

    on('compliance.alert.new', handleComplianceAlertNew);

    on('system.maintenance.scheduled', handleSystemMaintenanceScheduled);
    on('feature.announcement', handleFeatureAnnouncement);

    // Cleanup function
    return () => {
      off('payroll.run.status_update', handlePayrollRunStatusUpdate);
      off('payroll.run.completed', handlePayrollRunCompleted);
      off('payroll.approval.required', handlePayrollApprovalRequired);
      off('payroll.direct_deposit.sent', handlePayrollDirectDepositSent);

      off('employee.created', handleEmployeeCreated);
      off('employee.updated', handleEmployeeUpdated);
      off('employee.terminated', handleEmployeeTerminated);
      off('employee.clocked_in', handleEmployeeClockedIn);
      off('employee.clocked_out', handleEmployeeClockedOut);

      off('time.pto.requested', handleTimePtoRequested);
      off('time.pto.approved', handleTimePtoApproved);
      off('time.pto.denied', handleTimePtoDenied);
      off('time.overtime.alert', handleTimeOvertimeAlert);

      off('ats.candidate.applied', handleAtsCandidateApplied);
      off('ats.candidate.stage_changed', handleAtsCandidateStageChanged);
      off('ats.offer.signed', handleAtsOfferSigned);

      off('expense.submitted', handleExpenseSubmitted);
      off('expense.approved', handleExpenseApproved);
      off('expense.denied', handleExpenseDenied);

      off('notification.new', handleNotificationNew);
      off('notification.batch_update', handleNotificationBatchUpdate);

      off('compliance.alert.new', handleComplianceAlertNew);

      off('system.maintenance.scheduled', handleSystemMaintenanceScheduled);
      off('feature.announcement', handleFeatureAnnouncement);
    };
  }, [queryClient, on, off, addNotification, incrementUnreadCount]);
};