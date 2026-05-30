import type { Node } from "@xyflow/react";

import type { AutomationRunStatus, AutomationRunStep } from "@/data/mockAutomations";
import type { WorkflowNodeData } from "@/data/mockWorkflows";

type AutomationRunContext = Record<string, unknown> & {
  affectedEntity?: string;
  affectedEntityId?: string;
  affectedEntityType?: string;
  failStepId?: string;
  simulateFailure?: boolean;
  skipAutomation?: boolean;
};

function dataLabel(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stepSummary(node: Node<WorkflowNodeData>) {
  if (node.type === "trigger") {
    return dataLabel(node.data.triggerEvent, "Trigger received");
  }

  if (node.type === "condition") {
    const field = dataLabel(node.data.field, "employee.department");
    const operator = dataLabel(node.data.operator, "equals");
    const value = dataLabel(node.data.value, "Engineering");
    return `${field} ${operator} ${value}`;
  }

  const actionType = dataLabel(node.data.actionType, "action");
  if (actionType === "email") return `Template ${dataLabel(node.data.template, "Custom")} to ${dataLabel(node.data.recipients, "employee")}`;
  if (actionType === "slack") return `Post to ${dataLabel(node.data.channel, "#people-ops")}`;
  if (actionType === "task") return `Assign to ${dataLabel(node.data.recipients, "manager")} due ${dataLabel(node.data.dueOffset, "+3 days")}`;
  if (actionType === "update") return `Set ${dataLabel(node.data.field, "employee.status")} to ${dataLabel(node.data.value, "active")}`;
  if (actionType === "notification") return `Notify ${dataLabel(node.data.recipients, "role:hr")}`;
  if (actionType === "http") return `POST ${dataLabel(node.data.url, "external webhook")}`;
  if (actionType === "delay") return `Wait ${dataLabel(node.data.delayAmount, "2")} ${dataLabel(node.data.delayUnit, "days")}`;
  if (actionType === "loop") return `For each ${dataLabel(node.data.loopFilter, "matching employee")}`;
  return actionType;
}

export function buildAutomationStepResults({
  nodes,
  context,
}: {
  nodes: Node<WorkflowNodeData>[];
  context: AutomationRunContext;
}): AutomationRunStep[] {
  const failedStepId =
    typeof context.failStepId === "string"
      ? context.failStepId
      : context.simulateFailure
        ? nodes.find((node) => node.type === "action")?.id
        : undefined;

  return nodes.map((node, index) => {
    const isFailed = failedStepId === node.id;
    const isSkipped = Boolean(context.skipAutomation) && node.type !== "trigger";
    const status: AutomationRunStatus = isFailed ? "Failed" : isSkipped ? "Skipped" : "Success";
    const label = dataLabel(node.data.label, `${node.type ?? "Step"} ${index + 1}`);

    return {
      id: node.id,
      label,
      type: node.type ?? "action",
      status,
      durationMs: status === "Skipped" ? 0 : 180 + index * 110,
      dataPassed: {
        trigger: context.triggerEvent ?? context.event ?? "automation.triggered",
        affectedEntity: context.affectedEntity ?? context.affectedEntityLabel ?? "Demo employee",
        affectedEntityId: context.affectedEntityId ?? "demo-entity",
        stepIndex: index + 1,
        summary: stepSummary(node),
      },
      message: isFailed
        ? "Step failed and queued admin email plus notification-center alert."
        : isSkipped
          ? "Step skipped because the condition branch did not match."
          : "Step completed successfully.",
    };
  });
}

export function resolveRunStatus(steps: AutomationRunStep[], context: AutomationRunContext): AutomationRunStatus {
  if (steps.some((step) => step.status === "Failed")) return "Failed";
  if (context.skipAutomation || steps.every((step) => step.status === "Skipped")) return "Skipped";
  return "Success";
}

export function normalizeRunStatus(status?: string | null): AutomationRunStatus {
  if (status === "running") return "Running";
  if (status === "success" || status === "Success") return "Success";
  if (status === "failed" || status === "Failed") return "Failed";
  if (status === "skipped" || status === "Skipped") return "Skipped";
  return "Queued";
}
