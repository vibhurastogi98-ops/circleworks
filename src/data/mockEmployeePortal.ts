// =============================================================================
// 🧑‍💼 EMPLOYEE SELF-SERVICE PORTAL — Mock Data
// =============================================================================

// ── Employee Profile ──
export const mockEmployeeProfile = {
  id: 'EMP-001',
  firstName: 'Alex',
  lastName: 'Rivera',
  fullName: 'Alex Rivera',
  email: 'alex.rivera@circleworks.io',
  phone: '(415) 555-0147',
  pronouns: 'they/them',
  jobTitle: 'Senior Product Designer',
  department: 'Design',
  manager: 'Sarah Chen',
  managerId: 'EMP-008',
  startDate: '2023-03-15',
  employeeType: 'Full-time',
  location: 'San Francisco, CA',
  avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent',
  homeAddress: {
    street: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
  },
  emergencyContacts: [
    { name: 'Jordan Rivera', relationship: 'Spouse', phone: '(415) 555-0199' },
    { name: 'Maria Rivera', relationship: 'Mother', phone: '(650) 555-0234' },
  ],
  bankAccount: {
    bankName: 'Chase Bank',
    routingNumber: '****4521',
    accountNumber: '****8790',
    accountType: 'Checking',
    lastUpdated: '2024-11-20',
  },
  w4: {
    filingStatus: 'Married Filing Jointly',
    allowances: 2,
    additionalWithholding: 0,
    lastUpdated: '2024-01-15',
  },
  mfaEnabled: true,
  activeSessions: [
    { device: 'MacBook Pro — Chrome', location: 'San Francisco, CA', lastActive: '2026-04-06T09:23:00Z', current: true },
    { device: 'iPhone 16 — Safari', location: 'San Francisco, CA', lastActive: '2026-04-06T08:45:00Z', current: false },
  ],
};

// ── Pay Stubs ──
export type PayStub = {
  id: string;
  payDate: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  dentalInsurance: number;
  visionInsurance: number;
  retirement401k: number;
  fsaContribution: number;
  otherDeductions: number;
  netPay: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  bonusPay: number;
  year: number;
};

export const mockPayStubs: PayStub[] = [
  {
    id: 'PS-2026-07', payDate: '2026-04-04', periodStart: '2026-03-16', periodEnd: '2026-03-31',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-06', payDate: '2026-03-21', periodStart: '2026-03-01', periodEnd: '2026-03-15',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-05', payDate: '2026-03-07', periodStart: '2026-02-16', periodEnd: '2026-02-28',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-04', payDate: '2026-02-21', periodStart: '2026-02-01', periodEnd: '2026-02-15',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-03', payDate: '2026-02-07', periodStart: '2026-01-16', periodEnd: '2026-01-31',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-02', payDate: '2026-01-21', periodStart: '2026-01-01', periodEnd: '2026-01-15',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2026,
  },
  {
    id: 'PS-2026-01', payDate: '2026-01-07', periodStart: '2025-12-16', periodEnd: '2025-12-31',
    grossPay: 6916.67, federalTax: 1137.50, stateTax: 553.33, socialSecurity: 428.83, medicare: 100.29,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3980.57, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 1500, year: 2026,
  },
  // 2025 stubs
  {
    id: 'PS-2025-24', payDate: '2025-12-19', periodStart: '2025-12-01', periodEnd: '2025-12-15',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2025,
  },
  {
    id: 'PS-2025-23', payDate: '2025-12-05', periodStart: '2025-11-16', periodEnd: '2025-11-30',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2025,
  },
  {
    id: 'PS-2025-22', payDate: '2025-11-21', periodStart: '2025-11-01', periodEnd: '2025-11-15',
    grossPay: 5416.67, federalTax: 812.50, stateTax: 433.33, socialSecurity: 335.83, medicare: 78.54,
    healthInsurance: 245.00, dentalInsurance: 35.00, visionInsurance: 15.00, retirement401k: 325.00,
    fsaContribution: 96.15, otherDeductions: 0, netPay: 3040.32, hoursWorked: 80, overtimeHours: 0,
    overtimePay: 0, bonusPay: 0, year: 2025,
  },
];

