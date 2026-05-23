export const categories = [
  "All",
  "Accounting",
  "HR & ATS",
  "Identity & SSO",
  "Benefits",
  "Communication",
  "Background Check",
  "Banking",
  "Insurance",
  "Signing",
] as const;

export type IntegrationCategory = Exclude<(typeof categories)[number], "All">;
export type IntegrationStatus = "Connected" | "Connect";

export type Integration = {
  id: number;
  name: string;
  cat: IntegrationCategory;
  desc: string;
  status: IntegrationStatus;
  logo: string;
  color: string;
  featured?: boolean;
  featuredDesc?: string;
  requirements: string;
  benefits: string[];
  setupSteps: string[];
};

export const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const defaultBenefits = (name: string, category: IntegrationCategory) => [
  `Sync ${category.toLowerCase()} data between ${name} and CircleWorks automatically.`,
  "Reduce duplicate entry, re-keying, and downstream payroll corrections.",
  "Keep HR, payroll, finance, and compliance workflows aligned in one place.",
  "Give admins a clearer audit trail for every synced employee update.",
];

const defaultSetupSteps = (name: string) => [
  `Open Settings > Integrations in CircleWorks and choose ${name}.`,
  `Authorize CircleWorks inside your ${name} account using the secure connection flow.`,
  "Map fields, choose sync direction, and review the previewed employee records.",
  "Turn on the integration and monitor the first sync from the activity log.",
];

