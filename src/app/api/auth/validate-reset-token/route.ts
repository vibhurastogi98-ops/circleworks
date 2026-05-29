import { NextRequest, NextResponse } from "next/server";

import { validatePasswordResetToken } from "@/lib/password-reset";

function expiredResponse() {
  return NextResponse.json(
    {
      error: "This link has expired.",
      message: "Reset links are valid for 15 minutes.",
      status: "expired",
    },
    { status: 401 }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const validation = await validatePasswordResetToken(token);

  if (validation.status === "used") {
    return NextResponse.json(
      {
        error: "This reset link has already been used. Request a new one.",
        status: "used",
      },
      { status: 409 }
    );
  }

  if (validation.status !== "valid") return expiredResponse();

  return NextResponse.json({ valid: true, status: "valid" });
}
