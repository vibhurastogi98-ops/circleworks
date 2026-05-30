"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck, ExternalLink, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  federalLawSummaries,
  laborLawChecklist,
  type LaborChecklistStatus,
  type LaborLawChecklistItem,
} from "@/data/complianceModule";

const statusStyles: Record<LaborChecklistStatus, string> = {
  Compliant:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
  "Needs review":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  "At risk": "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLaborLawData() {
  await wait();
  return {
    checklist: laborLawChecklist,
    federalLaws: federalLawSummaries,
  };
}

function LaborLawSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function LaborLawPage() {
  const [stateFilter, setStateFilter] = useState<"all" | "CA" | "NY" | "TX">("all");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "labor-law"],
    queryFn: getLaborLawData,
  });

  const checklist = useMemo(
    () => (data?.checklist ?? []).filter((item) => stateFilter === "all" || item.state === stateFilter),
    [data?.checklist, stateFilter],
  );

  const grouped = useMemo(() => {
    return checklist.reduce<Record<string, LaborLawChecklistItem[]>>((groups, item) => {
      groups[item.stateName] = groups[item.stateName] ? [...groups[item.stateName], item] : [item];
      return groups;
    }, {});
  }, [checklist]);

  if (isLoading) return <LaborLawSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Labor law library could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Compliance</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
          <Scale size={26} className="text-blue-600" />
          Labor Law Library
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Multi-state compliance checklist and federal law summaries for the company operating footprint.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Multi-state Compliance Checklist</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Minimum wage, overtime, breaks, paid leave, and poster requirements by state.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "CA", "NY", "TX"] as const).map((state) => (
              <Button
                key={state}
                variant={stateFilter === state ? "primary" : "outline"}
                size="sm"
                onClick={() => setStateFilter(state)}
              >
                {state === "all" ? "All states" : state}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {Object.entries(grouped).map(([stateName, items]) => (
          <section
            key={stateName}
            className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">{stateName}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                {items.filter((item) => item.status !== "Compliant").length} item(s) need attention
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-black text-slate-950 dark:text-white">{item.topic}</h4>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.requirement}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Owner: {item.owner}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-slate-800">
          <BookOpenCheck size={18} className="text-blue-600" />
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Federal Law Summary</h2>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {data.federalLaws.map((law) => (
            <article key={law.id} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {law.acronym}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{law.name}</h3>
                </div>
                <a
                  href={law.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={`Open ${law.acronym} source`}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{law.description}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                {law.complianceNotes}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
