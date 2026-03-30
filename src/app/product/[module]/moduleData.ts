export type ModuleData = {
  name: string;
  accent: "blue" | "emerald" | "purple" | "green" | "orange" | "rose" | "cyan" | "red" | "fuchsia" | "indigo";
  hero: {
    headline: string;
    stat: string;
  };
  testimonials: {
    quote: string;
    author: string;
    role: string;
  }[];
  howItWorks: {
    title: string;
    desc: string;
  }[];
  features: {
    headline: string;
    description: string;
    bullets: string[];
  }[];
  complianceNote?: string;
  integrations: string[];
  faqs: {
    q: string;
    a: string;
  }[];
};

export const MODULE_DATA: Record<string, ModuleData> = {
  "payroll": {
    name: "Payroll",
    accent: "blue",
    hero: {
      headline: "Run payroll for 50 employees in 4 minutes.",
      stat: "Automated local, state, and federal tax filings across all 50 US states. Guaranteed error-free."
    },
    testimonials: [
      { quote: "CircleWorks cut our payroll processing time by 90%. We used to spend a whole day on it, now it's done before my morning coffee.", author: "Sarah Jenkins", role: "VP of People, Acme Corp" },
      { quote: "The auto-tax filing feature is a lifesaver. No more worrying about missing state deadlines or miscalculating unemployment taxes.", author: "Michael Chen", role: "Founder, Zenith SaaS" },
      { quote: "Switching from our legacy provider was seamless. The onboarding team imported everything perfectly.", author: "Emily Roberts", role: "Director of HR, FinTech Solutions" }
    ],
    howItWorks: [
      { title: "Sync Time", desc: "Hours, PTO, and expenses automatically flow into payroll. No manual data entry." },
      { title: "Review & Approve", desc: "Review the automated calculations, preview the cash requirements, and click approve." },
      { title: "Paid & Filed", desc: "Employees get paid via 2-day direct deposit. Taxes are filed and paid automatically." }
    ],
    features: [
      {
        headline: "Auto-Pilot Tax Engine",
        description: "Never calculate a tax bracket again. CircleWorks automatically calculates, files, and pays your local, state, and federal payroll taxes.",
        bullets: ["W-2 and 1099 generation at year-end", "State unemployment tax handling", "Automatic updates to tax rates", "Error-free guarantee"]
      },
      {
        headline: "Flexible Payment Options",
        description: "Pay your team the way you want, when you want. From standard 2-day direct deposit to paper checks.",
        bullets: ["2-Day Direct Deposit standard", "Off-cycle bonuses & reimbursements", "Contractor payments via check or DD", "Support for multiple bank accounts per person"]
      },
      {
        headline: "Deductions & Garnishments",
        description: "Handle complex post-tax deductions easily. We completely automate child support and tax levies.",
        bullets: ["Automated 401(k) and health deductions", "Child support garnishment routing", "Custom post-tax deductions", "Charitable contribution mapping"]
      }
    ],
    complianceNote: "We handle FICA, FUTA, and all 50-state unemployment filings natively. When compliance laws change, our tax engine updates instantly.",
    integrations: ["QuickBooks", "Xero", "NetSuite", "Plaid"],
    faqs: [
       { q: "How long does payroll Implementation take?", a: "Typically under a week! If you use our self-serve importer, you can run your first payroll in less than 24 hours." },
       { q: "Which states do you support?", a: "CircleWorks natively supports payroll, taxes, and compliance across all 50 U.S. states and Washington D.C." },
       { q: "Can I pay international contractors?", a: "Yes, our contractor payment engine supports global FX payouts in 150+ currencies." },
       { q: "What happens if there is a tax error?", a: "If CircleWorks makes a tax filing error, we guarantee to cover the penalties and fines." },
       { q: "Do you support multiple pay schedules?", a: "Absolutely. You can have weekly, bi-weekly, semi-monthly, or monthly schedules running concurrently." },
       { q: "Are W-2s filed automatically?", a: "Yes, W-2s and 1099s are generated, filed with the government, and delivered electronically to employees every January." }
    ]
  },
  "hris": {
    name: "HRIS",
    accent: "indigo",
    hero: {
      headline: "Your single source of truth.",
      stat: "Secure employee records, dynamic org charts, and custom fields that adapt to your business."
    },
    testimonials: [
      { quote: "Finally, all of our employee data is in one searchable place instead of scattered across 15 spreadsheets.", author: "David Kim", role: "Head of Operations" },
      { quote: "The dynamic org charts update instantly when someone changes roles. It's beautiful and highly functional.", author: "Jessica Albas", role: "People Ops Mgr" },
      { quote: "Custom fields allowed us to track unique certifications for our nursing staff right inside their profile.", author: "Dr. L. Thorne", role: "Clinic Director" }
    ],
    howItWorks: [
      { title: "Import Data", desc: "Easily bulk import your existing team data via CSV or direct API integrations." },
      { title: "Customize Fields", desc: "Create fields unique to your company—like t-shirt size, dietary restrictions, or specialized skills." },
      { title: "Empower Employees", desc: "Give employees self-service access to update personal data and download documents." }
    ],
    features: [
      {
        headline: "Dynamic Employee Directory",
        description: "A beautiful, searchable directory that helps your team put names to faces and understand reporting structures.",
        bullets: ["Visual, interactive org charts", "Rich employee profiles", "Search by department, skill, or location", "Pronouns and name pronunciation guides"]
      },
      {
        headline: "Secure Document Management",
        description: "Store confidential documents alongside employee profiles. Send, sign, and store securely.",
        bullets: ["Built-in e-signatures", "Role-based document access", "Audit trails for compliance", "Bulk document requests"]
      },
      {
        headline: "Automated Workflows",
        description: "Trigger actions based on HRIS data changes. If an employee is promoted, automatically notify IT and update payroll.",
        bullets: ["Trigger-based automations", "Promotion workflows", "Role change approvals", "Custom notification routing"]
      }
    ],
    integrations: ["Okta", "Google Workspace", "Microsoft Entra", "Slack"],
    faqs: [
      { q: "Is the data encrypted?", a: "Yes, all data is encrypted at rest using AES-256 and in transit via TLS 1.3. We are SOC 2 Type II certified." },
      { q: "Can I restrict who sees salary info?", a: "Absolutely. Our granular role-based access control (RBAC) ensures only authorized managers or HR can see compensation." },
      { q: "Do employees get their own login?", a: "Yes, employees get self-serve portal access to view org charts, update personal info, and access paystubs." },
      { q: "Are org charts exportable?", a: "Yes, org charts can be exported as high-res PDFs or PNGs for board presentations." },
      { q: "Can we track equipment assigned to employees?", a: "Yes, you can create custom fields for asset tracking, entering laptop serial numbers and software licenses." },
      { q: "Is there a limit on document storage?", a: "No! All CircleWorks plans include unlimited cloud document storage." }
    ]
  },
  "ats": {
    name: "Hiring / ATS",
    accent: "emerald",
    hero: {
      headline: "Hire the best, faster.",
      stat: "Cut time-to-hire by 40% with collaborative scorecards and automated interview scheduling."
    },
    testimonials: [
      { quote: "Our engineering and design teams can finally collaborate on candidate feedback in real-time.", author: "Mark Zuckerberg", role: "Director of Talent" },
      { quote: "Automated staging moved our candidate pipeline 3x faster than manual email wrangling.", author: "Priya V.", role: "Sr. Recruiter" },
      { quote: "The branded career page took us 10 minutes to build and looks incredibly professional.", author: "Tom R.", role: "CEO" }
    ],
    howItWorks: [
      { title: "Publish Postings", desc: "Create a job requisition and push it to 100+ job boards natively." },
      { title: "Track Pipeline", desc: "Move candidates through customizable drag-and-drop interview stages." },
      { title: "Send Offer", desc: "Generate a beautiful e-signable offer letter pulling direct from the ATS data." }
    ],
    features: [
      {
        headline: "Branded Career Pages",
        description: "Attract top talent with a beautiful, mobile-optimized careers page that perfectly matches your company brand.",
        bullets: ["No-code page builder", "Custom domains supported", "Mobile-optimized forms", "Culture video embeds"]
      },
      {
        headline: "Collaborative Interviewing",
        description: "Keep the whole hiring team aligned. Scorecards ensure unbiased, structured interviews.",
        bullets: ["Standardized rating scales", "Hidden feedback until submitted", "Mention/ping team members", "Automated interview reminders"]
      },
      {
        headline: "Offer Staging & Background Checks",
        description: "Seamlessly transition from 'Yes' to 'Hired'. Generate offers and kick off background checks in one click.",
        bullets: ["Dynamic offer templates", "E-signatures built-in", "Integrated background checks via Checkr", "One-click conversion to HRIS"]
      }
    ],
    integrations: ["LinkedIn", "Indeed", "Checkr", "Google Calendar"],
    faqs: [
      { q: "Does the ATS post to external job boards?", a: "Yes, we syndicate to Indeed, LinkedIn, ZipRecruiter, and Glassdoor automatically." },
      { q: "Can candidates apply via mobile?", a: "Yes, our application flows are fully responsive and allow resume parsing from mobile devices." },
      { q: "How do interviewers sync calendars?", a: "We integrate directly with Google Workspace and Microsoft 365 to pull real-time availability." },
      { q: "Can I customize the interview stages?", a: "Absolutely. You can build unique pipelines for Engineering vs. Sales vs. Support." },
      { q: "Are background checks included?", a: "The integration is native, but background check processing fees are billed directly via our partner Checkr." },
      { q: "How does an applicant become an employee?", a: "Once the offer is e-signed, click 'Hire' and their ATS profile automatically ports into the HRIS and Payroll systems." }
    ]
  },
  "onboarding": {
    name: "Onboarding",
    accent: "purple",
    hero: {
      headline: "A flawless day one.",
      stat: "Automate IT provisioning, W-4 collection, and welcome tasks so new hires hit the ground running."
    },
    testimonials: [
      { quote: "Our new engineers used to wait 3 days for laptop access. Now it's ready before they walk in the door.", author: "IT Manager", role: "Tech Innovators" },
      { quote: "The automated intro emails make everyone feel so welcome. It shifted our whole culture.", author: "HR Director", role: "Retail Co." },
      { quote: "I no longer have to chase people for their I-9 documents. The system does it for me.", author: "Compliance Officer", role: "Banking Corp" }
    ],
    howItWorks: [
      { title: "Trigger Onboarding", desc: "Once hired in the ATS, the onboarding workflow automatically kicks off." },
      { title: "Tasks Assigned", desc: "IT, HR, and Managers get automated checklists to prepare for the new hire." },
      { title: "Self-Serve Welcome", desc: "The new hire logs in to complete tax forms, read handbooks, and learn about the company." }
    ],
    features: [
      {
        headline: "Automated Task Checklists",
        description: "Ensure nothing slips through the cracks. Assign tasks to specific departments when a hire is confirmed.",
        bullets: ["Role-based task assignment", "Automated email reminders", "IT hardware provisioning workflows", "Manager welcome prompts"]
      },
      {
        headline: "Digital I-9s & W-4s",
        description: "Ditch the paper. Collect all federal and state-level tax forms digitally before their first day.",
        bullets: ["Built-in federal W-4", "State-specific withholding forms", "Digital I-9 verification", "Secure SSN collection"]
      },
      {
        headline: "Built-in E-Verify",
        description: "Instantly confirm employment eligibility with the US Department of Homeland Security.",
        bullets: ["Direct DHS integration", "Instant results", "Compliance audit trails", "Automated photo matching"]
      }
    ],
    complianceNote: "CircleWorks securely stores digitized I-9 forms and integrates directly with the DHS E-Verify system to ensure you remain fully compliant with US labor laws.",
    integrations: ["E-Verify", "Okta", "Kandji", "Slack"],
    faqs: [
      { q: "Can I customize the welcome packet?", a: "Yes, you can embed welcome videos, CEO messages, and company handbooks natively." },
      { q: "Are IT accounts created automatically?", a: "Yes, via our Okta and Google Workspace integrations, user accounts can be provisioned automatically." },
      { q: "What is E-Verify?", a: "It's an internet-based system that compares I-9 info to government records to confirm employment eligibility." },
      { q: "Do employees have an onboarding portal?", a: "Yes, new hires get a secure link to complete their tasks on mobile or desktop." },
      { q: "Can we have different workflows by department?", a: "Yes! A warehouse worker can have a totally different checklist than a software engineer." },
      { q: "Are signatures legally binding?", a: "Yes, our e-signatures comply with the US ESIGN Act." }
    ]
  },
  "benefits": {
    name: "Benefits",
    accent: "green",
    hero: {
      headline: "World-class health and wealth.",
      stat: "Offer Fortune 500 benefits to your team effortlessly with built-in broker administration."
    },
    testimonials: [
       { quote: "Open enrollment used to be a month of hell. Now our employees do it themselves in 15 minutes.", author: "Rebecca T.", role: "HR Consultant" },
       { quote: "We finally afford competitive 401(k) matching thanks to the streamlined integrations.", author: "Stan P.", role: "CFO" },
       { quote: "The benefits dashboard is so clear, my team actually understands what they're enrolled in.", author: "L. Knope", role: "Gov Official" }
    ],
    howItWorks: [
       { title: "Build Packages", desc: "Work with our brokers (or bring yours) to select medical, dental, and retirement plans." },
       { title: "Employee Selection", desc: "Employees log in, compare plans, and enroll via an intuitive shopping-cart experience." },
       { title: "Auto-Deductions", desc: "Premiums and 401(k) contributions automatically map to payroll deductions instantly." }
    ],
    features: [
       {
          headline: "Painless Open Enrollment",
          description: "A beautiful, step-by-step wizard helps employees choose the best plans for their families.",
          bullets: ["Side-by-side plan comparisons", "Dependent tracking", "E-signature collection", "Mobile-friendly enrollment"]
       },
       {
          headline: "Bring Your Own Broker (BYOB)",
          description: "Use CircleWorks brokers, or grant your existing broker access to manage your platform.",
          bullets: ["Broker dashboard access", "Carrier feed integrations", "ACA compliance tracking", "Custom plan building"]
       },
       {
          headline: "HSA, FSA, & Commuter",
          description: "Easily administer tax-advantaged accounts directly through the platform.",
          bullets: ["Pre-tax transit benefits", "Flexible Spending Accounts", "Health Savings Accounts integration", "Automated compliance checks"]
       }
    ],
    complianceNote: "We handle the heavy lifting for Affordable Care Act (ACA) compliance, automatically generating and filing 1094-C and 1095-C forms at year-end.",
    integrations: ["Guideline 401k", "Human Interest", "BlueCross", "Kaiser Permanente"],
    faqs: [
       { q: "Do I have to use your brokers?", a: "No, you can bring your own broker. We provide them a partner portal to administer your plans." },
       { q: "Does benefits billing map to payroll?", a: "Yes, whatever an employee selects during enrollment perfectly maps to a pre-tax or post-tax deduction in payroll." },
       { q: "Can we offer an HSA?", a: "Yes, HSAs and FSAs are fully supported." },
       { q: "How is ACA compliance handled?", a: "We monitor your full-time equivalent (FTE) count and automatically generate the necessary 1094/1095 forms for the IRS." },
       { q: "Do you support life insurance?", a: "Yes, both employer-sponsored and voluntary supplementary life insurance plans are supported." },
       { q: "Can employees access their ID cards?", a: "Yes, employees can upload photos of their digital ID cards directly into their self-serve wallet." }
    ]
  },
  "time-tracking": {
    name: "Time & Scheduling",
    accent: "orange",
    hero: {
      headline: "Track every hour precisely.",
      stat: "Eliminate buddy-punching and timesheet math errors with geo-fenced mobile clock-ins."
    },
    testimonials: [
       { quote: "The geo-fencing feature ensured our contractors were actually on the job site when they clocked in.", author: "Foreman Dan", role: "Construction Inc." },
       { quote: "Timesheets route directly to payroll. It saved us thousands in manual entry errors.", author: "Retail Manager", role: "Coffee Shop" },
       { quote: "Employees love the app. Requesting time off takes two taps.", author: "Sarah W.", role: "Operations" }
    ],
    howItWorks: [
       { title: "Schedule Shifts", desc: "Drag and drop shifts for your team. Publish instantly to their mobile apps." },
       { title: "Clock In/Out", desc: "Employees use their phone, a kiosk, or Slack to punch in." },
       { title: "Sync to Pay", desc: "Managers approve timesheets, and hours sync to payroll automatically." }
    ],
    features: [
       {
          headline: "Geo-Fenced Clock Ins",
          description: "Ensure employees are securely at the job site before they can punch the clock.",
          bullets: ["GPS location stamping", "IP address restrictions", "Photo capture on clock-in (Kiosk Mode)", "Hardware terminal integrations"]
       },
       {
          headline: "Drag & Drop Scheduling",
          description: "Visually build out weekly shifts. Get alerts for overlapping schedules and overtime risks.",
          bullets: ["Shift swapping by employees", "Labor cost forecasting", "Overtime risk alerts", "Publish shifts via SMS"]
       },
       {
          headline: "Time Off (PTO) Engine",
          description: "Create unlimited custom policies. Accruals calculate automatically every pay period.",
          bullets: ["Tenure-based accrual rules", "Manager approval workflows", "Shared company out-of-office calendar", "Negative balance limits"]
       }
    ],
    integrations: ["Slack", "Google Calendar", "Square Point of Sale", "Linear"],
    faqs: [
       { q: "Can employees clock in via SMS?", a: "Yes, employees without smartphones can clock in/out via simple SMS codes." },
       { q: "How do PTO accruals work?", a: "You define the policy (e.g., 4 hours per pay period, capping at 80). The system does the math silently." },
       { q: "Can we track time to specific projects?", a: "Yes, employees can select a specific Job or Project code when clocking in for detailed cost reporting." },
       { q: "Is overtime calculated automatically?", a: "Yes. The system automatically adheres to FLSA standards and state-specific daily overtime laws (like California's)." },
       { q: "Can we use a physical time clock?", a: "Yes, you can run our 'Kiosk' app on any iPad mounted to a wall to act as a physical punch clock." },
       { q: "Do managers get alerts for missed punches?", a: "Yes, managers get push notifications if someone is late or forgets to clock out." }
    ]
  },
  "expenses": {
    name: "Expenses",
    accent: "rose",
    hero: {
      headline: "Reimburse faster than ever.",
      stat: "Cut expense processing time by 80% with OCR receipt scanning and direct-to-payroll repayment."
    },
    testimonials: [
       { quote: "Expense reports used to be a nightmare of stapled receipts. Now it's a quick photo on a phone.", author: "Sales Rep", role: "Field Ops" },
       { quote: "Paying reimbursements directly on the paycheck is brilliant. Employees get money faster, accounting does less work.", author: "CFO", role: "Logistics LLC" },
       { quote: "The policy enforcement meant I didn't have to argue over a $100 dinner that breached our $50 limit.", author: "Finance Mgr", role: "Tech Co" }
    ],
    howItWorks: [
       { title: "Snap a Photo", desc: "Employees take a picture of their receipt using the CircleWorks mobile app." },
       { title: "AI Extraction", desc: "Our OCR instantly extracts the merchant, date, amount, and suggests a category." },
       { title: "Manager Approval", desc: "Managers approve the expense, and it's automatically added to the next payroll run." }
    ],
    features: [
       {
          headline: "OCR Receipt Scanning",
          description: "No more manual data entry. Our AI reads the receipt and fills out the expense line accurately.",
          bullets: ["Multi-currency support", "Itemized receipt splitting", "Auto-category matching", "Mobile app native flow"]
       },
       {
          headline: "Automated Policy Rules",
          description: "Set hard limits to prevent out-of-policy spending before it even reaches a manager.",
          bullets: ["Per diem limits", "Category-specific hard caps", "Required receipt thresholds", "Flagged duplicate detection"]
       },
       {
          headline: "Payroll Integration",
          description: "Forget cutting separate checks for expenses. Approved totals are automatically added to the employee's next direct deposit as non-taxable income.",
          bullets: ["Non-taxable addition to payroll", "Instant ledger syncing via Xero/QBO", "Fast-track immediate reimbursement option", "Clean audit trails"]
       }
    ],
    integrations: ["Ramp", "Brex", "Expensify", "QuickBooks"],
    faqs: [
       { q: "Do expenses affect payroll taxes?", a: "No, approved reimbursements map directly to a non-taxable addition code in the payroll engine." },
       { q: "Can we issue corporate cards?", a: "While we don't issue cards natively, we integrate directly with Ramp and Brex to sync corporate card swiping." },
       { q: "Does the system catch duplicate receipts?", a: "Yes, our OCR compares date, merchant, and amount to flag potential duplicate submissions." },
       { q: "Can approvals be routed by department?", a: "Yes, you can set rules so Marketing expenses go to the CMO, and Engineering to the CTO." },
       { q: "What currencies are supported?", a: "Receipts can be scanned in over 150 currencies and will auto-convert based on the day's exchange rate." },
       { q: "Do employees have to wait for the payroll cycle?", a: "Managers can optionally flag an expense for 'Immediate Payout' which initiates an ACH transfer right away." }
    ]
  },
  "performance": {
    name: "Performance & Learning",
    accent: "cyan",
    hero: {
      headline: "Scale growth and feedback.",
      stat: "Build a high-performance culture with continuous 1-on-1s, 360° reviews, and goal tracking."
    },
    testimonials: [
       { quote: "Performance reviews are actually meaningful now, not just a stressful annual checklist.", author: "VP Engineering", role: "SaaS Firm" },
       { quote: "OKRs are finally visible to the whole company. Alignment has never been better.", author: "CEO", role: "Growth Stage Startup" },
       { quote: "The LMS helps us ensure every rep is certified on our new products automatically.", author: "Sales Enablement", role: "B2B Corp" }
    ],
    howItWorks: [
       { title: "Set Goals", desc: "Establish company OKRs and cascade them down to department and individual levels." },
       { title: "Track Continuously", desc: "Managers and direct reports use shared agendas for weekly 1-on-1 check-ins." },
       { title: "Review & Reward", desc: "Run bi-annual 360° reviews that tie directly into compensation modeling." }
    ],
    features: [
       {
          headline: "Strategic OKRs & Goals",
          description: "Everyone knows what they are working toward. Track qualitative and quantitative goals transparently.",
          bullets: ["Company, Department, & Individual goals", "Visual progress tracking", "Integrates with Slack for updates", "Status risk flags"]
       },
       {
          headline: "Dynamic 360° Reviews",
          description: "Run comprehensive performance cycles without the administrative headache. Collect peer, manager, and self-reviews.",
          bullets: ["Customizable questionnaires", "Automated reviewer nomination", "Calibration 9-box grids", "Manager summary reports"]
       },
       {
          headline: "Integrated LMS",
          description: "Upload videos, SCORM files, and quizzes to ensure continuous upskilling.",
          bullets: ["Course builder", "Compliance training tracking", "Certification expirations", "Reporting on course completion"]
       }
    ],
    integrations: ["Lattice", "CultureAmp", "Slack", "Microsoft Teams"],
    faqs: [
       { q: "Can we customize the review questions?", a: "Yes, you can build entirely custom templates using rating scales, short answers, or multiple choice." },
       { q: "Are reviews anonymous?", a: "You can configure peer reviews to be fully attributed, completely anonymous, or visible only to the manager." },
       { q: "How do 1-on-1s work?", a: "Managers and employees get a shared digital notepad to collaboratively build an agenda before the meeting." },
       { q: "Can we tie performance to pay?", a: "Yes, performance scores flow directly into our Compensation Modeling tool to help calculate raises and bonuses." },
       { q: "Does the LMS support video?", a: "Yes, you can natively host MP4s or embed YouTube/Vimeo links for training courses." },
       { q: "Do you provide anti-harassment training?", a: "Yes, our Compliance module includes pre-built, state-certified anti-harassment training courses." }
    ]
  },
  "compliance": {
    name: "Compliance",
    accent: "red",
    hero: {
      headline: "Stay entirely legal in all 50 states.",
      stat: "Prevent costly fines with automatic labor law updates, state registrations, and proactive alerts."
    },
    testimonials: [
       { quote: "I used to lose sleep over state tax registrations when we opened new offices. Now CircleWorks just handles it.", author: "Founder", role: "Tech Start-up" },
       { quote: "The automated EEO-1 reporting saved us two weeks of data pulling.", author: "HR Director", role: "Manufacturing" },
       { quote: "Digital labor law posters mean we don't have to mail physical bulletin boards to our remote workers.", author: "People Ops", role: "Remote-First Agency" }
    ],
    howItWorks: [
       { title: "We Monitor", desc: "Our internal team of compliance experts and algorithms monitor federal, state, and local law changes." },
       { title: "You Get Alerted", desc: "If a minimum wage increases in a city where you have an employee, you get an instant dashboard alert." },
       { title: "Automatic Updates", desc: "Payroll taxes and required filings adjust automatically in the background." }
    ],
    features: [
       {
          headline: "State Tax Registration",
          description: "Hiring in a new state? We automatically file the paperwork to register you with the state's Department of Revenue and Labor.",
          bullets: ["Automated UI/SUI account creation", "Power of Attorney handling", "Local tax jurisdiction mapping", "Status tracking dashboard"]
       },
       {
          headline: "Automated Reporting (ACA / EEO)",
          description: "End-of-year compliance forms are stressful. We generate and electronically file them for you.",
          bullets: ["ACA 1094-C and 1095-C filing", "EEO-1 diversity data reports", "New hire reporting to state agencies", "Workers Comp audit reports"]
       },
       {
          headline: "Minimum Wage & Poster Monitoring",
          description: "Keep your remote and in-office teams compliant with local labor protections.",
          bullets: ["City/State minimum wage alerts", "Digital labor law e-posters", "Automated harassment training assignments", "Compliance sign-off tracking"]
       }
    ],
    complianceNote: "CircleWorks acts as your compliance shield across the United States. We actively monitor the Department of Labor (DOL) and all 50 state agencies.",
    integrations: ["EEO-1 Portal", "State Agencies", "IRS FIRE System", "E-Verify"],
    faqs: [
       { q: "Do you automatically register us in new states?", a: "Yes, if you enter an address in a state you aren't registered in, our backend automatically initiates the UI/SUI registration process." },
       { q: "Do you provide labor law posters?", a: "Yes, we provide digital e-posters for remote workers via the portal, and can ship physical posters to your offices." },
       { q: "What is EEO-1 reporting?", a: "Firms with 100+ employees must report workforce demographics to the EEOC. We auto-generate the exact data file you need to upload." },
       { q: "Does the system catch minimum wage violations?", a: "Yes. If an hourly rate falls below a local municipal minimum wage, payroll will flag a hard blocker until corrected." },
       { q: "Can you handle local / city taxes?", a: "Yes, we support highly complex local taxes including NYC, Yonkers, Ohio localities, and PA locals." },
       { q: "What if there is a penalty?", a: "If our system calculates a tax wrong or misses an automated filing deadline, we pay the penalty." }
    ]
  },
  "reporting": {
    name: "Analytics",
    accent: "fuchsia",
    hero: {
      headline: "Decisive board-ready insights.",
      stat: "Turn raw HR and payroll data into clear visualizations, forecasting, and actionable intelligence."
    },
    testimonials: [
       { quote: "For the first time, our CFO and HR teams are looking at the exact same numbers for headcount cost.", author: "President", role: "Financial Services" },
       { quote: "The attrition prediction model helped us identify a flight risk in engineering before they quit.", author: "Talent Director", role: "Software Inc." },
       { quote: "Exporting clean, formatted reports directly to PDF for board meetings saves me hours.", author: "COO", role: "Healthcare Network" }
    ],
    howItWorks: [
       { title: "Data Aggregates", desc: "Payroll, time, performance, and HRIS data perfectly unify in the analytics engine natively." },
       { title: "Select a Report", desc: "Choose from 40+ pre-built templates or drag-and-drop your own metrics." },
       { title: "Export & Share", desc: "Schedule reports to hit your inbox weekly, or export directly to CSV and PDF." }
    ],
    features: [
       {
          headline: "Headcount & Burn Forecasting",
          description: "See exactly how much revenue you are spending on payroll and project costs into the next quarters.",
          bullets: ["Fully-loaded cost modeling (taxes + benefits)", "Department-level burn rates", "Turnover rate trending", "Hiring plan forecasting"]
       },
       {
          headline: "Custom Dashboard Builder",
          description: "Don't settle for static charts. Build your own dashboards and pin the metrics that matter most.",
          bullets: ["Drag-and-drop UI charts", "Cross-module data joining", "Saved custom reports to library", "Role-based Dashboard sharing"]
       },
       {
          headline: "Diversity & Pay Equity",
          description: "Proactively monitor your workforce fairness. Detect unconscious biases in compensation.",
          bullets: ["Gender & ethnicity pay parity checks", "Promotion velocity analytics", "EEO-1 demographic breakdowns", "Age distribution visualizations"]
       }
    ],
    integrations: ["Tableau", "Snowflake", "PowerBI", "Looker"],
    faqs: [
       { q: "Can I export reports to Excel?", a: "Yes, every single report can be exported instantly to CSV or a formatted Excel file." },
       { q: "Can I schedule reports to be emailed?", a: "Absolutely. You can set a \"Weekly Overtime Risk\" report to email department heads every Friday at 8am." },
       { q: "Can the CEO have a dashboard without payroll access?", a: "Yes, granular permissions allow you to show cost aggregates without revealing individual salaries." },
       { q: "Do you have an API for data warehouses?", a: "Yes, Enterprise customers can utilize our GraphQL API or direct Snowflake sharing to pipe data internally." },
       { q: "What kind of 'AI Insights' do you offer?", a: "Our models look for anomalies, such as an unusually high spike in engineering overtime, or predicting flight-risk employees based on tenure and pay freezes." },
       { q: "Can we track time-to-hire?", a: "Yes, the ATS module feeds directly into Analytics, providing rich insights into recruiting bottlenecks and time-to-hire metrics." }
    ]
  }
};
