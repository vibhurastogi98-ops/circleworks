// Mock data that mirrors the admin/HR dashboard API shape.

export type DashboardRole = "ADMIN" | "HR" | "EMPLOYEE";

export const CURRENT_USER = {
  firstName: "Maya",
  lastName: "Patel",
  role: "ADMIN" as DashboardRole,
  email: "maya@circleworks.com",
  avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Maya%20Patel&backgroundColor=transparent",
};

export const NEXT_PAYROLL = {
  date: "Friday, May 29",
  daysAway: 6,
  estimatedTotal: 284500,
  employeeCount: 47,
};

export type KpiCard = {
  id: string;
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  sparklineData: number[];
  icon: string;
  format?: "currency" | "number" | "score";
  scoreColor?: "red" | "yellow" | "green";
};

export const KPI_CARDS: KpiCard[] = [
  {
    id: "total-employees",
    label: "Total Employees",
    value: "47",
    trend: 4.4,
    trendLabel: "+2 since last month",
    sparklineData: [39, 41, 42, 43, 45, 45, 47],
    icon: "Users",
    format: "number",
  },
  {
    id: "monthly-payroll",
    label: "Monthly Payroll Cost",
    value: "$569k",
    trend: 3.2,
    trendLabel: "4% under budget",
    sparklineData: [552, 561, 548, 575, 584, 563, 569],
    icon: "DollarSign",
    format: "currency",
  },
  {
    id: "pending-approvals",
    label: "Pending Approvals",
    value: "10",
    trend: 0,
    trendLabel: "10 open approvals",
    sparklineData: [4, 5, 8, 7, 11, 9, 10],
    icon: "ClipboardCheck",
    format: "number",
  },
  {
    id: "compliance-score",
    label: "Compliance Score",
    value: "87",
    trend: 2.1,
    trendLabel: "+2 pts this month",
    sparklineData: [76, 79, 81, 80, 84, 85, 87],
    icon: "ShieldCheck",
    format: "score",
    scoreColor: "green",
  },
];

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  action: string;
  actionLabel: "Review" | "Fix Now" | "Remind" | "Dismiss";
};

export const ALERTS: AlertItem[] = [
  {
    id: "missing-w4",
    severity: "critical",
    title: "3 employees missing W-4",
    description: "Federal withholding setup is incomplete for new hires starting this pay period.",
    action: "/employees?filter=missing-w4",
    actionLabel: "Fix Now",
  },
  {
    id: "quarterly-941",
    severity: "warning",
    title: "941 filing due in 5 days",
    description: "Review payroll tax liability and confirm filing authorization before the deadline.",
    action: "/compliance/tax-filings",
    actionLabel: "Review",
  },
  {
    id: "timesheet-approval",
    severity: "info",
    title: "2 timesheets pending approval",
    description: "Two hourly employees need manager approval before payroll preview is final.",
    action: "/time/approvals",
    actionLabel: "Remind",
  },
];

export type PayrollMonth = {
  month: string;
  gross: number;
  taxes: number;
  benefits: number;
};

export const PAYROLL_TREND: PayrollMonth[] = [
  { month: "Dec", gross: 428000, taxes: 64600, benefits: 39200 },
  { month: "Jan", gross: 447500, taxes: 68100, benefits: 41800 },
  { month: "Feb", gross: 461200, taxes: 70100, benefits: 42900 },
  { month: "Mar", gross: 478800, taxes: 72800, benefits: 44100 },
  { month: "Apr", gross: 492600, taxes: 74600, benefits: 45700 },
  { month: "May", gross: 506400, taxes: 76900, benefits: 47100 },
];

export type QuickAction = {
  id: string;
  label: string;
  badge?: number;
  icon: string;
  href: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "add-employee", label: "Add Employee", icon: "UserPlus", href: "/employees/new" },
  { id: "approve-timesheets", label: "Approve Timesheets (3)", badge: 3, icon: "ClipboardCheck", href: "/time/approvals" },
  { id: "open-enrollment", label: "Open Enrollment (12 left)", badge: 12, icon: "Heart", href: "/benefits/open-enrollment" },
  { id: "review-pto", label: "Review PTO (5)", badge: 5, icon: "CalendarDays", href: "/time/pto" },
  { id: "run-report", label: "Run Report", icon: "BarChart3", href: "/reports" },
];

