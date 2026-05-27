"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
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
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCompanyStore } from "@/store/useCompanyStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { usePayrollRunStore } from "@/store/usePayrollRunStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const NAV_STRUCTURE: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Payroll",
    icon: DollarSign,
    href: "/payroll",
    children: [
      { label: "Run Payroll", href: "/payroll/run" },
      { label: "Pay Schedule", href: "/payroll/schedule" },
      { label: "Supplemental Pay", href: "/payroll/supplemental-payments" },
      { label: "History", href: "/payroll/history" },
      { label: "GL Mapping", href: "/payroll/gl-mapping" },
    ],
  },
  { label: "Employees", icon: Users, href: "/employees" },
  {
    label: "Contractors",
    icon: Users,
    href: "/contractors",
    children: [
      { label: "Dashboard", href: "/contractors" },
      { label: "Onboarding", href: "/contractors/onboarding" },
      { label: "Contracts", href: "/contractors/contracts" },
      { label: "Payments", href: "/contractors/payments" },
      { label: "1099s", href: "/contractors/1099s" },
      { label: "Contractor Portal", href: "/contractor-portal" },
    ],
  },
  { label: "Hiring", icon: Briefcase, href: "/hiring" },
  { label: "Onboarding", icon: UserPlus, href: "/onboarding" },
  { label: "Benefits", icon: Heart, href: "/benefits" },
  { label: "Time", icon: Clock, href: "/time" },
  { label: "Expenses", icon: Receipt, href: "/expenses" },
  { label: "Performance", icon: Target, href: "/performance" },
  { label: "Compliance", icon: Shield, href: "/compliance/dashboard" },
  { label: "Reports", icon: BarChart2, href: "/reports" },
  { label: "Divider", icon: LayoutDashboard, divider: true },
  { label: "Settings", icon: Settings, href: "/settings/company" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Badge({ text, count, tone = "default" }: { text?: string; count?: number; tone?: "default" | "critical" | "draft" }) {
  if (!text && !count) return null;

  const classes = tone === "critical"
    ? "border border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
    : tone === "draft"
      ? "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${classes}`}>
      {text ?? count}
    </span>
  );
}

