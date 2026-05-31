export type AgencyWorkerType = "Employee" | "Contractor";
export type AgencyClientStatus = "Active" | "Paused" | "Draft";
export type AgencyProjectStatus = "Active" | "Paused" | "Complete";
export type AgencyAssignmentStatus = "Active" | "Paused";

export type AgencyClient = {
  id: string;
  name: string;
  billingContact: string;
  email: string;
  industry: string;
  status: AgencyClientStatus;
  paymentTerms: string;
  createdAt: string;
};

export type AgencyProject = {
  id: string;
  clientId: string;
  name: string;
  code: string;
  status: AgencyProjectStatus;
  budget: number;
};

export type AgencyWorker = {
  id: string;
  name: string;
  email: string;
  type: AgencyWorkerType;
  title: string;
  defaultPayRate: number;
  defaultBillRate: number;
};

export type AgencyWorkerAssignment = {
  id: string;
  clientId: string;
  projectId: string;
  workerId: string;
  workerName: string;
  workerType: AgencyWorkerType;
  role: string;
  payRate: number;
  billRate: number;
  hoursPerMonth: number;
  status: AgencyAssignmentStatus;
};

export type AgencyClientBillingData = {
  clients: AgencyClient[];
  projects: AgencyProject[];
  workers: AgencyWorker[];
  assignments: AgencyWorkerAssignment[];
};

export type AgencyClientSummary = AgencyClient & {
  activeHeadcount: number;
  projectCount: number;
  monthlyPay: number;
  monthlyBill: number;
  monthlyMargin: number;
  marginRate: number;
};

export type CreateAgencyClientInput = {
  name: string;
  billingContact: string;
  email: string;
  industry: string;
  paymentTerms: string;
  firstProjectName: string;
};

export type CreateAgencyProjectInput = {
  clientId: string;
  name: string;
  code: string;
  budget: number;
};

export type AssignAgencyWorkerInput = {
  clientId: string;
  projectId: string;
  workerId: string;
  role: string;
  payRate: number;
  billRate: number;
  hoursPerMonth: number;
};

const initialClients: AgencyClient[] = [
  {
    id: "client-orbit",
    name: "Orbit & Co.",
    billingContact: "Mina Reyes",
    email: "finance@orbitco.example",
    industry: "Consumer brand",
    status: "Active",
    paymentTerms: "Net 30",
    createdAt: "2026-01-04",
  },
  {
    id: "client-bluebird",
    name: "Bluebird Social",
    billingContact: "Noah Stein",
    email: "ap@bluebird.example",
    industry: "Marketing",
    status: "Active",
    paymentTerms: "Net 15",
    createdAt: "2026-02-11",
  },
  {
    id: "client-vela",
    name: "Vela Skincare",
    billingContact: "Iris Shah",
    email: "payables@velaskin.example",
    industry: "Retail",
    status: "Paused",
    paymentTerms: "Net 30",
    createdAt: "2026-03-08",
  },
];

const initialProjects: AgencyProject[] = [
  {
    id: "project-orbit-launch",
    clientId: "client-orbit",
    name: "Summer launch pod",
    code: "ORB-SUM",
    status: "Active",
    budget: 128000,
  },
  {
    id: "project-orbit-retainer",
    clientId: "client-orbit",
    name: "Always-on creative",
    code: "ORB-AON",
    status: "Active",
    budget: 84000,
  },
  {
    id: "project-bluebird-media",
    clientId: "client-bluebird",
    name: "Paid media studio",
    code: "BLU-PMS",
    status: "Active",
    budget: 56000,
  },
  {
    id: "project-vela-migration",
    clientId: "client-vela",
    name: "Shopify migration",
    code: "VEL-SHP",
    status: "Paused",
    budget: 44000,
  },
];

const initialWorkers: AgencyWorker[] = [
  {
    id: "worker-camila",
    name: "Camila Stone",
    email: "camila@circleworks.example",
    type: "Employee",
    title: "Senior producer",
    defaultPayRate: 72,
    defaultBillRate: 118,
  },
  {
    id: "worker-mason",
    name: "Mason Lee",
    email: "mason@circleworks.example",
    type: "Employee",
    title: "Account strategist",
    defaultPayRate: 64,
    defaultBillRate: 105,
  },
  {
    id: "worker-ari",
    name: "Ari Kim",
    email: "ari@motionstack.io",
    type: "Contractor",
    title: "Motion designer",
    defaultPayRate: 86,
    defaultBillRate: 132,
  },
  {
    id: "worker-jules",
    name: "Jules Nguyen",
    email: "jules@julescopy.com",
    type: "Contractor",
    title: "Copywriter",
    defaultPayRate: 58,
    defaultBillRate: 95,
  },
  {
    id: "worker-rowan",
    name: "Rowan Patel",
    email: "rowan@pateldevops.dev",
    type: "Contractor",
    title: "Web engineer",
    defaultPayRate: 92,
    defaultBillRate: 145,
  },
];

