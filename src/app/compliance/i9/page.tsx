"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

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
import { i9ManagementRecords, type I9ManagementRecord, type I9Status } from "@/data/complianceModule";

const statusStyles: Record<I9Status, string> = {
  Complete: "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
  "Pending Section 2":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  "Expiring Soon":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  Expired: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  "Not Started":
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusOrder: Record<I9Status, number> = {
  Expired: 0,
  "Expiring Soon": 1,
  "Pending Section 2": 2,
  "Not Started": 3,
  Complete: 4,
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getI9Records() {
  await wait();
  return i9ManagementRecords;
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function daysUntil(date?: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(date).getTime() - Date.now()) / oneDay);
}

function StatusBadge({ status }: { status: I9Status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function I9Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

function AddI9Dialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [employeeId, setEmployeeId] = useState(i9ManagementRecords[0]?.employeeId ?? "");
  const [eVerifyEnabled, setEVerifyEnabled] = useState(true);
  const employee = i9ManagementRecords.find((record) => record.employeeId === employeeId) ?? i9ManagementRecords[0];

  const close = () => {
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add I-9</DialogTitle>
          <DialogDescription>
            Select an employee, confirm Section 1 profile details, then complete Section 2 document verification.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {[1, 2].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item as 1 | 2)}
              className={`h-2 flex-1 rounded-full ${step >= item ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}
              aria-label={`Go to step ${item}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Employee
              <select
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {i9ManagementRecords.map((record) => (
                  <option key={record.id} value={record.employeeId}>
                    {record.employee} · {record.employeeId}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Name</p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">{employee.employee}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Role</p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">{employee.role}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Department</p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">{employee.department}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hire date</p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">{formatDate(employee.hireDate)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Document list
              <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option>List A</option>
                <option>List B + C</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Document type
              <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option>U.S. Passport</option>
                <option>Permanent Resident Card</option>
                <option>Employment Authorization Document</option>
                <option>Driver license + Social Security card</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Document number
              <Input placeholder="A12345678" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Expiry date
              <Input type="date" />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
              <input
                type="checkbox"
                checked={eVerifyEnabled}
                onChange={(event) => setEVerifyEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span>
                <span className="block text-sm font-black text-slate-950 dark:text-white">Submit to E-Verify</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Auto-submit when Section 2 is completed and update status from the USCIS webhook.
                </span>
              </span>
            </label>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={() => setStep(2)}>Next: Section 2</Button>
          ) : (
            <Button onClick={close}>Complete I-9</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function I9ManagementPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<I9Status | "all">("all");
  const [expiryFilter, setExpiryFilter] = useState<30 | 60 | 90 | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "i9"],
    queryFn: getI9Records,
  });

  const records = useMemo(() => {
    const base = [...(data ?? [])].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
    });

    return base.filter((record) => {
      const matchesSearch =
        record.employee.toLowerCase().includes(query.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(query.toLowerCase()) ||
        record.department.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesExpiry = !expiryFilter || daysUntil(record.expiryDate) <= expiryFilter;
      return matchesSearch && matchesStatus && matchesExpiry;
    });
  }, [data, expiryFilter, query, statusFilter]);

  const validPercent = data?.length
    ? Math.round((data.filter((record) => record.status === "Complete").length / data.length) * 100)
    : 0;

  if (isLoading) return <I9Skeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">I-9 records could not be loaded.</p>
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
            <FileCheck2 size={26} className="text-blue-600" />
            I-9 Management
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Section 1, Section 2, document expiration, reverification, and E-Verify submission readiness.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Add I-9
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Valid I-9s</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{validPercent}%</p>
        </div>
        {(["Expired", "Expiring Soon", "Pending Section 2"] as I9Status[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-bold uppercase text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {data.filter((record) => record.status === status).length}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employee, ID, or department"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90].map((days) => (
              <Button
                key={days}
                variant={expiryFilter === days ? "primary" : "outline"}
                size="sm"
                onClick={() => setExpiryFilter(expiryFilter === days ? null : (days as 30 | 60 | 90))}
              >
                <CalendarClock size={14} />
                Expiring in {days}
              </Button>
            ))}
            {(query || statusFilter !== "all" || expiryFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setExpiryFilter(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Hire Date</th>
                <th className="px-5 py-3">Section 1</th>
                <th className="px-5 py-3">Section 2</th>
                <th className="px-5 py-3">Document Type</th>
                <th className="px-5 py-3">Expiry Date</th>
                <th className="px-5 py-3">Re-verify Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((record: I9ManagementRecord) => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950 dark:text-white">{record.employee}</p>
                    <p className="text-xs text-slate-500">
                      {record.employeeId} · {record.department}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(record.hireDate)}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{record.section1Status}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{record.section2Status}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    <span className="font-medium">{record.documentList}</span>
                    <p className="max-w-[220px] truncate text-xs text-slate-500">{record.documentType}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(record.expiryDate)}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(record.reverifyDate)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant={record.status === "Complete" ? "outline" : "primary"}>
                      {record.status === "Complete" ? (
                        <>
                          <ShieldCheck size={14} />
                          Audit
                        </>
                      ) : (
                        <>
                          {record.status === "Expired" ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
                          Resolve
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <div className="flex gap-3">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">
            Form I-9 verifies identity and employment authorization for employees hired in the United States. E-Verify
            cases are auto-submitted when Section 2 is completed and the toggle is enabled.
          </p>
        </div>
      </div>

      <AddI9Dialog open={addOpen} onOpenChange={setAddOpen} />
      <Link href="/compliance/everify" className="sr-only">
        E-Verify
      </Link>
    </div>
  );
}
