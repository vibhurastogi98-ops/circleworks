"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";

import {
  feedbackTimeline,
  mockReviewCycles,
  okrTree,
  performanceKpis,
  recognitionWall,
  reviewTasks,
  getOkrProgress,
} from "@/data/mockPerformance";
import { formatDate } from "@/utils/formatDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const toneClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/30",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30",
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-400/30",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/30",
};

function percent(completed: number, total: number) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

export default function PerformanceDashboard() {
  const overviewQuery = useQuery({
    queryKey: ["performance-overview"],
    queryFn: async () => ({
      activeCycle: mockReviewCycles.find((cycle) => cycle.status === "Active") || mockReviewCycles[0],
      kpis: performanceKpis,
      reviewTasks,
      recognitionWall,
      feedbackTimeline,
      companyOkrProgress: getOkrProgress(okrTree[0]),
    }),
  });

  if (overviewQuery.isLoading || !overviewQuery.data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-72 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const { activeCycle, kpis, companyOkrProgress } = overviewQuery.data;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
            Performance Management
          </p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Performance Overview</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track review cycles, OKR progress, feedback, and recognition across the company.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/performance/reviews"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ClipboardList size={16} />
            Reviews
          </Link>
          <Link
            href="/performance/okrs"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Target size={16} />
            Manage OKRs
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <Badge className={toneClasses[kpi.tone]}>{kpi.label}</Badge>
                {kpi.tone === "blue" ? (
                  <ClipboardList size={20} className="text-blue-500" />
                ) : kpi.tone === "emerald" ? (
                  <Target size={20} className="text-emerald-500" />
                ) : kpi.tone === "purple" ? (
                  <MessageSquareText size={20} className="text-purple-500" />
                ) : (
                  <Award size={20} className="text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{kpi.value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{kpi.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Active Cycle</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {activeCycle.name} · {activeCycle.period}
              </p>
            </div>
            <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
              {activeCycle.completed}/{activeCycle.participants} completed
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-700 dark:text-slate-200">Total participation</span>
                  <span className="text-blue-600 dark:text-blue-300">{activeCycle.completion}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${activeCycle.completion}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-black text-slate-950 dark:text-white">{activeCycle.completed}</p>
                    <p className="text-[11px] font-bold uppercase text-slate-500">Complete</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-950 dark:text-white">
                      {activeCycle.participants - activeCycle.completed}
                    </p>
                    <p className="text-[11px] font-bold uppercase text-slate-500">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-950 dark:text-white">{companyOkrProgress}%</p>
                    <p className="text-[11px] font-bold uppercase text-slate-500">OKR Avg</p>
                  </div>
                </div>
              </div>
              <Link
                href={`/performance/reviews/${activeCycle.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Open Cycle Detail
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <BarChart3 size={18} className="text-blue-600" />
                Participation by department
              </div>
              <div className="space-y-3">
                {activeCycle.participation.map((datum) => (
                  <div key={datum.label} className="grid grid-cols-[116px_1fr_52px] items-center gap-3">
                    <span className="truncate text-xs font-bold text-slate-600 dark:text-slate-300">{datum.label}</span>
                    <div className="h-8 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                      <div
                        className="flex h-full items-center justify-end rounded-md bg-blue-600 pr-2 text-[10px] font-black text-white"
                        style={{ width: `${percent(datum.completed, datum.total)}%` }}
                      >
                        {datum.completed}
                      </div>
                    </div>
                    <span className="text-right text-xs font-bold text-slate-500">
                      {percent(datum.completed, datum.total)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review work that needs your attention.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Due {formatDate(task.dueDate)} · {task.detail}
                  </p>
                </div>
                <Link
                  href={task.href}
                  className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Start
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackTimeline.slice(0, 3).map((entry) => (
              <div key={entry.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{entry.type}</Badge>
                  <span className="text-xs font-medium text-slate-500">{formatDate(entry.date)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{entry.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recognition Wall</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recognitionWall.map((recognition) => (
              <div key={recognition.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                  <Sparkles size={16} className="text-amber-500" />
                  {recognition.from} to {recognition.to}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{recognition.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(recognition.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold dark:border-slate-700"
                      type="button"
                    >
                      {emoji} {count}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/performance/feedback"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-300"
            >
              Open feedback hub <CheckCircle2 size={16} />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

