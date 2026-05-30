"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarClock, Play, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  analyticsReportCards,
  analyticsReportSections,
  type AnalyticsReportCard,
} from "@/data/reportsAnalytics";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getReportsHubData() {
  await wait();
  return {
    sections: analyticsReportSections,
    cards: analyticsReportCards,
  };
}

function formatDate(date: string) {
  if (date === "Never") return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ReportsHubSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="h-52 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ScheduleDialog({
  report,
  onClose,
}: {
  report: AnalyticsReportCard | null;
  onClose: () => void;
}) {
  const [frequency, setFrequency] = useState("weekly");
  const [recipients, setRecipients] = useState("finance@circleworks.com");

  return (
    <Dialog open={Boolean(report)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>
            Send {report?.name ?? "this report"} by email on a recurring schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Frequency
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Recipients
            <Input value={recipients} onChange={(event) => setRecipients(event.target.value)} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            <CalendarClock size={16} />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportCard({
  report,
  isFavorite,
  onToggleFavorite,
  onSchedule,
}: {
  report: AnalyticsReportCard;
  isFavorite: boolean;
  onToggleFavorite: (reportId: string) => void;
  onSchedule: (report: AnalyticsReportCard) => void;
}) {
  const Icon = report.icon;

  return (
    <article className="flex min-h-[220px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon size={21} />
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(report.id)}
          className={`rounded-full p-2 transition ${
            isFavorite
              ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
              : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800"
          }`}
          aria-label={`Favorite ${report.name}`}
        >
          <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <h3 className="mt-4 text-base font-black text-slate-950 dark:text-white">{report.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{report.description}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        Last run: {formatDate(report.lastRun)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={report.href} className="col-span-2">
          <Button className="w-full">
            <Play size={15} />
            Run Report
          </Button>
        </Link>
        <Button variant="outline" onClick={() => onSchedule(report)}>
          <CalendarClock size={15} />
          Schedule
        </Button>
        <Button variant="outline" onClick={() => onToggleFavorite(report.id)}>
          <Star size={15} fill={isFavorite ? "currentColor" : "none"} />
          Favorite
        </Button>
      </div>
    </article>
  );
}

export default function ReportsHubPage() {
  const [query, setQuery] = useState("");
  const [scheduleReport, setScheduleReport] = useState<AnalyticsReportCard | null>(null);
  const [favorites, setFavorites] = useState(() => new Set(analyticsReportCards.filter((card) => card.favorite).map((card) => card.id)));

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "hub"],
    queryFn: getReportsHubData,
  });

  const cardsBySection = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const cards = data?.cards ?? [];
    return cards.filter((card) => {
      if (!normalizedQuery) return true;
      return (
        card.name.toLowerCase().includes(normalizedQuery) ||
        card.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [data?.cards, query]);

  const toggleFavorite = (reportId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  if (isLoading) return <ReportsHubSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Reports could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Analytics</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
            <BarChart3 size={28} className="text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Run pre-built payroll, people, time, expense, and custom reports. Export results, schedule recurring sends,
            and favorite the reports your team uses every week.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports..."
              className="pl-9"
            />
          </div>
          <Link href="/reports/custom">
            <Button className="w-full sm:w-auto">Build Your Own</Button>
          </Link>
        </div>
      </div>

      {data.sections.map((section) => {
        const sectionCards = cardsBySection.filter((card) => card.section === section.id);
        if (sectionCards.length === 0) return null;

        return (
          <section key={section.id} className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {sectionCards.length} reports
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sectionCards.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isFavorite={favorites.has(report.id)}
                  onToggleFavorite={toggleFavorite}
                  onSchedule={setScheduleReport}
                />
              ))}
            </div>
          </section>
        );
      })}

      <ScheduleDialog report={scheduleReport} onClose={() => setScheduleReport(null)} />
    </div>
  );
}
