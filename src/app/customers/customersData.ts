export const CUSTOMER_FILTERS = [
  "All",
  "Startups",
  "SMBs",
  "Mid-Market",
  "Enterprise",
  "Tech",
  "Healthcare",
  "Retail",
  "Non-Profit",
] as const;

export type CustomerFilter = (typeof CUSTOMER_FILTERS)[number];
export type CustomerSegment = "Startups" | "SMBs" | "Mid-Market" | "Enterprise";
export type CustomerIndustry =
  | "Technology"
  | "Healthcare"
  | "Retail"
  | "Non-Profit"
  | "Logistics"
  | "Education";

export type CustomerMetric = {
  value: string;
  label: string;
  detail?: string;
};

export type SolutionModule = {
  name: string;
  description: string;
};

export type CustomerStory = {
  slug: string;
  company: string;
  logoWordmark: string;
  logoInitials: string;
  logoColor: string;
  logoTextColor: string;
  industry: CustomerIndustry;
  segment: CustomerSegment;
  size: string;
  customerSince: string;
  location: string;
  filters: CustomerFilter[];
  featured?: boolean;
  quoteExcerpt: string;
  attribution: {
    name: string;
    title: string;
    company: string;
    initials: string;
  };
  keyMetrics: [string, string, string];
  challengePainPoints: [string, string, string];
  solutionModules: SolutionModule[];
  results: [CustomerMetric, CustomerMetric, CustomerMetric];
  fullQuote: string;
};

