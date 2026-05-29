"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GripVertical,
  Link as LinkIcon,
  Mail,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  addCandidate,
  createJob,
  getAtsCandidates,
  getAtsInterviews,
  getAtsJobs,
  getAtsOffers,
  getAtsOverview,
  getCandidateById,
  getCandidateName,
  getCandidatesByJob,
  getHiringTeam,
  getInterviewsByCandidate,
  getJobById,
  getOffersByCandidate,
  JOB_TEMPLATES,
  STAGES,
  updateCandidateStage,
  updateJobStatus,
  type AtsCandidate,
  type AtsInterview,
  type AtsJob,
  type AtsOffer,
  type CandidateStage,
  type JobStatus,
  type OfferStatus,
} from "@/data/mockAts";
import { employees, getEmployeeName } from "@/lib/hris-module-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
}

type HiringModuleScreen =
  | "overview"
  | "jobs"
  | "templates"
  | "job-new"
  | "job-edit"
  | "pipeline"
  | "candidates"
  | "candidate-profile"
  | "interviews"
  | "interview-detail"
  | "offers"
  | "offer-new"
  | "settings";

type ScoreDimension = "Culture Fit" | "Technical" | "Communication" | "Experience";

const scoreDimensions: ScoreDimension[] = ["Culture Fit", "Technical", "Communication", "Experience"];
const sources = ["LinkedIn", "Indeed", "Referral", "Direct", "Agency", "Manual"];
const departments = Array.from(new Set([...employees.map((employee) => employee.department), "Product", "Design"]));

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function useAtsOverviewData() {
  return useQuery({
    queryKey: ["ats", "overview"],
    queryFn: () => fetchJson("/api/ats/overview", getAtsOverview()),
    initialData: getAtsOverview(),
    staleTime: 5 * 60 * 1000,
  });
}

function useAtsJobsData() {
  return useQuery({
    queryKey: ["ats", "jobs"],
    queryFn: () => fetchJson<{ jobs: AtsJob[] }>("/api/ats/jobs", { jobs: getAtsJobs() }),
    initialData: { jobs: getAtsJobs() },
    staleTime: 5 * 60 * 1000,
  });
}

function useAtsCandidatesData() {
  return useQuery({
    queryKey: ["ats", "candidates"],
    queryFn: () => fetchJson<{ candidates: AtsCandidate[] }>("/api/ats/candidates", { candidates: getAtsCandidates() }),
    initialData: { candidates: getAtsCandidates() },
    staleTime: 5 * 60 * 1000,
  });
}

function useAtsInterviewsData() {
  return useQuery({
    queryKey: ["ats", "interviews"],
    queryFn: () => fetchJson<{ interviews: AtsInterview[] }>("/api/ats/interviews", { interviews: getAtsInterviews() }),
    initialData: { interviews: getAtsInterviews() },
    staleTime: 5 * 60 * 1000,
  });
}

function useAtsOffersData() {
  return useQuery({
    queryKey: ["ats", "offers"],
    queryFn: () => fetchJson<{ offers: AtsOffer[] }>("/api/ats/offers", { offers: getAtsOffers() }),
    initialData: { offers: getAtsOffers() },
    staleTime: 5 * 60 * 1000,
  });
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount < 1000 ? 0 : 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

function initials(firstName: string, lastName?: string) {
  const parts = lastName ? [firstName, lastName] : firstName.split(" ");
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function colorForName(name: string) {
  const colors = [
    "bg-blue-600",
    "bg-cyan-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
  ];
  return colors[name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

function scoreTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300";
}

function statusTone(status: string) {
  if (["Active", "Accepted", "Hired", "Submitted"].includes(status)) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
  if (["Paused", "Pending", "Countered", "Scheduled"].includes(status)) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
  if (["Closed", "Declined", "Cancelled", "Withdrawn"].includes(status)) return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

function StageBadge({ stage }: { stage: CandidateStage }) {
  const config = STAGES.find((item) => item.id === stage);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <span className={cx("h-2 w-2 rounded-full", config?.color || "bg-slate-400")} />
      {config?.title || stage}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold", statusTone(status))}>
      {status}
    </span>
  );
}

function CandidateAvatar({ candidate, size = "h-10 w-10" }: { candidate: AtsCandidate; size?: string }) {
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full text-sm font-black text-white",
        size,
        colorForName(getCandidateName(candidate)),
      )}
    >
      {initials(candidate.firstName, candidate.lastName)}
    </div>
  );
}

function SourceIcon({ source }: { source: string }) {
  const normalized = source.toLowerCase();
  if (normalized.includes("linkedin")) return <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-black text-white">in</span>;
  if (normalized.includes("indeed")) return <Search size={14} className="text-blue-500" />;
  if (normalized.includes("referral")) return <UserPlus size={14} className="text-emerald-500" />;
  if (normalized.includes("agency")) return <Briefcase size={14} className="text-violet-500" />;
  return <Send size={14} className="text-slate-400" />;
}