export const integrations: Integration[] = [
  {
    id: 1,
    name: "QuickBooks",
    cat: "Accounting",
    desc: "Sync payroll journal entries automatically",
    status: "Connected",
    logo: "QB",
    color: "#2CA01C",
    featured: true,
    featuredDesc: "Sync payroll journal entries automatically",
    requirements: "Requires Pro or Enterprise",
    benefits: [
      "Post payroll journal entries to QuickBooks as soon as payroll is approved.",
      "Map wage, tax, benefit, and reimbursement accounts once and reuse them every run.",
      "Reduce finance close time with cleaner GL exports and fewer manual adjustments.",
      "Preserve a searchable sync log for every payroll batch.",
    ],
    setupSteps: defaultSetupSteps("QuickBooks"),
  },
  {
    id: 2,
    name: "Slack",
    cat: "Communication",
    desc: "Payroll approvals and HR alerts in Slack",
    status: "Connected",
    logo: "S",
    color: "#4A154B",
    featured: true,
    featuredDesc: "Payroll approvals and HR alerts in Slack",
    requirements: "Requires Pro or Enterprise",
    benefits: [
      "Route payroll approvals, onboarding reminders, and compliance alerts to the right Slack channels.",
      "Let managers take action from Slack without digging through email threads.",
      "Keep sensitive payroll updates permission-aware by role and workspace group.",
      "Create a faster feedback loop for HR tasks that need attention today.",
    ],
    setupSteps: defaultSetupSteps("Slack"),
  },
  {
    id: 3,
    name: "Okta",
    cat: "Identity & SSO",
    desc: "SSO + auto provision/deprovision users",
    status: "Connected",
    logo: "OK",
    color: "#007DC1",
    featured: true,
    featuredDesc: "SSO + auto provision/deprovision users",
    requirements: "Requires Pro or Enterprise",
    benefits: [
      "Enable SSO for admins, managers, employees, and contractors.",
      "Provision and deprovision CircleWorks users from Okta lifecycle events.",
      "Apply role-based access based on Okta groups and department metadata.",
      "Strengthen audit readiness with centralized identity controls.",
    ],
    setupSteps: defaultSetupSteps("Okta"),
  },
  {
    id: 4,
    name: "Xero",
    cat: "Accounting",
    desc: "Export general ledger summaries instantly.",
    status: "Connect",
    logo: "X",
    color: "#13B5EA",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Xero", "Accounting"),
    setupSteps: defaultSetupSteps("Xero"),
  },
  {
    id: 5,
    name: "Google Workspace",
    cat: "Identity & SSO",
    desc: "Automated account creation during onboarding.",
    status: "Connect",
    logo: "G",
    color: "#4285F4",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Google Workspace", "Identity & SSO"),
    setupSteps: defaultSetupSteps("Google Workspace"),
  },
  {
    id: 6,
    name: "Microsoft Teams",
    cat: "Communication",
    desc: "Approve expenses and PTO directly from chat.",
    status: "Connect",
    logo: "T",
    color: "#6264A7",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Microsoft Teams", "Communication"),
    setupSteps: defaultSetupSteps("Microsoft Teams"),
  },
  {
    id: 7,
    name: "Guideline 401(k)",
    cat: "Benefits",
    desc: "360-degree integration for retirement contributions.",
    status: "Connect",
    logo: "GL",
    color: "#00B386",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Guideline 401(k)", "Benefits"),
    setupSteps: defaultSetupSteps("Guideline 401(k)"),
  },
  {
    id: 8,
    name: "Human Interest",
    cat: "Benefits",
    desc: "Automate 401(k) deductions natively.",
    status: "Connect",
    logo: "HI",
    color: "#FF3366",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Human Interest", "Benefits"),
    setupSteps: defaultSetupSteps("Human Interest"),
  },
  {
    id: 9,
    name: "Brex",
    cat: "Banking",
    desc: "Sync company cards and employee expenses.",
    status: "Connect",
    logo: "B",
    color: "#222222",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Brex", "Banking"),
    setupSteps: defaultSetupSteps("Brex"),
  },
  {
    id: 10,
    name: "Ramp",
    cat: "Banking",
    desc: "Seamless corporate card reconciliation.",
    status: "Connect",
    logo: "R",
    color: "#000000",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Ramp", "Banking"),
    setupSteps: defaultSetupSteps("Ramp"),
  },
  {
    id: 11,
    name: "Greenhouse",
    cat: "HR & ATS",
    desc: "Push hired candidates directly into payroll.",
    status: "Connect",
    logo: "GH",
    color: "#24A47F",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Greenhouse", "HR & ATS"),
    setupSteps: defaultSetupSteps("Greenhouse"),
  },
  {
    id: 12,
    name: "Lever",
    cat: "HR & ATS",
    desc: "Automated new hire data sync.",
    status: "Connect",
    logo: "L",
    color: "#00ADFF",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Lever", "HR & ATS"),
    setupSteps: defaultSetupSteps("Lever"),
  },
  {
    id: 13,
    name: "Checkr",
    cat: "Background Check",
    desc: "Trigger background checks from the offer stage.",
    status: "Connect",
    logo: "C",
    color: "#1B9CFC",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Checkr", "Background Check"),
    setupSteps: defaultSetupSteps("Checkr"),
  },
  {
    id: 14,
    name: "Gusto",
    cat: "Accounting",
    desc: "Migrate historical payroll data effortlessly via API.",
    status: "Connect",
    logo: "G",
    color: "#FF5C39",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("Gusto", "Accounting"),
    setupSteps: defaultSetupSteps("Gusto"),
  },
  {
    id: 15,
    name: "SimplyInsured",
    cat: "Insurance",
    desc: "Sync medical, dental, and vision deductions.",
    status: "Connect",
    logo: "SI",
    color: "#2E5BFF",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("SimplyInsured", "Insurance"),
    setupSteps: defaultSetupSteps("SimplyInsured"),
  },
  {
    id: 16,
    name: "DocuSign",
    cat: "Signing",
    desc: "Automate form signing during onboarding.",
    status: "Connect",
    logo: "DS",
    color: "#FFCD00",
    requirements: "Requires Pro or Enterprise",
    benefits: defaultBenefits("DocuSign", "Signing"),
    setupSteps: defaultSetupSteps("DocuSign"),
  },
];
