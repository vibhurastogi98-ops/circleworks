import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc, sql, eq } from "drizzle-orm";
import { clerkClient, auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Get current authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's employee record to get their company
    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    let allEmployees;

    if (!userEmployee || !userEmployee.companyId) {
      // If no company association, return all employees (for demo/testing)
      console.log("[Employees GET] No company association found, returning all employees");
      allEmployees = await db.query.employees.findMany({
        orderBy: [desc(employees.createdAt)],
      });
    } else {
      // Get employees filtered by company
      allEmployees = await db.query.employees.findMany({
        where: eq(employees.companyId, userEmployee.companyId),
        orderBy: [desc(employees.createdAt)],
      });
    }
    
    return NextResponse.json(allEmployees);
  } catch (error: any) {
    console.error("[Employees GET Error]", error);
    
    // Check for specific database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('DATABASE_URL')) {
      return NextResponse.json({ 
        error: "Database Connection Error", 
        message: "The application could not connect to the database. Please ensure DATABASE_URL is set in .env.local and the database is running."
      }, { status: 503 }); // Service Unavailable
    }

    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch employees. Check server logs."
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = await auth();

    console.log("[Employees POST] Request body:", body);
    console.log("[Employees POST] User ID:", userId);

    // 1. VALIDATION
    if (!body.firstName || !body.email) {
      return Response.json({ error: "First Name and Email are required" }, { status: 400 });
    }

    // 2. GET COMPANY ID FOR THE CURRENT USER
    let companyId = body.companyId;
    if (!companyId && userId) {
      // Get the company ID from the current user's employee record
      const [userEmployee] = await db
        .select({ companyId: employees.companyId })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(eq(users.clerkUserId, userId));
      
      companyId = userEmployee?.companyId || null;
      console.log("[Employees POST] Company ID lookup result:", userEmployee);
    }

    console.log("[Employees POST] Using company ID:", companyId);

    // 3. DATABASE INSERTION
    // Map the incoming body to the database schema
    const employeeData = {
      firstName: body.firstName,
      lastName: body.lastName || null,
      email: body.email,
      companyId: companyId,
      jobTitle: body.jobTitle || null,
      department: body.department || null,
      location: body.location || null,
      locationType: body.locationType || "On-Site",
      avatar: body.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${body.firstName}&backgroundColor=transparent`,
      startDate: body.startDate || null,
      status: "onboarding",
      salary: body.compensation?.salary || body.salary || null,
      employmentType: body.employmentType || "full-time",
    };

    console.log("[Employees POST] Inserting employee data:", employeeData);

    const [newEmployee] = await db.insert(employees).values(employeeData).returning();

    // 2.2. SAVE BANKING INFO (If provided)
    if (body.bankInfo && body.bankInfo.bankName) {
      await db.insert(employeeBankAccounts).values({
        employeeId: newEmployee.id,
        bankName: body.bankInfo.bankName,
        routingNumber: body.bankInfo.routingNumber,
        accountNumberMasked: body.bankInfo.accountNumberMasked,
        isPrimary: true,
      });
    }
    
    // 2.3. CREATE ONBOARDING CASE
    await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      status: "Active",
      startDate: body.startDate || null,
    });

    console.log(`[Employees POST] Successfully created employee with ID: ${newEmployee.id}`);
    console.log("[Employees POST] Created employee:", newEmployee);

    // Return the inserted record as requested
    return Response.json(newEmployee);

  } catch (error: any) {
    console.error("EMPLOYEE CREATE ERROR:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

