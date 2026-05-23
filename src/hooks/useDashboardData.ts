import { useQuery } from "@tanstack/react-query";
import {
  ACTIVITY_FEED,
  ALERTS,
  CURRENT_USER,
  KPI_CARDS,
  NEW_HIRES,
  NEXT_PAYROLL,
  PAYROLL_TREND,
  QUICK_ACTIONS,
  TEAM_CALENDAR,
  type ActivityEvent,
  type AlertItem,
  type CalendarDay,
  type KpiCard,
  type NewHire,
  type PayrollMonth,
  type QuickAction,
} from "@/data/dashboard";
import { useDashboardRealtimeStore } from "@/store/useDashboardRealtimeStore";

export type DashboardData = {
  currentUser: {
    firstName: string;
    lastName: string;
    companyName: string;
    logoUrl?: string;
  };
  nextPayroll: typeof NEXT_PAYROLL;
  kpiCards: KpiCard[];
  alerts: AlertItem[];
  payrollTrend: PayrollMonth[];
  quickActions: QuickAction[];
  newHires: NewHire[];
  teamCalendar: CalendarDay[];
  activityFeed: ActivityEvent[];
  isNewUser: boolean;
};

function readSignupProgress() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("circleworks_signup_progress");
    return raw ? JSON.parse(raw) as { companyName?: string; logoUrl?: string } : null;
  } catch {
    return null;
  }
}

async function fetchDashboardData(): Promise<Partial<DashboardData> | null> {
  const res = await fetch("/api/dashboard/stats", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

function applyLiveStats(data: DashboardData, liveStats: Partial<DashboardData> | null): DashboardData {
  if (!liveStats) return data;

  return {
    ...data,
    nextPayroll: liveStats.nextPayroll ?? data.nextPayroll,
    kpiCards: liveStats.kpiCards ?? data.kpiCards,
    alerts: liveStats.alerts ?? data.alerts,
    payrollTrend: liveStats.payrollTrend ?? data.payrollTrend,
    quickActions: liveStats.quickActions ?? data.quickActions,
    newHires: liveStats.newHires ?? data.newHires,
    teamCalendar: liveStats.teamCalendar ?? data.teamCalendar,
    activityFeed: liveStats.activityFeed ?? data.activityFeed,
  };
}

export function useDashboardData() {
  const { employeeDelta, notificationDelta } = useDashboardRealtimeStore();

  const signupProgress = readSignupProgress();
  const companyName = signupProgress?.companyName || "CircleWorks Demo";
  const logoUrl = signupProgress?.logoUrl || "";

  const fallbackData: DashboardData = {
    currentUser: {
      firstName: CURRENT_USER.firstName,
      lastName: CURRENT_USER.lastName,
      companyName,
      logoUrl,
    },
    nextPayroll: NEXT_PAYROLL,
    kpiCards: KPI_CARDS,
    alerts: ALERTS,
    payrollTrend: PAYROLL_TREND,
    quickActions: QUICK_ACTIONS,
    newHires: NEW_HIRES,
    teamCalendar: TEAM_CALENDAR,
    activityFeed: ACTIVITY_FEED,
    isNewUser: false,
  };

  const { data: liveStats, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const data = applyLiveStats(fallbackData, liveStats ?? null);
  const totalEmployees = Number(data.kpiCards.find((card) => card.id === "total-employees")?.value ?? 0);
  const pendingApprovals = Number(data.kpiCards.find((card) => card.id === "pending-approvals")?.value ?? 0);

  return {
    ...data,
    isLoading,
    kpiCards: data.kpiCards.map((card) => {
      if (card.id === "total-employees") {
        return {
          ...card,
          value: String(totalEmployees + employeeDelta),
          trendLabel: employeeDelta > 0 ? `+${employeeDelta} live employee update` : card.trendLabel,
        };
      }
      if (card.id === "pending-approvals" && notificationDelta > 0) {
        return {
          ...card,
          value: String(pendingApprovals + notificationDelta),
          trendLabel: `${pendingApprovals + notificationDelta} open approvals`,
        };
      }
      return card;
    }),
  };
}
