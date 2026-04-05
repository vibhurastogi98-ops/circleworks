"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { User, Shield, Key, Bell } from "lucide-react";

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
          Manage your personal information, security preferences, and account settings.
        </p>
      </div>

      <div className="flex justify-center md:justify-start">
        <UserProfile 
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full shadow-none",
              card: "shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900",
              navbar: "hidden md:flex",
              headerTitle: "text-2xl font-bold text-slate-900 dark:text-white",
              headerSubtitle: "text-slate-500 dark:text-slate-400",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 transition-colors uppercase tracking-widest text-xs font-black",
            }
          }}
        />
      </div>
    </motion.div>
  );
}
