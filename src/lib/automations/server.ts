import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { automationRecipes, automationRuns, automationWebhookEvents } from "@/db/schema";
import {
  ACTIVE_AUTOMATIONS,
  AUTOMATION_TEMPLATES,
  MOCK_AUTOMATION_RUNS,
  type AutomationRunRecord,
  type AutomationRunStep,
  type AutomationRecipe,
  type AutomationStatus,
  type AutomationTriggerType,
} from "@/data/mockAutomations";
import { normalizeRunStatus } from "@/lib/automations/engine";
import { processAutomationRun } from "@/lib/automations/processor";
import { enqueueAutomationRun } from "@/lib/automations/queue";
import type { SessionUser, UserContext } from "@/lib/session";

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeStatus(status?: string | null): AutomationStatus {
  return status === "Active" || status === "Paused" || status === "Draft" ? status : "Draft";
}

function normalizeTriggerType(triggerType?: string | null): AutomationTriggerType {
  return triggerType === "schedule" || triggerType === "webhook" ? triggerType : "event";
}

function rowToRecipe(row: typeof automationRecipes.$inferSelect): AutomationRecipe {
  const nodes = safeJson<AutomationRecipe["nodes"]>(row.nodesJson, []);
  const edges = safeJson<AutomationRecipe["edges"]>(row.edgesJson, []);
  const status = normalizeStatus(row.status);

  return {
    id: `db-${row.id}`,
    title: row.title,
    description: row.description ?? "",
    category: (row.category as AutomationRecipe["category"]) ?? "Onboarding",
    trigger: row.triggerLabel,
    triggerType: normalizeTriggerType(row.triggerType),
    status,
    lastRun: row.lastRunAt ? row.lastRunAt.toLocaleString() : "Never",
    runCount: row.runCount ?? 0,
    runsThisMonth: 0,
    timeSavedHours: Math.round((row.estimatedMinutesSaved ?? 0) / 60),
    errors: 0,
    owner: row.ownerUserId ? `User ${row.ownerUserId}` : "Automation owner",
    mine: true,
    template: Boolean(row.isTemplate),
    steps: nodes.filter((node) => node.type === "action").map((node) => String(node.data.label ?? "Action")),
    nodes,
    edges,
  };
}

function parseAutomationId(id: string) {
  const normalized = id.startsWith("db-") ? id.slice(3) : id;
  const numericId = Number.parseInt(normalized, 10);
  return Number.isFinite(numericId) ? numericId : null;
}

function rowToRun(row: typeof automationRuns.$inferSelect, automationId: string): AutomationRunRecord {
  const context = safeJson<Record<string, unknown>>(row.contextJson, {});
  const steps = safeJson<AutomationRunStep[]>(row.stepsJson, []);
  const affectedEntity =
    row.affectedEntityLabel ??
    (typeof context.affectedEntity === "string" ? context.affectedEntity : undefined) ??
    (typeof context.affectedEntityLabel === "string" ? context.affectedEntityLabel : undefined) ??
    "Workflow event";

  const simulated = context.simulated === true;
  const retriedFromRunId = typeof context.retriedFromRunId === "number" ? context.retriedFromRunId : null;

  return {
    id: `db-${row.id}`,
    automationId,
    timestamp: (row.startedAt ?? new Date()).toISOString(),
    trigger: row.triggerEvent ?? "automation.triggered",
    status: normalizeRunStatus(row.status),
    durationMs: row.durationMs ?? steps.reduce((sum, step) => sum + step.durationMs, 0),
    affectedEntity,
    errorMessage: row.errorMessage,
    stepResults: steps,
    simulated,
    retriedFromRunId,
  };
}

function mockRunsForAutomation(id: string): AutomationRunRecord[] {
  return MOCK_AUTOMATION_RUNS[id] ?? [];
}

