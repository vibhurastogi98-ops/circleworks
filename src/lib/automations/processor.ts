import type { Node } from "@xyflow/react";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  automationRecipes,
  automationRuns,
  employees,
  notifications,
  users,
} from "@/db/schema";
import type { WorkflowNodeData } from "@/data/mockWorkflows";
import { buildAutomationStepResults, resolveRunStatus } from "@/lib/automations/engine";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function failureRecipients(companyId: number | null) {
  if (!companyId) return [];

  const adminRows = await db
    .select({ id: employees.id })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(and(eq(employees.companyId, companyId), inArray(users.role, ["admin", "hr"])))
    .limit(5);

  if (adminRows.length) return adminRows;

  return db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .limit(3);
}

async function createFailureAlerts({
  automationId,
  companyId,
  runId,
  title,
  errorMessage,
}: {
  automationId: number;
  companyId: number | null;
  runId: number;
  title: string;
  errorMessage: string;
}) {
  const recipients = await failureRecipients(companyId);
  if (!recipients.length || !companyId) return;

  await db.insert(notifications).values(
    recipients.map((recipient) => ({
      companyId,
      employeeId: recipient.id,
      type: "system.maintenance",
      category: "system",
      priority: "critical",
      title: `Automation failed: ${title}`,
      description: errorMessage,
      actionLabel: "Open run",
      link: `/app/automations/db-${automationId}/runs?run=db-${runId}`,
      metadata: JSON.stringify({ automationId, runId }),
      emailDeliveryStatus: "queued",
      smsDeliveryStatus: "not_sent",
    })),
  );

  await db
    .update(automationRuns)
    .set({ adminNotifiedAt: new Date() })
    .where(eq(automationRuns.id, runId));
}

export async function processAutomationRun(runId: number) {
  const startedAt = new Date();
  const [run] = await db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .limit(1);

  if (!run?.automationId) return null;

  const [automation] = await db
    .select()
    .from(automationRecipes)
    .where(eq(automationRecipes.id, run.automationId))
    .limit(1);

  if (!automation) return null;

  await db
    .update(automationRuns)
    .set({ status: "running", startedAt })
    .where(eq(automationRuns.id, runId));

  const context = parseJson<Record<string, unknown>>(run.contextJson, {});
  const nodes = parseJson<Node<WorkflowNodeData>[]>(automation.nodesJson, []);
  const enrichedContext = {
    ...context,
    triggerEvent: run.triggerEvent ?? automation.triggerLabel,
    automationTitle: automation.title,
  };

  const steps = buildAutomationStepResults({ nodes, context: enrichedContext });
  const status = resolveRunStatus(steps, enrichedContext);
  const completedAt = new Date();
  const durationMs = Math.max(1, completedAt.getTime() - startedAt.getTime());
  const errorMessage = status === "Failed" ? "One or more automation steps failed." : null;

  await db
    .update(automationRuns)
    .set({
      status: status.toLowerCase(),
      completedAt,
      durationMs,
      errorMessage,
      stepsJson: JSON.stringify(steps),
      affectedEntityType: typeof context.affectedEntityType === "string" ? context.affectedEntityType : "employee",
      affectedEntityId: typeof context.affectedEntityId === "string" ? context.affectedEntityId : null,
      affectedEntityLabel:
        typeof context.affectedEntity === "string"
          ? context.affectedEntity
          : typeof context.affectedEntityLabel === "string"
            ? context.affectedEntityLabel
            : "Workflow event",
    })
    .where(eq(automationRuns.id, runId));

  if (status === "Failed") {
    await createFailureAlerts({
      automationId: automation.id,
      companyId: automation.companyId,
      runId,
      title: automation.title,
      errorMessage: errorMessage ?? "Automation failed.",
    });
  }

  return { runId, status, steps };
}
