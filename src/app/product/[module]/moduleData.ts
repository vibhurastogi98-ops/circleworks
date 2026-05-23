export type ModuleSlug =
  | "payroll"
  | "hris"
  | "ats"
  | "onboarding"
  | "benefits"
  | "time"
  | "expenses"
  | "performance"
  | "compliance"
  | "analytics";

export type ModuleData = {
  name: string;
  accent:
    | "blue"
    | "emerald"
    | "purple"
    | "green"
    | "orange"
    | "rose"
    | "cyan"
    | "red"
    | "fuchsia"
    | "indigo";
  mockupTab:
    | "dashboard"
    | "employees"
    | "payroll"
    | "benefits"
    | "compliance"
    | "hiring";
  hero: {
    headline: string;
    stat: string;
    mockupStats: [string, string, string];
  };
  testimonials: { quote: string; author: string; role: string }[];
  howItWorks: { title: string; desc: string }[];
  features: { headline: string; description: string; bullets: string[] }[];
  complianceNote: string;
  integrations: string[];
  faqs: { q: string; a: string }[];
};

export const MODULE_SLUGS: ModuleSlug[] = [
  "payroll",
  "hris",
  "ats",
  "onboarding",
  "benefits",
  "time",
  "expenses",
  "performance",
  "compliance",
  "analytics",
];

