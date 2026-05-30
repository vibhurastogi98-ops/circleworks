"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { mockReviewCycles, type ReviewCycleStatus } from "@/data/mockPerformance";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusClasses: Record<ReviewCycleStatus, string> = {
  Draft: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Active: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  Completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function ReviewCyclesPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const cyclesQuery = useQuery({
    queryKey: ["performance-review-cycles"],
    queryFn: async () => mockReviewCycles,
  });

  const cycles = cyclesQuery.data || [];
  const filteredCycles = cycles.filter((cycle) =>
    [cycle.name, cycle.type, cycle.status].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
            Performance Reviews
          </p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Review Cycles</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, launch, and monitor annual, mid-year, quarterly, and probationary cycles.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          Create Cycle
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cycles..."
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-slate-50 px-4 py-2 dark:bg-slate-800">
              <p className="font-black text-slate-950 dark:text-white">{cycles.length}</p>
              <p className="font-bold uppercase text-slate-500">Cycles</p>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-2 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <p className="font-black">{cycles.filter((cycle) => cycle.status === "Active").length}</p>
              <p className="font-bold uppercase">Active</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <p className="font-black">{cycles.filter((cycle) => cycle.status === "Completed").length}</p>
              <p className="font-bold uppercase">Done</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cycles List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/performance/reviews/${cycle.id}`}
                        className="font-bold text-slate-950 transition hover:text-blue-600 dark:text-white"
                      >
                        {cycle.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Self due {formatDate(cycle.selfReviewDueDate)} · Manager due{" "}
                        {formatDate(cycle.managerReviewDueDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cycle.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClasses[cycle.status]}>
                      {cycle.status === "Active" ? <Clock className="mr-1 h-3 w-3" /> : null}
                      {cycle.status === "Completed" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                      {cycle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CalendarDays size={14} />
                      {cycle.period}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <Users size={14} />
                      {cycle.participants}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-36 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${cycle.completion}%` }} />
                      </div>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                        {cycle.completion}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/performance/reviews/${cycle.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} contentClassName="max-w-3xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Cycle</DialogTitle>
            <DialogDescription>
              Configure review period, deadlines, and participant scope before launching.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Name</span>
                <Input defaultValue="Q3 2026 Growth Review" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Type</span>
                <select className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]">
                  <option>Quarterly</option>
                  <option>Annual</option>
                  <option>Mid-year</option>
                  <option>Probationary</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Review period start</span>
                <Input type="date" defaultValue="2026-07-01" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Review period end</span>
                <Input type="date" defaultValue="2026-09-30" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Self-review due date</span>
                <Input type="date" defaultValue="2026-10-06" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Manager review due date</span>
                <Input type="date" defaultValue="2026-10-13" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Peer selection deadline</span>
                <Input type="date" defaultValue="2026-09-28" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500">Participants</span>
                <select className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]">
                  <option>All employees</option>
                  <option>Filter by department</option>
                  <option>Filter by location</option>
                  <option>Custom employee list</option>
                </select>
              </label>
            </div>
            <Card className="rounded-xl">
              <CardContent className="grid gap-3 p-4 md:grid-cols-3">
                {[
                  ["Departments", "Engineering, Sales, Success"],
                  ["Locations", "All US locations"],
                  ["Visibility", "Employee sees after manager share"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(false)}>
              <ClipboardList size={16} />
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
