import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { onboardingProgress } from "@/db/schema";
import { normalizeAccountType } from "@/lib/account-types";
import { getSession, resolveUserContext } from "@/lib/session";
import {
  getWizardStepIndex,
  resolveWizardState,
  type WizardProgressState,
} from "@/lib/signup-wizard-engine";

const SIGNUP_DRAFT_COOKIE = "cw_signup_partial";
const DRAFT_MAX_AGE = 60 * 60 * 24 * 14;

const partialSignupSchema = z.object({
  accountId: z.coerce.number().int().positive().optional(),
  accountType: z.string().trim().optional(),
  currentStep: z.string().trim().optional(),
  completedSteps: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(["in_progress", "complete"]).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  step: z.number().int().min(0).max(20).optional(),
  data: z.unknown().optional(),
});

function sanitizeDraft(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeDraft);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
        key,
        key.toLowerCase().includes("password") ? "" : sanitizeDraft(entryValue),
      ])
    );
  }

  return value;
}

function parseAccountId(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readDraftAccountType(data: unknown) {
  const draft = getRecord(data);
  const account = getRecord(draft?.account);
  return typeof account?.accountType === "string" ? account.accountType : null;
}

function buildProgressFromPayload(payload: z.infer<typeof partialSignupSchema>): WizardProgressState {
  const accountType = normalizeAccountType(payload.accountType ?? readDraftAccountType(payload.data));
  return resolveWizardState({
    accountType,
    currentStep: payload.currentStep,
    stepIndex: payload.step ?? null,
    completedSteps: payload.completedSteps,
    status: payload.status,
  });
}

function toDraftPayload(
  payload: z.infer<typeof partialSignupSchema>,
  progress: WizardProgressState,
) {
  const stepIndex = getWizardStepIndex(progress.accountType, progress.currentStep);

  return {
    email: payload.email || "",
    step: stepIndex >= 0 ? stepIndex : payload.step ?? 0,
    accountType: progress.accountType,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    status: progress.status,
    data: sanitizeDraft(payload.data),
    savedAt: new Date().toISOString(),
  };
}

async function resolveWritableAccountId(req: NextRequest, requestedAccountId: number | null) {
  const session = await getSession(req);

  if (!session) {
    return requestedAccountId
      ? { accountId: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
      : { accountId: null, response: null };
  }

  const context = await resolveUserContext(session);
  const accountId = requestedAccountId ?? context?.companyId ?? null;

  if (!accountId) {
    return { accountId: null, response: null };
  }

  if (!context || context.companyId !== accountId) {
    return {
      accountId: null,
      response: NextResponse.json({ error: "Account not found for current user" }, { status: 403 }),
    };
  }

  return { accountId, response: null };
}

async function readCookieDraft(req: NextRequest) {
  const rawDraft = req.cookies.get(SIGNUP_DRAFT_COOKIE)?.value;

  if (!rawDraft) return null;

  try {
    return sanitizeDraft(JSON.parse(rawDraft) as unknown);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const requestedAccountId = parseAccountId(req.nextUrl.searchParams.get("accountId"));
  const { accountId, response } = await resolveWritableAccountId(req, requestedAccountId);

  if (response) return response;

  const draft = await readCookieDraft(req);
  const progress = accountId
    ? await db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.accountId, accountId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null;

  const json = NextResponse.json({ draft, progress });

  if (req.cookies.get(SIGNUP_DRAFT_COOKIE)?.value && !draft) {
    json.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
  }

  return json;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = partialSignupSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid partial signup payload" }, { status: 400 });
    }

    const progress = buildProgressFromPayload(parsed.data);
    const draft = toDraftPayload(parsed.data, progress);
    const requestedAccountId = parsed.data.accountId ?? null;
    const { accountId, response: authResponse } = await resolveWritableAccountId(req, requestedAccountId);

    if (authResponse) return authResponse;

    if (accountId) {
      await db
        .insert(onboardingProgress)
        .values({
          accountId,
          currentStep: progress.currentStep,
          completedSteps: progress.completedSteps,
          status: progress.status,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: onboardingProgress.accountId,
          set: {
            currentStep: progress.currentStep,
            completedSteps: progress.completedSteps,
            status: progress.status,
            updatedAt: new Date(),
          },
        });
    }

    const response = NextResponse.json({
      success: true,
      accountId,
      step: draft.step,
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      status: progress.status,
      savedAt: draft.savedAt,
    });

    response.cookies.set(SIGNUP_DRAFT_COOKIE, JSON.stringify(draft), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DRAFT_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("[Signup partial]", error);
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const requestedAccountId = parseAccountId(req.nextUrl.searchParams.get("accountId"));

  if (requestedAccountId) {
    const { accountId, response: authResponse } = await resolveWritableAccountId(req, requestedAccountId);

    if (authResponse) return authResponse;

    if (accountId) {
      await db.delete(onboardingProgress).where(eq(onboardingProgress.accountId, accountId));
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
