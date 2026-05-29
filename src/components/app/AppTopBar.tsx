"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CreditCard,
  HelpCircle,
  Keyboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Route,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDataSync } from "@/hooks/useDataSync";
import { useDashboardRealtimeStore } from "@/store/useDashboardRealtimeStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import Breadcrumb from "@/components/Breadcrumb";
import CommandPalette from "@/components/CommandPalette";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatRouteLabel(segment: string) {
  if (!segment) return "Dashboard";
  const specialLabels: Record<string, string> = {
    "401k": "401(k)",
    "cobra": "COBRA",
    "fsa-hsa": "FSA / HSA",
    "life-disability": "Life & Supplemental",
    "oe": "Open Enrollment",
    "qle": "Life Events",
    "workers-comp": "Workers' Comp",
  };
  if (specialLabels[segment]) return specialLabels[segment];
  if (/^\d+$/.test(segment)) return `Employee ${segment}`;
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRouteTitle(pathParts: string[]) {
  if (!pathParts.length) return "Dashboard";
  if (pathParts[0] === "benefits" && pathParts[1] === "enrollment" && pathParts[2]) {
    return "Enrollment Wizard";
  }
  if (pathParts[0] === "benefits") {
    const benefitTitles: Record<string, string> = {
      "401k": "401(k) Management",
      "cobra": "COBRA Administration",
      "enrollment": "Enrollment",
      "fsa-hsa": "FSA / HSA Accounts",
      "life-disability": "Life & Supplemental Benefits",
      "oe": "Open Enrollment Management",
      "plans": "Plan Management",
      "qle": "Qualifying Life Events",
      "workers-comp": "Workers' Compensation",
    };
    return benefitTitles[pathParts[pathParts.length - 1]] || "Benefits";
  }
  return formatRouteLabel(pathParts[pathParts.length - 1]);
}

function IconButton({
  label,
  children,
  onClick,
  id,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          id={id}
          type="button"
          onClick={onClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-950"
          aria-label={label}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function AppTopBar() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    currentUser,
    sidebarCollapsed,
    theme,
    toggleDarkMode,
    toggleSidebar,
    payrollRunInProgress,
    setPayrollRunning,
    setCommandPaletteOpen,
    complianceAlerts,
    dismissComplianceAlert,
  } = usePlatformStore();
  const { unreadCount, loadNotifications } = useNotificationStore();
  const { notifyPayrollComplete } = useDataSync();
  const { setPayrollStatus } = useDashboardRealtimeStore();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const isDarkMode = theme === "dark";
  const topbarOffset = sidebarCollapsed
    ? "lg:left-[72px]"
    : "lg:left-[72px] xl:left-[240px]";
  const avatarUrl =
    currentUser.avatarUrl ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentUser.email)}&backgroundColor=transparent`;
  const canRunPayroll = ["admin", "hr"].includes(currentUser.role);
  const pathParts = pathname.split("/").filter(Boolean);
  const title = getRouteTitle(pathParts);
  const breadcrumbItems = pathParts.map((part, index) => {
    const href = `/${pathParts.slice(0, index + 1).join("/")}`;
    return {
      label: formatRouteLabel(part),
      href: index < pathParts.length - 1 ? href : undefined,
    };
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const closeTransientUi = () => {
      setIsAvatarMenuOpen(false);
      setIsHelpMenuOpen(false);
      setIsNotificationsOpen(false);
      setIsWhatsNewOpen(false);
    };

    window.addEventListener("circleworks:escape", closeTransientUi);
    return () => window.removeEventListener("circleworks:escape", closeTransientUi);
  }, []);

  const openCommandPalette = () => setCommandPaletteOpen(true);

  const restartOnboardingTour = () => {
    setIsHelpMenuOpen(false);
    window.localStorage.removeItem("tour_completed");
    window.dispatchEvent(new CustomEvent("circleworks:start-tour"));
  };

  const openKeyboardShortcuts = () => {
    setIsHelpMenuOpen(false);
    window.dispatchEvent(new CustomEvent("circleworks:show-shortcuts"));
  };

  const togglePayrollRun = () => {
    if (payrollRunInProgress) {
      setPayrollRunning(false);
      setPayrollStatus({ isRunning: false, employeeCount: 47 });
      notifyPayrollComplete();
      toast.success("Payroll run completed and synced.");
      return;
    }

    setPayrollRunning(true);
    setPayrollStatus({ isRunning: true, employeeCount: 47 });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`fixed left-0 right-0 top-0 z-30 flex flex-col ${topbarOffset}`}>
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-4 lg:gap-6">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-950 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex min-w-0 items-center gap-4">
              <h1 className="truncate text-[18px] font-bold text-slate-900 dark:text-white">
                {title}
              </h1>
              <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 md:block" />
              <div className="hidden min-w-0 items-center overflow-hidden text-sm text-slate-500 lg:flex">
                {breadcrumbItems.length ? (
                  <Breadcrumb items={breadcrumbItems} variant={isDarkMode ? "dark" : "light"} />
                ) : (
                  <span>Overview</span>
                )}
              </div>
            </div>
          </div>

          <div className="mx-4 hidden min-w-0 flex-1 items-center justify-center md:flex lg:mx-8">
            <button
              id="tour-search"
              type="button"
              onClick={openCommandPalette}
              className="flex h-10 w-full max-w-lg cursor-text items-center gap-2.5 rounded-lg border border-transparent bg-slate-100 px-3 text-slate-400 transition hover:border-slate-300 hover:bg-slate-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-slate-800/70 dark:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              aria-label="Open global search"
            >
              <Search size={16} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">
                Search employees, payroll runs, documents... (Cmd+K)
              </span>
              <kbd className="hidden h-5 items-center rounded border border-slate-300 bg-white px-1.5 font-mono text-[10px] font-bold text-slate-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 sm:inline-flex">
                Cmd K
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="md:hidden">
              <IconButton label="Search" onClick={openCommandPalette}>
                <Search size={20} />
              </IconButton>
            </div>

            {canRunPayroll && (
              <div className="hidden lg:flex">
                <button
                  id="tour-run-payroll"
                  type="button"
                  onClick={togglePayrollRun}
                  className={cx(
                    "mr-2 inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                    payrollRunInProgress
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
                  )}
                >
                  {payrollRunInProgress ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Loader2 size={14} className="opacity-0" />
                      Run Payroll
                    </>
                  )}
                </button>
              </div>
            )}

            <IconButton label="What's new" onClick={() => setIsWhatsNewOpen(true)}>
              <BellRing size={20} />
            </IconButton>

            <div className="relative hidden sm:block" ref={helpMenuRef}>
              <IconButton label="Help" onClick={() => setIsHelpMenuOpen((open) => !open)}>
                <HelpCircle size={20} />
              </IconButton>
              <AnimatePresence>
                {isHelpMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Help</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Guides, shortcuts, and walkthroughs.</p>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <button
                        type="button"
                        onClick={restartOnboardingTour}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Route size={16} className="text-slate-400" />
                        Restart onboarding tour
                      </button>
                      <button
                        type="button"
                        onClick={openKeyboardShortcuts}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Keyboard size={16} className="text-slate-400" />
                        Keyboard shortcuts
                      </button>
                      <Link
                        href="/help"
                        onClick={() => setIsHelpMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <HelpCircle size={16} className="text-slate-400" />
                        Help center
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <IconButton id="tour-notifications" label="Notifications" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black leading-none text-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </IconButton>

            <IconButton label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>

            <div className="relative ml-1" ref={avatarMenuRef}>
              <button
                id="tour-profile"
                type="button"
                onClick={() => setIsAvatarMenuOpen((open) => !open)}
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 transition hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:hover:ring-offset-slate-950"
                aria-label="Open user menu"
                aria-expanded={isAvatarMenuOpen}
              >
                <Image src={avatarUrl} alt={currentUser.name} fill sizes="36px" className="object-cover" unoptimized />
              </button>

              <AnimatePresence>
                {isAvatarMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          router.push("/settings/profile");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <User size={16} className="text-slate-400" />
                        My Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          router.push("/settings/company");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings size={16} className="text-slate-400" />
                        Company Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          router.push("/settings/billing");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <CreditCard size={16} className="text-slate-400" />
                        Billing
                      </button>
                    </div>
                    <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {complianceAlerts.critical > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-orange-200 bg-orange-50 text-orange-900 shadow-sm dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200"
            >
              <div className="flex min-h-10 items-center justify-center gap-3 px-4 py-2 text-[13px] font-medium">
                <AlertTriangle size={16} className="shrink-0 text-orange-600 dark:text-orange-300" />
                <span>
                  {complianceAlerts.critical} compliance issues need attention
                  <Link href="/compliance/dashboard" className="ml-2 font-bold text-orange-700 underline-offset-2 hover:underline dark:text-orange-200">
                    View now
                  </Link>
                </span>
                <button
                  type="button"
                  onClick={dismissComplianceAlert}
                  className="ml-1 rounded-full p-1 text-orange-700 transition hover:bg-orange-100 dark:text-orange-200 dark:hover:bg-orange-500/20"
                  aria-label="Dismiss compliance alert"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isWhatsNewOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWhatsNewOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              aria-label="Close what's new drawer"
            />
            <motion.aside
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.18 }}
              className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-md border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              aria-label="What's new drawer"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">What&apos;s New</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Latest product updates and release notes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close what's new drawer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="h-[calc(100dvh-73px)] space-y-4 overflow-y-auto p-5">
                {[
                  ["Headcount Forecasting Report", "May 2026", "Model planned hires, attrition, and budget impact across 24 months with export support."],
                  ["Payroll Funding Visibility", "May 2026", "Funding balance, history, and exception handling are now accessible from the payroll workspace."],
                  ["Document Search Improvements", "April 2026", "Global search now surfaces employee documents and key records more reliably."],
                ].map(([itemTitle, date, body]) => (
                  <article
                    key={itemTitle}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{itemTitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{date}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
                  </article>
                ))}
                <Link
                  href="/changelog"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="inline-flex text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Open full changelog
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <CommandPalette />
    </TooltipProvider>
  );
}
