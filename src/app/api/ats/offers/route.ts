import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { atsCandidates, atsJobs, atsOffers } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["Pending", "Sent", "Accepted", "Declined", "Withdrawn"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

function shapeOffer(row: {
  id: number;
  candidateId: number | null;
  jobId: number | null;
  salary: number | null;
  signingBonus: number | null;
  equity: string | null;
  startDate: string | null;
  status: string | null;
  sentAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date | null;
}) {
  return {
    id: String(row.id),
    candidateId: row.candidateId ? String(row.candidateId) : "",
    jobId: row.jobId ? String(row.jobId) : "",
    offerDate: (row.sentAt ?? row.createdAt ?? new Date()).toISOString(),
    salary: row.salary ?? 0,
    signingBonus: row.signingBonus ?? 0,
    equity: row.equity ?? "",
    startDate: row.startDate ?? "",
    status: (row.status ?? "Pending") as "Pending" | "Sent" | "Accepted" | "Declined" | "Withdrawn",
    template: "Standard",
    openedAt: row.respondedAt ? row.respondedAt.toISOString() : undefined,
  };
}

async function assertCandidateInCompany(candidateId: number, companyId: number) {
  const [row] = await db
    .select({ id: atsCandidates.id, jobId: atsCandidates.jobId })
    .from(atsCandidates)
    .innerJoin(atsJobs, eq(atsCandidates.jobId, atsJobs.id))
    .where(and(eq(atsCandidates.id, candidateId), eq(atsJobs.companyId, companyId)))
    .limit(1);
  return row ?? null;
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;

  const rows = await db
    .select({
      id: atsOffers.id,
      candidateId: atsOffers.candidateId,
      jobId: atsOffers.jobId,
      salary: atsOffers.salary,
      signingBonus: atsOffers.signingBonus,
      equity: atsOffers.equity,
      startDate: atsOffers.startDate,
      status: atsOffers.status,
      sentAt: atsOffers.sentAt,
      respondedAt: atsOffers.respondedAt,
      createdAt: atsOffers.createdAt,
    })
    .from(atsOffers)
    .innerJoin(atsJobs, eq(atsOffers.jobId, atsJobs.id))
    .where(eq(atsJobs.companyId, gate.ctx.companyId))
    .orderBy(desc(atsOffers.createdAt));

  return NextResponse.json({ offers: rows.map(shapeOffer) });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const candidateId = Number(body.candidateId);
  if (!Number.isInteger(candidateId) || candidateId <= 0) return NextResponse.json({ error: "invalid_candidate_id" }, { status: 400 });
  const candRow = await assertCandidateInCompany(candidateId, gate.ctx.companyId);
  if (!candRow) return NextResponse.json({ error: "candidate_not_in_company" }, { status: 404 });

  const salary = Number.isFinite(Number(body.salary)) ? Math.round(Number(body.salary)) : null;
  const signingBonus = Number.isFinite(Number(body.signingBonus)) ? Math.round(Number(body.signingBonus)) : 0;
  const equity = typeof body.equity === "string" ? body.equity.trim() || null : null;
  const startDate = typeof body.startDate === "string" && body.startDate ? body.startDate : null;
  const title = typeof body.title === "string" ? body.title.trim() || null : null;
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "Pending";

  const [row] = await db.insert(atsOffers).values({
    candidateId, jobId: candRow.jobId, salary, signingBonus, equity, startDate, title, status,
  }).returning();

  // Move the candidate to the 'Offer' stage as a side effect of creating
  // one, if they were somewhere upstream. Not applied for Withdrawn.
  if (status !== "Withdrawn") {
    await db.update(atsCandidates).set({ stage: "Offer" }).where(eq(atsCandidates.id, candidateId));
  }

  return NextResponse.json({ ok: true, offer: shapeOffer(row) });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  // Scope-check via JOIN candidate → job → company.
  const [existing] = await db
    .select({
      id: atsOffers.id,
      candidateId: atsOffers.candidateId,
      status: atsOffers.status,
    })
    .from(atsOffers)
    .innerJoin(atsJobs, eq(atsOffers.jobId, atsJobs.id))
    .where(and(eq(atsOffers.id, id), eq(atsJobs.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string" && STATUSES.has(body.status)) patch.status = body.status;
  if (Number.isFinite(Number(body.salary))) patch.salary = Math.round(Number(body.salary));
  if (Number.isFinite(Number(body.signingBonus))) patch.signingBonus = Math.round(Number(body.signingBonus));
  if (typeof body.equity === "string") patch.equity = body.equity.trim() || null;
  if (typeof body.startDate === "string") patch.startDate = body.startDate || null;
  if (typeof body.title === "string") patch.title = body.title.trim() || null;

  // Terminal transitions stamp respondedAt.
  if (patch.status === "Accepted" || patch.status === "Declined" || patch.status === "Withdrawn") {
    patch.respondedAt = new Date();
  }

  const [row] = await db.update(atsOffers).set(patch).where(eq(atsOffers.id, id)).returning();

  // Reflect status onto the candidate's stage: Accepted stays on Offer
  // (the /api/hiring/hire step promotes to Hired); Declined/Withdrawn
  // move to Withdrawn.
  if (existing.candidateId !== null) {
    if (patch.status === "Declined" || patch.status === "Withdrawn") {
      await db.update(atsCandidates).set({ stage: "Withdrawn" }).where(eq(atsCandidates.id, existing.candidateId));
    }
  }

  return NextResponse.json({ ok: true, offer: shapeOffer(row) });
}
