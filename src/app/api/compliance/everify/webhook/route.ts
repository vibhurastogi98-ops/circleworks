import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    received: true,
    caseNumber: payload.caseNumber ?? "unknown",
    status: payload.status ?? "Case update queued",
  });
}
