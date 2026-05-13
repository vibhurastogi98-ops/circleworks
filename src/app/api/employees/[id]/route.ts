import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { recordCompanyRealtimeEvent } from "@/lib/realtime-event-log";
import { invalidateEmployeeCaches } from "@/lib/redis-cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    let requesterRole = 'employee';
    let requesterEmployeeId: number | null = null;

    const requesterUser = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      with: { employees: true },
    });
    if (requesterUser) {
      requesterRole = requesterUser.role || 'employee';
      requesterEmployeeId = requesterUser.employees?.[0]?.id ?? null;
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
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const [requesterEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (!requesterEmployee || employee.companyId !== requesterEmployee.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await req.json();
    console.log("[Employee PUT] Request body:", body);

    const [requesterEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (!requesterEmployee || employee.companyId !== requesterEmployee.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (employee.companyId != null) {
      recordCompanyRealtimeEvent(employee.companyId, "employee.updated", {
        employeeId: String(employeeId),
        timestamp: new Date().toISOString(),
      });
      void invalidateEmployeeCaches(employee.companyId, employeeId);
    }

    return NextResponse.json(updatedEmployee);

  } catch (error: any) {
    console.error("[Employee PUT Error]", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
