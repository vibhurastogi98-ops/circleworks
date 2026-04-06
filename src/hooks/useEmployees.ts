"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "./useDataSync";
import { toast } from "sonner";

// Real API fetch
const fetchEmployees = async () => {
  const response = await fetch("/api/employees");
  if (!response.ok) throw new Error("Failed to fetch employees");
  return response.json();
};

export function useEmployees() {
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000,
  });

  // Real Add Employee Mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: any) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (!response.ok) throw new Error("Failed to add employee");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      notifyEmployeeChange();
      toast.success("Employee added successfully!");
    },
    onError: (err) => {
      console.error("Mutation Error:", err);
      toast.error("Failed to add employee.");
    }
  });

  return {
    ...query,
    addEmployee: addEmployeeMutation.mutate,
    isAdding: addEmployeeMutation.isPending,
    addEmployeeAsync: addEmployeeMutation.mutateAsync,
  };
}
