"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, Download, Plus, ShieldAlert } from "lucide-react";

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
import { getOsha300ASummary, oshaIncidents, type OSHAIncident } from "@/data/complianceModule";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getOshaData() {
  await wait();
  return oshaIncidents;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function OshaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

function AddIncidentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add OSHA Incident</DialogTitle>
          <DialogDescription>
            Capture the OSHA 301 details and recordable decision used to populate 300 and 300A logs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Incident date
            <Input type="date" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Employee
            <Input placeholder="Employee name" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">
            Description
            <textarea
              rows={3}
              placeholder="What happened?"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Incident type
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option>Injury</option>
              <option>Illness</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Treatment
            <Input placeholder="First aid, prescription, transfer..." />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Restricted days
            <Input type="number" min="0" defaultValue="0" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Lost days
            <Input type="number" min="0" defaultValue="0" />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            <span>
              <span className="block text-sm font-black text-slate-950 dark:text-white">OSHA recordable</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Mark based on treatment, days away, restriction, job transfer, or other recordability rules.
              </span>
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save Incident</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OshaPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "osha"],
    queryFn: getOshaData,
  });

  const summary = useMemo(() => getOsha300ASummary(data ?? []), [data]);

  if (isLoading) return <OshaSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">OSHA logs could not be loaded.</p>
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
            <ClipboardList size={26} className="text-blue-600" />
            OSHA Log
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            OSHA 300 incident log, OSHA 301 capture, and OSHA 300A annual summary export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            Add Incident
          </Button>
          <a href="/api/compliance/osha/300a" target="_blank" rel="noreferrer">
            <Button>
              <Download size={16} />
              Export 300A PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <SummaryMetric label="Recordable cases" value={summary.recordableCases} />
        <SummaryMetric label="Injuries" value={summary.injuries} />
        <SummaryMetric label="Illnesses" value={summary.illnesses} />
        <SummaryMetric label="Days away" value={summary.totalDaysAway} />
        <SummaryMetric label="Restricted days" value={summary.totalRestrictedDays} />
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
        <div className="flex gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium leading-6">
            Posting reminder: {summary.postingReminder} Archive evidence is missing for the San Francisco office.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Incident Log Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Days Away</th>
                <th className="px-5 py-3">Recordable</th>
                <th className="px-5 py-3">Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((incident: OSHAIncident) => (
                <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(incident.date)}</td>
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{incident.employee}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.description}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.type}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.daysAway}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        incident.recordable
                          ? "inline-flex rounded-full bg-red-100 px-2 py-1 text-[11px] font-black text-red-700 dark:bg-red-500/15 dark:text-red-300"
                          : "inline-flex rounded-full bg-green-100 px-2 py-1 text-[11px] font-black text-green-700 dark:bg-green-500/15 dark:text-green-300"
                      }
                    >
                      {incident.recordable ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{incident.treatment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <div className="flex gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">
            OSHA recordkeeping screens support Forms 300, 301, and 300A workflows. The 300A PDF uses current incident
            totals for the selected year.
          </p>
        </div>
      </div>

      <AddIncidentDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
