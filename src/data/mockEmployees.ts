import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";

export type EmploymentStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated' | 'Onboarding';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contractor' | 'Intern';
export type Department = 'Engineering' | 'Product' | 'Design' | 'Sales' | 'Marketing' | 'HR' | 'Finance' | 'Executive' | 'Payroll' | 'People';
export type LocationType = 'Remote' | 'On-Site' | 'Hybrid';

export interface Compensation {
  id: string;
  type: 'Salary' | 'Hourly';
  amount: number;
  currency: string;
  effectiveDate: string;
  reason: 'Initial Hire' | 'Annual Merit' | 'Promotion' | 'Market Adjustment';
}

export interface Benefit {
  id: string;
  type: 'Health' | 'Dental' | 'Vision' | '401k' | 'FSA';
  status: 'Enrolled' | 'Waived' | 'Eligible';
  planName?: string;
  employerContribution?: number;
  employeeContribution?: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  user: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface PerformanceReview {
  id: string;
  cycle: string;
  status: 'Draft' | 'Self-Review' | 'Manager-Review' | 'Completed';
  rating?: string;
  submittedAt?: string;
}

export interface TimeOff {
  id: string;
  type: 'PTO' | 'Sick' | 'Unpaid' | 'Paternal';
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  hours: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  title: string;
  department: Department;
  location: string;
  locationType: LocationType;
  managerId: string | null;
  startDate: string;
  status: EmploymentStatus;
  type: EmploymentType;
  history: {
    compensation: Compensation[];
    benefits: Benefit[];
    activity: ActivityLog[];
    performance: PerformanceReview[];
    timeOff: TimeOff[];
  };
}

const mapEmploymentType = (type: string): EmploymentType => {
  if (type === "Full-time") return "Full-Time";
  if (type === "Part-time") return "Part-Time";
  if (type === "Contractor") return "Contractor";
  return "Intern";
};

const mapLocationType = (type: string): LocationType => {
  if (type === "Office") return "On-Site";
  if (type === "Hybrid") return "Hybrid";
  return "Remote";
};

export const mockEmployees: Employee[] = hrisEmployees.map((employee) => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getEmployeeName(employee))}&backgroundColor=transparent`,
  title: employee.title,
  department: employee.department as Department,
  location: employee.location,
  locationType: mapLocationType(employee.locationType),
  managerId: employee.managerId || null,
  startDate: employee.startDate,
  status: employee.status,
  type: mapEmploymentType(employee.employmentType),
  history: {
    compensation: [
      {
        id: `comp-${employee.id}`,
        type: employee.payType,
        amount: employee.payType === "Hourly" ? employee.hourlyRate || 0 : employee.salary,
        currency: "USD",
        effectiveDate: "2026-01-01",
        reason: "Annual Merit",
      },
    ],
    benefits: [
      {
        id: `ben-${employee.id}`,
        type: "Health",
        status: employee.status === "Onboarding" ? "Eligible" : "Enrolled",
        planName: "Blue Cross PPO Gold",
        employerContribution: 650,
        employeeContribution: 250,
      },
    ],
    activity: [
      {
        id: `act-${employee.id}`,
        date: "2026-05-29",
        user: "People Ops",
        action: "Updated employee mock record",
      },
    ],
    performance: [
      {
        id: `perf-${employee.id}`,
        cycle: "Mid-year 2026",
        status: employee.status === "Onboarding" ? "Draft" : "Manager-Review",
        rating: employee.status === "Onboarding" ? undefined : "Meets expectations",
      },
    ],
    timeOff: [
      {
        id: `pto-${employee.id}`,
        type: "PTO",
        startDate: "2026-06-10",
        endDate: "2026-06-12",
        status: "Approved",
        hours: 24,
      },
    ],
  },
}));

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(e => e.id === id);
};
