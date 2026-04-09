"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "./useDataSync";
import { toast } from "sonner";

// Real API fetch
const fetchEmployees = async () => {
  console.log("[useEmployees] Fetching employees from API...");
  const response = await fetch("/api/employees");
  if (!response.ok) throw new Error("Failed to fetch employees");
  const data = await response.json();
  console.log("[useEmployees] Fetched employees:", data);
  console.log("[useEmployees] Number of employees:", data?.length || 0);
  return data;
};

export function useEmployees() {
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 0, // Force refetch every time
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
      console.log("[useEmployees] Invalidating queries and refetching...");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"] });
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

export function useEmployee(id: string | number) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${id}`);
      if (!response.ok) throw new Error("Failed to fetch employee");
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
