export type PermissionScope = "own" | "direct_reports" | "all" | "company" | "multi_entity";

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  scope?: PermissionScope;
}

export interface PermissionModule {
  id: string;
  label: string;
  description: string;
  permissions: PermissionDefinition[];
}

export interface BuiltInRoleDefinition {
  id: string;
  name: string;
  normalizedNames: string[];
  description: string;
  userCount: number;
  nonDeletable: true;
  permissions: string[];
}

type PermissionRow = [string, string, string, PermissionScope?];

const payrollPermissions: PermissionRow[] = [
  ["view_payroll", "View payroll dashboard", "See payroll totals, deadlines, run status, and pay-period summaries."],
  ["run_payroll", "Run payroll", "Create and process regular and off-cycle payroll runs."],
  ["approve_payroll", "Approve payroll", "Approve payroll runs before debiting company funds."],
  ["cancel_payroll", "Cancel payroll", "Cancel draft or pending payroll runs before cutoff."],
  ["reopen_payroll", "Reopen payroll", "Reopen a draft payroll run for corrections."],
  ["edit_payroll_settings", "Edit payroll settings", "Change pay schedules, bank rules, deductions, and payroll configuration."],
  ["view_tax_filings", "View tax filings", "View federal, state, local, and year-end payroll tax filings."],
  ["submit_tax_filings", "Submit tax filings", "Submit or amend payroll tax filings."],
  ["view_pay_stubs_own", "View own pay stubs", "View the signed-in employee's pay stubs."],
  ["view_pay_stubs_all", "View all pay stubs", "View pay stubs for every employee in scope."],
  ["manage_garnishments", "Manage garnishments", "Add, edit, and stop wage garnishment orders."],
  ["manage_deductions", "Manage deductions", "Maintain recurring and one-time payroll deductions."],
  ["manage_earnings", "Manage earnings", "Add supplemental, bonus, tips, royalty, and retroactive earnings."],
  ["view_payroll_funding", "View funding", "View payroll funding balance, impound status, and ACH history."],
  ["manage_payroll_funding", "Manage funding", "Initiate funding changes and payroll bank account updates."],
  ["import_time_to_payroll", "Import time to payroll", "Pull approved timesheets into payroll previews."],
  ["finalize_reimbursements", "Finalize reimbursements", "Move approved reimbursements into a payroll run."],
  ["finalize_ewa_repayments", "Finalize EWA repayments", "Finalize earned wage access repayment lines."],
  ["view_union_payroll", "View union payroll", "See union payroll reports, schedules, and dues."],
  ["manage_union_payroll", "Manage union payroll", "Configure union payroll, rates, and contribution rules."],
];

const hrisPermissions: PermissionRow[] = [
  ["view_employees", "View employees", "View employee directory and employment profiles."],
  ["add_employees", "Add employees", "Create employee records and invite new hires."],
  ["edit_employees", "Edit employees", "Edit employee profile, job, department, and manager details."],
  ["terminate_employees", "Terminate employees", "Start and complete employee termination workflows."],
  ["rehire_employees", "Rehire employees", "Reactivate prior employees and rebuild employment records."],
  ["view_salary", "View salary", "View compensation, pay type, and salary history."],
  ["edit_salary", "Edit salary", "Edit compensation, job bands, and salary effective dates."],
  ["view_ssn", "View SSN", "View full Social Security numbers and sensitive tax identifiers."],
  ["edit_ssn", "Edit SSN", "Edit Social Security numbers and sensitive tax identifiers."],
  ["view_bank_details", "View bank details", "View employee direct deposit account metadata."],
  ["edit_bank_details", "Edit bank details", "Edit employee direct deposit details."],
  ["bulk_import", "Bulk import employees", "Bulk import employee, job, and compensation data."],
  ["bulk_update", "Bulk update employees", "Bulk update employee records."],
  ["manage_documents", "Manage employee documents", "Upload, send, and archive employee documents."],
  ["view_documents", "View employee documents", "View documents attached to employee records."],
  ["manage_custom_fields", "Manage custom fields", "Create and edit employee custom fields."],
  ["view_org_chart", "View org chart", "View reporting structure and team hierarchy."],
  ["edit_org_chart", "Edit org chart", "Change manager relationships and reporting lines."],
  ["view_employee_activity", "View employee activity", "View employee audit timeline and lifecycle events."],
  ["manage_employee_assets", "Manage employee assets", "Assign, recover, and update equipment tied to employees."],
];

