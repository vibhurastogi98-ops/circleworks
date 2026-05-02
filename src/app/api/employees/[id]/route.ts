import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
      with: {
        manager: true,
        subordinates: true,
        ptoRequests: true,
        timesheets: true,
        documents: true,
        bankAccounts: true,
        onboardingCases: true,
      }
    });

    if (!employee) {
      // IF NOT FOUND AND MOCK ID, RETURN MOCK DATA (Safety fallback)
      if (employeeId >= 1 && employeeId <= 4) {
        const mocks = [
          { id: 1, firstName: "Sarah", lastName: "Smith", email: "sarah.smith@example.com", jobTitle: "Lead Engineer", department: "Engineering", employmentType: "full-time", status: "active", location: "New York, NY", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent", startDate: "2022-03-15", salary: 145000 },
          { id: 2, firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", jobTitle: "Product Designer", department: "Design", employmentType: "full-time", status: "active", location: "San Francisco, CA", locationType: "Remote", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=transparent", startDate: "2023-01-10", salary: 130000 },
          { id: 3, firstName: "Emma", lastName: "Watson", email: "emma.w@example.com", jobTitle: "Marketing Manager", department: "Marketing", employmentType: "full-time", status: "onboarding", location: "London, UK", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=transparent", startDate: "2024-04-01", salary: 95000 },
          { id: 4, firstName: "David", lastName: "Lee", email: "d.lee@example.com", jobTitle: "Sales Director", department: "Sales", employmentType: "full-time", status: "active", location: "Austin, TX", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=transparent", startDate: "2021-11-20", salary: 160000 },
        ];
        return NextResponse.json(mocks.find(m => m.id === employeeId));
      }
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const session = await getSession();
    let requesterRole = 'admin';
    let requesterEmployeeId = null;

    if (session) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
        with: { employees: true }
      });
      if (user) {
        requesterRole = user.role || 'admin';
        requesterEmployeeId = user.employees?.[0]?.id || null;
      }
    }

    const isSelf = requesterEmployeeId === employeeId;
    const isManager = requesterEmployeeId === employee.managerId;
    const isHR = requesterRole === 'hr';
    const isAdmin = requesterRole === 'admin';

    // Apply visibility rules
    const sanitized: any = { ...employee };

    const canSeeBank = isSelf || isAdmin;
    const canSeeSalary = isAdmin || isHR || isManager;
    const canSeePersonal = isSelf || isAdmin || isHR;

    if (!canSeeBank) {
      delete sanitized.bankAccounts;
    }

    if (!canSeeSalary) {
      delete sanitized.salary;
      delete sanitized.compensation;
    }

    if (!canSeePersonal) {
      delete sanitized.documents;
      delete sanitized.onboardingCases;
    }

    return NextResponse.json(sanitized);
  } catch (error: any) {
    console.error("[Employee GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Guest Mode: Authentication disabled
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    // Check if employee exists
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await db.delete(employeeBankAccounts).where(eq(employeeBankAccounts.employeeId, employeeId));
    await db.delete(onboardingCases).where(eq(onboardingCases.employeeId, employeeId));

    // Delete the employee
    await db.delete(employees).where(eq(employees.id, employeeId));

    console.log(`[Employee DELETE] Successfully deleted employee with ID: ${employeeId}`);

    return NextResponse.json({ message: "Employee deleted successfully" });

  } catch (error: any) {
    console.error("[Employee DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Guest Mode: Authentication disabled
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await req.json();
    console.log("[Employee PUT] Request body:", body);

    // Check if employee exists
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update employee data
    const updateData: any = {
      firstName: body.firstName,
      lastName: body.lastName || null,
      email: body.email,
      jobTitle: body.jobTitle || null,
      department: body.department || null,
      location: body.location || null,
      employmentType: body.employmentType || "full-time",
      locationType: body.locationType || "On-Site",
      salary: body.compensation?.salary || body.salary || null,
      managerId: body.managerId || null,
      status: body.status || employee.status,
      avatar: body.avatar || employee.avatar,
    };

    console.log("[Employee PUT] Updating employee data:", updateData);

    const [updatedEmployee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, employeeId))
      .returning();

    // Update bank info if provided
    if (body.bankInfo && body.bankInfo.bankName) {
      // Check if bank account exists
      const existingBank = await db.query.employeeBankAccounts.findFirst({
        where: eq(employeeBankAccounts.employeeId, employeeId),
      });

      if (existingBank) {
        await db
          .update(employeeBankAccounts)
          .set({
            bankName: body.bankInfo.bankName,
            routingNumber: body.bankInfo.routingNumber,
            accountNumberMasked: body.bankInfo.accountNumberMasked,
          })
          .where(eq(employeeBankAccounts.employeeId, employeeId));
      } else {
        await db.insert(employeeBankAccounts).values({
          employeeId: employeeId,
          bankName: body.bankInfo.bankName,
          routingNumber: body.bankInfo.routingNumber,
          accountNumberMasked: body.bankInfo.accountNumberMasked,
          isPrimary: true,
        });
      }
    }

    console.log("[Employee PUT] Successfully updated employee and related data:", updatedEmployee);

    return NextResponse.json(updatedEmployee);

  } catch (error: any) {
    console.error("[Employee PUT Error]", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
