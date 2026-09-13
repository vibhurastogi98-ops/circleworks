import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { employees, pendingInvites, users } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Workspace-scoped user management.
 * Lists real employees + pending invites. Invite creates a pending_invites
 * row (no users row yet — that happens on claim). Role change and revoke
 * hit the real tables. Route name is `users-admin` to avoid conflicting
 * with /api/users which may be added elsewhere.
 */
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

  const activeRows = await db
    .select({
      employeeId: employees.id,
      userId: employees.userId,
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
      role: users.role,
      status: employees.status,
      jobTitle: employees.jobTitle,
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.companyId, gate.ctx.companyId))
    .orderBy(desc(employees.id));

  const pending = await db
    .select({
      id: pendingInvites.id,
      email: pendingInvites.email,
      role: pendingInvites.role,
      status: pendingInvites.status,
      createdAt: pendingInvites.createdAt,
      expiresAt: pendingInvites.expiresAt,
    })
    .from(pendingInvites)
    .where(and(eq(pendingInvites.companyId, gate.ctx.companyId), eq(pendingInvites.status, "pending")))
    .orderBy(desc(pendingInvites.createdAt));

  return NextResponse.json({ active: activeRows, pending });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" && body.role.trim() ? body.role.trim() : "employee";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "valid_email_required" }, { status: 400 });
  }

  // Block re-inviting someone already in the company.
  const existingEmp = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(eq(employees.companyId, gate.ctx.companyId), eq(employees.email, email)))
    .limit(1);
  if (existingEmp.length) {
    return NextResponse.json({ error: "already_in_company" }, { status: 409 });
  }

  // Reuse an existing pending invite if there is one — refreshing the token.
  const [existingInvite] = await db
    .select({ id: pendingInvites.id })
    .from(pendingInvites)
    .where(and(
      eq(pendingInvites.companyId, gate.ctx.companyId),
      eq(pendingInvites.email, email),
      eq(pendingInvites.status, "pending"),
    ))
    .limit(1);

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let inviteRow;
  if (existingInvite) {
    [inviteRow] = await db.update(pendingInvites)
      .set({ role, token, expiresAt, invitedBy: gate.session.userId })
      .where(eq(pendingInvites.id, existingInvite.id))
      .returning();
  } else {
    [inviteRow] = await db.insert(pendingInvites).values({
      companyId: gate.ctx.companyId, email, role, token, expiresAt,
      invitedBy: gate.session.userId,
    }).returning();
  }

  // Best-effort mail. Non-blocking — the invite lives in DB regardless.
  const base = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  const link = `${base.replace(/\/$/, "")}/auth/accept-invite?token=${token}`;
  const emailSent = await sendEmail({
    to: email,
    subject: "You've been invited to CircleWorks",
    html: `<p>You've been invited to join a CircleWorks workspace.</p><p><a href="${link}">Accept invite</a></p><p>Link expires ${expiresAt.toDateString()}.</p>`,
    text: `You've been invited to join a CircleWorks workspace. Accept: ${link} (expires ${expiresAt.toDateString()})`,
  });

  return NextResponse.json({ ok: true, invite: inviteRow, emailSent });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  // Change a user's role. Only works on users in this company (checked via
  // the employees join). Cannot demote yourself as a safety guard.
  if (body.action === "change-role") {
    const employeeId = Number(body.employeeId);
    const newRole = typeof body.role === "string" ? body.role.trim() : "";
    if (!Number.isInteger(employeeId) || !newRole) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

    const [emp] = await db
      .select({ userId: employees.userId })
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.companyId, gate.ctx.companyId)))
      .limit(1);
    if (!emp?.userId) return NextResponse.json({ error: "not_found_or_no_user" }, { status: 404 });
    if (emp.userId === gate.session.userId) return NextResponse.json({ error: "cannot_change_own_role" }, { status: 400 });

    await db.update(users).set({ role: newRole }).where(eq(users.id, emp.userId));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind"); // "invite" | "member"
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  if (kind === "invite") {
    const [row] = await db.select({ id: pendingInvites.id }).from(pendingInvites)
      .where(and(eq(pendingInvites.id, id), eq(pendingInvites.companyId, gate.ctx.companyId))).limit(1);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.update(pendingInvites).set({ status: "revoked" }).where(eq(pendingInvites.id, id));
    return NextResponse.json({ ok: true });
  }

  if (kind === "member") {
    const [emp] = await db
      .select({ userId: employees.userId })
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.companyId, gate.ctx.companyId)))
      .limit(1);
    if (!emp) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (emp.userId === gate.session.userId) return NextResponse.json({ error: "cannot_revoke_self" }, { status: 400 });
    // Soft-delete: mark employee status inactive; do not delete the users
    // row (they may belong to other workspaces in future).
    await db.update(employees).set({ status: "Inactive" }).where(eq(employees.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
}
