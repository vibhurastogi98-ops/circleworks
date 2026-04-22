"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, Plus, ChevronRight, ChevronDown,
  Users, LogOut, Moon, Sun, Bell, Settings, LayoutGrid,
  ArrowLeft, Menu, X, CheckCircle2
} from "lucide-react";

import { usePlatformStore } from "@/store/usePlatformStore";


interface ClientCompany {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  employeeCount: number;
  status: "on_time" | "action_required" | "issue";
  statusLabel: string;
}

const STATUS_CONFIG = {
  on_time: { color: "bg-emerald-500", ring: "ring-emerald-500/20", label: "On Time" },
  action_required: { color: "bg-amber-500", ring: "ring-amber-500/20", label: "Action Needed" },
  issue: { color: "bg-red-500", ring: "ring-red-500/20", label: "Issue" },
};

export default function AccountantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Guest Mode: Authentication disabled
  const signOut = (options?: { redirectUrl?: string }) => { window.location.href = options?.redirectUrl || "/"; };

  const { isDarkMode, toggleDarkMode } = usePlatformStore();
  const [clients, setClients] = useState<ClientCompany[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Hardcoded guest accountant info
  const displayName = "Senior Accountant";
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=Accountant&backgroundColor=transparent`;


  useEffect(() => {
    setMounted(true);
    // Sync dark mode  
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch("/api/accountant/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {});
  }, []);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { label: "Dashboard", href: "/accountant-portal", icon: LayoutGrid },
    { label: "Approvals", href: "/accountant-portal/approvals", icon: CheckCircle2 },
    { label: "Settings", href: "/accountant-portal/settings", icon: Settings },
  ];

  const isNavActive = (href: string) => pathname === href;

  return (
    
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ─── LEFT SIDEBAR: Client List ─── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 shadow-2xl lg:shadow-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Sidebar Header */}
          <div className="h-[72px] min-h-[72px] flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            <Link href="/accountant-portal" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <Building2 size={18} className="text-white" />
              </div>
              <div>
                <span className="text-[15px] font-bold text-slate-900 dark:text-white block leading-tight">
                  Accountant Portal
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  CircleWorks
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <div className="px-3 pt-4 pb-2">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-800 mx-4 my-1" />

          {/* Client Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                My Clients
              </span>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {clients.length}
              </span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[32px] pl-8 pr-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-800 text-[12px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <div className="flex flex-col gap-0.5">
              {filteredClients.map((client) => {
                const statusConf = STATUS_CONFIG[client.status];
                return (
                  <Link
                    key={client.id}
                    href={`/c/${client.slug}/dashboard`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors">
                      <img src={client.logoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Users size={10} className="text-slate-400" />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {client.employeeCount}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.color} ring-2 ${statusConf.ring}`} />
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
              {filteredClients.length === 0 && searchQuery && (
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-slate-400">No clients matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom User Section */}
          <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{displayName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Accountant</div>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  My Clients
                </h1>
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <span className="hidden sm:inline text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {clients.length} companies managed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {}}
                className="hidden sm:flex h-9 px-4 items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Add Client
              </button>

              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main id="main-content" className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    
  );
}
