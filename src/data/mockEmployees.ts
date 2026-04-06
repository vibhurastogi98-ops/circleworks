export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated' | 'Onboarding';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contractor' | 'Intern';
export type Department = 'Engineering' | 'Product' | 'Design' | 'Sales' | 'Marketing' | 'HR' | 'Finance' | 'Executive';
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

const currentDate = new Date().toISOString().split('T')[0];

export const mockEmployees: Employee[] = [];

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(e => e.id === id);
};
