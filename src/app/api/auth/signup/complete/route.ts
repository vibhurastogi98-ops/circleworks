import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, companies, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { step1, step2, step3, step4 } = await req.json();

    const email = (step1?.email as string)?.toLowerCase().trim();
    const password = step1?.password as string;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, role: "admin" })
      .returning();

    const [company] = await db
      .insert(companies)
      .values({ name: step2?.companyName || "My Company" })
      .returning();

    if (!step4?.skip && step4?.firstName) {
      await db.insert(employees).values({
        userId: step4.isAdminEmployee ? user.id : null,
        companyId: company.id,
        firstName: step4.firstName || "",
        lastName: step4.lastName || "",
        email: step4.employeeEmail || "",
        jobTitle: step4.title || "",
        startDate: step4.startDate || null,
        payType: step4.payType || "salary",
        salary: step4.payRate ? Math.round(parseFloat(String(step4.payRate).replace(/,/g, "")) || 0) : 0,
        status: "active",
      });
    }

    const token = await createSessionToken({ userId: user.id, email: user.email, role: "admin" });

    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[Signup Complete]", err);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