const atsPermissions: PermissionRow[] = [
  ["view_jobs", "View jobs", "View job postings and requisitions."],
  ["manage_jobs", "Manage jobs", "Create, edit, publish, and close job postings."],
  ["view_candidates", "View candidates", "View candidate profiles, applications, and interview status."],
  ["manage_candidates", "Manage candidates", "Move candidates through pipeline stages and update profiles."],
  ["send_offers", "Send offers", "Create and send offer letters."],
  ["approve_offers", "Approve offers", "Approve offers before they are sent."],
  ["manage_interviews", "Manage interviews", "Schedule interviews and manage interview plans."],
  ["view_interview_feedback", "View interview feedback", "View scorecards and interview feedback."],
  ["manage_hiring_settings", "Manage hiring settings", "Configure hiring stages, templates, and sources."],
  ["convert_candidate_to_employee", "Hire candidates", "Convert accepted candidates into employees."],
  ["view_ats_reports", "View ATS reports", "View hiring funnel and source analytics."],
  ["export_ats_data", "Export ATS data", "Export jobs, candidates, and hiring reports."],
];

const benefitsPermissions: PermissionRow[] = [
  ["view_benefits", "View benefits", "View benefit plans and employer contributions."],
  ["manage_benefits", "Manage benefits", "Create, edit, and retire benefit plans."],
  ["view_enrollments", "View enrollments", "View employee enrollment elections."],
  ["manage_enrollments", "Manage enrollments", "Approve and update employee benefit elections."],
  ["open_enrollment", "Manage open enrollment", "Open, close, and schedule enrollment windows."],
  ["manage_qle", "Manage life events", "Approve qualifying life events and enrollment changes."],
  ["view_cobra", "View COBRA", "View COBRA eligibility and notices."],
  ["manage_cobra", "Manage COBRA", "Send COBRA notices and update COBRA administration."],
  ["view_401k", "View 401(k)", "View retirement plan setup and employee participation."],
  ["manage_401k", "Manage 401(k)", "Edit retirement plan settings and contributions."],
  ["view_workers_comp", "View workers comp", "View workers compensation coverage and classifications."],
  ["manage_workers_comp", "Manage workers comp", "Edit workers compensation setup."],
];

const timePermissions: PermissionRow[] = [
  ["view_timesheets", "View timesheets", "View timesheets and time entry details."],
  ["edit_timesheets", "Edit timesheets", "Edit time entries and timesheet corrections."],
  ["approve_timesheets", "Approve timesheets", "Approve submitted timesheets."],
  ["reject_timesheets", "Reject timesheets", "Reject submitted timesheets with comments."],
  ["approve_pto", "Approve PTO", "Approve or deny paid time off requests."],
  ["manage_pto_policies", "Manage PTO policies", "Configure time off plans, balances, and accruals."],
  ["manage_schedules", "Manage schedules", "Create and edit schedules, shifts, and open shifts."],
  ["manage_time_kiosk", "Manage time kiosk", "Configure kiosk access and time clock PIN rules."],
  ["clock_in_own", "Clock in own time", "Clock in or out for the signed-in employee."],
  ["clock_out_others", "Clock out others", "Administratively clock employees out."],
  ["manage_breaks", "Manage breaks", "Start, end, and correct employee break records."],
  ["view_overtime", "View overtime", "View overtime warnings and overtime reports."],
  ["manage_overtime_rules", "Manage overtime rules", "Configure overtime, break, and premium pay rules."],
  ["export_time", "Export time", "Export timesheets and time detail reports."],
  ["view_direct_report_time", "View direct report time", "View time data only for direct reports.", "direct_reports"],
];

const reportPermissions: PermissionRow[] = [
  ["view_reports", "View reports", "View standard payroll, HR, finance, and compliance reports."],
  ["export_reports", "Export reports", "Export report data to CSV, PDF, or spreadsheet formats."],
  ["create_reports", "Create reports", "Build custom reports and saved views."],
  ["schedule_reports", "Schedule reports", "Schedule recurring report deliveries."],
  ["share_reports", "Share reports", "Share report views with other users."],
  ["view_headcount_reports", "View headcount reports", "View headcount, turnover, and forecast reports."],
  ["view_payroll_reports", "View payroll reports", "View payroll registers, liabilities, and journal summaries."],
  ["view_finance_reports", "View finance reports", "View finance and project profitability reports."],
  ["view_compliance_reports", "View compliance reports", "View compliance and audit reports."],
  ["view_certified_payroll", "View certified payroll", "View certified payroll history and WH-347 data."],
  ["generate_certified_payroll", "Generate certified payroll", "Generate WH-347 certified payroll reports."],
  ["view_project_profitability", "View project profitability", "View project labor cost and margin reports."],
];

