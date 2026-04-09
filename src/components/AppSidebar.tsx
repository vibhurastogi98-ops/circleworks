"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, DollarSign, Users, Briefcase, UserPlus, Heart, 
  Clock, Receipt, Target, Shield, BarChart2, Settings, HelpCircle, 
  LogOut, ChevronDown, ChevronRight, CheckCircle2
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useSocket } from "./SocketProvider";
import { useEffect } from "react";

type SubItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  badgeCount?: number;
  badgeCritical?: number;
  subItems?: SubItem[];
  isDivider?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { 
    label: "Payroll", 
    icon: DollarSign, 
    href: "/payroll",
    subItems: [
      { label: "Overview", href: "/payroll" },
      { label: "Run Payroll", href: "/payroll/run" },
      { label: "Off-Cycle Run", href: "/payroll/off-cycle" },
      { label: "Pay Schedule", href: "/payroll/schedule" },
      { label: "History", href: "/payroll/history" },
      { label: "Contractors", href: "/payroll/contractors" },
      { label: "Tips & FICA", href: "/payroll/tips" },
      { label: "GL Mapping", href: "/payroll/gl-mapping" },
    ]
  },
  { label: "Employees", icon: Users, href: "/employees" },
  { label: "Hiring", icon: Briefcase, href: "/hiring" },
  { label: "Onboarding", icon: UserPlus, href: "/onboarding" },
  { label: "Benefits", icon: Heart, href: "/benefits" },
  { label: "Time", icon: Clock, href: "/time" },
  { label: "Expenses", icon: Receipt, href: "/expenses" },
  { label: "Performance", icon: Target, href: "/performance" },
  { 
    label: "Compliance", 
    icon: Shield, 
    href: "/compliance/dashboard",
    subItems: [
      { label: "Dashboard", href: "/compliance/dashboard" },
      { label: "Tax Filings", href: "/compliance/tax-filings" },
      { label: "I-9 Verification", href: "/compliance/i9" },
      { label: "ACA", href: "/compliance/aca" },
      { label: "EEO-1", href: "/compliance/eeo" },
      { label: "Labor Posters", href: "/compliance/posters" },
      { label: "Handbook", href: "/compliance/handbook" },
      { label: "WOTC", href: "/compliance/wotc" },
    ]
  },
  { 
    label: "Reports", 
    icon: BarChart2, 
    href: "/reports",
    subItems: [
      { label: "All Reports", href: "/reports" },
      { label: "Custom Builder", href: "/reports/custom" },
    ]
  },
  { label: "DIVIDER", icon: LayoutDashboard, isDivider: true },
  { label: "Settings", icon: Settings, href: "/settings/company" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useSidebarStore();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { currentUser, isNewUser } = useDashboardData();
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    "Payroll": false
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive display info from Clerk user
  const displayName = user?.fullName || user?.firstName || "User";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "user@company.com";
  const avatarUrl = user?.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}&backgroundColor=transparent`;
  
  const { notificationCount, incrementNotificationCount } = usePlatformStore();
  const { socket } = useSocket();

  // Rule 6: Sidebar notification badge — subscribed to WS 'notification.new' event
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data: any) => {
      console.log("🔔 Rule 6: New Notification Received", data);
      incrementNotificationCount();
    };
    socket.on("notification.new", handleNewNotification);
    return () => { socket.off("notification.new", handleNewNotification); };
  }, [socket, incrementNotificationCount]);

  const toggleAccordion = (label: string) => {
    setOpenAccordions(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isRouteActive = (href?: string, subItems?: SubItem[]) => {
    if (href && pathname?.startsWith(href)) return true;
    if (subItems && subItems.some(sub => pathname?.startsWith(sub.href))) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-2xl lg:shadow-none 
          w-[240px] lg:w-[72px] xl:w-[240px]
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="h-[72px] min-h-[72px] flex items-center px-4 border-b border-slate-200 dark:border-slate-800 relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
             {mounted && currentUser?.logoUrl ? (
               <img src={currentUser.logoUrl} alt="Logo" className="w-full h-full object-contain" />
             ) : (
               <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-sm flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-full opacity-90" />
               </div>
             )}
          </div>
          
          <div className="ml-3 flex-1 flex flex-col justify-center overflow-hidden lg:hidden xl:flex transition-opacity duration-300">
             <span className="text-[14px] font-bold text-slate-900 dark:text-white truncate">
                {mounted ? (currentUser.companyName || "Your Company") : "Your Company"}
             </span>
             <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
               Switch company
               <ChevronDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </span>
          </div>

          {/* Tooltip for 72px state */}
          <div className="absolute left-[78px] px-2 py-1 bg-slate-800 text-white text-[12px] font-medium rounded opacity-0 invisible lg:group-hover:opacity-100 lg:group-hover:visible xl:hidden z-50 whitespace-nowrap shadow-lg whitespace-nowrap">
             {mounted ? (currentUser.companyName || "Your Company") : "Your Company"}
          </div>
        </div>

        {/* NAV ITEMS */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <nav className="flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item, idx) => {
              if (item.isDivider) {
                return <div key={`div-${idx}`} className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2 lg:mx-0 xl:mx-2" />;
              }

                    const active = isRouteActive(item.href, item.subItems);
                    const hasSubItems = !!item.subItems?.length;
                    const isAccordionOpen = openAccordions[item.label];

                    // Inject real-time notification count for specific items
                    // Clean up: Hide badges if user is new
                    const currentBadgeCount = (isNewUser || item.label === "Dashboard") && notificationCount > 0 
                      ? notificationCount 
                      : (isNewUser ? 0 : item.badgeCount);
                    
                    const displayBadge = isNewUser ? null : item.badge;
                    const displayCritical = isNewUser ? 0 : item.badgeCritical;

                    // Base item content inside a sub-component to reuse for link/button
                    const ItemContent = () => (
                      <div className="flex items-center w-full relative group/item">
                        <item.icon 
                          size={20} 
                          className={`flex-shrink-0 lg:mx-auto xl:mx-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200"}`} 
                          strokeWidth={active ? 2.5 : 2}
                        />
                        
                        {/* Tooltip for 72px state */}
                        <div className="absolute left-[56px] px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded opacity-0 invisible lg:group-hover/item:opacity-100 lg:group-hover/item:visible xl:hidden z-50 whitespace-nowrap shadow-xl">
                          {item.label}
                        </div>
                        
                        <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden lg:hidden xl:flex">
                           <span className={`text-[14px] font-semibold truncate ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                             {item.label}
                           </span>
                           
                           <div className="flex items-center gap-1.5">
                             {/* Badges */}
                             {displayBadge && (
                               <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 tracking-wider">
                                 {displayBadge}
                               </span>
                             )}
                             {currentBadgeCount ? (
                               <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                                 item.label === "Dashboard" && notificationCount > 0
                                   ? "bg-blue-600 text-white animate-pulse"
                                   : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                               }`}>
                                 {currentBadgeCount}
                               </span>
                             ) : null}
                       {displayCritical ? (
                         <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-1 border border-red-200 dark:border-red-500/30">
                           {displayCritical}
                         </span>
                       ) : null}

                       {/* Accordion Chevron */}
                       {hasSubItems && (
                         <ChevronDown 
                           size={14} 
                           className={`text-slate-400 transition-transform duration-200 ${isAccordionOpen ? "rotate-180" : ""}`} 
                         />
                       )}
                     </div>
                  </div>
                </div>
              );

              return (
                <div key={item.label} className="flex flex-col">
                  {hasSubItems ? (
                    <button
                      id={
                        item.label === "Payroll" 
                          ? "tour-payroll" 
                          : item.label === "Employees" 
                            ? "tour-employees" 
                            : item.label === "Compliance"
                              ? "tour-compliance"
                              : undefined
                      }
                      onClick={() => toggleAccordion(item.label)}
                      className={`relative flex items-center w-full min-h-[40px] rounded-lg px-2 group/btn transition-colors overflow-visible
                        ${active 
                          ? "bg-[#EFF6FF] dark:bg-[#1E293B]" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[4px] bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                      )}
                      <ItemContent />
                    </button>
                  ) : item.label === "Help" ? (
                    <button
                      onClick={() => window.dispatchEvent(new Event("circleworks:start-tour"))}
                      className={`relative flex items-center w-full min-h-[40px] rounded-lg px-2 group/btn transition-colors overflow-visible
                        ${active 
                          ? "bg-[#EFF6FF] dark:bg-[#1E293B]" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }
                      `}
                    >
                      <ItemContent />
                    </button>
                  ) : (
                    <Link
                      id={
                        item.label === "Payroll" 
                          ? "tour-payroll" 
                          : item.label === "Employees" 
                            ? "tour-employees" 
                            : item.label === "Compliance"
                              ? "tour-compliance"
                              : undefined
                      }
                      href={item.href || "#"}
                      className={`relative flex items-center w-full min-h-[40px] rounded-lg px-2 group/btn transition-colors overflow-visible
                        ${active 
                          ? "bg-[#EFF6FF] dark:bg-[#1E293B]" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[4px] bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                      )}
                      <ItemContent />
                    </Link>
                  )}

                  {/* Accordion Content */}
                  {hasSubItems && (
                    <AnimatePresence>
                      {isAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden lg:hidden xl:block"
                        >
                          <div className="flex flex-col gap-0.5 pt-1 pb-2 pl-[42px] pr-2">
                            {item.subItems!.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className={`text-[13px] py-1.5 px-2 rounded-md font-medium transition-colors ${
                                    isSubActive 
                                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" 
                                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center w-full group/user cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -m-2 transition-colors relative">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
             </div>
             
             {/* Tooltip for 72px state */}
             <div className="absolute left-[62px] bottom-2 px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded opacity-0 invisible lg:group-hover/user:opacity-100 lg:group-hover/user:visible xl:hidden z-50 whitespace-nowrap shadow-xl">
                {displayName}
             </div>

             <div className="ml-3 flex-1 overflow-hidden lg:hidden xl:block">
                <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{displayName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</div>
             </div>

             <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="ml-auto opacity-0 group-hover/user:opacity-100 transition-opacity lg:hidden xl:block text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                title="Log Out"
             >
                <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}
