"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, Search, Bell, HelpCircle, Sun, Moon, AlertTriangle, X, 
  Settings, User, CreditCard, LogOut, Loader2, Sparkles, ChevronRight
} from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import Breadcrumb from "./Breadcrumb";

export default function AppTopBar() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const { toggleSidebar } = useSidebarStore();
  
  // Platform global state
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isAdmin, 
    isPayrollRunning, 
    hasComplianceAlert, 
    dismissComplianceAlert,
    setPayrollRunning
  } = usePlatformStore();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

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
    };
    if (isAvatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAvatarMenuOpen]);

  const openCommandPalette = () => {
    // Placeholder function per Section 31
    console.log("Opening Command Palette");
  };

  const openNotificationPanel = () => {
    // Placeholder function per Section 30
    console.log("Opening Notifications Panel");
  };

  // Derive Page Title & Breadcrumbs safely
  const pathParts = pathname.split("/").filter(Boolean);
  const mainTitle = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace(/-/g, " ") 
    : "Dashboard";
  
  const breadcrumbItems = pathParts.map((part, index) => {
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const href = index < pathParts.length - 1 ? "/" + pathParts.slice(0, index + 1).join("/") : undefined;
    return { label, href };
  });

  return (
    <div className="sticky top-0 z-40 flex flex-col w-full shadow-sm">
      {/* MAIN 64px TOPBAR */}
      <header className="h-16 w-full bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
        
        {/* LEFT: Hamburger + Title + Breadcrumbs */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 min-w-0">
             <h1 className="text-[18px] font-bold text-slate-900 dark:text-white truncate hidden md:block">
               {mainTitle}
             </h1>
             
             {/* Vertical Separator */}
             <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
             
             {/* Breadcrumbs - Only show on larger screens to avoid cluttering next to title */}
             <div className="hidden sm:flex items-center gap-2 overflow-hidden text-[14px] whitespace-nowrap">
                {breadcrumbItems.length > 0 ? (
                   <Breadcrumb items={breadcrumbItems} variant={isDarkMode ? "dark" : "light"} />
                ) : (
                   <span className="text-slate-500 font-medium">Overview</span>
                )}
             </div>
          </div>
        </div>

        {/* CENTER: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:flex items-center justify-center">
          <div 
             className="w-full max-w-[480px] h-[36px] bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md flex items-center px-3 gap-2.5 cursor-text border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all text-slate-400 dark:text-slate-500 group"
             onClick={openCommandPalette}
          >
             <Search size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
             <span className="text-[13px] font-medium flex-1 truncate">Search employees, reports, documents...</span>
             <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono shadow-sm">
               ⌘K
             </kbd>
          </div>
        </div>
        {/* Mobile Search Icon Only */}
        <div className="md:hidden ml-auto mr-2">
           <button 
             onClick={openCommandPalette}
             className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
           >
             <Search size={20} />
           </button>
        </div>

        {/* RIGHT: CTAs & Icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          
          {/* Admin Contextual Button: Run Payroll / Processing Block */}
          {isAdmin && (
             <div className="hidden lg:flex mr-4">
                {isPayrollRunning ? (
                  <button onClick={() => setPayrollRunning(false)} className="h-[36px] px-4 flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 cursor-pointer shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                     <Loader2 size={16} className="animate-spin" />
                     <span className="text-[13px] font-bold tracking-wide">Payroll Processing...</span>
                  </button>
                ) : (
                  <button onClick={() => setPayrollRunning(true)} className="h-[36px] px-5 flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5">
                     <span className="text-[13px] font-bold tracking-wide">Run Payroll</span>
                  </button>
                )}
             </div>
          )}

          {/* 1. What's New Bell (Changelog) */}
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors group relative"
            title="What's New"
          >
            <Sparkles size={20} className="group-hover:text-amber-500 transition-colors" />
          </button>

          {/* 2. Help Icon */}
          <button 
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Help center"
          >
            <HelpCircle size={20} />
          </button>

          {/* 3. Notifications Bell */}
          <button 
            onClick={openNotificationPanel}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900 animate-pulse" />
          </button>

          {/* 4. Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 5. User Avatar Menu */}
          <div className="relative ml-2" ref={avatarMenuRef}>
             <button 
               onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
               className="flex items-center justify-center w-[36px] h-[36px] rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-900 transition-all cursor-pointer"
             >
               <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
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
                       <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">Alex HR Admin</p>
                       <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">alex@acme.corp</p>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                       <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors">
                         <User size={16} className="text-slate-400" /> My Profile
                       </button>
                       <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors">
                         <Settings size={16} className="text-slate-400" /> Company Settings
                       </button>
                       <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md flex items-center gap-2 transition-colors">
                         <CreditCard size={16} className="text-slate-400" /> Billing
                       </button>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                       <button className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md flex items-center gap-2 transition-colors">
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
    </div>
  );
}