export const MODULE_DATA: Record<ModuleSlug, ModuleData> = {
  payroll: {
    name: "Payroll",
    accent: "blue",
    mockupTab: "payroll",
    hero: {
      headline: "Run payroll for 50 employees in 4 minutes.",
      stat: "Automated wages, taxes, deductions, and filings for every U.S. state.",
      mockupStats: [
        "4 min approval",
        "50-state tax engine",
        "2-day direct deposit",
      ],
    },
    testimonials: [
      {
        quote:
          "Payroll went from an all-day spreadsheet ritual to one clean approval screen.",
        author: "Sarah Jenkins",
        role: "VP People, Northstar Labs",
      },
      {
        quote:
          "The state filing automation alone paid for CircleWorks in the first quarter.",
        author: "Michael Chen",
        role: "Founder, Zenith SaaS",
      },
      {
        quote:
          "Our finance team trusts the previews before every run. No surprises.",
        author: "Emily Roberts",
        role: "HR Director, FinTech Co.",
      },
    ],
    howItWorks: [
      {
        title: "Sync inputs",
        desc: "Hours, PTO, benefits, expenses, and bonuses flow into payroll automatically.",
      },
      {
        title: "Review run",
        desc: "Preview gross-to-net pay, employer taxes, cash requirements, and exceptions.",
      },
      {
        title: "Pay and file",
        desc: "Approve once. CircleWorks sends direct deposit and files required payroll taxes.",
      },
    ],
    features: [
      {
        headline: "50-state payroll tax engine",
        description:
          "Calculate federal, state, and local taxes without chasing rate tables.",
        bullets: [
          "FICA, FUTA, SUI, and local tax handling",
          "Automatic tax rate updates",
          "Quarterly and annual filing workflows",
          "Penalty protection for platform errors",
        ],
      },
      {
        headline: "Gross-to-net preview",
        description:
          "Spot every deduction and employer cost before money leaves your account.",
        bullets: [
          "Employee-level pay previews",
          "Cash requirement summaries",
          "Exception warnings",
          "Audit-ready approval history",
        ],
      },
      {
        headline: "Multi-schedule payroll",
        description:
          "Run weekly, biweekly, semimonthly, monthly, and contractor cycles side by side.",
        bullets: [
          "Concurrent pay calendars",
          "Off-cycle checks and bonuses",
          "Same platform for W-2 and 1099",
          "Pay group permissions",
        ],
      },
      {
        headline: "Deductions and garnishments",
        description:
          "Automate benefit deductions, retirement contributions, and wage orders.",
        bullets: [
          "Pre-tax and post-tax deduction rules",
          "Child support routing",
          "401(k) and HSA deductions",
          "Custom repayment schedules",
        ],
      },
      {
        headline: "Year-end tax forms",
        description:
          "Generate, file, and distribute W-2s and 1099s from the same payroll record.",
        bullets: [
          "Electronic employee delivery",
          "Federal and state copies",
          "Correction workflows",
          "Historical archive",
        ],
      },
      {
        headline: "Payroll accounting sync",
        description:
          "Push clean journal entries to your ledger with department and class mapping.",
        bullets: [
          "QuickBooks and Xero sync",
          "GL mapping by earning code",
          "Employer tax accruals",
          "Reconciliation reports",
        ],
      },
    ],
    complianceNote:
      "We handle FICA, FUTA, federal withholding, state unemployment, new-hire reporting, and all 50-state payroll filing workflows so U.S. payroll stays current as rules change.",
    integrations: ["QuickBooks", "Xero", "NetSuite", "Plaid", "Guideline"],
    faqs: [
      {
        q: "Which states does payroll support?",
        a: "CircleWorks supports payroll calculations, tax payments, and filing workflows across all 50 U.S. states and Washington, D.C.",
      },
      {
        q: "Can I run off-cycle payroll?",
        a: "Yes. You can run bonuses, reimbursements, corrections, and final checks outside the normal schedule.",
      },
      {
        q: "Are W-2s and 1099s automatic?",
        a: "Yes. Year-end forms are generated from payroll history and can be distributed electronically.",
      },
      {
        q: "Can contractors be paid with employees?",
        a: "Yes. W-2 employees and 1099 contractors can be paid from the same payroll workspace.",
      },
      {
        q: "Does payroll sync with accounting?",
        a: "Yes. Journal entries can sync to QuickBooks, Xero, NetSuite, and mapped exports.",
      },
      {
        q: "What happens if a tax rule changes?",
        a: "CircleWorks updates tax logic and highlights any action you need to take before the next run.",
      },
    ],
  },
  hris: {
    name: "HRIS",
    accent: "indigo",
    mockupTab: "employees",
    hero: {
      headline: "Keep every employee record audit-ready.",
      stat: "One secure HR source of truth for profiles, documents, org charts, and workflows.",
      mockupStats: [
        "100% profile coverage",
        "Role-based access",
        "Instant org updates",
      ],
    },
    testimonials: [
      {
        quote:
          "We finally stopped asking which spreadsheet had the real employee record.",
        author: "David Kim",
        role: "Head of Operations",
      },
      {
        quote:
          "Org changes, documents, and compensation history now live together.",
        author: "Jessica Alba",
        role: "People Ops Manager",
      },
      {
        quote:
          "Custom fields let us track certifications without buying a niche system.",
        author: "Dr. Lina Thorne",
        role: "Clinic Director",
      },
    ],
    howItWorks: [
      {
        title: "Import people",
        desc: "Load employees, departments, managers, documents, and custom fields.",
      },
      {
        title: "Configure access",
        desc: "Set role-based visibility for salary, documents, personal data, and approvals.",
      },
      {
        title: "Automate changes",
        desc: "Trigger tasks when roles, managers, locations, or employment status changes.",
      },
    ],
    features: [
      {
        headline: "Employee system of record",
        description:
          "Centralize job, compensation, demographic, and lifecycle data.",
        bullets: [
          "Rich employee profiles",
          "Employment history timelines",
          "Custom field library",
          "Bulk import and export",
        ],
      },
      {
        headline: "Dynamic org charts",
        description:
          "Keep reporting lines and team structures visible as your company changes.",
        bullets: [
          "Manager hierarchy sync",
          "Department filtering",
          "Open role placeholders",
          "Exportable visuals",
        ],
      },
      {
        headline: "Secure document vault",
        description:
          "Store signed documents, IDs, tax forms, and HR policies with the right permissions.",
        bullets: [
          "Granular document access",
          "E-signature history",
          "Expiration alerts",
          "Employee self-service",
        ],
      },
      {
        headline: "Lifecycle workflows",
        description:
          "Automate promotions, transfers, manager changes, and terminations.",
        bullets: [
          "Approval routing",
          "Task assignment",
          "Notification rules",
          "Audit trails",
        ],
      },
      {
        headline: "Employee self-service",
        description:
          "Let employees update personal details, download documents, and find teammates.",
        bullets: [
          "Profile updates",
          "Emergency contacts",
          "Document downloads",
          "Directory search",
        ],
      },
      {
        headline: "Permission controls",
        description:
          "Protect sensitive fields while giving managers the context they need.",
        bullets: [
          "Role-based access",
          "Field-level visibility",
          "Admin audit logs",
          "Manager scopes",
        ],
      },
    ],
    complianceNote:
      "CircleWorks helps U.S. employers retain personnel records, signed policies, tax forms, and access logs in a structured, auditable HR system of record.",
    integrations: [
      "Okta",
      "Google Workspace",
      "Microsoft Entra",
      "Slack",
      "DocuSign",
    ],
    faqs: [
      {
        q: "Can employees update their own information?",
        a: "Yes. Employees can update approved personal fields while HR controls review and visibility rules.",
      },
      {
        q: "Can salary data be restricted?",
        a: "Yes. Compensation can be hidden from managers or limited to HR, finance, and admins.",
      },
      {
        q: "Does HRIS include org charts?",
        a: "Yes. Org charts update automatically from manager relationships.",
      },
      {
        q: "Can we add custom fields?",
        a: "Yes. You can add fields for certifications, equipment, skills, preferences, or internal tracking.",
      },
      {
        q: "Are documents included?",
        a: "Yes. Employee documents can be stored, signed, and accessed from the employee profile.",
      },
      {
        q: "Does HRIS connect to payroll?",
        a: "Yes. Employment, compensation, department, and location changes can flow into payroll.",
      },
    ],
  },
  ats: {
    name: "ATS",
    accent: "emerald",
    mockupTab: "hiring",
    hero: {
      headline: "Move candidates from applied to hired faster.",
      stat: "Collaborative pipelines, scorecards, scheduling, offers, and handoff to onboarding.",
      mockupStats: [
        "40% faster hiring",
        "100+ job boards",
        "1-click offer handoff",
      ],
    },
    testimonials: [
      {
        quote:
          "Hiring managers finally submit feedback while the interview is still fresh.",
        author: "Priya V.",
        role: "Senior Recruiter",
      },
      {
        quote: "The offer-to-onboarding handoff removed three manual steps.",
        author: "Tom Ruiz",
        role: "COO, StudioWorks",
      },
      {
        quote: "Our careers page looks polished without involving engineering.",
        author: "Maya Singh",
        role: "Talent Lead",
      },
    ],
    howItWorks: [
      {
        title: "Publish roles",
        desc: "Create requisitions and post jobs to your careers site and job boards.",
      },
      {
        title: "Run pipeline",
        desc: "Coordinate interviews, scorecards, feedback, and candidate communication.",
      },
      {
        title: "Send offer",
        desc: "Generate an offer, collect signature, and convert the candidate to onboarding.",
      },
    ],
    features: [
      {
        headline: "Branded careers page",
        description:
          "Launch a polished, mobile-friendly careers site tied to your open roles.",
        bullets: [
          "No-code career pages",
          "Custom job application fields",
          "SEO-friendly postings",
          "Referral links",
        ],
      },
      {
        headline: "Candidate pipeline boards",
        description:
          "Track every candidate through configurable hiring stages.",
        bullets: [
          "Drag-and-drop stages",
          "Stage automation",
          "Pipeline aging alerts",
          "Candidate source tracking",
        ],
      },
      {
        headline: "Structured scorecards",
        description:
          "Standardize interview feedback and reduce bias in hiring decisions.",
        bullets: [
          "Role-specific criteria",
          "Hidden feedback until submitted",
          "Rating scales",
          "Debrief summaries",
        ],
      },
      {
        headline: "Interview scheduling",
        description:
          "Find availability across candidates and interviewers without email loops.",
        bullets: [
          "Calendar sync",
          "Self-scheduling links",
          "Panel interview support",
          "Reminder emails",
        ],
      },
      {
        headline: "Offer management",
        description:
          "Create approved offers from templates and compensation bands.",
        bullets: [
          "Offer approvals",
          "E-signature support",
          "Compensation fields",
          "Expiration tracking",
        ],
      },
      {
        headline: "New hire handoff",
        description:
          "Convert accepted candidates into HRIS and onboarding records instantly.",
        bullets: [
          "Profile creation",
          "Manager assignment",
          "Onboarding workflow trigger",
          "Document carryover",
        ],
      },
    ],
    complianceNote:
      "CircleWorks supports structured hiring records, consistent scorecards, background-check workflows, and offer approvals to help U.S. teams maintain fair hiring documentation.",
    integrations: ["LinkedIn", "Indeed", "Checkr", "Google Calendar", "Slack"],
    faqs: [
      {
        q: "Can we customize hiring stages?",
        a: "Yes. Each role can have its own pipeline, interview stages, and scorecards.",
      },
      {
        q: "Does ATS post to job boards?",
        a: "Yes. Jobs can be distributed to major boards and your branded careers page.",
      },
      {
        q: "Are scorecards required?",
        a: "They are configurable, but structured scorecards are recommended for consistent evaluation.",
      },
      {
        q: "Can candidates self-schedule?",
        a: "Yes. Candidates can choose available times from connected calendars.",
      },
      {
        q: "Does ATS connect to onboarding?",
        a: "Yes. Accepted offers can launch onboarding automatically.",
      },
      {
        q: "Do you support background checks?",
        a: "Yes. CircleWorks integrates with Checkr for background screening workflows.",
      },
    ],
  },
  onboarding: {
    name: "Onboarding",
    accent: "purple",
    mockupTab: "employees",
    hero: {
      headline: "Make every first day feel prepared.",
      stat: "Automate paperwork, provisioning, tax forms, and manager tasks before day one.",
      mockupStats: ["Day-one ready", "I-9 and W-4 flows", "Task automation"],
    },
    testimonials: [
      {
        quote:
          "New hires show up with accounts, forms, and equipment already handled.",
        author: "Nina Patel",
        role: "People Partner",
      },
      {
        quote: "The checklist view tells every department exactly what is due.",
        author: "Marcus Lee",
        role: "IT Manager",
      },
      {
        quote: "I stopped chasing I-9s and direct deposit forms over email.",
        author: "Rachel Gomez",
        role: "HR Generalist",
      },
    ],
    howItWorks: [
      {
        title: "Trigger workflow",
        desc: "Start onboarding from ATS, HRIS, or a manual hire record.",
      },
      {
        title: "Collect tasks",
        desc: "New hires, managers, HR, and IT get guided task lists.",
      },
      {
        title: "Launch employee",
        desc: "Completed data flows to payroll, HRIS, benefits, and documents.",
      },
    ],
    features: [
      {
        headline: "Guided new-hire portal",
        description: "Give every new hire a clear path through required tasks.",
        bullets: [
          "Mobile-ready task flow",
          "Welcome content",
          "Progress tracking",
          "Automatic reminders",
        ],
      },
      {
        headline: "Digital tax forms",
        description:
          "Collect W-4, state withholding, direct deposit, and policy signatures securely.",
        bullets: [
          "W-4 wizard",
          "State forms",
          "Bank setup",
          "Signed document storage",
        ],
      },
      {
        headline: "I-9 workflow",
        description:
          "Guide employees and admins through required employment verification steps.",
        bullets: [
          "Section 1 collection",
          "Document review checklist",
          "Reverification alerts",
          "Audit trail",
        ],
      },
      {
        headline: "IT provisioning tasks",
        description:
          "Coordinate accounts, equipment, and access before the employee starts.",
        bullets: [
          "Device assignment",
          "App access tasks",
          "Manager reminders",
          "Due dates",
        ],
      },
      {
        headline: "Role-based templates",
        description:
          "Use different onboarding plans for departments, locations, or employment types.",
        bullets: [
          "Template library",
          "Conditional tasks",
          "Reusable packets",
          "Task owners",
        ],
      },
      {
        headline: "Payroll-ready handoff",
        description:
          "Send complete tax, bank, job, and compensation data to payroll.",
        bullets: [
          "Employee profile sync",
          "Pay schedule assignment",
          "Document archive",
          "Completion status",
        ],
      },
    ],
    complianceNote:
      "CircleWorks helps U.S. employers collect and retain onboarding documents such as I-9s, W-4s, policy acknowledgments, and employment eligibility records.",
    integrations: ["E-Verify", "Okta", "Google Workspace", "Slack", "DocuSign"],
    faqs: [
      {
        q: "Can onboarding start from the ATS?",
        a: "Yes. Accepted offers can automatically launch onboarding.",
      },
      {
        q: "Can we customize onboarding by role?",
        a: "Yes. Templates can vary by department, location, worker type, or manager.",
      },
      {
        q: "Does it include W-4 collection?",
        a: "Yes. New hires can complete a guided W-4 flow inside the portal.",
      },
      {
        q: "Can IT tasks be assigned automatically?",
        a: "Yes. IT, facilities, HR, and manager tasks can be assigned from templates.",
      },
      {
        q: "Are signatures legally captured?",
        a: "Yes. Signed acknowledgments are stored with timestamped records.",
      },
      {
        q: "Does onboarding show admin completion status?",
        a: "Yes. HR can see each task, owner, due date, and completion state.",
      },
    ],
  },
  benefits: {
    name: "Benefits",
    accent: "green",
    mockupTab: "benefits",
    hero: {
      headline: "Run open enrollment without the chaos.",
      stat: "Plan shopping, dependent tracking, payroll deductions, and ACA-ready records.",
      mockupStats: [
        "15-min enrollment",
        "ACA tracking",
        "Payroll deduction sync",
      ],
    },
    testimonials: [
      {
        quote:
          "Open enrollment finally feels self-service for employees and controlled for HR.",
        author: "Rebecca Turner",
        role: "Benefits Consultant",
      },
      {
        quote:
          "Deductions sync cleanly to payroll after employees make elections.",
        author: "Stan Park",
        role: "CFO",
      },
      {
        quote:
          "Employees understand their plans because the comparison view is so clear.",
        author: "Leslie K.",
        role: "HR Director",
      },
    ],
    howItWorks: [
      {
        title: "Build plans",
        desc: "Configure medical, dental, vision, retirement, HSA, FSA, and voluntary plans.",
      },
      {
        title: "Enroll employees",
        desc: "Employees compare options, add dependents, and submit elections.",
      },
      {
        title: "Sync deductions",
        desc: "Approved elections create payroll deductions and admin records.",
      },
    ],
    features: [
      {
        headline: "Open enrollment wizard",
        description: "Guide employees through plan comparisons and elections.",
        bullets: [
          "Side-by-side plan cards",
          "Dependent collection",
          "Election review",
          "Mobile-friendly enrollment",
        ],
      },
      {
        headline: "Payroll deduction sync",
        description:
          "Turn approved benefits elections into accurate payroll deductions.",
        bullets: [
          "Pre-tax deductions",
          "Employer contributions",
          "Effective-date handling",
          "Change tracking",
        ],
      },
      {
        headline: "Broker collaboration",
        description:
          "Invite brokers to manage plans without exposing unrelated HR data.",
        bullets: [
          "Broker access",
          "Plan setup permissions",
          "Carrier docs",
          "Renewal tracking",
        ],
      },
      {
        headline: "Life event workflows",
        description:
          "Handle qualifying life events with structured approvals and documentation.",
        bullets: [
          "Marriage and birth events",
          "Document requests",
          "Election windows",
          "Admin approvals",
        ],
      },
      {
        headline: "ACA tracking",
        description:
          "Monitor eligibility, measurement periods, and required reporting data.",
        bullets: [
          "Full-time equivalent tracking",
          "Eligibility alerts",
          "1094-C and 1095-C data",
          "Audit records",
        ],
      },
      {
        headline: "Retirement and savings",
        description:
          "Administer 401(k), HSA, FSA, commuter, and voluntary benefit deductions.",
        bullets: [
          "Contribution changes",
          "Annual limits",
          "Provider sync",
          "Employee self-service",
        ],
      },
    ],
    complianceNote:
      "CircleWorks tracks ACA eligibility, benefit election records, payroll deductions, COBRA-relevant changes, and year-end 1094-C/1095-C reporting data for U.S. employers.",
    integrations: [
      "Guideline",
      "Human Interest",
      "Kaiser Permanente",
      "BlueCross",
      "Aetna",
    ],
    faqs: [
      {
        q: "Can we bring our own broker?",
        a: "Yes. Your broker can be invited into CircleWorks with scoped permissions.",
      },
      {
        q: "Do benefits sync with payroll?",
        a: "Yes. Employee elections create payroll deductions based on effective dates.",
      },
      {
        q: "Can employees compare plans?",
        a: "Yes. Employees can review plan costs, coverage details, and dependents before enrolling.",
      },
      {
        q: "Does CircleWorks track ACA?",
        a: "Yes. Eligibility and reporting data can be tracked for ACA workflows.",
      },
      {
        q: "Are life events supported?",
        a: "Yes. Qualifying life event workflows can request documents and route approvals.",
      },
      {
        q: "Do you support retirement benefits?",
        a: "Yes. 401(k), HSA, FSA, commuter, and voluntary benefits can be administered.",
      },
    ],
  },
  time: {
    name: "Time",
    accent: "orange",
    mockupTab: "dashboard",
    hero: {
      headline: "Track time, PTO, and overtime before payroll runs.",
      stat: "Clock-ins, schedules, approvals, and PTO accruals that sync directly to payroll.",
      mockupStats: [
        "Geo-fenced punches",
        "Overtime alerts",
        "PTO accrual engine",
      ],
    },
    testimonials: [
      {
        quote:
          "Managers approve timesheets once and payroll gets the clean data.",
        author: "Dana Brooks",
        role: "Retail Operations",
      },
      {
        quote: "Geo-fenced punches solved our field-team time disputes.",
        author: "Omar Diaz",
        role: "Construction Controller",
      },
      {
        quote: "PTO balances finally match what employees see in the portal.",
        author: "Sarah Wu",
        role: "People Ops",
      },
    ],
    howItWorks: [
      {
        title: "Schedule shifts",
        desc: "Build schedules, publish shifts, and alert employees.",
      },
      {
        title: "Capture time",
        desc: "Employees clock in by mobile, kiosk, or web with location rules.",
      },
      {
        title: "Approve payroll",
        desc: "Managers approve timesheets and hours flow into payroll.",
      },
    ],
    features: [
      {
        headline: "Mobile time clock",
        description:
          "Capture accurate punches from the field, office, or kiosk.",
        bullets: [
          "Mobile clock-in",
          "Kiosk mode",
          "Photo capture options",
          "Offline-friendly flows",
        ],
      },
      {
        headline: "Geo-fencing and rules",
        description: "Control where and when employees can clock in.",
        bullets: [
          "Location boundaries",
          "IP restrictions",
          "Missed punch alerts",
          "Manager overrides",
        ],
      },
      {
        headline: "Scheduling",
        description: "Plan shifts while watching coverage and labor cost.",
        bullets: [
          "Drag-and-drop shifts",
          "Shift swaps",
          "Publish notifications",
          "Coverage warnings",
        ],
      },
      {
        headline: "Overtime detection",
        description: "Spot overtime risk before it becomes a payroll surprise.",
        bullets: [
          "FLSA overtime",
          "Daily overtime rules",
          "Break compliance prompts",
          "Cost forecasting",
        ],
      },
      {
        headline: "PTO accrual engine",
        description: "Create policies that calculate balances automatically.",
        bullets: [
          "Tenure-based accruals",
          "Caps and carryover",
          "Approval routing",
          "Shared calendars",
        ],
      },
      {
        headline: "Payroll sync",
        description:
          "Approved hours, PTO, and job codes transfer directly into payroll.",
        bullets: [
          "Earnings code mapping",
          "Project and job costing",
          "Manager approval locks",
          "Exception reports",
        ],
      },
    ],
    complianceNote:
      "CircleWorks supports U.S. wage-and-hour workflows, including FLSA overtime calculations, break prompts, timesheet approvals, and auditable punch history.",
    integrations: [
      "Slack",
      "Google Calendar",
      "Square",
      "QuickBooks",
      "Microsoft Teams",
    ],
    faqs: [
      {
        q: "Can employees clock in from phones?",
        a: "Yes. Employees can clock in from mobile, web, or kiosk depending on your rules.",
      },
      {
        q: "Does Time sync to payroll?",
        a: "Yes. Approved hours and PTO flow directly into payroll runs.",
      },
      {
        q: "Can we prevent off-site clock-ins?",
        a: "Yes. Geo-fencing and IP rules can restrict punches.",
      },
      {
        q: "Does it calculate overtime?",
        a: "Yes. Overtime alerts and calculations can be configured for federal and state rules.",
      },
      {
        q: "Are PTO policies customizable?",
        a: "Yes. Accruals, caps, waiting periods, and approvals are configurable.",
      },
      {
        q: "Can time be tracked by job?",
        a: "Yes. Employees can select job, project, department, or location codes.",
      },
    ],
  },
  expenses: {
    name: "Expenses",
    accent: "rose",
    mockupTab: "dashboard",
    hero: {
      headline: "Reimburse approved expenses on the next paycheck.",
      stat: "Receipt capture, policy checks, approvals, and payroll reimbursement in one workflow.",
      mockupStats: [
        "OCR receipts",
        "Policy guardrails",
        "Payroll reimbursement",
      ],
    },
    testimonials: [
      {
        quote:
          "Employees submit receipts from their phone and finance gets clean categories.",
        author: "Maya Lee",
        role: "Finance Manager",
      },
      {
        quote:
          "Payroll reimbursement removed a separate check run every month.",
        author: "Chris Nolan",
        role: "Controller",
      },
      {
        quote: "Policy alerts made expense conversations much easier.",
        author: "Elena Park",
        role: "COO",
      },
    ],
    howItWorks: [
      {
        title: "Capture receipt",
        desc: "Employees upload a receipt and CircleWorks extracts the key details.",
      },
      {
        title: "Approve expense",
        desc: "Policies flag issues and route expenses to the right manager.",
      },
      {
        title: "Reimburse",
        desc: "Approved reimbursements sync to payroll and accounting.",
      },
    ],
    features: [
      {
        headline: "Receipt OCR",
        description:
          "Extract merchant, date, amount, and category from uploaded receipts.",
        bullets: [
          "Mobile receipt capture",
          "Auto-filled fields",
          "Duplicate detection",
          "Multi-currency support",
        ],
      },
      {
        headline: "Policy enforcement",
        description:
          "Flag spending issues before they become reimbursement problems.",
        bullets: [
          "Category limits",
          "Receipt thresholds",
          "Per diem rules",
          "Duplicate warnings",
        ],
      },
      {
        headline: "Approval routing",
        description:
          "Route expenses by employee, department, project, or amount.",
        bullets: [
          "Manager approvals",
          "Finance review",
          "Escalation rules",
          "Comment history",
        ],
      },
      {
        headline: "Payroll reimbursement",
        description:
          "Add approved reimbursements to payroll as non-taxable payments.",
        bullets: [
          "Non-taxable earning codes",
          "Next-run inclusion",
          "Immediate payout option",
          "Employee visibility",
        ],
      },
      {
        headline: "Corporate card sync",
        description:
          "Match card transactions to submitted receipts and approvals.",
        bullets: [
          "Ramp and Brex sync",
          "Missing receipt reminders",
          "Merchant matching",
          "Cardholder summaries",
        ],
      },
      {
        headline: "Accounting exports",
        description:
          "Send approved expenses to your accounting system with clean coding.",
        bullets: [
          "GL categories",
          "Department coding",
          "Project coding",
          "Audit reports",
        ],
      },
    ],
    complianceNote:
      "CircleWorks keeps receipt records, approval history, reimbursement classification, and accountable-plan documentation organized for U.S. expense substantiation.",
    integrations: ["Ramp", "Brex", "Expensify", "QuickBooks", "Xero"],
    faqs: [
      {
        q: "Are reimbursements taxable?",
        a: "Approved business reimbursements can be mapped as non-taxable payroll payments when they meet accountable-plan rules.",
      },
      {
        q: "Can expenses be approved by managers?",
        a: "Yes. Approvals can route by department, amount, project, or employee.",
      },
      {
        q: "Does OCR read receipts?",
        a: "Yes. Receipt OCR extracts common fields and flags missing details.",
      },
      {
        q: "Can expenses sync to accounting?",
        a: "Yes. Approved expenses can export to accounting with GL and department coding.",
      },
      {
        q: "Can we enforce spending limits?",
        a: "Yes. Policy rules can flag or block out-of-policy submissions.",
      },
      {
        q: "Do you support corporate cards?",
        a: "CircleWorks integrates with card platforms such as Ramp and Brex.",
      },
    ],
  },
  performance: {
    name: "Performance",
    accent: "cyan",
    mockupTab: "dashboard",
    hero: {
      headline: "Turn feedback into measurable growth.",
      stat: "Goals, reviews, 1:1s, learning, and compensation context in one performance system.",
      mockupStats: ["360 reviews", "OKR tracking", "Learning assignments"],
    },
    testimonials: [
      {
        quote:
          "Managers now have a rhythm for feedback instead of scrambling once a year.",
        author: "Amara Hill",
        role: "VP Engineering",
      },
      {
        quote:
          "OKR visibility helped every department see what mattered this quarter.",
        author: "Jon Bell",
        role: "CEO",
      },
      {
        quote:
          "Training completion and reviews finally connect to the same employee profile.",
        author: "Clara Evans",
        role: "Enablement Lead",
      },
    ],
    howItWorks: [
      {
        title: "Set goals",
        desc: "Create company, team, and individual goals with measurable outcomes.",
      },
      {
        title: "Coach often",
        desc: "Use 1:1s, feedback, learning assignments, and check-ins throughout the cycle.",
      },
      {
        title: "Review fairly",
        desc: "Run structured reviews with calibration and compensation context.",
      },
    ],
    features: [
      {
        headline: "OKRs and goals",
        description: "Connect individual work to company priorities.",
        bullets: [
          "Company OKRs",
          "Team goals",
          "Progress updates",
          "Risk indicators",
        ],
      },
      {
        headline: "1:1 workspaces",
        description:
          "Give managers and employees shared agendas and follow-ups.",
        bullets: [
          "Recurring agendas",
          "Action items",
          "Private notes",
          "Manager prompts",
        ],
      },
      {
        headline: "360 review cycles",
        description:
          "Collect structured feedback from managers, peers, and employees.",
        bullets: [
          "Custom templates",
          "Reviewer nominations",
          "Rating scales",
          "Submission tracking",
        ],
      },
      {
        headline: "Calibration",
        description:
          "Compare review outcomes and reduce bias before decisions are final.",
        bullets: [
          "9-box views",
          "Score distributions",
          "Manager summaries",
          "Calibration notes",
        ],
      },
      {
        headline: "Learning assignments",
        description:
          "Assign training based on role, compliance requirements, or growth goals.",
        bullets: [
          "Course library",
          "Due dates",
          "Completion tracking",
          "Certification records",
        ],
      },
      {
        headline: "Compensation context",
        description:
          "Connect performance outcomes to raise and bonus planning.",
        bullets: [
          "Review history",
          "Goal completion",
          "Compensation bands",
          "Promotion notes",
        ],
      },
    ],
    complianceNote:
      "CircleWorks keeps performance decisions, training completion, feedback records, and compensation context documented for consistent U.S. employment practices.",
    integrations: [
      "Slack",
      "Microsoft Teams",
      "Google Calendar",
      "CultureAmp",
      "Lattice",
    ],
    faqs: [
      {
        q: "Can review templates be customized?",
        a: "Yes. You can build custom templates with ratings, questions, and manager summaries.",
      },
      {
        q: "Are peer reviews anonymous?",
        a: "They can be anonymous, attributed, or manager-visible depending on the cycle settings.",
      },
      {
        q: "Can goals cascade by department?",
        a: "Yes. Company OKRs can cascade to departments, teams, and individuals.",
      },
      {
        q: "Does Performance include learning?",
        a: "Yes. Courses and certifications can be assigned and tracked.",
      },
      {
        q: "Can reviews inform compensation?",
        a: "Yes. Performance data can be referenced in compensation planning.",
      },
      {
        q: "Do managers get reminders?",
        a: "Yes. CircleWorks reminds managers about check-ins, review deadlines, and overdue actions.",
      },
    ],
  },
  compliance: {
    name: "Compliance",
    accent: "red",
    mockupTab: "compliance",
    hero: {
      headline: "Stay compliant across every U.S. state.",
      stat: "Labor law alerts, payroll registrations, I-9s, ACA, EEO, posters, and audit trails.",
      mockupStats: [
        "50-state alerts",
        "Audit-ready records",
        "Automated filings",
      ],
    },
    testimonials: [
      {
        quote:
          "The state registration workflow saved us from a painful new-market mistake.",
        author: "Henry Walsh",
        role: "Founder",
      },
      {
        quote:
          "EEO and ACA data is already structured when reporting season arrives.",
        author: "Monica Reyes",
        role: "HR Director",
      },
      {
        quote:
          "Remote labor law posters are finally handled for our distributed team.",
        author: "Paige Turner",
        role: "People Ops",
      },
    ],
    howItWorks: [
      {
        title: "Monitor rules",
        desc: "CircleWorks tracks federal, state, and local employment changes.",
      },
      {
        title: "Surface actions",
        desc: "Admins see alerts, blockers, and required filings in context.",
      },
      {
        title: "Keep records",
        desc: "Completion evidence and audit trails stay connected to employees and payroll.",
      },
    ],
    features: [
      {
        headline: "State registration workflows",
        description:
          "Know when hiring in a new state requires tax or labor setup.",
        bullets: [
          "UI and SUI tracking",
          "Agency account status",
          "POA reminders",
          "New state alerts",
        ],
      },
      {
        headline: "I-9 and document retention",
        description:
          "Keep employment eligibility records structured and accessible.",
        bullets: [
          "I-9 task status",
          "Document review trail",
          "Reverification alerts",
          "Secure storage",
        ],
      },
      {
        headline: "ACA reporting readiness",
        description:
          "Track full-time status, coverage offers, and reporting fields.",
        bullets: [
          "FTE calculations",
          "Eligibility periods",
          "1094-C/1095-C data",
          "Coverage records",
        ],
      },
      {
        headline: "EEO and workforce reports",
        description:
          "Prepare workforce demographics and headcount data for required reporting.",
        bullets: [
          "Demographic summaries",
          "Department rollups",
          "Exportable reports",
          "Audit notes",
        ],
      },
      {
        headline: "Labor law posters",
        description:
          "Deliver required notices for onsite, hybrid, and remote employees.",
        bullets: [
          "Digital poster acknowledgments",
          "Location-specific notices",
          "Update alerts",
          "Employee sign-off",
        ],
      },
      {
        headline: "Compliance dashboard",
        description:
          "Track required actions, overdue items, and risk areas in one place.",
        bullets: [
          "Risk severity",
          "Task owners",
          "Due dates",
          "Completion evidence",
        ],
      },
    ],
    complianceNote:
      "CircleWorks monitors U.S. employment compliance workflows including payroll registrations, I-9 retention, ACA reporting data, EEO preparation, required notices, and wage-and-hour alerts.",
    integrations: ["E-Verify", "IRS", "State Agencies", "EEOC", "Slack"],
    faqs: [
      {
        q: "Does Compliance replace legal counsel?",
        a: "No. CircleWorks organizes workflows and alerts, but employers should consult counsel for legal advice.",
      },
      {
        q: "Can CircleWorks help with new state setup?",
        a: "Yes. It tracks state registration steps and required payroll agency setup.",
      },
      {
        q: "Are labor law posters supported?",
        a: "Yes. Digital notices and employee acknowledgments can be managed by location.",
      },
      {
        q: "Does it track I-9 status?",
        a: "Yes. I-9 completion, review, retention, and reverification workflows are supported.",
      },
      {
        q: "Can we prepare ACA reporting?",
        a: "Yes. CircleWorks tracks the data needed for ACA reporting workflows.",
      },
      {
        q: "Are compliance tasks auditable?",
        a: "Yes. Task history, owners, due dates, and completion evidence are retained.",
      },
    ],
  },
  analytics: {
    name: "Analytics",
    accent: "fuchsia",
    mockupTab: "dashboard",
    hero: {
      headline: "Make workforce decisions with live payroll and HR data.",
      stat: "Headcount, burn, hiring, diversity, pay equity, overtime, and retention dashboards.",
      mockupStats: [
        "Board-ready reports",
        "Forecasting",
        "Pay equity insights",
      ],
    },
    testimonials: [
      {
        quote:
          "Finance and HR finally agree on headcount cost because the source data is shared.",
        author: "Dana Fox",
        role: "CFO",
      },
      {
        quote: "Our board pack now takes minutes, not a full Friday.",
        author: "Iris Morgan",
        role: "Chief of Staff",
      },
      {
        quote:
          "Pay equity views helped us catch comp drift before review season.",
        author: "Leo Grant",
        role: "People Analytics",
      },
    ],
    howItWorks: [
      {
        title: "Unify data",
        desc: "Payroll, HRIS, ATS, time, benefits, and performance data connect automatically.",
      },
      {
        title: "Choose insights",
        desc: "Use prebuilt dashboards or build custom reports by role.",
      },
      {
        title: "Share action",
        desc: "Schedule reports, export files, and assign follow-up actions.",
      },
    ],
    features: [
      {
        headline: "Headcount planning",
        description: "Forecast team growth and fully loaded employee cost.",
        bullets: [
          "Open role planning",
          "Department rollups",
          "Salary and tax load",
          "Scenario modeling",
        ],
      },
      {
        headline: "Payroll cost analytics",
        description:
          "Understand payroll spend by department, location, earning type, and trend.",
        bullets: [
          "Gross pay trends",
          "Employer tax views",
          "Benefits load",
          "Variance reports",
        ],
      },
      {
        headline: "Hiring funnel analytics",
        description:
          "Measure recruiting speed, bottlenecks, and source quality.",
        bullets: [
          "Time-to-hire",
          "Stage conversion",
          "Source attribution",
          "Offer acceptance",
        ],
      },
      {
        headline: "Pay equity insights",
        description:
          "Review compensation consistency across roles, levels, departments, and demographics.",
        bullets: [
          "Band comparisons",
          "Outlier detection",
          "Promotion velocity",
          "Exportable findings",
        ],
      },
      {
        headline: "Retention and engagement",
        description:
          "Spot risk patterns using tenure, manager changes, performance, and compensation data.",
        bullets: [
          "Attrition trends",
          "Tenure cohorts",
          "Manager rollups",
          "Risk indicators",
        ],
      },
      {
        headline: "Custom report builder",
        description:
          "Create reusable dashboards and exports for executives, finance, and HR.",
        bullets: [
          "Drag-and-drop metrics",
          "Saved views",
          "Scheduled emails",
          "CSV and PDF exports",
        ],
      },
    ],
    complianceNote:
      "CircleWorks analytics supports U.S. reporting needs by keeping workforce, payroll, demographic, and compensation data structured for audits, pay equity reviews, ACA, and EEO workflows.",
    integrations: [
      "Tableau",
      "Power BI",
      "Looker",
      "Snowflake",
      "Google Sheets",
    ],
    faqs: [
      {
        q: "Can dashboards be customized?",
        a: "Yes. Admins can build and save custom dashboard views.",
      },
      {
        q: "Can reports be scheduled?",
        a: "Yes. Reports can be emailed on a recurring schedule.",
      },
      {
        q: "Does Analytics include payroll cost?",
        a: "Yes. Payroll, employer taxes, benefits, and headcount costs can be analyzed together.",
      },
      {
        q: "Can data export to BI tools?",
        a: "Yes. Exports and integrations support downstream BI workflows.",
      },
      {
        q: "Can managers have limited dashboards?",
        a: "Yes. Permissions control which teams and fields a manager can see.",
      },
      {
        q: "Does Analytics support pay equity work?",
        a: "Yes. Compensation views help identify outliers and prepare review conversations.",
      },
    ],
  },
};