const settingsPermissions: PermissionRow[] = [
  ["manage_roles", "Manage roles", "Create, edit, and delete custom roles and permission grants."],
  ["view_roles", "View roles", "View role definitions and permission matrices."],
  ["manage_users", "Manage admin users", "Invite, deactivate, and update admin users."],
  ["manage_integrations", "Manage integrations", "Connect and configure third-party integrations."],
  ["manage_billing", "Manage billing", "View invoices and manage plan, billing, and payment settings."],
  ["manage_company", "Manage company", "Edit company profile, EIN, addresses, and legal entity settings."],
  ["manage_locations", "Manage locations", "Create and edit work locations."],
  ["manage_departments", "Manage departments", "Create and edit departments."],
  ["manage_sso", "Manage SSO", "Configure SSO, SCIM, MFA, and provisioning settings."],
  ["manage_api_keys", "Manage API keys", "Create, rotate, and revoke API keys."],
  ["manage_workflows", "Manage workflows", "Create and edit workflow automations."],
  ["manage_notifications", "Manage notifications", "Configure notification preferences and announcements."],
  ["manage_bank_accounts", "Manage bank accounts", "Edit payroll and company bank accounts."],
  ["manage_pay_schedules", "Manage pay schedules", "Create and edit pay schedules."],
  ["view_audit_log_settings", "View settings audit log", "View settings-related audit log entries."],
];

const compliancePermissions: PermissionRow[] = [
  ["view_compliance", "View compliance", "View compliance dashboards and tasks."],
  ["manage_compliance", "Manage compliance", "Create, update, and complete compliance tasks."],
  ["view_audit_log", "View audit log", "View system audit logs."],
  ["export_audit_log", "Export audit log", "Export audit logs for review."],
  ["view_i9", "View I-9", "View I-9 verification status and documents."],
  ["manage_i9", "Manage I-9", "Manage I-9 verification workflows."],
  ["view_eeo", "View EEO", "View EEO reporting and diversity compliance data."],
  ["manage_eeo", "Manage EEO", "Manage EEO reporting workflows."],
  ["view_aca", "View ACA", "View ACA eligibility, forms, and filing state."],
  ["manage_aca", "Manage ACA", "Manage ACA forms and filing workflows."],
  ["view_pay_equity", "View pay equity", "View pay equity analysis and risk findings."],
  ["manage_pay_equity", "Manage pay equity", "Run pay equity analysis and assign remediation tasks."],
  ["view_labor_posters", "View labor posters", "View labor law poster status."],
  ["manage_labor_posters", "Manage labor posters", "Manage labor poster distribution."],
  ["view_paid_leave", "View paid leave compliance", "View paid leave rules and eligibility."],
  ["manage_paid_leave", "Manage paid leave compliance", "Configure paid leave compliance workflows."],
];

const expensesPermissions: PermissionRow[] = [
  ["view_expenses", "View expenses", "View expense reports and reimbursement status."],
  ["submit_expenses_own", "Submit own expenses", "Submit expense reports for the signed-in employee.", "own"],
  ["submit_expenses_all", "Submit expenses for others", "Create expense reports for employees in scope."],
  ["approve_expenses", "Approve expenses", "Approve submitted expense reports."],
  ["reject_expenses", "Reject expenses", "Reject submitted expense reports."],
  ["reimburse_expenses", "Reimburse expenses", "Mark expenses for payroll reimbursement."],
  ["manage_expense_policies", "Manage expense policies", "Create and edit expense policies."],
  ["view_mileage", "View mileage", "View mileage claims and rates."],
  ["manage_mileage", "Manage mileage", "Configure mileage rates and approve mileage reports."],
  ["export_expenses", "Export expenses", "Export expense and reimbursement data."],
];

const onboardingPermissions: PermissionRow[] = [
  ["view_onboarding", "View onboarding", "View onboarding cases and tasks."],
  ["manage_onboarding", "Manage onboarding", "Create, edit, and complete onboarding cases."],
  ["send_onboarding_packets", "Send onboarding packets", "Send onboarding documents and packet invites."],
  ["manage_onboarding_templates", "Manage onboarding templates", "Create and edit onboarding templates."],
  ["view_offboarding", "View offboarding", "View offboarding cases."],
  ["manage_offboarding", "Manage offboarding", "Create, edit, and complete offboarding cases."],
  ["assign_onboarding_tasks", "Assign onboarding tasks", "Assign onboarding tasks to employees and departments."],
  ["view_new_hire_reports", "View new hire reports", "View new hire reporting status."],
];

