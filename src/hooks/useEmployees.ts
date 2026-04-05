"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "./useDataSync";
import { mockEmployees, Employee } from "@/data/mockEmployees";
import { toast } from "sonner";

// Simulate API fetch
const fetchEmployees = async (): Promise<Employee[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEmployees;
};

export function useEmployees() {
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000,
  });

  // Example: Add Employee Mutation with Optimistic Update
  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: Partial<Employee>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...newEmployee, id: `emp-${Math.random().toString(36).substr(2, 9)}` } as Employee;
    },
    onMutate: async (newEmployee) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["employees"] });

      // Snapshot the previous value
      const previousEmployees = queryClient.getQueryData<Employee[]>(["employees"]);

      // Optimistically update to the new value
      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(["employees"], [
          ...previousEmployees,
          { ...newEmployee, id: "temp-id" } as Employee,
        ]);
      }

      return { previousEmployees };
    },
    onError: (err, newEmployee, context) => {
      // Rollback to the previous value if the mutation fails
      if (context?.previousEmployees) {
        queryClient.setQueryData(["employees"], context.previousEmployees);
      }
      toast.error("Failed to add employee. Rolling back.");
    },
    onSettled: () => {
      // Rule 2: Invalidate all related employee data
      notifyEmployeeChange();
    },
    onSuccess: () => {
      toast.success("Employee added successfully!");
    }
  });

  return {
    ...query,
    addEmployee: addEmployeeMutation.mutate,
    isAdding: addEmployeeMutation.isPending,
  };
}
