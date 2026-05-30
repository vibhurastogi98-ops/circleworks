"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, Mail, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  eeo1DemographicCollection,
  eeo1RaceEthnicities,
  eeo1Rows,
  eeo1ValidationIssues,
  getEEO1RowTotal,
  getEEO1TotalHeadcount,
  type EEORaceEthnicity,
} from "@/data/complianceModule";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getEEO1Data() {
  await wait();
  return {
    rows: eeo1Rows,
    races: eeo1RaceEthnicities,
    collection: eeo1DemographicCollection,
    validationIssues: eeo1ValidationIssues,
  };
}

function raceGenderTotal(race: EEORaceEthnicity, gender: "male" | "female") {
  return eeo1Rows.reduce((total, row) => total + row.counts[race][gender], 0);
}

function EEO1Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function EEO1Page() {
  const [emailSent, setEmailSent] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "eeo1"],
    queryFn: getEEO1Data,
  });

  const totalHeadcount = useMemo(() => getEEO1TotalHeadcount(), []);

  if (isLoading) return <EEO1Skeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">EEO-1 data could not be loaded.</p>
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
            <Users size={26} className="text-blue-600" />
            EEO-1 Reporting
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Component 1 report by race/ethnicity, gender, and EEO job category.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEmailSent(true)}>
            <Mail size={16} />
            Send self-identification email
          </Button>
          <a href="/api/compliance/eeo1/export">
            <Button>
              <Download size={16} />
              Export EEO-1 File
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Report Headcount</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{totalHeadcount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Self-ID Complete</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
            {data.collection.completed}/{data.collection.requested}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Missing Responses</p>
          <p className="mt-2 text-3xl font-black text-orange-600">{data.collection.missing}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Validation</p>
          <p className="mt-2 text-3xl font-black text-red-600">{data.validationIssues.length}</p>
        </div>
      </div>

      {(emailSent || data.validationIssues.length > 0) && (
        <div className="grid gap-3">
          {emailSent && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
              Voluntary self-identification email queued for employees missing demographic responses.
            </div>
          )}
          {data.validationIssues.map((issue) => (
            <div
              key={issue}
              className="flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{issue}</p>
            </div>
          ))}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">EEO-1 Component 1 Data Grid</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Auto-populated from employee demographic data and EEO job category mappings.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800">
                  Job Category
                </th>
                {data.races.map((race) => (
                  <th key={race} colSpan={2} className="border-b border-l border-slate-200 px-3 py-3 text-center dark:border-slate-800">
                    {race}
                  </th>
                ))}
                <th className="border-b border-l border-slate-200 px-4 py-3 text-center dark:border-slate-800">Total</th>
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2 dark:bg-slate-800" />
                {data.races.map((race) => (
                  <FragmentPair key={race} />
                ))}
                <th className="border-l border-slate-200 px-4 py-2 dark:border-slate-800" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.rows.map((row) => (
                <tr key={row.jobCategory} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-bold text-slate-950 dark:bg-slate-900 dark:text-white">
                    {row.jobCategory}
                  </td>
                  {data.races.map((race) => (
                    <CellPair key={race} male={row.counts[race].male} female={row.counts[race].female} />
                  ))}
                  <td className="border-l border-slate-200 px-4 py-3 text-center font-black text-slate-950 dark:border-slate-800 dark:text-white">
                    {getEEO1RowTotal(row)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black dark:bg-slate-800/60">
                <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-slate-950 dark:bg-slate-800 dark:text-white">
                  Total
                </td>
                {data.races.map((race) => (
                  <CellPair key={race} male={raceGenderTotal(race, "male")} female={raceGenderTotal(race, "female")} />
                ))}
                <td className="border-l border-slate-200 px-4 py-3 text-center text-blue-600 dark:border-slate-800">
                  {totalHeadcount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FragmentPair() {
  return (
    <>
      <th className="border-l border-slate-200 px-2 py-2 text-center dark:border-slate-800">M</th>
      <th className="px-2 py-2 text-center">F</th>
    </>
  );
}

function CellPair({ male, female }: { male: number; female: number }) {
  return (
    <>
      <td className="border-l border-slate-100 px-2 py-3 text-center text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {male || "-"}
      </td>
      <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-300">{female || "-"}</td>
    </>
  );
}