const performancePermissions: PermissionRow[] = [
  ["view_performance", "View performance", "View performance dashboards and review cycles."],
  ["manage_performance", "Manage performance", "Configure performance programs and review cycles."],
  ["view_reviews", "View reviews", "View performance reviews."],
  ["write_reviews", "Write reviews", "Complete assigned performance reviews."],
  ["approve_reviews", "Approve reviews", "Approve review packets and calibration outcomes."],
  ["view_goals", "View goals", "View employee goals."],
  ["manage_goals", "Manage goals", "Create and update goals."],
  ["view_feedback", "View feedback", "View feedback records."],
  ["request_feedback", "Request feedback", "Request feedback from peers and managers."],
  ["view_direct_report_reviews", "View direct report reviews", "View reviews for direct reports only.", "direct_reports"],
];

const learningPermissions: PermissionRow[] = [
  ["view_learning", "View learning", "View courses, assignments, and completion status."],
  ["manage_courses", "Manage courses", "Create and edit learning courses."],
  ["assign_courses", "Assign courses", "Assign courses to employees."],
  ["view_learning_reports", "View learning reports", "View course completion and assignment reports."],
  ["complete_learning_own", "Complete own learning", "Complete learning assigned to the signed-in employee.", "own"],
  ["manage_learning_settings", "Manage learning settings", "Configure learning categories and reminders."],
];

const assetsPermissions: PermissionRow[] = [
  ["view_assets", "View assets", "View company equipment and assigned assets."],
  ["manage_assets", "Manage assets", "Create, edit, and retire assets."],
  ["assign_assets", "Assign assets", "Assign assets to employees."],
  ["return_assets", "Return assets", "Mark assets as returned."],
  ["export_assets", "Export assets", "Export equipment and asset reports."],
  ["view_own_assets", "View own assets", "View assets assigned to the signed-in employee.", "own"],
];

const contractorsPermissions: PermissionRow[] = [
  ["view_contractors", "View contractors", "View contractor profiles and onboarding status."],
  ["manage_contractors", "Manage contractors", "Create and edit contractor records."],
  ["pay_contractors", "Pay contractors", "Run contractor payments."],
  ["view_1099", "View 1099", "View contractor 1099 records."],
  ["manage_1099", "Manage 1099", "Generate and update contractor 1099 records."],
  ["view_contracts", "View contracts", "View contractor agreements."],
  ["manage_contracts", "Manage contracts", "Create and update contractor agreements."],
  ["view_contractor_portal", "View contractor portal", "Access contractor self-service portal."],
];

const agencyPermissions: PermissionRow[] = [
  ["view_agency_clients", "View agency clients", "View agency client records."],
  ["manage_agency_clients", "Manage agency clients", "Create and edit agency clients."],
  ["view_agency_billing", "View agency billing", "View agency invoices and billing setup."],
  ["manage_agency_billing", "Manage agency billing", "Create and edit agency billing setup."],
  ["view_agency_profitability", "View agency profitability", "View agency profitability reports."],
  ["manage_agency_projects", "Manage agency projects", "Create and edit agency projects."],
];

const accountantPermissions: PermissionRow[] = [
  ["view_accountant_portal", "View accountant portal", "Access the accountant portal."],
  ["view_client_entities", "View client entities", "View connected client entities.", "multi_entity"],
  ["manage_client_entities", "Manage client entities", "Add and edit connected client entities.", "multi_entity"],
  ["view_client_payroll", "View client payroll", "View payroll data across client entities.", "multi_entity"],
  ["approve_client_payroll", "Approve client payroll", "Approve payroll batches for client entities.", "multi_entity"],
  ["view_client_reports", "View client reports", "View client reports across entities.", "multi_entity"],
  ["export_client_reports", "Export client reports", "Export client reports across entities.", "multi_entity"],
  ["manage_accountant_settings", "Manage accountant settings", "Configure accountant portal settings.", "multi_entity"],
];

const employeePortalPermissions: PermissionRow[] = [
  ["view_me_dashboard", "View self-service dashboard", "View the signed-in employee self-service dashboard.", "own"],
  ["edit_me_profile", "Edit own profile", "Edit personal profile details.", "own"],
  ["edit_me_bank", "Edit own bank account", "Edit personal direct deposit information.", "own"],
  ["edit_me_w4", "Edit own W-4", "Edit personal W-4 withholding information.", "own"],
  ["view_me_paystubs", "View own paystubs", "View personal pay stubs.", "own"],
  ["view_me_w2", "View own W-2", "View personal W-2 documents.", "own"],
  ["view_me_benefits", "View own benefits", "View personal benefit elections.", "own"],
  ["manage_me_benefits", "Manage own benefits", "Update personal benefit elections during allowed windows.", "own"],
  ["view_me_time", "View own time", "View personal timesheets and time off.", "own"],
  ["request_me_time_off", "Request own time off", "Submit personal time off requests.", "own"],
  ["view_me_documents", "View own documents", "View personal documents.", "own"],
  ["view_me_expenses", "View own expenses", "View personal expense reports.", "own"],
  ["view_me_learning", "View own learning", "View personal learning assignments.", "own"],
  ["view_me_goals", "View own goals", "View personal goals.", "own"],
  ["view_me_referrals", "View own referrals", "View personal employee referrals.", "own"],
  ["request_ewa_own", "Request own EWA", "Request earned wage access for the signed-in employee.", "own"],
];

