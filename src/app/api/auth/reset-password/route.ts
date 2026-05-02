import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { hashPassword } from "@/lib/password";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

export async function POST(req: Request) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (!password || !confirmPassword || typeof password !== "string" || typeof confirmPassword !== "string") {
      return NextResponse.json({ error: "Password and confirmation are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "password-reset") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = Number(payload.sub);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
