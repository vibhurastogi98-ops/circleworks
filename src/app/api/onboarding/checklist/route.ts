import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { companies, onboardingProgress } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import {
  CHECKLIST_DISMISSED_STEP,
  getOnboardingChecklistState,
  getOnboardingChecklistTasks,
  toChecklistStepId,
  type OnboardingChecklistTaskId,
} from "@/lib/onboarding-checklist";

const checklistMutationSchema = z.object({
  action: z.enum(["complete", "reopen", "dismiss"]),
  taskId: z.string().trim().optional(),
});

function parseAccountId(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readString(value: string | null) {
  return value && value.trim() ? value.trim() : null;
}

async function loadCompany(accountId: number) {
  const [company] = await db
    .select({
      id: companies.id,
      accountType: companies.accountType,
      entityType: companies.entityType,
      creatorEntityType: companies.creatorEntityType,
    })
    .from(companies)
    .where(eq(companies.id, accountId))
    .limit(1);

  return company ?? null;
}

async function loadProgress(accountId: number) {
  const [progress] = await db
    .select()
    .from(onboardingProgress)
    .where(eq(onboardingProgress.accountId, accountId))
    .limit(1);

  return progress ?? null;
}

async function resolveAuthorizedAccount(req: NextRequest, requestedAccountId: number | null) {
  const session = await getSession(req);
  if (!session) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const context = await resolveUserContext(session);
  const accountId = requestedAccountId ?? context?.companyId ?? null;

  if (!accountId || !context || context.companyId !== accountId) {
    return { response: NextResponse.json({ error: "Account not found for current user" }, { status: 403 }) };
  }

  const company = await loadCompany(accountId);
  if (!company) {
    return { response: NextResponse.json({ error: "Account not found" }, { status: 404 }) };
  }

  return { accountId, company };
}

function buildResponsePayload({
  accountId,
  accountType,
  completedSteps,
  entityType,
  creatorEntityType,
  serverTracked,
}: {
  accountId: number | null;
  accountType: string | null | undefined;
  completedSteps: string[];
  entityType?: string | null;
  creatorEntityType?: string | null;
  serverTracked: boolean;
}) {
  const state = getOnboardingChecklistState({
    accountType,
    completedSteps,
    options: { entityType, creatorEntityType },
  });

  return {
    accountId,
    serverTracked,
    ...state,
    shouldShow: state.status !== "complete" && !state.dismissed,
  };
}

async function ensureProgressRow({
  accountId,
  accountType,
  completedSteps,
  entityType,
  creatorEntityType,
}: {
  accountId: number;
  accountType: string | null | undefined;
  completedSteps: string[];
  entityType?: string | null;
  creatorEntityType?: string | null;
}) {
  const payload = buildResponsePayload({
    accountId,
    accountType,
    completedSteps,
    entityType,
    creatorEntityType,
    serverTracked: true,
  });

  await db
    .insert(onboardingProgress)
    .values({
      accountId,
      currentStep: payload.currentStep,
      completedSteps,
      status: payload.status,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  return payload;
}

export async function GET(req: NextRequest) {
  const requestedAccountId = parseAccountId(req.nextUrl.searchParams.get("accountId"));
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json(
      buildResponsePayload({
        accountId: null,
        accountType: readString(req.nextUrl.searchParams.get("accountType")) ?? "company",
        completedSteps: [],
        entityType: readString(req.nextUrl.searchParams.get("entityType")),
        creatorEntityType: readString(req.nextUrl.searchParams.get("creatorEntityType")),
        serverTracked: false,
      }),
    );
  }

  const context = await resolveUserContext(session);
  const accountId = requestedAccountId ?? context?.companyId ?? null;

  if (!accountId || !context || context.companyId !== accountId) {
    return NextResponse.json({ error: "Account not found for current user" }, { status: 403 });
  }

  const company = await loadCompany(accountId);
  if (!company) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const progress = await loadProgress(accountId);
  const completedSteps = progress?.completedSteps ?? [];

  if (!progress) {
    const payload = await ensureProgressRow({
      accountId,
      accountType: company.accountType,
      completedSteps,
      entityType: company.entityType,
      creatorEntityType: company.creatorEntityType,
    });

    return NextResponse.json(payload);
  }

  return NextResponse.json(
    buildResponsePayload({
      accountId,
      accountType: company.accountType,
      completedSteps,
      entityType: company.entityType,
      creatorEntityType: company.creatorEntityType,
      serverTracked: true,
    }),
  );
}

export async function PATCH(req: NextRequest) {
  const parsed = checklistMutationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checklist payload" }, { status: 400 });
  }

  const requestedAccountId = parseAccountId(req.nextUrl.searchParams.get("accountId"));
  const resolved = await resolveAuthorizedAccount(req, requestedAccountId);
  if ("response" in resolved) return resolved.response;

  const { accountId, company } = resolved;
  const progress = await loadProgress(accountId);
  const existingSteps = progress?.completedSteps ?? [];
  const tasks = getOnboardingChecklistTasks(company.accountType, {
    entityType: company.entityType,
    creatorEntityType: company.creatorEntityType,
  });
  const taskStepIds = new Set(tasks.map((task) => toChecklistStepId(task.id)));
  const preservedSteps = existingSteps.filter((step) => !taskStepIds.has(step));
  const checklistSteps = new Set(existingSteps.filter((step) => taskStepIds.has(step)));

  if (parsed.data.action === "dismiss") {
    preservedSteps.push(CHECKLIST_DISMISSED_STEP);
  } else {
    const task = tasks.find((candidate) => candidate.id === parsed.data.taskId);
    if (!task) {
      return NextResponse.json({ error: "Checklist task not found" }, { status: 404 });
    }

    const taskStepId = toChecklistStepId(task.id as OnboardingChecklistTaskId);
    if (parsed.data.action === "complete") {
      checklistSteps.add(taskStepId);
    } else {
      checklistSteps.delete(taskStepId);
    }
  }

  const completedSteps = Array.from(new Set([...preservedSteps, ...checklistSteps]));
  const payload = buildResponsePayload({
    accountId,
    accountType: company.accountType,
    completedSteps,
    entityType: company.entityType,
    creatorEntityType: company.creatorEntityType,
    serverTracked: true,
  });

  await db
    .insert(onboardingProgress)
    .values({
      accountId,
      currentStep: payload.currentStep,
      completedSteps,
      status: payload.status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: onboardingProgress.accountId,
      set: {
        currentStep: payload.currentStep,
        completedSteps,
        status: payload.status,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json(payload);
}

