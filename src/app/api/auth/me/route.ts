import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      userId: session.userId.toString(),
      email: session.email,
      role: session.role,
      accountType: session.accountType,
    });
  } catch (err) {
    console.error("[Auth Me Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
