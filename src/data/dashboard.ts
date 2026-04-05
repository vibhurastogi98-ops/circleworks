// ─── Mock Data for Dashboard ─────────────────────────────────────────────────

export const CURRENT_USER = {
  firstName: "Alex",
  lastName: "Rivera",
  role: "ADMIN" as const, // ADMIN | HR | EMPLOYEE
  email: "alex@acmecorp.com",
  avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent",
};

// ─── Next Payroll ────────────────────────────────────────────────────────────

export const NEXT_PAYROLL = {
  date: "April 15, 2026",
  daysAway: 10,
  estimatedTotal: 284_750.00,
  employeeCount: 47,
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
    value: "127",
    trend: 3,
    trendLabel: "+3 since last month",
    sparklineData: [110, 112, 115, 118, 121, 124, 127],
    icon: "Users",
  },
  {
    id: "monthly-payroll",
    label: "Monthly Payroll Cost",
    value: "$284,750",
    trend: 2.4,
    trendLabel: "+2.4% vs budget",
    sparklineData: [262, 268, 271, 275, 278, 281, 284.75],
    icon: "DollarSign",
    format: "currency",
  },
  {
    id: "pending-approvals",
    label: "Pending Approvals",
    value: "8",
    trend: -2,
    trendLabel: "2 less than last week",
    sparklineData: [14, 12, 10, 11, 9, 10, 8],
    icon: "ClipboardCheck",
  },
  {
    id: "compliance-score",
    label: "Compliance Score",
    value: "87",
    trend: 5,
    trendLabel: "+5 pts this quarter",
    sparklineData: [72, 74, 78, 80, 82, 85, 87],
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

export const ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "3 employees missing W-4",
    description: "Tax withholding forms need to be completed before next payroll run.",
    action: "/compliance/w4",
    actionLabel: "Fix Now",
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "941 filing due in 5 days",
    description: "Federal quarterly tax filing deadline approaching for Q1 2026.",
    action: "/compliance/filings",
    actionLabel: "Review",
  },
  {
    id: "alert-3",
    severity: "info",
    title: "2 timesheets pending approval",
    description: "Submitted by Sarah Chen and Marcus Johnson on Apr 3.",
    action: "/time/approvals",
    actionLabel: "Approve",
  },
  {
    id: "alert-4",
    severity: "warning",
    title: "Benefits enrollment closing soon",
    description: "Open enrollment window closes in 12 days. 8 employees haven't enrolled.",
    action: "/benefits/enrollment",
    actionLabel: "Remind",
  },
  {
    id: "alert-5",
    severity: "info",
    title: "New hire onboarding incomplete",
    description: "Jordan Park (Sr. Designer) still needs to complete I-9 verification.",
    action: "/onboarding/jordan-park",
    actionLabel: "Review",
  },
];

// ─── Payroll Cost Trend (6 months of grouped bar data) ──────────────────────

export type PayrollMonth = {
  month: string;
  gross: number;
  taxes: number;
  benefits: number;
};

export const PAYROLL_TREND: PayrollMonth[] = [
  { month: "Nov", gross: 198000, taxes: 42500, benefits: 22200 },
  { month: "Dec", gross: 205000, taxes: 44100, benefits: 22800 },
  { month: "Jan", gross: 212000, taxes: 45600, benefits: 23400 },
  { month: "Feb", gross: 218000, taxes: 46900, benefits: 24100 },
  { month: "Mar", gross: 225000, taxes: 48400, benefits: 24800 },
  { month: "Apr", gross: 232000, taxes: 49900, benefits: 25500 },
];

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
  { id: "approve-timesheets", label: "Approve Timesheets", badge: 3, icon: "ClipboardCheck", href: "/time/approvals" },
  { id: "open-enrollment", label: "Open Enrollment", badge: 12, icon: "Heart", href: "/benefits/enrollment" },
  { id: "review-pto", label: "Review PTO", badge: 5, icon: "CalendarDays", href: "/time/pto" },
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

