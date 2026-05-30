"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  Webhook,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { eVerifyCases, type EVerifyCaseStatus } from "@/data/complianceModule";

const statusStyles: Record<EVerifyCaseStatus, string> = {
  Authorized:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
  "Tentative Nonconfirmation":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  "Case in Continuance":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  "Final Nonconfirmation":
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

const statusIcons = {
  Authorized: CheckCircle2,
  "Tentative Nonconfirmation": AlertTriangle,
  "Case in Continuance": Clock3,
  "Final Nonconfirmation": XCircle,
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getEVerifyCases() {
  await wait();
  return eVerifyCases;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function EVerifySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function EVerifyPage() {
  const [statusFilter, setStatusFilter] = useState<EVerifyCaseStatus | "all">("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "everify"],
    queryFn: getEVerifyCases,
  });

  const submitCase = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/compliance/everify/submit", { method: "POST" });
      if (!response.ok) throw new Error("Failed to submit E-Verify case");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "everify"] });
    },
  });

  const cases = useMemo(() => {
    const statusRank: Record<EVerifyCaseStatus, number> = {
      "Tentative Nonconfirmation": 0,
      "Case in Continuance": 1,
      "Final Nonconfirmation": 2,
      Authorized: 3,
    };
    return [...(data ?? [])]
      .sort((a, b) => statusRank[a.status] - statusRank[b.status])
      .filter((item) => statusFilter === "all" || item.status === statusFilter);
  }, [data, statusFilter]);

  if (isLoading) return <EVerifySkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">E-Verify case data could not be loaded.</p>
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
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
            <ShieldCheck size={26} className="text-blue-600" />
            E-Verify
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            USCIS E-Verify case statuses, webhook updates, and I-9 Section 2 automation.
          </p>
        </div>
        <Button onClick={() => submitCase.mutate()} disabled={submitCase.isPending}>
          {submitCase.isPending ? <RefreshCw size={16} className="animate-spin" /> : <FileCheck2 size={16} />}
          Submit Pending Case
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Button variant={statusFilter === "all" ? "primary" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>
              All cases
            </Button>
            {(Object.keys(statusStyles) as EVerifyCaseStatus[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          <div className="flex items-center gap-2 font-black">
            <Webhook size={18} />
            USCIS webhook connected
          </div>
          <p className="mt-2 text-sm leading-6">
            When I-9 Section 2 is completed with E-Verify enabled, the case is submitted and status updates flow back
            through `/api/compliance/everify/webhook`.
          </p>
        </section>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Case #</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Next Action</th>
                <th className="px-5 py-3">Webhook Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cases.map((item) => {
                const Icon = statusIcons[item.status];
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-950 dark:text-white">{item.employee}</p>
                      <p className="text-xs text-slate-500">{item.employeeId}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{item.caseNumber}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(item.submittedDate)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusStyles[item.status]}`}
                      >
                        <Icon size={13} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{item.nextAction}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(item.webhookUpdatedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <a
        href="https://www.e-verify.gov/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        USCIS E-Verify official site
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
