"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, X, Check, Settings, MoreVertical, CheckSquare, 
  DollarSign, ShieldAlert, Users, Info, Trash2, BellOff,
  CircleDot, Briefcase, GraduationCap, HeartPulse, Activity
} from "lucide-react";
import { useNotificationStore, NotificationCategory, NotificationItem } from "@/store/useNotificationStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Time Helper ---
const getRelativeTime = (isoString: string) => {
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Date(isoString).toLocaleDateString();
};

const getGroup = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  
  // reset to midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); 
  
  if (date >= today) return "Today";
  if (date >= yesterday && date < today) return "Yesterday";
  if (date >= startOfWeek && date < yesterday) return "Earlier this week";
  return "Older";
};

// --- Icons ---
const getIconForType = (type: NotificationCategory) => {
  switch(type) {
    case "APPROVALS": return <CheckSquare size={18} className="text-blue-500" />;
    case "PAYROLL": return <DollarSign size={18} className="text-emerald-500" />;
    case "COMPLIANCE": return <ShieldAlert size={18} className="text-amber-500" />;
    case "HR": return <Users size={18} className="text-indigo-500" />;
    case "ATS": return <Briefcase size={18} className="text-violet-500" />;
    case "ONBOARDING": return <GraduationCap size={18} className="text-pink-500" />;
    case "BENEFITS": return <HeartPulse size={18} className="text-rose-500" />;
    case "SYSTEM": return <Activity size={18} className="text-slate-500" />;
    default: return <Info size={18} className="text-slate-500" />;
  }
};

const TABS: { label: string, value: NotificationCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Approvals", value: "APPROVALS" },
  { label: "Payroll", value: "PAYROLL" },
  { label: "HR", value: "HR" },
  { label: "ATS", value: "ATS" },
  { label: "Onboarding", value: "ONBOARDING" },
  { label: "Benefits", value: "BENEFITS" },
  { label: "Compliance", value: "COMPLIANCE" },
  { label: "System", value: "SYSTEM" },
];

export default function NotificationPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead, 
    approveRequest, 
    rejectRequest,
    deleteNotification,
    muteType,
    addNotification
  } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<NotificationCategory | "ALL">("ALL");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // WS Simulation Listener
  useEffect(() => {
    const handleNewNotification = (e: any) => {
      const detail = e.detail;
      if (detail) {
        addNotification(detail);
      }
    };
    window.addEventListener("notification.new", handleNewNotification);
    return () => window.removeEventListener("notification.new", handleNewNotification);
  }, [addNotification]);

  // Click outside to close Item menu
  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    if (menuOpenId) document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [menuOpenId]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  const filtered = activeTab === "ALL" 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const grouped = filtered.reduce((acc, notif) => {
    const g = getGroup(notif.timestamp);
    if (!acc[g]) acc[g] = [];
    acc[g].push(notif);
    return acc;
  }, {} as Record<string, NotificationItem[]>);

  const groups = ["Today", "Yesterday", "Earlier this week", "Older"].filter(g => grouped[g] && grouped[g].length > 0);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) {
      onClose();
      router.push(n.link);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-[400px] bg-white dark:bg-[#0F172A] shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[12px] font-bold">
                    {unreadCount} new
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  <Settings size={18} />
                </button>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-6">
                {TABS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setActiveTab(t.value as any)}
                    className={`pb-3 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === t.value 
                        ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B1120]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">You're all caught up!</h3>
                  <p className="text-[13px] text-slate-500">No new notifications in this category.</p>
                </div>
              ) : (
                <div className="pb-8">
                  <AnimatePresence initial={false}>
                    {groups.map(group => (
                      <div key={group} className="pt-4">
                        <h4 className="px-5 pb-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                          {group}
                        </h4>
                        <div className="flex flex-col">
                          {grouped[group].map(notif => (
                            <motion.div
                              key={notif.id}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`relative group cursor-pointer border-b border-slate-100 dark:border-slate-800/50 p-4 pl-5 ${
                                !notif.isRead 
                                  ? "bg-white dark:bg-slate-900 border-l-[3px] border-l-blue-600" 
                                  : "bg-transparent border-l-[3px] border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20"
                              }`}
                              onClick={() => handleItemClick(notif)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  {getIconForType(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[14px] font-bold text-slate-900 dark:text-gray-100 truncate">
                                      {notif.title}
                                    </span>
                                    <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                      {getRelativeTime(notif.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-[90%]">
                                    {notif.description}
                                  </p>

                                  {/* Actions inline */}
                                  {notif.type === "APPROVALS" && notif.status === "pending" && (
                                    <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => approveRequest(notif.id)}
                                        className="h-8 px-4 rounded-md bg-white border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/30 transition-colors"
                                      >   
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => rejectRequest(notif.id)}
                                        className="h-8 px-4 rounded-md bg-white border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/30 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  
                                  {notif.type === "APPROVALS" && notif.status !== "pending" && (
                                    <div className="mt-2 text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
                                      {notif.status === "approved" ? <Check size={14} className="text-emerald-500"/> : <X size={14} className="text-red-500" />}
                                      {notif.status === "approved" ? "Approved" : "Rejected"}
                                    </div>
                                  )}

                                  {notif.link && notif.type !== "APPROVALS" && (
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                      <Link href={notif.link} onClick={onClose} className="text-[12px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        View details &rarr;
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* More Menu */}
                              <div className="absolute right-3 top-3" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuOpenId(menuOpenId === notif.id ? null : notif.id);
                                  }}
                                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${menuOpenId === notif.id ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                
                                <AnimatePresence>
                                  {menuOpenId === notif.id && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-[110]"
                                    >
                                      <div className="p-1 flex flex-col">
                                        {!notif.isRead && (
                                          <button onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            markAsRead(notif.id); 
                                            setMenuOpenId(null);
                                          }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                            <CircleDot size={14} className="text-slate-400" /> Mark as read
                                          </button>
                                        )}
                                        <button onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          muteType(notif.type); 
                                          setMenuOpenId(null);
                                        }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                                          <BellOff size={14} className="text-slate-400" /> Mute this type
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                        <button onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          deleteNotification(notif.id); 
                                          setMenuOpenId(null);
                                        }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded flex items-center gap-2">
                                          <Trash2 size={14}/> Delete
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                  
                  {filtered.length > 0 && (
                     <div className="p-6 flex justify-center">
                        <button className="h-9 px-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[13px] font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all">
                           Load More
                        </button>
                     </div>
                  )}
                </div>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