export type NewHire = {
  id: string;
  name: string;
  title: string;
  startDate: string;
  onboardingPercent: number;
  avatarSeed: string;
};

export const NEW_HIRES: NewHire[] = [
  {
    id: "nh-1",
    name: "Avery Johnson",
    title: "Payroll Implementation Specialist",
    startDate: "May 6",
    onboardingPercent: 92,
    avatarSeed: "Avery Johnson",
  },
  {
    id: "nh-2",
    name: "Nina Park",
    title: "Senior Product Designer",
    startDate: "May 13",
    onboardingPercent: 76,
    avatarSeed: "Nina Park",
  },
  {
    id: "nh-3",
    name: "Marcus Ellis",
    title: "Customer Success Manager",
    startDate: "May 20",
    onboardingPercent: 48,
    avatarSeed: "Marcus Ellis",
  },
];

export type CalendarDay = {
  day: string;
  date: number;
  isToday?: boolean;
  events: { name: string; type: "pto" | "holiday" | "birthday"; avatarSeed: string }[];
};

export const TEAM_CALENDAR: CalendarDay[] = [
  { day: "Mon", date: 25, events: [{ name: "Elena Ruiz", type: "pto", avatarSeed: "Elena Ruiz" }] },
  { day: "Tue", date: 26, events: [] },
  {
    day: "Wed",
    date: 27,
    isToday: true,
    events: [
      { name: "Chris Wong", type: "pto", avatarSeed: "Chris Wong" },
      { name: "Priya Shah", type: "birthday", avatarSeed: "Priya Shah" },
    ],
  },
  { day: "Thu", date: 28, events: [{ name: "Jordan Lee", type: "pto", avatarSeed: "Jordan Lee" }] },
  { day: "Fri", date: 29, events: [{ name: "Memorial Day Prep", type: "holiday", avatarSeed: "Holiday" }] },
];

export type ActivityEvent = {
  id: string;
  actor: string;
  avatarSeed: string;
  action: string;
  timestamp: string;
  relativeTime: string;
};

export const ACTIVITY_FEED: ActivityEvent[] = [
  { id: "act-1", actor: "Sarah Chen", avatarSeed: "Sarah Chen", action: "approved 2 timesheets", timestamp: "2026-05-23T04:42:00.000Z", relativeTime: "12m ago" },
  { id: "act-2", actor: "Miguel Torres", avatarSeed: "Miguel Torres", action: "updated payroll preview totals", timestamp: "2026-05-23T04:20:00.000Z", relativeTime: "34m ago" },
  { id: "act-3", actor: "CircleWorks Tax", avatarSeed: "System", action: "prepared 941 filing packet", timestamp: "2026-05-23T03:51:00.000Z", relativeTime: "1h ago" },
  { id: "act-4", actor: "Rachel Kim", avatarSeed: "Rachel Kim", action: "added Avery Johnson as a new hire", timestamp: "2026-05-23T02:40:00.000Z", relativeTime: "2h ago" },
  { id: "act-5", actor: "Owen Brooks", avatarSeed: "Owen Brooks", action: "approved PTO for Elena Ruiz", timestamp: "2026-05-22T23:04:00.000Z", relativeTime: "6h ago" },
  { id: "act-6", actor: "Nina Park", avatarSeed: "Nina Park", action: "completed onboarding document review", timestamp: "2026-05-22T21:25:00.000Z", relativeTime: "8h ago" },
  { id: "act-7", actor: "Benefits Admin", avatarSeed: "System", action: "opened enrollment reminders for 12 employees", timestamp: "2026-05-22T20:10:00.000Z", relativeTime: "9h ago" },
  { id: "act-8", actor: "Daniel Price", avatarSeed: "Daniel Price", action: "dismissed a compliance reminder", timestamp: "2026-05-22T18:22:00.000Z", relativeTime: "11h ago" },
  { id: "act-9", actor: "Lena Moore", avatarSeed: "Lena Moore", action: "created a payroll journal export", timestamp: "2026-05-22T17:40:00.000Z", relativeTime: "12h ago" },
  { id: "act-10", actor: "System", avatarSeed: "System", action: "synced QuickBooks mapping changes", timestamp: "2026-05-22T16:15:00.000Z", relativeTime: "13h ago" },
];
