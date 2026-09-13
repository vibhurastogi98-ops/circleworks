import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { generateApiKey } from "@/lib/api-key-auth";

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
    .select({
      id: apiKeys.id,
      label: apiKeys.label,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.companyId, gate.ctx.companyId))
    .orderBy(desc(apiKeys.createdAt));
  return NextResponse.json({ keys: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) return NextResponse.json({ error: "label_required" }, { status: 400 });

  const { plaintext, hashed, keyPrefix } = generateApiKey();
  const [row] = await db
    .insert(apiKeys)
    .values({
      companyId: gate.ctx.companyId,
      label,
      keyPrefix,
      hashedKey: hashed,
      createdBy: gate.session.userId,
    })
    .returning({
      id: apiKeys.id,
      label: apiKeys.label,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
    });

  // Plaintext is returned exactly once. The client must show-and-store it
  // before dismissing the modal — there's no recovery flow.
  return NextResponse.json({ ok: true, key: row, plaintext });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select({ id: apiKeys.id, revokedAt: apiKeys.revokedAt })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  if (existing.revokedAt) return NextResponse.json({ error: "already_revoked" }, { status: 409 });

  await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, id));
  return NextResponse.json({ ok: true });
}
