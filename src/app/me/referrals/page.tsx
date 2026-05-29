"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Users,
  X,
} from "lucide-react";

import { useEmployeeSelfService } from "@/hooks/useEmployeePortal";

type ReferralStatus = "Pending" | "Signed Up" | "Qualified" | "Paid Out";

const statusStyles: Record<
  ReferralStatus,
  { classes: string; icon: React.ElementType }
> = {
  Pending: {
    classes:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: Clock3,
  },
  "Signed Up": {
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300",
    icon: CheckCircle2,
  },
  Qualified: {
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
    icon: BadgeDollarSign,
  },
  "Paid Out": {
    classes:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300",
    icon: BadgeDollarSign,
  },
};

const faqs = [
  {
    question: "When do I get my credit?",
    answer:
      "Your $300 account credit is applied after your referral completes their first paid payroll run.",
  },
  {
    question: "Is there a limit?",
    answer:
      "No. You can refer as many qualified companies as you want, and every qualifying referral earns credit.",
  },
  {
    question: "What if my referral cancels?",
    answer:
      "Credits are only earned after the referred company runs their first paid payroll. If they cancel before that milestone, the referral stays unqualified.",
  },
];

function encode(value: string) {
  return encodeURIComponent(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ReferralsPage() {
  const { data: portalData } = useEmployeeSelfService();
  const data = portalData.referrals;
  const [copied, setCopied] = useState(false);

  const shareText = `Try CircleWorks for payroll and HR: ${data.referralLink}`;
  const shareButtons = useMemo(
    () => [
      {
        label: "Email",
        icon: Mail,
        href: `mailto:?subject=${encode("Try CircleWorks")}&body=${encode(shareText)}`,
      },
      {
        label: "LinkedIn",
        icon: Share2,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(data.referralLink)}`,
        external: true,
      },
      {
        label: "Twitter/X",
        icon: X,
        href: `https://twitter.com/intent/tweet?text=${encode(shareText)}`,
        external: true,
      },
      {
        label: "WhatsApp",
        icon: MessageCircle,
        href: `https://wa.me/?text=${encode(shareText)}`,
        external: true,
      },
    ],
    [data.referralLink, shareText],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.referralLink);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalReferrals = data.referrals.length;

  return (
    <>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">
          Referral Portal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Refer companies. Track rewards.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Share CircleWorks with companies that need better payroll and HR. You earn{" "}
          {formatCurrency(data.bonusPerReferral)} account credit when a referral runs
          their first paid payroll.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900"
      >
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-blue-600 dark:text-blue-300" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Your unique referral link
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Your referral gets 1 month free on Pro. You get credit after their
              first paid payroll run.
            </p>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 dark:bg-blue-900/25 dark:text-blue-300">
            No referral limit
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex min-h-12 flex-1 items-center overflow-hidden rounded-xl bg-gray-100 px-4 dark:bg-slate-800">
            <span className="truncate font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {data.referralLink}
            </span>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shareButtons.map((button) => (
            <a
              key={button.label}
              href={button.href}
              target={button.external ? "_blank" : undefined}
              rel={button.external ? "noreferrer" : undefined}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <button.icon size={15} />
              {button.label}
            </a>
          ))}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            label: "Total Credits Earned",
            value: formatCurrency(data.totalEarned),
            icon: BadgeDollarSign,
            tone: "text-emerald-600 dark:text-emerald-300",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "Pending Credits",
            value: formatCurrency(data.totalPending),
            icon: Clock3,
            tone: "text-orange-600 dark:text-orange-300",
            bg: "bg-orange-50 dark:bg-orange-900/20",
          },
          {
            label: "Total Referrals",
            value: String(totalReferrals),
            icon: Users,
            tone: "text-blue-600 dark:text-blue-300",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/40"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.tone}`} aria-hidden="true" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className={`mt-2 text-3xl font-black ${stat.tone}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/40">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700/40">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Status Table
          </h2>
        </div>
        <div className="hidden grid-cols-[1.25fr_160px_160px_150px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[12px] font-black uppercase tracking-wide text-slate-500 dark:border-slate-700/40 dark:bg-slate-800/80 lg:grid">
          <span>Company Name</span>
          <span>Status</span>
          <span>Date Referred</span>
          <span className="text-right">Amount Earned</span>
        </div>
        {data.referrals.map((referral, index) => {
          const status = statusStyles[referral.status as ReferralStatus];
          const StatusIcon = status.icon;
          const date = new Date(referral.referredAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-700/30 lg:grid-cols-[1.25fr_160px_160px_150px] lg:items-center"
            >
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {referral.companyName}
                </p>
                <p className="mt-1 text-xs text-slate-500 lg:hidden">Referred {date}</p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${status.classes}`}
              >
                <StatusIcon size={13} />
                {referral.status}
              </span>
              <span className="hidden text-sm font-semibold text-slate-600 dark:text-slate-300 lg:block">
                {date}
              </span>
              <span
                className={`text-sm font-black lg:text-right ${
                  referral.earned > 0
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {formatCurrency(referral.earned)}
              </span>
            </motion.div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/60 dark:bg-slate-800/40">
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          Terms and FAQ
        </h2>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/50">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-slate-900 dark:text-white">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Credits apply to your monthly subscription. Cash out after $600 accumulated
          every 2 referrals. CircleWorks may review referrals for eligibility and
          fraud prevention.
        </p>
      </section>
    </>
  );
}