export async function listAutomationRecipes(ctx: UserContext | null) {
  // No session → mock (public preview only). Signed-in callers see real data
  // scoped to their company, empty arrays if none — no silent mock pollution.
  if (!ctx) {
    return {
      automations: ACTIVE_AUTOMATIONS,
      templates: AUTOMATION_TEMPLATES,
      source: "mock" as const,
    };
  }

  const rows = await db
    .select()
    .from(automationRecipes)
    .where(eq(automationRecipes.companyId, ctx.companyId))
    .orderBy(desc(automationRecipes.updatedAt));

  const dbRecipes = rows.map(rowToRecipe);
  const automations = dbRecipes.filter((item) => !item.template);
  const templates = dbRecipes.filter((item) => item.template);

  return {
    automations,
    // AUTOMATION_TEMPLATES is a static starter library (not tenant data) —
    // shown only when the tenant hasn't saved any of their own templates yet.
    // Once they have their own, we stop showing the generic library.
    templates: templates.length ? templates : AUTOMATION_TEMPLATES,
    source: "database" as const,
    hasStarterLibrary: templates.length === 0,
  };
}

export async function createAutomationRecipe({
  session,
  ctx,
  recipe,
}: {
  session: SessionUser;
  ctx: UserContext;
  recipe: Pick<AutomationRecipe, "title" | "description" | "category" | "trigger" | "triggerType" | "status" | "template" | "nodes" | "edges"> & {
    templateId?: string;
  };
}) {
  const [created] = await db
    .insert(automationRecipes)
    .values({
      companyId: ctx.companyId,
      ownerUserId: session.userId,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      triggerType: recipe.triggerType,
      triggerKey: recipe.trigger.toLowerCase().replace(/\s+/g, "."),
      triggerLabel: recipe.trigger,
      status: recipe.status,
      isTemplate: recipe.template,
      isSystemTemplate: false,
      templateId: recipe.templateId ?? null,
      estimatedMinutesSaved: recipe.nodes.filter((node) => node.type === "action").length * 12,
      nodesJson: JSON.stringify(recipe.nodes),
      edgesJson: JSON.stringify(recipe.edges),
    })
    .returning();

  return rowToRecipe(created);
}

export async function updateAutomationStatus({
  ctx,
  id,
  status,
}: {
  ctx: UserContext;
  id: number;
  status: AutomationStatus;
}) {
  const [updated] = await db
    .update(automationRecipes)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(automationRecipes.id, id), eq(automationRecipes.companyId, ctx.companyId)))
    .returning();

  return updated ? rowToRecipe(updated) : null;
}

/**
 * Update anything else on the recipe — title / description / category / trigger
 * label / nodes / edges. Keeps the old updateAutomationStatus around for the
 * common status-only case so the PATCH route can dispatch either.
 */
export async function updateAutomationRecipe({
  ctx,
  id,
  updates,
}: {
  ctx: UserContext;
  id: number;
  updates: Partial<Pick<AutomationRecipe, "title" | "description" | "category" | "trigger" | "triggerType" | "status" | "template"> & { nodes?: AutomationRecipe["nodes"]; edges?: AutomationRecipe["edges"] }>;
}) {
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof updates.title === "string" && updates.title.trim()) patch.title = updates.title.trim();
  if (typeof updates.description === "string") patch.description = updates.description;
  if (typeof updates.category === "string") patch.category = updates.category;
  if (typeof updates.trigger === "string" && updates.trigger.trim()) {
    patch.triggerLabel = updates.trigger.trim();
    patch.triggerKey = updates.trigger.trim().toLowerCase().replace(/\s+/g, ".");
  }
  if (updates.triggerType === "schedule" || updates.triggerType === "webhook" || updates.triggerType === "event") {
    patch.triggerType = updates.triggerType;
  }
  if (updates.status === "Active" || updates.status === "Paused" || updates.status === "Draft") {
    patch.status = updates.status;
  }
  if (typeof updates.template === "boolean") patch.isTemplate = updates.template;
  if (Array.isArray(updates.nodes)) {
    patch.nodesJson = JSON.stringify(updates.nodes);
    patch.estimatedMinutesSaved = updates.nodes.filter((node) => node.type === "action").length * 12;
  }
  if (Array.isArray(updates.edges)) patch.edgesJson = JSON.stringify(updates.edges);

  const [updated] = await db
    .update(automationRecipes)
    .set(patch)
    .where(and(eq(automationRecipes.id, id), eq(automationRecipes.companyId, ctx.companyId)))
    .returning();
  return updated ? rowToRecipe(updated) : null;
}

