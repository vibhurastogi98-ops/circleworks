export type ComplianceSeverity = "critical" | "warning" | "info";

export type ComplianceFilingType =
  | "Tax forms"
  | "EEO-1"
  | "OSHA 300A"
  | "ACA 1094-C"
  | "State filing";

export interface ComplianceAlertItem {
  id: string;
  severity: ComplianceSeverity;
  description: string;
  affectedEmployees: string[];
  dueDate: string;
  ctaLabel: string;
  href: string;
}

export interface ComplianceFilingDeadline {
  id: string;
  type: ComplianceFilingType;
  title: string;
  jurisdiction: string;
  dueDate: string;
  owner: string;
  status: "ready" | "needs_review" | "not_started";
}

export interface ComplianceStatusCard {
  id: string;
  label: string;
  metric: string;
  status: "healthy" | "attention" | "risk";
  description: string;
  href: string;
}

export const complianceAlertsLiveSeed: ComplianceAlertItem[] = [
  {
    id: "alert-i9-expired",
    severity: "critical",
    description: "Two work authorization documents are expired and require I-9 reverification.",
    affectedEmployees: ["Maria Santos", "James Liu"],
    dueDate: "2026-05-31",
    ctaLabel: "Resolve",
    href: "/compliance/i9",
  },
  {
    id: "alert-eeo-certify",
    severity: "critical",
    description: "EEO-1 Component 1 certification has unresolved validation errors.",
    affectedEmployees: ["HR Compliance Team"],
    dueDate: "2026-06-24",
    ctaLabel: "Resolve",
    href: "/compliance/eeo1",
  },
  {
    id: "alert-osha-posting",
    severity: "warning",
    description: "OSHA 300A posting archive is missing certification evidence for the San Francisco office.",
    affectedEmployees: ["Operations"],
    dueDate: "2026-06-07",
    ctaLabel: "Resolve",
    href: "/compliance/osha",
  },
  {
    id: "alert-everify-tnc",
    severity: "warning",
    description: "Tentative nonconfirmation case needs employee notice and follow-up tracking.",
    affectedEmployees: ["Lisa Thompson"],
    dueDate: "2026-06-10",
    ctaLabel: "Resolve",
    href: "/compliance/everify",
  },
  {
    id: "alert-ca-wage",
    severity: "warning",
    description: "California minimum wage posters and rate tables need the 2026 update.",
    affectedEmployees: ["California employees"],
    dueDate: "2026-06-15",
    ctaLabel: "Resolve",
    href: "/compliance/labor-law",
  },
  {
    id: "alert-aca-corrections",
    severity: "info",
    description: "ACA 1095-C correction review window opens for employees with changed coverage.",
    affectedEmployees: ["Benefits Team"],
    dueDate: "2026-07-15",
    ctaLabel: "Resolve",
    href: "/compliance/aca",
  },
  {
    id: "alert-fmla-usage",
    severity: "info",
    description: "FMLA usage is approaching internal review threshold in Customer Support.",
    affectedEmployees: ["Customer Support"],
    dueDate: "2026-07-18",
    ctaLabel: "Resolve",
    href: "/compliance/labor-law",
  },
];

export const complianceFilingDeadlines: ComplianceFilingDeadline[] = [
  {
    id: "filing-eeo1-2025",
    type: "EEO-1",
    title: "EEO-1 Component 1 certification",
    jurisdiction: "Federal",
    dueDate: "2026-06-24",
    owner: "People Ops",
    status: "needs_review",
  },
  {
    id: "filing-ca-payroll-q2",
    type: "State filing",
    title: "California Q2 wage reconciliation",
    jurisdiction: "CA",
    dueDate: "2026-06-30",
    owner: "Payroll",
    status: "ready",
  },
  {
    id: "filing-ny-paid-leave",
    type: "State filing",
    title: "New York paid leave contribution review",
    jurisdiction: "NY",
    dueDate: "2026-07-05",
    owner: "Benefits",
    status: "needs_review",
  },
  {
    id: "filing-aca-corrections",
    type: "ACA 1094-C",
    title: "ACA 1094-C / 1095-C correction packet",
    jurisdiction: "Federal",
    dueDate: "2026-07-15",
    owner: "Benefits",
    status: "not_started",
  },
  {
    id: "filing-osha-midyear",
    type: "OSHA 300A",
    title: "OSHA 300/301 midyear audit",
    jurisdiction: "Federal",
    dueDate: "2026-07-29",
    owner: "Operations",
    status: "needs_review",
  },
  {
    id: "filing-form-941-q2",
    type: "Tax forms",
    title: "Form 941 Q2 payroll tax return",
    jurisdiction: "Federal",
    dueDate: "2026-07-31",
    owner: "Payroll",
    status: "not_started",
  },
];

