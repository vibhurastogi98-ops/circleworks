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

export const mockEmployees: Employee[] = [
  {
    id: 'emp-100',
    firstName: 'Alex',
    lastName: 'Rivers',
    email: 'alex.r@acmecorp.com',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent',
    title: 'Chief Executive Officer',
    department: 'Executive',
    location: 'San Francisco, CA',
    locationType: 'On-Site',
    managerId: null,
    startDate: '2018-01-01',
    status: 'Active',
    type: 'Full-Time',
    history: {
      compensation: [], benefits: [], activity: [], performance: [], timeOff: []
    }
  },
  {
    id: 'emp-101',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.j@acmecorp.com',
    avatar: 'https://i.pravatar.cc/150?u=alice.j',
    title: 'VP of Engineering',
    department: 'Engineering',
    location: 'San Francisco, CA',
    locationType: 'Hybrid',
    managerId: 'emp-100',
    startDate: '2021-03-15',
    status: 'Active',
    type: 'Full-Time',
    history: {
      compensation: [
        { id: 'c1', type: 'Salary', amount: 210000, currency: 'USD', effectiveDate: '2023-01-01', reason: 'Annual Merit' },
        { id: 'c2', type: 'Salary', amount: 190000, currency: 'USD', effectiveDate: '2021-03-15', reason: 'Initial Hire' }
      ],
      benefits: [
        { id: 'b1', type: 'Health', status: 'Enrolled', planName: 'Cigna PPO Platinium', employerContribution: 800, employeeContribution: 200 }
      ],
      activity: [
        { id: 'a1', date: '2023-01-01', user: 'HR System', action: 'Update', field: 'Salary', oldValue: '$190,000', newValue: '$210,000' }
      ],
      performance: [
        { id: 'p1', cycle: '2023 H2 Review', status: 'Completed', rating: 'Exceeds Expectations', submittedAt: '2023-12-15' }
      ],
      timeOff: [
        { id: 't1', type: 'PTO', startDate: '2023-11-20', endDate: '2023-11-24', status: 'Approved', hours: 40 }
      ]
    }
  },
  {
    id: 'emp-102',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.s@acmecorp.com',
    avatar: 'https://i.pravatar.cc/150?u=bob.s',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    locationType: 'Remote',
    managerId: 'emp-101',
    startDate: '2022-07-01',
    status: 'Active',
    type: 'Full-Time',
    history: {
      compensation: [
        { id: 'c3', type: 'Salary', amount: 135000, currency: 'USD', effectiveDate: '2022-07-01', reason: 'Initial Hire' }
      ],
      benefits: [
        { id: 'b2', type: '401k', status: 'Enrolled', planName: 'Vanguard Target 2050', employerContribution: 400, employeeContribution: 800 }
      ],
      activity: [
        { id: 'a2', date: '2022-07-01', user: 'Admin', action: 'Created Profile' }
      ],
      performance: [
        { id: 'p2', cycle: '2023 H2 Review', status: 'Manager-Review' }
      ],
      timeOff: []
    }
  },
  {
    id: 'emp-103',
    firstName: 'Charlie',
    lastName: 'Davis',
    email: 'charlie.d@acmecorp.com',
    avatar: 'https://i.pravatar.cc/150?u=charlie.d',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    locationType: 'On-Site',
    managerId: 'emp-100',
    startDate: '2023-01-10',
    status: 'On Leave',
    type: 'Full-Time',
    history: {
      compensation: [
        { id: 'c4', type: 'Salary', amount: 145000, currency: 'USD', effectiveDate: '2023-01-10', reason: 'Initial Hire' }
      ],
      benefits: [],
      activity: [],
      performance: [],
      timeOff: [
        { id: 't2', type: 'Paternal', startDate: '2024-03-01', endDate: '2024-05-31', status: 'Approved', hours: 480 }
      ]
    }
  },
  {
    id: 'emp-104',
    firstName: 'Diana',
    lastName: 'Martinez',
    email: 'diana.m@acmecorp.com',
    avatar: 'https://i.pravatar.cc/150?u=diana.m',
    title: 'UX Researcher',
    department: 'Design',
    location: 'Seattle, WA',
    locationType: 'Remote',
    managerId: 'emp-103',
    startDate: '2023-11-01',
    status: 'Onboarding',
    type: 'Contractor',
    history: {
      compensation: [
        { id: 'c5', type: 'Hourly', amount: 85, currency: 'USD', effectiveDate: '2023-11-01', reason: 'Initial Hire' }
      ],
      benefits: [],
      activity: [],
      performance: [],
      timeOff: []
    }
  },
  {
    id: 'emp-105',
    firstName: 'Eve',
    lastName: 'Williams',
    email: 'eve.w@acmecorp.com',
    avatar: 'https://i.pravatar.cc/150?u=eve.w',
    title: 'Account Executive',
    department: 'Sales',
    location: 'Chicago, IL',
    locationType: 'On-Site',
    managerId: 'emp-100',
    startDate: '2020-05-20',
    status: 'Terminated',
    type: 'Full-Time',
    history: {
      compensation: [], benefits: [], activity: [], performance: [], timeOff: []
    }
  }
];

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(e => e.id === id);
};
