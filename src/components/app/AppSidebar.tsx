"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Handshake,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Shield,
  Target,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePlatformStore } from "@/store/usePlatformStore";
import { getAtsOverview } from "@/data/mockAts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
  badge?: {
    text?: string;
    count?: number;
    tone?: "default" | "critical" | "draft";
  };
  divider?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Payroll",
    icon: DollarSign,
    href: "/payroll",
    children: [
      { label: "Payroll Hub", href: "/payroll" },
      { label: "Run Payroll", href: "/payroll/run" },
      { label: "Completed Run", href: "/payroll/run/pr-2026-0515" },
      { label: "Pay Stubs", href: "/payroll/run/pr-2026-0515/paystubs" },
      { label: "Off-Cycle", href: "/payroll/off-cycle" },
      { label: "History", href: "/payroll/history" },
      { label: "Contractors", href: "/payroll/contractors" },
      { label: "Pay Schedule", href: "/payroll/schedule" },
      { label: "Tax Setup", href: "/payroll/tax-setup" },
      { label: "Garnishments", href: "/payroll/garnishments" },
      { label: "Earned Wage Access", href: "/payroll/ewa" },
      { label: "Payroll Bridge", href: "/payroll/bridge" },
      { label: "Payroll Settings", href: "/payroll/settings" },
      { label: "Payroll Reports", href: "/payroll/reports" },
      { label: "GL Mapping", href: "/payroll/gl-mapping" },
      { label: "Multi-State", href: "/payroll/multi-state" },
      { label: "Supplemental Pay", href: "/payroll/supplemental-payments" },
      { label: "Tips", href: "/payroll/tips" },
      { label: "Union Payroll", href: "/payroll/union" },
      { label: "Quarterly Recon", href: "/payroll/quarterly-reconciliation" },
      { label: "Year-End", href: "/payroll/year-end" },
    ],
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    children: [
      { label: "Directory", href: "/employees" },
      { label: "Add Employee", href: "/employees/new" },
      { label: "Bulk Import", href: "/employees/bulk" },
      { label: "Org Chart", href: "/employees/org-chart" },
      { label: "Employee Profile", href: "/employees/1" },
      { label: "Compensation", href: "/employees/1/compensation" },
      { label: "Benefits", href: "/employees/1/benefits" },
      { label: "Time & PTO", href: "/employees/1/time" },
      { label: "Documents", href: "/employees/1/documents" },
      { label: "Payroll", href: "/employees/1/payroll" },
      { label: "Performance", href: "/employees/1/performance" },
      { label: "Activity", href: "/employees/1/activity" },
      { label: "Edit Employee", href: "/employees/1/edit" },
      { label: "Termination Workflow", href: "/employees/1/terminate" },
    ],
  },
  {
    label: "Contractors",
    icon: Handshake,
    href: "/contractors",
    children: [
      { label: "Contractor Hub", href: "/contractors" },
      { label: "Onboarding", href: "/contractors/onboarding" },
      { label: "Contracts", href: "/contractors/contracts" },
      { label: "Payments", href: "/contractors/payments" },
      { label: "1099s", href: "/contractors/1099s" },
      { label: "Portal", href: "/contractors/portal" },
    ],
  },
  {
    label: "Hiring",
    icon: Briefcase,
    href: "/hiring",
    children: [
      { label: "ATS Overview", href: "/hiring" },
      { label: "Jobs", href: "/hiring/jobs" },
      { label: "Candidates", href: "/hiring/candidates" },
      { label: "Interviews", href: "/hiring/interviews" },
      { label: "Offers", href: "/hiring/offers" },
      { label: "Job Templates", href: "/hiring/templates" },
      { label: "New Job", href: "/hiring/jobs/new" },
      { label: "New Offer", href: "/hiring/offers/new" },
      { label: "Hiring Settings", href: "/hiring/settings" },
    ],
  },
  {
    label: "Onboarding",
    icon: UserPlus,
    href: "/onboarding",
    children: [
      { label: "Onboarding Hub", href: "/onboarding" },
      { label: "Company Setup", href: "/onboarding/company-setup" },
      { label: "Documents", href: "/onboarding/documents" },
      { label: "Templates", href: "/onboarding/templates" },
      { label: "Offboarding", href: "/onboarding/offboarding" },
    ],
  },
  {
    label: "Benefits",
    icon: Heart,
    href: "/benefits",
    children: [
      { label: "Benefits Hub", href: "/benefits" },
      { label: "Plans", href: "/benefits/plans" },
      { label: "Enrollment", href: "/benefits/enrollment" },
      { label: "401(k)", href: "/benefits/401k" },
      { label: "FSA/HSA", href: "/benefits/fsa-hsa" },
      { label: "Life & Disability", href: "/benefits/life-disability" },
      { label: "Workers' Comp", href: "/benefits/workers-comp" },
      { label: "COBRA", href: "/benefits/cobra" },
    ],
  },
  {
    label: "Time",
    icon: Clock,
    href: "/time",
    children: [
      { label: "Time Hub", href: "/time" },
      { label: "Timesheets", href: "/time/timesheets" },
      { label: "Schedule", href: "/time/schedule" },
      { label: "Open Shifts", href: "/time/schedule/open-shifts" },
      { label: "PTO", href: "/time/pto" },
      { label: "PTO Policies", href: "/time/pto/policies" },
      { label: "Overtime", href: "/time/overtime" },
      { label: "Breaks", href: "/time/breaks" },
      { label: "Kiosk", href: "/time/kiosk" },
    ],
  },
  {
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
    children: [
      { label: "Expenses Hub", href: "/expenses" },
      { label: "Reports", href: "/expenses/reports" },
      { label: "Policies", href: "/expenses/policies" },
      { label: "Mileage", href: "/expenses/mileage" },
    ],
  },
  {
    label: "Performance",
    icon: Target,
    href: "/performance",
    children: [
      { label: "Performance Hub", href: "/performance" },
      { label: "Reviews", href: "/performance/reviews" },
      { label: "Goals", href: "/performance/goals" },
      { label: "Feedback", href: "/performance/feedback" },
    ],
  },
  {
    label: "Learning",
    icon: BookOpen,
    href: "/learning",
    children: [
      { label: "Learning Hub", href: "/learning" },
      { label: "Courses", href: "/learning/courses" },
      { label: "Assignments", href: "/learning/assignments" },
    ],
  },
  {
    label: "Compliance",
    icon: Shield,
    href: "/compliance/dashboard",
    children: [
      { label: "Dashboard", href: "/compliance/dashboard" },
      { label: "Compliance Center", href: "/compliance" },
      { label: "ACA", href: "/compliance/aca" },
      { label: "Federal Filings", href: "/compliance/federal-filings" },
      { label: "Tax Filings", href: "/compliance/tax-filings" },
      { label: "I-9", href: "/compliance/i9" },
      { label: "EEO", href: "/compliance/eeo" },
      { label: "Paid Leave", href: "/compliance/paid-leave" },
      { label: "Pay Equity", href: "/compliance/pay-equity" },
      { label: "Handbook", href: "/compliance/handbook" },
      { label: "Posters", href: "/compliance/posters" },
      { label: "WOTC", href: "/compliance/wotc" },
      { label: "Audit Log", href: "/compliance/audit-log" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart2,
    href: "/reports",
    children: [
      { label: "Reports Hub", href: "/reports" },
      { label: "Custom Reports", href: "/reports/custom" },
      { label: "Certified Payroll", href: "/reports/certified-payroll" },
      { label: "Headcount Forecast", href: "/reports/headcount-forecast" },
      { label: "Project Profitability", href: "/reports/project-profitability" },
    ],
  },
  {
    label: "Agency",
    icon: Building2,
    href: "/agency/clients",
    children: [
      { label: "Clients", href: "/agency/clients" },
      { label: "Billing", href: "/agency/billing" },
      { label: "Profitability", href: "/agency/profitability" },
    ],
  },
  { label: "Divider", icon: LayoutDashboard, divider: true },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings/company",
    children: [
      { label: "Company", href: "/settings/company" },
      { label: "Profile", href: "/settings/profile" },
      { label: "Users", href: "/settings/users" },
      { label: "Roles", href: "/settings/roles" },
      { label: "Departments", href: "/settings/departments" },
      { label: "Locations", href: "/settings/locations" },
      { label: "Billing", href: "/settings/billing" },
      { label: "Bank", href: "/settings/bank" },
      { label: "Pay Schedules", href: "/settings/pay-schedules" },
      { label: "Payroll Unions", href: "/settings/payroll/unions" },
      { label: "Time Settings", href: "/settings/time" },
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Integrations", href: "/settings/integrations" },
      { label: "API", href: "/settings/api" },
      { label: "SSO", href: "/settings/sso" },
      { label: "Security Devices", href: "/settings/security/devices" },
      { label: "Assets", href: "/settings/assets" },
      { label: "Import", href: "/settings/import" },
      { label: "Custom Fields", href: "/settings/custom-fields" },
      { label: "Workflows", href: "/settings/workflows" },
      { label: "Announcements", href: "/settings/announcements" },
      { label: "Audit Log", href: "/settings/audit-log" },
      { label: "Agency Clients", href: "/settings/agency/clients" },
    ],
  },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function routeMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemMatchesPath(item: NavItem, pathname: string) {
  return Boolean(
    (item.href && routeMatches(item.href, pathname)) ||
      item.children?.some((child) => routeMatches(child.href, pathname)),
  );
}

function getOpenGroupsForPath(pathname: string) {
  return NAV_ITEMS.reduce<Record<string, boolean>>((groups, item) => {
    if (item.children?.length && navItemMatchesPath(item, pathname)) {
      groups[item.label] = true;
    }
    return groups;
  }, {});
}

function SidebarBadge({
  text,
  count,
  tone = "default",
}: {
  text?: string;
  count?: number;
  tone?: "default" | "critical" | "draft";
}) {
  if (!text && !count) return null;

  const classes =
    tone === "critical"
      ? "border-red-200 bg-red-100 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-300"
      : tone === "draft"
        ? "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300"
        : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span
      className={`inline-flex min-w-[18px] items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${classes}`}
    >
      {text ?? count}
    </span>
  );
}

