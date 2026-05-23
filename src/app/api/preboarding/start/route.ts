import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.employeeId || !body?.email || !body?.personal?.legalName) {
      return NextResponse.json({ error: "Missing invitation or personal information" }, { status: 400 });
    }

    return NextResponse.json({
      account_created: true,
      employeeId: body.employeeId,
      email: body.email,
      message: "Account created from pre-boarding invitation",
    });
  } catch (error) {
    console.error("[POST /api/preboarding/start]", error);
    return NextResponse.json({ error: "Failed to create pre-boarding account" }, { status: 500 });
  }
}
