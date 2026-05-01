import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc, sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    let userId: string | null = null;
    const GUEST_USER_ID = process.env.NODE_ENV !== 'production' ? "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD" : null;

    try {
      const authResult = await auth();
      userId = authResult.userId ?? null;
    } catch (authError) {
      console.warn("[Employees GET] Clerk auth failed, falling back to demo guest user", authError);
      userId = GUEST_USER_ID;
    }

    if (!userId) {
      if (GUEST_USER_ID) {
        console.warn("[Employees GET] No Clerk user session found; using demo guest user in development.");
        userId = GUEST_USER_ID;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    // Find the user's employee record to get their company
    const [userEmployee] = await db
      .select({ companyId: employees.companyId, role: users.role, requesterEmployeeId: employees.id })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    let allEmployees;

    if (!userEmployee || !userEmployee.companyId) {
      // Check if user exists in users table
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, userId));

      if (!existingUser) {
        // Create user record (this should normally be done by webhook, but fallback here)
        await db.insert(users).values({
          clerkUserId: userId,
          email: "", // Will be updated by webhook or profile
          role: "employee",
        });
      }

      // IF NOT FOUND IN DB, RETURN MOCK EMPLOYEES (Safety fallback)
      return NextResponse.json([
        { id: "1", firstName: "Sarah", lastName: "Smith", email: "sarah.smith@example.com", jobTitle: "Lead Engineer", department: "Engineering", employmentType: "full-time", status: "active", location: "New York, NY", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent", startDate: "2022-03-15" },
        { id: "2", firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", jobTitle: "Product Designer", department: "Design", employmentType: "full-time", status: "active", location: "San Francisco, CA", locationType: "Remote", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=transparent", startDate: "2023-01-10" },
        { id: "3", firstName: "Emma", lastName: "Watson", email: "emma.w@example.com", jobTitle: "Marketing Manager", department: "Marketing", employmentType: "full-time", status: "onboarding", location: "London, UK", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=transparent", startDate: "2024-04-01" },
        { id: "4", firstName: "David", lastName: "Lee", email: "d.lee@example.com", jobTitle: "Sales Director", department: "Sales", employmentType: "full-time", status: "active", location: "Austin, TX", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=transparent", startDate: "2021-11-20" },
      ]);
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
      
      return sanitized;
    });

    return NextResponse.json(sanitizedEmployees);
  } catch (error: any) {
    console.error("[Employees GET Error]", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch employees."
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

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
