export interface ProjectSetup {
  id: string;
  name: string;
  client: string;
  code: string;
  billingRate: number;
  budgetHours: number;
  billable: boolean;
  status: "Active" | "Paused" | "Complete";
  assignedEmployeeIds: string[];
}

export interface ProjectTimeAllocation {
  employeeId: string;
  employeeName: string;
  role: string;
  projectId: string;
  hours: number;
  billable: boolean;
}

export interface PayrollProjectAllocation extends ProjectTimeAllocation {
  projectName: string;
  client: string;
  code: string;
  billingRate: number;
  laborCost: number;
}

export interface ProjectProfitabilityEmployee {
  employeeId: string;
  name: string;
  role: string;
  hours: number;
  billableHours: number;
  nonBillableHours: number;
  cost: number;
}

export interface ProjectProfitabilityRow {
  id: string;
  project: string;
  client: string;
  code: string;
  billingRate: number;
  billableHours: number;
  nonBillableHours: number;
  laborCost: number;
  revenue: number;
  margin: number;
  employees: ProjectProfitabilityEmployee[];
}

export const projectSetups: ProjectSetup[] = [
  {
    id: "proj-acme-rebrand",
    name: "Acme Rebrand",
    client: "Acme Corp",
    code: "ACM-RED",
    billingRate: 150,
    budgetHours: 420,
    billable: true,
    status: "Active",
    assignedEmployeeIds: ["emp-1", "1", "emp-3", "emp-7"],
  },
  {
    id: "proj-mobile-v2",
    name: "Mobile App V2",
    client: "Global Tech",
    code: "GT-MOB",
    billingRate: 120,
    budgetHours: 650,
    billable: true,
    status: "Active",
    assignedEmployeeIds: ["emp-1", "1", "emp-2", "2", "emp-6"],
  },
  {
    id: "proj-marketing-q3",
    name: "Marketing Campaign Q3",
    client: "Stark Industries",
    code: "STK-Q3",
    billingRate: 100,
    budgetHours: 240,
    billable: true,
    status: "Active",
    assignedEmployeeIds: ["emp-4", "4", "emp-7"],
  },
  {
    id: "proj-internal-admin",
    name: "Internal / Admin",
    client: "CircleWorks",
    code: "INT-OPS",
    billingRate: 0,
    budgetHours: 160,
    billable: false,
    status: "Active",
    assignedEmployeeIds: ["emp-3", "3", "emp-5", "emp-8"],
  },
];

export const projectTimeAllocations: ProjectTimeAllocation[] = [
  { employeeId: "emp-1", employeeName: "Sarah Johnson", role: "Sr. Engineer", projectId: "proj-acme-rebrand", hours: 28, billable: true },
  { employeeId: "emp-1", employeeName: "Sarah Johnson", role: "Sr. Engineer", projectId: "proj-mobile-v2", hours: 14, billable: true },
  { employeeId: "emp-2", employeeName: "Mike Chen", role: "Tech Lead", projectId: "proj-mobile-v2", hours: 44, billable: true },
  { employeeId: "emp-3", employeeName: "Amy Park", role: "Ops Manager", projectId: "proj-acme-rebrand", hours: 18, billable: true },
  { employeeId: "emp-3", employeeName: "Amy Park", role: "Ops Manager", projectId: "proj-internal-admin", hours: 22, billable: false },
  { employeeId: "emp-4", employeeName: "Carlos Diaz", role: "Sales Rep", projectId: "proj-marketing-q3", hours: 46, billable: true },
  { employeeId: "emp-5", employeeName: "Jessica Williams", role: "Support Lead", projectId: "proj-internal-admin", hours: 38, billable: false },
  { employeeId: "emp-6", employeeName: "David Kim", role: "Engineer", projectId: "proj-mobile-v2", hours: 41, billable: true },
  { employeeId: "emp-7", employeeName: "Rachel Torres", role: "Marketing Coord", projectId: "proj-acme-rebrand", hours: 18, billable: true },
  { employeeId: "emp-7", employeeName: "Rachel Torres", role: "Marketing Coord", projectId: "proj-marketing-q3", hours: 22, billable: true },
  { employeeId: "emp-8", employeeName: "Brandon Lee", role: "Shift Supervisor", projectId: "proj-internal-admin", hours: 48, billable: false },
];

const payrollIdAliases: Record<string, string> = {
  "1": "emp-1",
  "2": "emp-2",
  "3": "emp-3",
  "4": "emp-4",
};

