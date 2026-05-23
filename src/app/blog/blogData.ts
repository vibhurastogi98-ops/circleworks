export const BLOG_CATEGORIES = [
  "All",
  "Payroll",
  "Compliance",
  "HR Tips",
  "Benefits",
  "Templates",
  "State Guides",
  "Case Studies",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogAuthor = {
  name: string;
  role: string;
  initials: string;
  avatarGradient: string;
  bio: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: Exclude<BlogCategory, "All">;
  author: BlogAuthor;
  publishedAt: string;
  displayDate: string;
  readingTime: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  popular?: boolean;
  toc: { id: string; title: string }[];
  content: string;
};

const authors = {
  sarah: {
    name: "Sarah Thompson",
    role: "Payroll Strategy Lead",
    initials: "ST",
    avatarGradient: "from-blue-600 to-cyan-500",
    bio: "Sarah leads payroll strategy at CircleWorks and writes about multi-state payroll, tax operations, and the systems US companies need as they scale.",
  },
  marcus: {
    name: "Marcus Reed",
    role: "Compliance Counsel",
    initials: "MR",
    avatarGradient: "from-emerald-600 to-teal-500",
    bio: "Marcus turns changing federal and state labor rules into practical compliance playbooks for HR teams, finance leaders, and operators.",
  },
  elena: {
    name: "Elena Cruz",
    role: "People Operations Advisor",
    initials: "EC",
    avatarGradient: "from-indigo-600 to-blue-500",
    bio: "Elena advises growing companies on onboarding, benefits, performance, and employee experience programs that stay simple as teams grow.",
  },
};

export const blogPosts: BlogPost[] = [
  {
    slug: "state-of-us-payroll-2026",
    title: "The State of US Payroll 2026: Consolidation Is the New Standard",
    description:
      "Why US companies are replacing fragmented payroll, HR, benefits, and compliance tools with one connected operating system.",
    excerpt:
      "Fragmented payroll stacks are getting expensive. Here is why finance and HR teams are consolidating systems before their next growth stage.",
    category: "Payroll",
    author: authors.sarah,
    publishedAt: "2026-05-14",
    displayDate: "May 14, 2026",
    readingTime: "10 min read",
    image: "from-blue-700 via-cyan-600 to-slate-900",
    imageAlt: "Payroll analytics dashboard illustration",
    featured: true,
    popular: true,
    toc: [
      { id: "why-consolidation", title: "Why consolidation is accelerating" },
      { id: "hidden-costs", title: "The hidden costs of payroll sprawl" },
      { id: "what-to-centralize", title: "What to centralize first" },
      { id: "migration-plan", title: "A safer migration plan" },
    ],
    content: `
Payroll used to be a back-office workflow. In 2026, it is the operating layer that touches tax, time, benefits, onboarding, accounting, compliance, and employee trust.

<h2 id="why-consolidation">Why consolidation is accelerating</h2>

US companies are moving away from point solutions because every handoff creates a reconciliation problem. Time data needs payroll context. Benefits deductions need eligibility context. Payroll journal entries need department and entity context. When those systems live apart, the finance team becomes the integration layer.

The companies moving fastest are not choosing one platform because it looks cleaner. They are doing it because clean data compounds. One employee record means fewer duplicate fields, fewer stale exports, and fewer last-minute payroll corrections.

<h2 id="hidden-costs">The hidden costs of payroll sprawl</h2>

The subscription line items are easy to count. The operational drag is harder to see. Payroll sprawl shows up as manual CSV uploads, state tax notices, duplicate employee profiles, missed benefit deductions, and accountants waiting on journal entry exports.

For a 150-person company, even a few hours of reconciliation per pay period can become a meaningful finance cost. More importantly, it puts the company at risk when tax filings, employee classifications, and pay calculations depend on stale data.

<h2 id="what-to-centralize">What to centralize first</h2>

Start with the systems that directly change gross-to-net payroll: employee records, compensation, tax setup, time, benefits deductions, and reimbursements. Those workflows should share the same source of truth before you optimize dashboards or downstream reporting.

- Employee profile and work location
- Compensation history and effective dates
- Time, PTO, overtime, and schedule rules
- Benefits deductions and employer contributions
- Payroll journal mappings

<h2 id="migration-plan">A safer migration plan</h2>

The lowest-risk migration path is phased but data-centered. Import employee records first, validate tax setup second, run parallel payroll third, and only then switch live processing. Keep finance, HR, and managers in the same validation loop so exceptions are found before payday.

CircleWorks was built around that sequence: migrate the employee record, validate payroll rules, connect time and benefits, then automate reporting and accounting exports from the same dataset.
`,
  },
  {
    slug: "hr-compliance-checklist-2026",
    title: "The 2026 HR Compliance Checklist for US Employers",
    description:
      "A practical HR compliance checklist covering wage rules, leave policies, employee files, audits, and reporting for US companies.",
    excerpt:
      "Use this checklist to pressure-test employee files, wage compliance, leave policies, and reporting before small gaps become expensive issues.",
    category: "Compliance",
    author: authors.marcus,
    publishedAt: "2026-05-10",
    displayDate: "May 10, 2026",
    readingTime: "8 min read",
    image: "from-emerald-700 via-teal-600 to-slate-900",
    imageAlt: "Compliance checklist illustration",
    popular: true,
    toc: [
      { id: "employee-files", title: "Employee file hygiene" },
      { id: "wage-hour", title: "Wage and hour review" },
      { id: "leave-policies", title: "Leave policy updates" },
      { id: "audit-trail", title: "Audit trail readiness" },
    ],
    content: `
Compliance work is easier when it is a calendar habit instead of a panic response. The strongest HR teams build quarterly reviews around employee data, wage rules, leave policies, and documented approvals.

<h2 id="employee-files">Employee file hygiene</h2>

Confirm every active employee has a complete profile, signed offer documentation, tax forms, required policy acknowledgements, and role classification. Missing files are rarely dramatic on day one, but they become painful during audits, disputes, and diligence.

<h2 id="wage-hour">Wage and hour review</h2>

Review overtime eligibility, exempt status, work locations, minimum wage rates, and meal or rest break obligations. Multi-state teams should confirm that local rules are applied based on where work happens, not only where headquarters sits.

<h2 id="leave-policies">Leave policy updates</h2>

Paid sick leave, family leave, and local ordinances continue to change across states and cities. Make sure handbook language, employee balances, payroll codes, and manager approval workflows all match the current policy.

<h2 id="audit-trail">Audit trail readiness</h2>

Every sensitive payroll or HR change should have a timestamp, actor, field summary, and reason. Compensation, tax, banking, role, and termination changes deserve special attention because they affect pay and compliance directly.
`,
  },
  {
    slug: "employee-handbook-template",
    title: "Employee Handbook Template: What to Include in 2026",
    description:
      "A practical employee handbook structure for US companies, including policies, acknowledgements, and update workflows.",
    excerpt:
      "A clean handbook helps managers answer consistently and gives employees one place to understand policies, benefits, and expectations.",
    category: "Templates",
    author: authors.elena,
    publishedAt: "2026-05-06",
    displayDate: "May 6, 2026",
    readingTime: "6 min read",
    image: "from-slate-800 via-blue-700 to-indigo-700",
    imageAlt: "Employee handbook template illustration",
    popular: true,
    toc: [
      { id: "core-sections", title: "Core handbook sections" },
      { id: "state-addenda", title: "State addenda" },
      { id: "acknowledgements", title: "Acknowledgements" },
      { id: "review-cycle", title: "Review cycle" },
    ],
    content: `
Your handbook should be useful enough for employees and structured enough for counsel. The best versions are clear, searchable, and versioned.

<h2 id="core-sections">Core handbook sections</h2>

Include employment basics, code of conduct, anti-harassment policies, timekeeping, payroll, benefits, leave, security, remote work, expenses, and termination procedures. Keep policy language precise, but avoid turning the handbook into a legal maze.

<h2 id="state-addenda">State addenda</h2>

Multi-state employers should separate company-wide policy from state-specific addenda. This makes updates easier when leave laws, paid sick time, or wage notices change in one jurisdiction.

<h2 id="acknowledgements">Acknowledgements</h2>

Collect signed acknowledgements for the handbook and material updates. Store them with the employee record so HR can quickly prove the employee received the policy.

<h2 id="review-cycle">Review cycle</h2>

Review the handbook at least annually and whenever the company enters a new state. Assign ownership to HR and legal, then track each update with an effective date and employee acknowledgement deadline.
`,
  },
  {
    slug: "benefits-that-compete",
    title: "Benefits That Compete Without Enterprise Complexity",
    description:
      "How growing companies can offer health, dental, vision, retirement, and lifestyle benefits without adding administrative drag.",
    excerpt:
      "Competitive benefits do not need to create another operational maze. The key is connecting eligibility, payroll deductions, and employee self-service.",
    category: "Benefits",
    author: authors.elena,
    publishedAt: "2026-04-28",
    displayDate: "Apr 28, 2026",
    readingTime: "7 min read",
    image: "from-rose-600 via-pink-500 to-slate-900",
    imageAlt: "Benefits enrollment illustration",
    toc: [
      { id: "modern-package", title: "The modern benefits package" },
      { id: "eligibility", title: "Eligibility and deductions" },
      { id: "employee-experience", title: "Employee experience" },
    ],
    content: `
Benefits administration breaks down when eligibility, employee elections, carrier files, and payroll deductions are maintained in different systems.

<h2 id="modern-package">The modern benefits package</h2>

Most companies start with medical, dental, vision, and retirement. As they grow, they add life and disability, FSA or HSA programs, commuter benefits, and lifestyle spending accounts.

<h2 id="eligibility">Eligibility and deductions</h2>

The critical workflow is not enrollment alone. It is keeping payroll deductions aligned with elections, effective dates, qualifying life events, and employer contributions.

<h2 id="employee-experience">Employee experience</h2>

Employees should be able to compare plans, add dependents, see costs, and confirm elections without waiting for HR to translate carrier paperwork.
`,
  },
  {
    slug: "california-payroll-guide",
    title: "California Payroll Guide for Multi-State Employers",
    description:
      "A practical California payroll guide covering daily overtime, meal breaks, final pay, and local wage rules.",
    excerpt:
      "California payroll has stricter rules than federal payroll. Here is what multi-state employers need to handle before running payroll.",
    category: "State Guides",
    author: authors.marcus,
    publishedAt: "2026-04-21",
    displayDate: "Apr 21, 2026",
    readingTime: "9 min read",
    image: "from-orange-600 via-amber-500 to-slate-900",
    imageAlt: "California payroll rules illustration",
    toc: [
      { id: "daily-overtime", title: "Daily overtime" },
      { id: "meal-rest", title: "Meal and rest breaks" },
      { id: "final-pay", title: "Final pay rules" },
    ],
    content: `
California payroll requires employers to account for daily overtime, meal and rest period penalties, local wage ordinances, and strict final pay timing.

<h2 id="daily-overtime">Daily overtime</h2>

Unlike federal rules that focus primarily on weekly overtime, California also measures overtime by the day. This makes accurate time capture essential.

<h2 id="meal-rest">Meal and rest breaks</h2>

Missed meal or rest breaks can trigger premium pay. Payroll systems should identify exceptions before payroll approval, not after employees complain.

<h2 id="final-pay">Final pay rules</h2>

Final pay timing depends on whether an employee quits or is terminated. Late final wages can create waiting time penalties, so termination workflows need payroll visibility.
`,
  },
  {
    slug: "case-study-payroll-errors",
    title: "Case Study: Cutting Payroll Errors by 87%",
    description:
      "How a multi-location healthcare company reduced payroll errors and reclaimed finance time with CircleWorks.",
    excerpt:
      "A healthcare team with six locations replaced spreadsheet reconciliation with connected payroll, time, and compliance workflows.",
    category: "Case Studies",
    author: authors.sarah,
    publishedAt: "2026-04-15",
    displayDate: "Apr 15, 2026",
    readingTime: "5 min read",
    image: "from-cyan-700 via-blue-600 to-slate-900",
    imageAlt: "Healthcare payroll case study illustration",
    toc: [
      { id: "challenge", title: "The challenge" },
      { id: "solution", title: "The solution" },
      { id: "results", title: "The results" },
    ],
    content: `
The company was running payroll across multiple locations with shift differentials, overtime rules, and manual spreadsheet review every pay period.

<h2 id="challenge">The challenge</h2>

Payroll errors were damaging employee trust and creating long review cycles for finance. Every correction required HR, managers, and payroll to compare different data sources.

<h2 id="solution">The solution</h2>

CircleWorks connected employee records, time data, payroll rules, and audit history so approvals happened in one workflow.

<h2 id="results">The results</h2>

The company reduced payroll errors by 87%, saved three days per pay cycle, and gave managers a clearer approval process.
`,
  },
  {
    slug: "manager-hr-tips",
    title: "HR Tips for Managers Approving Time and PTO",
    description:
      "A manager-friendly guide to approving time, PTO, exceptions, and schedule changes without creating payroll issues.",
    excerpt:
      "Managers are the front line of payroll accuracy. These habits help them approve time and PTO with fewer corrections.",
    category: "HR Tips",
    author: authors.elena,
    publishedAt: "2026-04-08",
    displayDate: "Apr 8, 2026",
    readingTime: "4 min read",
    image: "from-violet-700 via-indigo-600 to-slate-900",
    imageAlt: "Manager time approval illustration",
    toc: [
      { id: "approve-early", title: "Approve early" },
      { id: "review-exceptions", title: "Review exceptions" },
      { id: "document-context", title: "Document context" },
    ],
    content: `
Managers do not need to become payroll experts, but they do need a reliable approval rhythm.

<h2 id="approve-early">Approve early</h2>

Time approvals should happen before payroll close, not during payroll processing. A weekly review prevents last-minute surprises.

<h2 id="review-exceptions">Review exceptions</h2>

Focus attention on missing punches, overtime spikes, PTO conflicts, and schedule mismatches. Those exceptions are where payroll errors usually start.

<h2 id="document-context">Document context</h2>

When a manager edits a time entry or approves an exception, the reason should live with the record. That context protects the company and helps payroll move faster.
`,
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getBlogPost(slug);
  const categoryMatches = blogPosts.filter(
    (post) => post.slug !== slug && post.category === current?.category,
  );
  const remaining = blogPosts.filter(
    (post) => post.slug !== slug && post.category !== current?.category,
  );

  return [...categoryMatches, ...remaining].slice(0, limit);
}

export function getFeaturedPost() {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0];
}
