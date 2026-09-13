import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customFieldDefinitions } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const FIELD_TYPES = new Set(["text", "number", "date", "dropdown"]);
const APPLIES_TO = new Set(["employee", "contractor"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

function normalizeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const rows = await db
    .select()
    .from(customFieldDefinitions)
    .where(eq(customFieldDefinitions.companyId, gate.ctx.companyId))
    .orderBy(asc(customFieldDefinitions.appliesTo), asc(customFieldDefinitions.name));
  return NextResponse.json({ definitions: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const fieldType = typeof body.fieldType === "string" ? body.fieldType : "";
  const appliesTo = typeof body.appliesTo === "string" ? body.appliesTo : "employee";
  const options = normalizeOptions(body.options);
  const required = Boolean(body.required);

  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!FIELD_TYPES.has(fieldType)) return NextResponse.json({ error: "invalid_field_type", allowed: [...FIELD_TYPES] }, { status: 400 });
  if (!APPLIES_TO.has(appliesTo)) return NextResponse.json({ error: "invalid_applies_to", allowed: [...APPLIES_TO] }, { status: 400 });
  if (fieldType === "dropdown" && options.length === 0) {
    return NextResponse.json({ error: "dropdown_needs_options" }, { status: 400 });
  }

  try {
    const [row] = await db.insert(customFieldDefinitions).values({
      companyId: gate.ctx.companyId,
      name,
      fieldType,
      appliesTo,
      options: fieldType === "dropdown" ? options : [],
      required,
      createdBy: gate.session.userId,
    }).returning();
    return NextResponse.json({ ok: true, definition: row });
  } catch (e) {
    if (/unique|duplicate/i.test((e as Error).message)) {
      return NextResponse.json({ error: "name_in_use" }, { status: 409 });
    }
    throw e;
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(customFieldDefinitions)
    .where(and(eq(customFieldDefinitions.id, id), eq(customFieldDefinitions.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.fieldType === "string" && FIELD_TYPES.has(body.fieldType)) patch.fieldType = body.fieldType;
  if (typeof body.appliesTo === "string" && APPLIES_TO.has(body.appliesTo)) patch.appliesTo = body.appliesTo;
  if (Array.isArray(body.options)) patch.options = normalizeOptions(body.options);
  if (typeof body.required === "boolean") patch.required = body.required;

  const nextType = (patch.fieldType as string | undefined) ?? existing.fieldType;
  const nextOptions = (patch.options as string[] | undefined) ?? existing.options;
  if (nextType === "dropdown" && (!Array.isArray(nextOptions) || nextOptions.length === 0)) {
    return NextResponse.json({ error: "dropdown_needs_options" }, { status: 400 });
  }
  if (nextType !== "dropdown") patch.options = [];

  const [row] = await db.update(customFieldDefinitions).set(patch).where(eq(customFieldDefinitions.id, id)).returning();
  return NextResponse.json({ ok: true, definition: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db
    .select({ id: customFieldDefinitions.id })
    .from(customFieldDefinitions)
    .where(and(eq(customFieldDefinitions.id, id), eq(customFieldDefinitions.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(customFieldDefinitions).where(eq(customFieldDefinitions.id, id));
  return NextResponse.json({ ok: true });
}
