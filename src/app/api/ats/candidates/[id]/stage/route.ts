import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { atsCandidates, atsJobs } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STAGES = ["New", "Screening", "Take-Home", "Onsite", "Offer", "Hired", "Withdrawn"] as const;
const STAGE_SET: Set<string> = new Set(STAGES);

type RouteContext = { params: Promise<{ id: string }> };

async function updateStage(request: Request, { params }: RouteContext) {
  const session = await getSession(request as unknown as Parameters<typeof getSession>[0]);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const { id } = await params;
  const candidateId = Number(id);
  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { newStage?: unknown };
  const newStage = typeof body.newStage === "string" ? body.newStage : "";
  if (!STAGE_SET.has(newStage)) {
    return NextResponse.json({ error: "invalid_stage", allowed: [...STAGES] }, { status: 400 });
  }

  // Scope-check: candidate must belong to a job in the caller's company.
  const [row] = await db
    .select({ id: atsCandidates.id, jobId: atsCandidates.jobId })
    .from(atsCandidates)
    .innerJoin(atsJobs, eq(atsCandidates.jobId, atsJobs.id))
    .where(and(eq(atsCandidates.id, candidateId), eq(atsJobs.companyId, ctx.companyId)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  await db.update(atsCandidates).set({ stage: newStage }).where(eq(atsCandidates.id, candidateId));
  return NextResponse.json({ ok: true, id: String(candidateId), stage: newStage });
}

export async function PATCH(request: Request, ctx: RouteContext) {
  return updateStage(request, ctx);
}

export async function POST(request: Request, ctx: RouteContext) {
  return updateStage(request, ctx);
}
