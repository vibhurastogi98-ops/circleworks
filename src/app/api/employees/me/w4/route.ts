import { NextResponse } from "next/server";
import { createCipheriv, createHash, randomBytes } from "crypto";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { employeeDocuments, users, w4Forms } from "@/db/schema";
import { getSession } from "@/lib/session";

type W4Payload = {
  firstName?: string;
  lastName?: string;
  ssn?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  filingStatus?: string;
  hasMultipleJobs?: boolean | null;
  jobOption?: "estimator" | "worksheet" | "checkbox" | null;
  children?: number;
  otherDependents?: number;
  otherIncome?: number;
  deductions?: number;
  extraWithholding?: number;
  signature?: string;
  date?: string;
};

const requiredFields: Array<keyof W4Payload> = [
  "firstName",
  "lastName",
  "ssn",
  "address",
  "city",
  "state",
  "zip",
  "filingStatus",
  "signature",
  "date",
];

function toInt(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function encryptSsn(ssn: string) {
  const secret =
    process.env.W4_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "circleworks-dev-secret-change-in-production";
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(ssn, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function escapePdfText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSignedW4Pdf(data: W4Payload, encryptedSsn: string) {
  const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
  const location =
    `${data.city || ""}, ${data.state || ""} ${data.zip || ""}`.trim();
  const dependentsTotal =
    toInt(data.children) * 2000 + toInt(data.otherDependents) * 500;
  const lines = [
    `CircleWorks Signed W-4 - ${new Date().getFullYear()}`,
    `Employee: ${name}`,
    `Address: ${data.address || ""}`,
    `City/State/ZIP: ${location}`,
    `SSN: encrypted (${encryptedSsn.slice(0, 12)}...)`,
    `Filing status: ${data.filingStatus || ""}`,
    `Multiple jobs/spouse works: ${data.hasMultipleJobs ? "Yes" : "No"}`,
    `Step 2 option: ${data.jobOption || "None"}`,
    `Dependents credit: $${dependentsTotal}`,
    `Other income: $${toInt(data.otherIncome)}`,
    `Deductions: $${toInt(data.deductions)}`,
    `Extra withholding: $${toInt(data.extraWithholding)}`,
    `Electronic signature: ${data.signature || ""}`,
    `Signed date: ${data.date || ""}`,
  ];

  const textCommands = lines
    .map(
      (line, index) =>
        `${index === 0 ? "0 0 Td" : "0 -22 Td"} (${escapePdfText(line)}) Tj`,
    )
    .join("\n");
  const stream = `BT\n/F1 12 Tf\n72 760 Td\n${textCommands}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return `data:application/pdf;base64,${Buffer.from(pdf).toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await req.json()) as W4Payload;
    const missing = requiredFields.filter(
      (field) => !String(data[field] || "").trim(),
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required W-4 fields" },
        { status: 400 },
      );
    }

    if (data.hasMultipleJobs === null || data.hasMultipleJobs === undefined) {
      return NextResponse.json(
        { error: "Multiple jobs answer is required" },
        { status: 400 },
      );
    }

    if (data.hasMultipleJobs && !data.jobOption) {
      return NextResponse.json(
        { error: "Step 2 withholding option is required" },
        { status: 400 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      with: { employees: true },
    });

    if (!user || !user.employees || user.employees.length === 0) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const employee = user.employees[0];
    const encryptedSsn = encryptSsn(data.ssn || "");
    const claimDependents =
      toInt(data.children) * 2000 + toInt(data.otherDependents) * 500;
    const formValues = {
      employeeId: employee.id,
      filingStatus: data.filingStatus || "",
      multipleJobs: Boolean(data.hasMultipleJobs),
      claimDependents,
      otherIncome: toInt(data.otherIncome),
      deductions: toInt(data.deductions),
      extraWithholding: toInt(data.extraWithholding),
      exempt: false,
      updatedAt: new Date(),
    };

    const existingForm = await db.query.w4Forms.findFirst({
      where: eq(w4Forms.employeeId, employee.id),
    });

    if (existingForm) {
      await db
        .update(w4Forms)
        .set(formValues)
        .where(eq(w4Forms.employeeId, employee.id));
    } else {
      await db.insert(w4Forms).values(formValues);
    }

    const taxYear = new Date().getFullYear();
    const [document] = await db
      .insert(employeeDocuments)
      .values({
        employeeId: employee.id,
        name: `Signed W-4 Form - ${taxYear}`,
        type: "Tax Form",
        fileUrl: createSignedW4Pdf(data, encryptedSsn),
        status: "Signed",
      })
      .returning({ id: employeeDocuments.id });

    return NextResponse.json({
      success: true,
      status: "Signed",
      documentId: document?.id,
    });
  } catch (error) {
    console.error("Error submitting W-4:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