export default function AppSidebar() {
  const pathname = usePathname() || "/dashboard";
  const { signOut } = useAuth();
  const {
    currentCompany,
    companies,
    currentUser,
    sidebarOpen,
    sidebarCollapsed,
    payrollRunInProgress,
    complianceAlerts,
    setCurrentCompany,
    setSidebarOpen,
  } = usePlatformStore();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const activeGroups = getOpenGroupsForPath(pathname);
    if (!Object.keys(activeGroups).length) return;
    setOpenGroups((current) => ({ ...current, ...activeGroups }));
  }, [mounted, pathname]);

  const navItems = useMemo<NavItem[]>(
    () =>
      NAV_ITEMS.map((item) => {
        if (item.divider) return item;
        if (item.label === "Payroll") {
          return {
            ...item,
            badge: payrollRunInProgress ? { text: "DRAFT", tone: "draft" } : undefined,
          };
        }
        if (item.label === "Hiring") return { ...item, badge: { count: getAtsOverview().openReqCount } };
        if (item.label === "Onboarding") return { ...item, badge: { count: 4 } };
        if (item.label === "Time") return { ...item, badge: { count: 3 } };
        if (item.label === "Expenses") return { ...item, badge: { count: 3 } };
        if (item.label === "Compliance") {
          return {
            ...item,
            badge:
              complianceAlerts.critical > 0
                ? { count: complianceAlerts.critical, tone: "critical" }
                : undefined,
          };
        }
        return item;
      }),
    [complianceAlerts.critical, payrollRunInProgress],
  );

  const renderedSidebarCollapsed = mounted ? sidebarCollapsed : false;
  const renderedSidebarOpen = mounted ? sidebarOpen : false;
  const renderedPathname = mounted ? pathname : "";

  const labelClass = renderedSidebarCollapsed
    ? "flex lg:hidden"
    : "flex lg:hidden xl:flex";
  const desktopWidth = renderedSidebarCollapsed ? "lg:w-[72px]" : "lg:w-[72px] xl:w-[240px]";
  const avatarUrl =
    currentUser.avatarUrl ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentUser.email)}&backgroundColor=transparent`;

  const isItemActive = (item: NavItem) => Boolean(renderedPathname && navItemMatchesPath(item, renderedPathname));

  const closeMobileSidebar = () => setSidebarOpen(false);

  if (!mounted) {
    return (
      <aside
        id="tour-sidebar"
        suppressHydrationWarning
        className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full -translate-x-full flex-col border-r border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-gray-900 lg:w-[72px] lg:translate-x-0 lg:shadow-none xl:w-[240px]"
      >
        <div className="relative border-b border-slate-200 dark:border-slate-800">
          <div className="group flex h-16 w-full items-center gap-3 px-4 text-left">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-100 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/15 dark:text-blue-200">
              CD
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2 lg:hidden xl:flex">
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-gray-100">
                  CircleWorks Demo
                </span>
                <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  circleworks.com
                </span>
              </span>
            </span>
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-hidden px-3 py-4" aria-hidden="true" />
        <div className="border-t border-slate-200 p-4 dark:border-slate-800" aria-hidden="true" />
      </aside>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <AnimatePresence>
        {renderedSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      <aside
        id="tour-sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full flex-col border-r border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-gray-900 lg:translate-x-0 lg:shadow-none",
          desktopWidth,
          renderedSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            className="group flex h-16 w-full items-center gap-3 px-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-100 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/15 dark:text-blue-200">
              {currentCompany.logo ? (
                <Image
                  src={currentCompany.logo}
                  alt={currentCompany.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                getInitials(currentCompany.name)
              )}
            </span>
            <span className={`${labelClass} min-w-0 flex-1 items-center justify-between gap-2`}>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-gray-100">
                  {currentCompany.name}
                </span>
                <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {currentCompany.domain || "Workspace"}
                </span>
              </span>
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            </span>
          </button>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.divider) {
                return <div key="divider" className="my-2 h-px bg-slate-200 dark:bg-slate-800" />;
              }

              const active = isItemActive(item);
              const expanded = mounted && !!openGroups[item.label];
              const hasChildren = !!item.children?.length;
              const activeChildHref = renderedPathname
                ? item.children
                    ?.filter((child) => routeMatches(child.href, renderedPathname))
                    .sort((a, b) => b.href.length - a.href.length)[0]?.href
                : undefined;
              const triggerId =
                item.label === "Payroll"
                  ? "tour-payroll"
                  : item.label === "Employees"
                    ? "tour-employees"
                    : undefined;

              const itemClasses = cx(
                "group relative flex min-h-11 w-full items-center rounded-r-lg px-3 text-left transition-colors",
                active
                  ? "bg-blue-50 font-medium text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
              );

              const content = (
                <>
                  {active && (
                    <span className="absolute bottom-1 left-0 top-1 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                  )}
                  <item.icon
                    size={20}
                    className={cx(
                      "shrink-0",
                      active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                    )}
                  />
                  <span className={`${labelClass} ml-3 min-w-0 flex-1 items-center justify-between gap-3`}>
                    <span className="truncate text-sm">{item.label}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <SidebarBadge {...item.badge} />
                      {hasChildren && (
                        <ChevronRight
                          size={14}
                          className={cx("text-slate-400 transition-transform", expanded && "rotate-90")}
                        />
                      )}
                    </span>
                  </span>
                </>
              );

              const trigger = hasChildren ? (
                <button
                  id={triggerId}
                  type="button"
                  onClick={() => setOpenGroups((current) => ({ ...current, [item.label]: !current[item.label] }))}
                  className={itemClasses}
                >
                  {content}
                </button>
              ) : (
                <Link
                  id={triggerId}
                  href={item.href || "#"}
                  onClick={closeMobileSidebar}
                  className={itemClasses}
                >
                  {content}
                </Link>
              );

              return (
                <div key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>

                  <AnimatePresence initial={false}>
                    {hasChildren && expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`${renderedSidebarCollapsed ? "lg:hidden" : "lg:hidden xl:block"} overflow-hidden`}
                      >
                        <div className="flex flex-col gap-1 pb-2 pl-11 pt-1">
                          {item.children!.map((child) => {
                            const childActive = child.href === activeChildHref;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={closeMobileSidebar}
                                className={cx(
                                  "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                                  childActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <Image src={avatarUrl} alt={currentUser.name} fill sizes="32px" className="object-cover" unoptimized />
            </span>
            <span className={`${labelClass} min-w-0 flex-1 flex-col`}>
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-gray-100">
                {currentUser.name}
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {currentUser.email}
              </span>
            </span>
            <LogOut
              size={16}
              className={`${labelClass} shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500`}
            />
          </button>
        </div>
      </aside>

      <Dialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch company</DialogTitle>
            <DialogDescription>Choose a client workspace to manage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-6">
            {companies.map((company) => {
              const selected = company.id === currentCompany.id;
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    setCurrentCompany(company);
                    setSwitcherOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-blue-200 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-500/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                  )}
                >
                  <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {company.logo ? (
                      <Image src={company.logo} alt={company.name} fill sizes="40px" className="object-cover" unoptimized />
                    ) : (
                      getInitials(company.name)
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {company.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {company.domain || "Client workspace"}
                    </span>
                  </span>
                  {selected && (
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setSwitcherOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
