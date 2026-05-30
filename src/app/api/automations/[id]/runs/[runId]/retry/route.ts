import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { retryAutomationRun } from "@/lib/automations/server";
import { getSession, resolveUserContext } from "@/lib/session";

type RouteParams = {
  params: Promise<{ id: string; runId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await resolveUserContext(session);
  if (!ctx) {
    return NextResponse.json({ error: "Employee context not found" }, { status: 404 });
  }

  const { id, runId } = await params;

  try {
    const run = await retryAutomationRun({
      ctx,
      id: decodeURIComponent(id),
      runId: decodeURIComponent(runId),
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found or not retryable" }, { status: 404 });
    }

    return NextResponse.json({ run });
  } catch (error) {
    console.error("[Automations Run Retry POST]", error);
    return NextResponse.json({ error: "Failed to retry automation run" }, { status: 500 });
  }
}
