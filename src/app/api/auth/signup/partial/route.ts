import { NextResponse } from "next/server";

type PartialSignupPayload = {
  email?: string;
  step?: number;
  companyName?: string;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as PartialSignupPayload;

    if (!payload?.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      step: typeof payload.step === "number" ? payload.step : null,
      companyName: payload.companyName ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
