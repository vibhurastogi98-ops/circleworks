import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users, employeeBankAccounts, payrollItems, payrolls, companies } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [employee] = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        jobTitle: employees.jobTitle,
        department: employees.department,
        location: employees.location,
        locationType: employees.locationType,
        startDate: employees.startDate,
        employmentType: employees.employmentType,
        avatar: employees.avatar,
        status: employees.status,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    const currentUserEmployee = employee;

    if (!currentUserEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const bankAccount = await db.query.employeeBankAccounts.findFirst({
      where: eq(employeeBankAccounts.employeeId, currentUserEmployee.id),
      orderBy: [desc(employeeBankAccounts.createdAt)],
    });

    const payStubs = await db
      .select({
        id: payrollItems.id,
        payDate: payrolls.checkDate,
        periodStart: payrolls.payPeriodStart,
        periodEnd: payrolls.payPeriodEnd,
        grossPay: payrollItems.gross,
        federalTax: payrollItems.federalTax,
        stateTax: payrollItems.stateTax,
        socialSecurity: payrollItems.ficaSs,
        medicare: payrollItems.ficaMed,
        healthInsurance: payrollItems.benefits,
        dentalInsurance: payrollItems.benefits,
        visionInsurance: sql<number>`0`,
        retirement401k: sql<number>`0`,
        fsaContribution: sql<number>`0`,
        otherDeductions: sql<number>`0`,
        netPay: payrollItems.net,
      })
      .from(payrollItems)
      .leftJoin(payrolls, eq(payrollItems.payrollId, payrolls.id))
      .where(eq(payrollItems.employeeId, currentUserEmployee.id))
      .orderBy(desc(payrolls.checkDate))
      .limit(12);

    return NextResponse.json({
      profile: {
        id: currentUserEmployee.id.toString(),
        firstName: currentUserEmployee.firstName,
        lastName: currentUserEmployee.lastName || "",
        fullName: `${currentUserEmployee.firstName} ${currentUserEmployee.lastName || ""}`.trim(),
        email: currentUserEmployee.email,
        jobTitle: currentUserEmployee.jobTitle || "",
        department: currentUserEmployee.department || "",
        startDate: currentUserEmployee.startDate ? new Date(currentUserEmployee.startDate).toISOString().split("T")[0] : "",
        employeeType: currentUserEmployee.employmentType || "full-time",
        location: currentUserEmployee.location || "",
        locationType: currentUserEmployee.locationType || "",
        avatarUrl: currentUserEmployee.avatar,
        status: currentUserEmployee.status || "active",
        bankAccount: bankAccount
          ? {
              bankName: bankAccount.bankName,
              routingNumber: bankAccount.routingNumber,
              accountNumber: bankAccount.accountNumberMasked,
              accountType: "Checking",
              lastUpdated: bankAccount.createdAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            }
          : null,
      },
      payStubs: payStubs.map((stub) => ({
        id: stub.id.toString(),
        payDate: stub.payDate ? new Date(stub.payDate).toISOString().split("T")[0] : "",
        periodStart: stub.periodStart ? new Date(stub.periodStart).toISOString().split("T")[0] : "",
        periodEnd: stub.periodEnd ? new Date(stub.periodEnd).toISOString().split("T")[0] : "",
        grossPay: stub.grossPay,
        federalTax: stub.federalTax,
        stateTax: stub.stateTax,
        socialSecurity: stub.socialSecurity,
        medicare: stub.medicare,
        healthInsurance: stub.healthInsurance,
        dentalInsurance: stub.dentalInsurance,
        visionInsurance: stub.visionInsurance,
        retirement401k: stub.retirement401k,
        fsaContribution: stub.fsaContribution,
        otherDeductions: stub.otherDeductions,
        netPay: stub.netPay,
        hoursWorked: 80,
        overtimeHours: 0,
        overtimePay: 0,
        bonusPay: 0,
        year: new Date(stub.payDate || "").getFullYear(),
      })),
    });
  } catch (error: any) {
    console.error("[Users ME GET Error]", error);
    return NextResponse.json({ error: "Failed to load employee portal data" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (typeof body.companyName === "string") {
      try {
        const [existingEmployee] = await db
          .select({ id: employees.id })
          .from(employees)
          .leftJoin(users, eq(employees.userId, users.id))
          .where(eq(users.id, session.userId));

        if (!existingEmployee) {
          const [newCompany] = await db.insert(companies).values({
            name: body.companyName,
          }).returning();

          await db.insert(employees).values({
            userId: session.userId,
            companyId: newCompany.id,
            firstName: session.email.split("@")[0],
            email: session.email,
            jobTitle: "Administrator",
            status: "active",
          });
          console.log("[DB Sync] Created company and employee for:", session.email);
        }
      } catch (dbErr) {
        console.error("[DB Sync] Failed to create postgres records:", dbErr);
      }
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(body) });
  } catch (error: any) {
    console.error("[USERS_ME_PATCH]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
