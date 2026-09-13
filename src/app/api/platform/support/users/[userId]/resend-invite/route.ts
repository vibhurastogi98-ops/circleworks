import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/users\/(\d+)\//);
  return m?.[1] ?? "0";
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://app.circleworks.com";

/**
 * Sends a real invite email through Supabase.
 *
 * Semantics: pre-signup users get a full inviteUserByEmail (Supabase mints
 * the user + sends the invite mail via its own SMTP config).
 * Existing/confirmed users get a magic-link generated via
 * generateLink({type:'magiclink'}) which we deliver through our own Postmark
 * pipeline so the branding stays consistent.
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  {
    action: "supportUser.resendInvite",
    targetType: "tenant_user",
    extractTargetId,
    mutating: true,
  },
  async ({ tx, request }) => {
    const userId = Number(await extractTargetId(request));
    const [row] = await tx
      .select({ id: users.id, email: users.email, clerkUserId: users.clerkUserId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) throw new Error("user_not_found");

    const admin = requireSupabaseAdmin();
    const redirectTo = `${APP_URL.replace(/\/$/, "")}/auth/callback?next=%2Fapp`;

    // Determine whether the user is already confirmed in Supabase — that
    // decides between inviteUserByEmail (pre-signup) and a magic link
    // (existing user).
    let confirmed = false;
    if (row.clerkUserId) {
      const { data: existing, error: fetchErr } = await admin.auth.admin.getUserById(row.clerkUserId);
      if (fetchErr && !/not.*found/i.test(fetchErr.message)) {
        throw new Error(`supabase_get_user_failed: ${fetchErr.message}`);
      }
      confirmed = Boolean(existing?.user?.email_confirmed_at);
    }

    if (!confirmed) {
      // Fresh invite path — Supabase mints the user and sends its own email.
      const { data, error } = await admin.auth.admin.inviteUserByEmail(row.email, {
        redirectTo,
        data: { platform_admin_resent_invite_at: new Date().toISOString() },
      });
      if (error) throw new Error(`supabase_invite_failed: ${error.message}`);
      return {
        body: { ok: true, mode: "supabase_invite", inviteId: data.user?.id ?? null },
        before: null,
        after: { mode: "supabase_invite", sentTo: row.email },
        metadata: { targetEmail: row.email, redirectTo },
      };
    }

    // Existing confirmed user — mint a magic link and deliver it ourselves so
    // the email uses our branded template.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: row.email,
      options: { redirectTo },
    });
    if (linkErr) throw new Error(`supabase_generate_link_failed: ${linkErr.message}`);
    const actionLink = linkData.properties?.action_link;
    if (!actionLink) throw new Error("supabase_generate_link_no_action_link");

    await sendEmail({
      to: row.email,
      subject: "Your CircleWorks sign-in link",
      html: `
        <p>Hi,</p>
        <p>A CircleWorks platform administrator resent this sign-in link for your account.</p>
        <p><a href="${actionLink}" style="display:inline-block;background:#F97316;color:#0A1628;padding:12px 20px;border-radius:6px;font-weight:700;text-decoration:none">Sign in to CircleWorks</a></p>
        <p style="color:#64748B;font-size:13px">If you didn't request this, you can safely ignore this email — the link expires shortly and no changes were made to your account.</p>
      `,
      text: `A CircleWorks platform administrator resent this sign-in link for your account:\n\n${actionLink}\n\nIf you didn't request this, ignore this email — the link expires shortly.`,
    });

    return {
      body: { ok: true, mode: "magic_link_email" },
      before: null,
      after: { mode: "magic_link_email", sentTo: row.email },
      metadata: { targetEmail: row.email, redirectTo, actionLinkExpiresQuickly: true },
    };
  },
);
