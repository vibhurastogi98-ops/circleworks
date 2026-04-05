import { useUser } from "@clerk/nextjs";
import { 
  CURRENT_USER, 
  NEXT_PAYROLL, 
  KPI_CARDS, 
  ALERTS, 
  PAYROLL_TREND, 
  QUICK_ACTIONS, 
  NEW_HIRES, 
  TEAM_CALENDAR, 
  ACTIVITY_FEED 
} from "@/data/dashboard";

export function useDashboardData() {
  const { user, isLoaded } = useUser();

  // Retrieve company data from localStorage early to avoid '---' flickering
  const signupProgress = typeof window !== 'undefined' ? localStorage.getItem("circleworks_signup_progress") : null;
  const localCompanyName = signupProgress ? JSON.parse(signupProgress)?.companyName : null;
  const clerkCompanyName = user?.publicMetadata?.companyName as string | undefined;
  const clerkLogoUrl = user?.publicMetadata?.companyLogoUrl as string | undefined;
  const displayCompanyName = clerkCompanyName || localCompanyName || "CircleWorks";

  // If still loading Clerk, return a skeleton/loading state but with the derived company name
  if (!isLoaded) {
    return {
      isLoading: true,
      currentUser: { 
        firstName: "---", 
        lastName: "", 
        companyName: displayCompanyName,
        logoUrl: clerkLogoUrl,
      },
      nextPayroll: { date: "---", daysAway: 0, estimatedTotal: 0, employeeCount: 0 },
      kpiCards: KPI_CARDS.map(card => ({ ...card, value: "---", trend: 0, trendLabel: "...", sparklineData: [] })),
      alerts: [],
      payrollTrend: [],
      quickActions: [],
      newHires: [],
      teamCalendar: [],
      activityFeed: [],
    };
  }

  // Consider user "new" if created within the last 48 hours OR if we have signup progress in localStorage
  const isNew = user 
    ? (Date.now() - new Date(user.createdAt!).getTime() < 48 * 60 * 60 * 1000) || !!signupProgress
    : !!signupProgress;

  return {
    isLoading: false,
    isNewUser: isNew,
    currentUser: {
      firstName: user?.firstName || "Welcome",
      lastName: user?.lastName || "",
      companyName: displayCompanyName,
      logoUrl: clerkLogoUrl,
    },
    nextPayroll: isNew ? {
      date: "Pending Setup",
      daysAway: 0,
      estimatedTotal: 0,
      employeeCount: 0,
    } : NEXT_PAYROLL,
    kpiCards: isNew ? KPI_CARDS.map(card => ({
      ...card,
      value: card.format === "score" ? "100" : (card.format === "currency" ? "$0" : "0"),
      trend: 0,
      trendLabel: "No historical data",
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      scoreColor: "green" as const,
    })) : KPI_CARDS,
    alerts: isNew ? [
      {
        id: "alert-new-1",
        severity: "info",
        title: "Complete your company setup",
        description: "Add your first employee to run your first payroll.",
        action: "/employees/new",
        actionLabel: "Add Employee",
      }
    ] as typeof ALERTS : ALERTS,
    payrollTrend: isNew ? PAYROLL_TREND.map(p => ({ ...p, gross: 0, taxes: 0, benefits: 0 })) : PAYROLL_TREND,
    quickActions: isNew ? [] : QUICK_ACTIONS,
    newHires: isNew ? [] : NEW_HIRES,
    teamCalendar: isNew ? [
      { day: "Mon", date: 6, events: [] },
      { day: "Tue", date: 7, isToday: true, events: [] },
      { day: "Wed", date: 8, events: [] },
      { day: "Thu", date: 9, events: [] },
      { day: "Fri", date: 10, events: [] },
    ] : TEAM_CALENDAR,
    activityFeed: isNew ? [] : ACTIVITY_FEED,
  };
}