// ── Tax Forms ──
export type TaxForm = {
  id: string;
  year: number;
  type: 'W-2' | '1099-NEC' | 'W-2c';
  status: 'Available' | 'Pending';
  availableDate: string;
  wagesBoxes?: {
    box1: number; box2: number; box3: number; box4: number;
    box5: number; box6: number; box16?: number; box17?: number;
  };
};

export const mockTaxForms: TaxForm[] = [
  {
    id: 'TF-2025', year: 2025, type: 'W-2', status: 'Available', availableDate: '2026-01-31',
    wagesBoxes: { box1: 128000, box2: 19200, box3: 128000, box4: 7936, box5: 130000, box6: 1885, box16: 128000, box17: 10240 },
  },
  {
    id: 'TF-2024', year: 2024, type: 'W-2', status: 'Available', availableDate: '2025-01-31',
    wagesBoxes: { box1: 120000, box2: 18000, box3: 120000, box4: 7440, box5: 120000, box6: 1740, box16: 120000, box17: 9600 },
  },
  {
    id: 'TF-2023', year: 2023, type: 'W-2', status: 'Available', availableDate: '2024-01-31',
    wagesBoxes: { box1: 110000, box2: 16500, box3: 110000, box4: 6820, box5: 110000, box6: 1595, box16: 110000, box17: 8800 },
  },
  { id: 'TF-2022', year: 2022, type: 'W-2', status: 'Available', availableDate: '2023-01-31',
    wagesBoxes: { box1: 95000, box2: 14250, box3: 95000, box4: 5890, box5: 95000, box6: 1378, box16: 95000, box17: 7600 },
  },
  { id: 'TF-2021', year: 2021, type: 'W-2', status: 'Available', availableDate: '2022-01-31',
    wagesBoxes: { box1: 85000, box2: 12750, box3: 85000, box4: 5270, box5: 85000, box6: 1233 },
  },
];

// ── PTO / Time Off ──
export type PtoBalance = { type: string; balance: number; used: number; total: number; accrualRate: string };
export type PtoRequest = {
  id: string; type: string; startDate: string; endDate: string; workingDays: number;
  status: 'Approved' | 'Pending' | 'Denied'; approver: string; approverNote?: string; note?: string;
};
export type TeamCalendarEntry = { name: string; department: string; startDate: string; endDate: string; type: string };

export const mockPtoBalances: PtoBalance[] = [
  { type: 'Vacation', balance: 12, used: 8, total: 20, accrualRate: '6.67 hrs/pay period' },
  { type: 'Sick', balance: 7, used: 3, total: 10, accrualRate: '3.33 hrs/pay period' },
  { type: 'Personal', balance: 2, used: 1, total: 3, accrualRate: 'Annual grant' },
];

export const mockPtoRequests: PtoRequest[] = [
  { id: 'PTO-001', type: 'Vacation', startDate: '2026-04-14', endDate: '2026-04-18', workingDays: 5, status: 'Approved', approver: 'Sarah Chen', approverNote: 'Enjoy your trip!', note: 'Family vacation to Hawaii' },
  { id: 'PTO-002', type: 'Sick', startDate: '2026-03-10', endDate: '2026-03-10', workingDays: 1, status: 'Approved', approver: 'Sarah Chen' },
  { id: 'PTO-003', type: 'Vacation', startDate: '2026-05-26', endDate: '2026-05-30', workingDays: 5, status: 'Pending', approver: 'Sarah Chen', note: 'Memorial Day week' },
  { id: 'PTO-004', type: 'Personal', startDate: '2026-02-14', endDate: '2026-02-14', workingDays: 1, status: 'Approved', approver: 'Sarah Chen', note: 'Personal errand' },
  { id: 'PTO-005', type: 'Vacation', startDate: '2025-12-23', endDate: '2025-12-27', workingDays: 3, status: 'Approved', approver: 'Sarah Chen', note: 'Holiday break' },
];

export const mockTeamCalendar: TeamCalendarEntry[] = [
  { name: 'Jordan Kim', department: 'Design', startDate: '2026-04-14', endDate: '2026-04-16', type: 'Vacation' },
  { name: 'Priya Sharma', department: 'Engineering', startDate: '2026-04-15', endDate: '2026-04-15', type: 'Sick' },
  { name: 'Marcus Lee', department: 'Design', startDate: '2026-05-26', endDate: '2026-05-28', type: 'Vacation' },
];

