import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { listAutomationRuns, logAutomationRun } from "@/lib/automations/server";
import { getSession, resolveUserContext } from "@/lib/session";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  const ctx = session ? await resolveUserContext(session) : null;
  const { id } = await params;

  try {
    const runs = await listAutomationRuns(ctx, decodeURIComponent(id));
    return NextResponse.json({ runs });
  } catch (error) {
    console.error("[Automations Runs GET]", error);
    return NextResponse.json({ error: "Failed to load automation runs" }, { status: 500 });
  }
}

/**
 * POST /api/automations/[id]/runs — manually log a simulated run.
 * There's no trigger-listening / action-firing engine (out of scope for
 * this pass) so runs are user-logged rather than engine-fired. The row
 * lands with `contextJson.simulated = true` for honest UI labeling.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx) return NextResponse.json({ error: "Employee context not found" }, { status: 404 });
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as {
    triggerEvent?: string; status?: string; affectedEntityLabel?: string; errorMessage?: string; context?: Record<string, unknown>;
  };

  const run = await logAutomationRun({
    ctx,
    id: decodeURIComponent(id),
    triggerEvent: body.triggerEvent,
    status: body.status,
    contextJson: body.context,
    affectedEntityLabel: body.affectedEntityLabel,
    errorMessage: body.errorMessage ?? null,
  });
  if (!run) return NextResponse.json({ error: "automation_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, run, simulated: true });
}
