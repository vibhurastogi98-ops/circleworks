import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users, employeeBankAccounts, payrollItems, payrolls, companies } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Guest Mode: Hardcoded admin user for demo purposes
    const MOCK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";
    const userId = MOCK_USER_ID;

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

    let currentUserEmployee = employee;

    // --- AUTO-REPAIR FOR ORPHANED CLERK ACCOUNTS ---
    // If the local Postgres record is missing (happens for older test accounts), create it now.
    if (!currentUserEmployee) {
      try {
        const email = "admin@circleworks.com";
        const firstName = "Admin";
        const lastName = "User";
        const companyName = "CircleWorks";

        // Create Company
        const [newCompany] = await db.insert(companies).values({
          name: companyName,
        }).returning();
        
        // Create User
        const [newUser] = await db.insert(users).values({
          clerkUserId: userId,
          email: email,
          role: "admin",
        }).returning();

        // Create initial Admin Employee record
        const [newEmployee] = await db.insert(employees).values({
          userId: newUser.id,
          companyId: newCompany.id,
          firstName: firstName,
          lastName: lastName,
          email: email,
          jobTitle: "Administrator",
          employmentType: "full-time",
          status: "active",
        }).returning();

        console.log("[DB Sync] Repaired missing database records for:", email);
        
        // Assign the newly created record to bypass the 404
        currentUserEmployee = {
          ...newEmployee,
          avatar: null, // Ensure compatibility with type
        };
      } catch (repairErr) {
        console.error("Failed to repair missing user:", repairErr);
        return NextResponse.json({ error: "Database sync failed. Please re-login." }, { status: 500 });
      }
    }

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
    // Guest Mode: Authentication disabled
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";
    const body = await req.json();

    // Guest Mode: Skipping Clerk metadata updates
    console.log("[Guest Mode] PATCH /api/users/me - Skipping metadata sync:", body);

    // 2. Local Database Sync: Auto-create Company and User records on signup completion
    if (typeof body.companyName === "string") {
      try {
        const email = "admin@circleworks.com";
        const firstName = "Admin";
        const lastName = "User";

        let [existingUser] = await db.select().from(users).where(eq(users.clerkUserId, userId));
        
        if (!existingUser) {
          // Create Company
          const [newCompany] = await db.insert(companies).values({
            name: body.companyName,
          }).returning();
          
          // Create User
          const [newUser] = await db.insert(users).values({
            clerkUserId: userId,
            email: email,
            role: "admin",
          }).returning();

          // Create initial Admin Employee record
          await db.insert(employees).values({
            userId: newUser.id,
            companyId: newCompany.id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            jobTitle: "Administrator",
            status: "active",
          });
          console.log("[DB Sync] Successfully created company, user, and employee for:", email);
        }
      } catch (dbErr) {
        console.error("[DB Sync] Failed to create postgres records:", dbErr);
      }
    }

    // 3. Optional: Sync with Backend Database (Worker API)
    try {
      // Guest Mode: Skipping worker sync in demo
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
