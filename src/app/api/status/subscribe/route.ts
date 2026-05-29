import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = String(body.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    console.log(`[Status Subscribe] ${email}`);

    return NextResponse.json({
      success: true,
      message: "We'll email you during any incident.",
    });
  } catch (error) {
    console.error("[Status Subscribe Error]", error);
    return NextResponse.json(
      { success: false, error: "Unable to subscribe right now." },
      { status: 500 },
    );
  }
}
