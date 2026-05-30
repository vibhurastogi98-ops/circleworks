import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { listAutomationRuns } from "@/lib/automations/server";
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
