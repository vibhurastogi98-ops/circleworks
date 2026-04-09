import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users, employeeBankAccounts, payrollItems, payrolls } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
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
      .where(eq(users.clerkUserId, userId));

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const bankAccount = await db.query.employeeBankAccounts.findFirst({
      where: eq(employeeBankAccounts.employeeId, employee.id),
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
        visionInsurance: 0,
        retirement401k: 0,
        fsaContribution: 0,
        otherDeductions: 0,
        netPay: payrollItems.net,
      })
      .from(payrollItems)
      .leftJoin(payrolls, eq(payrollItems.payrollId, payrolls.id))
      .where(eq(payrollItems.employeeId, employee.id))
      .orderBy(desc(payrolls.checkDate))
      .limit(12);

    return NextResponse.json({
      profile: {
        id: employee.id.toString(),
        firstName: employee.firstName,
        lastName: employee.lastName || "",
        fullName: `${employee.firstName} ${employee.lastName || ""}`.trim(),
        email: employee.email,
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        startDate: employee.startDate?.toISOString().split("T")[0] || "",
        employeeType: employee.employmentType || "full-time",
        location: employee.location || "",
        locationType: employee.locationType || "",
        avatarUrl: employee.avatar,
        status: employee.status || "active",
        bankAccount: bankAccount
          ? {
              bankName: bankAccount.bankName,
              routingNumber: bankAccount.routingNumber,
              accountNumber: bankAccount.accountNumberMasked,
              accountType: "Checking",
              lastUpdated: bankAccount.createdAt.toISOString().split("T")[0],
            }
          : null,
      },
      payStubs: payStubs.map((stub) => ({
        id: stub.id.toString(),
        payDate: stub.payDate?.toISOString().split("T")[0] || "",
        periodStart: stub.periodStart?.toISOString().split("T")[0] || "",
        periodEnd: stub.periodEnd?.toISOString().split("T")[0] || "",
        grossPay: stub.grossPay,
        federalTax: stub.federalTax,
        stateTax: stub.stateTax,
        socialSecurity: stub.socialSecurity,
        medicare: stub.medicare,
        healthInsurance: stub.healthInsurance,
        dentalInsurance: stub.dentalInsurance,
        visionInsurance: 0,
        retirement401k: 0,
        fsaContribution: 0,
        otherDeductions: 0,
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
    const { userId, getToken } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const client = await clerkClient();

    // 1. Update Clerk Metadata if relevant fields are present
    const metadataToUpdate: Record<string, any> = {};
    if (typeof body.hasCompletedTour === "boolean") {
      metadataToUpdate.hasCompletedTour = body.hasCompletedTour;
    }
    if (typeof body.companyName === "string") {
      metadataToUpdate.companyName = body.companyName;
    }
    if (typeof body.companyLogoUrl === "string") {
      metadataToUpdate.companyLogoUrl = body.companyLogoUrl;
    }

    if (Object.keys(metadataToUpdate).length > 0) {
      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: metadataToUpdate
        });
      } catch (clerkErr: any) {
        console.error("Clerk metadata update failed:", clerkErr);
        return NextResponse.json({ 
          error: clerkErr.message || "Failed to update metadata",
          details: clerkErr.errors 
        }, { status: 422 });
      }
    }

    // 2. Sync with Backend Database (Worker API)
    const token = await getToken();
    try {
      await fetch("https://circleworks-worker.vibhurastogi98.workers.dev/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error("Failed to sync profile fields to backend DB", err);
      // non-blocking
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(body) });
  } catch (error: any) {
    console.error("[USERS_ME_PATCH]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
