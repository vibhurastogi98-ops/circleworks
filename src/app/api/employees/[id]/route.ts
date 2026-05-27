import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases, users, w4Forms } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { recordCompanyRealtimeEvent } from "@/lib/realtime-event-log";
import { invalidateEmployeeCaches } from "@/lib/redis-cache";
import { applyEmployeeFieldVisibility } from "@/lib/fieldVisibility";

async function ensureW4CompletionColumns() {
  await db.execute(sql`
    ALTER TABLE w4_forms
      ADD COLUMN IF NOT EXISTS ssn_encrypted text,
      ADD COLUMN IF NOT EXISTS signature text,
      ADD COLUMN IF NOT EXISTS signed_at timestamp,
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS document_id integer
  `);
}

function normalizeBankVerificationStatus(value: unknown) {
  const status = String(value || "").toLowerCase();
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}

function getBankVerificationSummary(bankAccounts?: Array<{ isPrimary?: boolean | null; verificationStatus?: string | null; updatedAt?: Date | null; createdAt?: Date | null }>) {
  if (!bankAccounts?.length) {
    return { verificationStatus: "Unverified", verified: false };
  }

  const primary = [...bankAccounts].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    const aDate = a.updatedAt || a.createdAt || new Date(0);
    const bDate = b.updatedAt || b.createdAt || new Date(0);
    return bDate.getTime() - aDate.getTime();
  })[0];
  const verificationStatus = normalizeBankVerificationStatus(primary.verificationStatus);

  return {
    verificationStatus,
    verified: verificationStatus === "Verified",
  };
}

function getW4CompletionSummary(w4Form?: typeof w4Forms.$inferSelect | null) {
  if (!w4Form) {
    return { status: "Not Started", completed: false };
  }

  const completed = (w4Form.status || "").toLowerCase() === "completed" || Boolean(w4Form.signedAt);

  return {
    status: completed ? "Completed" : w4Form.status || "Pending",
    completed,
    signedAt: w4Form.signedAt ? w4Form.signedAt.toISOString().split("T")[0] : null,
    documentId: w4Form.documentId,
  };
}

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

    await ensureW4CompletionColumns();

    const [employee, w4Form] = await Promise.all([
      db.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        with: {
          manager: true,
          subordinates: true,
          ptoRequests: true,
          timesheets: true,
          documents: true,
          bankAccounts: true,
          onboardingCases: true,
          assetAssignments: {
            with: {
              asset: true,
            },
          },
        },
      }),
      db.query.w4Forms.findFirst({
        where: eq(w4Forms.employeeId, employeeId),
      }),
    ]);

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employeeWithSensitiveRelations = employee as typeof employee & {
      bankAccounts?: Array<{
        isPrimary?: boolean | null;
        verificationStatus?: string | null;
        updatedAt?: Date | null;
        createdAt?: Date | null;
      }>;
    };

    const isSelf = requesterEmployeeId === employeeId;
    const isManager = requesterEmployeeId === employee.managerId;
    const sanitized = applyEmployeeFieldVisibility(employee, {
      requesterRole,
      isSelf,
      isManager,
    });
    const bankAccount = getBankVerificationSummary(employeeWithSensitiveRelations.bankAccounts);

    delete (sanitized as Record<string, unknown>).bankAccounts;

    return NextResponse.json({
      ...sanitized,
      bankAccount,
      w4Status: getW4CompletionSummary(w4Form),
    });
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
