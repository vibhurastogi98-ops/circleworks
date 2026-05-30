import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Edge, Node } from "@xyflow/react";

import {
  createAutomationRecipe,
  listAutomationRecipes,
} from "@/lib/automations/server";
import {
  AUTOMATION_CATEGORIES,
  type AutomationCategory,
  type AutomationStatus,
  type AutomationTriggerType,
} from "@/data/mockAutomations";
import { getSession, resolveUserContext } from "@/lib/session";
import type { WorkflowNodeData } from "@/data/mockWorkflows";

type AutomationRecipeBody = {
  title?: string;
  description?: string;
  category?: string;
  trigger?: string;
  triggerType?: string;
  status?: string;
  template?: boolean;
  templateId?: string;
  nodes?: unknown[];
  edges?: unknown[];
};

const statuses: AutomationStatus[] = ["Active", "Paused", "Draft"];
const triggerTypes: AutomationTriggerType[] = ["event", "schedule", "webhook"];

function normalizeCategory(category: string | undefined): AutomationCategory {
  return AUTOMATION_CATEGORIES.includes(category as AutomationCategory)
    ? (category as AutomationCategory)
    : "Onboarding";
}

function normalizeStatus(status: string | undefined): AutomationStatus {
  return statuses.includes(status as AutomationStatus) ? (status as AutomationStatus) : "Draft";
}

function normalizeTriggerType(triggerType: string | undefined): AutomationTriggerType {
  return triggerTypes.includes(triggerType as AutomationTriggerType)
    ? (triggerType as AutomationTriggerType)
    : "event";
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  const ctx = session ? await resolveUserContext(session) : null;
  const data = await listAutomationRecipes(ctx);

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await resolveUserContext(session);
  if (!ctx) {
    return NextResponse.json({ error: "Employee context not found" }, { status: 404 });
  }

  let body: AutomationRecipeBody;
  try {
    body = (await request.json()) as AutomationRecipeBody;
  } catch {
    return NextResponse.json({ error: "Invalid automation payload" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const trigger = (body.trigger ?? "").trim();

  if (!title || !trigger || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return NextResponse.json(
      { error: "title, trigger, nodes, and edges are required" },
      { status: 400 },
    );
  }

  try {
    const automation = await createAutomationRecipe({
      session,
      ctx,
      recipe: {
        title,
        description: body.description?.trim() ?? "",
        category: normalizeCategory(body.category),
        trigger,
        triggerType: normalizeTriggerType(body.triggerType),
        status: normalizeStatus(body.status),
        template: Boolean(body.template),
        templateId: body.templateId,
        nodes: body.nodes as Node<WorkflowNodeData>[],
        edges: body.edges as Edge[],
      },
    });

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    console.error("[Automations POST]", error);
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
