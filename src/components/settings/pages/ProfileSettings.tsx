"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Shield, Mail, Building, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Guest Mode: Profile editing is disabled in the demo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={32} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin User</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">System Administrator</p>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">admin@circleworks.com</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
                <Building size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">CircleWorks HQ</span>
             </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" /> Account Security
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your account is secured with Guest Mode defaults. Multi-factor authentication is simulated for this session.
           </p>
           <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</span>
                 <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Auth Provider</span>
                 <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Guest Session</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
