// ─── Mock Data for Dashboard ─────────────────────────────────────────────────

export const CURRENT_USER = {
  firstName: "User",
  lastName: "",
  role: "ADMIN" as const, // ADMIN | HR | EMPLOYEE
  email: "",
  avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=transparent`,
};

// ─── Next Payroll ────────────────────────────────────────────────────────────

export const NEXT_PAYROLL = {
  date: "Pending",
  daysAway: 0,
  estimatedTotal: 0,
  employeeCount: 0,
};

// ─── KPI Cards ───────────────────────────────────────────────────────────────

export type KpiCard = {
  id: string;
  label: string;
  value: string;
  trend: number; // positive = green, negative = red
  trendLabel: string;
  sparklineData: number[];
  icon: string; // lucide icon name
  format?: "currency" | "number" | "score";
  scoreColor?: "red" | "yellow" | "green";
};

export const KPI_CARDS: KpiCard[] = [
  {
    id: "total-employees",
    label: "Total Employees",
    value: "0",
    trend: 0,
    trendLabel: "0% vs last month",
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
    icon: "Users",
    format: "number",
  },
  {
    id: "monthly-payroll",
    label: "Monthly Payroll",
    value: "$0",
    trend: 0,
    trendLabel: "0% vs last month",
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
    icon: "DollarSign",
    format: "currency",
  },
  {
    id: "pending-approvals",
    label: "Pending Approvals",
    value: "0",
    trend: 0,
    trendLabel: "Action required",
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
    icon: "ClipboardCheck",
    format: "number",
  },
  {
    id: "compliance-score",
    label: "Compliance Score",
    value: "100",
    trend: 0,
    trendLabel: "Perfect",
    sparklineData: [95, 96, 98, 99, 100, 100, 100],
    icon: "ShieldCheck",
    format: "score",
    scoreColor: "green",
  },
];

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  action: string;
  actionLabel: string;
};

export const ALERTS: AlertItem[] = [];

// ─── Payroll Cost Trend (6 months of grouped bar data) ──────────────────────

export type PayrollMonth = {
  month: string;
  gross: number;
  taxes: number;
  benefits: number;
};

export const PAYROLL_TREND: PayrollMonth[] = [];

// ─── Quick Actions ───────────────────────────────────────────────────────────

export type QuickAction = {
  id: string;
  label: string;
  badge?: number;
  icon: string;
  href: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "add-employee", label: "Add Employee", icon: "UserPlus", href: "/employees/new" },
  { id: "run-report", label: "Run Report", icon: "BarChart3", href: "/reports" },
];

// ─── New Hires ───────────────────────────────────────────────────────────────

export type NewHire = {
  id: string;
  name: string;
  title: string;
  startDate: string;
  onboardingPercent: number;
  avatarSeed: string;
};

export const NEW_HIRES: NewHire[] = [];

// ─── Team Calendar ───────────────────────────────────────────────────────────

export type CalendarDay = {
  day: string;
  date: number;
  isToday?: boolean;
  events: { name: string; type: "pto" | "holiday" | "birthday"; avatarSeed: string }[];
};

export const TEAM_CALENDAR: CalendarDay[] = [];

// ─── Activity Feed ───────────────────────────────────────────────────────────

export type ActivityEvent = {
  id: string;
  actor: string;
  avatarSeed: string;
  action: string;
  timestamp: string;
  relativeTime: string;
};

export const ACTIVITY_FEED: ActivityEvent[] = [];
