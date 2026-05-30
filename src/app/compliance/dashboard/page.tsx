"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Info,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  calculateComplianceHealthScore,
  complianceAlertsLiveSeed,
  complianceFilingDeadlines,
  complianceStatusCards,
  sortComplianceAlerts,
  type ComplianceAlertItem,
  type ComplianceSeverity,
} from "@/data/complianceModule";

const severityClasses: Record<ComplianceSeverity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  warning:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
};

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getComplianceDashboardData() {
  await wait();
  return {
    alerts: complianceAlertsLiveSeed,
    filings: complianceFilingDeadlines,
    statusCards: complianceStatusCards,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function useComplianceAlertStream(initialAlerts: ComplianceAlertItem[]) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [connection, setConnection] = useState<"connecting" | "connected" | "demo" | "offline">("connecting");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_COMPLIANCE_WS_URL;

    if (!wsUrl) {
      setConnection("demo");
      const timer = window.setInterval(() => {
        setLastUpdated(new Date());
      }, 15000);
      return () => window.clearInterval(timer);
    }

    const socket = new WebSocket(wsUrl);
    socket.addEventListener("open", () => setConnection("connected"));
    socket.addEventListener("close", () => setConnection("offline"));
    socket.addEventListener("error", () => setConnection("offline"));
    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as
          | { type: "alerts"; alerts: ComplianceAlertItem[] }
          | { type: "alert"; alert: ComplianceAlertItem };
        if (payload.type === "alerts") {
          setAlerts(payload.alerts);
        }
        if (payload.type === "alert") {
          setAlerts((current) => sortComplianceAlerts([payload.alert, ...current]));
        }
        setLastUpdated(new Date());
      } catch {
        setConnection("offline");
      }
    });

    return () => socket.close();
  }, []);

  return {
    alerts: sortComplianceAlerts(alerts),
    connection,
    lastUpdated,
  };
}

function HealthGauge({ score }: { score: number }) {
  const radius = 52;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 60 ? "#dc2626" : score <= 80 ? "#f97316" : "#16a34a";
  const label = score < 60 ? "At risk" : score <= 80 ? "Needs attention" : "Healthy";

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 112 112" aria-label={`Compliance health score ${score}`}>
          <circle
            cx="56"
            cy="56"
            r={normalizedRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="56"
            cy="56"
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-950 dark:text-white">{score}</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Score</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Compliance Health Score</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{label}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
          Weighted from open critical, warning, and informational alerts. Resolve critical items first to recover the
          score fastest.
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse lg:col-span-2" />
        <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function ComplianceDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "dashboard"],
    queryFn: getComplianceDashboardData,
  });

  const initialAlerts = data?.alerts ?? [];
  const { alerts, connection, lastUpdated } = useComplianceAlertStream(initialAlerts);
  const healthScore = useMemo(() => calculateComplianceHealthScore(alerts), [alerts]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Compliance dashboard data could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Compliance</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Compliance Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            I-9, E-Verify, EEO-1, OSHA, labor law, ACA, and filing risk in one operational view.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Radio size={14} className={connection === "offline" ? "text-red-500" : "text-green-500"} />
          {connection === "demo" ? "WebSocket demo stream" : `WebSocket ${connection}`}
          <span className="font-medium text-slate-400">Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {data.statusCards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
              <span
                className={
                  card.status === "healthy"
                    ? "h-2.5 w-2.5 rounded-full bg-green-500"
                    : card.status === "attention"
                      ? "h-2.5 w-2.5 rounded-full bg-orange-500"
                      : "h-2.5 w-2.5 rounded-full bg-red-500"
                }
              />
            </div>
            <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{card.metric}</p>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Alerts Panel</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sorted by severity, then due date. Critical items always float to the top.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw size={15} />
              Refresh
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity];
              return (
                <div key={alert.id} className="grid gap-4 p-5 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:items-center">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${severityClasses[alert.severity]}`}
                    >
                      <Icon size={13} />
                      {alert.severity}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{alert.description}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Affected: {alert.affectedEmployees.join(", ")} · Due {formatDate(alert.dueDate)}
                    </p>
                  </div>
                  <Link href={alert.href} className="lg:justify-self-end">
                    <Button size="sm">
                      {alert.ctaLabel}
                      <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <HealthGauge score={healthScore} />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {(["critical", "warning", "info"] as ComplianceSeverity[]).map((severity) => (
              <div key={severity} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-bold uppercase text-slate-500">{severity}</p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {alerts.filter((alert) => alert.severity === severity).length}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-600" />
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Upcoming Filings Calendar</h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Next 60 days</span>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {data.filings.map((filing) => (
            <div key={filing.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {filing.type}
                  </p>
                  <h3 className="mt-1 font-black text-slate-950 dark:text-white">{filing.title}</h3>
                </div>
                <span
                  className={
                    filing.status === "ready"
                      ? "rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                      : filing.status === "needs_review"
                        ? "rounded-full bg-orange-100 px-2 py-1 text-[11px] font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                        : "rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }
                >
                  {filing.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{filing.jurisdiction} · {filing.owner}</span>
                <span className="font-bold text-slate-950 dark:text-white">{formatDate(filing.dueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck size={16} className="text-green-600" />
          Compliance module sources are linked inside each detail screen. This dashboard is an operational tracker, not
          legal advice.
        </div>
      </section>

      <div className="hidden items-center gap-2 text-xs text-slate-400" aria-hidden="true">
        <Activity size={12} />
        <FileCheck2 size={12} />
        <CheckCircle2 size={12} />
      </div>
    </div>
  );
}