export const NEW_HIRES: NewHire[] = [
  { id: "nh-1", name: "Jordan Park", title: "Sr. Product Designer", startDate: "Apr 1", onboardingPercent: 65, avatarSeed: "Jordan" },
  { id: "nh-2", name: "Priya Sharma", title: "Software Engineer II", startDate: "Apr 3", onboardingPercent: 40, avatarSeed: "Priya" },
  { id: "nh-3", name: "Marcus Johnson", title: "Sales Manager", startDate: "Apr 5", onboardingPercent: 20, avatarSeed: "Marcus" },
  { id: "nh-4", name: "Elena Vasquez", title: "HR Coordinator", startDate: "Apr 7", onboardingPercent: 10, avatarSeed: "Elena" },
];

// ─── Team Calendar ───────────────────────────────────────────────────────────

export type CalendarDay = {
  day: string;
  date: number;
  isToday?: boolean;
  events: { name: string; type: "pto" | "holiday" | "birthday"; avatarSeed: string }[];
};

export const TEAM_CALENDAR: CalendarDay[] = [
  { day: "Mon", date: 6, events: [{ name: "Sarah Chen", type: "pto", avatarSeed: "Sarah" }] },
  {
    day: "Tue",
    date: 7,
    isToday: true,
    events: [
      { name: "Sarah Chen", type: "pto", avatarSeed: "Sarah" },
      { name: "Tom Li", type: "pto", avatarSeed: "Tom" },
    ],
  },
  { day: "Wed", date: 8, events: [{ name: "Tom Li", type: "pto", avatarSeed: "Tom" }] },
  { day: "Thu", date: 9, events: [{ name: "Ana Costa", type: "birthday", avatarSeed: "Ana" }] },
  { day: "Fri", date: 10, events: [] },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────

export type ActivityEvent = {
  id: string;
  actor: string;
  avatarSeed: string;
  action: string;
  timestamp: string;
  relativeTime: string;
};

export const ACTIVITY_FEED: ActivityEvent[] = [
  { id: "a1", actor: "Sarah Chen", avatarSeed: "Sarah", action: "approved 2 timesheets", timestamp: "2026-04-05T10:42:00Z", relativeTime: "16 min ago" },
  { id: "a2", actor: "Marcus Johnson", avatarSeed: "Marcus", action: "submitted expense report — $1,240", timestamp: "2026-04-05T10:30:00Z", relativeTime: "28 min ago" },
  { id: "a3", actor: "System", avatarSeed: "System", action: "generated Q1 payroll tax report", timestamp: "2026-04-05T10:15:00Z", relativeTime: "43 min ago" },
  { id: "a4", actor: "Priya Sharma", avatarSeed: "Priya", action: "completed I-9 verification", timestamp: "2026-04-05T09:58:00Z", relativeTime: "1 hr ago" },
  { id: "a5", actor: "Alex Rivera", avatarSeed: "Alex", action: "added Jordan Park as Sr. Product Designer", timestamp: "2026-04-05T09:30:00Z", relativeTime: "1.5 hrs ago" },
  { id: "a6", actor: "Tom Li", avatarSeed: "Tom", action: "requested PTO — Apr 6-8", timestamp: "2026-04-05T09:12:00Z", relativeTime: "1.8 hrs ago" },
  { id: "a7", actor: "Elena Vasquez", avatarSeed: "Elena", action: "updated direct deposit information", timestamp: "2026-04-05T08:45:00Z", relativeTime: "2 hrs ago" },
  { id: "a8", actor: "System", avatarSeed: "System", action: "sent benefits enrollment reminder to 8 employees", timestamp: "2026-04-05T08:00:00Z", relativeTime: "3 hrs ago" },
  { id: "a9", actor: "Sarah Chen", avatarSeed: "Sarah", action: "updated compensation for Ana Costa", timestamp: "2026-04-04T17:30:00Z", relativeTime: "Yesterday" },
  { id: "a10", actor: "Alex Rivera", avatarSeed: "Alex", action: "ran mid-cycle payroll correction", timestamp: "2026-04-04T16:00:00Z", relativeTime: "Yesterday" },
];