// ── Expenses ──
export type Expense = {
  id: string; date: string; merchant: string; amount: number; category: string;
  purpose: string; receiptUrl?: string; status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  reportId?: string;
};

export type ExpenseReport = {
  id: string; title: string; status: 'Draft' | 'Submitted' | 'Approved' | 'Processing' | 'Paid';
  totalAmount: number; itemCount: number; submittedDate?: string; paidDate?: string;
};

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', date: '2026-04-02', merchant: 'Uber', amount: 34.50, category: 'Transportation', purpose: 'Client meeting commute', status: 'Submitted', reportId: 'ER-003' },
  { id: 'EXP-002', date: '2026-04-01', merchant: 'Blue Bottle Coffee', amount: 18.75, category: 'Meals', purpose: 'Client lunch meeting', status: 'Submitted', reportId: 'ER-003' },
  { id: 'EXP-003', date: '2026-03-28', merchant: 'Amazon', amount: 149.99, category: 'Office Supplies', purpose: 'Ergonomic keyboard for WFH', status: 'Approved', reportId: 'ER-002' },
  { id: 'EXP-004', date: '2026-03-25', merchant: 'Southwest Airlines', amount: 387.00, category: 'Travel', purpose: 'Flight to LA for design conference', status: 'Paid', reportId: 'ER-001' },
  { id: 'EXP-005', date: '2026-03-25', merchant: 'Marriott', amount: 289.00, category: 'Lodging', purpose: 'Hotel for LA design conference', status: 'Paid', reportId: 'ER-001' },
  { id: 'EXP-006', date: '2026-04-05', merchant: 'Staples', amount: 42.30, category: 'Office Supplies', purpose: 'Printer ink cartridges', status: 'Draft' },
];

export const mockExpenseReports: ExpenseReport[] = [
  { id: 'ER-001', title: 'LA Design Conference — March 2026', status: 'Paid', totalAmount: 676.00, itemCount: 2, submittedDate: '2026-03-30', paidDate: '2026-04-04' },
  { id: 'ER-002', title: 'WFH Equipment — March 2026', status: 'Approved', totalAmount: 149.99, itemCount: 1, submittedDate: '2026-03-29' },
  { id: 'ER-003', title: 'Client Meetings — April 2026', status: 'Submitted', totalAmount: 53.25, itemCount: 2, submittedDate: '2026-04-03' },
];

// ── Benefits ──
export type BenefitCard = {
  id: string; type: string; planName: string; carrier: string; status: 'Enrolled' | 'Waived' | 'Eligible';
  deductible?: number; oopMax?: number; cardNumber?: string; employeePremium: number;
  coverageLevel: string; details?: Record<string, string>;
};

export const mockBenefitCards: BenefitCard[] = [
  { id: 'BEN-001', type: 'Medical', planName: 'PPO Gold', carrier: 'Blue Cross Blue Shield', status: 'Enrolled', deductible: 1500, oopMax: 6000, cardNumber: '****4832', employeePremium: 245, coverageLevel: 'Employee + Spouse', details: { 'Primary Care Copay': '$25', 'Specialist Copay': '$50', 'ER Copay': '$250', 'Prescription': '$10/$30/$60' } },
  { id: 'BEN-002', type: 'Dental', planName: 'Dental Plus', carrier: 'Delta Dental', status: 'Enrolled', deductible: 50, oopMax: 2000, employeePremium: 35, coverageLevel: 'Employee + Spouse', details: { 'Preventive': '100% covered', 'Basic': '80% covered', 'Major': '50% covered', 'Orthodontia': '50% up to $1,500' } },
  { id: 'BEN-003', type: 'Vision', planName: 'Vision Standard', carrier: 'VSP', status: 'Enrolled', employeePremium: 15, coverageLevel: 'Employee Only', details: { 'Eye Exam': '$10 copay', 'Frames': '$150 allowance', 'Contact Lenses': '$130 allowance' } },
  { id: 'BEN-004', type: '401(k)', planName: '401(k) Retirement Plan', carrier: 'Fidelity', status: 'Enrolled', employeePremium: 325, coverageLevel: 'N/A', details: { 'Contribution Rate': '6%', 'Employer Match': '50% up to 6%', 'Vesting': '3-year cliff', 'Balance': '$47,850' } },
  { id: 'BEN-005', type: 'FSA', planName: 'Healthcare FSA', carrier: 'WageWorks', status: 'Enrolled', employeePremium: 96.15, coverageLevel: 'N/A', details: { 'Annual Election': '$2,500', 'Used': '$890', 'Remaining': '$1,610', 'Grace Period': 'March 15, 2027' } },
  { id: 'BEN-006', type: 'Life', planName: 'Basic Life & AD&D', carrier: 'MetLife', status: 'Enrolled', employeePremium: 0, coverageLevel: 'Employee Only', details: { 'Coverage Amount': '1x Salary ($130,000)', 'AD&D': '1x Salary', 'Cost': 'Employer Paid' } },
];