export async function deleteAutomationRecipe(ctx: UserContext, id: number) {
  await db.delete(automationRecipes).where(and(eq(automationRecipes.id, id), eq(automationRecipes.companyId, ctx.companyId)));
}

export async function listAutomationRuns(ctx: UserContext | null, id: string) {
  // Same rule as the recipe list: no session → mock preview, otherwise real
  // scoped rows (empty array if none). Non-numeric ids (i.e. mock recipes
  // that were never saved) return their mock run history for display fidelity.
  if (!ctx) return mockRunsForAutomation(id);

  const automationId = parseAutomationId(id);
  if (!automationId) return mockRunsForAutomation(id);

  const [automation] = await db
    .select({ id: automationRecipes.id })
    .from(automationRecipes)
    .where(and(eq(automationRecipes.id, automationId), eq(automationRecipes.companyId, ctx.companyId)))
    .limit(1);

  if (!automation) return [];

  const rows = await db
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.automationId, automationId), eq(automationRuns.companyId, ctx.companyId)))
    .orderBy(desc(automationRuns.startedAt));

  return rows.map((row) => rowToRun(row, `db-${automationId}`));
}

/**
 * Manually record a run against a recipe. This is what a user does when they
 * want to log an execution outcome — the automation engine itself isn't
 * built (per the module's scope boundary), so runs are user-logged rather
 * than trigger-fired. The row lands in automation_runs the same way a real
 * run would, plus lastRunAt / runCount get bumped on the recipe.
 */
export async function logAutomationRun({
  ctx,
  id,
  triggerEvent,
  status,
  contextJson,
  affectedEntityLabel,
  errorMessage,
}: {
  ctx: UserContext;
  id: string;
  triggerEvent?: string;
  status?: string;
  contextJson?: Record<string, unknown>;
  affectedEntityLabel?: string;
  errorMessage?: string | null;
}) {
  const automationId = parseAutomationId(id);
  if (!automationId) return null;

  const [automation] = await db
    .select()
    .from(automationRecipes)
    .where(and(eq(automationRecipes.id, automationId), eq(automationRecipes.companyId, ctx.companyId)))
    .limit(1);
  if (!automation) return null;

  const normalized = normalizeRunStatus(status ?? "Success");
  const now = new Date();

  const [row] = await db
    .insert(automationRuns)
    .values({
      companyId: ctx.companyId,
      automationId,
      status: normalized,
      triggerEvent: triggerEvent ?? automation.triggerLabel,
      contextJson: JSON.stringify({
        // "simulated: true" is deliberate honest labeling — no trigger engine
        // actually fired this run; a human chose to log it.
        simulated: true,
        loggedByUserManual: true,
        ...(contextJson ?? {}),
      }),
      affectedEntityLabel: affectedEntityLabel ?? null,
      startedAt: now,
      completedAt: normalized === "Queued" || normalized === "Running" ? null : now,
      durationMs: normalized === "Queued" || normalized === "Running" ? null : 0,
      errorMessage: errorMessage ?? null,
    })
    .returning();

  await db
    .update(automationRecipes)
    .set({
      runCount: (automation.runCount ?? 0) + 1,
      lastRunAt: now,
      updatedAt: now,
    })
    .where(eq(automationRecipes.id, automationId));

  return rowToRun(row, `db-${automationId}`);
}

