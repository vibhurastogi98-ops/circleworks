"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Eye as EyeIcon, Wallet, PiggyBank, Umbrella, Users, AlertTriangle } from "lucide-react";
import { mockBenefitCards, mockDependents } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const typeIcons: Record<string, React.ElementType> = {
  Medical: Heart, Dental: Shield, Vision: EyeIcon, "401(k)": PiggyBank, FSA: Wallet, Life: Umbrella,
};

const typeColors: Record<string, { bg: string; text: string }> = {
  Medical: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400" },
  Dental: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
  Vision: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400" },
  "401(k)": { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
  FSA: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
  Life: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
};

export default function BenefitsPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Benefits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your enrolled plans and coverage details</p>
        </div>
        <button
          onClick={() => toast("Open enrollment begins on November 1", { icon: <Heart className="w-4 h-4 text-rose-500" /> })}
          className="h-10 px-5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[13px] font-bold flex items-center gap-2 cursor-not-allowed opacity-60 w-fit"
          disabled
        >
          Make Changes (Open Enrollment Only)
        </button>
      </div>

      {/* Benefit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBenefitCards.map((card, i) => {
          const Icon = typeIcons[card.type] || Heart;
          const colors = typeColors[card.type] || typeColors.Medical;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon size={20} className={colors.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">{card.type}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{card.carrier}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {card.status}
                  </span>
                </div>

                <p className="text-[13px] font-semibold text-slate-900 dark:text-white mb-1">{card.planName}</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">Coverage: {card.coverageLevel}</p>

                {card.deductible != null && (
                  <div className="flex items-center gap-4 text-[12px] mb-3">
                    <div>
                      <span className="text-slate-500">Deductible</span>
                      <p className="font-bold text-slate-900 dark:text-white">${card.deductible.toLocaleString()}</p>
                    </div>
                    {card.oopMax != null && (
                      <div>
                        <span className="text-slate-500">OOP Max</span>
                        <p className="font-bold text-slate-900 dark:text-white">${card.oopMax.toLocaleString()}</p>
                      </div>
                    )}
                    {card.cardNumber && (
                      <div>
                        <span className="text-slate-500">Card #</span>
                        <p className="font-bold text-slate-900 dark:text-white">{card.cardNumber}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details */}
                {card.details && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/40">
                    {Object.entries(card.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-[12px]">
                        <span className="text-slate-500 dark:text-slate-400">{key}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/40">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Employee Premium: <span className="font-bold text-slate-900 dark:text-white">${card.employeePremium.toFixed(2)}/pay period</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dependents */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Users size={16} className="text-violet-500" /> Dependents
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
          {mockDependents.map((dep, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 text-[13px] font-bold">
                {dep.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">{dep.name}</p>
                <p className="text-[11px] text-slate-500">{dep.relationship} · DOB: {new Date(dep.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-1">
                {dep.coverageTypes.map(ct => (
                  <span key={ct} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {ct}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
