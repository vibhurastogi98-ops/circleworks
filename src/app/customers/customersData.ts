export type Industry = "Startup" | "SMB" | "Mid-Market" | "Healthcare" | "Tech" | "Non-Profit";

export type Metric = {
  value: string;
  label: string;
};

export type CaseStudy = {
  slug: string;
  company: string;
  industry: Industry;
  location: string;
  employees: string;
  logoInitials: string;       // 2-char initials for logo placeholder
  accentColor: string;        // Tailwind bg colour class for the logo bg
  coverGradient: string;      // Tailwind gradient classes for card cover
  headlineQuote: string;      // short (≤15 words) for card
  metricHighlight: string;    // e.g. "87% reduction in payroll errors"
  // detail page
  challenge: string;
  solution: string;
  resultsNarrative: string;
  metrics: [Metric, Metric, Metric];
  pullQuote: string;
  author: string;
  authorRole: string;
  featured?: boolean;
  featuredExcerpt?: string;   // paragraph for the featured slot
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "meridian-health",
    company: "Meridian Health",
    industry: "Healthcare",
    location: "Chicago, IL",
    employees: "320 employees",
    logoInitials: "MH",
    accentColor: "bg-emerald-600",
    coverGradient: "from-emerald-600 to-teal-500",
    headlineQuote: "We went from payroll nightmares to payroll autopilot.",
    metricHighlight: "87% reduction in payroll errors",
    challenge: "Meridian Health was running a multi-state workforce across Illinois, Indiana, and Wisconsin. Their legacy ADP setup couldn't handle complex shift differentials for nurses, and manual tax reconciliation was eating 3 days of the finance team's time every pay cycle.",
    solution: "After migrating to CircleWorks in a single weekend, Meridian's payroll team configured shift differential rules, overnight premiums, and holiday pay — all in one automated engine. State tax filings for all three states now run automatically every pay period.",
    resultsNarrative: "Within 60 days of going live, Meridian slashed payroll errors, reclaimed hundreds of finance-hours, and got their entire 320-person workforce compliant across three states without a single penalty.",
    metrics: [
      { value: "87%", label: "Fewer payroll errors" },
      { value: "3 days", label: "Saved per pay cycle" },
      { value: "$62k", label: "Annual compliance savings" },
    ],
    pullQuote: "CircleWorks didn't just fix our payroll — it gave us our weekends back. The compliance engine has been flawless across all three states.",
    author: "Dr. Lisa Thorn",
    authorRole: "COO, Meridian Health",
    featured: true,
    featuredExcerpt: "When Meridian Health expanded from one clinic to six across three states, their payroll stack couldn't keep up. Hours of manual reconciliation. State tax errors. A mutinous finance team. CircleWorks migrated 320 employees in a single weekend — and Meridian hasn't looked back since.",
  },
  {
    slug: "vanta-labs",
    company: "Vanta Labs",
    industry: "Tech",
    location: "San Francisco, CA",
    employees: "48 employees",
    logoInitials: "VL",
    accentColor: "bg-violet-600",
    coverGradient: "from-violet-600 to-indigo-500",
    headlineQuote: "Onboarding a new engineer used to take a week. Now it's done before day 1.",
    metricHighlight: "5× faster engineer onboarding",
    challenge: "Vanta Labs was scaling engineering headcount 3× YoY but their HR stack was a patchwork of Lever, Rippling, and a homegrown onboarding script. New hires waited days for laptop provisioning and access grants.",
    solution: "CircleWorks unified ATS, HRIS, and Onboarding. The moment a candidate signed their offer, an automated flow provisioned their Okta account, ordered their MacBook via Kandji, and sent a personalized welcome Slack message — all before 9am on their start date.",
    resultsNarrative: "Vanta Labs now onboards engineers in under an hour. Offer-to-laptop-provisioned went from 7 business days to same-day. Recruiter time-to-fill dropped 40%.",
    metrics: [
      { value: "5×", label: "Faster engineer onboarding" },
      { value: "40%", label: "Faster time-to-fill" },
      { value: "0 days", label: "IT lag for new hires" },
    ],
    pullQuote: "New engineers arrive on day one with everything already set up. It's a completely different experience — and a big part of why we retain top talent.",
    author: "Priya Venkat",
    authorRole: "Head of Talent, Vanta Labs",
  },
  {
    slug: "suncrest-bakeries",
    company: "Suncrest Bakeries",
    industry: "SMB",
    location: "Austin, TX",
    employees: "87 employees",
    logoInitials: "SB",
    accentColor: "bg-amber-500",
    coverGradient: "from-amber-500 to-orange-400",
    headlineQuote: "Running payroll for 87 shift workers used to cost us half a day. Now it's 12 minutes.",
    metricHighlight: "12-min payroll runs (down from 4 hrs)",
    challenge: "Suncrest's 87 bakers and drivers worked rotating shifts across 5 locations. Calculating overtime, tip credits, and shift differentials in Excel took the owner half a day every bi-weekly cycle, often resulting in errors that eroded employee trust.",
    solution: "CircleWorks' Time & Scheduling module auto-pulled shift data directly into payroll. Texas-specific overtime and tip credit rules were configured once and applied automatically. The mobile clock-in with geo-fencing eliminated buddy punching and manual timesheet corrections.",
    resultsNarrative: "The owner runs payroll in 12 minutes on his phone. Employees get paid via 2-day direct deposit with zero errors. Turnover dropped 22% in 6 months.",
    metrics: [
      { value: "12 min", label: "Payroll run time (was 4hrs)" },
      { value: "22%", label: "Drop in employee turnover" },
      { value: "100%", label: "Texas compliance rate" },
    ],
    pullQuote: "I can run payroll from my phone at the bakery. It takes less time than brewing a pot of coffee.",
    author: "Marcus Webb",
    authorRole: "Owner, Suncrest Bakeries",
  },
  {
    slug: "nova-nonprofit",
    company: "Nova Community Fund",
    industry: "Non-Profit",
    location: "Denver, CO",
    employees: "34 employees",
    logoInitials: "NC",
    accentColor: "bg-rose-500",
    coverGradient: "from-rose-500 to-pink-400",
    headlineQuote: "CircleWorks gave us enterprise HR at a price our board approved.",
    metricHighlight: "$28k/year saved over previous provider",
    challenge: "Nova Community Fund was on a provider charging $22/employee/month for features they barely used. The board demanded a 30% cost reduction or HR cuts. Nova needed full compliance reporting for grant audits without the bloat.",
    solution: "CircleWorks' Starter plan cut their effective HR cost by 60%. Built-in compliance reports and EEO-1 exports satisfied their grant auditors without a single custom report. The accountant portal gave their external CPA direct export access.",
    resultsNarrative: "Nova saved $28k annually, aced two grant audits, and freed up 15 hours/month of staff time previously spent on manual reporting.",
    metrics: [
      { value: "$28k", label: "Annual savings" },
      { value: "2/2", label: "Grant audits passed" },
      { value: "15 hrs", label: "Saved per month on reports" },
    ],
    pullQuote: "Our board was skeptical that we could cut costs AND improve compliance. CircleWorks made that argument for us.",
    author: "Angela Price",
    authorRole: "Executive Director, Nova Community Fund",
  },
  {
    slug: "brightpath-clinics",
    company: "BrightPath Clinics",
    industry: "Healthcare",
    location: "Nashville, TN",
    employees: "210 employees",
    logoInitials: "BP",
    accentColor: "bg-cyan-600",
    coverGradient: "from-cyan-600 to-blue-500",
    headlineQuote: "We handle credentialing, HIPAA compliance, and payroll — all in one place.",
    metricHighlight: "100% HIPAA-compliant employee data",
    challenge: "BrightPath's 6-clinic network struggled with keeping provider credentials, HIPAA training records, and payroll in sync. Credential expiries were tracked in spreadsheets; a missed renewal in 2023 cost them a $40k insurance recredentialing fee.",
    solution: "CircleWorks' LMS and HRIS modules let BrightPath store credentialing dates as custom fields with expiry alerts. Automated HIPAA training assignments ensured every new hire completed required modules in their first week. Payroll mapped directly to Tennessee's complex healthcare shift rules.",
    resultsNarrative: "Zero missed credentials in 18 months. Every provider's HIPAA training is logged and auditable. The $40k credentialing issue is firmly in the past.",
    metrics: [
      { value: "0", label: "Missed credential renewals (18 mo)" },
      { value: "100%", label: "HIPAA training completion rate" },
      { value: "$40k", label: "Avoided in recredentialing fees" },
    ],
    pullQuote: "The automated credential alerts alone paid for CircleWorks in the first month.",
    author: "Dr. James Obi",
    authorRole: "Medical Director, BrightPath Clinics",
  },
  {
    slug: "arclight-software",
    company: "Arclight Software",
    industry: "Startup",
    location: "New York, NY",
    employees: "22 employees",
    logoInitials: "AS",
    accentColor: "bg-blue-600",
    coverGradient: "from-blue-600 to-cyan-500",
    headlineQuote: "We went from seed to Series A without hiring an HR person — CircleWorks was our HR team.",
    metricHighlight: "Series A closed with zero hr headcount",
    challenge: "Arclight was a 22-person seed-stage startup with zero HR infrastructure. Founders were manually processing payroll, tracking PTO in Notion, and storing offer letters in Google Drive. Investor due diligence surfaced serious compliance gaps.",
    solution: "CircleWorks was set up in 48 hours before their Series A diligence kicked off. All historical offer letters were imported, I-9 records digitized, and compliant New York payroll set up from scratch. The Series A closed with a clean HR data room.",
    resultsNarrative: "Arclight closed a $12M Series A with CircleWorks as their sole HR platform. The investors specifically cited clean people documentation as a diligence green flag.",
    metrics: [
      { value: "48 hrs", label: "To full HR compliance" },
      { value: "$12M", label: "Series A closed cleanly" },
      { value: "$0", label: "Additional HR headcount needed" },
    ],
    pullQuote: "Our lead investor said our people documentation was cleaner than companies 10× our size. That's entirely CircleWorks.",
    author: "Sam Hertz",
    authorRole: "CEO & Co-founder, Arclight Software",
  },
  {
    slug: "steadfast-logistics",
    company: "Steadfast Logistics",
    industry: "Mid-Market",
    location: "Dallas, TX",
    employees: "480 employees",
    logoInitials: "SL",
    accentColor: "bg-slate-700",
    coverGradient: "from-slate-700 to-slate-500",
    headlineQuote: "Managing 480 drivers across 8 states used to require a 3-person payroll team. Now it's one.",
    metricHighlight: "67% reduction in payroll headcount cost",
    challenge: "Steadfast's 480-driver fleet spanned 8 states, each with different wage rates, per diem rules, and DOT compliance requirements. A 3-person payroll team was running manual reconciliations weekly, and multi-state W-2 errors resulted in two IRS notices in 2022.",
    solution: "CircleWorks automated multi-state tax allocation based on where drivers worked each week, handled DOT per diem rules, and resolved the I-9 backlog in a single bulk upload session. The payroll team was reduced from 3 to 1 through natural attrition.",
    resultsNarrative: "One payroll admin now manages 480 employees across 8 states. Zero IRS notices in 18 months. Driver satisfaction scores on pay accuracy jumped to 98%.",
    metrics: [
      { value: "1", label: "Payroll admin for 480 employees" },
      { value: "0", label: "IRS notices in 18 months" },
      { value: "98%", label: "Driver pay-accuracy satisfaction" },
    ],
    pullQuote: "We went from three people drowning in multi-state payroll to one person running it in an afternoon. The ROI was immediate.",
    author: "Robert Dale",
    authorRole: "VP of Operations, Steadfast Logistics",
  },
  {
    slug: "kinetic-co",
    company: "Kinetic Co.",
    industry: "Tech",
    location: "Seattle, WA",
    employees: "135 employees",
    logoInitials: "KC",
    accentColor: "bg-fuchsia-600",
    coverGradient: "from-fuchsia-600 to-purple-500",
    headlineQuote: "CircleWorks AI Circe flagged a $180k FLSA overtime violation before it became a lawsuit.",
    metricHighlight: "$180k litigation risk avoided",
    challenge: "Kinetic's engineering managers were unknowingly misclassifying senior engineers as exempt, exposing the company to FLSA overtime liability. A departing employee hinted at a class action risk that legal had to investigate.",
    solution: "CircleWorks' Compliance module flagged 12 potentially misclassified employees during a routine audit. The AI Circe assistant generated a detailed remediation report. Kinetic voluntarily corrected classifications and back-paid $22k — avoiding a potential class action.",
    resultsNarrative: "Kinetic avoided an estimated $180k in litigation exposure for $22k of proactive back-pay. Their legal counsel called it the best ROI they'd seen on any software purchase.",
    metrics: [
      { value: "$180k", label: "Litigation risk avoided" },
      { value: "12", label: "Misclassified roles corrected" },
      { value: "100%", label: "FLSA compliance achieved" },
    ],
    pullQuote: "CircleWorks caught what our lawyers missed. The proactive compliance flagging is genuinely unlike anything we'd seen in an HR platform.",
    author: "Claire Nakamura",
    authorRole: "General Counsel, Kinetic Co.",
  },
  {
    slug: "pinecrest-academy",
    company: "Pinecrest Academy",
    industry: "Non-Profit",
    location: "Phoenix, AZ",
    employees: "95 employees",
    logoInitials: "PA",
    accentColor: "bg-green-600",
    coverGradient: "from-green-600 to-emerald-500",
    headlineQuote: "Benefits enrollment used to take our small team 6 weeks. With CircleWorks it's 4 days.",
    metricHighlight: "6 weeks → 4 days for open enrollment",
    challenge: "Pinecrest's 2-person HR team dreaded open enrollment season. Paper forms, carrier portals, and frantic phone calls consumed 6 weeks every autumn, with enrollment errors causing billing disputes that lasted into Q1.",
    solution: "CircleWorks' Benefits module let Pinecrest build an employee-facing enrollment wizard. Employees compared 3 medical plans, enrolled dependents, and e-signed their elections in under 20 minutes. Carrier data feeds updated automatically.",
    resultsNarrative: "Open enrollment completed in 4 days instead of 6 weeks. Zero billing disputes in the following quarter. HR reclaimed 150 hours of August and September time.",
    metrics: [
      { value: "4 days", label: "Open enrollment (was 6 weeks)" },
      { value: "150 hrs", label: "HR time reclaimed" },
      { value: "0", label: "Carrier billing disputes" },
    ],
    pullQuote: "I used to dread August. Now I actually look forward to open enrollment — it runs itself.",
    author: "Teresa Mills",
    authorRole: "HR Director, Pinecrest Academy",
  },
];

export function getRelatedStudies(slug: string, count = 3): CaseStudy[] {
  return CASE_STUDIES.filter(s => s.slug !== slug).slice(0, count);
}
