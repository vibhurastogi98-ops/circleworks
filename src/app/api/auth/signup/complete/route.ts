import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, companies, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

function splitFullName(fullName: string | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Admin",
    lastName: parts.slice(1).join(" ") || null,
  };
}

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

    const adminName = splitFullName(step1?.fullName);
    const passwordHash = hashPassword(password);

    const { user } = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({ email, passwordHash, role: "admin" })
        .returning();

      const [company] = await tx
        .insert(companies)
        .values({ name: step2?.companyName || "My Company" })
        .returning();

      const parseSalary = (value: unknown) =>
        value ? Math.round(parseFloat(String(value).replace(/,/g, "")) || 0) : 0;

      await tx.insert(employees).values({
        userId: newUser.id,
        companyId: company.id,
        firstName: step4?.isAdminEmployee ? (step4.firstName || adminName.firstName) : adminName.firstName,
        lastName: step4?.isAdminEmployee ? (step4.lastName || adminName.lastName) : adminName.lastName,
        email,
        jobTitle: step4?.isAdminEmployee ? (step4.title || "Company Admin") : "Company Admin",
        startDate: step4?.isAdminEmployee ? (step4.startDate || null) : null,
        payType: step4?.isAdminEmployee ? (step4.payType || "salary") : "salary",
        salary: step4?.isAdminEmployee ? parseSalary(step4.payRate) : 0,
        status: "active",
      });

      if (!step4?.skip && step4?.firstName && !step4?.isAdminEmployee) {
        await tx.insert(employees).values({
          userId: null,
          companyId: company.id,
          firstName: step4.firstName,
          lastName: step4.lastName || "",
          email: step4.employeeEmail || "",
          jobTitle: step4.title || "",
          startDate: step4.startDate || null,
          payType: step4.payType || "salary",
          salary: parseSalary(step4.payRate),
          status: "active",
        });
      }

      return { user: newUser };
    });

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
