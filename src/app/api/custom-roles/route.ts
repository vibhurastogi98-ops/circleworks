import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customRoles } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const rows = await db
    .select()
    .from(customRoles)
    .where(eq(customRoles.companyId, gate.ctx.companyId))
    .orderBy(asc(customRoles.name));
  return NextResponse.json({ roles: rows });
}

function normalizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.filter((p) => typeof p === "string" && p.trim()).map((p) => (p as string).trim())));
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  try {
    const [row] = await db.insert(customRoles).values({
      companyId: gate.ctx.companyId,
      name,
      description: typeof body.description === "string" ? body.description.trim() : null,
      basedOn: typeof body.basedOn === "string" ? body.basedOn : null,
      permissions: normalizePermissions(body.permissions),
      createdBy: gate.session.userId,
    }).returning();
    return NextResponse.json({ ok: true, role: row });
  } catch (e) {
    const msg = (e as Error).message ?? "insert_failed";
    if (/unique|duplicate/i.test(msg)) return NextResponse.json({ error: "name_in_use" }, { status: 409 });
    throw e;
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db.select({ id: customRoles.id }).from(customRoles).where(and(eq(customRoles.id, id), eq(customRoles.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.description === "string") patch.description = body.description.trim() || null;
  if (typeof body.basedOn === "string") patch.basedOn = body.basedOn || null;
  if (Array.isArray(body.permissions)) patch.permissions = normalizePermissions(body.permissions);

  const [row] = await db.update(customRoles).set(patch).where(eq(customRoles.id, id)).returning();
  return NextResponse.json({ ok: true, role: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: customRoles.id }).from(customRoles).where(and(eq(customRoles.id, id), eq(customRoles.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(customRoles).where(eq(customRoles.id, id));
  return NextResponse.json({ ok: true });
}
