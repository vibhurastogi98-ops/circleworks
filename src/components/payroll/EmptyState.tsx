"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Users, Shield, Sparkles } from "lucide-react";

export default function PayrollEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-950/30"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-violet-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center text-center px-6 py-16 sm:py-20">
        {/* Illustration */}
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: -5 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 3,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800 animate-[spin_20s_linear_infinite]" />

            {/* Inner circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 flex items-center justify-center">
              <div className="relative">
                <DollarSign
                  size={48}
                  className="text-blue-500 dark:text-blue-400"
                  strokeWidth={1.5}
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles
                    size={16}
                    className="text-cyan-400 dark:text-cyan-300"
                  />
                </motion.div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
              className="absolute -right-2 top-4 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shadow-sm"
            >
              <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.8 }}
              className="absolute -left-2 bottom-4 w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center shadow-sm"
            >
              <Shield size={18} className="text-violet-600 dark:text-violet-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Welcome to Payroll
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-2">
          You haven&apos;t run your first payroll yet. Set up your company, add
          employees, and get paid in minutes.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-8">
          CircleWorks handles tax calculations, direct deposits, and compliance
          filings automatically.
        </p>

        {/* CTA */}
        <Link
          href="/payroll/setup"
          id="payroll-setup-cta"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 group"
        >
          Set up your first payroll
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        {/* Feature chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {["All 50 states", "Auto tax filing", "Direct deposit", "Free setup"].map(
            (feature) => (
              <span
                key={feature}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              >
                ✓ {feature}
              </span>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
