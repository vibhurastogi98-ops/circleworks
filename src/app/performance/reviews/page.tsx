"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Plus, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

type ReviewStatus = "draft" | "submitted" | "completed";
type Review = {
  id: number;
  employeeId: number;
  reviewerId: number | null;
  cyclePeriod: string;
  status: ReviewStatus;
  overallRating: number | null;
  comments: string | null;
  submittedAt: string | null;
  createdAt: string | null;
  employeeFirst: string | null;
  employeeLast: string | null;
  reviewerFirst: string | null;
  reviewerLast: string | null;
};
type Employee = { id: number; firstName: string; lastName: string | null };

const STATUS_LABEL: Record<ReviewStatus, string> = { draft: "Draft", submitted: "Submitted", completed: "Completed" };
const STATUS_CLASS: Record<ReviewStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  submitted: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function ReviewsListPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  const load = useCallback(async () => {
    try {
      const [rr, er] = await Promise.all([
        fetch("/api/performance/reviews", { cache: "no-store", credentials: "include" }),
        fetch("/api/employees", { cache: "no-store", credentials: "include" }),
      ]);
      if (rr.status === 401) { setErr("Please sign in."); return; }
      if (!rr.ok) { setErr(`Failed (HTTP ${rr.status})`); return; }
      const rd = await rr.json();
      setReviews(rd.reviews ?? []);
      if (er.ok) {
        const ed = await er.json();
        const list = Array.isArray(ed) ? ed : ed.employees ?? [];
        setEmployees(list.map((e: { id: number; firstName?: string; lastName?: string | null }) => ({ id: e.id, firstName: e.firstName ?? "", lastName: e.lastName ?? null })));
      }
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cycles = useMemo(() => Array.from(new Set((reviews ?? []).map((r) => r.cyclePeriod))).sort().reverse(), [reviews]);
  const filtered = useMemo(() => {
    return (reviews ?? []).filter((r) => {
      const nameHit = `${r.employeeFirst ?? ""} ${r.employeeLast ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const cycleHit = cycleFilter === "all" || r.cyclePeriod === cycleFilter;
      return nameHit && cycleHit;
    });
  }, [reviews, search, cycleFilter]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Performance Reviews</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">All Reviews</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Per-employee reviews grouped by cycle period. Draft → Submitted → Completed.</p>
        </div>
        <button onClick={() => setShowCreate(true)} disabled={employees.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
          <Plus size={18} /> New review
        </button>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee name" className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
        <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="all">All cycles</option>
          {cycles.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Reviewer</th>
              <th className="px-5 py-3">Cycle</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reviews === null && !err && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {reviews?.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500"><ClipboardList className="mx-auto mb-2 h-6 w-6" /> No reviews yet. Click <strong>New review</strong>.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3 font-black text-slate-950 dark:text-white">{r.employeeFirst} {r.employeeLast ?? ""}</td>
                <td className="px-5 py-3 text-slate-500">{r.reviewerFirst ? `${r.reviewerFirst} ${r.reviewerLast ?? ""}` : "—"}</td>
                <td className="px-5 py-3 font-mono text-xs">{r.cyclePeriod}</td>
                <td className="px-5 py-3">{r.overallRating ? `${r.overallRating} / 5` : "—"}</td>
                <td className="px-5 py-3"><span className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setEditing(r)} className="text-sm font-bold text-blue-600 hover:underline">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateReviewModal employees={employees} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); void load(); }} />}
      {editing && <EditReviewModal review={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm";

function CreateReviewModal({ employees, onClose, onSaved }: { employees: Employee[]; onClose: () => void; onSaved: () => void }) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? 0);
  const [reviewerId, setReviewerId] = useState<number | "">("");
  const [cyclePeriod, setCyclePeriod] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!employeeId) { toast.error("Pick an employee"); return; }
    if (!cyclePeriod.trim()) { toast.error("Cycle period required"); return; }
    setBusy(true);
    const r = await fetch("/api/performance/reviews", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId, reviewerId: reviewerId || null, cyclePeriod }) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `create_failed`); return; }
    toast.success("Review created");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">New review</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Employee</span>
            <select value={employeeId} onChange={(e) => setEmployeeId(Number(e.target.value))} className={inputCls}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName ?? ""}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Reviewer (optional)</span>
            <select value={reviewerId} onChange={(e) => setReviewerId(e.target.value ? Number(e.target.value) : "")} className={inputCls}>
              <option value="">— none —</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName ?? ""}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Cycle period</span><input value={cyclePeriod} onChange={(e) => setCyclePeriod(e.target.value)} placeholder="e.g. Q2 2026 or H1 2026" className={inputCls} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create draft
          </button>
        </div>
      </div>
    </div>
  );
}

function EditReviewModal({ review, onClose, onSaved }: { review: Review; onClose: () => void; onSaved: () => void }) {
  const [overallRating, setOverallRating] = useState<number | "">(review.overallRating ?? "");
  const [comments, setComments] = useState(review.comments ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(label);
    const r = await fetch("/api/performance/reviews", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: review.id, ...body }) });
    setBusy(null);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `${label}_failed`); return false; }
    return true;
  }

  async function save() {
    if (await patch({ overallRating: overallRating || null, comments }, "save")) { toast.success("Saved"); onSaved(); }
  }
  async function submit() {
    if (await patch({ overallRating: overallRating || null, comments, status: "submitted" }, "submit")) { toast.success("Submitted"); onSaved(); }
  }
  async function complete() {
    if (await patch({ status: "completed" }, "complete")) { toast.success("Marked completed"); onSaved(); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">{review.employeeFirst} {review.employeeLast ?? ""}</h3>
            <p className="text-xs text-slate-500">{review.cyclePeriod} · {STATUS_LABEL[review.status]}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Overall rating (1-5)</span>
            <select value={overallRating} onChange={(e) => setOverallRating(e.target.value ? Number(e.target.value) : "")} className={inputCls} disabled={review.status === "completed"}>
              <option value="">— unrated —</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Comments</span><textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={5} className={inputCls} disabled={review.status === "completed"} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-2">
          {review.status !== "completed" && (
            <button onClick={save} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save draft
            </button>
          )}
          {review.status === "draft" && (
            <button onClick={submit} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
              {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit
            </button>
          )}
          {review.status === "submitted" && (
            <button onClick={complete} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
              {busy === "complete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Mark completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
