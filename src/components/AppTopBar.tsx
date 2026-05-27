"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, Search, Bell, HelpCircle, Sun, Moon, AlertTriangle, X,
  Settings, User, CreditCard, LogOut, Loader2, BellRing, ExternalLink, Keyboard, Route
} from "lucide-react";

import { useSidebarStore } from "@/store/useSidebarStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useDataSync } from "@/hooks/useDataSync";
import { toast } from "sonner";
import Breadcrumb from "./Breadcrumb";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import CommandPalette from "@/components/CommandPalette";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuth } from "@/context/AuthContext";
import { useDashboardRealtimeStore } from "@/store/useDashboardRealtimeStore";

export default function AppTopBar() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName = user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayEmail)}&backgroundColor=transparent`;

  const { toggleSidebar } = useSidebarStore();
  
  // Platform global state
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isAdmin, 
    isPayrollRunning, 
    hasComplianceAlert, 
    dismissComplianceAlert,
    setPayrollRunning,
    setCommandPaletteOpen
  } = usePlatformStore();
  const canRunPayroll = user
    ? ["admin", "hr"].includes(user.role.toLowerCase())
    : isAdmin;
  const { notifyPayrollComplete } = useDataSync();
  const { unreadCount } = useNotificationStore();
  const { setPayrollStatus } = useDashboardRealtimeStore();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const openCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  const openHelpWidget = () => {
    if (typeof window === "undefined") return;

    const intercom = (window as typeof window & {
      Intercom?: (command: string, ...args: unknown[]) => void;
    }).Intercom;

    if (typeof intercom === "function") {
      intercom("show");
      return;
    }

    router.push("/help");
  };

  const restartOnboardingTour = () => {
    setIsHelpMenuOpen(false);
    window.sessionStorage.setItem("circleworks:start-tour-on-dashboard", "true");
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
      return;
    }
    window.dispatchEvent(new CustomEvent("circleworks:start-tour"));
  };

  const openKeyboardShortcuts = () => {
    setIsHelpMenuOpen(false);
    window.dispatchEvent(new CustomEvent("circleworks:show-shortcuts"));
  };

  const openNotificationPanel = () => {
    setIsNotificationsOpen(true);
  };

  const formatRouteLabel = (segment: string) =>
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  // Sync dark mode class with DOM (safely on client only)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Handle Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
    };
    if (isAvatarMenuOpen || isHelpMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAvatarMenuOpen, isHelpMenuOpen]);

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

  // Derive Page Title & Breadcrumbs safely
  const pathParts = pathname.split("/").filter(Boolean);
  const mainTitle =
    pathParts.length > 0
      ? formatRouteLabel(pathParts[pathParts.length - 1])
      : "Dashboard";
  
  const breadcrumbItems = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    return {
      label: formatRouteLabel(part),
      href: index < pathParts.length - 1 ? href : undefined,
    };
  });

  return (
    <div className="sticky top-0 z-40 flex flex-col w-full shadow-sm">
      {/* MAIN 64px TOPBAR */}
      <header className="h-16 w-full bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
        
        {/* LEFT: Hamburger + Title + Breadcrumbs */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
            aria-label="Toggle Sidebar"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 min-w-0">
             <h1 className="text-[18px] font-bold text-slate-900 dark:text-white truncate">
               {mainTitle}
             </h1>
             
             {/* Vertical Separator */}
             <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
             
             <div className="hidden lg:flex items-center gap-2 overflow-hidden text-[14px] whitespace-nowrap">
                {breadcrumbItems.length > 0 ? (
                   <Breadcrumb items={breadcrumbItems} variant={isDarkMode ? "dark" : "light"} />
                ) : (
                   <span className="text-slate-500 font-medium">Overview</span>
                )}
             </div>
          </div>
        </div>

        {/* CENTER: Global Search Bar */}
        <div className="flex-1 mx-4 lg:mx-8 hidden md:flex items-center justify-center min-w-0">
          <button
             type="button"
             id="tour-search"
             className="w-full max-w-[640px] h-10 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg flex items-center px-3 gap-2.5 cursor-text border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all text-slate-400 dark:text-slate-500 group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
             onClick={openCommandPalette}
             aria-label="Search employees, reports, documents, command palette"
             title="Open search"
          >
             <Search size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
             <span className="text-[13px] font-medium flex-1 truncate text-left">
               Search employees, reports, documents... (Cmd+K)
             </span>
             <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono shadow-sm">
               ⌘K
             </kbd>
          </button>
        </div>
        {/* Mobile Search Icon Only */}
        <div className="md:hidden ml-auto mr-2">
           <button 
             onClick={openCommandPalette}
             className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
             title="Search"
             aria-label="Open command palette"
           >
             <Search size={20} />
           </button>
        </div>

        {/* RIGHT: CTAs & Icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          
          {/* Admin Contextual Button: Run Payroll / Processing Block */}
          {canRunPayroll && (
             <div className="hidden lg:flex mr-3">
                {isPayrollRunning ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPayrollRunning(false);
                      setPayrollStatus({ isRunning: false, employeeCount: 47 });
                      notifyPayrollComplete();
                      toast.success("Payroll run completed and synced!");
                    }} 
                    className="h-[36px] px-4 flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 cursor-pointer shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    aria-label="Payroll processing in progress"
                    title="Payroll processing"
                  >
                     <span className="relative flex h-2.5 w-2.5">
                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                       <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                     </span>
                     <span className="text-[13px] font-bold tracking-wide">Payroll Processing...</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPayrollRunning(true);
                      setPayrollStatus({ isRunning: true, employeeCount: 47 });
                    }}
                    className="h-[36px] px-5 flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
                    aria-label="Run payroll"
                  >
                     <Loader2 size={14} className="opacity-0" />
                     <span className="text-[13px] font-bold tracking-wide">Run Payroll</span>
                  </button>
                )}
             </div>
          )}

          {/* 1. What's New */}
          <button
            type="button"
            onClick={() => setIsWhatsNewOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors group relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
            title="What's New"
            aria-label="Open what is new drawer"
          >
            <BellRing size={20} className="group-hover:text-blue-600 transition-colors" />
          </button>

          {/* 2. Help Menu */}
          <div className="relative hidden sm:block" ref={helpMenuRef}>
            <button
              type="button"
              onClick={() => setIsHelpMenuOpen((open) => !open)}
              className="flex w-10 h-10 items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
              title="Help"
              aria-label="Open help menu"
              aria-expanded={isHelpMenuOpen}
              aria-haspopup="menu"
            >
              <HelpCircle size={20} />
            </button>

            <AnimatePresence>
              {isHelpMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 dark:border-slate-700 dark:bg-slate-800"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">Help</p>
                    <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Guides, shortcuts, and walkthroughs.</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={restartOnboardingTour}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                      role="menuitem"
                    >
                      <Route size={16} className="text-slate-400" /> Restart onboarding tour
                    </button>
                    <button
                      type="button"
                      onClick={openKeyboardShortcuts}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                      role="menuitem"
                    >
                      <Keyboard size={16} className="text-slate-400" /> Keyboard shortcuts
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpMenuOpen(false);
                        openHelpWidget();
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                      role="menuitem"
                    >
                      <HelpCircle size={16} className="text-slate-400" /> Help center
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Notifications Bell */}
          <button 
            id="tour-notifications"
            onClick={openNotificationPanel}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
            title="Notifications"
            aria-label="View Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black leading-none shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* 4. Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 5. User Avatar Menu */}
          <div className="relative ml-2" ref={avatarMenuRef}>
             <button 
               onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
               className="relative flex items-center justify-center w-[36px] h-[36px] rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-900 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 outline-none"
               aria-label="Open User Menu"
               aria-expanded={isAvatarMenuOpen}
               aria-haspopup="true"
             >
               <Image src={avatarUrl} alt="User Avatar" fill sizes="36px" className="object-cover bg-slate-100 dark:bg-slate-800" unoptimized />
             </button>

             <AnimatePresence>
                {isAvatarMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                       <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                       <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{displayEmail}</p>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                       <button
                         onClick={() => { setIsAvatarMenuOpen(false); router.push("/settings/profile"); }}
                         className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                       >
                         <User size={16} className="text-slate-400" /> My Profile
                       </button>
                       <button 
                         onClick={() => { setIsAvatarMenuOpen(false); router.push("/settings/company"); }}
                         className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                       >
                         <Settings size={16} className="text-slate-400" /> Company Settings
                       </button>
                       <button 
                         onClick={() => { setIsAvatarMenuOpen(false); router.push("/settings/billing"); }}
                         className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors"
                       >
                         <CreditCard size={16} className="text-slate-400" /> Billing
                       </button>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                       <button
                         onClick={() => signOut({ redirectUrl: "/" })}
                         className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md flex items-center gap-2 transition-colors"
                       >
                         <LogOut size={16} /> Log Out
                       </button>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

        </div>
      </header>
      
      {/* SECONDARY: Compliance Alert Banner (Dismissible per session) */}
      <AnimatePresence>
        {hasComplianceAlert && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 flex items-center justify-center px-4 overflow-hidden"
          >
            <div className="w-full max-w-7xl flex items-center justify-center gap-3 py-2.5 relative text-amber-800 dark:text-amber-500 text-[13px]">
              <AlertTriangle size={16} className="flex-shrink-0 animate-pulse" />
              <span className="font-medium text-center">
                 <strong className="font-bold mr-1">Compliance Alert:</strong> 
                 Action required for quarterly tax filings in <strong>CA</strong> and <strong>NY</strong>. Due in 5 days.
              </span>
              <button 
                onClick={dismissComplianceAlert} 
                className="absolute right-0 p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 transition-colors"
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
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
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close what's new drawer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto h-[calc(100vh-81px)]">
                {[
                  {
                    title: "Headcount Forecasting Report",
                    date: "May 2026",
                    body: "Model planned hires, attrition, and budget impact across 24 months with export support.",
                  },
                  {
                    title: "Payroll Funding Visibility",
                    date: "May 2026",
                    body: "Funding balance, history, and exception handling are now accessible from the payroll workspace.",
                  },
                  {
                    title: "Document Search Improvements",
                    date: "April 2026",
                    body: "Global search now surfaces employee documents and key records more reliably.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.date}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
                  </div>
                ))}

                <Link
                  href="/changelog"
                  onClick={() => setIsWhatsNewOpen(false)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Open full changelog <ExternalLink size={14} />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Slide-in Notification Panel */}
      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      
      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
