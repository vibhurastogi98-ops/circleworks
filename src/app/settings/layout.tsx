"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SETTINGS_NAV_ITEMS } from "@/config/settingsNavigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/settings/company";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">Settings</h2>
            {SETTINGS_NAV_ITEMS.map((tab) => {
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