function modulePermissions(rows: PermissionRow[]): PermissionDefinition[] {
  return rows.map(([key, label, description, scope]) => ({ key, label, description, scope }));
}

export const permissionModules: PermissionModule[] = [
  { id: "payroll", label: "Payroll", description: "Payroll processing, funding, tax filings, pay stubs, and payroll setup.", permissions: modulePermissions(payrollPermissions) },
  { id: "hris", label: "HRIS", description: "Employee records, compensation, sensitive identifiers, documents, and org structure.", permissions: modulePermissions(hrisPermissions) },
  { id: "ats", label: "ATS", description: "Jobs, candidates, interviews, offers, and hiring conversion.", permissions: modulePermissions(atsPermissions) },
  { id: "benefits", label: "Benefits", description: "Benefit plans, enrollments, COBRA, 401(k), and workers compensation.", permissions: modulePermissions(benefitsPermissions) },
  { id: "time", label: "Time", description: "Timesheets, PTO, schedules, kiosk, breaks, and overtime.", permissions: modulePermissions(timePermissions) },
  { id: "reports", label: "Reports", description: "Standard reports, custom reports, exports, scheduled delivery, and certified payroll.", permissions: modulePermissions(reportPermissions) },
  { id: "settings", label: "Settings", description: "Roles, users, company setup, billing, integrations, SSO, API keys, and workflows.", permissions: modulePermissions(settingsPermissions) },
  { id: "compliance", label: "Compliance", description: "Audit logs, I-9, EEO, ACA, pay equity, posters, and paid leave.", permissions: modulePermissions(compliancePermissions) },
  { id: "expenses", label: "Expenses", description: "Expense submission, approval, reimbursement, mileage, and policies.", permissions: modulePermissions(expensesPermissions) },
  { id: "onboarding", label: "Onboarding", description: "New hire onboarding, templates, packets, tasks, and offboarding.", permissions: modulePermissions(onboardingPermissions) },
  { id: "performance", label: "Performance", description: "Reviews, goals, feedback, calibration, and direct-report review workflows.", permissions: modulePermissions(performancePermissions) },
  { id: "learning", label: "Learning", description: "Courses, assignments, learning reports, and employee completion.", permissions: modulePermissions(learningPermissions) },
  { id: "assets", label: "Assets", description: "Equipment inventory, assignments, returns, and asset exports.", permissions: modulePermissions(assetsPermissions) },
  { id: "contractors", label: "Contractors", description: "Contractor profiles, payments, agreements, portal access, and 1099s.", permissions: modulePermissions(contractorsPermissions) },
  { id: "agency", label: "Agency", description: "Agency clients, billing, projects, and profitability.", permissions: modulePermissions(agencyPermissions) },
  { id: "accountant", label: "Accountant", description: "Multi-entity accountant portal, client payroll, and cross-client reports.", permissions: modulePermissions(accountantPermissions) },
  { id: "employee_portal", label: "Employee Portal", description: "Self-service /me routes for profile, pay, benefits, time, documents, and learning.", permissions: modulePermissions(employeePortalPermissions) },
];

export const allPermissions = permissionModules.flatMap((module) => module.permissions.map((permission) => permission.key));

const permissionSet = {
  all: allPermissions,
  noBilling: allPermissions.filter((permission) => permission !== "manage_billing"),
  employeeSelfService: employeePortalPermissions.map(([key]) => key),
  readOnlyFinance: [
    "view_payroll",
    "view_payroll_funding",
    "view_tax_filings",
    "view_payroll_reports",
    "view_finance_reports",
    "view_reports",
    "export_reports",
    "view_expenses",
    "view_mileage",
    "export_expenses",
    "view_certified_payroll",
    "view_pay_stubs_all",
    "view_compliance_reports",
  ],
};

