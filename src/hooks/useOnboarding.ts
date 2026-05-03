import { useQuery } from "@tanstack/react-query";

export interface OnboardingCase {
  id: string;
  employeeId: number;
  employeeName: string;
  avatar: string;
  department: string;
  startDate: string;
  phase: string;
  tasks: any[];
  onboardingPercent: number;
}

export function useOnboarding() {
  return useQuery<OnboardingCase[]>({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding", { credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to fetch onboarding cases");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
