import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const token = await createSessionToken(
      { userId: user.id, email: user.email, role: user.role || "employee" },
      !!rememberMe
    );

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("[Auth Login Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