const fallbackPayrollGrossByEmployee: Record<string, number> = {
  "emp-1": 5200,
  "emp-2": 6100,
  "emp-3": 3600,
  "emp-4": 4200,
  "emp-5": 3200,
  "emp-6": 4700,
  "emp-7": 3400,
  "emp-8": 3800,
};

function normalizeEmployeeId(employeeId: string) {
  return payrollIdAliases[employeeId] || employeeId;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundHours(value: number) {
  return Math.round(value * 10) / 10;
}

export function getProjectById(projectId: string) {
  return projectSetups.find((project) => project.id === projectId);
}

export function getEmployeeProjectAllocations(employeeId: string, totalHours?: number) {
  const normalizedId = normalizeEmployeeId(employeeId);
  const allocations = projectTimeAllocations.filter((allocation) => allocation.employeeId === normalizedId);
  const allocationHours = allocations.reduce((sum, allocation) => sum + allocation.hours, 0);
  const scale = totalHours && allocationHours > 0 ? totalHours / allocationHours : 1;

  return allocations.map((allocation) => {
    const project = getProjectById(allocation.projectId);
    return {
      ...allocation,
      hours: roundHours(allocation.hours * scale),
      projectName: project?.name || "Unassigned",
      client: project?.client || "Internal",
      code: project?.code || "UNASSIGNED",
      billingRate: project?.billingRate || 0,
    };
  });
}

export function calculatePayrollProjectAllocation(employeeId: string, grossPay: number, totalHours: number): PayrollProjectAllocation[] {
  const safeHours = totalHours > 0 ? totalHours : 40;
  const hourlyCost = grossPay / safeHours;

  return getEmployeeProjectAllocations(employeeId, safeHours).map((allocation) => ({
    ...allocation,
    laborCost: roundMoney(allocation.hours * hourlyCost),
  }));
}

export function buildProjectProfitabilityRows(): ProjectProfitabilityRow[] {
  return projectSetups.map((project) => {
    const allocations = projectTimeAllocations.filter((allocation) => allocation.projectId === project.id);
    const employees = allocations.map((allocation) => {
      const employeeTotalHours = projectTimeAllocations
        .filter((item) => item.employeeId === allocation.employeeId)
        .reduce((sum, item) => sum + item.hours, 0);
      const grossPay = fallbackPayrollGrossByEmployee[allocation.employeeId] || 4000;
      const cost = roundMoney((grossPay / Math.max(employeeTotalHours, 1)) * allocation.hours);

      return {
        employeeId: allocation.employeeId,
        name: allocation.employeeName,
        role: allocation.role,
        hours: allocation.hours,
        billableHours: allocation.billable ? allocation.hours : 0,
        nonBillableHours: allocation.billable ? 0 : allocation.hours,
        cost,
      };
    });

    const billableHours = allocations
      .filter((allocation) => allocation.billable)
      .reduce((sum, allocation) => sum + allocation.hours, 0);
    const nonBillableHours = allocations
      .filter((allocation) => !allocation.billable)
      .reduce((sum, allocation) => sum + allocation.hours, 0);
    const laborCost = roundMoney(employees.reduce((sum, employee) => sum + employee.cost, 0));
    const revenue = roundMoney(billableHours * project.billingRate);
    const margin = revenue > 0 ? roundMoney(((revenue - laborCost) / revenue) * 100) : 0;

    return {
      id: project.id,
      project: project.name,
      client: project.client,
      code: project.code,
      billingRate: project.billingRate,
      billableHours,
      nonBillableHours,
      laborCost,
      revenue,
      margin,
      employees,
    };
  });
}

export function buildProjectWaterfall(rows: ProjectProfitabilityRow[]) {
  const revenue = roundMoney(rows.reduce((sum, row) => sum + row.revenue, 0));
  const laborCost = roundMoney(rows.reduce((sum, row) => sum + row.laborCost, 0));
  const margin = roundMoney(revenue - laborCost);

  return [
    { name: "Revenue", value: revenue, isTotal: true },
    { name: "Labor Cost", value: -laborCost, isTotal: false },
    { name: "Margin", value: margin, isTotal: true },
  ];
}

export function exportProjectProfitabilityCsv(rows: ProjectProfitabilityRow[]) {
  const headers = ["Project", "Client", "Billable Hours", "Non-Billable", "Labor Cost", "Revenue", "Margin %"];
  const lines = rows.map((row) => [
    row.project,
    row.client,
    row.billableHours,
    row.nonBillableHours,
    row.laborCost,
    row.revenue,
    row.margin,
  ]);

  return [headers, ...lines]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
