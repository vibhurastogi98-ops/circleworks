import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users, companies, employees, onboardingCases, onboardingProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  normalizeAccountType,
  normalizeEntityType,
  toLegacyCreatorEntityType,
  type AccountType,
} from "@/lib/account-types";
import { getWizardStepIds } from "@/lib/signup-wizard-engine";

const SIGNUP_DRAFT_COOKIE = "cw_signup_partial";

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

function parseContractorCount(value: unknown) {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, Math.min(999, Math.round(count))) : 0;
}

function getAccountName(accountType: AccountType, step1: Record<string, unknown> | undefined, step2: Record<string, unknown> | undefined) {
  const companyName = typeof step2?.companyName === "string" ? step2.companyName.trim() : "";
  if (companyName) return companyName;

  const fullName = typeof step1?.fullName === "string" ? step1.fullName.trim() : "";
  if (accountType === "creator") return fullName ? `${fullName} Studio` : "Creator Studio";
  return "My Company";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account, step1, step2, step3, step4, creator, googleAuth } = body;
    const accountType = normalizeAccountType(account?.accountType);
    const fullFlowSignup = accountType === "company" || accountType === "agency";
    const entityType = accountType === "creator" ? normalizeEntityType(creator?.entityType) : null;

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
        // OAuth user already has an account; just mint a session and succeed.
        const token = await createSessionToken({
          userId: existing.id,
          email: existing.email,
          role: existing.role ?? "employee",
        });
        const res = NextResponse.json({ success: true });
        res.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
          path: "/",
          maxAge: 0,
        });
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
      // OAuth user is already authenticated; get Supabase user from session.
      const supabaseServer = await createSupabaseServerClient();
      const { data: { user: oauthUser } } = await supabaseServer.auth.getUser();

      if (!oauthUser) {
        return NextResponse.json({ error: "OAuth session not found. Please sign in again." }, { status: 401 });
      }
      if (oauthUser.email?.toLowerCase().trim() !== email) {
        return NextResponse.json({ error: "Email mismatch with OAuth account." }, { status: 400 });
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
        user_metadata: { role: "admin", fullName: step1?.fullName, accountType },
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
    const accountName = getAccountName(accountType, step1, step2);

    // Persist company + employee records
    try {
      await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({ email, clerkUserId: supabaseUserId, role: "admin" })
          .returning();

        const [company] = await tx
          .insert(companies)
          .values({
            name: accountName,
            accountType,
            entityType,
            creatorEntityType: accountType === "creator" ? toLegacyCreatorEntityType(creator?.entityType) : null,
            paySelfAsOwner: accountType === "creator" ? Boolean(creator?.paySelfAsOwner) : false,
            contractorCount: accountType === "creator" ? parseContractorCount(creator?.contractorCount) : 0,
          })
          .returning();

        await tx
          .insert(onboardingProgress)
          .values({
            accountId: company.id,
            currentStep: "complete",
            completedSteps: getWizardStepIds(accountType).filter((step) => step !== "complete"),
            status: "complete",
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: onboardingProgress.accountId,
            set: {
              currentStep: "complete",
              completedSteps: getWizardStepIds(accountType).filter((step) => step !== "complete"),
              status: "complete",
              updatedAt: new Date(),
            },
          });

        await tx.insert(employees).values({
          userId: newUser.id,
          companyId: company.id,
          firstName: fullFlowSignup && step4?.isAdminEmployee ? (step4.firstName || adminName.firstName) : adminName.firstName,
          lastName: fullFlowSignup && step4?.isAdminEmployee ? (step4.lastName || adminName.lastName) : adminName.lastName,
          email,
          jobTitle:
            accountType === "creator"
              ? "Owner"
              : step4?.isAdminEmployee
                ? (step4.title || "Company Admin")
                : "Company Admin",
          startDate: fullFlowSignup && step4?.isAdminEmployee ? normalizeDate(step4.startDate) : null,
          payType: fullFlowSignup && step4?.isAdminEmployee ? (step4.payType || "salary") : "salary",
          salary: fullFlowSignup && step4?.isAdminEmployee ? parseSalary(step4.payRate) : 0,
          status: "active",
        });

        if (fullFlowSignup && !step4?.skip && step4?.firstName && !step4?.isAdminEmployee) {
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
    response.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });

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
