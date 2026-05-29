import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/apiRbac";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users, companies } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc, sql, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { applyEmployeeFieldVisibility } from "@/lib/fieldVisibility";
import { getEmployeeApiFallback } from "@/lib/hris-module-data";

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await requireApiPermission(req, "view_employees");
    if (permissionCheck.response) return permissionCheck.response;
    const session = permissionCheck.session;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.userId;

    // Find the user's employee record to get their company
    const [userEmployee] = await db
      .select({ companyId: employees.companyId, role: users.role, requesterEmployeeId: employees.id })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, userId));

    let allEmployees;

    if (!userEmployee || !userEmployee.companyId) {

      // IF NOT FOUND IN DB, RETURN HRIS MOCK EMPLOYEES (Safety fallback)
      const fallbackEmployees = getEmployeeApiFallback();

      return NextResponse.json(
        fallbackEmployees.map((emp) =>
          applyEmployeeFieldVisibility(emp, {
            requesterRole: "employee",
            isSelf: false,
            isManager: false,
          }),
        ),
      );
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
    const sanitizedEmployees = allEmployees.map(emp => {
      const isSelf = reqEmpId === emp.id;
      const isManager = reqEmpId === emp.managerId;

      return applyEmployeeFieldVisibility(emp, {
        requesterRole,
        isSelf,
        isManager,
      });
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

export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await requireApiPermission(req, "add_employees");
    if (permissionCheck.response) return permissionCheck.response;
    const session = permissionCheck.session;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.userId;
    const body = await req.json();

    // 1. VALIDATION
    if (!body.firstName || !body.email) {
      return NextResponse.json({ error: "First Name and Email are required" }, { status: 400 });
    }

    // 2. GET COMPANY ID FOR THE CURRENT USER
    let companyId = body.companyId;
    if (!companyId) {
      const [userEmployee] = await db
        .select({ companyId: employees.companyId })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(eq(users.id, userId));

      companyId = userEmployee?.companyId || null;
    }

    // 2.1 GUARD: Reject if company cannot be resolved
    if (!companyId) {
      console.error("[Employees POST] Could not resolve companyId for user:", userId);
      return NextResponse.json({ 
        error: "Your account is not linked to a company. Please complete company setup first." 
      }, { status: 400 });
    }

    // 3. VALIDATE COMPANY EXISTS
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) {
      console.error("[Employees POST] Company not found:", companyId);
      return NextResponse.json({ 
        error: "Company not found. Please ensure your company is properly set up." 
      }, { status: 400 });
    }

    // 4. DATABASE INSERTION
    const employeeData = {
      firstName: body.firstName,
      lastName: body.lastName || null,
      email: body.email,
      companyId: companyId,
      jobTitle: body.jobTitle || null,
      department: body.department && body.department.trim() ? body.department : null,
      departmentId: null,
      location: body.location || null,
      locationId: null,
      locationType: body.locationType || "On-Site",
      avatar: body.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${body.firstName}&backgroundColor=transparent`,
      startDate: body.startDate || null,
      status: "onboarding",
      salary: body.compensation?.salary || body.salary || null,
      employmentType: body.employmentType || "full-time",
      payType: "salary",
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
    console.error("[Employees POST] Full Error:", error);
    const errorMessage = error?.message || "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
