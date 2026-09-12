import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { db } from "@/db";
import { platformAuditLogs, platformAdmins } from "@/db/schema";
import { getPlatformSession } from "@/lib/platform-session";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { clientKey, rateLimit } from "@/lib/platform-rate-limit";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  const session = await getPlatformSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasPlatformPermission(session.role, "audit.export")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rl = await rateLimit({
    key: `${clientKey(request, "platform:audit:export")}:${session.adminId}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const url = new URL(request.url);
  const actor = url.searchParams.get("actor");
  const action = url.searchParams.get("action");
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");

  const filter = and(
    actor ? eq(platformAuditLogs.actorAdminId, Number(actor)) : sql`TRUE`,
    action ? ilike(platformAuditLogs.action, `%${action}%`) : sql`TRUE`,
    targetType ? eq(platformAuditLogs.targetType, targetType) : sql`TRUE`,
    targetId ? eq(platformAuditLogs.targetId, targetId) : sql`TRUE`,
  );

  const rows = await db
    .select({
      id: platformAuditLogs.id,
      createdAt: platformAuditLogs.createdAt,
      actorAdminId: platformAuditLogs.actorAdminId,
      actorEmail: platformAdmins.email,
      actorRole: platformAuditLogs.actorRole,
      action: platformAuditLogs.action,
      targetType: platformAuditLogs.targetType,
      targetId: platformAuditLogs.targetId,
      reasonCode: platformAuditLogs.reasonCode,
      reasonNotes: platformAuditLogs.reasonNotes,
      ipAddress: platformAuditLogs.ipAddress,
      userAgent: platformAuditLogs.userAgent,
    })
    .from(platformAuditLogs)
    .leftJoin(platformAdmins, eq(platformAuditLogs.actorAdminId, platformAdmins.id))
    .where(filter)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(50000);

  const header = [
    "id", "created_at", "actor_admin_id", "actor_email", "actor_role",
    "action", "target_type", "target_id", "reason_code", "reason_notes",
    "ip_address", "user_agent",
  ];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.createdAt?.toISOString(),
        r.actorAdminId ?? "",
        r.actorEmail ?? "",
        r.actorRole ?? "",
        r.action,
        r.targetType,
        r.targetId,
        r.reasonCode ?? "",
        r.reasonNotes ?? "",
        r.ipAddress ?? "",
        r.userAgent ?? "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");

  // Self-audit the export.
  await db.insert(platformAuditLogs).values({
    actorAdminId: session.adminId,
    actorRole: session.role,
    action: "audit.export",
    targetType: "audit_log",
    targetId: "range",
    metadata: { rowCount: rows.length, filters: { actor, action, targetType, targetId } },
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent"),
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="platform-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
