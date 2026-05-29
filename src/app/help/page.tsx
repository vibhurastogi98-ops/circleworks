"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import PlatformContent from "@/components/app/PlatformContent";

type Article = {
  title: string;
  description: string;
  category: string;
  href: string;
  readTime: string;
  popular?: boolean;
};

const categories = [
  "All",
  "Payroll",
  "Employees",
  "Hiring",
  "Benefits",
  "Time",
  "Expenses",
  "Compliance",
  "Settings",
];

const articles: Article[] = [
  {
    title: "Run payroll for the current pay period",
    description: "Review payroll inputs, resolve blocking checks, approve, and submit a run.",
    category: "Payroll",
    href: "/payroll/run",
    readTime: "6 min",
    popular: true,
  },
  {
    title: "Fix a payroll draft before approval",
    description: "Find missing bank details, hours, reimbursements, and tax setup errors.",
    category: "Payroll",
    href: "/payroll/history",
    readTime: "4 min",
  },
  {
    title: "Invite an employee and complete onboarding",
    description: "Send an invite, collect profile details, documents, and payroll setup.",
    category: "Employees",
    href: "/employees",
    readTime: "5 min",
    popular: true,
  },
  {
    title: "Move a candidate from offer to pre-hire",
    description: "Use hiring approvals, offer records, and onboarding handoff steps.",
    category: "Hiring",
    href: "/hiring",
    readTime: "5 min",
  },
  {
    title: "Approve time cards and resolve exceptions",
    description: "Review pending approvals, overtime warnings, and missing punch notes.",
    category: "Time",
    href: "/time",
    readTime: "4 min",
  },
  {
    title: "Review expense reports awaiting approval",
    description: "Check receipts, policy flags, reimbursement timing, and export status.",
    category: "Expenses",
    href: "/expenses",
    readTime: "3 min",
  },
  {
    title: "Handle critical compliance alerts",
    description: "Prioritize alerts, assign owners, and keep an audit-ready resolution trail.",
    category: "Compliance",
    href: "/compliance/dashboard",
    readTime: "7 min",
    popular: true,
  },
  {
    title: "Update company settings and billing access",
    description: "Manage EIN-protected fields, admins, billing roles, and workspace defaults.",
    category: "Settings",
    href: "/settings/company",
    readTime: "4 min",
  },
  {
    title: "Manage benefits enrollment changes",
    description: "Track qualifying life events, open enrollment tasks, and carrier exports.",
    category: "Benefits",
    href: "/benefits",
    readTime: "5 min",
  },
];

const quickActions = [
  {
    title: "Open support ticket",
    description: "Send payroll, HR, or compliance questions to the support team.",
    href: "/contact",
    icon: LifeBuoy,
  },
  {
    title: "View system status",
    description: "Check platform availability and recent incidents.",
    href: "/status",
    icon: CheckCircle2,
  },
  {
    title: "Restart product tour",
    description: "Walk through sidebar, search, notifications, and profile controls.",
    action: "tour",
    icon: Sparkles,
  },
];

const supportChannels = [
  {
    title: "Chat",
    detail: "Monday-Friday, 9am-6pm ET",
    icon: MessageCircle,
  },
  {
    title: "Email",
    detail: "support@circleworks.com",
    href: "mailto:support@circleworks.com",
    icon: Mail,
  },
  {
    title: "Phone",
    detail: "Priority support for Pro and Enterprise",
    href: "tel:+18005550198",
    icon: Phone,
  },
];

const issueTypes = [
  {
    title: "Payroll blocked",
    detail: "Check missing bank accounts, unapproved time, tax setup, and contractor forms.",
    icon: ShieldAlert,
  },
  {
    title: "Employee stuck",
    detail: "Review invite status, onboarding tasks, I-9 steps, and profile completion.",
    icon: UserRoundCheck,
  },
  {
    title: "Approval overdue",
    detail: "Use Time, Expenses, and Compliance queues to find pending owner action.",
    icon: Clock3,
  },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;
      const searchable = `${article.title} ${article.description} ${article.category}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, selectedCategory]);

  const restartTour = () => {
    window.localStorage.removeItem("tour_completed");
    window.dispatchEvent(new CustomEvent("circleworks:start-tour"));
  };

  return (
    <PlatformContent>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              <HelpCircle className="h-3.5 w-3.5" />
              Help center
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Find answers and keep work moving
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Search product guides, jump into common workflows, or contact support from one place.
            </p>

            <label className="mt-6 flex h-12 w-full max-w-2xl items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-500 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-900">
              <Search className="h-5 w-5 shrink-0" />
              <span className="sr-only">Search help center</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search payroll, employees, compliance, settings..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-blue-600" />
                </>
              );

              if (item.action === "tour") {
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={restartTour}
                    className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href || "#"}
                  className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cx(
                  "h-9 rounded-full border px-4 text-sm font-semibold transition",
                  selectedCategory === category
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-400 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:text-blue-300",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Help articles
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filteredArticles.length} result{filteredArticles.length === 1 ? "" : "s"}
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-slate-400" />
            </div>

            {filteredArticles.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className="group grid gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                          {article.title}
                        </span>
                        {article.popular ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            Popular
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {article.description}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                      <span>{article.category}</span>
                      <span>{article.readTime}</span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                  No articles found
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Try a different search term or category.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Common issues
            </h2>
            <div className="mt-4 space-y-3">
              {issueTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Contact support
            </h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {supportChannels.map((channel) => {
                const Icon = channel.icon;
                const row = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-950 dark:text-white">
                        {channel.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                        {channel.detail}
                      </span>
                    </span>
                  </>
                );

                return channel.href ? (
                  <Link
                    key={channel.title}
                    href={channel.href}
                    className="flex gap-3 py-3 transition hover:text-blue-600"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={channel.title} className="flex gap-3 py-3">
                    {row}
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </PlatformContent>
  );
}
