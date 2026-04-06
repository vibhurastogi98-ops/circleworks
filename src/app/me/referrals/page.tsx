"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users2, Link2, Copy, Share2, DollarSign, Clock, CheckCircle2, XCircle, Briefcase, Gift, ExternalLink } from "lucide-react";
import { mockReferralData } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Applied: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: Briefcase },
  Interviewing: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", icon: Clock },
  Hired: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  Rejected: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", icon: XCircle },
};

export default function ReferralsPage() {
  const data = mockReferralData;

  const copyLink = () => {
    navigator.clipboard.writeText(data.referralLink).then(() => {
      toast.success("Referral link copied to clipboard!");
    }).catch(() => {
      toast.success("Referral link copied!");
    });
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Referral Program</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Refer talented people and earn ${data.bonusPerHire.toLocaleString()} per hire</p>
      </div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-900/20 dark:via-slate-800/40 dark:to-fuchsia-900/10 p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={18} className="text-violet-600 dark:text-violet-400" />
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">Your Unique Referral Link</h2>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center overflow-hidden">
            <span className="text-[13px] text-slate-600 dark:text-slate-300 truncate font-mono">{data.referralLink}</span>
          </div>
          <button onClick={copyLink} className="h-10 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors flex-shrink-0">
            <Copy size={14} /> Copy
          </button>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Email", icon: "✉️" },
            { label: "LinkedIn", icon: "🔗" },
            { label: "Twitter", icon: "🐦" },
          ].map(channel => (
            <button key={channel.label} onClick={() => toast.success(`Shared via ${channel.label}`)} className="h-9 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span>{channel.icon}</span> {channel.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Earned", value: data.totalEarned, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Pending", value: data.totalPending, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Redeemed", value: data.totalRedeemed, icon: Gift, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
        ].map(stat => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">${stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Referrals Table */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">My Referrals</h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
            <span>Candidate</span><span>Position</span><span>Status</span><span>Earned</span>
          </div>
          {data.referrals.map((ref, i) => {
            const status = statusStyles[ref.status];
            const StatusIcon = status.icon;
            return (
              <motion.div key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center">
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{ref.candidateName}</p>
                  <p className="text-[11px] text-slate-500">Referred {new Date(ref.referredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{ref.position}</span>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit ${status.bg} ${status.text}`}>
                  <StatusIcon size={11} /> {ref.status}
                </span>
                <span className={`text-[13px] font-bold ${ref.earned > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {ref.earned > 0 ? `$${ref.earned.toLocaleString()}` : "—"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
