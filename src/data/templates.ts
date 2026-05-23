export const TEMPLATE_CATEGORIES = [
  "All",
  "Offer Letters",
  "Onboarding",
  "Policies",
  "Payroll",
  "Compliance",
] as const;

export const TEMPLATE_TYPES = [
  "Word (.docx)",
  "PDF",
  "Excel (.xlsx)",
] as const;

export type TemplateCategory = Exclude<(typeof TEMPLATE_CATEGORIES)[number], "All">;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export type TemplateResource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  downloads: number;
  fileName: string;
};

export const TEMPLATES: TemplateResource[] = [
  {
    id: "offer-letter-us-general",
    slug: "offer-letter-template-us-general",
    title: "Offer Letter Template (US general)",
    description:
      "A customizable US offer letter template covering role details, compensation, start date, at-will language, benefits, contingencies, and acceptance terms.",
    category: "Offer Letters",
    type: "Word (.docx)",
    downloads: 1450,
    fileName: "offer-letter-template-us-general.docx",
  },
  {
    id: "employment-agreement-at-will-full-time",
    slug: "employment-agreement-at-will-full-time",
    title: "Employment Agreement (at-will, full-time)",
    description:
      "A full-time at-will employment agreement starter covering duties, compensation, confidentiality, company property, dispute terms, and termination language.",
    category: "Offer Letters",
    type: "Word (.docx)",
    downloads: 890,
    fileName: "employment-agreement-at-will-full-time.docx",
  },
  {
    id: "employee-handbook-75-page-starter",
    slug: "employee-handbook-template-75-page-starter",
    title: "Employee Handbook Template (75-page starter)",
    description:
      "A 75-page employee handbook starter with editable workplace policies, code of conduct, PTO, benefits, safety, remote work, and acknowledgment sections.",
    category: "Policies",
    type: "Word (.docx)",
    downloads: 3200,
    fileName: "employee-handbook-template-75-page-starter.docx",
  },
  {
    id: "i9-completion-checklist",
    slug: "i-9-completion-checklist",
    title: "I-9 Completion Checklist",
    description:
      "A step-by-step checklist for HR teams and new hires to complete Form I-9 on time, review acceptable documents, and retain records correctly.",
    category: "Compliance",
    type: "PDF",
    downloads: 2100,
    fileName: "i-9-completion-checklist.pdf",
  },
  {
    id: "payroll-calendar-2025-2026",
    slug: "payroll-calendar-2025-2026",
    title: "Payroll Calendar 2025/2026",
    description:
      "An editable payroll calendar with 2025 and 2026 pay dates, federal bank holidays, processing deadlines, and bi-weekly and semi-monthly schedules.",
    category: "Payroll",
    type: "Excel (.xlsx)",
    downloads: 5400,
    fileName: "payroll-calendar-2025-2026.xlsx",
  },
  {
    id: "new-hire-onboarding-checklist",
    slug: "new-hire-onboarding-checklist",
    title: "New Hire Onboarding Checklist",
    description:
      "A practical onboarding checklist covering pre-start tasks, Day 1 setup, required paperwork, IT access, manager intros, and 30/60/90-day check-ins.",
    category: "Onboarding",
    type: "PDF",
    downloads: 4100,
    fileName: "new-hire-onboarding-checklist.pdf",
  },
  {
    id: "annual-performance-review",
    slug: "performance-review-template-annual",
    title: "Performance Review Template (annual)",
    description:
      "An annual review template for goals, competencies, manager feedback, employee self-reflection, ratings, development plans, and follow-up actions.",
    category: "Policies",
    type: "Word (.docx)",
    downloads: 1800,
    fileName: "performance-review-template-annual.docx",
  },
  {
    id: "pto-request-form",
    slug: "pto-request-form",
    title: "PTO Request Form",
    description:
      "A standardized PTO request form for vacation, sick leave, unpaid leave, approvals, balances, dates requested, and manager notes.",
    category: "Policies",
    type: "PDF",
    downloads: 950,
    fileName: "pto-request-form.pdf",
  },
  {
    id: "expense-report-template",
    slug: "expense-report-template",
    title: "Expense Report Template",
    description:
      "An Excel expense report template for reimbursements, travel costs, receipts, project coding, approval status, and automatic totals.",
    category: "Payroll",
    type: "Excel (.xlsx)",
    downloads: 1200,
    fileName: "expense-report-template.xlsx",
  },
  {
    id: "remote-work-policy-template",
    slug: "remote-work-policy-template",
    title: "Remote Work Policy Template",
    description:
      "A remote work policy template covering eligibility, core hours, communication, security, equipment, expense rules, and performance expectations.",
    category: "Policies",
    type: "Word (.docx)",
    downloads: 2900,
    fileName: "remote-work-policy-template.docx",
  },
  {
    id: "non-disclosure-agreement-nda",
    slug: "non-disclosure-agreement-nda",
    title: "Non-Disclosure Agreement (NDA)",
    description:
      "A customizable NDA template for confidential information, exclusions, permitted disclosures, return of materials, remedies, and survival terms.",
    category: "Compliance",
    type: "Word (.docx)",
    downloads: 3600,
    fileName: "non-disclosure-agreement-nda.docx",
  },
  {
    id: "independent-contractor-agreement",
    slug: "independent-contractor-agreement",
    title: "Independent Contractor Agreement",
    description:
      "A 1099 contractor agreement template covering scope of work, payment terms, IP ownership, confidentiality, tax status, and termination.",
    category: "Compliance",
    type: "Word (.docx)",
    downloads: 2750,
    fileName: "independent-contractor-agreement.docx",
  },
];

export function getTemplateById(id: string) {
  return TEMPLATES.find((template) => template.id === id);
}

export function getTemplateBySlug(slug: string) {
  return TEMPLATES.find((template) => template.slug === slug);
}
