import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  deleteAutomationRecipe,
  updateAutomationRecipe,
  updateAutomationStatus,
} from "@/lib/automations/server";
import type { AutomationStatus } from "@/data/mockAutomations";
import { getSession, resolveUserContext } from "@/lib/session";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const statuses: AutomationStatus[] = ["Active", "Paused", "Draft"];

function parseAutomationId(id: string) {
  const normalized = id.startsWith("db-") ? id.slice(3) : id;
  const numericId = Number.parseInt(normalized, 10);
  return Number.isFinite(numericId) ? numericId : null;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await resolveUserContext(session);
  if (!ctx) {
    return NextResponse.json({ error: "Employee context not found" }, { status: 404 });
  }

  const { id } = await params;
  const automationId = parseAutomationId(id);
  if (!automationId) {
    return NextResponse.json({ error: "Only saved automations can be updated" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid automation payload" }, { status: 400 });
  }

  // Two dispatch paths:
  //   • status-only PATCH — the common "Pause / Activate" toggle, kept as
  //     the narrow fast path for existing callers.
  //   • full edit — title/description/category/trigger/nodes/edges.
  const bodyKeys = Object.keys(body);
  const isStatusOnly = bodyKeys.length === 1 && bodyKeys[0] === "status";

  try {
    if (isStatusOnly) {
      if (!statuses.includes(body.status as AutomationStatus)) {
        return NextResponse.json({ error: "Invalid automation status" }, { status: 400 });
      }
      const automation = await updateAutomationStatus({
        ctx,
        id: automationId,
        status: body.status as AutomationStatus,
      });
      if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });
      return NextResponse.json({ automation });
    }

    const automation = await updateAutomationRecipe({ ctx, id: automationId, updates: body as never });
    if (!automation) return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    return NextResponse.json({ automation });
  } catch (error) {
    console.error("[Automations PATCH]", error);
    return NextResponse.json({ error: "Failed to update automation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await resolveUserContext(session);
  if (!ctx) {
    return NextResponse.json({ error: "Employee context not found" }, { status: 404 });
  }

  const { id } = await params;
  const automationId = parseAutomationId(id);
  if (!automationId) {
    return NextResponse.json({ error: "Only saved automations can be deleted" }, { status: 400 });
  }

  try {
    await deleteAutomationRecipe(ctx, automationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Automations DELETE]", error);
    return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 });
  }
}
