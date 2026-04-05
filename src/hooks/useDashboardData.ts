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
  const { user } = useUser();

  // Consider user "new" if created within the last 48 hours, or if they don't exist in Clerk (fallback)
  const isNew = user ? (Date.now() - new Date(user.createdAt!).getTime() < 48 * 60 * 60 * 1000) : false;

  // Retrieve temporary company data saved from signup flow (if any)
  const signupProgress = typeof window !== 'undefined' ? localStorage.getItem("circleworks_signup_progress") : null;
  const companyName = signupProgress ? JSON.parse(signupProgress)?.data?.companyName : "your new workspace";

  return {
    isNewUser: isNew,
    currentUser: {
      firstName: user?.firstName || "Welcome",
      lastName: user?.lastName || "",
      companyName: companyName || "CircleWorks",
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
    quickActions: QUICK_ACTIONS,
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
