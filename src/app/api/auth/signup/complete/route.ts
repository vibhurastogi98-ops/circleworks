import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users, companies, employees, onboardingCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function splitFullName(fullName: string | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Admin",
    lastName: parts.slice(1).join(" ") || null,
  };
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function parseSalary(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  const amount = Number.parseFloat(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step1, step2, step3, step4, googleAuth } = body;

    const email = (step1?.email as string)?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check for duplicate in our DB
    const [existing] = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, email));

    if (existing) {
      if (googleAuth) {
        // Google user already has an account — just mint a session and succeed
        const token = await createSessionToken({
          userId: existing.id,
          email: existing.email,
          role: existing.role ?? "employee",
        });
        const res = NextResponse.json({ success: true });
        res.cookies.set(SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24,
        });
        return res;
      }
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    let supabaseUserId: string;

    if (googleAuth) {
      // Google OAuth user — already authenticated; get Supabase user from session
      const supabaseServer = await createSupabaseServerClient();
      const { data: { user: oauthUser } } = await supabaseServer.auth.getUser();

      if (!oauthUser) {
        return NextResponse.json({ error: "Google authentication session not found. Please sign in with Google again." }, { status: 401 });
      }
      if (oauthUser.email?.toLowerCase().trim() !== email) {
        return NextResponse.json({ error: "Email mismatch with Google account." }, { status: 400 });
      }
      supabaseUserId = oauthUser.id;
    } else {
      // Email/password signup — create new Supabase user
      const password = step1?.password as string;
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "admin", fullName: step1?.fullName },
      });

      if (authError || !authData.user) {
        if (authError?.message?.toLowerCase().includes("already registered")) {
          return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }
        console.error("[Signup Complete] Supabase auth error:", authError);
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
      }
      supabaseUserId = authData.user.id;
    }
    const adminName = splitFullName(step1?.fullName);

    // Persist company + employee records
    try {
      await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({ email, clerkUserId: supabaseUserId, role: "admin" })
          .returning();

        const [company] = await tx
          .insert(companies)
          .values({ name: step2?.companyName || "My Company" })
          .returning();

        await tx.insert(employees).values({
          userId: newUser.id,
          companyId: company.id,
          firstName: step4?.isAdminEmployee ? (step4.firstName || adminName.firstName) : adminName.firstName,
          lastName: step4?.isAdminEmployee ? (step4.lastName || adminName.lastName) : adminName.lastName,
          email,
          jobTitle: step4?.isAdminEmployee ? (step4.title || "Company Admin") : "Company Admin",
          startDate: step4?.isAdminEmployee ? normalizeDate(step4.startDate) : null,
          payType: step4?.isAdminEmployee ? (step4.payType || "salary") : "salary",
          salary: step4?.isAdminEmployee ? parseSalary(step4.payRate) : 0,
          status: "active",
        });

        if (!step4?.skip && step4?.firstName && !step4?.isAdminEmployee) {
          const [firstEmployee] = await tx.insert(employees).values({
            userId: null,
            companyId: company.id,
            firstName: step4.firstName,
            lastName: step4.lastName || "",
            email: step4.employeeEmail?.toLowerCase().trim() || "",
            jobTitle: step4.title || "",
            startDate: normalizeDate(step4.startDate),
            payType: step4.payType || "salary",
            salary: parseSalary(step4.payRate),
            status: "onboarding",
          }).returning();

          await tx.insert(onboardingCases).values({
            employeeId: firstEmployee.id,
            status: "Active",
            startDate: normalizeDate(step4.startDate),
          });
        }
      });
    } catch (dbErr) {
      // Only delete the Supabase user if we created it (not for Google OAuth users)
      if (!googleAuth) {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      }
      console.error("[Signup Complete] DB error:", dbErr);
      return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });

    if (!googleAuth) {
      // Email/password flow — auto sign-in to set Supabase session cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      const password = step1?.password as string;
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error("[Signup Complete] Auto sign-in failed:", signInError.message);
      }
    }

    const [appUser] = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, email));

    if (appUser) {
      const sessionToken = await createSessionToken(
        {
          userId: appUser.id,
          email: appUser.email,
          role: appUser.role ?? "employee",
        },
        false
      );
      response.cookies.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (err) {
    console.error("[Signup Complete]", err);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
