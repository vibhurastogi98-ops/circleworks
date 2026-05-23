"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  Send,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useEmployeeSelfService } from "@/hooks/useEmployeePortal";

const statusStyles: Record<
  string,
  { classes: string; icon: React.ElementType }
> = {
  Invited: {
    classes:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: Send,
  },
  "Signed Up": {
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    icon: CheckCircle2,
  },
  "First Payroll Pending": {
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    icon: Clock,
  },
  "Credit Earned": {
    classes:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    icon: BadgeDollarSign,
  },
};

function encode(value: string) {
  return encodeURIComponent(value);
}

export default function ReferralsPage() {
  const { data: portalData } = useEmployeeSelfService();
  const data = portalData.referrals;
  const shareText = `Try CircleWorks for payroll and HR: ${data.referralLink}`;
  const emailHref = `mailto:?subject=${encode("Try CircleWorks")}&body=${encode(shareText)}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encode(data.referralLink)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encode(shareText)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.referralLink);
      toast.success("Referral link copied");
    } catch {
      toast.success("Referral link ready to share");
    }
  };

  const shareButtons = [
    { label: "Email", icon: Mail, href: emailHref },
    { label: "LinkedIn", icon: Share2, href: linkedInHref },
    { label: "Twitter", icon: X, href: twitterHref },
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Referral Program
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Refer a company. Earn ${data.bonusPerReferral.toLocaleString()}{" "}
          account credit.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20"
      >
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-blue-600 dark:text-blue-300" />
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
                Your unique referral link
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              You earn $300 account credit when your referred company completes
              their first payroll run.
            </p>
          </div>
          <div className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300">
            No limit on referrals
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex min-h-11 flex-1 items-center overflow-hidden rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            <span className="truncate font-mono text-[13px] text-slate-700 dark:text-slate-200">
              {data.referralLink}
            </span>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Copy size={15} />
            Copy
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shareButtons.map((button) => (
            <a
              key={button.label}
              href={button.href}
              target={button.label === "Email" ? undefined : "_blank"}
              rel={button.label === "Email" ? undefined : "noreferrer"}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <button.icon size={15} />
              {button.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Copy size={15} />
            Copy
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total credits earned",
            value: data.totalEarned,
            tone: "text-emerald-600 dark:text-emerald-300",
          },
          {
            label: "Pending credits",
            value: data.totalPending,
            tone: "text-amber-600 dark:text-amber-300",
          },
          {
            label: "Redeemed credits",
            value: data.totalRedeemed,
            tone: "text-blue-600 dark:text-blue-300",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700/60 dark:bg-slate-800/40"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className={`mt-2 text-3xl font-black ${stat.tone}`}>
              ${stat.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-800/40">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700/40">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
            Referral status
          </h2>
        </div>
        <div className="hidden grid-cols-[1fr_180px_120px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700/40 dark:bg-slate-800/80 sm:grid">
          <span>Company name</span>
          <span>Status</span>
          <span className="text-right">Earned</span>
        </div>
        {data.referrals.map((referral, index) => {
          const status = statusStyles[referral.status];
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="grid grid-cols-1 gap-2 border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-700/30 sm:grid-cols-[1fr_180px_120px] sm:items-center"
            >
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                  {referral.companyName}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Referred{" "}
                  {new Date(referral.referredAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${status.classes}`}
              >
                <StatusIcon size={12} />
                {referral.status}
              </span>
              <span
                className={`text-[13px] font-bold sm:text-right ${referral.earned > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400"}`}
              >
                {referral.earned > 0
                  ? `$${referral.earned.toLocaleString()}`
                  : "$0"}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-300">
        Referral credit applies within 30 days of first payroll run. See full
        referral terms. Credits apply to your subscription. Cash out after $600
        accumulated.
      </div>
    </>
  );
}
