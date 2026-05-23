import { NextResponse } from "next/server";

const CONSENT_COOKIE = "circleworks_consent";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid consent payload" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(CONSENT_COOKIE, JSON.stringify(payload), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
