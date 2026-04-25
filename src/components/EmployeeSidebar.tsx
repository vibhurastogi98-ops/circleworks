"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, DollarSign, Clock, Timer, Heart, FileText, MoreHorizontal,
  ChevronDown, LogOut, Receipt, Target, GraduationCap,
  Banknote, Users2, User, ChevronRight,
} from "lucide-react";

import { useSidebarStore } from "@/store/useSidebarStore";
import { useDashboardData } from "@/hooks/useDashboardData";

type SubItem = { label: string; href: string };
type NavItem = {
  label: string; icon: React.ElementType; href?: string;
  badge?: string; badgeCount?: number; subItems?: SubItem[]; isDivider?: boolean;
};

const EMPLOYEE_NAV: NavItem[] = [
  { label: "Home", icon: Home, href: "/me" },
  {
    label: "Pay", icon: DollarSign, href: "/me/paystubs",
    subItems: [
      { label: "Pay Stubs", href: "/me/paystubs" },
      { label: "Tax Forms", href: "/me/w2" },
      { label: "Early Pay", href: "/me/ewa" },
    ],
  },
  { label: "Time Off", icon: Clock, href: "/me/time-off", badgeCount: 1 },
  { label: "Time", icon: Timer, href: "/me/time" },
  { label: "Benefits", icon: Heart, href: "/me/benefits" },
  { label: "Expenses", icon: Receipt, href: "/me/expenses" },
  { label: "Documents", icon: FileText, href: "/me/documents" },
  { label: "DIVIDER", icon: Home, isDivider: true },
  { label: "Learning", icon: GraduationCap, href: "/me/learning" },
  { label: "Goals", icon: Target, href: "/me/goals" },
  { label: "Referrals", icon: Users2, href: "/me/referrals" },
  { label: "DIVIDER", icon: Home, isDivider: true },
  { label: "My Profile", icon: User, href: "/me/profile" },
];

// Guest Mode: Authentication constants
const GUEST_SIGN_OUT = (options?: { redirectUrl?: string }) => { window.location.href = options?.redirectUrl || "/"; };
const GUEST_DISPLAY_NAME = "Guest Employee";
const GUEST_DISPLAY_EMAIL = "employee@circleworks.com";
const GUEST_AVATAR_URL = "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent";

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useSidebarStore();
  
  // Use guest constants
  const signOut = GUEST_SIGN_OUT;
  const displayName = GUEST_DISPLAY_NAME;
  const displayEmail = GUEST_DISPLAY_EMAIL;
  const avatarUrl = GUEST_AVATAR_URL;

  const { currentUser } = useDashboardData();
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);


  const toggleAccordion = (label: string) => {
    setOpenAccordions(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isRouteActive = (href?: string, subItems?: SubItem[]) => {
    if (!pathname) return false;
    if (href === "/me" && pathname === "/me") return true;
    if (href && href !== "/me" && pathname.startsWith(href)) return true;
    if (subItems && subItems.some(sub => pathname.startsWith(sub.href))) return true;
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-2xl lg:shadow-none
          w-[240px] lg:w-[72px] xl:w-[240px]
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="h-[72px] min-h-[72px] flex items-center px-4 border-b border-slate-200 dark:border-slate-800 relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <Link href="/dashboard" className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
            <div className="flex-1 flex flex-col justify-center overflow-hidden lg:hidden xl:flex transition-opacity duration-300">
              <span className="text-[14px] font-bold text-slate-900 dark:text-white truncate">
                {mounted ? (currentUser.companyName || "CircleWorks") : "CircleWorks"}
              </span>
              <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1">
                Employee Portal
              </span>
            </div>
          </Link>

          {/* Tooltip for 72px state */}
          <div className="absolute left-[78px] px-2 py-1 bg-slate-800 text-white text-[12px] font-medium rounded opacity-0 invisible lg:group-hover:opacity-100 lg:group-hover:visible xl:hidden z-50 whitespace-nowrap shadow-lg">
            Employee Portal
          </div>
        </div>

        {/* NAV ITEMS */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <nav className="flex flex-col gap-1 px-3">
            {EMPLOYEE_NAV.map((item, idx) => {
              if (item.isDivider) {
                return <div key={`div-${idx}`} className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2 lg:mx-0 xl:mx-2" />;
              }

              const active = isRouteActive(item.href, item.subItems);
              const hasSubItems = !!item.subItems?.length;
              const isAccordionOpen = openAccordions[item.label];

              const ItemContent = () => (
                <div className="flex items-center w-full relative group/item">
                  <item.icon
                    size={20}
                    className={`flex-shrink-0 lg:mx-auto xl:mx-0 ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200"}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {/* Tooltip for 72px state */}
                  <div className="absolute left-[56px] px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded opacity-0 invisible lg:group-hover/item:opacity-100 lg:group-hover/item:visible xl:hidden z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                  <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden lg:hidden xl:flex">
                    <span className={`text-[14px] font-semibold truncate ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.badgeCount ? (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold px-1">
                          {item.badgeCount}
                        </span>
                      ) : null}
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
                      onClick={() => toggleAccordion(item.label)}
                      className={`relative flex items-center w-full min-h-[40px] rounded-lg px-2 group/btn transition-colors overflow-visible
                        ${active ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                      `}
                    >
                      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-[4px] bg-violet-600 dark:bg-violet-500 rounded-r-full" />}
                      <ItemContent />
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`relative flex items-center w-full min-h-[40px] rounded-lg px-2 group/btn transition-colors overflow-visible
                        ${active ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                      `}
                    >
                      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-[4px] bg-violet-600 dark:bg-violet-500 rounded-r-full" />}
                      <ItemContent />
                    </Link>
                  )}

                  {/* Accordion Sub-Items */}
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
                            {item.subItems!.map(sub => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className={`text-[13px] py-1.5 px-2 rounded-md font-medium transition-colors ${
                                    isSubActive
                                      ? "text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10"
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

        {/* Switch to Admin */}
        <div className="px-3 pb-2 lg:hidden xl:block">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 text-[13px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight size={14} className="text-slate-400" />
            Switch to Admin
          </Link>
        </div>

        {/* BOTTOM USER PROFILE */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center w-full group/user cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -m-2 transition-colors relative">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
              <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>

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
