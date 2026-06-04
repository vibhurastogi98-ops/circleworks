"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, LogOut, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePlatformStore } from "@/store/usePlatformStore";
import { normalizeAccountType } from "@/lib/creator-mode";
import {
  getAppNavItems,
  navItemMatchesPath,
  routeMatches,
  type AppNavItem as NavItem,
} from "@/lib/app-navigation";
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

function getOpenGroupsForPath(pathname: string, items: NavItem[]) {
  return items.reduce<Record<string, boolean>>((groups, item) => {
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
  const pathname = usePathname() || "/app/dashboard";
  const { signOut } = useAuth();
  const {
    currentCompany,
    companies,
    currentUser,
    accountType,
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
  const normalizedAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);
  const creatorMode = normalizedAccountType === "creator";
  const baseNavItems = useMemo(
    () => getAppNavItems(normalizedAccountType),
    [normalizedAccountType],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const activeGroups = getOpenGroupsForPath(pathname, baseNavItems);
    if (!Object.keys(activeGroups).length) return;
    setOpenGroups((current) => ({ ...current, ...activeGroups }));
  }, [baseNavItems, mounted, pathname]);

  const navItems = useMemo<NavItem[]>(
    () =>
      baseNavItems.map((item) => {
        if (item.divider) return item;
        if (item.label === "Payroll" || item.label === "Pay Myself") {
          return {
            ...item,
            badge: payrollRunInProgress ? { text: "DRAFT", tone: "draft" } : undefined,
          };
        }
        if (normalizedAccountType === "agency" && item.label === "Contractors") {
          return { ...item, badge: item.badge ?? { text: "1099" }, emphasis: "agency" };
        }
        if (creatorMode && item.label === "Contractors" && currentCompany.contractorCount) {
          return { ...item, badge: { count: currentCompany.contractorCount } };
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
    [baseNavItems, complianceAlerts.critical, creatorMode, currentCompany.contractorCount, normalizedAccountType, payrollRunInProgress],
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
        className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full -translate-x-full flex-col border-r border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl transition-all duration-300 lg:w-[72px] lg:translate-x-0 lg:shadow-none xl:w-[240px]"
      >
        <div className="relative border-b border-[var(--border-default)]">
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
        <div className="border-t border-[var(--border-default)] p-4" aria-hidden="true" />
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
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full flex-col border-r border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl transition-all duration-300 lg:translate-x-0 lg:shadow-none",
          desktopWidth,
          renderedSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative border-b border-[var(--border-default)]">
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
                  ? "bg-blue-50 font-medium text-blue-600 dark:bg-[var(--surface-subtle)] dark:text-blue-300"
                  : item.emphasis === "agency"
                    ? "border border-blue-100 bg-blue-50/70 text-blue-700 hover:border-blue-200 hover:bg-blue-100/70 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
                    : "text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)] dark:hover:bg-[var(--surface-subtle)]",
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

        <div className="border-t border-[var(--border-default)] p-4">
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