export const complianceStatusCards: ComplianceStatusCard[] = [
  {
    id: "status-i9",
    label: "I-9 Compliance",
    metric: "82% valid",
    status: "risk",
    description: "8 complete, 2 expired, 1 expiring, 1 not started",
    href: "/compliance/i9",
  },
  {
    id: "status-everify",
    label: "E-Verify Status",
    metric: "9/12 authorized",
    status: "attention",
    description: "One tentative nonconfirmation and one case in continuance",
    href: "/compliance/everify",
  },
  {
    id: "status-eeo1",
    label: "EEO-1 Reporting",
    metric: "2 issues",
    status: "risk",
    description: "Headcount mismatch and missing self-identification responses",
    href: "/compliance/eeo1",
  },
  {
    id: "status-osha",
    label: "OSHA Log",
    metric: "4 recordables",
    status: "attention",
    description: "300A archive evidence required for one office",
    href: "/compliance/osha",
  },
  {
    id: "status-aca",
    label: "ACA Filing",
    metric: "ALE: yes",
    status: "healthy",
    description: "1094-C summary ready, 1095-C correction review pending",
    href: "/compliance/aca",
  },
  {
    id: "status-fmla",
    label: "FMLA Usage",
    metric: "7 active",
    status: "attention",
    description: "Customer Support is near internal coverage threshold",
    href: "/compliance/labor-law",
  },
];

