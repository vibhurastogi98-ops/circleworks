import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/db/schema";
import { isAccountType } from "@/lib/account-types";
import { resolveDashboard } from "@/lib/dashboard-resolver";
import { createSessionToken, getSession, resolveUserContext, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { accountType?: unknown } | null;
  const accountType = payload?.accountType;
  if (!isAccountType(accountType)) {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  }

  const context = await resolveUserContext(session);
  if (!context?.companyId) {
    return NextResponse.json({ error: "Account not found for current user" }, { status: 404 });
  }

  await db
    .update(companies)
    .set({ accountType })
    .where(eq(companies.id, context.companyId));

  const redirectTo = resolveDashboard(accountType);
  const response = NextResponse.json({ success: true, redirectTo, accountType });
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
