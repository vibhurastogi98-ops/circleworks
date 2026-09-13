import { NextResponse, type NextRequest } from "next/server";

import { getSession, resolveUserContext } from "@/lib/session";
import { createEmployeeForCompany, isEmailInCompany } from "@/lib/employees-create";

export const dynamic = "force-dynamic";

type Mapping = Record<string, string | null>; // header → employee field or null

type CommitBody = {
  headers?: unknown;
  rows?: unknown;
  mapping?: unknown;
  dryRun?: unknown;
};

type RowError = { rowIndex: number; field: string; message: string };
type RowResult =
  | { rowIndex: number; status: "inserted"; employeeId: number }
  | { rowIndex: number; status: "skipped"; reason: string }
  | { rowIndex: number; status: "error"; errors: RowError[] };

function pick(row: string[], headers: string[], mapping: Mapping, field: string): string {
  for (let i = 0; i < headers.length; i += 1) {
    if (mapping[headers[i]] === field) {
      return (row[i] ?? "").trim();
    }
  }
  return "";
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as CommitBody;
  const headers = Array.isArray(body.headers) ? (body.headers as string[]) : null;
  const rows = Array.isArray(body.rows) ? (body.rows as string[][]) : null;
  const mapping = body.mapping && typeof body.mapping === "object" ? (body.mapping as Mapping) : null;
  const dryRun = Boolean(body.dryRun);

  if (!headers || !rows || !mapping) {
    return NextResponse.json({ error: "headers_rows_mapping_required" }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "no_rows" }, { status: 400 });
  }

  // Ensure required fields are mapped.
  const mappedFields = new Set(Object.values(mapping).filter((v): v is string => typeof v === "string" && v.length > 0));
  const missingRequired = ["firstName", "email"].filter((f) => !mappedFields.has(f));
  if (missingRequired.length > 0) {
    return NextResponse.json({ error: "required_fields_unmapped", missing: missingRequired }, { status: 400 });
  }

  // Pre-collect the emails that would be inserted so we can flag duplicates
  // within the same file, in addition to duplicates against the DB.
  const emailsInFile = new Map<string, number>(); // lowercased email → first rowIndex it appeared at
  const results: RowResult[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const raw = rows[rowIndex];
    const errs: RowError[] = [];

    const firstName = pick(raw, headers, mapping, "firstName");
    const lastName = pick(raw, headers, mapping, "lastName") || null;
    const emailRaw = pick(raw, headers, mapping, "email");
    const email = emailRaw.toLowerCase();

    if (!firstName) errs.push({ rowIndex, field: "firstName", message: "First name required" });
    if (!emailRaw) errs.push({ rowIndex, field: "email", message: "Email required" });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) errs.push({ rowIndex, field: "email", message: "Invalid email format" });

    // Salary must be a number if mapped
    let salary: number | null = null;
    const salaryRaw = pick(raw, headers, mapping, "salary");
    if (salaryRaw) {
      const n = Number(salaryRaw.replace(/[^0-9.\-]/g, ""));
      if (!Number.isFinite(n) || n < 0) {
        errs.push({ rowIndex, field: "salary", message: `Not a valid number: "${salaryRaw}"` });
      } else {
        salary = Math.round(n);
      }
    }

    // Start date must be YYYY-MM-DD if mapped and non-empty
    let startDate: string | null = null;
    const startRaw = pick(raw, headers, mapping, "startDate");
    if (startRaw) {
      const d = new Date(startRaw);
      if (Number.isNaN(d.getTime())) {
        errs.push({ rowIndex, field: "startDate", message: `Not a valid date: "${startRaw}"` });
      } else {
        startDate = d.toISOString().slice(0, 10);
      }
    }

    // Manager id: must be integer if mapped
    let managerId: number | null = null;
    const mgrRaw = pick(raw, headers, mapping, "managerId");
    if (mgrRaw) {
      const n = Number(mgrRaw);
      if (!Number.isInteger(n) || n <= 0) {
        errs.push({ rowIndex, field: "managerId", message: `Not a valid employee id: "${mgrRaw}"` });
      } else {
        managerId = n;
      }
    }

    // Duplicate checks — only if email is at least present + syntactically valid.
    if (errs.every((e) => e.field !== "email") && email) {
      const priorRowIndex = emailsInFile.get(email);
      if (priorRowIndex !== undefined) {
        results.push({ rowIndex, status: "skipped", reason: `Duplicate email of row ${priorRowIndex + 1} in this file` });
        continue;
      }
      if (await isEmailInCompany(email, ctx.companyId)) {
        results.push({ rowIndex, status: "skipped", reason: "Email already exists in this company" });
        continue;
      }
      emailsInFile.set(email, rowIndex);
    }

    if (errs.length > 0) {
      results.push({ rowIndex, status: "error", errors: errs });
      continue;
    }

    if (dryRun) {
      results.push({ rowIndex, status: "inserted", employeeId: 0 });
      continue;
    }

    try {
      const { employee } = await createEmployeeForCompany({
        companyId: ctx.companyId,
        firstName,
        lastName,
        email,
        jobTitle: pick(raw, headers, mapping, "jobTitle") || null,
        department: pick(raw, headers, mapping, "department") || null,
        location: pick(raw, headers, mapping, "location") || null,
        locationType: pick(raw, headers, mapping, "locationType") || null,
        startDate,
        salary,
        employmentType: pick(raw, headers, mapping, "employmentType") || null,
        managerId,
      });
      results.push({ rowIndex, status: "inserted", employeeId: employee.id });
    } catch (err) {
      results.push({
        rowIndex,
        status: "error",
        errors: [{ rowIndex, field: "_row", message: err instanceof Error ? err.message : String(err) }],
      });
    }
  }

  return NextResponse.json({
    dryRun,
    total: results.length,
    inserted: results.filter((r) => r.status === "inserted").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  });
}
