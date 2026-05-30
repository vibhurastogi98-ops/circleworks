import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { recordAutomationWebhook } from "@/lib/automations/server";

type RouteParams = {
  params: Promise<{ automationId: string }>;
};

async function readPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  const text = await request.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { rawBody: text };
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { automationId } = await params;
  const numericId = Number.parseInt(automationId, 10);

  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid automation id" }, { status: 400 });
  }

  const headers = Object.fromEntries(request.headers.entries());
  const payload = await readPayload(request);

  try {
    const result = await recordAutomationWebhook({
      automationId: numericId,
      payload,
      headers,
    });

    if (!result.automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      status: result.queue?.queued ? "queued" : "processed",
      queue: result.queue?.reason,
      automationId: numericId,
      eventId: result.event?.id,
      runId: result.run?.id,
    });
  } catch (error) {
    console.error("[Automation Webhook POST]", error);
    return NextResponse.json({ error: "Failed to queue automation webhook" }, { status: 500 });
  }
}
