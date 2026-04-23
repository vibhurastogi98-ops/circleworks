import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Simulate auto-save
    console.log("Auto-saving partial registration for email:", data.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to auto-save" }, { status: 500 });
  }
}
