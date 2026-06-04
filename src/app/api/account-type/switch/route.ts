import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { companies, workspaceAuditLogs } from "@/db/schema";
import { isAccountType, type AccountType } from "@/lib/account-types";
import { resolveDashboard } from "@/lib/dashboard-resolver";
import { createSessionToken, getSession, resolveUserContext, SESSION_COOKIE } from "@/lib/session";

function canSwitchAccountType(role?: string | null) {
  const normalizedRole = (role ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalizedRole === "owner" || normalizedRole === "super_admin" || normalizedRole === "admin";
}

function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canSwitchAccountType(session.role)) {
    return NextResponse.json({ error: "Only owners and admins can switch account type" }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as { accountType?: unknown } | null;
  const accountType = payload?.accountType;
  if (!isAccountType(accountType)) {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  }

  const context = await resolveUserContext(session);
  if (!context?.companyId) {
    return NextResponse.json({ error: "Workspace not found for current user" }, { status: 404 });
  }

  const [company] = await db
    .select({
      id: companies.id,
      name: companies.name,
      accountType: companies.accountType,
    })
    .from(companies)
    .where(eq(companies.id, context.companyId))
    .limit(1);

  if (!company) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const previousAccountType = company.accountType as AccountType;

  if (previousAccountType !== accountType) {
    await db
      .update(companies)
      .set({ accountType })
      .where(eq(companies.id, company.id));

    await db.insert(workspaceAuditLogs).values({
      companyId: company.id,
      actorUserId: session.userId,
      action: "account_type.switch",
      resource: `company:${company.id}`,
      metadata: {
        previousAccountType,
        nextAccountType: accountType,
        companyName: company.name,
      },
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });
  }

  const redirectTo = resolveDashboard(accountType);
  const response = NextResponse.json({
    success: true,
    redirectTo,
    accountType,
    previousAccountType,
    auditLogged: previousAccountType !== accountType,
  });

  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken({ ...session, accountType }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    },
  );

  return response;
}