function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  href?: string;
}) {
  const body = (
    <div className="group flex min-h-[132px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-950 dark:text-white">{value}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function RichTextJobEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] rounded-b-xl border-x border-b border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
        {[
          { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
          { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
          { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
          { label: "Bullets", action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={cx(
              "rounded-md px-3 py-1.5 text-xs font-bold transition",
              item.active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function AtsOverviewScreen() {
  const { data: overview, isFetching, isError } = useAtsOverviewData();
  const stageTotals = STAGES.map((stage) => ({
    stage,
    count: overview.candidates.filter((candidate) => candidate.stage === stage.id).length,
  }));
  const maxStage = Math.max(...stageTotals.map((item) => item.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring"
        eyebrow="ATS Overview"
        description={isError ? "Using local ATS mock data while the API fallback recovers." : "Open requisitions, candidate volume, interviews, offers, and pipeline health."}
        actions={
          <>
            <Link href="/hiring/templates" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Job Templates
            </Link>
            <Link href="/hiring/jobs/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
              <Plus size={16} /> Create Job
            </Link>
          </>
        }
      />
      {isFetching && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
          Refreshing ATS overview...
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Active Jobs" value={overview.activeJobs} detail="Currently accepting candidates" icon={Briefcase} href="/hiring/jobs" />
        <KpiCard label="Total Candidates" value={overview.totalCandidates} detail="Across all open and paused jobs" icon={Users} href="/hiring/candidates" />
        <KpiCard label="Interviews Today" value={overview.scheduledToday} detail="Scheduled for May 29, 2026" icon={CalendarDays} href="/hiring/interviews" />
        <KpiCard label="Offers Pending" value={overview.offersPending} detail="Pending or countered offers" icon={FileText} href="/hiring/offers" />
        <KpiCard label="Time to Hire" value={`${overview.timeToHire}d`} detail="Average accepted-cycle length" icon={UserCheck} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Jobs Table</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Applicant counts and pipeline links for every requisition.</p>
            </div>
            <Link href="/hiring/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Applicants</th>
                  <th className="px-5 py-3">Days Open</th>
                  <th className="px-5 py-3">Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {overview.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-950 dark:text-white">{job.title}</div>
                      <div className="text-xs text-slate-500">{formatDate(job.postedDate)}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.department}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.location}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.type}</td>
                    <td className="px-5 py-4"><StatusBadge status={job.status} /></td>
                    <td className="px-5 py-4 text-center font-black text-slate-950 dark:text-white">{job.applicantsCount}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.daysOpen} days</td>
                    <td className="px-5 py-4">
                      <Link href={`/hiring/jobs/${job.id}`} className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        View Pipeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-bold text-slate-950 dark:text-white">Pipeline Snapshot</h2>
            <div className="mt-5 space-y-4">
              {stageTotals.map(({ stage, count }) => (
                <div key={stage.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.title}</span>
                    <span className="font-black text-slate-950 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={cx("h-full rounded-full", stage.color)} style={{ width: `${Math.max(8, (count / maxStage) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-bold text-slate-950 dark:text-white">Source Mix</h2>
            <div className="mt-4 space-y-3">
              {overview.sourceBreakdown.map((source) => (
                <div key={source.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className={cx("h-2.5 w-2.5 rounded-full", source.color)} />
                    {source.label}
                  </div>
                  <span className="text-sm font-black text-slate-950 dark:text-white">{source.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsScreen() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const { data: jobsData, isFetching } = useAtsJobsData();
  const [jobs, setJobs] = useState(jobsData.jobs);

  const filteredJobs = jobs.filter((job) => {
    const haystack = `${job.title} ${job.department} ${job.location}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "All" || job.status === status);
  });

  const toggleStatus = (job: AtsJob) => {
    const nextStatus: JobStatus = job.status === "Paused" ? "Active" : "Paused";
    updateJobStatus(job.id, nextStatus);
    setJobs(getAtsJobs());
    toast.success(nextStatus === "Paused" ? "Job paused" : "Job reactivated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        eyebrow="Open requisitions"
        description={isFetching ? "Refreshing job postings..." : "Manage job postings, public links, status, and applicant volume."}
        actions={
          <>
            <Link href="/hiring/templates" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Job Templates
            </Link>
            <Link href="/hiring/jobs/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
              <Plus size={16} /> Create Job
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Active", "Paused", "Closed", "Draft"] as Array<JobStatus | "All">).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-bold transition",
                status === item
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applicants</th>
                <th className="px-5 py-3">Days Open</th>
                <th className="px-5 py-3">Hiring Team</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <Link href={`/hiring/jobs/${job.id}`} className="font-bold text-slate-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                      {job.title}
                    </Link>
                    <div className="text-xs text-slate-500">{job.type} - {formatMoney(job.salaryMin)} to {formatMoney(job.salaryMax)}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.department}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.location}</td>
                  <td className="px-5 py-4"><StatusBadge status={job.status} /></td>
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{job.applicantsCount}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.daysOpen} days</td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-2">
                      {getHiringTeam(job).slice(0, 3).map((member) => (
                        <img key={member.id} src={member.avatar} alt={member.name} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 dark:border-slate-900" />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/hiring/jobs/${job.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400">
                        View Pipeline
                      </Link>
                      <Link href={`/hiring/jobs/${job.id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label={`Edit ${job.title}`}>
                        <Edit3 size={16} />
                      </Link>
                      <button type="button" onClick={() => toggleStatus(job)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Toggle status">
                        <Pause size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function JobTemplatesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Templates"
        eyebrow="ATS templates"
        description="Reusable job structures with default stages, requirements, and publishing settings."
        actions={<Link href="/hiring/jobs/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus size={16} /> Create Job</Link>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {JOB_TEMPLATES.map((template) => (
          <div key={template.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">{template.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{template.department}</p>
              </div>
              <ClipboardList className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {template.stages.map((stage) => <StageBadge key={stage} stage={stage} />)}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {template.requirements.map((item) => (
                <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {item}</li>
              ))}
            </ul>
            <Link href="/hiring/jobs/new" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Use template <ChevronRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobFormScreen({ mode }: { mode: "new" | "edit" }) {
  const params = useParams();
  const router = useRouter();
  const currentJob = mode === "edit" ? getJobById(String(params?.id || "")) : undefined;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: currentJob?.title || "Senior Product Designer",
    department: currentJob?.department || "Design",
    type: currentJob?.type || "Full-Time",
    locationType: currentJob?.locationType || "Remote",
    location: currentJob?.location || "Remote - United States",
    salaryMin: String(currentJob?.salaryMin || 130000),
    salaryMax: String(currentJob?.salaryMax || 165000),
    description: currentJob?.description || "<p>Own polished product workflows across HR, payroll, and employee operations.</p>",
    requirements: currentJob?.requirements || ["5+ years of product design experience", "Strong systems thinking", "Operational SaaS experience"],
    responsibilities: currentJob?.responsibilities || ["Design dense workflows", "Partner with engineering", "Run customer-informed iterations"],
    stages: currentJob?.interviewStages || (["New", "Screening", "Take-Home", "Onsite", "Offer"] as CandidateStage[]),
    hiringManagerId: currentJob?.hiringManagerId || "2",
    teamMemberIds: currentJob?.teamMemberIds || ["2", "3"],
    publish: currentJob?.publishOptions || { internalOnly: false, publicPosting: true, indeed: true, linkedIn: true },
  });

  const steps = ["Job Details", "Description", "Hiring Team", "Publish"];

  const save = () => {
    if (mode === "new") {
      const job = createJob({
        title: form.title,
        department: form.department,
        type: form.type,
        location: form.location,
        locationType: form.locationType as AtsJob["locationType"],
        status: "Active",
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        description: form.description,
        requirements: form.requirements,
        responsibilities: form.responsibilities,
        interviewStages: form.stages,
        hiringManagerId: form.hiringManagerId,
        teamMemberIds: form.teamMemberIds,
        publishOptions: form.publish,
      });
      toast.success("Job published", { description: `${job.title} is ready for candidates.` });
      router.push(`/hiring/jobs/${job.id}`);
      return;
    }
    toast.success("Job updated", { description: "Changes have been saved to the ATS mock data." });
    router.push(`/hiring/jobs/${currentJob?.id || "job-frontend"}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={mode === "new" ? "Create Job Posting" : "Edit Job Posting"}
        eyebrow="ATS workflow"
        description={mode === "new" ? "Create the requisition, interview loop, hiring team, and publishing settings." : currentJob?.title || "Job details"}
        actions={<Link href="/hiring/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ArrowLeft size={16} /> Jobs</Link>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-2">
          {steps.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(index)}
              className={cx(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition",
                step === index
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800",
              )}
            >
              <span className={cx("flex h-6 w-6 items-center justify-center rounded-full text-xs", step > index ? "bg-emerald-500 text-white" : step === index ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                {step > index ? <Check size={13} /> : index + 1}
              </span>
              {item}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="min-h-[560px] p-6">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Job title</span>
                  <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Department</span>
                  <select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                    {departments.map((department) => <option key={department}>{department}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Employment type</span>
                  <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                    {["Full-Time", "Part-Time", "Contract", "Internship"].map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Location type</span>
                  <select value={form.locationType} onChange={(event) => setForm({ ...form, locationType: event.target.value as AtsJob["locationType"] })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                    {["Remote", "Hybrid", "Onsite"].map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Location</span>
                  <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Salary range min</span>
                  <Input type="number" value={form.salaryMin} onChange={(event) => setForm({ ...form, salaryMin: event.target.value })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Salary range max</span>
                  <Input type="number" value={form.salaryMax} onChange={(event) => setForm({ ...form, salaryMax: event.target.value })} />
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-bold text-slate-950 dark:text-white">Description</h2>
                    <button type="button" onClick={() => setForm({ ...form, description: "<h2>About the role</h2><p>Join CircleWorks to build thoughtful, reliable HR workflows for growing teams.</p><ul><li>Ship polished product experiences</li><li>Partner with HR and payroll experts</li><li>Turn complex workflows into calm interfaces</li></ul>" })} className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300">
                      <Sparkles size={14} /> Draft
                    </button>
                  </div>
                  <RichTextJobEditor value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
                </div>
                <EditableList title="Requirements" values={form.requirements} onChange={(requirements) => setForm({ ...form, requirements })} />
                <EditableList title="Responsibilities" values={form.responsibilities} onChange={(responsibilities) => setForm({ ...form, responsibilities })} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Hiring manager</span>
                    <select value={form.hiringManagerId} onChange={(event) => setForm({ ...form, hiringManagerId: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                      {employees.map((employee) => <option key={employee.id} value={employee.id}>{getEmployeeName(employee)} - {employee.title}</option>)}
                    </select>
                  </label>
                  <div>
                    <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Team members</span>
                    <div className="grid grid-cols-1 gap-2">
                      {employees.slice(0, 6).map((employee) => (
                        <label key={employee.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                          <input
                            type="checkbox"
                            checked={form.teamMemberIds.includes(employee.id)}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                teamMemberIds: event.target.checked
                                  ? [...form.teamMemberIds, employee.id]
                                  : form.teamMemberIds.filter((id) => id !== employee.id),
                              })
                            }
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{getEmployeeName(employee)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 font-bold text-slate-950 dark:text-white">Interview stages</h2>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.filter((stage) => !["Hired", "Withdrawn"].includes(stage.id)).map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            stages: form.stages.includes(stage.id)
                              ? form.stages.filter((id) => id !== stage.id)
                              : [...form.stages, stage.id],
                          })
                        }
                        className={cx(
                          "rounded-full border px-3 py-2 text-sm font-bold transition",
                          form.stages.includes(stage.id)
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-slate-200 text-slate-500 dark:border-slate-700",
                        )}
                      >
                        {stage.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {[
                  ["Internal only", "internalOnly"],
                  ["Public job board", "publicPosting"],
                  ["Syndicate to Indeed", "indeed"],
                  ["Syndicate to LinkedIn", "linkedIn"],
                ].map(([label, key]) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(form.publish[key as keyof typeof form.publish])}
                      onChange={(event) => setForm({ ...form, publish: { ...form.publish, [key]: event.target.checked } })}
                      className="h-5 w-5"
                    />
                  </label>
                ))}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  Pay range will be shown on public postings for transparency jurisdictions.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              <ChevronLeft size={16} /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
                Continue <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={save}>{mode === "new" ? "Publish Job" : "Save Changes"}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableList({ title, values, onChange }: { title: string; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>
        <button type="button" onClick={() => onChange([...values, ""])} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Add
        </button>
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex items-center gap-2">
            <GripVertical size={16} className="text-slate-300" />
            <Input value={value} onChange={(event) => onChange(values.map((item, i) => (i === index ? event.target.value : item)))} />
            <button type="button" onClick={() => onChange(values.filter((_, i) => i !== index))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  onClick,
}: {
  candidate: AtsCandidate;
  onClick: (candidate: AtsCandidate) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: candidate.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={() => onClick(candidate)}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <CandidateAvatar candidate={candidate} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <SourceIcon source={candidate.source} />
                <span>{candidate.source}</span>
                <span>-</span>
                <span>{candidate.daysInStage}d</span>
              </div>
            </div>
            <span {...attributes} {...listeners} className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-700">
              <GripVertical size={16} />
            </span>
          </div>
          <div className="mt-3 line-clamp-2 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            {candidate.resumeSnippet}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={cx("rounded-full border px-2 py-1 text-xs font-black", scoreTone(candidate.aiScore))}>
              AI {candidate.aiScore}%
            </span>
            <div className="flex items-center gap-2">
              {candidate.rating && <span className="flex items-center gap-1 text-xs font-black text-amber-500"><Star size={13} className="fill-amber-500" /> {candidate.rating}</span>}
              <div className="flex -space-x-1.5">
                {candidate.reviewers.slice(0, 3).map((avatar, index) => (
                  <img key={avatar + index} src={avatar} alt="" className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 dark:border-slate-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function StageColumn({
  stage,
  candidates,
  onCandidateClick,
}: {
  stage: (typeof STAGES)[number];
  candidates: AtsCandidate[];
  onCandidateClick: (candidate: AtsCandidate) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "flex h-full w-[310px] shrink-0 flex-col rounded-xl border transition",
        isOver
          ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
          : "border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={cx("h-2.5 w-2.5 rounded-full", stage.color)} />
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">{stage.title}</h2>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {candidates.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} onClick={onCandidateClick} />)}
        {candidates.length === 0 && (
          <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs font-bold text-slate-400 dark:border-slate-700">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineScreen() {
  const params = useParams();
  const job = getJobById(String(params?.id || "")) || getAtsJobs()[0];
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [candidates, setCandidates] = useState(() => getCandidatesByJob(job.id));
  const [selectedCandidate, setSelectedCandidate] = useState<AtsCandidate | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ firstName: "", lastName: "", email: "", source: "Manual" });
  const stageMutation = useMutation({
    mutationFn: async ({ candidateId, newStage }: { candidateId: string; newStage: CandidateStage }) => {
      const response = await fetch(`/api/ats/candidates/${candidateId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStage }),
      });
      if (!response.ok) throw new Error("Unable to update candidate stage");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ats"] });
    },
  });

  const stats = {
    applicants: candidates.length,
    screening: candidates.filter((candidate) => candidate.stage === "Screening").length,
    offer: candidates.filter((candidate) => candidate.stage === "Offer").length,
  };

  const moveCandidate = async (candidate: AtsCandidate, nextStage: CandidateStage) => {
    const previousStage = candidate.stage;
    setCandidates((current) => current.map((item) => (item.id === candidate.id ? { ...item, stage: nextStage, daysInStage: 0 } : item)));
    updateCandidateStage(candidate.id, nextStage);
    try {
      await stageMutation.mutateAsync({ candidateId: candidate.id, newStage: nextStage });
      if (nextStage === "Hired") {
        await fetch(`/api/ats/candidates/${candidate.id}/hire`, { method: "POST" }).catch(() => undefined);
        toast.success("Pre-hire created", { description: `${getCandidateName(candidate)} is queued in onboarding.` });
      } else {
        toast.success("Candidate moved", { description: `${getCandidateName(candidate)} moved to ${STAGES.find((stage) => stage.id === nextStage)?.title}.` });
      }
    } catch {
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? { ...item, stage: previousStage } : item)));
      toast.error("Stage update failed");
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const candidate = candidates.find((item) => item.id === String(event.active.id));
    const nextStage = STAGES.find((stage) => stage.id === event.over?.id)?.id;
    if (candidate && nextStage && candidate.stage !== nextStage) {
      void moveCandidate(candidate, nextStage);
    }
  };

  const createManualCandidate = () => {
    if (!newCandidate.firstName || !newCandidate.lastName || !newCandidate.email) return;
    const created = addCandidate({
      jobId: job.id,
      firstName: newCandidate.firstName,
      lastName: newCandidate.lastName,
      email: newCandidate.email,
      phone: "",
      source: newCandidate.source as AtsCandidate["source"],
      stage: "New",
      reviewers: [],
    });
    setCandidates((current) => [created, ...current]);
    setNewCandidate({ firstName: "", lastName: "", email: "", source: "Manual" });
    setAddOpen(false);
    toast.success("Candidate added");
  };

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-64px)] flex-col overflow-hidden px-4 py-6 sm:-mx-6 sm:px-6">
      <div className="mb-5 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{job.location} - {job.type} - {job.daysOpen} days open</div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span>{stats.applicants} applicants</span>
            <span>{stats.screening} screening</span>
            <span>{stats.offer} offer</span>
            <span>{job.daysOpen} days open</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/hiring/jobs/${job.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Edit3 size={16} /> Edit Job
          </Link>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Pause size={16} /> Pause
          </button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/careers/${job.id}`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Copy size={16} /> Copy Job Link
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
            <Plus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-3">
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex h-full gap-4" style={{ minWidth: `${STAGES.length * 326}px` }}>
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                candidates={candidates.filter((candidate) => candidate.stage === stage.id)}
                onCandidateClick={setSelectedCandidate}
              />
            ))}
          </div>
        </DndContext>
      </div>

      <CandidateDrawer candidate={selectedCandidate} job={job} open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)} />

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="max-w-[480px] p-6">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Add Candidate</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.title}</p>
              </div>
              <button type="button" onClick={() => setAddOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>
            <div className="mt-8 space-y-4">
              <Input placeholder="First name" value={newCandidate.firstName} onChange={(event) => setNewCandidate({ ...newCandidate, firstName: event.target.value })} />
              <Input placeholder="Last name" value={newCandidate.lastName} onChange={(event) => setNewCandidate({ ...newCandidate, lastName: event.target.value })} />
              <Input placeholder="Email" type="email" value={newCandidate.email} onChange={(event) => setNewCandidate({ ...newCandidate, email: event.target.value })} />
              <select value={newCandidate.source} onChange={(event) => setNewCandidate({ ...newCandidate, source: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                {sources.map((source) => <option key={source}>{source}</option>)}
              </select>
            </div>
            <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={createManualCandidate}>Create Candidate</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ResumePdfPreview({ candidate }: { candidate: AtsCandidate }) {
  if (candidate.resumeUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <Document file={candidate.resumeUrl} loading={<div className="p-6 text-sm text-slate-500">Loading resume...</div>}>
          <Page pageNumber={1} width={360} />
        </Document>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto min-h-[440px] max-w-[360px] rounded bg-white p-6 shadow-sm">
        <div className="h-5 w-44 rounded bg-slate-900" />
        <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
        <div className="mt-8 space-y-3">
          {[95, 80, 100, 72, 88, 94, 68, 100, 84, 72].map((width, index) => (
            <div key={index} className="h-2 rounded bg-slate-200" style={{ width: `${width}%` }} />
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-slate-600">
          {candidate.resumeSnippet}
        </div>
      </div>
    </div>
  );
}

function CandidateDrawer({
  candidate,
  job,
  open,
  onOpenChange,
}: {
  candidate: AtsCandidate | null;
  job?: AtsJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState("Overview");
  if (!candidate) return null;
  const candidateJob = job || getJobById(candidate.jobId) || getAtsJobs()[0];
  const interviews = getInterviewsByCandidate(candidate.id);
  const offers = getOffersByCandidate(candidate.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[480px] overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <CandidateAvatar candidate={candidate} size="h-12 w-12" />
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</h2>
                  <p className="text-sm text-slate-500">{candidate.currentTitle}</p>
                </div>
              </div>
              <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <StageBadge stage={candidate.stage} />
              <span className={cx("rounded-full border px-2.5 py-1 text-xs font-black", scoreTone(candidate.aiScore))}>AI {candidate.aiScore}%</span>
            </div>
          </div>

          <div className="flex overflow-x-auto border-b border-slate-100 px-4 dark:border-slate-800">
            {["Overview", "Resume", "Scorecard", "Notes", "Emails", "Activity"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cx(
                  "border-b-2 px-3 py-3 text-sm font-bold transition",
                  tab === item ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "Overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoBlock label="Job" value={candidateJob.title} />
                  <InfoBlock label="Location" value={candidate.location} />
                  <InfoBlock label="Email" value={candidate.email} />
                  <InfoBlock label="Phone" value={candidate.phone || "Not provided"} />
                  <InfoBlock label="Source" value={candidate.source} />
                  <InfoBlock label="Applied" value={formatDate(candidate.appliedDate)} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-950 dark:text-white">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><FileText size={16} /> Resume snippet</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{candidate.resumeSnippet}</p>
                </div>
                {interviews.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-950 dark:text-white">Interviews</h3>
                    <div className="space-y-2">
                      {interviews.map((interview) => <InterviewMiniRow key={interview.id} interview={interview} />)}
                    </div>
                  </div>
                )}
                {offers.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-950 dark:text-white">Offers</h3>
                    <div className="space-y-2">
                      {offers.map((offer) => <OfferMiniRow key={offer.id} offer={offer} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "Resume" && <ResumePdfPreview candidate={candidate} />}

            {tab === "Scorecard" && (
              <div className="space-y-5">
                {scoreDimensions.map((dimension, index) => (
                  <div key={dimension} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-slate-950 dark:text-white">{dimension}</h3>
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <Star key={star} size={16} className={star <= Math.min(4, index + 2) ? "fill-amber-500" : ""} />
                        ))}
                      </div>
                    </div>
                    <textarea className="min-h-20 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" placeholder={`Comments for ${dimension.toLowerCase()}`} />
                  </div>
                ))}
                <Button className="w-full">Submit Scorecard</Button>
              </div>
            )}

            {tab === "Notes" && (
              <div className="space-y-4">
                {candidate.notes.map((note) => (
                  <div key={note.createdAt} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="font-bold text-blue-600 dark:text-blue-400">{note.author}</div>
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{note.body}</p>
                    <div className="mt-2 text-xs text-slate-400">{note.createdAt}</div>
                  </div>
                ))}
                <textarea className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Write a note..." />
                <Button>Save Note</Button>
              </div>
            )}

            {tab === "Emails" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h3 className="mb-3 font-bold text-slate-950 dark:text-white">Send Email</h3>
                  <Input defaultValue={candidate.email} className="mb-3" />
                  <Input defaultValue={`Next steps for ${candidateJob.title}`} className="mb-3" />
                  <textarea className="min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" defaultValue={`Hi ${candidate.firstName},\n\nThanks for your time. We would like to keep moving forward in the process.`} />
                  <Button className="mt-3"><Mail size={16} /> Send via Postmark</Button>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Email history will thread replies from the candidate and recruiting team.
                </div>
              </div>
            )}

            {tab === "Activity" && (
              <div className="space-y-5">
                {candidate.activity.map((event) => (
                  <div key={event.createdAt} className="relative border-l-2 border-slate-200 pb-5 pl-5 dark:border-slate-700">
                    <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-blue-600" />
                    <div className="text-sm font-bold text-slate-950 dark:text-white">{event.label}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.detail}</div>
                    <div className="mt-1 text-xs text-slate-400">{event.createdAt}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}

function InterviewMiniRow({ interview }: { interview: AtsInterview }) {
  return (
    <Link href={`/hiring/interviews/${interview.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
      <span className="font-bold text-slate-800 dark:text-slate-200">{interview.type}</span>
      <span className="text-slate-500">{formatShortDate(interview.scheduledAt)}</span>
    </Link>
  );
}

function OfferMiniRow({ offer }: { offer: AtsOffer }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
      <span className="font-bold text-slate-800 dark:text-slate-200">{formatMoney(offer.salary)}</span>
      <StatusBadge status={offer.status} />
    </div>
  );
}

function CandidatesScreen() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<CandidateStage | "All">("All");
  const [jobId, setJobId] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState<AtsCandidate | null>(null);
  const jobs = getAtsJobs();
  const { data: candidatesData, isFetching } = useAtsCandidatesData();
  const candidates = candidatesData.candidates;
  const filtered = candidates.filter((candidate) => {
    const haystack = `${getCandidateName(candidate)} ${candidate.email} ${candidate.currentTitle}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (stage === "All" || candidate.stage === stage) && (jobId === "All" || candidate.jobId === jobId);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS Candidates"
        eyebrow="All candidates"
        description={isFetching ? "Refreshing candidate records..." : "A cross-job view with filters, stage controls, and bulk action entry points."}
        actions={<button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download size={16} /> Export</button>}
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(240px,1fr)_220px_220px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or title..." className="pl-9" />
        </div>
        <select value={jobId} onChange={(event) => setJobId(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="All">All jobs</option>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </select>
        <select value={stage} onChange={(event) => setStage(event.target.value as CandidateStage | "All")} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="All">All stages</option>
          {STAGES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3"><input type="checkbox" /></th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">AI Score</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((candidate) => {
                const job = getJobById(candidate.jobId);
                return (
                  <tr key={candidate.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4"><input type="checkbox" /></td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setSelectedCandidate(candidate)} className="flex items-center gap-3 text-left">
                        <CandidateAvatar candidate={candidate} />
                        <span>
                          <span className="block font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</span>
                          <span className="text-xs text-slate-500">{candidate.email}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job?.title || "Unknown"}</td>
                    <td className="px-5 py-4"><StageBadge stage={candidate.stage} /></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-2"><SourceIcon source={candidate.source} /> {candidate.source}</span></td>
                    <td className="px-5 py-4"><span className={cx("rounded-full border px-2 py-1 text-xs font-black", scoreTone(candidate.aiScore))}>{candidate.aiScore}%</span></td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(candidate.appliedDate)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/hiring/applicants/${candidate.id}`} className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Profile</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <CandidateDrawer candidate={selectedCandidate} open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)} />
    </div>
  );
}

function CandidateProfileScreen() {
  const params = useParams();
  const candidate = getCandidateById(String(params?.id || "")) || getAtsCandidates()[0];
  const job = getJobById(candidate.jobId) || getAtsJobs()[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href={`/hiring/jobs/${candidate.jobId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft size={16} /> Back to pipeline
      </Link>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <CandidateAvatar candidate={candidate} size="h-20 w-20 text-2xl" />
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</h1>
            <p className="text-sm text-slate-500">{candidate.currentTitle} - {candidate.location}</p>
            <div className="mt-3 flex flex-wrap gap-2"><StageBadge stage={candidate.stage} /><span className={cx("rounded-full border px-2.5 py-1 text-xs font-black", scoreTone(candidate.aiScore))}>AI {candidate.aiScore}%</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Mail size={16} /> Email</Button>
          <Link href="/hiring/interviews" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            <CalendarDays size={16} /> Schedule Interview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-950 dark:text-white">Contact Profile</h2>
            <div className="space-y-4 text-sm">
              <InfoBlock label="Email" value={candidate.email} />
              <InfoBlock label="Phone" value={candidate.phone || "Not provided"} />
              <InfoBlock label="Source" value={candidate.source} />
              <InfoBlock label="Applied For" value={job.title} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-950 dark:text-white">Application Answers</h2>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">I want to join CircleWorks because operational HR software should feel calm and human.</div>
              <a href={candidate.linkedinUrl || "#"} className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                LinkedIn profile <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950 dark:text-white">Resume</h2>
              <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={18} /></button>
            </div>
            <ResumePdfPreview candidate={candidate} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-950 dark:text-white">Scorecard Summary</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {scoreDimensions.map((dimension, index) => (
                <div key={dimension} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-2 font-bold text-slate-800 dark:text-slate-200">{dimension}</div>
                  <div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, star) => <Star key={star} size={15} className={star <= Math.min(4, index + 2) ? "fill-amber-500" : ""} />)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewsScreen() {
  const [view, setView] = useState<"Month" | "Week" | "Day">("Week");
  const [selectedInterview, setSelectedInterview] = useState<AtsInterview | null>(null);
  const { data: interviewsData, isFetching } = useAtsInterviewsData();
  const interviews = Array.from(
    new Map(interviewsData.interviews.map((interview) => [interview.id, interview])).values(),
  );
  const weekDays = [
    { label: "Mon 25", date: "2026-05-25" },
    { label: "Tue 26", date: "2026-05-26" },
    { label: "Wed 27", date: "2026-05-27" },
    { label: "Thu 28", date: "2026-05-28" },
    { label: "Fri 29", date: "2026-05-29" },
    { label: "Sat 30", date: "2026-05-30" },
    { label: "Sun 31", date: "2026-05-31" },
  ];
  const hours = Array.from({ length: 11 }, (_, index) => index + 9);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        eyebrow="Calendar"
        description={isFetching ? "Refreshing interview schedule..." : "Month, week, and day views for candidate interview loops."}
        actions={
          <div className="flex gap-2">
            {(["Month", "Week", "Day"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setView(item)} className={cx("rounded-lg border px-3 py-2 text-sm font-bold", view === item ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300")}>{item}</button>
            ))}
            <Button><Plus size={16} /> Schedule</Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700"><ChevronLeft size={18} /></button>
          <h2 className="font-bold text-slate-950 dark:text-white">May 25 - May 29, 2026</h2>
          <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700"><ChevronRight size={18} /></button>
        </div>
        <div className="grid min-h-[700px] grid-cols-[72px_repeat(7,minmax(150px,1fr))] overflow-x-auto">
          <div className="border-r border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40" />
          {weekDays.map((day) => (
            <div key={day.date} className="border-r border-slate-100 bg-slate-50 p-3 text-center text-sm font-black text-slate-700 last:border-r-0 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">{day.label}</div>
          ))}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-r border-t border-slate-100 bg-slate-50 p-2 text-right text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">{hour}:00</div>
              {weekDays.map((day) => (
                <div key={`${day.date}-${hour}`} className="relative min-h-20 border-r border-t border-slate-100 p-2 last:border-r-0 dark:border-slate-800">
                  {interviews.map((interview) => {
                    const date = new Date(interview.scheduledAt);
                    const interviewDate = date.toISOString().slice(0, 10);
                    if (interviewDate !== day.date || date.getUTCHours() !== hour) return null;
                    const candidate = getCandidateById(interview.candidateId);
                    const job = getJobById(interview.jobId);
                    return (
                      <button key={interview.id} type="button" onClick={() => setSelectedInterview(interview)} className="absolute inset-x-2 top-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-left shadow-sm hover:border-blue-300 dark:border-blue-500/30 dark:bg-blue-500/10">
                        <div className="text-xs font-black text-blue-700 dark:text-blue-300">{new Date(interview.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })}</div>
                        <div className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white">{candidate ? getCandidateName(candidate) : "Candidate"}</div>
                        <div className="truncate text-xs text-slate-500">{interview.type} - {job?.title}</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <InterviewModal interview={selectedInterview} onClose={() => setSelectedInterview(null)} />
    </div>
  );
}

function InterviewModal({ interview, onClose }: { interview: AtsInterview | null; onClose: () => void }) {
  if (!interview) return null;
  const candidate = getCandidateById(interview.candidateId) || getAtsCandidates()[0];
  const job = getJobById(interview.jobId) || getAtsJobs()[0];
  return (
    <Sheet open={!!interview} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="max-w-[480px] p-6">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{interview.type}</h2>
              <p className="mt-1 text-sm text-slate-500">{getCandidateName(candidate)} - {job.title}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
          </div>
          <div className="mt-6 space-y-4">
            <InfoBlock label="Time" value={`${formatDate(interview.scheduledAt)} ${new Date(interview.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })}`} />
            <InfoBlock label="Interviewers" value={interview.interviewers.join(", ")} />
            <InfoBlock label="Meeting" value={interview.meeting} />
            <StatusBadge status={interview.status} />
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="mb-3 font-bold text-slate-950 dark:text-white">Schedule Interview</h3>
              <div className="grid grid-cols-1 gap-3">
                <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                  {employees.map((employee) => <option key={employee.id}>{getEmployeeName(employee)}</option>)}
                </select>
                <Input type="datetime-local" defaultValue="2026-05-30T10:00" />
                <Button><Send size={16} /> Send Calendar Invite</Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InterviewDetailScreen() {
  const params = useParams();
  const interview = getAtsInterviews().find((item) => item.id === String(params?.id || "")) || getAtsInterviews()[0];
  const candidate = getCandidateById(interview.candidateId) || getAtsCandidates()[0];
  const job = getJobById(interview.jobId) || getAtsJobs()[0];

  return (
    <div className="space-y-6">
      <Link href="/hiring/interviews" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft size={16} /> Interviews</Link>
      <PageHeader
        title={`Interview: ${getCandidateName(candidate)}`}
        eyebrow={interview.type}
        description={`${job.title} - ${formatDate(interview.scheduledAt)} - ${interview.interviewers.join(", ")}`}
        actions={<Button><Video size={16} /> Start Debrief</Button>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-5 font-bold text-slate-950 dark:text-white">Interview Kit</h2>
          {["System design", "Communication", "Customer empathy"].map((topic) => (
            <div key={topic} className="mb-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="mb-2 font-bold text-slate-800 dark:text-slate-200">{topic}</h3>
              <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Interview notes..." />
            </div>
          ))}
          <Button className="w-full">Submit Scorecard</Button>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-950 dark:text-white">Candidate Context</h2>
            <div className="flex items-center gap-3">
              <CandidateAvatar candidate={candidate} size="h-14 w-14" />
              <div>
                <div className="font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</div>
                <div className="text-sm text-slate-500">{candidate.currentTitle}</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{candidate.resumeSnippet}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-950 dark:text-white">Job Description</h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{job.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {job.requirements.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> {item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function OffersScreen() {
  const [filter, setFilter] = useState<OfferStatus | "All">("All");
  const { data: offersData, isFetching } = useAtsOffersData();
  const offers = offersData.offers.filter((offer) => filter === "All" || offer.status === filter);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        eyebrow="Offer management"
        description={isFetching ? "Refreshing offer packets..." : "Create, send, and track offer packets with e-signature status."}
        actions={<Link href="/hiring/offers/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus size={16} /> Create Offer</Link>}
      />
      <div className="flex flex-wrap gap-2">
        {(["All", "Pending", "Accepted", "Declined", "Countered"] as Array<OfferStatus | "All">).map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={cx("rounded-lg border px-3 py-2 text-sm font-bold", filter === item ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300")}>{item}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Offer Date</th>
                <th className="px-5 py-3">Salary</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {offers.map((offer) => {
                const candidate = getCandidateById(offer.candidateId) || getAtsCandidates()[0];
                const job = getJobById(offer.jobId) || getAtsJobs()[0];
                return (
                  <tr key={offer.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar candidate={candidate} />
                        <div>
                          <div className="font-bold text-slate-950 dark:text-white">{getCandidateName(candidate)}</div>
                          <div className="text-xs text-slate-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{job.title}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(offer.offerDate)}</td>
                    <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{formatMoney(offer.salary)}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(offer.startDate)}</td>
                    <td className="px-5 py-4"><StatusBadge status={offer.status} /></td>
                    <td className="px-5 py-4 text-right">
                      {offer.status === "Accepted" ? (
                        <button type="button" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Move to Onboarding</button>
                      ) : (
                        <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Track Opens</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OfferNewScreen() {
  const router = useRouter();
  const offerCandidates = getAtsCandidates().filter((candidate) => candidate.stage === "Offer");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    candidateId: offerCandidates[0]?.id || "",
    salary: "176000",
    signingBonus: "15000",
    equity: "8,000 options",
    startDate: "2026-06-24",
    template: "Standard US Full-Time",
  });
  const candidate = getCandidateById(form.candidateId) || offerCandidates[0];
  const job = candidate ? getJobById(candidate.jobId) : undefined;
  const steps = ["Candidate", "Variables", "Template", "Send"];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Create Offer" eyebrow="Offer Letter Wizard" description="Generate the packet, fill variables, route through DocuSign, and send to the candidate." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2">
          {steps.map((item, index) => (
            <button key={item} type="button" onClick={() => setStep(index)} className={cx("flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold", step === index ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300" : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}>
              <span className={cx("flex h-6 w-6 items-center justify-center rounded-full text-xs", step > index ? "bg-emerald-500 text-white" : step === index ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>{step > index ? <Check size={13} /> : index + 1}</span>
              {item}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="min-h-[500px] p-6">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {offerCandidates.map((item) => (
                  <button key={item.id} type="button" onClick={() => setForm({ ...form, candidateId: item.id })} className={cx("rounded-xl border p-4 text-left transition", form.candidateId === item.id ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 hover:border-blue-200 dark:border-slate-700")}>
                    <div className="flex items-center gap-3">
                      <CandidateAvatar candidate={item} />
                      <div>
                        <div className="font-bold text-slate-950 dark:text-white">{getCandidateName(item)}</div>
                        <div className="text-xs text-slate-500">{getJobById(item.jobId)?.title}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label><span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Base salary</span><Input type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} /></label>
                <label><span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Signing bonus</span><Input type="number" value={form.signingBonus} onChange={(event) => setForm({ ...form, signingBonus: event.target.value })} /></label>
                <label><span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Equity</span><Input value={form.equity} onChange={(event) => setForm({ ...form, equity: event.target.value })} /></label>
                <label><span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Start date</span><Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                {["Standard US Full-Time", "Executive Track", "Contractor Agreement", "International EOR"].map((template) => (
                  <label key={template} className={cx("flex items-center gap-3 rounded-xl border p-4", form.template === template ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-700")}>
                    <input type="radio" checked={form.template === template} onChange={() => setForm({ ...form, template })} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{template}</span>
                  </label>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-slate-900 shadow-sm">
                  <div className="text-center text-xl font-bold">Employment Offer Letter</div>
                  <p className="mt-6">Dear {candidate?.firstName || "Candidate"},</p>
                  <p className="mt-4 leading-7">CircleWorks is pleased to offer you the role of {job?.title || "new team member"}.</p>
                  <ul className="mt-4 list-disc space-y-1 pl-5">
                    <li>Base salary: {formatMoney(Number(form.salary))}</li>
                    <li>Signing bonus: {formatMoney(Number(form.signingBonus))}</li>
                    <li>Equity: {form.equity}</li>
                    <li>Start date: {formatDate(form.startDate)}</li>
                  </ul>
                  <div className="mt-8 rounded border border-slate-200 p-4 text-sm text-slate-500">DocuSign signature block</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ChevronLeft size={16} /> Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Continue <ChevronRight size={16} /></Button>
            ) : (
              <Button onClick={() => { toast.success("Offer sent", { description: "DocuSign packet is tracking opens." }); router.push("/hiring/offers"); }}>Send via DocuSign</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AtsSettingsScreen() {
  const [stages, setStages] = useState(STAGES);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Hiring Settings" eyebrow="ATS configuration" description="Pipeline stages, email templates, scorecards, job board integrations, and compliance guardrails." actions={<Button><Settings size={16} /> Save Changes</Button>} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-2">
          {["Pipeline Stages", "Email Templates", "Global Scorecards", "Job Board API", "Compliance"].map((item, index) => (
            <button key={item} type="button" className={cx("w-full rounded-xl border px-4 py-3 text-left text-sm font-bold", index === 0 ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300" : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}>{item}</button>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold text-slate-950 dark:text-white">Pipeline Stages</h2>
          <div className="mt-5 space-y-3">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <GripVertical size={18} className="text-slate-400" />
                <span className={cx("h-3 w-3 rounded-full", stage.color)} />
                <Input value={stage.title} onChange={(event) => setStages(stages.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)))} />
                <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><X size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Plus size={16} /> Add Stage</button>
        </div>
      </div>
    </div>
  );
}

export default function HiringModuleScreens({ screen }: { screen: HiringModuleScreen }) {
  if (screen === "overview") return <AtsOverviewScreen />;
  if (screen === "jobs") return <JobsScreen />;
  if (screen === "templates") return <JobTemplatesScreen />;
  if (screen === "job-new") return <JobFormScreen mode="new" />;
  if (screen === "job-edit") return <JobFormScreen mode="edit" />;
  if (screen === "pipeline") return <PipelineScreen />;
  if (screen === "candidates") return <CandidatesScreen />;
  if (screen === "candidate-profile") return <CandidateProfileScreen />;
  if (screen === "interviews") return <InterviewsScreen />;
  if (screen === "interview-detail") return <InterviewDetailScreen />;
  if (screen === "offers") return <OffersScreen />;
  if (screen === "offer-new") return <OfferNewScreen />;
  return <AtsSettingsScreen />;
}
