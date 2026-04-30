import type { PayrollEmployee, Approver } from "@/store/usePayrollRunStore";

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Design", "Operations", "Finance", "HR", "Legal"];
const TITLES: Record<string, string[]> = {
  Engineering: ["Senior Engineer", "Staff Engineer", "Engineering Manager", "Frontend Dev", "Backend Dev", "DevOps Engineer"],
  Marketing: ["Marketing Manager", "Content Strategist", "SEO Specialist", "Growth Lead"],
  Sales: ["Account Executive", "Sales Manager", "SDR", "VP Sales"],
  Design: ["Senior Designer", "UX Researcher", "Design Lead", "Product Designer"],
  Operations: ["Operations Manager", "Office Manager", "Facilities Coordinator"],
  Finance: ["Financial Analyst", "Controller", "Accounting Manager"],
  HR: ["HR Business Partner", "Recruiter", "People Ops Manager"],
  Legal: ["Legal Counsel", "Compliance Officer"],
};

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Parker", "Blake", "Reese", "Cameron", "Drew", "Sage", "Emerson", "Phoenix", "Dakota", "Rowan", "Hayden", "Charlie", "Finley", "Skyler", "River", "Lennox", "Harley", "Remy", "Kai", "Sasha", "Zion", "Logan", "Jamie", "Peyton", "Sawyer", "Tatum", "Kendall", "Micah", "Ellis", "August", "Winter", "Blair", "Sloane", "Sutton", "Lane", "Noel", "Eden", "Aspen", "Marlowe"];
const LAST_NAMES = ["Chen", "Patel", "Garcia", "Williams", "Johnson", "Smith", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Robinson", "Clark", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmployees(count: number): PayrollEmployee[] {
  const employees: PayrollEmployee[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const dept = pick(DEPARTMENTS);
    const title = pick(TITLES[dept]);
    const isSalary = Math.random() > 0.3;
    const payType: "salary" | "hourly" = isSalary ? "salary" : "hourly";
    const hours = isSalary ? null : Math.round(72 + Math.random() * 16); // 72-88 hours biweekly
    const basePay = isSalary
      ? Math.round((55000 + Math.random() * 95000) / 24) // biweekly salary
      : Math.round((22 + Math.random() * 38) * (hours || 80) * 100) / 100;

    const grossPay = Math.round(basePay * 100) / 100;
    const federalIT = Math.round(grossPay * (0.12 + Math.random() * 0.10) * 100) / 100;
    const ficaSS = Math.round(grossPay * 0.062 * 100) / 100;
    const ficaMed = Math.round(grossPay * 0.0145 * 100) / 100;
    const stateIT = Math.round(grossPay * (0.03 + Math.random() * 0.06) * 100) / 100;
    const localIT = Math.round(grossPay * (Math.random() * 0.02) * 100) / 100;
    const totalTaxes = federalIT + ficaSS + ficaMed + stateIT + localIT;
    const benefits = Math.round(grossPay * (0.02 + Math.random() * 0.06) * 100) / 100;
    // The payroll preview's "Deductions" column represents employee benefit deductions only.
    const deductions = benefits;
    const netPay = Math.round((grossPay - totalTaxes - benefits) * 100) / 100;

    // Status distribution: 80% verified, 8% flagged, 4% error, 8% pending
    const rand = Math.random();
    let verifyStatus: "verified" | "flagged" | "error" | "pending";
    let flagReason: string | undefined;
    let errorMessage: string | undefined;

    if (rand < 0.80) {
      verifyStatus = "verified";
    } else if (rand < 0.88) {
      verifyStatus = "flagged";
      flagReason = pick([
        "Overtime hours exceed 20 for this period",
        "Unusual bonus amount flagged for review",
        "Pay rate changed since last period",
        "New hire — first payroll, please verify",
      ]);
    } else if (rand < 0.92) {
      verifyStatus = "error";
      errorMessage = pick([
        "Missing W-4, defaulting to Single/0",
        "Direct deposit info expired",
        "State tax registration pending for NY",
        "SSN verification incomplete",
      ]);
    } else {
      verifyStatus = "pending";
    }

    employees.push({
      id: `emp-${String(i + 1).padStart(3, "0")}`,
      name,
      title,
      department: dept,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`,
      payType,
      hours,
      grossPay,
      deductions,
      netPay,
      taxes: { federalIT, ficaSS, ficaMed, stateIT, localIT },
      verifyStatus,
      flagReason,
      errorMessage,
    });
  }

  return employees.sort((a, b) => {
    const order = { error: 0, flagged: 1, pending: 2, verified: 3 };
    return order[a.verifyStatus] - order[b.verifyStatus];
  });
}

export const MOCK_EMPLOYEES: PayrollEmployee[] = generateEmployees(47);

export const MOCK_APPROVERS: Approver[] = [
  {
    id: "apr-01",
    name: "Sarah Chen",
    role: "Finance Manager",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=SarahChen&backgroundColor=transparent",
    status: "pending",
  },
  {
    id: "apr-02",
    name: "Michael Torres",
    role: "HR Director",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=MichaelTorres&backgroundColor=transparent",
    status: "pending",
  },
];

export const PAY_PERIOD = {
  start: "2026-03-16",
  end: "2026-03-31",
  checkDate: "2026-04-05",
};
