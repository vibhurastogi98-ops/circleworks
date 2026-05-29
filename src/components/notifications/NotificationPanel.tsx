"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  FileWarning,
  Gift,
  ReceiptText,
  Settings,
  ShieldAlert,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  type NotificationCategory,
  type NotificationRecord,
  useNotificationStore,
} from "@/store/useNotificationStore";

type NotificationTab = "all" | "payroll" | "hr" | "compliance" | "time" | "expenses" | "hiring";

const TABS: Array<{ label: string; value: NotificationTab }> = [
  { label: "All", value: "all" },
  { label: "Payroll", value: "payroll" },
  { label: "HR", value: "hr" },
  { label: "Compliance", value: "compliance" },
  { label: "Time", value: "time" },
  { label: "Expenses", value: "expenses" },
  { label: "Hiring", value: "hiring" },
];

const categoryMeta: Record<
  NotificationCategory,
  {
    label: string;
    border: string;
    iconBg: string;
    icon: React.ElementType;
  }
> = {
  payroll: {
    label: "Payroll",
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    icon: DollarSign,
  },
  hr: {
    label: "HR",
    border: "border-l-blue-500",
    iconBg: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    icon: UserRound,
  },
  hiring: {
    label: "Hiring",
    border: "border-l-violet-500",
    iconBg: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    icon: BriefcaseBusiness,
  },
  onboarding: {
    label: "Onboarding",
    border: "border-l-cyan-500",
    iconBg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    icon: UsersRound,
  },
  benefits: {
    label: "Benefits",
    border: "border-l-rose-500",
    iconBg: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    icon: Gift,
  },
  time: {
    label: "Time",
    border: "border-l-amber-500",
    iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    icon: Clock3,
  },
  expenses: {
    label: "Expenses",
    border: "border-l-fuchsia-500",
    iconBg: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    icon: ReceiptText,
  },
  compliance: {
    label: "Compliance",
    border: "border-l-orange-500",
    iconBg: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    icon: ShieldAlert,
  },
  system: {
    label: "System",
    border: "border-l-slate-500",
    iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: Sparkles,
  },
  billing: {
    label: "Billing",
    border: "border-l-red-500",
    iconBg: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    icon: CreditCard,
  },
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTabCategories(tab: NotificationTab): NotificationCategory[] | null {
  if (tab === "all") return null;
  if (tab === "hr") return ["hr", "onboarding", "benefits"];
  return [tab];
}

function getRelativeTime(isoString: string) {
  const diffInSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullTimestamp(isoString: string) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getItemIcon(notification: NotificationRecord) {
  if (notification.type.includes("failed") || notification.type.includes("critical") || notification.type.includes("expired")) {
    return FileWarning;
  }
  if (notification.type.includes("completed") || notification.type.includes("approved") || notification.type.includes("accepted")) {
    return CheckCircle2;
  }
  if (notification.type.includes("scheduled") || notification.type.includes("due") || notification.type.includes("approaching")) {
    return CalendarClock;
  }
  return categoryMeta[notification.category].icon;
}

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl shadow-inner dark:bg-blue-500/10">
        🎉
      </div>
      <h3 className="text-sm font-black text-slate-950 dark:text-white">All caught up!</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No notifications in this view.</p>
    </div>
  );
}

function NotificationItem({ notification, onClose }: { notification: NotificationRecord; onClose: () => void }) {
  const meta = categoryMeta[notification.category];
  const Icon = getItemIcon(notification);
  const readClass = notification.isRead
    ? "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
    : "bg-blue-50 hover:bg-blue-50/80 dark:bg-blue-500/10 dark:hover:bg-blue-500/15";

  return (
    <article
      className={cx(
        "border-l-4 border-b border-slate-100 px-4 py-3 transition-colors dark:border-b-slate-800",
        meta.border,
        readClass,
      )}
    >
      <div className="flex gap-3">
        <div className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.iconBg)}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-sm font-black text-slate-950 dark:text-white">
              {notification.title}
            </h3>
            <time
              dateTime={notification.timestamp}
              title={fullTimestamp(notification.timestamp)}
              className="shrink-0 text-[11px] font-bold text-slate-400"
            >
              {getRelativeTime(notification.timestamp)}
            </time>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
            {notification.message}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {meta.label}
            </span>
            <Link
              href={notification.link}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {notification.actionLabel || "Open"}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAllAsRead,
    markVisibleAsRead,
  } = useNotificationStore();
  const [activeTab, setActiveTab] = React.useState<NotificationTab>("all");

  useEffect(() => {
    if (isOpen) void loadNotifications();
  }, [isOpen, loadNotifications]);

  const filtered = useMemo(() => {
    const categories = getTabCategories(activeTab);
    if (!categories) return notifications;
    return notifications.filter((notification) => categories.includes(notification.category));
  }, [activeTab, notifications]);

  const visibleNotifications = filtered.slice(0, 40);

  useEffect(() => {
    if (!isOpen) return;
    const unreadIds = visibleNotifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);
    if (unreadIds.length) void markVisibleAsRead(unreadIds);
  }, [isOpen, markVisibleAsRead, visibleNotifications]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="fixed right-4 top-[66px] z-50 flex max-h-[80vh] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            role="dialog"
            aria-label="Notifications"
          >
            <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="text-base font-black text-slate-950 dark:text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    className="rounded-md px-2 py-1 text-xs font-black text-blue-600 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </button>
                  <Link
                    href="/app/settings/notifications"
                    onClick={onClose}
                    aria-label="Notification settings"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Settings size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notifications"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              <nav className="mt-3 flex gap-1 overflow-x-auto pb-1" aria-label="Notification filters">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={cx(
                      "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-black transition-colors",
                      activeTab === tab.value
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
              {visibleNotifications.length ? (
                visibleNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} onClose={onClose} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
