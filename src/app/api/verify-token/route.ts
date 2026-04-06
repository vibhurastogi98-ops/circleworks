import { NextResponse } from "next/server";
import { verifyInviteToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "No token provided" }, { status: 400 });
  }

  const payload = await verifyInviteToken(token);

  if (!payload) {
    return NextResponse.json({ valid: false, error: "Token is invalid or has expired." }, { status: 401 });
  }

  return NextResponse.json({ valid: true, payload });
}