export const mockDependents = [
  { name: 'Jordan Rivera', relationship: 'Spouse', dob: '1992-08-14', coverageTypes: ['Medical', 'Dental'] },
];

// ── Documents ──
export type EmployeeDocument = {
  id: string; name: string; type: 'Company Policy' | 'Personal' | 'Pay Stub' | 'Tax Form' | 'Signed Document';
  category: string; uploadedBy: string; uploadedAt: string; status?: 'Signed' | 'Pending Signature' | 'Read';
  fileSize: string;
};

export const mockEmployeeDocuments: EmployeeDocument[] = [
  { id: 'DOC-001', name: 'Employee Handbook 2026', type: 'Company Policy', category: 'Policies', uploadedBy: 'HR', uploadedAt: '2026-01-15', status: 'Read', fileSize: '2.4 MB' },
  { id: 'DOC-002', name: 'Remote Work Agreement', type: 'Company Policy', category: 'Agreements', uploadedBy: 'HR', uploadedAt: '2026-02-01', status: 'Pending Signature', fileSize: '145 KB' },
  { id: 'DOC-003', name: 'NDA — Confidentiality Agreement', type: 'Signed Document', category: 'Agreements', uploadedBy: 'HR', uploadedAt: '2023-03-15', status: 'Signed', fileSize: '320 KB' },
  { id: 'DOC-004', name: 'I-9 Employment Verification', type: 'Signed Document', category: 'Compliance', uploadedBy: 'HR', uploadedAt: '2023-03-16', status: 'Signed', fileSize: '890 KB' },
  { id: 'DOC-005', name: 'Direct Deposit Authorization', type: 'Personal', category: 'Banking', uploadedBy: 'Alex Rivera', uploadedAt: '2024-11-20', fileSize: '78 KB' },
  { id: 'DOC-006', name: 'Professional Development Plan 2026', type: 'Company Policy', category: 'Performance', uploadedBy: 'Sarah Chen', uploadedAt: '2026-01-10', status: 'Pending Signature', fileSize: '210 KB' },
  { id: 'DOC-007', name: 'Benefits Summary 2026', type: 'Personal', category: 'Benefits', uploadedBy: 'HR', uploadedAt: '2026-01-02', status: 'Read', fileSize: '1.1 MB' },
];

// ── Learning / LMS ──
export type Course = {
  id: string; title: string; category: string; dueDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed'; progress: number;
  duration: string; isMandatory: boolean; completedDate?: string; certificateUrl?: string;
  modules: { title: string; type: 'Video' | 'PDF' | 'Quiz'; duration: string; completed: boolean }[];
};

