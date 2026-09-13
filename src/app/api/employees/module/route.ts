import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { employees as employeesTable } from "@/db/schema";
import {
  applyHrisAction,
  getHrisModuleData,
  type DirectoryData,
  type EmployeeRecord,
  type EmployeeStatus,
  type EmploymentType,
  type HrisModuleScreen,
  type PayType,
} from "@/lib/hris-module-data";
import { getSession, resolveUserContext } from "@/lib/session";

const screens = new Set<HrisModuleScreen>([
  "directory",
  "new",
  "profile",
  "compensation",
  "benefits",
  "time",
  "documents",
  "payroll",
  "performance",
  "activity",
  "bulk",
  "org-chart",
]);

function getScreen(request: NextRequest): HrisModuleScreen {
  const screen = request.nextUrl.searchParams.get("screen") as HrisModuleScreen | null;
  return screen && screens.has(screen) ? screen : "directory";
}

function mapEmploymentType(v: string | null): EmploymentType {
  const s = (v ?? "").toLowerCase();
  if (s === "part-time") return "Part-time";
  if (s === "contractor") return "Contractor";
  return "Full-time";
}

function mapPayType(v: string | null): PayType {
  return (v ?? "").toLowerCase() === "hourly" ? "Hourly" : "Salary";
}

function mapStatus(v: string | null): EmployeeStatus {
  const s = (v ?? "").toLowerCase();
  if (s === "onboarding" || s === "pre_boarding") return "Onboarding";
  if (s === "terminated") return "Terminated";
  if (s === "on_leave" || s === "on leave") return "On Leave";
  if (s === "inactive") return "Inactive";
  return "Active";
}

function mapLocationType(v: string | null): EmployeeRecord["locationType"] {
  const s = (v ?? "").toLowerCase();
  if (s === "remote") return "Remote";
  if (s === "hybrid") return "Hybrid";
  return "Office";
}

async function getDirectoryDataReal(companyId: number): Promise<DirectoryData> {
  const rows = await db
    .select({
      id: employeesTable.id,
      firstName: employeesTable.firstName,
      lastName: employeesTable.lastName,
      email: employeesTable.email,
      personalEmail: employeesTable.personalEmail,
      personalPhone: employeesTable.personalPhone,
      avatar: employeesTable.avatar,
      jobTitle: employeesTable.jobTitle,
      department: employeesTable.department,
      salary: employeesTable.salary,
      employmentType: employeesTable.employmentType,
      payType: employeesTable.payType,
      location: employeesTable.location,
      locationType: employeesTable.locationType,
      startDate: employeesTable.startDate,
      status: employeesTable.status,
      managerId: employeesTable.managerId,
    })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  // Build a manager-id → name lookup so the display "manager" field can carry
  // the manager's actual name rather than the numeric id.
  const managerNameById = new Map<number, string>();
  for (const r of rows) {
    managerNameById.set(r.id, `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || `Employee ${r.id}`);
  }

  const employees: EmployeeRecord[] = rows.map((r) => {
    const first = r.firstName ?? "";
    const last = r.lastName ?? "";
    return {
      id: String(r.id),
      firstName: first,
      lastName: last,
      preferredName: first,
      email: r.email ?? "",
      personalEmail: r.personalEmail ?? "",
      phone: r.personalPhone ?? "",
      dateOfBirth: "",
      address: { street: "", city: "", state: "", zip: "" },
      title: r.jobTitle ?? "",
      department: r.department ?? "",
      employmentType: mapEmploymentType(r.employmentType),
      status: mapStatus(r.status),
      payType: mapPayType(r.payType),
      location: r.location ?? "",
      locationType: mapLocationType(r.locationType),
      startDate: r.startDate ? String(r.startDate) : "",
      managerId: r.managerId ? String(r.managerId) : undefined,
      manager: r.managerId ? (managerNameById.get(r.managerId) ?? "") : "",
      avatarSeed: r.avatar ?? `${first} ${last}`.trim(),
      salary: r.salary ?? 0,
      paySchedule: "",
      directReports: [],
      ssnMasked: "",
      filingStatus: "",
      stateTaxId: "",
      bankAccount: "",
      birthday: "",
      workAnniversary: "",
    };
  });

  const active = employees.filter((e) => e.status === "Active" || e.status === "Onboarding").length;
  const inactive = employees.filter((e) => e.status === "Inactive" || e.status === "Terminated").length;

  return {
    employees,
    counts: { all: employees.length, active, inactive },
    filters: {
      departments: Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
      statuses: ["Active", "Inactive", "On Leave", "Onboarding", "Terminated"],
      payTypes: ["Salary", "Hourly"],
      locations: Array.from(new Set(employees.map((e) => e.location).filter(Boolean))),
      managers: Array.from(new Set(employees.map((e) => e.manager).filter(Boolean))),
    },
  };
}

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const employeeId = request.nextUrl.searchParams.get("employeeId") || undefined;

  // Directory reads the real employees table. Every other sub-screen
  // (profile/compensation/benefits/time/documents/payroll/performance/activity/
  // bulk/org-chart/new) still returns mock data — those pages are handled by
  // real endpoints elsewhere (/api/employees, /api/employees/[id], etc.).
  if (screen === "directory") {
    const session = await getSession(request);
    const ctx = session ? await resolveUserContext(session) : null;
    if (ctx?.companyId) {
      try {
        const data = await getDirectoryDataReal(ctx.companyId);
        return NextResponse.json({ screen, data });
      } catch (err) {
        // Real-data path failed — falling back to mock so the page still
        // renders. This is a monitoring signal, not user-visible: a spike in
        // these means real tenants are seeing the mock directory (Maya/
        // Avery/…) instead of their own employees.
        console.error(
          "[employees/module] directory real-data query failed; falling back to mock",
          { companyId: ctx.companyId, error: err instanceof Error ? err.message : String(err) },
        );
      }
    }
  }

  return NextResponse.json({
    screen,
    data: getHrisModuleData(screen, employeeId),
  });
}

export async function POST(request: NextRequest) {
  // applyHrisAction is intentionally kept as a UI ack: none of the actions
  // fired against this endpoint (compensation.request / i9.reverify /
  // document.upload / bulk.commit / bulk.rollback / etc.) are directory
  // mutations. Actual data-changing flows live on real endpoints:
  //   POST /api/employees          — invite create
  //   PATCH /api/employees/[id]    — profile / compensation edits
  //   POST /api/employees/[id]/terminate — termination cascade
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyHrisAction(body.action || "hris.action"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyHrisAction(body.action || "hris.update"));
}