export default function AppSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const activeRoute = pathname;
  const { user, signOut } = useAuth();
  const { currentUser, alerts } = useDashboardData();
  const { currentCompany, companies, setCurrentCompany } = useCompanyStore();
  const { sidebarOpen, setSidebarOpen } = useSidebarStore();
  const { isPayrollRunning } = usePlatformStore();
  const { runState } = usePayrollRunStore();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextOpenGroups = NAV_STRUCTURE.reduce<Record<string, boolean>>((acc, item) => {
      if (!item.children?.length) return acc;
      acc[item.label] = item.children.some((child) => activeRoute.startsWith(child.href)) || activeRoute.startsWith(item.href ?? "");
      return acc;
    }, {});
    setOpenGroups(nextOpenGroups);
  }, [activeRoute]);

  const displayName = user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayEmail)}&backgroundColor=transparent`;
  const companyName = currentCompany?.name || currentUser.companyName || "CircleWorks";
  const companyLogo = currentCompany?.logo || currentUser.logoUrl || "";
  const canSwitchCompanies = user?.role === "accountant" || companies.length > 1;

  const navItems = useMemo<NavItem[]>(() => {
    const pendingApprovals = 3;
    const criticalAlerts = alerts.filter((alert) => alert.severity === "critical").length || 2;

    return NAV_STRUCTURE.map((item) => {
      if (item.divider) return item;
      if (item.label === "Payroll") {
        return {
          ...item,
          badge: isPayrollRunning || runState === "draft" ? { text: "DRAFT", tone: "draft" } : undefined,
        };
      }
      if (item.label === "Hiring") {
        return { ...item, badge: { count: 6 } };
      }
      if (item.label === "Onboarding") {
        return { ...item, badge: { count: 4 } };
      }
      if (item.label === "Time") {
        return { ...item, badge: { count: pendingApprovals } };
      }
      if (item.label === "Expenses") {
        return { ...item, badge: { count: pendingApprovals } };
      }
      if (item.label === "Compliance") {
        return { ...item, badge: { count: criticalAlerts, tone: "critical" } };
      }
      return item;
    });
  }, [alerts, isPayrollRunning, runState]);

  const isItemActive = (item: NavItem) => {
    if (item.href && activeRoute.startsWith(item.href)) return true;
    return item.children?.some((child) => activeRoute.startsWith(child.href)) ?? false;
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }));
  };

  const handleCompanySwitch = (companyId: string) => {
    const nextCompany = companies.find((company) => company.id === companyId);
    if (!nextCompany) return;
    setCurrentCompany(nextCompany);
    setSwitcherOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-[#0F172A] lg:w-[72px] lg:translate-x-0 lg:shadow-none xl:w-[240px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-[240px]`}
      >
        <button
          type="button"
          onClick={() => setSwitcherOpen(true)}
          className="group relative flex h-[72px] items-center gap-3 border-b border-slate-200 px-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-100 dark:border-slate-700 dark:bg-blue-900/30">
            {companyLogo ? (
              <Image src={companyLogo} alt={companyName} fill sizes="32px" className="object-cover" unoptimized />
            ) : (
              <span className="text-xs font-bold text-blue-700 dark:text-blue-200">{getInitials(companyName)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden lg:hidden xl:block">
            <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{companyName}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Switch company
              <ChevronDown size={12} className="transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
          <div className="pointer-events-none absolute left-[78px] rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block xl:hidden">
            {companyName}
          </div>
        </button>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.divider) {
                return <div key="divider" className="my-2 h-px bg-slate-200 dark:bg-slate-800" />;
              }

              const active = isItemActive(item);
              const expanded = !!openGroups[item.label];
              const hasChildren = !!item.children?.length;
              const tourTargetId =
                item.label === "Payroll"
                  ? "tour-payroll"
                  : item.label === "Employees"
                    ? "tour-employees"
                    : undefined;
              const sharedClasses = `group relative flex min-h-[44px] w-full items-center rounded-r-xl px-3 transition-colors ${
                active
                  ? "bg-[#EFF6FF] text-blue-600 dark:bg-[#1E293B] dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
              }`;

              const content = (
                <>
                  {active && <span className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />}
                  <item.icon size={20} className={`shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <div className="ml-3 hidden min-w-0 flex-1 items-center justify-between gap-3 lg:hidden xl:flex">
                    <span className={`truncate text-sm font-medium ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge {...item.badge} />
                      {hasChildren && (
                        <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
                      )}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute left-[56px] rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block xl:hidden">
                    {item.label}
                  </div>
                </>
              );

              return (
                <div key={item.label}>
                  {hasChildren ? (
                    <button type="button" id={tourTargetId} onClick={() => toggleGroup(item.label)} className={sharedClasses}>
                      {content}
                    </button>
                  ) : (
                    <Link id={tourTargetId} href={item.href || "#"} className={sharedClasses} onClick={() => setSidebarOpen(false)}>
                      {content}
                    </Link>
                  )}

                  {hasChildren && expanded && (
                    <div className="hidden pb-2 pl-11 pt-1 lg:hidden xl:block">
                      <div className="flex flex-col gap-1">
                        {item.children!.map((child) => {
                          const childActive = activeRoute.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                                childActive
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => signOut()}
            className="group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <Image src={avatarUrl} alt={displayName} fill sizes="32px" className="object-cover" unoptimized />
            </div>
            <div className="hidden min-w-0 flex-1 lg:hidden xl:block">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">{displayEmail}</div>
            </div>
            <LogOut size={16} className="hidden text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200 lg:hidden xl:block" />
            <div className="pointer-events-none absolute left-[70px] rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block xl:hidden">
              {displayName}
            </div>
          </button>
        </div>
      </aside>

      <Dialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch company</DialogTitle>
            <DialogDescription>
              {canSwitchCompanies
                ? "Choose the client workspace you want to manage."
                : "Your current workspace is shown below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-6">
            {companies.map((company) => {
              const selected = currentCompany?.id === company.id;
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleCompanySwitch(company.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {company.logo ? (
                      <Image src={company.logo} alt={company.name} fill sizes="40px" className="object-cover" unoptimized />
                    ) : (
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{getInitials(company.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{company.name}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{company.domain || "Client workspace"}</div>
                  </div>
                  {selected && <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">Current</span>}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setSwitcherOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