const initialAssignments: AgencyWorkerAssignment[] = [
  {
    id: "assign-orbit-camila",
    clientId: "client-orbit",
    projectId: "project-orbit-launch",
    workerId: "worker-camila",
    workerName: "Camila Stone",
    workerType: "Employee",
    role: "Producer",
    payRate: 72,
    billRate: 118,
    hoursPerMonth: 120,
    status: "Active",
  },
  {
    id: "assign-orbit-ari",
    clientId: "client-orbit",
    projectId: "project-orbit-launch",
    workerId: "worker-ari",
    workerName: "Ari Kim",
    workerType: "Contractor",
    role: "Motion designer",
    payRate: 86,
    billRate: 132,
    hoursPerMonth: 92,
    status: "Active",
  },
  {
    id: "assign-orbit-mason",
    clientId: "client-orbit",
    projectId: "project-orbit-retainer",
    workerId: "worker-mason",
    workerName: "Mason Lee",
    workerType: "Employee",
    role: "Strategy lead",
    payRate: 64,
    billRate: 105,
    hoursPerMonth: 64,
    status: "Active",
  },
  {
    id: "assign-bluebird-jules",
    clientId: "client-bluebird",
    projectId: "project-bluebird-media",
    workerId: "worker-jules",
    workerName: "Jules Nguyen",
    workerType: "Contractor",
    role: "Performance copywriter",
    payRate: 58,
    billRate: 95,
    hoursPerMonth: 80,
    status: "Active",
  },
  {
    id: "assign-bluebird-mason",
    clientId: "client-bluebird",
    projectId: "project-bluebird-media",
    workerId: "worker-mason",
    workerName: "Mason Lee",
    workerType: "Employee",
    role: "Client lead",
    payRate: 64,
    billRate: 108,
    hoursPerMonth: 48,
    status: "Active",
  },
  {
    id: "assign-vela-rowan",
    clientId: "client-vela",
    projectId: "project-vela-migration",
    workerId: "worker-rowan",
    workerName: "Rowan Patel",
    workerType: "Contractor",
    role: "Web engineer",
    payRate: 92,
    billRate: 145,
    hoursPerMonth: 36,
    status: "Paused",
  },
];

let clientsStore = [...initialClients];
let projectsStore = [...initialProjects];
let workersStore = [...initialWorkers];
let assignmentsStore = [...initialAssignments];

function wait(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function forceErrorEnabled() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem("circleworks-clients-force-error") === "1"
  );
}

async function agencyClientBillingApi<T>(body?: unknown): Promise<T> {
  const response = await fetch("/api/agency/client-billing", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    cache: "no-store",
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json()) as { success?: boolean; error?: string; data?: T } & T;

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || "Agency client billing request failed.");
  }

  return (payload.data ?? payload) as T;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAgencyClientBillingSeedData(): AgencyClientBillingData {
  return clone({
    clients: initialClients,
    projects: initialProjects,
    workers: initialWorkers,
    assignments: initialAssignments,
  });
}

export function calculateAssignmentFinancials(assignment: Pick<AgencyWorkerAssignment, "payRate" | "billRate" | "hoursPerMonth">) {
  const monthlyPay = assignment.payRate * assignment.hoursPerMonth;
  const monthlyBill = assignment.billRate * assignment.hoursPerMonth;
  const monthlyMargin = monthlyBill - monthlyPay;
  const marginRate = monthlyBill > 0 ? monthlyMargin / monthlyBill : 0;

  return {
    monthlyPay,
    monthlyBill,
    monthlyMargin,
    marginRate,
  };
}

