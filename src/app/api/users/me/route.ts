import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users, employeeBankAccounts, payrollItems, payrolls, companies } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";

let bankAccountColumnsPromise: Promise<void> | null = null;
let userTourColumnPromise: Promise<void> | null = null;
let companyCreatorColumnsPromise: Promise<void> | null = null;

function ensureBankAccountColumns() {
  if (!bankAccountColumnsPromise) {
    bankAccountColumnsPromise = db.execute(sql`
    ALTER TABLE employee_bank_accounts
      ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'checking',
      ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS bank_logo_url text,
      ADD COLUMN IF NOT EXISTS plaid_account_id text,
      ADD COLUMN IF NOT EXISTS plaid_processor_token text,
      ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()
    `).then(() => undefined).catch((error) => {
      bankAccountColumnsPromise = null;
      throw error;
    });
  }

  return bankAccountColumnsPromise;
}

function ensureUserTourColumn() {
  if (!userTourColumnPromise) {
    userTourColumnPromise = db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS has_completed_tour boolean DEFAULT false
    `).then(() => undefined).catch((error) => {
      userTourColumnPromise = null;
      throw error;
    });
  }

  return userTourColumnPromise;
}

function ensureCompanyCreatorColumns() {
  if (!companyCreatorColumnsPromise) {
    companyCreatorColumnsPromise = db.execute(sql`
    ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'company' NOT NULL,
      ADD COLUMN IF NOT EXISTS creator_entity_type text,
      ADD COLUMN IF NOT EXISTS pay_self_as_owner boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS contractor_count integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS logo_url text
    `).then(() => undefined).catch((error) => {
      companyCreatorColumnsPromise = null;
      throw error;
    });
  }

  return companyCreatorColumnsPromise;
}

async function ensureSchemaColumn(label: string, ensure: () => Promise<void>) {
  try {
    await ensure();
  } catch (error) {
    console.warn(`[Users ME schema ensure skipped] ${label}`, error);
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const maybeError = error as { cause?: unknown; code?: unknown };
  if (typeof maybeError.code === "string") return maybeError.code;
  return getErrorCode(maybeError.cause);
}

async function loadCurrentUserEmployee(userId: number) {
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
      hasCompletedTour: users.hasCompletedTour,
      companyId: companies.id,
      companyName: companies.name,
      companyAccountType: companies.accountType,
      creatorEntityType: companies.creatorEntityType,
      paySelfAsOwner: companies.paySelfAsOwner,
      contractorCount: companies.contractorCount,
      logoUrl: companies.logoUrl,
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .leftJoin(companies, eq(employees.companyId, companies.id))
    .where(eq(users.id, userId));

  return employee;
}

async function loadBankAccount(employeeId: number) {
  const [bankAccount] = await db
    .select({
      bankName: employeeBankAccounts.bankName,
      routingNumber: employeeBankAccounts.routingNumber,
      accountNumberMasked: employeeBankAccounts.accountNumberMasked,
      accountType: employeeBankAccounts.accountType,
      verificationStatus: employeeBankAccounts.verificationStatus,
      bankLogoUrl: employeeBankAccounts.bankLogoUrl,
      createdAt: employeeBankAccounts.createdAt,
      updatedAt: employeeBankAccounts.updatedAt,
    })
    .from(employeeBankAccounts)
    .where(eq(employeeBankAccounts.employeeId, employeeId))
    .orderBy(desc(employeeBankAccounts.isPrimary), desc(employeeBankAccounts.updatedAt), desc(employeeBankAccounts.createdAt))
    .limit(1);

  return bankAccount;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await loadCurrentUserEmployee(session.userId).catch(async (error: unknown) => {
      if (getErrorCode(error) !== "42703") throw error;
      await ensureSchemaColumn("users.has_completed_tour", ensureUserTourColumn);
      await ensureSchemaColumn("companies.creator_fields", ensureCompanyCreatorColumns);
      return loadCurrentUserEmployee(session.userId);
    });

    const currentUserEmployee = employee;

    if (!currentUserEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const bankAccount = await loadBankAccount(currentUserEmployee.id).catch(async (error: unknown) => {
      if (getErrorCode(error) !== "42703") throw error;
      await ensureSchemaColumn("employee_bank_accounts.profile_fields", ensureBankAccountColumns);
      return loadBankAccount(currentUserEmployee.id);
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
      user: {
        id: session.userId.toString(),
        email: session.email,
        role: session.role || "employee",
        accountType: currentUserEmployee.companyAccountType || "company",
        permissions: {
          assignAssets: hasPermission(session.role, "assign_assets"),
          manageAssets: hasPermission(session.role, "manage_assets"),
          returnAssets: hasPermission(session.role, "return_assets"),
          viewTaxFilings: hasPermission(session.role, "view_tax_filings"),
          submitTaxFilings: hasPermission(session.role, "submit_tax_filings"),
        },
      },
      company: {
        id: currentUserEmployee.companyId?.toString() ?? "",
        name: currentUserEmployee.companyName || "Workspace",
        accountType: currentUserEmployee.companyAccountType || "company",
        creatorEntityType: currentUserEmployee.creatorEntityType || null,
        paySelfAsOwner: Boolean(currentUserEmployee.paySelfAsOwner),
        contractorCount: currentUserEmployee.contractorCount ?? 0,
        logoUrl: currentUserEmployee.logoUrl || null,
      },
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
        hasCompletedTour: currentUserEmployee.hasCompletedTour ?? false,
        bankAccount: bankAccount
          ? {
              bankName: bankAccount.bankName,
              bankLogoUrl: bankAccount.bankLogoUrl,
              routingNumber: bankAccount.routingNumber,
              accountNumber: bankAccount.accountNumberMasked,
              mask: bankAccount.accountNumberMasked.replace(/\D/g, "").slice(-4),
              accountType: bankAccount.accountType || "checking",
              verificationStatus: bankAccount.verificationStatus || "Pending",
              verified: (bankAccount.verificationStatus || "").toLowerCase() === "verified",
              lastUpdated: (bankAccount.updatedAt || bankAccount.createdAt || new Date()).toISOString().split("T")[0],
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (typeof body.hasCompletedTour === "boolean") {
      await ensureUserTourColumn();
      await db
        .update(users)
        .set({ hasCompletedTour: body.hasCompletedTour })
        .where(eq(users.id, session.userId));
    }

    if (typeof body.companyName === "string") {
      try {
        const [existingEmployee] = await db
          .select({ id: employees.id })
          .from(employees)
          .leftJoin(users, eq(employees.userId, users.id))
          .where(eq(users.id, session.userId));

        if (!existingEmployee) {
          const [newCompany] = await db.insert(companies).values({
            name: body.companyName,
          }).returning();

          await db.insert(employees).values({
            userId: session.userId,
            companyId: newCompany.id,
            firstName: session.email.split("@")[0],
            email: session.email,
            jobTitle: "Administrator",
            status: "active",
          });
          console.log("[DB Sync] Created company and employee for:", session.email);
        }
      } catch (dbErr) {
        console.error("[DB Sync] Failed to create postgres records:", dbErr);
      }
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(body) });
  } catch (error: any) {
    console.error("[USERS_ME_PATCH]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
