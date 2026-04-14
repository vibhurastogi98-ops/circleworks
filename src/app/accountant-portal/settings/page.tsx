"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Bell, Shield, Globe, Building2,
  Mail, Key, Smartphone, ChevronRight
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    category: "Account",
    items: [
      { label: "Profile & Preferences", description: "Name, email, timezone, language", icon: User, color: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" },
      { label: "Notifications", description: "Email, SMS, and push notification preferences", icon: Bell, color: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400" },
      { label: "Security", description: "Password, 2FA, login sessions", icon: Shield, color: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    ],
  },
  {
    category: "Practice",
    items: [
      { label: "Firm Details", description: "Firm name, address, branding", icon: Building2, color: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400" },
      { label: "Email Templates", description: "Customize client communication templates", icon: Mail, color: "bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400" },
      { label: "API Access", description: "Manage API keys and integrations", icon: Key, color: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
      { label: "Connected Apps", description: "QuickBooks, Xero, and other integrations", icon: Globe, color: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400" },
    ],
  },
];

export default function AccountantSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Manage your account, practice settings, and integrations.
        </p>
      </div>

      {SETTINGS_SECTIONS.map((section, si) => (
        <motion.div
          key={section.category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1, duration: 0.4 }}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
            {section.category}
          </h2>
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/40">
            {section.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