export function sortComplianceAlerts(alerts: ComplianceAlertItem[]) {
  const severityOrder: Record<ComplianceSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...alerts].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function calculateComplianceHealthScore(alerts: ComplianceAlertItem[]) {
  const weights: Record<ComplianceSeverity, number> = {
    critical: 16,
    warning: 7,
    info: 2,
  };
  const penalty = alerts.reduce((total, alert) => total + weights[alert.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export type I9SectionStatus = "Complete" | "Pending" | "Not started";
export type I9Status =
  | "Complete"
  | "Pending Section 2"
  | "Expiring Soon"
  | "Expired"
  | "Not Started";

export interface I9ManagementRecord {
  id: string;
  employeeId: string;
  employee: string;
  role: string;
  department: string;
  hireDate: string;
  section1Status: I9SectionStatus;
  section2Status: I9SectionStatus;
  documentType: string;
  documentList: "List A" | "List B + C" | "Pending";
  expiryDate?: string;
  reverifyDate?: string;
  status: I9Status;
  eVerifyEnabled: boolean;
}

export const i9ManagementRecords: I9ManagementRecord[] = [
  {
    id: "i9-maria",
    employeeId: "EMP-1042",
    employee: "Maria Santos",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    hireDate: "2021-03-15",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "Employment Authorization Document",
    documentList: "List A",
    expiryDate: "2026-05-20",
    reverifyDate: "2026-05-31",
    status: "Expired",
    eVerifyEnabled: true,
  },
  {
    id: "i9-james",
    employeeId: "EMP-1063",
    employee: "James Liu",
    role: "Finance Manager",
    department: "Finance",
    hireDate: "2022-06-20",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "Employment Authorization Document",
    documentList: "List A",
    expiryDate: "2026-05-12",
    reverifyDate: "2026-05-31",
    status: "Expired",
    eVerifyEnabled: true,
  },
  {
    id: "i9-aisha",
    employeeId: "EMP-1089",
    employee: "Aisha Johnson",
    role: "Growth Marketing Lead",
    department: "Marketing",
    hireDate: "2023-01-10",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "Employment Authorization Document",
    documentList: "List A",
    expiryDate: "2026-06-18",
    reverifyDate: "2026-06-18",
    status: "Expiring Soon",
    eVerifyEnabled: true,
  },
  {
    id: "i9-robert",
    employeeId: "EMP-1012",
    employee: "Robert Chen",
    role: "Platform Engineer",
    department: "Engineering",
    hireDate: "2020-08-03",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "U.S. Passport",
    documentList: "List A",
    status: "Complete",
    eVerifyEnabled: true,
  },
  {
    id: "i9-sarah",
    employeeId: "EMP-1098",
    employee: "Sarah Williams",
    role: "People Partner",
    department: "People",
    hireDate: "2023-07-15",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "U.S. Passport Card",
    documentList: "List A",
    status: "Complete",
    eVerifyEnabled: true,
  },
  {
    id: "i9-david",
    employeeId: "EMP-1105",
    employee: "David Martinez",
    role: "Account Executive",
    department: "Sales",
    hireDate: "2024-01-08",
    section1Status: "Complete",
    section2Status: "Complete",
    documentType: "Driver license + Social Security card",
    documentList: "List B + C",
    status: "Complete",
    eVerifyEnabled: true,
  },
  {
    id: "i9-lisa",
    employeeId: "EMP-1140",
    employee: "Lisa Thompson",
    role: "Customer Support Specialist",
    department: "Support",
    hireDate: "2026-05-27",
    section1Status: "Complete",
    section2Status: "Pending",
    documentType: "Awaiting document inspection",
    documentList: "Pending",
    status: "Pending Section 2",
    eVerifyEnabled: true,
  },
  {
    id: "i9-raj",
    employeeId: "EMP-1135",
    employee: "Raj Patel",
    role: "Product Analyst",
    department: "Product",
    hireDate: "2026-05-29",
    section1Status: "Not started",
    section2Status: "Not started",
    documentType: "Not collected",
    documentList: "Pending",
    status: "Not Started",
    eVerifyEnabled: false,
  },
];

export type EVerifyCaseStatus =
  | "Authorized"
  | "Tentative Nonconfirmation"
  | "Case in Continuance"
  | "Final Nonconfirmation";

export interface EVerifyCase {
  id: string;
  employee: string;
  employeeId: string;
  caseNumber: string;
  submittedDate: string;
  status: EVerifyCaseStatus;
  nextAction: string;
  webhookUpdatedAt: string;
}

export const eVerifyCases: EVerifyCase[] = [
  {
    id: "ev-robert",
    employee: "Robert Chen",
    employeeId: "EMP-1012",
    caseNumber: "EV-2020-44231",
    submittedDate: "2020-08-04",
    status: "Authorized",
    nextAction: "No action required",
    webhookUpdatedAt: "2026-05-28T14:20:00Z",
  },
  {
    id: "ev-maria",
    employee: "Maria Santos",
    employeeId: "EMP-1042",
    caseNumber: "EV-2021-38745",
    submittedDate: "2021-03-16",
    status: "Authorized",
    nextAction: "Reverification due after document renewal",
    webhookUpdatedAt: "2026-05-28T17:10:00Z",
  },
  {
    id: "ev-lisa",
    employee: "Lisa Thompson",
    employeeId: "EMP-1140",
    caseNumber: "EV-2026-55102",
    submittedDate: "2026-05-28",
    status: "Tentative Nonconfirmation",
    nextAction: "Provide Further Action Notice and record employee decision",
    webhookUpdatedAt: "2026-05-30T07:45:00Z",
  },
  {
    id: "ev-raj",
    employee: "Raj Patel",
    employeeId: "EMP-1135",
    caseNumber: "EV-2026-55118",
    submittedDate: "2026-05-29",
    status: "Case in Continuance",
    nextAction: "Await USCIS case update webhook",
    webhookUpdatedAt: "2026-05-30T08:10:00Z",
  },
  {
    id: "ev-james",
    employee: "James Liu",
    employeeId: "EMP-1063",
    caseNumber: "EV-2022-50128",
    submittedDate: "2022-06-21",
    status: "Authorized",
    nextAction: "No action required",
    webhookUpdatedAt: "2026-05-29T19:12:00Z",
  },
  {
    id: "ev-test-final",
    employee: "Archived case sample",
    employeeId: "EMP-0991",
    caseNumber: "EV-2025-88219",
    submittedDate: "2025-10-04",
    status: "Final Nonconfirmation",
    nextAction: "Closed after compliance review",
    webhookUpdatedAt: "2025-10-14T16:05:00Z",
  },
];

export type EEOJobCategory =
  | "Executive/Senior Level Officials and Managers"
  | "First/Mid-Level Officials and Managers"
  | "Professionals"
  | "Technicians"
  | "Sales Workers"
  | "Administrative Support Workers"
  | "Craft Workers"
  | "Operatives"
  | "Laborers and Helpers"
  | "Service Workers";

export type EEORaceEthnicity =
  | "Hispanic or Latino"
  | "White"
  | "Black or African American"
  | "Native Hawaiian or Other Pacific Islander"
  | "Asian"
  | "American Indian or Alaska Native"
  | "Two or More Races";

export interface EEO1Row {
  jobCategory: EEOJobCategory;
  counts: Record<EEORaceEthnicity, { male: number; female: number }>;
}

export const eeo1RaceEthnicities: EEORaceEthnicity[] = [
  "Hispanic or Latino",
  "White",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "Asian",
  "American Indian or Alaska Native",
  "Two or More Races",
];

export const eeo1Rows: EEO1Row[] = [
  {
    jobCategory: "Executive/Senior Level Officials and Managers",
    counts: {
      "Hispanic or Latino": { male: 0, female: 0 },
      White: { male: 1, female: 1 },
      "Black or African American": { male: 0, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 1, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "First/Mid-Level Officials and Managers",
    counts: {
      "Hispanic or Latino": { male: 1, female: 0 },
      White: { male: 3, female: 2 },
      "Black or African American": { male: 1, female: 1 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 2, female: 1 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Professionals",
    counts: {
      "Hispanic or Latino": { male: 2, female: 1 },
      White: { male: 6, female: 4 },
      "Black or African American": { male: 2, female: 2 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 5, female: 3 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 1, female: 1 },
    },
  },
  {
    jobCategory: "Technicians",
    counts: {
      "Hispanic or Latino": { male: 1, female: 0 },
      White: { male: 2, female: 1 },
      "Black or African American": { male: 1, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 1, female: 1 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Sales Workers",
    counts: {
      "Hispanic or Latino": { male: 1, female: 1 },
      White: { male: 3, female: 2 },
      "Black or African American": { male: 1, female: 1 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 1, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Administrative Support Workers",
    counts: {
      "Hispanic or Latino": { male: 1, female: 2 },
      White: { male: 2, female: 3 },
      "Black or African American": { male: 1, female: 2 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 1, female: 1 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 1 },
    },
  },
  {
    jobCategory: "Craft Workers",
    counts: {
      "Hispanic or Latino": { male: 0, female: 0 },
      White: { male: 0, female: 0 },
      "Black or African American": { male: 0, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 0, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Operatives",
    counts: {
      "Hispanic or Latino": { male: 0, female: 0 },
      White: { male: 0, female: 0 },
      "Black or African American": { male: 0, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 0, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Laborers and Helpers",
    counts: {
      "Hispanic or Latino": { male: 0, female: 0 },
      White: { male: 0, female: 0 },
      "Black or African American": { male: 0, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 0, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
  {
    jobCategory: "Service Workers",
    counts: {
      "Hispanic or Latino": { male: 0, female: 0 },
      White: { male: 0, female: 0 },
      "Black or African American": { male: 0, female: 0 },
      "Native Hawaiian or Other Pacific Islander": { male: 0, female: 0 },
      Asian: { male: 0, female: 0 },
      "American Indian or Alaska Native": { male: 0, female: 0 },
      "Two or More Races": { male: 0, female: 0 },
    },
  },
];

export const eeo1DemographicCollection = {
  requested: 142,
  completed: 116,
  missing: 26,
  lastEmailSent: "2026-05-28",
  subject: "Voluntary self-identification request",
};

export const eeo1ValidationIssues = [
  "Total EEO-1 headcount differs from active HRIS headcount by 2 employees.",
  "26 employees have not completed voluntary self-identification.",
];

export function getEEO1RowTotal(row: EEO1Row) {
  return eeo1RaceEthnicities.reduce((total, race) => {
    const cell = row.counts[race];
    return total + cell.male + cell.female;
  }, 0);
}

export function getEEO1TotalHeadcount() {
  return eeo1Rows.reduce((total, row) => total + getEEO1RowTotal(row), 0);
}

export type OSHAIncidentType = "Injury" | "Illness";

export interface OSHAIncident {
  id: string;
  date: string;
  employee: string;
  description: string;
  type: OSHAIncidentType;
  treatment: string;
  restrictedDays: number;
  lostDays: number;
  daysAway: number;
  recordable: boolean;
}

export const oshaIncidents: OSHAIncident[] = [
  {
    id: "osha-1",
    date: "2026-01-18",
    employee: "Kevin O'Brien",
    description: "Wrist strain while moving equipment in Austin office.",
    type: "Injury",
    treatment: "Medical treatment beyond first aid",
    restrictedDays: 5,
    lostDays: 0,
    daysAway: 0,
    recordable: true,
  },
  {
    id: "osha-2",
    date: "2026-02-09",
    employee: "Aisha Johnson",
    description: "Slip in lobby, evaluated onsite with first aid only.",
    type: "Injury",
    treatment: "First aid",
    restrictedDays: 0,
    lostDays: 0,
    daysAway: 0,
    recordable: false,
  },
  {
    id: "osha-3",
    date: "2026-03-21",
    employee: "Robert Chen",
    description: "Work-related respiratory irritation during facilities inspection.",
    type: "Illness",
    treatment: "Prescription medication",
    restrictedDays: 2,
    lostDays: 1,
    daysAway: 1,
    recordable: true,
  },
  {
    id: "osha-4",
    date: "2026-04-14",
    employee: "Sarah Williams",
    description: "Ergonomic injury requiring job transfer restrictions.",
    type: "Injury",
    treatment: "Physical therapy",
    restrictedDays: 8,
    lostDays: 0,
    daysAway: 0,
    recordable: true,
  },
  {
    id: "osha-5",
    date: "2026-05-19",
    employee: "David Martinez",
    description: "Travel-related fall during sales event setup.",
    type: "Injury",
    treatment: "Medical treatment beyond first aid",
    restrictedDays: 0,
    lostDays: 2,
    daysAway: 2,
    recordable: true,
  },
];

export function getOsha300ASummary(incidents = oshaIncidents) {
  const recordables = incidents.filter((incident) => incident.recordable);
  return {
    year: 2026,
    recordableCases: recordables.length,
    injuries: recordables.filter((incident) => incident.type === "Injury").length,
    illnesses: recordables.filter((incident) => incident.type === "Illness").length,
    totalDaysAway: recordables.reduce((total, incident) => total + incident.daysAway, 0),
    totalRestrictedDays: recordables.reduce((total, incident) => total + incident.restrictedDays, 0),
    postingReminder: "Post certified OSHA 300A summary from February 1 through April 30.",
  };
}

export interface ACAFteMonth {
  month: string;
  fullTime: number;
  partTimeHours: number;
  fte: number;
}

export interface ACA1095CEmployee {
  id: string;
  employee: string;
  employeeId: string;
  coverageMonths: string;
  line14: string;
  line15: string;
  line16: string;
  status: "Generated" | "Needs review" | "Ready";
}

export const acaFteMonths: ACAFteMonth[] = [
  { month: "Jan", fullTime: 49, partTimeHours: 192, fte: 55.4 },
  { month: "Feb", fullTime: 50, partTimeHours: 180, fte: 56 },
  { month: "Mar", fullTime: 51, partTimeHours: 176, fte: 56.9 },
  { month: "Apr", fullTime: 52, partTimeHours: 168, fte: 57.6 },
  { month: "May", fullTime: 53, partTimeHours: 160, fte: 58.3 },
  { month: "Jun", fullTime: 54, partTimeHours: 156, fte: 59.2 },
  { month: "Jul", fullTime: 55, partTimeHours: 150, fte: 60 },
  { month: "Aug", fullTime: 55, partTimeHours: 144, fte: 59.8 },
  { month: "Sep", fullTime: 56, partTimeHours: 138, fte: 60.6 },
  { month: "Oct", fullTime: 56, partTimeHours: 132, fte: 60.4 },
  { month: "Nov", fullTime: 57, partTimeHours: 120, fte: 61 },
  { month: "Dec", fullTime: 57, partTimeHours: 126, fte: 61.2 },
];

export const aca1095CEmployees: ACA1095CEmployee[] = [
  {
    id: "aca-robert",
    employee: "Robert Chen",
    employeeId: "EMP-1012",
    coverageMonths: "Jan-Dec",
    line14: "1A",
    line15: "$0.00",
    line16: "2C",
    status: "Ready",
  },
  {
    id: "aca-maria",
    employee: "Maria Santos",
    employeeId: "EMP-1042",
    coverageMonths: "Jan-Dec",
    line14: "1A",
    line15: "$0.00",
    line16: "2C",
    status: "Ready",
  },
  {
    id: "aca-lisa",
    employee: "Lisa Thompson",
    employeeId: "EMP-1140",
    coverageMonths: "Jun-Dec",
    line14: "1E",
    line15: "$142.40",
    line16: "2H",
    status: "Needs review",
  },
  {
    id: "aca-raj",
    employee: "Raj Patel",
    employeeId: "EMP-1135",
    coverageMonths: "Jun-Dec",
    line14: "1E",
    line15: "$142.40",
    line16: "2D",
    status: "Generated",
  },
  {
    id: "aca-sarah",
    employee: "Sarah Williams",
    employeeId: "EMP-1098",
    coverageMonths: "Jan-Dec",
    line14: "1A",
    line15: "$0.00",
    line16: "2C",
    status: "Ready",
  },
];

export const acaEmployerSummary1094C = {
  employer: "CircleWorks Demo",
  ein: "12-3456789",
  total1095CForms: 142,
  fullTimeEmployeeCount: 118,
  totalEmployeeCount: 142,
  aleMember: true,
  filingDeadline: "2027-03-31",
};

export function calculateAverageFte(months = acaFteMonths) {
  return Number((months.reduce((total, month) => total + month.fte, 0) / months.length).toFixed(1));
}

export type LaborChecklistStatus = "Compliant" | "Needs review" | "At risk";

export interface LaborLawChecklistItem {
  id: string;
  state: "CA" | "NY" | "TX";
  stateName: string;
  topic: "Minimum wage" | "Overtime" | "Break requirements" | "Paid leave" | "Poster requirements";
  requirement: string;
  status: LaborChecklistStatus;
  owner: string;
}

export const laborLawChecklist: LaborLawChecklistItem[] = [
  {
    id: "ca-min-wage",
    state: "CA",
    stateName: "California",
    topic: "Minimum wage",
    requirement: "$16.90/hour statewide effective January 1, 2026.",
    status: "Needs review",
    owner: "Payroll",
  },
  {
    id: "ca-overtime",
    state: "CA",
    stateName: "California",
    topic: "Overtime",
    requirement: "Daily and weekly overtime rules tracked against time punches.",
    status: "Compliant",
    owner: "Time Admin",
  },
  {
    id: "ca-breaks",
    state: "CA",
    stateName: "California",
    topic: "Break requirements",
    requirement: "Meal and rest break attestations required for hourly teams.",
    status: "Needs review",
    owner: "Operations",
  },
  {
    id: "ca-paid-leave",
    state: "CA",
    stateName: "California",
    topic: "Paid leave",
    requirement: "Paid sick leave accrual and state leave overlays enabled.",
    status: "Compliant",
    owner: "Benefits",
  },
  {
    id: "ca-posters",
    state: "CA",
    stateName: "California",
    topic: "Poster requirements",
    requirement: "2026 wage order poster pending distribution to remote workers.",
    status: "At risk",
    owner: "People Ops",
  },
  {
    id: "ny-min-wage",
    state: "NY",
    stateName: "New York",
    topic: "Minimum wage",
    requirement: "$17.00/hour in NYC, Long Island, and Westchester; $16.00/hour elsewhere in 2026.",
    status: "Compliant",
    owner: "Payroll",
  },
  {
    id: "ny-overtime",
    state: "NY",
    stateName: "New York",
    topic: "Overtime",
    requirement: "Weekly overtime controls reviewed against state wage orders.",
    status: "Compliant",
    owner: "Time Admin",
  },
  {
    id: "ny-breaks",
    state: "NY",
    stateName: "New York",
    topic: "Break requirements",
    requirement: "Meal period policy acknowledgment due for two locations.",
    status: "Needs review",
    owner: "Operations",
  },
  {
    id: "ny-paid-leave",
    state: "NY",
    stateName: "New York",
    topic: "Paid leave",
    requirement: "Paid family leave contribution rates configured.",
    status: "Compliant",
    owner: "Benefits",
  },
  {
    id: "ny-posters",
    state: "NY",
    stateName: "New York",
    topic: "Poster requirements",
    requirement: "Digital poster acknowledgment campaign is 91% complete.",
    status: "Needs review",
    owner: "People Ops",
  },
  {
    id: "tx-min-wage",
    state: "TX",
    stateName: "Texas",
    topic: "Minimum wage",
    requirement: "State minimum wage follows federal FLSA-covered worker rules.",
    status: "Compliant",
    owner: "Payroll",
  },
  {
    id: "tx-overtime",
    state: "TX",
    stateName: "Texas",
    topic: "Overtime",
    requirement: "Federal overtime policy applied after 40 hours in a workweek.",
    status: "Compliant",
    owner: "Time Admin",
  },
  {
    id: "tx-breaks",
    state: "TX",
    stateName: "Texas",
    topic: "Break requirements",
    requirement: "No additional state meal break policy required; company policy applies.",
    status: "Compliant",
    owner: "Operations",
  },
  {
    id: "tx-paid-leave",
    state: "TX",
    stateName: "Texas",
    topic: "Paid leave",
    requirement: "Company PTO policy and local ordinances reviewed.",
    status: "Compliant",
    owner: "Benefits",
  },
  {
    id: "tx-posters",
    state: "TX",
    stateName: "Texas",
    topic: "Poster requirements",
    requirement: "Payday law and workers' compensation notices current.",
    status: "Compliant",
    owner: "People Ops",
  },
];

export interface FederalLawSummary {
  id: string;
  acronym: "FLSA" | "FMLA" | "ADA" | "Title VII" | "ADEA" | "NLRA";
  name: string;
  description: string;
  complianceNotes: string;
  sourceUrl: string;
}

export const federalLawSummaries: FederalLawSummary[] = [
  {
    id: "law-flsa",
    acronym: "FLSA",
    name: "Fair Labor Standards Act",
    description: "Sets federal minimum wage, overtime, child labor, and recordkeeping standards.",
    complianceNotes: "Review exempt classifications, overtime calculations, payroll records, and poster placement.",
    sourceUrl: "https://www.dol.gov/agencies/whd/flsa",
  },
  {
    id: "law-fmla",
    acronym: "FMLA",
    name: "Family and Medical Leave Act",
    description: "Provides eligible employees with job-protected leave for qualifying family and medical reasons.",
    complianceNotes: "Track eligibility, notices, certifications, restoration rights, and required posting.",
    sourceUrl: "https://www.dol.gov/agencies/whd/fmla/employer-guide",
  },
  {
    id: "law-ada",
    acronym: "ADA",
    name: "Americans with Disabilities Act",
    description: "Prohibits disability discrimination and requires reasonable accommodation processes.",
    complianceNotes: "Maintain interactive process documentation and accommodation request workflows.",
    sourceUrl: "https://www.eeoc.gov/eeoc-disability-related-resources/laws-and-regulations-related-disability-discrimination",
  },
  {
    id: "law-title-vii",
    acronym: "Title VII",
    name: "Civil Rights Act of 1964",
    description: "Prohibits employment discrimination based on race, color, religion, sex, and national origin.",
    complianceNotes: "Audit hiring, pay, promotion, discipline, training, and complaint investigation records.",
    sourceUrl: "https://www.eeoc.gov/statutes/title-vii-civil-rights-act-1964",
  },
  {
    id: "law-adea",
    acronym: "ADEA",
    name: "Age Discrimination in Employment Act",
    description: "Protects workers and applicants who are 40 or older from age discrimination.",
    complianceNotes: "Review layoff, promotion, recruiting, and benefits practices for age-related risk.",
    sourceUrl: "https://www.eeoc.gov/publications/get-facts-series-small-business-information",
  },
  {
    id: "law-nlra",
    acronym: "NLRA",
    name: "National Labor Relations Act",
    description: "Protects employee rights to organize, bargain collectively, and engage in protected concerted activity.",
    complianceNotes: "Review handbook, social media, confidentiality, and workplace conduct policies.",
    sourceUrl: "https://www.nlrb.gov/about-nlrb/rights-we-protect/your-rights/employee-rights",
  },
];

export const complianceReferenceLinks = [
  {
    label: "USCIS Form I-9 and E-Verify",
    href: "https://www.uscis.gov/i-9",
  },
  {
    label: "EEOC EEO-1 Component 1",
    href: "https://www.eeoc.gov/eeo-data-collections",
  },
  {
    label: "OSHA Forms 300, 300A, and 301",
    href: "https://www.osha.gov/recordkeeping/RKforms.html",
  },
  {
    label: "IRS Forms 1094-C and 1095-C",
    href: "https://www.irs.gov/instructions/i109495c",
  },
  {
    label: "DOL Wage and Hour",
    href: "https://www.dol.gov/general/topic/wages",
  },
];
