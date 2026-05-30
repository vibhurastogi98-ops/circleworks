import { NextResponse } from "next/server";

import type { FeedbackEntry, FeedbackType } from "@/data/mockPerformance";

function isFeedbackType(value: unknown): value is FeedbackType {
  return value === "Praise" || value === "Constructive" || value === "Thanks";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      recipient?: string;
      type?: unknown;
      message?: string;
      anonymous?: boolean;
    };

    if (!payload.recipient || !isFeedbackType(payload.type) || !payload.message?.trim()) {
      return NextResponse.json({ error: "Recipient, type, and message are required." }, { status: 400 });
    }

    const feedback: FeedbackEntry = {
      id: `feedback-${Date.now()}`,
      sender: payload.anonymous ? "Anonymous" : "Vibhu Rastogi",
      recipient: payload.recipient,
      type: payload.type,
      message: payload.message.trim(),
      date: new Date().toISOString().slice(0, 10),
      anonymous: Boolean(payload.anonymous),
    };

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feedback]", error);
    return NextResponse.json({ error: "Failed to send feedback." }, { status: 500 });
  }
}
