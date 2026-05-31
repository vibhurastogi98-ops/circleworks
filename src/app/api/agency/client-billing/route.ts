import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  agencyClientAssignments,
  agencyClients,
  agencyProjects,
  contractors,
  employees,
} from "@/db/schema";
import {
  getAgencyClientBillingSeedData,
  type AgencyClient,
  type AgencyClientBillingData,
  type AgencyProject,
  type AgencyWorker,
  type AgencyWorkerAssignment,
  type AssignAgencyWorkerInput,
  type CreateAgencyClientInput,
  type CreateAgencyProjectInput,
} from "@/lib/agency-client-billing-data";

let assignmentTablePromise: Promise<void> | null = null;

function ensureAgencyClientAssignmentsTable() {
  if (!assignmentTablePromise) {
    assignmentTablePromise = db
      .execute(sql`
        CREATE TABLE IF NOT EXISTS "agency_client_assignments" (
          "id" serial PRIMARY KEY NOT NULL,
          "company_id" integer REFERENCES "companies"("id") ON DELETE cascade,
          "client_id" integer NOT NULL REFERENCES "agency_clients"("id") ON DELETE cascade,
          "project_id" integer NOT NULL REFERENCES "agency_projects"("id") ON DELETE cascade,
          "employee_id" integer REFERENCES "employees"("id") ON DELETE set null,
          "contractor_id" integer REFERENCES "contractors"("id") ON DELETE set null,
          "worker_type" text NOT NULL DEFAULT 'Employee',
          "worker_name" text NOT NULL,
          "worker_email" text,
          "role" text,
          "pay_rate" real NOT NULL DEFAULT 0,
          "bill_rate" real NOT NULL DEFAULT 0,
          "hours_per_month" real NOT NULL DEFAULT 0,
          "status" text NOT NULL DEFAULT 'Active',
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        )
      `)
      .then(() => db.execute(sql`
        CREATE INDEX IF NOT EXISTS "agency_client_assignments_client_idx"
          ON "agency_client_assignments" ("client_id")
      `))
      .then(() => db.execute(sql`
        CREATE INDEX IF NOT EXISTS "agency_client_assignments_project_idx"
          ON "agency_client_assignments" ("project_id")
      `))
      .then(() => undefined)
      .catch((error) => {
        assignmentTablePromise = null;
        throw error;
      });
  }

  return assignmentTablePromise;
}

