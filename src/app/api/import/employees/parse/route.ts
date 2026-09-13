import { NextResponse, type NextRequest } from "next/server";

import { getSession, resolveUserContext } from "@/lib/session";
import { parseCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — plenty for tens of thousands of rows
const MAX_ROWS = 5000;

/**
 * Field names on the employees table that the importer knows how to fill.
 * If we ever add a new column, add it here to make it mappable in the wizard.
 */
export const IMPORTABLE_EMPLOYEE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "jobTitle",
  "department",
  "location",
  "locationType",
  "startDate",
  "salary",
  "employmentType",
  "managerId",
] as const;

const REQUIRED = new Set(["firstName", "email"]);

/**
 * Suggest a header→field mapping using a loose match. Case-insensitive,
 * strips underscores/spaces, matches common aliases.
 */
function suggestMapping(headers: string[]): Record<string, string | null> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string> = {
    firstname: "firstName",
    first: "firstName",
    givenname: "firstName",
    lastname: "lastName",
    last: "lastName",
    surname: "lastName",
    familyname: "lastName",
    email: "email",
    emailaddress: "email",
    workemail: "email",
    corporateemail: "email",
    jobtitle: "jobTitle",
    title: "jobTitle",
    role: "jobTitle",
    position: "jobTitle",
    department: "department",
    dept: "department",
    team: "department",
    location: "location",
    office: "location",
    site: "location",
    locationtype: "locationType",
    workarrangement: "locationType",
    startdate: "startDate",
    hiredate: "startDate",
    start: "startDate",
    salary: "salary",
    annualsalary: "salary",
    compensation: "salary",
    employmenttype: "employmentType",
    empltype: "employmentType",
    managerid: "managerId",
    manager: "managerId",
  };

  const mapping: Record<string, string | null> = {};
  for (const h of headers) {
    const key = norm(h);
    mapping[h] = aliases[key] ?? null;
  }
  return mapping;
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart_required" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 });

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return NextResponse.json({ error: "empty_file" }, { status: 400 });

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim().length > 0));

  if (dataRows.length === 0) return NextResponse.json({ error: "no_data_rows" }, { status: 400 });
  if (dataRows.length > MAX_ROWS) {
    return NextResponse.json({ error: "too_many_rows", maxRows: MAX_ROWS, actual: dataRows.length }, { status: 413 });
  }

  return NextResponse.json({
    headers,
    rows: dataRows,
    suggestedMapping: suggestMapping(headers),
    availableFields: IMPORTABLE_EMPLOYEE_FIELDS,
    requiredFields: [...REQUIRED],
    rowCount: dataRows.length,
  });
}
