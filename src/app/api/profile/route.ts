import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { companies, employees, users } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function requireCtx(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx) return { error: NextResponse.json({ error: "no_employee_row" }, { status: 404 }) };
  return { session, ctx };
}

export async function GET(request: NextRequest) {
  const gate = await requireCtx(request);
  if ("error" in gate) return gate.error;
  const { session, ctx } = gate;

  const [row] = await db
    .select({
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
      personalEmail: employees.personalEmail,
      jobTitle: employees.jobTitle,
      companyName: companies.name,
    })
    .from(employees)
    .leftJoin(companies, eq(employees.companyId, companies.id))
    .where(eq(employees.id, ctx.employeeId))
    .limit(1);

  return NextResponse.json({
    userId: session.userId,
    role: session.role,
    accountType: session.accountType,
    firstName: row?.firstName ?? "",
    lastName: row?.lastName ?? "",
    email: row?.email ?? session.email,
    personalEmail: row?.personalEmail ?? null,
    jobTitle: row?.jobTitle ?? null,
    companyName: row?.companyName ?? null,
  });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireCtx(request);
  if ("error" in gate) return gate.error;
  const { session, ctx } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (typeof body.firstName === "string") {
    const v = body.firstName.trim();
    if (!v) return NextResponse.json({ error: "first_name_required" }, { status: 400 });
    patch.firstName = v;
  }
  if (typeof body.lastName === "string") patch.lastName = body.lastName.trim() || null;
  if (typeof body.jobTitle === "string") patch.jobTitle = body.jobTitle.trim() || null;
  if (typeof body.personalEmail === "string") patch.personalEmail = body.personalEmail.trim() || null;

  // Corporate email lives on both `users` and `employees`. Keep them in sync
  // on update, but reject a change that collides with another user's email.
  let newEmail: string | null = null;
  if (typeof body.email === "string" && body.email.trim() && body.email.trim() !== session.email) {
    newEmail = body.email.trim().toLowerCase();
    const clash = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, newEmail))
      .limit(1);
    if (clash.length && clash[0].id !== session.userId) {
      return NextResponse.json({ error: "email_in_use" }, { status: 409 });
    }
    patch.email = newEmail;
  }

  await db.update(employees).set(patch).where(eq(employees.id, ctx.employeeId));
  if (newEmail) {
    await db.update(users).set({ email: newEmail }).where(eq(users.id, session.userId));
  }

  return NextResponse.json({ ok: true });
}