function parseDatabaseId(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapClient(row: typeof agencyClients.$inferSelect): AgencyClient {
  return {
    id: String(row.id),
    name: row.name,
    billingContact: row.contactName ?? "",
    email: row.email ?? "",
    industry: "Agency client",
    status: "Active",
    paymentTerms: row.paymentTerms ?? "Net 30",
    createdAt: row.createdAt?.toISOString().slice(0, 10) ?? "",
  };
}

function mapProject(row: typeof agencyProjects.$inferSelect): AgencyProject {
  return {
    id: String(row.id),
    clientId: String(row.clientId),
    name: row.name,
    code: row.description || `PRJ-${row.id}`,
    status: row.status === "Paused" || row.status === "Complete" ? row.status : "Active",
    budget: row.budget ?? 0,
  };
}

function mapAssignment(row: typeof agencyClientAssignments.$inferSelect): AgencyWorkerAssignment {
  const workerId = row.employeeId
    ? `employee-${row.employeeId}`
    : row.contractorId
      ? `contractor-${row.contractorId}`
      : `assignment-worker-${row.id}`;

  return {
    id: String(row.id),
    clientId: String(row.clientId),
    projectId: String(row.projectId),
    workerId,
    workerName: row.workerName,
    workerType: row.workerType === "Contractor" ? "Contractor" : "Employee",
    role: row.role ?? "Assigned worker",
    payRate: row.payRate ?? 0,
    billRate: row.billRate ?? 0,
    hoursPerMonth: row.hoursPerMonth ?? 0,
    status: row.status === "Paused" ? "Paused" : "Active",
  };
}

function mapEmployeeWorker(row: typeof employees.$inferSelect): AgencyWorker {
  const name = `${row.firstName} ${row.lastName ?? ""}`.trim();
  return {
    id: `employee-${row.id}`,
    name,
    email: row.email ?? "",
    type: "Employee",
    title: row.jobTitle || "Employee",
    defaultPayRate: 65,
    defaultBillRate: 105,
  };
}

function mapContractorWorker(row: typeof contractors.$inferSelect): AgencyWorker {
  return {
    id: `contractor-${row.id}`,
    name: row.name,
    email: row.email,
    type: "Contractor",
    title: row.businessName || "Contractor",
    defaultPayRate: 80,
    defaultBillRate: 125,
  };
}

async function seedDemoDataIfEmpty() {
  const existingClients = await db.select({ id: agencyClients.id }).from(agencyClients).limit(1);
  if (existingClients.length > 0) return;

  const seed = getAgencyClientBillingSeedData();
  const insertedClients = await db
    .insert(agencyClients)
    .values(
      seed.clients.map((client) => ({
        name: client.name,
        email: client.email,
        contactName: client.billingContact,
        billingRateType: "cost-plus",
        markupPercentage: 0,
        billingCycle: "monthly",
        paymentTerms: client.paymentTerms,
        accountingSync: "None",
      })),
    )
    .returning();

  const clientIdBySeedId = new Map(
    seed.clients.map((client, index) => [client.id, insertedClients[index]?.id]).filter((entry): entry is [string, number] => Boolean(entry[1])),
  );

  const insertedProjects = await db
    .insert(agencyProjects)
    .values(
      seed.projects
        .map((project) => {
          const clientId = clientIdBySeedId.get(project.clientId);
          if (!clientId) return null;
          return {
            clientId,
            name: project.name,
            description: project.code,
            budget: project.budget,
            status: project.status,
          };
        })
        .filter((project): project is NonNullable<typeof project> => Boolean(project)),
    )
    .returning();

  const projectIdBySeedId = new Map(
    seed.projects.map((project, index) => [project.id, insertedProjects[index]?.id]).filter((entry): entry is [string, number] => Boolean(entry[1])),
  );

  const assignmentRows = seed.assignments
    .map((assignment) => {
      const clientId = clientIdBySeedId.get(assignment.clientId);
      const projectId = projectIdBySeedId.get(assignment.projectId);
      if (!clientId || !projectId) return null;
      return {
        clientId,
        projectId,
        workerType: assignment.workerType,
        workerName: assignment.workerName,
        role: assignment.role,
        payRate: assignment.payRate,
        billRate: assignment.billRate,
        hoursPerMonth: assignment.hoursPerMonth,
        status: assignment.status,
      };
    })
    .filter((assignment): assignment is NonNullable<typeof assignment> => Boolean(assignment));

  if (assignmentRows.length) {
    await db.insert(agencyClientAssignments).values(assignmentRows);
  }
}

async function loadAgencyClientBillingData(): Promise<AgencyClientBillingData> {
  await ensureAgencyClientAssignmentsTable();
  await seedDemoDataIfEmpty();

  const [clientRows, projectRows, assignmentRows, employeeRows, contractorRows] = await Promise.all([
    db.select().from(agencyClients).orderBy(asc(agencyClients.name)),
    db.select().from(agencyProjects).orderBy(asc(agencyProjects.name)),
    db.select().from(agencyClientAssignments).orderBy(asc(agencyClientAssignments.workerName)),
    db.select().from(employees).orderBy(asc(employees.firstName)).limit(25),
    db.select().from(contractors).orderBy(asc(contractors.name)).limit(25),
  ]);

  const seedWorkers = getAgencyClientBillingSeedData().workers;
  const workers = [...employeeRows.map(mapEmployeeWorker), ...contractorRows.map(mapContractorWorker)];

  return {
    clients: clientRows.map(mapClient),
    projects: projectRows.map(mapProject),
    workers: workers.length ? workers : seedWorkers,
    assignments: assignmentRows.map(mapAssignment),
  };
}

async function createClient(input: CreateAgencyClientInput) {
  if (!input.name?.trim()) {
    return NextResponse.json({ success: false, error: "Client name is required" }, { status: 400 });
  }

  const [clientRow] = await db
    .insert(agencyClients)
    .values({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      contactName: input.billingContact?.trim() || null,
      billingRateType: "cost-plus",
      markupPercentage: 0,
      billingCycle: "monthly",
      paymentTerms: input.paymentTerms || "Net 30",
      accountingSync: "None",
    })
    .returning();

  const projectName = input.firstProjectName?.trim() || "General delivery";
  const [projectRow] = await db
    .insert(agencyProjects)
    .values({
      clientId: clientRow.id,
      name: projectName,
      description: `${input.name.trim().slice(0, 3).toUpperCase()}-001`,
      status: "Active",
      budget: 0,
    })
    .returning();

  return NextResponse.json({
    success: true,
    data: {
      client: mapClient(clientRow),
      project: mapProject(projectRow),
    },
  });
}

async function createProject(input: CreateAgencyProjectInput) {
  const clientId = parseDatabaseId(input.clientId);
  if (!clientId || !input.name?.trim()) {
    return NextResponse.json({ success: false, error: "Client and project name are required" }, { status: 400 });
  }

  const [projectRow] = await db
    .insert(agencyProjects)
    .values({
      clientId,
      name: input.name.trim(),
      description: input.code?.trim() || `${input.name.trim().slice(0, 3).toUpperCase()}-001`,
      status: "Active",
      budget: Math.max(0, Number(input.budget) || 0),
    })
    .returning();

  return NextResponse.json({ success: true, data: mapProject(projectRow) });
}

async function resolveWorker(workerId: string): Promise<{
  employeeId: number | null;
  contractorId: number | null;
  worker: AgencyWorker;
} | null> {
  if (workerId.startsWith("employee-")) {
    const employeeId = parseDatabaseId(workerId.replace("employee-", ""));
    if (!employeeId) return null;
    const [row] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!row) return null;
    return { employeeId, contractorId: null, worker: mapEmployeeWorker(row) };
  }

  if (workerId.startsWith("contractor-")) {
    const contractorId = parseDatabaseId(workerId.replace("contractor-", ""));
    if (!contractorId) return null;
    const [row] = await db.select().from(contractors).where(eq(contractors.id, contractorId)).limit(1);
    if (!row) return null;
    return { employeeId: null, contractorId, worker: mapContractorWorker(row) };
  }

  const seedWorker = getAgencyClientBillingSeedData().workers.find((worker) => worker.id === workerId);
  if (!seedWorker) return null;
  return { employeeId: null, contractorId: null, worker: seedWorker };
}

