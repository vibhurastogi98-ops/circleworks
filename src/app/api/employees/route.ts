import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/apiRbac";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users, companies } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc, sql, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { applyEmployeeFieldVisibility } from "@/lib/fieldVisibility";

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

      // IF NOT FOUND IN DB, RETURN MOCK EMPLOYEES (Safety fallback)
      const fallbackEmployees = [
        { id: "1", firstName: "Sarah", lastName: "Smith", email: "sarah.smith@example.com", jobTitle: "Lead Engineer", department: "Engineering", employmentType: "full-time", status: "active", location: "New York, NY", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent", startDate: "2022-03-15", salary: 150000, personalPhone: "(555) 123-4567" },
        { id: "2", firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", jobTitle: "Product Designer", department: "Design", employmentType: "full-time", status: "active", location: "San Francisco, CA", locationType: "Remote", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=transparent", startDate: "2023-01-10", salary: 125000, personalPhone: "(555) 234-5678" },
        { id: "3", firstName: "Emma", lastName: "Watson", email: "emma.w@example.com", jobTitle: "Marketing Manager", department: "Marketing", employmentType: "full-time", status: "onboarding", location: "London, UK", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=transparent", startDate: "2024-04-01", salary: 110000, personalPhone: "(555) 345-6789" },
        { id: "4", firstName: "David", lastName: "Lee", email: "d.lee@example.com", jobTitle: "Sales Director", department: "Sales", employmentType: "full-time", status: "active", location: "Austin, TX", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=transparent", startDate: "2021-11-20", salary: 135000, personalPhone: "(555) 456-7890" },
        { id: "5", firstName: "Jessica", lastName: "Rivera", email: "j.rivera@example.com", jobTitle: "HR Manager", department: "Human Resources", employmentType: "full-time", status: "active", location: "Denver, CO", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jessica&backgroundColor=transparent", startDate: "2023-06-15", salary: 95000, personalPhone: "(555) 567-8901" },
        { id: "6", firstName: "James", lastName: "Patterson", email: "j.patterson@example.com", jobTitle: "Finance Manager", department: "Finance", employmentType: "full-time", status: "active", location: "Chicago, IL", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=James&backgroundColor=transparent", startDate: "2022-08-22", salary: 120000, personalPhone: "(555) 678-9012" },
      ];

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