export const builtInRoles: BuiltInRoleDefinition[] = [
  {
    id: "owner",
    name: "Owner",
    normalizedNames: ["owner", "super admin", "super_admin"],
    description: "Full access across the company, including billing and role administration.",
    userCount: 1,
    nonDeletable: true,
    permissions: permissionSet.all,
  },
  {
    id: "admin",
    name: "Admin",
    normalizedNames: ["admin", "administrator"],
    description: "Full access across the company except billing management.",
    userCount: 2,
    nonDeletable: true,
    permissions: permissionSet.noBilling,
  },
  {
    id: "hr_manager",
    name: "HR Manager",
    normalizedNames: ["hr", "hr manager", "hr_manager"],
    description: "HRIS, ATS, onboarding, compliance, and reports without payroll processing.",
    userCount: 4,
    nonDeletable: true,
    permissions: [
      ...hrisPermissions.map(([key]) => key),
      ...atsPermissions.map(([key]) => key),
      ...benefitsPermissions.map(([key]) => key),
      ...onboardingPermissions.map(([key]) => key),
      ...compliancePermissions.map(([key]) => key),
      ...performancePermissions.map(([key]) => key),
      ...learningPermissions.map(([key]) => key),
      ...assetsPermissions.map(([key]) => key),
      ...reportPermissions.map(([key]) => key).filter((key) => key !== "view_payroll_reports"),
      "view_payroll",
      "view_pay_stubs_all",
      "view_roles",
      "manage_users",
      "manage_company",
      "manage_locations",
      "manage_departments",
      "manage_notifications",
      "view_expenses",
    ],
  },
  {
    id: "payroll_manager",
    name: "Payroll Manager",
    normalizedNames: ["payroll", "payroll manager", "payroll_manager", "payroll admin", "payroll_admin"],
    description: "Payroll, expenses, and time review without HRIS edit access.",
    userCount: 3,
    nonDeletable: true,
    permissions: [
      ...payrollPermissions.map(([key]) => key),
      "view_employees",
      "view_salary",
      "view_bank_details",
      "view_timesheets",
      "approve_timesheets",
      "reject_timesheets",
      "view_overtime",
      "export_time",
      ...expensesPermissions.map(([key]) => key),
      "view_reports",
      "export_reports",
      "view_payroll_reports",
      "view_finance_reports",
      "view_certified_payroll",
      "generate_certified_payroll",
      "view_roles",
      "manage_pay_schedules",
      "manage_bank_accounts",
    ],
  },
  {
    id: "finance",
    name: "Finance",
    normalizedNames: ["finance", "finance admin", "finance_admin"],
    description: "Read-only payroll, expenses, and finance reports.",
    userCount: 3,
    nonDeletable: true,
    permissions: permissionSet.readOnlyFinance,
  },
  {
    id: "manager",
    name: "Manager",
    normalizedNames: ["manager", "people manager", "people_manager"],
    description: "Direct-report-only time approvals and performance review workflows.",
    userCount: 18,
    nonDeletable: true,
    permissions: [
      ...permissionSet.employeeSelfService,
      "view_employees",
      "view_org_chart",
      "view_direct_report_time",
      "approve_timesheets",
      "reject_timesheets",
      "approve_pto",
      "view_performance",
      "view_reviews",
      "write_reviews",
      "view_direct_report_reviews",
      "view_goals",
      "manage_goals",
      "request_feedback",
      "view_learning",
      "assign_courses",
      "view_expenses",
      "approve_expenses",
    ],
  },
  {
    id: "employee",
    name: "Employee",
    normalizedNames: ["employee", "staff", "worker"],
    description: "Self-service portal only for /me routes and personal records.",
    userCount: 186,
    nonDeletable: true,
    permissions: permissionSet.employeeSelfService,
  },
  {
    id: "accountant",
    name: "Accountant",
    normalizedNames: ["accountant", "external accountant", "external_accountant"],
    description: "Multi-entity accountant portal access when the accountant portal is enabled.",
    userCount: 2,
    nonDeletable: true,
    permissions: [
      ...accountantPermissions.map(([key]) => key),
      "view_reports",
      "export_reports",
      "view_payroll_reports",
      "view_finance_reports",
      "view_expenses",
      "view_payroll",
      "view_payroll_funding",
    ],
  },
];

const roleByName = new Map<string, BuiltInRoleDefinition>();
builtInRoles.forEach((role) => {
  roleByName.set(role.id, role);
  roleByName.set(role.name.toLowerCase(), role);
  role.normalizedNames.forEach((name) => roleByName.set(name, role));
});

export function normalizeRoleName(role?: string | null) {
  return (role ?? "employee").trim().toLowerCase().replace(/_/g, " ");
}

