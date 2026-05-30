"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileText,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  getReviewCycle,
  reviewParticipants,
  type OverallReviewStatus,
  type ReviewStepStatus,
} from "@/data/mockPerformance";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const reviewStatusClasses: Record<ReviewStepStatus, string> = {
  "Not Started": "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "In Progress": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Submitted: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  Complete:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const overallClasses: Record<OverallReviewStatus, string> = {
  "Not Started": reviewStatusClasses["Not Started"],
  "Needs Attention":
    "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  "On Track": reviewStatusClasses.Submitted,
  Complete: reviewStatusClasses.Complete,
};

function Donut({ completed, total }: { completed: number; total: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = total ? completed / total : 0;
  const pending = total - completed;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32">
        <svg className="-rotate-90" height="128" width="128" aria-hidden="true">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - circumference * pct}
            className="text-blue-600"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-950 dark:text-white">{Math.round(pct * 100)}%</span>
          <span className="text-[10px] font-bold uppercase text-slate-500">complete</span>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-2xl font-black text-slate-950 dark:text-white">{completed}</p>
          <p className="text-xs font-bold uppercase text-slate-500">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-950 dark:text-white">{pending}</p>
          <p className="text-xs font-bold uppercase text-slate-500">Pending</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewCycleDetailPage() {
  const params = useParams();
  const cycleId = String(params.cycleId || "q2-2026");
  const [search, setSearch] = useState("");

  const detailQuery = useQuery({
    queryKey: ["performance-review-cycle", cycleId],
    queryFn: async () => ({
      cycle: getReviewCycle(cycleId),
      participants: reviewParticipants,
    }),
  });

  const filteredParticipants = useMemo(() => {
    const participants = detailQuery.data?.participants || [];
    return participants.filter((participant) =>
      [participant.employee, participant.manager, participant.department]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [detailQuery.data?.participants, search]);

  if (detailQuery.isLoading || !detailQuery.data) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />;
  }

  const { cycle, participants } = detailQuery.data;
  const completed = participants.filter((participant) => participant.overallStatus === "Complete").length;
  const notStarted = participants.filter((participant) => participant.overallStatus === "Not Started").length;

  const sendReminders = () => {
    toast.success(`Reminder queued for ${notStarted} employees who have not started.`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <Link
            href="/performance/reviews"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Back to review cycles"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{cycle.name}</h1>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
                {cycle.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {cycle.type} · {cycle.period} · Self due {formatDate(cycle.selfReviewDueDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={sendReminders}>
            <Bell size={16} />
            Send Reminders
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FileText size={16} />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Progress Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut completed={completed} total={participants.length} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participation Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <Users className="text-blue-600" size={20} />
              <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{cycle.participants}</p>
              <p className="text-xs font-bold uppercase text-slate-500">Cycle participants</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={20} />
              <p className="mt-3 text-2xl font-black">{cycle.completed}</p>
              <p className="text-xs font-bold uppercase">Completed companywide</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <CircleAlert size={20} />
              <p className="mt-3 text-2xl font-black">{notStarted}</p>
              <p className="text-xs font-bold uppercase">Not started sample</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, manager, or department..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={sendReminders}>
            <Clock size={16} />
            Bulk reminder to not-started
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participation Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Self Review</TableHead>
                <TableHead>Manager Review</TableHead>
                <TableHead>Peer Reviews</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead className="text-right">Form</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{participant.employee}</p>
                      <p className="text-xs text-slate-500">
                        {participant.title} · {participant.department}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{participant.manager}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={reviewStatusClasses[participant.selfReviewStatus]}>
                      {participant.selfReviewStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={reviewStatusClasses[participant.managerReviewStatus]}>
                      {participant.managerReviewStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">
                      {participant.peerReviewsCompleted}/{participant.peerReviewsRequested}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={overallClasses[participant.overallStatus]}>{participant.overallStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/performance/reviews/${cycle.id}/${participant.employeeId}`}
                      className="inline-flex items-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
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
    </div>
  );
}
