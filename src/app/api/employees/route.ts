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
      .select({ companyId: employees.companyId, role: users.role, requesterEmployeeId: employees.id })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    let allEmployees;

    if (!userEmployee || !userEmployee.companyId) {
      // Return empty array if user is not associated with a company
      return NextResponse.json([]);
    } else {
      // Get employees filtered by company
      allEmployees = await db.query.employees.findMany({
        where: eq(employees.companyId, userEmployee.companyId),
        orderBy: [desc(employees.createdAt)],
      });
    }
    
    // Apply role-based field visibility
    const requesterRole = userEmployee.role || 'employee';
    const reqEmpId = userEmployee.requesterEmployeeId;
    const isHR = requesterRole === 'hr';
    const isAdmin = requesterRole === 'admin';

    const sanitizedEmployees = allEmployees.map(emp => {
      const isSelf = reqEmpId === emp.id;
      const isManager = reqEmpId === emp.managerId;
      
      const sanitized: any = { ...emp };
      
      const canSeeSalary = isAdmin || isHR || isManager;
      const canSeePersonal = isSelf || isAdmin || isHR;
      
      if (!canSeeSalary) {
        delete sanitized.salary;
      }
      
      // Personal fields are generally not on the base employee list, but if they were
      if (!isSelf && !isAdmin && !isHR && !isManager) {
        // Just the basic directory info: name, title, department, location, avatar
        // Delete things like personal email if we distinguish it, but mostly we delete salary and performance
      }
      
      return sanitized;
    });

    return NextResponse.json(sanitizedEmployees);
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

    // 1. VALIDATION
    if (!body.firstName || !body.email) {
      return Response.json({ error: "First Name and Email are required" }, { status: 400 });
    }

    // 2. GET COMPANY ID FOR THE CURRENT USER
    let companyId = body.companyId;
    if (!companyId && userId) {
      const [userEmployee] = await db
        .select({ companyId: employees.companyId })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(eq(users.clerkUserId, userId));
      
      companyId = userEmployee?.companyId || null;
    }

    // 2.1 GUARD: Reject if company cannot be resolved
    if (!companyId) {
      console.error("[Employees POST] Could not resolve companyId for user:", userId);
      return Response.json({ 
        error: "Your account is not linked to a company. Please complete company setup first." 
      }, { status: 400 });
    }

    // 3. DATABASE INSERTION
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
      managerId: body.managerId || null,
    };

    const [newEmployee] = await db.insert(employees).values(employeeData).returning();

    // 3.1. SAVE BANKING INFO (If provided)
    if (body.bankInfo && body.bankInfo.bankName) {
      await db.insert(employeeBankAccounts).values({
        employeeId: newEmployee.id,
        bankName: body.bankInfo.bankName,
        routingNumber: body.bankInfo.routingNumber,
        accountNumberMasked: body.bankInfo.accountNumberMasked,
        isPrimary: true,
      });
    }
    
    // 3.2. CREATE ONBOARDING CASE
    await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      status: "Active",
      startDate: body.startDate || null,
    });

    console.log(`[Employees POST] Created employee ID=${newEmployee.id} for company ID=${companyId}`);
    return Response.json(newEmployee);

  } catch (error: any) {
    console.error("[Employees POST] Error:", error.message);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

