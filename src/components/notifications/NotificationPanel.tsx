"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  CheckSquare,
  CircleDot,
  DollarSign,
  Info,
  MoreVertical,
  Settings,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  type NotificationCategory,
  type NotificationItem,
  useNotificationStore,
} from "@/store/useNotificationStore";

const TABS: Array<{ label: string; value: NotificationCategory | "ALL" }> = [
  { label: "ALL", value: "ALL" },
  { label: "APPROVALS", value: "APPROVALS" },
  { label: "PAYROLL", value: "PAYROLL" },
  { label: "COMPLIANCE", value: "COMPLIANCE" },
  { label: "HR", value: "HR" },
];

const PAGE_SIZE = 12;

const CATEGORY_META: Record<
  NotificationCategory,
  {
    icon: React.ElementType;
    tone: string;
    link: string;
  }
> = {
  ALL: { icon: Bell, tone: "bg-slate-100 text-slate-600", link: "/dashboard" },
  APPROVALS: { icon: CheckSquare, tone: "bg-blue-50 text-blue-600", link: "/time/approvals" },
  PAYROLL: { icon: DollarSign, tone: "bg-emerald-50 text-emerald-600", link: "/payroll" },
  COMPLIANCE: { icon: ShieldAlert, tone: "bg-amber-50 text-amber-600", link: "/compliance/dashboard" },
  HR: { icon: Users, tone: "bg-indigo-50 text-indigo-600", link: "/employees" },
  ATS: { icon: Info, tone: "bg-violet-50 text-violet-600", link: "/hiring" },
  ONBOARDING: { icon: Info, tone: "bg-pink-50 text-pink-600", link: "/onboarding" },
  BENEFITS: { icon: Info, tone: "bg-rose-50 text-rose-600", link: "/benefits" },
  SYSTEM: { icon: Info, tone: "bg-slate-100 text-slate-600", link: "/settings/integrations" },
  INFO: { icon: Info, tone: "bg-sky-50 text-sky-600", link: "/dashboard" },
};

function getRelativeTime(isoString: string) {
  const diffInSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getGroup(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= startOfWeek) return "Earlier this week";
  return "Older";
}

function getNotificationLink(notification: NotificationItem) {
  if (notification.link && notification.link !== "#") return notification.link;
  return CATEGORY_META[notification.type]?.link ?? "/dashboard";
}

function NotificationIcon({ type }: { type: NotificationCategory }) {
  const meta = CATEGORY_META[type] ?? CATEGORY_META.INFO;
  const Icon = meta.icon;

  return (
    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
      <Icon size={18} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        <Bell size={34} />
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-blue-50" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">You&apos;re all caught up!</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No notifications in this view.</p>
    </div>
  );
}

function NotificationMenu({
  notification,
  onClose,
}: {
  notification: NotificationItem;
  onClose: () => void;
}) {
  const { markAsRead, muteType, deleteNotification } = useNotificationStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      className="absolute right-0 top-8 z-[120] w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      {!notification.isRead && (
        <button
          type="button"
          onClick={() => {
            markAsRead(notification.id);
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <CircleDot size={13} />
          Mark as read
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          muteType(notification.type);
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <BellOff size={13} />
        Mute this type
      </button>
      <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
      <button
        type="button"
        onClick={() => {
          deleteNotification(notification.id);
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </motion.div>
  );
}

function NotificationRow({
  notification,
  menuOpenId,
  setMenuOpenId,
  onNavigate,
}: {
  notification: NotificationItem;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onNavigate: (notification: NotificationItem) => void;
}) {
  const { approveRequest, rejectRequest } = useNotificationStore();
  const isUnread = !notification.isRead;
  const isApproval = notification.type === "APPROVALS";
  const menuIsOpen = menuOpenId === notification.id;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={() => onNavigate(notification)}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpenId(notification.id);
      }}
      className={`group relative cursor-pointer rounded-xl border p-3 transition-colors ${
        isUnread
          ? "border-blue-200 border-l-4 border-l-blue-600 bg-blue-50/70"
          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70"
      }`}
    >
      <div className="flex gap-3">
        <NotificationIcon type={notification.type} />
        <div className="min-w-0 flex-1 pr-7">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">
              {notification.title}
            </h3>
            <span className="shrink-0 text-xs font-semibold text-slate-400">
              {getRelativeTime(notification.timestamp)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
            {notification.description}
          </p>

          <div className="mt-3 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
            {isApproval && notification.status === "pending" ? (
              <>
                <button
                  type="button"
                  onClick={() => approveRequest(notification.id)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-300"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => rejectRequest(notification.id)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-300"
                >
                  Reject
                </button>
              </>
            ) : isApproval && notification.status ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {notification.status === "approved" ? <Check size={13} /> : <X size={13} />}
                {notification.status}
              </span>
            ) : (
              <Link
                href={getNotificationLink(notification)}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(notification);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="absolute right-2 top-2" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          aria-label="Open notification menu"
          onClick={() => setMenuOpenId(menuIsOpen ? null : notification.id)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white ${
            menuIsOpen ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-white" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <MoreVertical size={15} />
        </button>
        <AnimatePresence>
          {menuIsOpen && (
            <NotificationMenu
              notification={notification}
              onClose={() => setMenuOpenId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<NotificationCategory | "ALL">("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const visibleNotifications = activeTab === "ALL"
      ? notifications
      : notifications.filter((notification) => notification.type === activeTab);
    return visibleNotifications.slice(0, visibleCount);
  }, [activeTab, notifications, visibleCount]);

  const hasMore = activeTab === "ALL"
    ? notifications.length > visibleCount
    : notifications.filter((notification) => notification.type === activeTab).length > visibleCount;

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, NotificationItem[]>>((acc, notification) => {
      const group = getGroup(notification.timestamp);
      acc[group] = acc[group] ?? [];
      acc[group].push(notification);
      return acc;
    }, {});
  }, [filtered]);

  const groupOrder = ["Today", "Yesterday", "Earlier this week", "Older"].filter(
    (group) => grouped[group]?.length
  );

  const handleTabChange = (tab: NotificationCategory | "ALL") => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
    setMenuOpenId(null);
  };

  const handleNavigate = (notification: NotificationItem) => {
    markAsRead(notification.id);
    onClose();
    router.push(getNotificationLink(notification));
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col border-l border-slate-200 dark:border-slate-800">
        <header className="shrink-0 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40 dark:text-blue-400 dark:hover:bg-blue-500/10"
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <Link
                href="/settings/notifications"
                aria-label="Notification settings"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Settings size={17} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto" aria-label="Notification filters">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-lg px-3 py-2 text-[11px] font-black tracking-wide transition-colors ${
                  activeTab === tab.value
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-[#0B1120]">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {groupOrder.map((group) => (
                  <section key={group} className="space-y-2">
                    <h3 className="px-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {group}
                    </h3>
                    <div className="space-y-2">
                      {grouped[group].map((notification) => (
                        <NotificationRow
                          key={notification.id}
                          notification={notification}
                          menuOpenId={menuOpenId}
                          setMenuOpenId={setMenuOpenId}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </AnimatePresence>

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