export async function retryAutomationRun({
  ctx,
  id,
  runId,
}: {
  ctx: UserContext;
  id: string;
  runId: string;
}) {
  const automationId = parseAutomationId(id);
  const numericRunId = parseAutomationId(runId);

  // Only fall back to a synthesized retry for the mock-preview path (unsaved
  // recipes with non-numeric ids). Real recipes must resolve to a real
  // numeric id or we return null so the UI can show a real error.
  if (!automationId || !numericRunId) {
    const previousRun = mockRunsForAutomation(id).find((run) => run.id === runId);
    if (!previousRun) return null;
    return {
      ...previousRun,
      id: `${previousRun.id}-retry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "Success" as const,
      errorMessage: null,
      simulated: true,
      stepResults: previousRun.stepResults.map((step) => ({
        ...step,
        status: "Success" as const,
        message: "Retry (simulated — no engine): step marked success in log.",
      })),
    };
  }

  const [automation] = await db
    .select()
    .from(automationRecipes)
    .where(and(eq(automationRecipes.id, automationId), eq(automationRecipes.companyId, ctx.companyId)))
    .limit(1);

  if (!automation) return null;

  const [previousRun] = await db
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.id, numericRunId), eq(automationRuns.automationId, automationId)))
    .limit(1);

  if (!previousRun) return null;

  const previousContext = safeJson<Record<string, unknown>>(previousRun.contextJson, {});
  const [createdRun] = await db
    .insert(automationRuns)
    .values({
      companyId: ctx.companyId,
      automationId,
      status: "queued",
      triggerEvent: previousRun.triggerEvent ?? automation.triggerLabel,
      contextJson: JSON.stringify({
        ...previousContext,
        simulateFailure: false,
        // Honest labeling: this is a re-log, not a real re-execution — no
        // engine actually re-ran the automation's action steps.
        simulated: true,
        retriedFromRunId: previousRun.id,
        affectedEntity: previousRun.affectedEntityLabel ?? previousContext.affectedEntity,
      }),
      affectedEntityType: previousRun.affectedEntityType,
      affectedEntityId: previousRun.affectedEntityId,
      affectedEntityLabel: previousRun.affectedEntityLabel,
    })
    .returning();

  const queueResult = await enqueueAutomationRun({
    automationId,
    runId: createdRun.id,
    triggerEvent: createdRun.triggerEvent ?? automation.triggerLabel,
    context: safeJson<Record<string, unknown>>(createdRun.contextJson, {}),
  });

  if (queueResult.jobId) {
    await db
      .update(automationRuns)
      .set({ queueJobId: queueResult.jobId })
      .where(eq(automationRuns.id, createdRun.id));
  } else {
    await processAutomationRun(createdRun.id);
  }

  await db
    .update(automationRecipes)
    .set({
      runCount: (automation.runCount ?? 0) + 1,
      lastRunAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(automationRecipes.id, automationId));

  const [updatedRun] = await db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, createdRun.id))
    .limit(1);

  return updatedRun ? rowToRun(updatedRun, `db-${automationId}`) : rowToRun(createdRun, `db-${automationId}`);
}

export async function recordAutomationWebhook({
  automationId,
  payload,
  headers,
}: {
  automationId: number;
  payload: unknown;
  headers: Record<string, string>;
}) {
  const [automation] = await db
    .select()
    .from(automationRecipes)
    .where(eq(automationRecipes.id, automationId))
    .limit(1);

  if (!automation) {
    return { event: null, run: null, automation: null, queue: null };
  }

  const payloadRecord = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  const companyId = automation?.companyId ?? null;
  const [event] = await db
    .insert(automationWebhookEvents)
    .values({
      companyId,
      automationId,
      payloadJson: JSON.stringify(payload ?? {}),
      headersJson: JSON.stringify(headers),
      status: "received",
    })
    .returning();

  const [run] = await db
    .insert(automationRuns)
    .values({
      companyId,
      automationId,
      status: "queued",
      triggerEvent: "webhook.received",
      contextJson: JSON.stringify({
        webhookEventId: event.id,
        payload,
        affectedEntity: payloadRecord?.employeeName ? String(payloadRecord.employeeName) : "Webhook payload",
        affectedEntityType: "webhook",
        simulateFailure: Boolean(payloadRecord?.simulateFailure),
      }),
    })
    .returning();

  const queueResult = await enqueueAutomationRun({
    automationId,
    runId: run.id,
    triggerEvent: "webhook.received",
    context: safeJson<Record<string, unknown>>(run.contextJson, {}),
  });

  if (queueResult.jobId) {
    await db
      .update(automationRuns)
      .set({ queueJobId: queueResult.jobId })
      .where(eq(automationRuns.id, run.id));
  } else {
    await processAutomationRun(run.id);
  }

  await db
    .update(automationRecipes)
    .set({
      runCount: (automation.runCount ?? 0) + 1,
      lastRunAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(automationRecipes.id, automationId));

  return { event, run, automation, queue: queueResult };
}
