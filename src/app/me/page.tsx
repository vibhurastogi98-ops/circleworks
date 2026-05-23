"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign, Clock, Receipt, CreditCard, FileText, Star,
  CalendarDays, AlertCircle, ChevronRight, Megaphone, Gift,
  Plane, Thermometer, User as UserIcon, Timer
} from "lucide-react";

import { useEmployeePortal } from "@/hooks/useEmployeePortal";
import {
  mockPtoBalances, mockPendingTasks, mockKudos, mockPayStubs,
} from "@/data/mockEmployeePortal";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { label: "Clock In/Out", icon: Timer, href: "/me/time", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" },
  { label: "Request Time Off", icon: Plane, href: "/me/time-off", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  { label: "Submit Expense", icon: Receipt, href: "/me/expenses", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
  { label: "Update Bank Info", icon: CreditCard, href: "/me/profile", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
  { label: "View Pay Stub", icon: DollarSign, href: "/me/paystubs", color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" },
];

const ptoIcons: Record<string, React.ElementType> = {
  Vacation: Plane,
  Sick: Thermometer,
  Personal: UserIcon,
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderAnnouncementBody(body: string) {
  const escaped = escapeHtml(body);
  return escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-600 underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li class="ml-4">.*<\/li>)/gs, '<ul class="list-disc space-y-1 pl-4">$1</ul>')
    .replace(/\n/g, "<br />");
}

type EmployeeAnnouncement = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  publishAt?: string | null;
  isPinned: boolean;
  isRead: boolean;
  isUnread: boolean;
  priority: "Normal" | "Important" | "Urgent";
  attachments: Array<{ name: string; url: string; type: string; size: number }>;
};

function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<EmployeeAnnouncement[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<EmployeeAnnouncement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements?filter=Active", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || !isMounted) return;

        const sorted = [...data]
          .sort((a, b) => {
            if (a.isPinned === b.isPinned) {
              return new Date(b.publishAt ?? b.createdAt).getTime() - new Date(a.publishAt ?? a.createdAt).getTime();
            }
            return a.isPinned ? -1 : 1;
          })
          .slice(0, 5);

        setAnnouncements(sorted);
      } catch (error) {
        console.error(error);
      }
    };

    loadAnnouncements();
    const interval = window.setInterval(loadAnnouncements, 30000);
    const onFocus = () => loadAnnouncements();
    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!selectedAnn || selectedAnn.isRead) return;

    const timeout = window.setTimeout(() => {
      fetch(`/api/announcements/${selectedAnn.id}/read`, { method: "POST" })
        .then(() => {
          setAnnouncements((current) => current.map((announcement) => (
            announcement.id === selectedAnn.id
              ? { ...announcement, isRead: true, isUnread: false }
              : announcement
          )));
          setSelectedAnn((current) => current ? { ...current, isRead: true, isUnread: false } : current);
        })
        .catch(console.error);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [selectedAnn]);

  const handleOpen = (announcement: EmployeeAnnouncement) => {
    setSelectedAnn(announcement);
  };

  return (
    <>
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Megaphone size={16} className="text-blue-500" /> Recent Announcements
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
          {announcements.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">No announcements at this time.</div>
          ) : announcements.map(ann => (
            <button 
              key={ann.id} 
              onClick={() => handleOpen(ann)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group relative"
            >
              {ann.isUnread && (
                 <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" title="Unread">Unread</span>
              )}
              <div className="flex items-center gap-2 pr-4">
                {ann.isPinned && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Pinned</span>}
                {ann.priority === "Important" && <span className="text-[10px] rounded bg-amber-100 px-1.5 py-0.5 font-bold uppercase text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Important</span>}
                {ann.priority === "Urgent" && <span className="text-[10px] rounded bg-red-100 px-1.5 py-0.5 font-bold uppercase text-red-700 dark:bg-red-900/40 dark:text-red-300">Urgent</span>}
                <h3 className={`text-[13px] font-bold ${ann.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'} truncate`}>{ann.title}</h3>
                <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">{format(new Date(ann.publishAt ?? ann.createdAt), 'MMM d')}</span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 pr-4">{ann.body}</p>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedAnn} onOpenChange={(open) => !open && setSelectedAnn(null)}>
        {selectedAnn && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAnn.isPinned && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Pinned</span>}
                  {selectedAnn.priority === "Important" && <span className="text-[10px] rounded bg-amber-100 px-1.5 py-0.5 font-bold uppercase text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Important</span>}
                  {selectedAnn.priority === "Urgent" && <span className="text-[10px] rounded bg-red-100 px-1.5 py-0.5 font-bold uppercase text-red-700 dark:bg-red-900/40 dark:text-red-300">Urgent</span>}
                  {selectedAnn.title}
                </DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedAnn.publishAt ?? selectedAnn.createdAt), 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
            {selectedAnn.priority === "Important" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
                Important announcement
              </div>
            )}
            {selectedAnn.priority === "Urgent" && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                Urgent announcement
              </div>
            )}
            <div className="py-4">
              <div
                className="max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: renderAnnouncementBody(selectedAnn.body) }}
              />
            </div>
            {selectedAnn.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  {selectedAnn.attachments.map((attachment) => (
                    <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <FileText size={14} /> {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default function EmployeeHomePage() {
  // Guest Mode: Mock user data
  const user = { firstName: "Guest", lastName: "Employee" };

  const { data, isLoading, error } = useEmployeePortal();

  const profile = data?.profile;
  const payStubs = data?.payStubs?.length ? data.payStubs : mockPayStubs;
  const firstName = profile?.firstName || user?.firstName || "there";
  const latestStub = payStubs[0] || mockPayStubs[0];
  const nextPayDate = new Date(latestStub.payDate);
  nextPayDate.setDate(nextPayDate.getDate() + 14);

  return (
    <>
      {/* Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-2 text-white/80 text-[15px]">
            Next paycheck: <span className="font-bold text-white">${latestStub.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> on{" "}
            <span className="font-bold text-white">{nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 text-center group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PTO Balances */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">PTO Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mockPtoBalances.map((pto) => {
            const Icon = ptoIcons[pto.type] || CalendarDays;
            const pct = Math.round((pto.used / pto.total) * 100);
            return (
              <motion.div
                key={pto.type}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Icon size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">{pto.type}</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{pto.balance} <span className="text-sm font-medium text-slate-400">days</span></div>
                <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{pto.used} used of {pto.total}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" /> Pending Tasks
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
            {mockPendingTasks.map(task => (
              <Link key={task.id} href={task.link} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{task.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Kudos */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" /> Kudos Received
          </h2>
          <div className="flex flex-col gap-3">
            {mockKudos.map(kudo => (
              <motion.div
                key={kudo.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
                    {kudo.from.charAt(0)}
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">{kudo.from}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{new Date(kudo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{kudo.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <AnnouncementsWidget />
    </>
  );
}
