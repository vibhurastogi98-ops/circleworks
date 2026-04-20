import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users, employeeBankAccounts, payrollItems, payrolls, companies } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    // IF NOT LOGGED IN, RETURN MOCK DATA (Remove Login Dependency)
    if (!userId) {
      console.log("[API] Returning mock data for unauthenticated user");
      return NextResponse.json({
        profile: {
          id: "guest-user",
          firstName: "Guest",
          lastName: "User",
          fullName: "Guest User",
          email: "guest@example.com",
          jobTitle: "Guest Explorer",
          department: "Product",
          startDate: new Date().toISOString().split("T")[0],
          employeeType: "full-time",
          location: "Remote",
          locationType: "remote",
          avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Guest&backgroundColor=transparent",
          status: "active",
          bankAccount: {
            bankName: "Demo Bank",
            routingNumber: "123456789",
            accountNumber: "****1234",
            accountType: "Checking",
            lastUpdated: new Date().toISOString().split("T")[0],
          },
        },
        payStubs: [],
      });
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

    let currentUserEmployee = employee;

    // --- AUTO-REPAIR FOR ORPHANED CLERK ACCOUNTS ---
    // If the local Postgres record is missing (happens for older test accounts), create it now.
    if (!currentUserEmployee) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const firstName = clerkUser.firstName || "Admin";
        const lastName = clerkUser.lastName || "";
        const companyName = clerkUser.publicMetadata?.companyName as string || "Your Company";

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
    if (typeof body.hasData === "boolean") {
      metadataToUpdate.hasData = body.hasData;
    }
    if (typeof body.role === "string") {
      metadataToUpdate.role = body.role;
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

    // 2. Local Database Sync: Auto-create Company and User records on signup completion
    if (typeof body.companyName === "string") {
      try {
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const firstName = clerkUser.firstName || "Admin";
        const lastName = clerkUser.lastName || "";

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
