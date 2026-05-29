"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  RefreshCw,
} from "lucide-react";

import type {
  ComponentStatus,
  StatusComponent,
  StatusPayload,
  StatusSeverity,
  UptimeDay,
} from "@/lib/status-monitor";

type SubscribeState = "idle" | "loading" | "success" | "error";

const statusStyles: Record<ComponentStatus, { badge: string; square: string }> = {
  Operational: {
    badge: "bg-green-50 text-green-700 ring-green-200",
    square: "bg-green-500",
  },
  "Degraded Performance": {
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    square: "bg-orange-400",
  },
  "Partial Outage": {
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    square: "bg-orange-500",
  },
  "Major Outage": {
    badge: "bg-red-50 text-red-700 ring-red-200",
    square: "bg-red-500",
  },
  Maintenance: {
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    square: "bg-blue-500",
  },
};

const severityStyles: Record<StatusSeverity, string> = {
  maintenance: "bg-blue-50 text-blue-700 ring-blue-200",
  minor: "bg-orange-50 text-orange-700 ring-orange-200",
  major: "bg-red-50 text-red-700 ring-red-200",
};

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = window.setInterval(callback, delay);
    return () => window.clearInterval(id);
  }, [callback, delay]);
}

function plural(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

function timeAgo(dateValue: string, now: Date) {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(dateValue).getTime()) / 1000),
  );

  if (seconds < 60) return plural(seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return plural(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  return plural(Math.floor(hours / 24), "day");
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatDateTime(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function getBannerConfig(payload: StatusPayload) {
  if (payload.overallStatus === "major") {
    return {
      icon: AlertTriangle,
      title: "Service Disruption",
      classes: "border-red-200 bg-red-50 text-red-700",
      iconClasses: "bg-red-100 text-red-700 ring-red-200",
    };
  }

  if (payload.overallStatus === "partial") {
    return {
      icon: AlertTriangle,
      title: "Partial Service Disruption",
      classes: "border-orange-200 bg-orange-50 text-orange-700",
      iconClasses: "bg-orange-100 text-orange-700 ring-orange-200",
    };
  }

  return {
    icon: CheckCircle2,
    title: "All Systems Operational",
    classes: "border-green-200 bg-green-50 text-green-700",
    iconClasses: "bg-green-100 text-green-700 ring-green-200",
  };
}

function StatusBadge({ status }: { status: ComponentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset ${statusStyles[status].badge}`}
    >
      {status}
    </span>
  );
}

function UptimeSquare({ day }: { day: UptimeDay }) {
  return (
    <div className="group relative h-6 w-2">
      <div
        className={`h-6 w-2 rounded-[2px] ${statusStyles[day.status].square}`}
        aria-label={`${formatDate(day.date)} ${day.status} ${day.uptime.toFixed(2)}% uptime`}
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-[#0A1628] p-3 text-left text-xs text-white shadow-xl group-hover:block">
        <p className="font-black">{formatDate(day.date)}</p>
        <p className="mt-1 text-slate-300">{day.status}</p>
        <p className="text-slate-300">{day.uptime.toFixed(2)}% uptime</p>
      </div>
    </div>
  );
}

function HistoryBar({ component }: { component: StatusComponent }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid min-w-[898px] grid-cols-[repeat(90,8px)] gap-x-0.5">
        {component.history.map((day) => (
          <UptimeSquare key={`${component.id}-${day.date}`} day={day} />
        ))}
      </div>
    </div>
  );
}

async function buildStaticFallback(): Promise<StatusPayload> {
  const response = await fetch("/status-history.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load status fallback");

  const snapshot = await response.json();
  const checkedAt = new Date().toISOString();
  const statusFromCode: Record<string, ComponentStatus> = {
    O: "Operational",
    D: "Degraded Performance",
    P: "Partial Outage",
    X: "Major Outage",
    M: "Maintenance",
  };
  const uptimeByStatus: Record<ComponentStatus, number> = {
    Operational: 100,
    "Degraded Performance": 99.1,
    "Partial Outage": 96.2,
    "Major Outage": 88.4,
    Maintenance: 99.8,
  };

  const components: StatusComponent[] = snapshot.components.map(
    (component: {
      id: string;
      name: string;
      currentStatus: ComponentStatus;
      history: {
        days: number;
        default: string;
        overrides?: Array<{ offset: number; status: string; uptime?: number }>;
      };
    }) => {
      const overrides = new Map(
        (component.history.overrides || []).map((entry) => [entry.offset, entry]),
      );
      const startDate = new Date(`${snapshot.startsOn}T00:00:00Z`);
      const history = Array.from({ length: component.history.days }, (_, index) => {
        const override = overrides.get(index);
        const status =
          index === component.history.days - 1
            ? component.currentStatus
            : statusFromCode[override?.status || component.history.default];
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + index);

        return {
          date: date.toISOString().slice(0, 10),
          status,
          uptime: override?.uptime ?? uptimeByStatus[status],
        };
      });
      const uptime30 =
        history.slice(-30).reduce((sum, day) => sum + day.uptime, 0) /
        Math.min(30, history.length);

      return {
        id: component.id,
        name: component.name,
        status: component.currentStatus,
        uptime30: Number(uptime30.toFixed(2)),
        history,
      };
    },
  );

  return {
    source: "static-json",
    lastCheckedAt: checkedAt,
    generatedAt: snapshot.generatedAt,
    overallStatus: "operational",
    affectedComponents: [],
    components,
    incidents: snapshot.incidents,
  };
}

export default function StatusMonitor({
  initialData,
}: {
  initialData: StatusPayload;
}) {
  const [statusData, setStatusData] = useState(initialData);
  const [now, setNow] = useState(() => new Date());
  const [email, setEmail] = useState("");
  const [subscribeState, setSubscribeState] =
    useState<SubscribeState>("idle");
  const [subscribeError, setSubscribeError] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Status API unavailable");
      setStatusData((await response.json()) as StatusPayload);
      setNow(new Date());
    } catch {
      try {
        setStatusData(await buildStaticFallback());
        setNow(new Date());
      } catch {
        setSubscribeError("Unable to refresh status right now.");
      }
    }
  }, []);

  useInterval(refreshStatus, 60000);
  useInterval(() => setNow(new Date()), 1000);

  const banner = useMemo(() => getBannerConfig(statusData), [statusData]);
  const BannerIcon = banner.icon;
  const incidents = statusData.incidents.slice(0, 10);

  const submitSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribeState("loading");
    setSubscribeError("");

    try {
      const response = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Unable to subscribe");
      }
      setSubscribeState("success");
    } catch (error) {
      setSubscribeState("error");
      setSubscribeError(
        error instanceof Error ? error.message : "Unable to subscribe",
      );
    }
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-white pt-32">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
                CircleWorks Status
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0A1628] md:text-5xl">
                System status and uptime
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">
              <RefreshCw className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Last updated {timeAgo(statusData.lastCheckedAt, now)}
            </div>
          </div>
        </div>

        <div className={`border-y ${banner.classes}`} role="status" aria-live="polite">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-5">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-1 ${banner.iconClasses}`}
              >
                <BannerIcon className="h-9 w-9" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-[32px] font-black leading-tight tracking-tight">
                  {banner.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Last checked: {timeAgo(statusData.lastCheckedAt, now)}
                </p>
              </div>
            </div>

            {statusData.affectedComponents.length > 0 ? (
              <div className="rounded-xl border border-current/20 bg-white/70 px-4 py-3 text-sm font-bold">
                <p>Affected: {statusData.affectedComponents.join(", ")}</p>
                {statusData.overallStatus === "major" && (
                  <a
                    href="#incident-history"
                    className="mt-2 inline-flex text-red-700 underline underline-offset-4"
                  >
                    View incident history
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-green-200 bg-white/70 px-4 py-3 text-sm font-bold text-green-700">
                All monitored components are reporting normal health.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#0A1628]">
                  Component Status
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  30-day uptime and 90-day daily health history.
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Source: {statusData.source}
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[260px_190px_150px_1fr] gap-5 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Uptime %</span>
                  <span>90-day history</span>
                </div>
                {statusData.components.map((component) => (
                  <div
                    key={component.id}
                    className="grid grid-cols-[260px_190px_150px_1fr] gap-5 border-b border-slate-100 px-5 py-5 last:border-b-0"
                  >
                    <div className="font-black text-slate-900">
                      {component.name}
                    </div>
                    <div>
                      <StatusBadge status={component.status} />
                    </div>
                    <div className="font-mono text-sm font-black text-slate-700">
                      {component.uptime30.toFixed(2)}%
                    </div>
                    <HistoryBar component={component} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
            <section id="incident-history">
              <div className="mb-5 flex items-center gap-3">
                <Clock3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <h2 className="text-2xl font-black tracking-tight text-[#0A1628]">
                  Incident History
                </h2>
              </div>

              {incidents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-bold text-slate-500">
                  No incidents in the last 90 days.
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <details
                      key={incident.id}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <summary className="flex cursor-pointer list-none flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-black text-[#0A1628]">
                              {incident.title}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset ${severityStyles[incident.severity]}`}
                            >
                              {incident.severity}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            {formatDateTime(incident.startedAt)} -{" "}
                            {formatDateTime(incident.endedAt)} · {incident.duration}
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-700">
                            Affected: {incident.affectedComponents.join(", ")}
                          </p>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                      </summary>

                      <ol className="mt-6 border-l border-slate-200 pl-5">
                        {incident.timeline.map((item) => (
                          <li key={`${incident.id}-${item.status}`} className="relative pb-5 last:pb-0">
                            <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                            <p className="text-sm font-black text-slate-900">
                              {item.status}
                            </p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                              {formatDateTime(item.timestamp)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.message}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </details>
                  ))}
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-black text-[#0A1628]">
                Subscribe to Status Updates
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Get an email when CircleWorks opens, updates, or resolves an
                incident.
              </p>

              <form onSubmit={submitSubscription} className="mt-5 space-y-3">
                <label
                  htmlFor="status-email"
                  className="text-sm font-black text-slate-700"
                >
                  Work email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="status-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribeState === "loading"}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {subscribeState === "loading" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe to Status Updates"
                  )}
                </button>
              </form>

              <div aria-live="polite" className="mt-4">
                {subscribeState === "success" && (
                  <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-black text-green-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    We&apos;ll email you during any incident.
                  </p>
                )}
                {subscribeState === "error" && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {subscribeError}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
