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
    queryKey: ["onboarding-cases"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding");
      if (!response.ok) throw new Error("Failed to fetch onboarding cases");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
