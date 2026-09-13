import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases } from "@/db/schema";

/**
 * Shared employee-creation path. Called from both `/api/employees` POST and
 * the CSV importer at `/api/import/employees/commit`. Keeps the insert logic
 * in one place so a fix on one path automatically applies to the other.
 *
 * Caller is responsible for authenticating and resolving companyId.
 */

export type CreateEmployeeInput = {
  companyId: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  locationType?: string | null;
  startDate?: string | null;
  salary?: number | null;
  employmentType?: string | null;
  payType?: string | null;
  managerId?: number | null;
  avatar?: string | null;
  bankInfo?: {
    bankName?: string | null;
    routingNumber?: string | null;
    accountNumberMasked?: string | null;
  } | null;
  createOnboardingCase?: boolean;
};

export type CreateEmployeeResult = {
  employee: typeof employees.$inferSelect;
};

export async function createEmployeeForCompany(input: CreateEmployeeInput): Promise<CreateEmployeeResult> {
  if (!input.firstName || !input.email) {
    throw new Error("first_name_and_email_required");
  }
  if (!Number.isInteger(input.companyId) || input.companyId <= 0) {
    throw new Error("invalid_company_id");
  }

  const employeeData = {
    firstName: input.firstName,
    lastName: input.lastName ?? null,
    email: input.email,
    companyId: input.companyId,
    jobTitle: input.jobTitle ?? null,
    department: input.department && input.department.trim() ? input.department : null,
    departmentId: null,
    location: input.location ?? null,
    locationId: null,
    locationType: input.locationType || "On-Site",
    avatar: input.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(input.firstName)}&backgroundColor=transparent`,
    startDate: input.startDate || null,
    status: "onboarding",
    salary: input.salary ?? null,
    employmentType: input.employmentType || "full-time",
    payType: input.payType || "salary",
    managerId: input.managerId ?? null,
  };

  const [newEmployee] = await db.insert(employees).values(employeeData).returning();

  // Bank rows require all three fields to be present (schema NOT NULL). Skip
  // if the caller didn't provide a complete bank record.
  if (input.bankInfo?.bankName && input.bankInfo.routingNumber && input.bankInfo.accountNumberMasked) {
    await db.insert(employeeBankAccounts).values({
      employeeId: newEmployee.id,
      bankName: input.bankInfo.bankName,
      routingNumber: input.bankInfo.routingNumber,
      accountNumberMasked: input.bankInfo.accountNumberMasked,
      isPrimary: true,
    });
  }

  if (input.createOnboardingCase !== false) {
    await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      status: "Active",
      startDate: input.startDate || null,
    });
  }

  return { employee: newEmployee };
}

/**
 * Case-insensitive "is this email already an employee of this company?" check.
 * Used by both the invite flow and the CSV importer to skip duplicates.
 */
export async function isEmailInCompany(email: string, companyId: number): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(eq(employees.companyId, companyId), eq(employees.email, normalized)))
    .limit(1);
  return rows.length > 0;
}
