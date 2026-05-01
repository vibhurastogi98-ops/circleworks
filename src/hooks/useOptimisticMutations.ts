import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  invalidateQueries?: string[][];
}

/**
 * Hook for mutations with optimistic UI updates
 * Pattern: (1) immediately update local cache, (2) send API request, (3) on error → rollback cache to previous + show error toast
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage = 'Something went wrong. Please try again.',
  invalidateQueries = [],
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await Promise.all(
        invalidateQueries.map(([queryKey, ...params]) =>
          queryClient.cancelQueries({ queryKey: [queryKey, ...params] })
        )
      );

      // Snapshot the previous values
      const previousData = invalidateQueries.map(([queryKey, ...params]) =>
        queryClient.getQueryData([queryKey, ...params])
      );

      // Return a context object with the snapshotted values
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        invalidateQueries.forEach(([queryKey, ...params], index) => {
          queryClient.setQueryData([queryKey, ...params], context.previousData[index]);
        });
      }

      // Show error toast
      toast.error(errorMessage);

      // Call custom error handler
      onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch fresh data
      invalidateQueries.forEach(([queryKey, ...params]) => {
        queryClient.invalidateQueries({ queryKey: [queryKey, ...params] });
      });

      // Show success toast
      if (successMessage) {
        const message =
          typeof successMessage === 'function'
            ? successMessage(data as TData, variables as TVariables)
            : successMessage;
        toast.success(message);
      }

      // Call custom success handler
      onSuccess?.(data, variables);
    },
  });
}

/**
 * Hook for employee profile updates with optimistic UI
 */
export function useOptimisticEmployeeUpdate() {
  return useOptimisticMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: any }) => {
      const response = await fetch(`/api/v1/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update employee');
      return response.json();
    },
    successMessage: 'Employee profile updated',
    invalidateQueries: [['employees'], ['employee']],
  });
}

/**
 * Hook for PTO approval with optimistic UI
 */
export function useOptimisticPtoApproval() {
  return useOptimisticMutation({
    mutationFn: async ({ requestId, approved }: { requestId: string; approved: boolean }) => {
      const response = await fetch(`/api/v1/time/pto/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!response.ok) throw new Error('Failed to update PTO request');
      return response.json();
    },
    successMessage: (data, variables) =>
      variables.approved ? 'PTO request approved' : 'PTO request denied',
    invalidateQueries: [['pto-requests']],
  });
}

/**
 * Hook for expense approval with optimistic UI
 */
export function useOptimisticExpenseApproval() {
  return useOptimisticMutation({
    mutationFn: async ({ expenseId, approved }: { expenseId: string; approved: boolean }) => {
      const response = await fetch(`/api/v1/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      return response.json();
    },
    successMessage: (data, variables) =>
      variables.approved ? 'Expense approved' : 'Expense denied',
    invalidateQueries: [['expenses']],
  });
}

/**
 * Hook for ATS stage changes with optimistic UI
 */
export function useOptimisticAtsStageChange() {
  return useOptimisticMutation({
    mutationFn: async ({ candidateId, stage }: { candidateId: string; stage: string }) => {
      const response = await fetch(`/api/v1/hiring/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) throw new Error('Failed to update candidate stage');
      return response.json();
    },
    successMessage: 'Candidate stage updated',
    invalidateQueries: [['candidates'], ['candidate']],
  });
}