export const CUSTOMER_STORIES: CustomerStory[] = [
  {
    slug: "meridian-health",
    company: "Meridian Health",
    logoWordmark: "Meridian",
    logoInitials: "MH",
    logoColor: "#059669",
    logoTextColor: "#064E3B",
    industry: "Healthcare",
    segment: "Mid-Market",
    size: "200 employees",
    customerSince: "March 2022",
    location: "Chicago, IL",
    filters: ["Mid-Market", "Healthcare"],
    featured: true,
    quoteExcerpt:
      "CircleWorks turned a multi-state payroll process that took two days into a guided workflow our team finishes before lunch.",
    attribution: {
      name: "Avery Morgan",
      title: "VP People Operations",
      company: "Meridian Health",
      initials: "AM",
    },
    keyMetrics: ["90% faster payroll", "12 states", "200 employees"],
    challengePainPoints: [
      "Payroll admins reconciled shift differentials and tax rules manually across 12 states.",
      "Quarterly filings required three spreadsheets, two outside advisors, and several late nights.",
      "HR could not give leaders a dependable view of headcount, benefits, and payroll costs.",
    ],
    solutionModules: [
      {
        name: "Payroll",
        description:
          "Automated multi-state taxes, shift premiums, and direct deposit approvals in one run flow.",
      },
      {
        name: "HRIS",
        description:
          "Centralized employee records, job changes, and reporting for clinic and corporate teams.",
      },
      {
        name: "Compliance",
        description:
          "Surfaced state-specific filing tasks and renewal dates before they became finance escalations.",
      },
    ],
    results: [
      {
        value: "90%",
        label: "Time Saved on Payroll",
        detail: "Two-day payroll prep compressed into a same-morning approval workflow.",
      },
      {
        value: "12",
        label: "States Now Automated",
        detail: "State taxes, labor rules, and filings now route without spreadsheet reconciliation.",
      },
      {
        value: "$48K",
        label: "Saved Annually",
        detail: "Reduced advisor hours, late corrections, and payroll operations overhead.",
      },
    ],
    fullQuote:
      "CircleWorks helped us replace disconnected payroll, HR, and benefits workflows with one clean operating system. The biggest change is confidence: our team knows every run is accurate before money moves.",
  },
  {
    slug: "arclight-software",
    company: "Arclight Software",
    logoWordmark: "Arclight",
    logoInitials: "AS",
    logoColor: "#2563EB",
    logoTextColor: "#1E3A8A",
    industry: "Technology",
    segment: "Startups",
    size: "48 employees",
    customerSince: "August 2023",
    location: "New York, NY",
    filters: ["Startups", "Tech"],
    featured: true,
    quoteExcerpt:
      "We closed our Series A with clean people data, compliant payroll, and a new-hire experience that felt enterprise-grade.",
    attribution: {
      name: "Sam Hertz",
      title: "CEO and Co-founder",
      company: "Arclight Software",
      initials: "SH",
    },
    keyMetrics: ["48-hour launch", "$12M Series A", "0 HR hires"],
    challengePainPoints: [
      "Founders were running payroll, PTO, and offer letters through disconnected startup tools.",
      "Investor diligence surfaced incomplete I-9 files and inconsistent compensation records.",
      "New hires waited several days for documents, account access, and payroll setup.",
    ],
    solutionModules: [
      {
        name: "Onboarding",
        description:
          "Converted signed offers into Day-1 workflows, document collection, and automated welcome tasks.",
      },
      {
        name: "Payroll",
        description:
          "Set up compliant New York payroll, direct deposit, and founder approvals in two days.",
      },
      {
        name: "ATS",
        description:
          "Connected recruiting stages to offer approvals so every new hire arrived with a complete record.",
      },
    ],
    results: [
      {
        value: "48 hrs",
        label: "To Launch",
        detail: "Arclight went live before the final investor data-room review.",
      },
      {
        value: "$12M",
        label: "Series A Closed",
        detail: "Clean HR documentation became a diligence strength instead of a concern.",
      },
      {
        value: "$0",
        label: "Extra HR Headcount",
        detail: "The founders scaled operations without hiring a full-time HR generalist.",
      },
    ],
    fullQuote:
      "Our lead investor said our people documentation was cleaner than companies ten times our size. CircleWorks gave us the operational credibility we needed without slowing down the team.",
  },
  {
    slug: "northstar-retail-group",
    company: "Northstar Retail Group",
    logoWordmark: "Northstar",
    logoInitials: "NR",
    logoColor: "#DC2626",
    logoTextColor: "#7F1D1D",
    industry: "Retail",
    segment: "Enterprise",
    size: "2,400 employees",
    customerSince: "January 2021",
    location: "Minneapolis, MN",
    filters: ["Enterprise", "Retail"],
    featured: true,
    quoteExcerpt:
      "CircleWorks gave every store manager the same payroll playbook, while corporate finally got one source of truth.",
    attribution: {
      name: "Priya Shah",
      title: "Chief People Officer",
      company: "Northstar Retail Group",
      initials: "PS",
    },
    keyMetrics: ["36 stores", "2,400 employees", "99% on-time payroll"],
    challengePainPoints: [
      "Store managers submitted timesheets in different formats with inconsistent overtime reviews.",
      "Seasonal hiring created duplicate records, missed onboarding steps, and payroll corrections.",
      "Corporate HR lacked a real-time view of staffing levels, labor cost, and compliance risk.",
    ],
    solutionModules: [
      {
        name: "Time Tracking",
        description:
          "Standardized store clock-ins, approvals, and overtime flags before each payroll run.",
      },
      {
        name: "Onboarding",
        description:
          "Automated seasonal employee packets, I-9 reminders, and manager task lists.",
      },
      {
        name: "Analytics",
        description:
          "Gave leaders a live view of labor spend, open roles, and pay-cycle readiness by location.",
      },
    ],
    results: [
      {
        value: "99%",
        label: "On-Time Payroll",
        detail: "Payroll accuracy rose across every store and seasonal hiring cycle.",
      },
      {
        value: "36",
        label: "Stores Standardized",
        detail: "Managers now follow one approval workflow from shift close to payroll submission.",
      },
      {
        value: "$312K",
        label: "Annual Cost Avoided",
        detail: "Fewer corrections, manual reviews, and seasonal onboarding delays.",
      },
    ],
    fullQuote:
      "The value was not just faster payroll. CircleWorks gave us a shared operating rhythm for every store, every manager, and every employee moving through a high-volume retail season.",
  },
  {
    slug: "brightpath-clinics",
    company: "BrightPath Clinics",
    logoWordmark: "BrightPath",
    logoInitials: "BP",
    logoColor: "#0891B2",
    logoTextColor: "#164E63",
    industry: "Healthcare",
    segment: "SMBs",
    size: "140 employees",
    customerSince: "June 2022",
    location: "Nashville, TN",
    filters: ["SMBs", "Healthcare"],
    quoteExcerpt:
      "Credentialing, HIPAA training, benefits, and payroll finally live in the same system.",
    attribution: {
      name: "Dr. James Obi",
      title: "Medical Director",
      company: "BrightPath Clinics",
      initials: "JO",
    },
    keyMetrics: ["0 missed renewals", "100% HIPAA training", "$40K avoided"],
    challengePainPoints: [
      "Provider credentials were tracked in spreadsheets with no reliable renewal alerts.",
      "HIPAA training completion lived outside employee records and was hard to audit.",
      "Clinic managers sent payroll changes by email, creating delays and correction runs.",
    ],
    solutionModules: [
      {
        name: "HRIS",
        description:
          "Stored credentials, renewal dates, clinic assignments, and employee records together.",
      },
      {
        name: "Learning",
        description:
          "Assigned HIPAA training automatically and logged completion in each employee profile.",
      },
      {
        name: "Payroll",
        description:
          "Mapped clinic-level pay changes and shift premiums directly into payroll approvals.",
      },
    ],
    results: [
      {
        value: "0",
        label: "Missed Renewals",
        detail: "Credential alerts are now proactive and visible to clinic leaders.",
      },
      {
        value: "100%",
        label: "Training Completion",
        detail: "HIPAA completion is assigned, tracked, and audit-ready.",
      },
      {
        value: "$40K",
        label: "Fees Avoided",
        detail: "A prior recredentialing issue has not repeated since launch.",
      },
    ],
    fullQuote:
      "The automated credential alerts alone paid for CircleWorks. Our operations team no longer has to chase spreadsheets to understand who is compliant.",
  },
  {
    slug: "nova-community-fund",
    company: "Nova Community Fund",
    logoWordmark: "Nova Fund",
    logoInitials: "NC",
    logoColor: "#DB2777",
    logoTextColor: "#831843",
    industry: "Non-Profit",
    segment: "SMBs",
    size: "34 employees",
    customerSince: "November 2023",
    location: "Denver, CO",
    filters: ["SMBs", "Non-Profit"],
    quoteExcerpt:
      "We cut HR costs and walked into grant audits with cleaner reports than we had ever had.",
    attribution: {
      name: "Angela Price",
      title: "Executive Director",
      company: "Nova Community Fund",
      initials: "AP",
    },
    keyMetrics: ["$28K saved", "2 audits passed", "15 hrs/month reclaimed"],
    challengePainPoints: [
      "Grant reporting required manual headcount and payroll exports from three systems.",
      "Board pressure required a lower-cost HR platform without losing compliance coverage.",
      "The nonprofit's outside CPA had no direct way to pull approved payroll reports.",
    ],
    solutionModules: [
      {
        name: "Reports",
        description:
          "Built reusable grant, payroll, and headcount reports for board and auditor requests.",
      },
      {
        name: "Payroll",
        description:
          "Reduced provider cost while keeping approvals, direct deposit, and tax filing in one place.",
      },
      {
        name: "Accountant Portal",
        description:
          "Gave the CPA controlled access to approved payroll data and exports.",
      },
    ],
    results: [
      {
        value: "$28K",
        label: "Saved Annually",
        detail: "Lower platform and advisor costs freed up program budget.",
      },
      {
        value: "2/2",
        label: "Audits Passed",
        detail: "Grant auditors received consistent payroll and staffing reports.",
      },
      {
        value: "15 hrs",
        label: "Saved Monthly",
        detail: "Recurring reports replaced manual grant reporting prep.",
      },
    ],
    fullQuote:
      "Our board was skeptical that we could cut costs and improve compliance at the same time. CircleWorks made that argument for us with clean reports and calmer audits.",
  },
  {
    slug: "kinetic-ai",
    company: "Kinetic AI",
    logoWordmark: "Kinetic",
    logoInitials: "KA",
    logoColor: "#7C3AED",
    logoTextColor: "#4C1D95",
    industry: "Technology",
    segment: "Mid-Market",
    size: "310 employees",
    customerSince: "April 2022",
    location: "Seattle, WA",
    filters: ["Mid-Market", "Tech"],
    quoteExcerpt:
      "CircleWorks flagged classification risk before it became a legal fire drill.",
    attribution: {
      name: "Claire Nakamura",
      title: "General Counsel",
      company: "Kinetic AI",
      initials: "CN",
    },
    keyMetrics: ["$180K risk avoided", "12 roles corrected", "100% FLSA review"],
    challengePainPoints: [
      "Fast-changing engineering roles made exempt/non-exempt classification hard to monitor.",
      "Legal reviews happened after org changes instead of during compensation planning.",
      "HR and legal lacked one workflow to document remediation decisions.",
    ],
    solutionModules: [
      {
        name: "Compliance",
        description:
          "Flagged potential FLSA risk and generated a remediation checklist for legal review.",
      },
      {
        name: "Performance",
        description:
          "Connected role changes, leveling, and compensation updates to compliance review.",
      },
      {
        name: "Documents",
        description:
          "Stored approvals and employee notices in the same record as classification changes.",
      },
    ],
    results: [
      {
        value: "$180K",
        label: "Risk Avoided",
        detail: "Proactive remediation prevented a larger wage-and-hour exposure.",
      },
      {
        value: "12",
        label: "Roles Corrected",
        detail: "Classification updates were documented and approved in one workflow.",
      },
      {
        value: "100%",
        label: "FLSA Review",
        detail: "Every role change now includes a compliance checkpoint.",
      },
    ],
    fullQuote:
      "CircleWorks caught what our legal calendar did not. The platform made compliance part of the operating system instead of a quarterly scramble.",
  },
  {
    slug: "steadfast-logistics",
    company: "Steadfast Logistics",
    logoWordmark: "Steadfast",
    logoInitials: "SL",
    logoColor: "#475569",
    logoTextColor: "#0F172A",
    industry: "Logistics",
    segment: "Enterprise",
    size: "1,850 employees",
    customerSince: "September 2021",
    location: "Dallas, TX",
    filters: ["Enterprise"],
    quoteExcerpt:
      "One payroll admin now manages a driver workforce that spans eight states.",
    attribution: {
      name: "Robert Dale",
      title: "VP Operations",
      company: "Steadfast Logistics",
      initials: "RD",
    },
    keyMetrics: ["8 states", "1 payroll admin", "98% pay accuracy"],
    challengePainPoints: [
      "Driver work locations changed weekly, complicating state tax allocation and per diem rules.",
      "Manual corrections created distrust among employees who depended on accurate weekly pay.",
      "A three-person payroll team spent most Fridays reconciling mileage, hours, and taxes.",
    ],
    solutionModules: [
      {
        name: "Payroll",
        description:
          "Automated multi-state allocation, weekly pay runs, and driver-specific earnings rules.",
      },
      {
        name: "Time Tracking",
        description:
          "Mapped hours and work locations into payroll without manual spreadsheet imports.",
      },
      {
        name: "Compliance",
        description:
          "Monitored filing tasks and required documents by employee location.",
      },
    ],
    results: [
      {
        value: "1",
        label: "Payroll Admin",
        detail: "A single admin now runs payroll for a distributed driver workforce.",
      },
      {
        value: "8",
        label: "States Automated",
        detail: "State-specific payroll rules now apply based on actual work location.",
      },
      {
        value: "98%",
        label: "Pay Accuracy",
        detail: "Driver satisfaction with pay accuracy increased after launch.",
      },
    ],
    fullQuote:
      "We went from three people drowning in multi-state payroll to one person running it in an afternoon. The ROI was immediate and visible to every driver.",
  },
  {
    slug: "meadow-and-main",
    company: "Meadow & Main",
    logoWordmark: "Meadow",
    logoInitials: "MM",
    logoColor: "#65A30D",
    logoTextColor: "#365314",
    industry: "Retail",
    segment: "SMBs",
    size: "86 employees",
    customerSince: "May 2024",
    location: "Austin, TX",
    filters: ["SMBs", "Retail"],
    quoteExcerpt:
      "Payroll used to take half a day. Now our store manager approves it between inventory checks.",
    attribution: {
      name: "Marcus Webb",
      title: "Owner",
      company: "Meadow & Main",
      initials: "MW",
    },
    keyMetrics: ["12-minute payroll", "22% lower turnover", "5 locations"],
    challengePainPoints: [
      "Rotating retail shifts made overtime and schedule changes hard to reconcile.",
      "Paper onboarding packets slowed down hiring for new store associates.",
      "The owner manually reviewed timesheets before every pay cycle.",
    ],
    solutionModules: [
      {
        name: "Time Tracking",
        description:
          "Pulled approved shifts, overtime, and corrections directly into payroll.",
      },
      {
        name: "Onboarding",
        description:
          "Moved associate paperwork and direct deposit setup into a mobile workflow.",
      },
      {
        name: "Payroll",
        description:
          "Reduced each pay run to a guided review and final approval.",
      },
    ],
    results: [
      {
        value: "12 min",
        label: "Payroll Run Time",
        detail: "The owner approves payroll from a phone instead of a spreadsheet.",
      },
      {
        value: "22%",
        label: "Lower Turnover",
        detail: "Cleaner onboarding and pay accuracy improved employee trust.",
      },
      {
        value: "5",
        label: "Locations Live",
        detail: "Every location follows one time and payroll workflow.",
      },
    ],
    fullQuote:
      "I can run payroll from my phone at the store. It takes less time than closing the register, and the team trusts that their hours are right.",
  },
  {
    slug: "helio-cloud",
    company: "Helio Cloud",
    logoWordmark: "Helio",
    logoInitials: "HC",
    logoColor: "#0EA5E9",
    logoTextColor: "#075985",
    industry: "Technology",
    segment: "Enterprise",
    size: "3,200 employees",
    customerSince: "February 2020",
    location: "San Jose, CA",
    filters: ["Enterprise", "Tech"],
    quoteExcerpt:
      "CircleWorks brought global-grade HR discipline to our US workforce without slowing engineering velocity.",
    attribution: {
      name: "Dena Park",
      title: "SVP People",
      company: "Helio Cloud",
      initials: "DP",
    },
    keyMetrics: ["3,200 employees", "24 payroll entities", "99.97% uptime"],
    challengePainPoints: [
      "Multiple US payroll entities made reporting and approvals inconsistent.",
      "Engineering leaders needed faster headcount visibility during quarterly planning.",
      "People operations wanted tighter controls without adding manual review layers.",
    ],
    solutionModules: [
      {
        name: "Payroll",
        description:
          "Unified payroll approvals and reporting across 24 US entities.",
      },
      {
        name: "HRIS",
        description:
          "Created a single employee source of truth for people operations and finance.",
      },
      {
        name: "Analytics",
        description:
          "Delivered headcount, payroll cost, and org-change reporting for planning cycles.",
      },
    ],
    results: [
      {
        value: "24",
        label: "Entities Unified",
        detail: "Payroll operations now share one approval and reporting model.",
      },
      {
        value: "99.97%",
        label: "Uptime",
        detail: "People operations depends on CircleWorks during high-volume cycles.",
      },
      {
        value: "42%",
        label: "Faster Reporting",
        detail: "Quarterly planning reports now take hours instead of days.",
      },
    ],
    fullQuote:
      "The platform gives our leaders reliable people data without creating drag for managers. That balance matters when the business is moving quickly.",
  },
  {
    slug: "pinecrest-academy",
    company: "Pinecrest Academy",
    logoWordmark: "Pinecrest",
    logoInitials: "PA",
    logoColor: "#16A34A",
    logoTextColor: "#166534",
    industry: "Education",
    segment: "SMBs",
    size: "95 employees",
    customerSince: "July 2023",
    location: "Phoenix, AZ",
    filters: ["SMBs", "Non-Profit"],
    quoteExcerpt:
      "Open enrollment went from six weeks of paperwork to four days of employee self-service.",
    attribution: {
      name: "Teresa Mills",
      title: "HR Director",
      company: "Pinecrest Academy",
      initials: "TM",
    },
    keyMetrics: ["4-day enrollment", "150 hrs reclaimed", "0 billing disputes"],
    challengePainPoints: [
      "Benefits enrollment relied on paper forms and manual carrier updates.",
      "A two-person HR team spent weeks answering the same enrollment questions.",
      "Billing disputes carried into the school year because elections were hard to audit.",
    ],
    solutionModules: [
      {
        name: "Benefits",
        description:
          "Launched employee self-service enrollment with dependent capture and e-signatures.",
      },
      {
        name: "HRIS",
        description:
          "Kept employee eligibility, family details, and plan elections in one profile.",
      },
      {
        name: "Documents",
        description:
          "Stored signed elections and carrier-ready exports for each employee.",
      },
    ],
    results: [
      {
        value: "4 days",
        label: "Open Enrollment",
        detail: "Employees completed elections without paper packets.",
      },
      {
        value: "150 hrs",
        label: "HR Time Reclaimed",
        detail: "The HR team recovered weeks of administrative work.",
      },
      {
        value: "0",
        label: "Billing Disputes",
        detail: "Clean elections reduced carrier and payroll corrections.",
      },
    ],
    fullQuote:
      "I used to dread August. Now open enrollment runs with clear instructions, clean records, and almost no chasing from HR.",
  },
  {
    slug: "foundry-robotics",
    company: "Foundry Robotics",
    logoWordmark: "Foundry",
    logoInitials: "FR",
    logoColor: "#EA580C",
    logoTextColor: "#7C2D12",
    industry: "Technology",
    segment: "Startups",
    size: "72 employees",
    customerSince: "October 2023",
    location: "Pittsburgh, PA",
    filters: ["Startups", "Tech"],
    quoteExcerpt:
      "We hired across four states without turning payroll and onboarding into a founder tax.",
    attribution: {
      name: "Nora Ellis",
      title: "COO",
      company: "Foundry Robotics",
      initials: "NE",
    },
    keyMetrics: ["4 states", "31 hires", "3 days to launch"],
    challengePainPoints: [
      "Rapid hiring pushed the company into new states faster than operations could prepare.",
      "Offer letters, equipment tasks, and payroll setup were split across tools.",
      "Leadership needed a repeatable hiring workflow before the next funding milestone.",
    ],
    solutionModules: [
      {
        name: "ATS",
        description:
          "Connected candidate stages to offer approvals and new-hire records.",
      },
      {
        name: "Onboarding",
        description:
          "Automated Day-1 tasks for equipment, documents, payroll, and manager check-ins.",
      },
      {
        name: "Payroll",
        description:
          "Added state registrations and payroll rules as hiring expanded.",
      },
    ],
    results: [
      {
        value: "31",
        label: "Hires Onboarded",
        detail: "New employees completed setup before their first day.",
      },
      {
        value: "4",
        label: "States Supported",
        detail: "Hiring expanded without a compliance scramble.",
      },
      {
        value: "3 days",
        label: "Implementation",
        detail: "The core hiring and payroll workflow launched in one week.",
      },
    ],
    fullQuote:
      "CircleWorks helped us keep the hiring bar high while removing the operational drag. We could say yes to candidates in new states with confidence.",
  },
  {
    slug: "summit-dental-partners",
    company: "Summit Dental Partners",
    logoWordmark: "Summit",
    logoInitials: "SD",
    logoColor: "#0F766E",
    logoTextColor: "#134E4A",
    industry: "Healthcare",
    segment: "Mid-Market",
    size: "520 employees",
    customerSince: "December 2021",
    location: "Charlotte, NC",
    filters: ["Mid-Market", "Healthcare"],
    quoteExcerpt:
      "Acquisitions no longer mean months of HR cleanup after each new practice joins.",
    attribution: {
      name: "Elena Torres",
      title: "Director of People Systems",
      company: "Summit Dental Partners",
      initials: "ET",
    },
    keyMetrics: ["9 practices added", "63% faster onboarding", "$96K saved"],
    challengePainPoints: [
      "Each acquired practice brought different employee files, benefits records, and payroll habits.",
      "Central HR spent months normalizing data before leaders could trust reporting.",
      "Practice managers needed a simpler way to submit staff changes after close.",
    ],
    solutionModules: [
      {
        name: "HRIS",
        description:
          "Standardized employee records and org structures across acquired practices.",
      },
      {
        name: "Benefits",
        description:
          "Mapped eligibility and plan elections into one benefits administration process.",
      },
      {
        name: "Payroll",
        description:
          "Moved each practice into a shared payroll approval workflow.",
      },
    ],
    results: [
      {
        value: "9",
        label: "Practices Added",
        detail: "New locations now move into a repeatable operating model.",
      },
      {
        value: "63%",
        label: "Faster Onboarding",
        detail: "Acquisition HR cleanup is measured in weeks instead of months.",
      },
      {
        value: "$96K",
        label: "Saved Annually",
        detail: "Reduced data cleanup, advisor work, and payroll corrections.",
      },
    ],
    fullQuote:
      "CircleWorks became our acquisition playbook. Every new practice gets the same clean HR and payroll foundation from the first pay cycle.",
  },
  {
    slug: "clearwater-grocers",
    company: "Clearwater Grocers",
    logoWordmark: "Clearwater",
    logoInitials: "CG",
    logoColor: "#F59E0B",
    logoTextColor: "#78350F",
    industry: "Retail",
    segment: "Mid-Market",
    size: "640 employees",
    customerSince: "February 2022",
    location: "Tampa, FL",
    filters: ["Mid-Market", "Retail"],
    quoteExcerpt:
      "We finally connected schedules, time, payroll, and benefits for every store associate.",
    attribution: {
      name: "Malik Bryant",
      title: "Head of Operations",
      company: "Clearwater Grocers",
      initials: "MB",
    },
    keyMetrics: ["18 stores", "71% fewer corrections", "8 hrs/week saved"],
    challengePainPoints: [
      "Store schedules changed constantly, but payroll only saw the corrections at the last minute.",
      "Benefits eligibility for variable-hour associates required manual monthly review.",
      "Operations leaders had no shared dashboard for labor cost and pay-cycle readiness.",
    ],
    solutionModules: [
      {
        name: "Time Tracking",
        description:
          "Connected approved schedules and time changes to payroll review.",
      },
      {
        name: "Benefits",
        description:
          "Tracked variable-hour eligibility and enrollment status automatically.",
      },
      {
        name: "Reports",
        description:
          "Gave operations a weekly store-level view of labor cost and payroll readiness.",
      },
    ],
    results: [
      {
        value: "71%",
        label: "Fewer Corrections",
        detail: "Late payroll fixes dropped after schedules and time connected.",
      },
      {
        value: "18",
        label: "Stores Live",
        detail: "Every store now works from the same operating workflow.",
      },
      {
        value: "8 hrs",
        label: "Saved Weekly",
        detail: "Managers spend less time cleaning up time and benefits data.",
      },
    ],
    fullQuote:
      "CircleWorks took the weekly mess out of payroll. Our store managers can focus on customers instead of chasing corrections.",
  },
];

export const FEATURED_CUSTOMER_STORIES = CUSTOMER_STORIES.filter((story) => story.featured);

export function getCustomerStory(slug: string) {
  return CUSTOMER_STORIES.find((story) => story.slug === slug);
}

export function getRelatedStudies(slug: string, count = 3): CustomerStory[] {
  const current = getCustomerStory(slug);
  if (!current) return CUSTOMER_STORIES.filter((story) => story.slug !== slug).slice(0, count);

  const scored = CUSTOMER_STORIES.filter((story) => story.slug !== slug)
    .map((story) => ({
      story,
      score:
        (story.industry === current.industry ? 2 : 0) +
        (story.segment === current.segment ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.story.company.localeCompare(b.story.company));

  return scored.slice(0, count).map(({ story }) => story);
}
