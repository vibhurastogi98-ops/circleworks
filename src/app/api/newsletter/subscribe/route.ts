import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      source?: unknown;
    };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body.source === "string" ? body.source : "unknown";

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email is required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        email,
        source,
        subscribedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to subscribe right now." },
      { status: 500 },
    );
  }
}