export function resolveBuiltInRole(role?: string | null) {
  const normalized = normalizeRoleName(role);
  return roleByName.get(normalized) ?? roleByName.get(normalized.replace(/\s+/g, "_")) ?? builtInRoles.find((item) => item.id === "employee")!;
}

export function permissionsForRole(role?: string | null) {
  return resolveBuiltInRole(role).permissions;
}

export function hasPermission(role: string | null | undefined, requiredPermission: string) {
  return permissionsForRole(role).includes(requiredPermission);
}

export function summarizePermissions(permissionKeys: string[], limit = 5) {
  const selected = new Set(permissionKeys);
  const moduleSummaries = permissionModules
    .map((module) => {
      const granted = module.permissions.filter((permission) => selected.has(permission.key));
      return { module, granted };
    })
    .filter(({ granted }) => granted.length > 0)
    .sort((a, b) => b.granted.length - a.granted.length);

  if (selected.size === allPermissions.length) {
    return "Can access every product area, sensitive workflow, and company setting.";
  }

  if (moduleSummaries.length === 0) {
    return "No permissions selected yet.";
  }

  const highlights = moduleSummaries.slice(0, limit).map(({ module, granted }) => {
    const allInModule = granted.length === module.permissions.length;
    return allInModule ? `all ${module.label}` : `${granted.length} ${module.label}`;
  });

  return `Can access ${highlights.join(", ")}${moduleSummaries.length > limit ? ", and more" : ""}.`;
}

export const screenPermissionRules: Array<{ prefix: string; permission: string }> = [
  { prefix: "/settings/roles", permission: "view_roles" },
  { prefix: "/settings/billing", permission: "manage_billing" },
  { prefix: "/settings/integrations", permission: "manage_integrations" },
  { prefix: "/settings/company", permission: "manage_company" },
  { prefix: "/settings/users", permission: "manage_users" },
  { prefix: "/settings/sso", permission: "manage_sso" },
  { prefix: "/settings/api", permission: "manage_api_keys" },
  { prefix: "/settings/workflows", permission: "manage_workflows" },
  { prefix: "/settings/audit-log", permission: "view_audit_log_settings" },
  { prefix: "/payroll/run", permission: "run_payroll" },
  { prefix: "/payroll/settings", permission: "edit_payroll_settings" },
  { prefix: "/payroll", permission: "view_payroll" },
  { prefix: "/employees/new", permission: "add_employees" },
  { prefix: "/employees/bulk", permission: "bulk_import" },
  { prefix: "/employees", permission: "view_employees" },
  { prefix: "/hiring", permission: "view_jobs" },
  { prefix: "/benefits", permission: "view_benefits" },
  { prefix: "/time", permission: "view_timesheets" },
  { prefix: "/reports", permission: "view_reports" },
  { prefix: "/compliance", permission: "view_compliance" },
  { prefix: "/expenses", permission: "view_expenses" },
  { prefix: "/onboarding", permission: "view_onboarding" },
  { prefix: "/performance", permission: "view_performance" },
  { prefix: "/learning", permission: "view_learning" },
  { prefix: "/contractors", permission: "view_contractors" },
  { prefix: "/agency", permission: "view_agency_clients" },
  { prefix: "/accountant-portal", permission: "view_accountant_portal" },
  { prefix: "/me", permission: "view_me_dashboard" },
];