export function buildAgencyClientSummaries(data: AgencyClientBillingData): AgencyClientSummary[] {
  return data.clients.map((client) => {
    const clientProjects = data.projects.filter((project) => project.clientId === client.id);
    const clientAssignments = data.assignments.filter((assignment) => assignment.clientId === client.id);
    const activeAssignments = clientAssignments.filter((assignment) => assignment.status === "Active");
    const activeWorkerIds = new Set(activeAssignments.map((assignment) => assignment.workerId));
    const totals = activeAssignments.reduce(
      (sum, assignment) => {
        const financials = calculateAssignmentFinancials(assignment);
        return {
          monthlyPay: sum.monthlyPay + financials.monthlyPay,
          monthlyBill: sum.monthlyBill + financials.monthlyBill,
          monthlyMargin: sum.monthlyMargin + financials.monthlyMargin,
        };
      },
      { monthlyPay: 0, monthlyBill: 0, monthlyMargin: 0 },
    );

    return {
      ...client,
      activeHeadcount: activeWorkerIds.size,
      projectCount: clientProjects.length,
      monthlyPay: totals.monthlyPay,
      monthlyBill: totals.monthlyBill,
      monthlyMargin: totals.monthlyMargin,
      marginRate: totals.monthlyBill > 0 ? totals.monthlyMargin / totals.monthlyBill : 0,
    };
  });
}

export async function fetchAgencyClientBillingData(): Promise<AgencyClientBillingData> {
  await wait();
  if (forceErrorEnabled()) {
    throw new Error("Agency client billing service is temporarily unavailable.");
  }

  if (typeof window !== "undefined") {
    return agencyClientBillingApi<AgencyClientBillingData>();
  }

  return clone({
    clients: clientsStore,
    projects: projectsStore,
    workers: workersStore,
    assignments: assignmentsStore,
  });
}

export async function createAgencyBillingClient(input: CreateAgencyClientInput) {
  await wait(550);

  if (typeof window !== "undefined") {
    return agencyClientBillingApi<{ client: AgencyClient; project: AgencyProject }>({
      action: "create_client",
      input,
    });
  }

  const id = `client-${slugify(input.name) || Date.now()}`;
  const client: AgencyClient = {
    id,
    name: input.name.trim(),
    billingContact: input.billingContact.trim(),
    email: input.email.trim(),
    industry: input.industry.trim() || "Agency client",
    status: "Active",
    paymentTerms: input.paymentTerms,
    createdAt: todayIsoDate(),
  };

  const projectName = input.firstProjectName.trim() || "General delivery";
  const project: AgencyProject = {
    id: `project-${slugify(input.name)}-${slugify(projectName) || Date.now()}`,
    clientId: id,
    name: projectName,
    code: `${slugify(input.name).slice(0, 3).toUpperCase() || "CLI"}-001`,
    status: "Active",
    budget: 0,
  };

  clientsStore = [client, ...clientsStore];
  projectsStore = [project, ...projectsStore];

  return clone({ client, project });
}

export async function createAgencyProject(input: CreateAgencyProjectInput) {
  await wait(450);

  if (typeof window !== "undefined") {
    return agencyClientBillingApi<AgencyProject>({
      action: "create_project",
      input,
    });
  }

  const project: AgencyProject = {
    id: `project-${input.clientId}-${slugify(input.name) || Date.now()}`,
    clientId: input.clientId,
    name: input.name.trim(),
    code: input.code.trim() || `${input.name.trim().slice(0, 3).toUpperCase()}-001`,
    status: "Active",
    budget: Math.max(0, input.budget),
  };

  projectsStore = [project, ...projectsStore];
  return clone(project);
}

export async function assignAgencyWorker(input: AssignAgencyWorkerInput) {
  await wait(600);

  if (typeof window !== "undefined") {
    return agencyClientBillingApi<AgencyWorkerAssignment>({
      action: "assign_worker",
      input,
    });
  }

  const worker = workersStore.find((item) => item.id === input.workerId);
  if (!worker) throw new Error("Selected worker was not found.");

  const assignment: AgencyWorkerAssignment = {
    id: `assign-${input.clientId}-${input.workerId}-${Date.now()}`,
    clientId: input.clientId,
    projectId: input.projectId,
    workerId: worker.id,
    workerName: worker.name,
    workerType: worker.type,
    role: input.role.trim() || worker.title,
    payRate: Math.max(0, input.payRate),
    billRate: Math.max(0, input.billRate),
    hoursPerMonth: Math.max(0, input.hoursPerMonth),
    status: "Active",
  };

  assignmentsStore = [assignment, ...assignmentsStore];
  return clone(assignment);
}