export const mockCourses: Course[] = [
  {
    id: 'CRS-001', title: 'Workplace Harassment Prevention', category: 'Compliance', dueDate: '2026-04-30',
    status: 'In Progress', progress: 60, duration: '2 hours', isMandatory: true,
    modules: [
      { title: 'Introduction to Workplace Safety', type: 'Video', duration: '15 min', completed: true },
      { title: 'Recognizing Harassment', type: 'Video', duration: '25 min', completed: true },
      { title: 'Bystander Intervention', type: 'PDF', duration: '20 min', completed: true },
      { title: 'Reporting Procedures', type: 'Video', duration: '20 min', completed: false },
      { title: 'Final Assessment', type: 'Quiz', duration: '15 min', completed: false },
    ],
  },
  {
    id: 'CRS-002', title: 'Data Privacy & GDPR Essentials', category: 'Compliance', dueDate: '2026-05-15',
    status: 'Not Started', progress: 0, duration: '1.5 hours', isMandatory: true,
    modules: [
      { title: 'What is GDPR?', type: 'Video', duration: '20 min', completed: false },
      { title: 'Data Handling Best Practices', type: 'PDF', duration: '15 min', completed: false },
      { title: 'Knowledge Check', type: 'Quiz', duration: '10 min', completed: false },
    ],
  },
  {
    id: 'CRS-003', title: 'Design Systems Masterclass', category: 'Professional Development',
    status: 'Completed', progress: 100, duration: '4 hours', isMandatory: false, completedDate: '2026-02-28',
    certificateUrl: '/certificates/design-systems-2026.pdf',
    modules: [
      { title: 'Foundations of Design Tokens', type: 'Video', duration: '45 min', completed: true },
      { title: 'Component Architecture', type: 'Video', duration: '60 min', completed: true },
      { title: 'Advanced Theming', type: 'PDF', duration: '30 min', completed: true },
      { title: 'Certification Exam', type: 'Quiz', duration: '25 min', completed: true },
    ],
  },
  {
    id: 'CRS-004', title: 'Leadership Essentials', category: 'Management',
    status: 'Not Started', progress: 0, duration: '3 hours', isMandatory: false,
    modules: [
      { title: 'Leading with Empathy', type: 'Video', duration: '30 min', completed: false },
      { title: 'Effective 1:1 Meetings', type: 'Video', duration: '25 min', completed: false },
      { title: 'Feedback Frameworks', type: 'PDF', duration: '20 min', completed: false },
    ],
  },
];

// ── Goals ──
export type Goal = {
  id: string; title: string; description: string; type: 'Individual' | 'Team';
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed'; progress: number;
  dueDate: string; parentGoal?: string; managerFeedback?: string;
  checkIns: { date: string; note: string; progress: number }[];
};

export const mockGoals: Goal[] = [
  {
    id: 'G-001', title: 'Launch New Design System v2', description: 'Deliver the unified design system across all product surfaces with full documentation.',
    type: 'Individual', status: 'On Track', progress: 72, dueDate: '2026-06-30',
    parentGoal: 'Improve Product Quality (Team Goal)',
    managerFeedback: 'Great progress on the component library. Let\'s focus on documentation next.',
    checkIns: [
      { date: '2026-04-01', note: 'Completed color tokens and typography scale. Starting component library.', progress: 72 },
      { date: '2026-03-15', note: 'Finalized design token architecture. Got alignment from engineering.', progress: 55 },
      { date: '2026-03-01', note: 'Kicked off audit of existing components. Identified 47 inconsistencies.', progress: 30 },
    ],
  },
  {
    id: 'G-002', title: 'Reduce Design Handoff Friction', description: 'Cut average design-to-dev handoff time from 5 days to 2 days.',
    type: 'Individual', status: 'At Risk', progress: 40, dueDate: '2026-05-31',
    parentGoal: 'Improve Product Quality (Team Goal)',
    managerFeedback: 'We need to accelerate here. Let\'s discuss tooling options in our next 1:1.',
    checkIns: [
      { date: '2026-04-01', note: 'Implemented Figma-to-code annotations. Still measuring impact.', progress: 40 },
      { date: '2026-03-15', note: 'Researching automation tools for spec generation.', progress: 25 },
    ],
  },
  {
    id: 'G-003', title: 'Complete 3 Cross-Team Projects', description: 'Lead design for 3 cross-functional initiatives this quarter.',
    type: 'Individual', status: 'On Track', progress: 66, dueDate: '2026-06-30',
    checkIns: [
      { date: '2026-04-01', note: 'Completed onboarding redesign and benefits enrollment flow. Starting employee portal.', progress: 66 },
    ],
  },
  {
    id: 'G-004', title: 'Improve Product Quality', description: 'Raise design consistency score from 65% to 90% across all surfaces.',
    type: 'Team', status: 'On Track', progress: 58, dueDate: '2026-06-30',
    checkIns: [],
  },
];

// ── EWA (Earned Wage Access) ──
export type EwaRequest = {
  id: string; amount: number; requestedAt: string; status: 'Completed' | 'Processing' | 'Failed';
  repaymentDate: string; fee: number;
};

