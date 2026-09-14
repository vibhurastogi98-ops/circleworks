import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { atsCandidates, atsJobs } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export const STAGES = ["New", "Screening", "Take-Home", "Onsite", "Offer", "Hired", "Withdrawn"] as const;
const STAGE_SET: Set<string> = new Set(STAGES);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

/**
 * Shape a candidate row for the frontend, which was written against the
 * richer mock type. Missing fields get sensible zero-defaults.
 */
function shapeCandidate(row: {
  id: number;
  jobId: number | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  stage: string | null;
  createdAt: Date | null;
}) {
  const applied = row.createdAt ?? new Date();
  const daysInStage = Math.max(0, Math.floor((Date.now() - applied.getTime()) / 86400000));
  return {
    id: String(row.id),
    jobId: row.jobId ? String(row.jobId) : "",
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email ?? "",
    phone: row.phone ?? undefined,
    location: "",
    source: "Manual" as const,
    stage: (row.stage ?? "New") as (typeof STAGES)[number],
    appliedDate: applied.toISOString(),
    aiScore: 0,
    daysInStage,
    resumeSnippet: "",
    reviewers: [] as string[],
    reviewerIds: [] as string[],
    currentTitle: "",
    skills: [] as string[],
    notes: [] as { author: string; body: string; createdAt: string }[],
    activity: [] as { label: string; detail: string; createdAt: string }[],
  };
}

async function assertJobInCompany(jobId: number, companyId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: atsJobs.id })
    .from(atsJobs)
    .where(and(eq(atsJobs.id, jobId), eq(atsJobs.companyId, companyId)))
    .limit(1);
  return Boolean(row);
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;

  // Scope: candidates whose parent job belongs to this company.
  const rows = await db
    .select({
      id: atsCandidates.id,
      jobId: atsCandidates.jobId,
      firstName: atsCandidates.firstName,
      lastName: atsCandidates.lastName,
      email: atsCandidates.email,
      phone: atsCandidates.phone,
      stage: atsCandidates.stage,
      createdAt: atsCandidates.createdAt,
    })
    .from(atsCandidates)
    .innerJoin(atsJobs, eq(atsCandidates.jobId, atsJobs.id))
    .where(eq(atsJobs.companyId, gate.ctx.companyId))
    .orderBy(desc(atsCandidates.createdAt));

  return NextResponse.json({ candidates: rows.map(shapeCandidate) });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const jobId = Number(body.jobId);
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() || null : null;
  const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
  const stage = typeof body.stage === "string" && STAGE_SET.has(body.stage) ? body.stage : "New";

  if (!Number.isInteger(jobId) || jobId <= 0) return NextResponse.json({ error: "invalid_job_id" }, { status: 400 });
  if (!firstName || !lastName) return NextResponse.json({ error: "first_and_last_name_required" }, { status: 400 });
  if (!(await assertJobInCompany(jobId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "job_not_in_company" }, { status: 404 });
  }

  const [row] = await db.insert(atsCandidates).values({
    jobId, firstName, lastName, email, phone, stage,
  }).returning();
  return NextResponse.json({ ok: true, candidate: shapeCandidate(row) });
}
