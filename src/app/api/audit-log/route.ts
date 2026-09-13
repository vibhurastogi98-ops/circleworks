import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { users, workspaceAuditLogs } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Tenant-scoped read of workspace_audit_logs.
 * Distinct from /api/platform/audit which is the god-mode admin view.
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const days = Math.min(365, Math.max(1, Number(request.nextUrl.searchParams.get("days") ?? "90")));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: workspaceAuditLogs.id,
      action: workspaceAuditLogs.action,
      resource: workspaceAuditLogs.resource,
      metadata: workspaceAuditLogs.metadata,
      ipAddress: workspaceAuditLogs.ipAddress,
      createdAt: workspaceAuditLogs.createdAt,
      actorEmail: users.email,
    })
    .from(workspaceAuditLogs)
    .leftJoin(users, eq(workspaceAuditLogs.actorUserId, users.id))
    .where(and(eq(workspaceAuditLogs.companyId, ctx.companyId), gte(workspaceAuditLogs.createdAt, cutoff)))
    .orderBy(desc(workspaceAuditLogs.createdAt))
    .limit(500);

  return NextResponse.json({ logs: rows });
}
