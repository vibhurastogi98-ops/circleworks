import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { showMutationErrorToast } from "@/lib/mutationToasts";

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  optimisticUpdates?: Array<{
    queryKey: (variables: TVariables) => unknown[];
    updater: (oldData: unknown, variables: TVariables) => unknown;
  }>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  actionLabel?: string | ((variables: TVariables) => string);
  invalidateQueries?: string[][];
}

/**
 * Hook for mutations with optimistic UI updates
 * Pattern: (1) immediately update local cache, (2) send API request, (3) on error → rollback cache to previous + show error toast
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  optimisticUpdates = [],
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  actionLabel = "complete this action",
  invalidateQueries = [],
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    invalidateQueries.forEach(([queryKey, ...params]) => {
      queryClient.invalidateQueries({ queryKey: [queryKey, ...params] });
    });
  };

  const showSuccess = (data: TData, variables: TVariables) => {
    if (!successMessage) return;
    const message =
      typeof successMessage === "function"
        ? successMessage(data, variables)
        : successMessage;
    toast.success(message);
  };

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      const queryKeys = [
        ...invalidateQueries.map(([queryKey, ...params]) => [
          queryKey,
          ...params,
        ]),
        ...optimisticUpdates.map((update) => update.queryKey(variables)),
      ];

      await Promise.all(
        queryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })),
      );

      const previousData = queryKeys.map((queryKey) => ({
        queryKey,
        data: queryClient.getQueryData(queryKey),
      }));

      optimisticUpdates.forEach((update) => {
        const queryKey = update.queryKey(variables);
        queryClient.setQueryData(queryKey, (oldData) =>
          update.updater(oldData, variables),
        );
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach((snapshot) => {
          queryClient.setQueryData(snapshot.queryKey, snapshot.data);
        });
      }

      const action =
        typeof actionLabel === "function" ? actionLabel(variables) : actionLabel;
      const retry = () => {
        void mutationFn(variables)
          .then((data) => {
            invalidate();
            showSuccess(data as TData, variables as TVariables);
            onSuccess?.(data as TData, variables as TVariables);
          })
          .catch(() => {
            showMutationErrorToast({ action, retry });
          });
      };

      if (errorMessage) toast.error(errorMessage);
      showMutationErrorToast({ action, retry });

      // Call custom error handler
      onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      invalidate();
      showSuccess(data as TData, variables as TVariables);

      // Call custom success handler
      onSuccess?.(data, variables);
    },
  });
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function apiPath(path: string) {
  return `${API_BASE}${path}`;
}

function patchEntityInList(
  oldData: unknown,
  id: string,
  patch: Record<string, unknown>,
) {
  const patchEntity = (item: any) =>
    String(item?.id) === id ? { ...item, ...patch } : item;

  if (Array.isArray(oldData)) return oldData.map(patchEntity);
  if (
    oldData &&
    typeof oldData === "object" &&
    Array.isArray((oldData as any).data)
  ) {
    return {
      ...(oldData as any),
      data: (oldData as any).data.map(patchEntity),
    };
  }
  return oldData;
}

/**
 * Hook for employee profile updates with optimistic UI
 */
export function useOptimisticEmployeeUpdate() {
  return useOptimisticMutation({
    mutationFn: async ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: any;
    }) => {
      const response = await fetch(apiPath(`/v1/employees/${employeeId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update employee");
      return response.json();
    },
    optimisticUpdates: [
      {
        queryKey: ({ employeeId }) => ["employee", employeeId],
        updater: (oldData, { data }) => ({
          ...((oldData as Record<string, unknown>) || {}),
          ...data,
        }),
      },
      {
        queryKey: () => ["employees"],
        updater: (oldData, { employeeId, data }) =>
          patchEntityInList(oldData, employeeId, data),
      },
    ],
    successMessage: "Employee profile updated",
    actionLabel: "update employee",
    invalidateQueries: [["employees"], ["employee"]],
  });
}

/**
 * Hook for PTO approval with optimistic UI
 */
export function useOptimisticPtoApproval() {
  return useOptimisticMutation({
    mutationFn: async ({
      requestId,
      approved,
    }: {
      requestId: string;
      approved: boolean;
    }) => {
      const response = await fetch(
        apiPath(`/v1/time/pto/requests/${requestId}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: approved ? "approved" : "denied" }),
        },
      );
      if (!response.ok) throw new Error("Failed to update PTO request");
      return response.json();
    },
    optimisticUpdates: [
      {
        queryKey: () => ["pto-requests"],
        updater: (oldData, { requestId, approved }) =>
          patchEntityInList(oldData, requestId, {
            status: approved ? "approved" : "denied",
          }),
      },
      {
        queryKey: () => ["time", "pto", "requests"],
        updater: (oldData, { requestId, approved }) =>
          patchEntityInList(oldData, requestId, {
            status: approved ? "Approved" : "Denied",
          }),
      },
    ],
    successMessage: (data, variables) =>
      variables.approved ? "PTO request approved" : "PTO request denied",
    actionLabel: "update PTO request",
    invalidateQueries: [["pto-requests"]],
  });
}

/**
 * Hook for expense approval with optimistic UI
 */
export function useOptimisticExpenseApproval() {
  return useOptimisticMutation({
    mutationFn: async ({
      expenseId,
      approved,
    }: {
      expenseId: string;
      approved: boolean;
    }) => {
      const response = await fetch(
        apiPath(`/v1/expenses/${expenseId}/approve`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: approved ? "approved" : "denied" }),
        },
      );
      if (!response.ok) throw new Error("Failed to update expense");
      return response.json();
    },
    optimisticUpdates: [
      {
        queryKey: () => ["expenses"],
        updater: (oldData, { expenseId, approved }) =>
          patchEntityInList(oldData, expenseId, {
            status: approved ? "approved" : "denied",
          }),
      },
    ],
    successMessage: (data, variables) =>
      variables.approved ? "Expense approved" : "Expense denied",
    actionLabel: "update expense",
    invalidateQueries: [["expenses"]],
  });
}

/**
 * Hook for ATS stage changes with optimistic UI
 */
export function useOptimisticAtsStageChange() {
  return useOptimisticMutation({
    mutationFn: async ({
      candidateId,
      stage,
    }: {
      candidateId: string;
      stage: string;
    }) => {
      const response = await fetch(
        apiPath(`/v1/candidates/${candidateId}/stage`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ stage }),
        },
      );
      if (!response.ok) throw new Error("Failed to update candidate stage");
      return response.json();
    },
    optimisticUpdates: [
      {
        queryKey: ({ candidateId }) => ["candidate", candidateId],
        updater: (oldData, { stage }) => ({
          ...((oldData as Record<string, unknown>) || {}),
          stage,
          currentStage: stage,
        }),
      },
      {
        queryKey: () => ["candidates"],
        updater: (oldData, { candidateId, stage }) =>
          patchEntityInList(oldData, candidateId, {
            stage,
            currentStage: stage,
          }),
      },
    ],
    successMessage: "Candidate stage updated",
    actionLabel: "update candidate stage",
    invalidateQueries: [["candidates"], ["candidate"]],
  });
}