export const mockEwaData = {
  earnedWages: 3240.50,
  availableAmount: 1620.25, // 50% of earned
  maxPerPayPeriod: 2500,
  nextPayDate: '2026-04-18',
  eligibilityRequirements: [
    'Must have completed 90 days of employment',
    'No active disciplinary actions',
    'Direct deposit enrollment required',
    'Maximum 50% of earned wages per pay period',
    'Available funds reset after each payroll',
  ],
  requests: [
    { id: 'EWA-001', amount: 500, requestedAt: '2026-03-28T14:30:00Z', status: 'Completed' as const, repaymentDate: '2026-04-04', fee: 0 },
    { id: 'EWA-002', amount: 300, requestedAt: '2026-03-14T09:15:00Z', status: 'Completed' as const, repaymentDate: '2026-03-21', fee: 0 },
    { id: 'EWA-003', amount: 750, requestedAt: '2026-02-25T16:45:00Z', status: 'Completed' as const, repaymentDate: '2026-03-07', fee: 0 },
  ] as EwaRequest[],
};

// ── Referrals ──
export type Referral = {
  id: string; candidateName: string; position: string; status: 'Applied' | 'Interviewing' | 'Hired' | 'Rejected';
  referredAt: string; earned: number;
};

export const mockReferralData = {
  referralLink: 'https://circleworks.io/refer/alex-rivera-CW2026',
  totalEarned: 3000,
  totalPending: 1500,
  totalRedeemed: 1500,
  bonusPerHire: 1500,
  referrals: [
    { id: 'REF-001', candidateName: 'Taylor Brooks', position: 'Frontend Engineer', status: 'Hired' as const, referredAt: '2025-11-10', earned: 1500 },
    { id: 'REF-002', candidateName: 'Jamie Wong', position: 'UX Researcher', status: 'Interviewing' as const, referredAt: '2026-03-15', earned: 0 },
    { id: 'REF-003', candidateName: 'Casey Martin', position: 'Product Manager', status: 'Hired' as const, referredAt: '2026-01-20', earned: 1500 },
    { id: 'REF-004', candidateName: 'Drew Patterson', position: 'Backend Engineer', status: 'Applied' as const, referredAt: '2026-04-01', earned: 0 },
    { id: 'REF-005', candidateName: 'Morgan Ellis', position: 'Design Lead', status: 'Rejected' as const, referredAt: '2025-09-05', earned: 0 },
  ] as Referral[],
};

// ── Home Screen Extras ──
export const mockPendingTasks = [
  { id: 'T-001', title: 'Sign Remote Work Agreement', type: 'Document', deadline: '2026-04-10', link: '/me/documents' },
  { id: 'T-002', title: 'Complete Harassment Prevention Training', type: 'Learning', deadline: '2026-04-30', link: '/me/learning' },
  { id: 'T-003', title: 'Sign Professional Development Plan', type: 'Document', deadline: '2026-04-15', link: '/me/documents' },
  { id: 'T-004', title: 'Update Emergency Contacts', type: 'Profile', deadline: '2026-04-20', link: '/me/profile' },
];

export const mockAnnouncements = [
  { id: 'A-001', title: '🎉 Q1 Results — Record Revenue!', date: '2026-04-03', preview: 'We hit $12M ARR this quarter. Thank you to everyone who contributed to this milestone.' },
  { id: 'A-002', title: '🏢 Office Renovation Update', date: '2026-04-01', preview: 'The 3rd floor renovation will be completed by April 15. Temporary seating arrangements are on the wiki.' },
  { id: 'A-003', title: '🩺 Open Enrollment Reminder', date: '2026-03-28', preview: 'Open enrollment closes April 30. Review your options at /me/benefits.' },
  { id: 'A-004', title: '🌍 Earth Day Volunteering', date: '2026-03-25', preview: 'Sign up for our company volunteer day on April 22. Beach cleanup + tree planting.' },
];

export const mockKudos = [
  { id: 'K-001', from: 'Sarah Chen', date: '2026-04-03', message: 'Amazing work on the design system audit! Your attention to detail is inspiring. 🌟' },
  { id: 'K-002', from: 'Marcus Lee', date: '2026-03-28', message: 'Thanks for jumping in on the onboarding redesign. The flow is so much cleaner now! 🚀' },
  { id: 'K-003', from: 'Priya Sharma', date: '2026-03-15', message: 'Your presentation at the design review was excellent. Great storytelling! 🎨' },
];