export const apiPermissionRules: Array<{ method?: string; prefix: string; permission: string }> = [
  { prefix: "/api/auth/me", permission: "view_me_dashboard" },
  { prefix: "/api/users/me", permission: "view_me_dashboard" },
  { prefix: "/api/employees/me/bank-account", permission: "edit_me_bank" },
  { prefix: "/api/employees/me/w4", permission: "edit_me_w4" },
  { method: "GET", prefix: "/api/employees", permission: "view_employees" },
  { method: "POST", prefix: "/api/employees/bulk", permission: "bulk_import" },
  { method: "POST", prefix: "/api/employees", permission: "add_employees" },
  { method: "PUT", prefix: "/api/employees", permission: "edit_employees" },
  { method: "PATCH", prefix: "/api/employees", permission: "edit_employees" },
  { method: "DELETE", prefix: "/api/employees", permission: "terminate_employees" },
  { prefix: "/api/payroll/runs", permission: "view_payroll" },
  { method: "POST", prefix: "/api/payroll/runs", permission: "run_payroll" },
  { prefix: "/api/payroll/funding", permission: "view_payroll_funding" },
  { method: "POST", prefix: "/api/payroll/funding", permission: "manage_payroll_funding" },
  { prefix: "/api/payroll/sui", permission: "view_tax_filings" },
  { method: "POST", prefix: "/api/payroll/sui", permission: "submit_tax_filings" },
  { prefix: "/api/payroll/union", permission: "view_union_payroll" },
  { method: "POST", prefix: "/api/payroll/union", permission: "manage_union_payroll" },
  { prefix: "/api/payroll/supplemental-payments", permission: "manage_earnings" },
  { prefix: "/api/payroll/retro-calc", permission: "manage_earnings" },
  { prefix: "/api/payroll/tips", permission: "manage_earnings" },
  { prefix: "/api/expenses", permission: "view_expenses" },
  { method: "POST", prefix: "/api/expenses", permission: "submit_expenses_all" },
  { prefix: "/api/me/expenses", permission: "view_me_expenses" },
  { method: "POST", prefix: "/api/me/expenses", permission: "submit_expenses_own" },
  { prefix: "/api/time/admin", permission: "approve_timesheets" },
  { prefix: "/api/time/timesheets", permission: "view_timesheets" },
  { method: "POST", prefix: "/api/time/timesheets", permission: "approve_timesheets" },
  { prefix: "/api/time/clock-in", permission: "clock_in_own" },
  { prefix: "/api/time/clock-out", permission: "clock_in_own" },
  { prefix: "/api/time/break-start", permission: "clock_in_own" },
  { prefix: "/api/time/break-end", permission: "clock_in_own" },
  { prefix: "/api/time/status", permission: "view_me_time" },
  { prefix: "/api/reports/certified-payroll/generate-wh347", permission: "generate_certified_payroll" },
  { prefix: "/api/reports/certified-payroll", permission: "view_certified_payroll" },
  { prefix: "/api/reports", permission: "view_reports" },
  { prefix: "/api/compliance/federal-filings/submit", permission: "submit_tax_filings" },
  { prefix: "/api/compliance/federal-filings", permission: "view_tax_filings" },
  { prefix: "/api/compliance", permission: "view_compliance" },
  { prefix: "/api/onboarding", permission: "view_onboarding" },
  { method: "POST", prefix: "/api/onboarding", permission: "manage_onboarding" },
  { prefix: "/api/assets/assign", permission: "assign_assets" },
  { prefix: "/api/assets", permission: "view_assets" },
  { method: "POST", prefix: "/api/assets", permission: "manage_assets" },
  { method: "PATCH", prefix: "/api/assets", permission: "manage_assets" },
  { method: "DELETE", prefix: "/api/assets", permission: "manage_assets" },
  { prefix: "/api/hiring", permission: "view_candidates" },
  { method: "POST", prefix: "/api/hiring/hire", permission: "convert_candidate_to_employee" },
  { prefix: "/api/contractors", permission: "view_contractors" },
  { method: "POST", prefix: "/api/contractors", permission: "manage_contractors" },
  { prefix: "/api/accountant", permission: "view_accountant_portal" },
  { prefix: "/api/agency", permission: "view_agency_clients" },
  { method: "POST", prefix: "/api/agency", permission: "manage_agency_clients" },
  { method: "PATCH", prefix: "/api/agency", permission: "manage_agency_clients" },
  { method: "DELETE", prefix: "/api/agency", permission: "manage_agency_clients" },
  { prefix: "/api/announcements", permission: "manage_notifications" },
  { prefix: "/api/dashboard", permission: "view_reports" },
  { prefix: "/api/search", permission: "view_me_dashboard" },
  { prefix: "/api/v1/employees", permission: "edit_employees" },
  { prefix: "/api/v1/payroll", permission: "approve_payroll" },
  { prefix: "/api/v1/documents", permission: "manage_documents" },
];

const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/contact",
  "/api/templates",
  "/api/webinars",
  "/api/partners/apply",
  "/api/verify-token",
  "/api/circe",
  "/api/plaid",
];

function pathStartsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicApiRoute(pathname: string) {
  return publicApiPrefixes.some((prefix) => pathStartsWith(pathname, prefix));
}

export function getRequiredScreenPermission(pathname: string) {
  return screenPermissionRules.find((rule) => pathStartsWith(pathname, rule.prefix))?.permission;
}

export function getRequiredApiPermission(pathname: string, method: string) {
  if (!pathname.startsWith("/api") || isPublicApiRoute(pathname)) return undefined;

  const normalizedMethod = method.toUpperCase();
  return apiPermissionRules.find((rule) => {
    if (rule.method && rule.method !== normalizedMethod) return false;
    return pathStartsWith(pathname, rule.prefix);
  })?.permission ?? "view_me_dashboard";
}
