import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { atsCandidates, atsJobs } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["Active", "Draft", "Closed", "On Hold"]);
const EMPLOYMENT_TYPES = new Set(["Full-Time", "Part-Time", "Contract", "Internship", "Temporary"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

/**
 * Frontend uses stringified ids (mock shape) and expects several fields the
 * DB doesn't store (description/requirements/responsibilities/etc.). We
 * return the DB truth with sensible defaults for those; a future schema
 * pass can promote them to real columns.
 */
function shapeJob(row: {
  id: number;
  title: string;
  department: string | null;
  location: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  managerId: number | null;
  status: string | null;
  createdAt: Date | null;
}, applicantsCount: number) {
  const posted = row.createdAt ?? new Date();
  const daysOpen = Math.max(0, Math.floor((Date.now() - posted.getTime()) / 86400000));
  return {
    id: String(row.id),
    title: row.title,
    department: row.department ?? "General",
    location: row.location ?? "Remote",
    locationType: "Remote" as const,
    type: row.employmentType ?? "Full-Time",
    status: row.status ?? "Active",
    applicantsCount,
    daysOpen,
    postedDate: posted.toISOString(),
    salaryMin: row.salaryMin ?? 0,
    salaryMax: row.salaryMax ?? 0,
    description: "",
    requirements: [] as string[],
    responsibilities: [] as string[],
    interviewStages: [] as string[],
    hiringManagerId: row.managerId ? String(row.managerId) : "",
    teamMemberIds: [] as string[],
    publishOptions: { internalOnly: false, publicPosting: true, indeed: false, linkedIn: false },
  };
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;

  const rows = await db
    .select()
    .from(atsJobs)
    .where(eq(atsJobs.companyId, gate.ctx.companyId))
    .orderBy(desc(atsJobs.createdAt));

  const counts = rows.length
    ? await db
        .select({ jobId: atsCandidates.jobId, n: sql<number>`count(*)::int` })
        .from(atsCandidates)
        .where(sql`${atsCandidates.jobId} IN ${rows.map((r) => r.id)}`)
        .groupBy(atsCandidates.jobId)
    : [];
  const countByJob = new Map<number, number>();
  for (const c of counts) if (c.jobId !== null) countByJob.set(c.jobId, c.n);

  return NextResponse.json({ jobs: rows.map((r) => shapeJob(r, countByJob.get(r.id) ?? 0)) });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const employmentType = typeof body.type === "string" && EMPLOYMENT_TYPES.has(body.type)
    ? body.type
    : typeof body.employmentType === "string" && EMPLOYMENT_TYPES.has(body.employmentType)
      ? body.employmentType
      : "Full-Time";
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "Active";

  const [row] = await db.insert(atsJobs).values({
    companyId: gate.ctx.companyId,
    title,
    department: typeof body.department === "string" ? body.department.trim() || null : null,
    location: typeof body.location === "string" ? body.location.trim() || null : null,
    employmentType,
    salaryMin: Number.isFinite(Number(body.salaryMin)) ? Number(body.salaryMin) : null,
    salaryMax: Number.isFinite(Number(body.salaryMax)) ? Number(body.salaryMax) : null,
    managerId: Number.isInteger(Number(body.managerId)) ? Number(body.managerId) : null,
    status,
  }).returning();
  return NextResponse.json({ ok: true, job: shapeJob(row, 0) });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db.select({ id: atsJobs.id }).from(atsJobs).where(and(eq(atsJobs.id, id), eq(atsJobs.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.department === "string") patch.department = body.department.trim() || null;
  if (typeof body.location === "string") patch.location = body.location.trim() || null;
  if (typeof body.employmentType === "string" && EMPLOYMENT_TYPES.has(body.employmentType)) patch.employmentType = body.employmentType;
  if (typeof body.type === "string" && EMPLOYMENT_TYPES.has(body.type)) patch.employmentType = body.type;
  if (Number.isFinite(Number(body.salaryMin))) patch.salaryMin = Number(body.salaryMin);
  if (Number.isFinite(Number(body.salaryMax))) patch.salaryMax = Number(body.salaryMax);
  if (typeof body.status === "string" && STATUSES.has(body.status)) patch.status = body.status;

  const [row] = await db.update(atsJobs).set(patch).where(eq(atsJobs.id, id)).returning();
  return NextResponse.json({ ok: true, job: shapeJob(row, 0) });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: atsJobs.id }).from(atsJobs).where(and(eq(atsJobs.id, id), eq(atsJobs.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  // Soft-close instead of delete — cascades on ats_jobs would nuke every
  // candidate and offer tied to the job, which is almost never what a
  // recruiter means by "delete this job posting."
  await db.update(atsJobs).set({ status: "Closed" }).where(eq(atsJobs.id, id));
  return NextResponse.json({ ok: true, softClosed: true });
}