async function assignWorker(input: AssignAgencyWorkerInput) {
  const clientId = parseDatabaseId(input.clientId);
  const projectId = parseDatabaseId(input.projectId);
  const resolvedWorker = await resolveWorker(input.workerId);

  if (!clientId || !projectId || !resolvedWorker) {
    return NextResponse.json(
      { success: false, error: "Client, project, and worker are required" },
      { status: 400 },
    );
  }

  const [assignmentRow] = await db
    .insert(agencyClientAssignments)
    .values({
      clientId,
      projectId,
      employeeId: resolvedWorker.employeeId,
      contractorId: resolvedWorker.contractorId,
      workerType: resolvedWorker.worker.type,
      workerName: resolvedWorker.worker.name,
      workerEmail: resolvedWorker.worker.email,
      role: input.role?.trim() || resolvedWorker.worker.title,
      payRate: Math.max(0, Number(input.payRate) || 0),
      billRate: Math.max(0, Number(input.billRate) || 0),
      hoursPerMonth: Math.max(0, Number(input.hoursPerMonth) || 0),
      status: "Active",
    })
    .returning();

  return NextResponse.json({ success: true, data: mapAssignment(assignmentRow) });
}

export async function GET() {
  try {
    const data = await loadAgencyClientBillingData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading agency client billing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load client billing data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureAgencyClientAssignmentsTable();
    const body = (await request.json()) as {
      action?: string;
      input?: CreateAgencyClientInput | CreateAgencyProjectInput | AssignAgencyWorkerInput;
    };

    if (body.action === "create_client") {
      return createClient(body.input as CreateAgencyClientInput);
    }
    if (body.action === "create_project") {
      return createProject(body.input as CreateAgencyProjectInput);
    }
    if (body.action === "assign_worker") {
      return assignWorker(body.input as AssignAgencyWorkerInput);
    }

    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Error mutating agency client billing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client billing data" },
      { status: 500 },
    );
  }
}
