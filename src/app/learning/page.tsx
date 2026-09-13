"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, CheckCircle2, Clock, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

type Course = {
  id: number;
  title: string;
  description: string | null;
  provider: string | null;
  durationMinutes: number | null;
};
type EnrollmentStatus = "enrolled" | "in_progress" | "completed";
type Enrollment = {
  id: number;
  employeeId: number;
  courseId: number;
  status: EnrollmentStatus;
  progressPct: number;
  enrolledAt: string | null;
  completedAt: string | null;
  courseTitle: string;
  courseProvider: string | null;
  courseDurationMinutes: number | null;
  employeeFirst: string | null;
  employeeLast: string | null;
};
type Employee = { id: number; firstName: string; lastName: string | null };

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [enrollmentEmployeeId, setEnrollmentEmployeeId] = useState<number | "">("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cr, er, empr] = await Promise.all([
        fetch("/api/learning/courses", { cache: "no-store", credentials: "include" }),
        fetch("/api/learning/enrollments", { cache: "no-store", credentials: "include" }),
        fetch("/api/employees", { cache: "no-store", credentials: "include" }),
      ]);
      if (cr.status === 401) { setErr("Please sign in."); return; }
      if (!cr.ok || !er.ok) { setErr(`Failed (HTTP ${cr.status}/${er.status})`); return; }
      setCourses((await cr.json()).courses ?? []);
      setEnrollments((await er.json()).enrollments ?? []);
      if (empr.ok) {
        const ed = await empr.json();
        const list = Array.isArray(ed) ? ed : ed.employees ?? [];
        setEmployees(list.map((e: { id: number; firstName?: string; lastName?: string | null }) => ({ id: e.id, firstName: e.firstName ?? "", lastName: e.lastName ?? null })));
      }
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function enroll(courseId: number, employeeId: number) {
    setBusy(`enroll-${courseId}`);
    const r = await fetch("/api/learning/enrollments", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, employeeId }) });
    setBusy(null);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `enroll_failed`); return; }
    toast.success(d.existed ? "Already enrolled." : "Enrolled.");
    setEnrollingCourseId(null); setEnrollmentEmployeeId("");
    void load();
  }

  async function updateProgress(enrollmentId: number, progressPct: number) {
    setBusy(`prog-${enrollmentId}`);
    const r = await fetch("/api/learning/enrollments", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: enrollmentId, progressPct }) });
    setBusy(null);
    if (!r.ok) { toast.error("update_failed"); return; }
    void load();
  }

  async function markComplete(enrollmentId: number) {
    setBusy(`complete-${enrollmentId}`);
    const r = await fetch("/api/learning/enrollments", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: enrollmentId, status: "completed" }) });
    setBusy(null);
    if (!r.ok) { toast.error("complete_failed"); return; }
    toast.success("Marked complete.");
    void load();
  }

  const enrolledCount = enrollments?.filter((e) => e.status !== "completed").length ?? 0;
  const completedCount = enrollments?.filter((e) => e.status === "completed").length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Learning</p>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">Course catalog</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enroll employees in courses. Certificate generation is not wired in this build — completion is recorded but no PDF is produced.</p>
      </section>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Available courses" value={String(courses?.length ?? 0)} />
        <Stat icon={<PlayCircle className="h-5 w-5 text-amber-600" />} label="In progress" value={String(enrolledCount)} />
        <Stat icon={<Award className="h-5 w-5 text-emerald-600" />} label="Completions" value={String(completedCount)} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-black text-slate-950 dark:text-white">Catalog</h2>
        {!courses && !err && <p className="text-sm text-slate-500">Loading…</p>}
        {courses?.length === 0 && <p className="text-sm text-slate-500">No courses in the catalog.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {courses?.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-black text-slate-950 dark:text-white">{c.title}</h3>
              {c.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{c.provider ?? "—"}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.durationMinutes ? `${c.durationMinutes} min` : "—"}</span>
              </div>
              {enrollingCourseId === c.id ? (
                <div className="mt-4 flex gap-2">
                  <select value={enrollmentEmployeeId} onChange={(e) => setEnrollmentEmployeeId(e.target.value ? Number(e.target.value) : "")} className="h-9 flex-1 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="">— pick employee —</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName ?? ""}</option>)}
                  </select>
                  <button
                    onClick={() => enrollmentEmployeeId && enroll(c.id, enrollmentEmployeeId)}
                    disabled={!enrollmentEmployeeId || busy === `enroll-${c.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-2 text-sm font-bold text-white"
                  >
                    {busy === `enroll-${c.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Enroll
                  </button>
                  <button onClick={() => { setEnrollingCourseId(null); setEnrollmentEmployeeId(""); }} className="text-xs text-slate-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEnrollingCourseId(c.id)} disabled={employees.length === 0} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                  <BookOpen className="h-3.5 w-3.5" />
                  Enroll an employee
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-black text-slate-950 dark:text-white">Enrollments</h2>
        {enrollments === null && !err && <p className="text-sm text-slate-500">Loading…</p>}
        {enrollments?.length === 0 && <p className="text-sm text-slate-500">No enrollments yet.</p>}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments?.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{e.employeeFirst} {e.employeeLast ?? ""}</td>
                  <td className="px-5 py-3 text-slate-500">{e.courseTitle}</td>
                  <td className="px-5 py-3">
                    {e.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3" /> 100%</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={100} step={5} value={e.progressPct} onChange={(ev) => updateProgress(e.id, Number(ev.target.value))} disabled={busy === `prog-${e.id}`} />
                        <span className="w-10 text-right text-xs font-bold">{e.progressPct}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      e.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" :
                      e.status === "in_progress" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>{e.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {e.status !== "completed" && (
                      <button onClick={() => markComplete(e.id)} disabled={busy === `complete-${e.id}`} className="text-sm font-bold text-emerald-600 hover:underline disabled:opacity-50">Mark complete</button>
                    )}
                    {e.status === "completed" && (
                      <button onClick={() => toast.info("PDF certificate generation not wired in this build. Completion is recorded in the DB.")} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-blue-600">
                        <Award className="h-3.5 w-3.5" /> Certificate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {icon}
      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
