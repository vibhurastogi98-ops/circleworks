
import { useQuery } from "@tanstack/react-query";
import { 
  KPI_CARDS, 
  ALERTS, 
  PAYROLL_TREND, 
  QUICK_ACTIONS, 
  NEW_HIRES, 
  TEAM_CALENDAR, 
  ACTIVITY_FEED,
  NEXT_PAYROLL,
  NewHire
} from "@/data/dashboard";

export function useDashboardData() {
  // Guest Mode: Hardcoded user data
  const user = {
    firstName: "Admin",
    lastName: "User",
    publicMetadata: { companyName: "CircleWorks Demo", hasData: true, companyLogoUrl: "" }
  };
  const isLoaded = true;

  // 1. Fetch Dashboard Stats
  const { data: liveStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: true, // Always fetch in guest mode
  });

  const signupProgress = typeof window !== 'undefined' ? localStorage.getItem("circleworks_signup_progress") : null;
  const localCompanyName = signupProgress ? JSON.parse(signupProgress)?.companyName : null;
  const localLogoUrl = signupProgress ? JSON.parse(signupProgress)?.logoUrl : null;
  const clerkCompanyName = user?.publicMetadata?.companyName as string | undefined;
  const clerkLogoUrl = user?.publicMetadata?.companyLogoUrl as string | undefined;
  const displayCompanyName = clerkCompanyName || localCompanyName || "Your Company";
  const displayLogoUrl = clerkLogoUrl || localLogoUrl;

  if (!isLoaded || statsLoading) {
    return {
      isLoading: true,
      currentUser: { firstName: "...", lastName: "", companyName: displayCompanyName, logoUrl: displayLogoUrl },
      nextPayroll: { date: "---", daysAway: 0, estimatedTotal: 0, employeeCount: 0 },
      kpiCards: KPI_CARDS.map(card => ({ ...card, value: "---", trend: 0, trendLabel: "...", sparklineData: [] })),
      isNewUser: false,
      alerts: [], payrollTrend: [], quickActions: [], newHires: [], teamCalendar: [], activityFeed: [],
    };
  }

  const clerkHasData = !!user?.publicMetadata?.hasData;
  const showMocks = clerkHasData || (typeof window !== 'undefined' && window.location.search.includes("mock=true"));
  const isEmpty = !showMocks;

  // 2. DYNAMIC OVERRIDES
  const liveKpiCards = KPI_CARDS.map(card => {
    if (card.id === "total-employees" && liveStats?.totalEmployees !== undefined) {
      return { ...card, value: liveStats.totalEmployees.toString() };
    }
    if (card.id === "monthly-payroll" && liveStats?.monthlyPayroll !== undefined) {
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(liveStats.monthlyPayroll);
      return { ...card, value: formatted };
    }
    if (card.id === "pending-approvals" && liveStats?.pendingApprovals !== undefined) {
      return { ...card, value: liveStats.pendingApprovals.toString() };
    }
    return card;
  });

  const liveNewHires = (clerkHasData && liveStats?.recentHires) ? liveStats.recentHires : (isEmpty ? [] : NEW_HIRES);

  return {
    isLoading: false,
    isNewUser: isEmpty,
    currentUser: {
      firstName: user?.firstName || "Welcome",
      lastName: user?.lastName || "",
      companyName: displayCompanyName,
      logoUrl: displayLogoUrl,
    },
    nextPayroll: isEmpty ? { date: "Pending Setup", daysAway: 0, estimatedTotal: 0, employeeCount: 0 } : NEXT_PAYROLL,
    kpiCards: isEmpty ? KPI_CARDS.map(card => ({
      ...card,
      value: card.format === "score" ? "100" : (card.format === "currency" ? "$0" : "0"),
      trend: 0, trendLabel: "No historical data",
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      scoreColor: "green" as const,
    })) : liveKpiCards,
    alerts: isEmpty ? [{
      id: "alert-new-1", severity: "info" as const, title: "Complete your company setup",
      description: "Add your first employee to run your first payroll.",
      action: "/employees/new", actionLabel: "Add Employee",
    }] : ALERTS,
    payrollTrend: isEmpty ? PAYROLL_TREND.map(p => ({ ...p, gross: 0, taxes: 0, benefits: 0 })) : PAYROLL_TREND,
    quickActions: isEmpty ? [] : QUICK_ACTIONS,
    newHires: liveNewHires as NewHire[],
    teamCalendar: isEmpty ? [
      { day: "Mon", date: 6, events: [] },
      { day: "Tue", date: 7, isToday: true, events: [] },
      { day: "Wed", date: 8, events: [] },
      { day: "Thu", date: 9, events: [] },
      { day: "Fri", date: 10, events: [] },
    ] : TEAM_CALENDAR,
    activityFeed: isEmpty ? [] : ACTIVITY_FEED,
  };
}
