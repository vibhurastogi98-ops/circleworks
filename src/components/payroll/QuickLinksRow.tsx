"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Repeat,
  Briefcase,
  CalendarClock,
  Building2,
  Scale,
  ArrowUpRight,
} from "lucide-react";

interface QuickLink {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Off-cycle Payroll",
    description: "Run bonus or correction",
    href: "/payroll/off-cycle",
    icon: Repeat,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    label: "Contractor Payments",
    description: "Pay 1099 contractors",
    href: "/payroll/contractors",
    icon: Briefcase,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  {
    label: "Pay Schedules",
    description: "Manage pay frequencies",
    href: "/payroll/schedule",
    icon: CalendarClock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    label: "Tax Setup",
    description: "Federal & state tax config",
    href: "/payroll/tax-setup",
    icon: Building2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    label: "Garnishments",
    description: "Court-ordered deductions",
    href: "/payroll/garnishments",
    icon: Scale,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
  },
];

export default function QuickLinksRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-950/30 p-6 sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        Quick Links
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Jump to commonly used payroll features
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {QUICK_LINKS.map((link, idx) => (
          <Link
            key={link.label}
            href={link.href}
            className="group relative flex flex-col items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 p-4 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div
              className={`w-9 h-9 rounded-lg ${link.bgColor} flex items-center justify-center`}
            >
              <link.icon size={18} className={link.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {link.label}
                <ArrowUpRight
                  size={13}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
                />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
