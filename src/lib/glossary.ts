export const glossaryCategories = [
  "Payroll",
  "Payroll Tax",
  "Compliance",
  "Benefits",
  "HR",
  "Hiring",
  "Time",
  "Leave",
  "Reporting",
  "Security",
] as const;

export type GlossaryCategory = (typeof glossaryCategories)[number];

export type GlossaryTerm = {
  term: string;
  slug: string;
  category: GlossaryCategory;
  shortDefinition: string;
  productPath: string;
  relatedSlugs: string[];
};

type TermEntry = readonly [term: string, category: GlossaryCategory, shortDefinition: string];

export function slugifyGlossaryTerm(term: string) {
  return term
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const termEntries = [
  ["1099 Contractor", "Payroll", "A non-employee worker who is usually paid without payroll tax withholding."],
  ["1099-NEC", "Payroll Tax", "An IRS form used to report nonemployee compensation paid to contractors."],
  ["1099-MISC", "Payroll Tax", "An IRS form used for certain miscellaneous payments, rents, prizes, and awards."],
  ["401(k)", "Benefits", "An employer-sponsored retirement plan funded through payroll deductions."],
  ["403(b)", "Benefits", "A retirement plan commonly offered by schools, nonprofits, and certain public organizations."],
  ["457(b)", "Benefits", "A deferred compensation retirement plan often used by government and nonprofit employers."],
  ["ACA", "Compliance", "The Affordable Care Act, which sets health coverage and employer reporting rules."],
  ["ACA Affordability", "Compliance", "A test for whether employer health coverage is affordable under ACA rules."],
  ["ACA Reporting", "Compliance", "Employer reporting on health coverage offers, often through Forms 1094-C and 1095-C."],
  ["Accrual", "Leave", "The process of earning paid time off or other leave over time."],
  ["ACH", "Payroll", "The Automated Clearing House network used for electronic payments like direct deposit."],
  ["Active Employee", "HR", "A worker currently employed and eligible for applicable company programs."],
  ["Adjusted Gross Income", "Payroll Tax", "Income after certain deductions, used in federal income tax calculations."],
  ["Administrative Exemption", "Compliance", "An FLSA overtime exemption for certain office or non-manual employees."],
  ["Adverse Action", "Hiring", "A required notice process when an employer takes action based on background check results."],
  ["Affirmative Action Plan", "Compliance", "A documented plan used by certain employers to support equal employment opportunity."],
  ["ALE", "Compliance", "Applicable Large Employer status under the ACA, generally based on workforce size."],
  ["Alternative Workweek", "Time", "A schedule arrangement that may change daily overtime treatment in certain states."],
  ["Annual Enrollment", "Benefits", "The yearly window when employees choose or update benefit coverage."],
  ["Annualized Salary", "Payroll", "A yearly pay amount calculated from a wage, rate, or partial-year compensation amount."],
  ["Applicant Tracking System", "Hiring", "Software used to manage job postings, candidates, interviews, and offers."],
  ["Arrears Payroll", "Payroll", "A payroll practice where employees are paid after the work period has ended."],
  ["At-Will Employment", "HR", "An employment relationship that either party may generally end at any time, subject to law."],
  ["Background Check", "Hiring", "A review of a candidate's history, credentials, or records before employment."],
  ["Base Pay", "Payroll", "An employee's regular compensation before bonuses, overtime, or variable pay."],
  ["Beneficiary", "Benefits", "A person designated to receive benefits from an insurance or retirement plan."],
  ["Benefit Deduction", "Benefits", "An amount withheld from pay to cover employee benefit contributions."],
  ["Benefit Eligibility", "Benefits", "The rules that determine who can enroll in a company benefit plan."],
  ["Benefits Broker", "Benefits", "A partner who helps employers choose, manage, and renew employee benefit plans."],
  ["Bereavement Leave", "Leave", "Time away from work after the death of a family member or loved one."],
  ["Biweekly Payroll", "Payroll", "A pay schedule that pays employees every two weeks, usually 26 times per year."],
  ["Blended Overtime", "Payroll", "An overtime rate calculation used when an employee works at more than one pay rate."],
  ["Bonus Pay", "Payroll", "Additional compensation paid outside regular wages or salary."],
  ["Cafeteria Plan", "Benefits", "A Section 125 plan that lets employees choose from qualified pre-tax benefits."],
  ["Candidate Pipeline", "Hiring", "The stages candidates move through during recruiting and selection."],
  ["COBRA", "Benefits", "A federal law allowing eligible people to continue group health coverage after certain events."],
  ["Commuter Benefits", "Benefits", "Pre-tax or employer-paid benefits for transit, parking, or commuting expenses."],
  ["Comp Ratio", "Reporting", "A comparison of an employee's pay to the midpoint of a salary range."],
  ["Compensation Band", "HR", "A structured pay range assigned to a role, level, or job family."],
  ["Compensation Benchmarking", "Reporting", "The process of comparing pay against market data for similar roles."],
  ["Compensatory Time", "Time", "Paid time off granted instead of overtime pay where allowed by law."],
  ["Compliance Poster", "Compliance", "Required workplace notices that inform employees about labor and employment rights."],
  ["Contractor Onboarding", "Hiring", "The process of collecting agreements, tax forms, and payment details for contractors."],
  ["Cost Center", "Reporting", "A department, location, or accounting unit used to allocate workforce costs."],
  ["Dependent Care FSA", "Benefits", "A pre-tax account for eligible dependent care expenses."],
  ["Direct Deposit", "Payroll", "Electronic payment of wages directly into an employee's bank account."],
  ["Disability Insurance", "Benefits", "Coverage that replaces part of income when an employee cannot work due to disability."],
  ["Disposable Earnings", "Payroll", "Pay remaining after legally required deductions, often used for garnishment limits."],
  ["Diversity Reporting", "Reporting", "Workforce reporting used to understand representation and equal opportunity metrics."],
  ["DOL", "Compliance", "The U.S. Department of Labor, which enforces many workplace and wage rules."],
  ["Double-Time Pay", "Payroll", "A premium pay rate equal to two times the regular rate of pay."],
  ["E-Verify", "Compliance", "A federal electronic system used to confirm employment eligibility."],
  ["Earned Wage Access", "Payroll", "A benefit that lets employees access earned pay before the scheduled payday."],
  ["EEO-1", "Compliance", "A workforce demographic report required for certain employers."],
  ["EIN", "Payroll Tax", "An Employer Identification Number used by the IRS to identify a business."],
  ["Electronic I-9", "Compliance", "A digital version of the employment eligibility verification form process."],
  ["Eligibility Waiting Period", "Benefits", "The time an employee must wait before benefit coverage can begin."],
  ["Employee Classification", "Compliance", "The process of determining whether a worker is an employee, contractor, exempt, or nonexempt."],
  ["Employee Engagement", "HR", "A measure of how connected, motivated, and committed employees feel at work."],
  ["Employee Handbook", "HR", "A document that explains workplace policies, expectations, and employee rights."],
  ["Employee Lifecycle", "HR", "The stages of employment from hiring through offboarding."],
  ["Employee Net Promoter Score", "Reporting", "A survey metric used to understand employee loyalty and sentiment."],
  ["Employee Record", "HR", "A file containing employment, pay, tax, performance, and compliance information."],
  ["Employee Self-Service", "HR", "Tools that let employees update personal information, documents, benefits, and pay details."],
  ["Employer Match", "Benefits", "An employer contribution to a retirement plan based on employee contributions."],
  ["Employer of Record", "HR", "A company that legally employs workers on behalf of another organization."],
  ["Employment Agreement", "Hiring", "A contract that defines key terms of an employment relationship."],
  ["Employment Eligibility", "Compliance", "A worker's legal authorization to work in the United States."],
  ["EOR", "HR", "Employer of Record, a service that becomes the legal employer for workers."],
  ["Equity Compensation", "Benefits", "Non-cash compensation such as stock options, RSUs, or ownership awards."],
  ["ERISA", "Benefits", "A federal law that sets standards for many employer benefit plans."],
  ["Exempt Employee", "Compliance", "An employee who is exempt from certain FLSA overtime requirements."],
  ["Expense Reimbursement", "Payroll", "Payment back to employees for approved business expenses."],
  ["Fair Chance Hiring", "Hiring", "Hiring practices that limit when and how criminal history is considered."],
  ["Federal Income Tax", "Payroll Tax", "Income tax withheld from employee wages and paid to the federal government."],
  ["Federal Tax Deposit", "Payroll Tax", "A payroll tax payment made to the IRS on an assigned deposit schedule."],
  ["FICA Tax", "Payroll Tax", "Social Security and Medicare taxes shared by employees and employers."],
  ["Final Paycheck", "Payroll", "The last wage payment due to an employee after separation."],
  ["Flexible Spending Account", "Benefits", "A pre-tax account used for eligible health or dependent care expenses."],
  ["FLSA", "Compliance", "The Fair Labor Standards Act, which governs minimum wage, overtime, and child labor rules."],
  ["FMLA", "Leave", "The Family and Medical Leave Act, which provides eligible unpaid, job-protected leave."],
  ["Form 940", "Payroll Tax", "The annual federal unemployment tax return filed by employers."],
  ["Form 941", "Payroll Tax", "The quarterly federal payroll tax return filed by employers."],
  ["Form 944", "Payroll Tax", "An annual federal payroll tax return for certain small employers."],
  ["Form 1094-C", "Compliance", "An ACA transmittal form used by applicable large employers."],
  ["Form 1095-C", "Compliance", "An ACA form showing health coverage offers to a full-time employee."],
  ["Form W-2", "Payroll Tax", "The annual wage and tax statement employers provide to employees."],
  ["Form W-3", "Payroll Tax", "A transmittal form sent with W-2 wage statements to the Social Security Administration."],
  ["Form W-4", "Payroll Tax", "The employee withholding certificate used to calculate federal income tax withholding."],
  ["FSA", "Benefits", "A Flexible Spending Account funded with pre-tax payroll deductions."],
  ["FTE", "Reporting", "Full-time equivalent, a workforce measure that converts hours into full-time headcount."],
  ["Full-Time Employee", "HR", "An employee who works enough hours to meet company or legal full-time thresholds."],
  ["FUTA", "Payroll Tax", "Federal Unemployment Tax Act tax paid by employers to fund unemployment programs."],
  ["Garnishment", "Payroll", "A legally required wage deduction for debts such as child support, taxes, or loans."],
  ["General Ledger Mapping", "Reporting", "The process of assigning payroll costs to accounting accounts."],
  ["Gross Pay", "Payroll", "Total earnings before taxes, deductions, and withholdings are taken out."],
  ["Group Health Plan", "Benefits", "An employer-sponsored health plan offered to eligible employees and dependents."],
  ["Harassment Training", "Compliance", "Required or recommended workplace training on preventing harassment and discrimination."],
  ["Headcount", "Reporting", "The number of people employed by an organization at a point in time."],
  ["HR Audit", "Compliance", "A structured review of HR records, policies, and practices for risk and accuracy."],
  ["HR Compliance", "Compliance", "The practice of following employment, wage, benefits, and workplace laws."],
  ["HRIS", "HR", "Human Resources Information System software used to manage employee data and HR workflows."],
  ["HSA", "Benefits", "A Health Savings Account paired with a qualified high-deductible health plan."],
  ["I-9", "Compliance", "The employment eligibility verification form required for U.S. employees."],
  ["I-9 Reverification", "Compliance", "Updating Form I-9 when an employee's work authorization expires."],
  ["Imputed Income", "Payroll Tax", "The taxable value of certain non-cash benefits or coverage."],
  ["Independent Contractor", "Payroll", "A self-employed worker who provides services but is not treated as an employee."],
  ["Job Description", "Hiring", "A document describing a role's responsibilities, requirements, and expectations."],
  ["Job Family", "HR", "A group of related roles that share similar work or career paths."],
  ["Job Level", "HR", "A role grade that reflects scope, responsibility, and compensation range."],
  ["Leave Accrual", "Leave", "The earning of leave balances based on time worked or company policy."],
  ["Leave of Absence", "Leave", "Approved time away from work for medical, family, personal, or other reasons."],
  ["Lifestyle Spending Account", "Benefits", "An employer-funded account for wellness, lifestyle, or flexible benefit expenses."],
  ["Local Income Tax", "Payroll Tax", "Income tax imposed by a city, county, or other local jurisdiction."],
  ["Lookback Measurement Period", "Compliance", "An ACA method for determining full-time status based on past hours worked."],
  ["Manager Self-Service", "HR", "Tools that let managers approve requests and view team information."],
  ["Meal Break", "Time", "A workday break for meals that may be unpaid if legal requirements are met."],
  ["Medicare Tax", "Payroll Tax", "The Medicare portion of FICA tax withheld from wages and matched by employers."],
  ["Minimum Wage", "Compliance", "The lowest hourly wage an employer may legally pay covered employees."],
  ["Multi-State Payroll", "Payroll", "Payroll management for employees working in more than one state."],
  ["Net Pay", "Payroll", "The amount an employee receives after taxes, deductions, and withholdings."],
  ["New Hire Report", "Compliance", "A required state report submitted when a new employee is hired."],
  ["Nonexempt Employee", "Compliance", "An employee who is generally entitled to minimum wage and overtime protections."],
  ["Off-Cycle Payroll", "Payroll", "A payroll run processed outside the normal pay schedule."],
  ["Offer Letter", "Hiring", "A document that outlines the proposed terms of employment for a candidate."],
  ["Onboarding", "HR", "The process of preparing a new employee to start work successfully."],
  ["Open Enrollment", "Benefits", "A set period when employees can enroll in or change benefits."],
  ["Org Chart", "HR", "A visual map of reporting relationships and team structure."],
  ["Overtime", "Payroll", "Premium pay owed when nonexempt employees work beyond legal thresholds."],
  ["Paid Family Leave", "Leave", "Leave that provides pay for qualifying family care or bonding reasons."],
  ["Paid Sick Leave", "Leave", "Paid time off that employees can use for illness or covered health needs."],
  ["Paid Time Off", "Leave", "A bank of paid leave employees can use for vacation, illness, or personal time."],
  ["Pay Date", "Payroll", "The date wages are made available to employees."],
  ["Pay Equity", "Compliance", "The practice of evaluating and correcting unfair compensation differences."],
  ["Pay Frequency", "Payroll", "How often employees are paid, such as weekly, biweekly, semimonthly, or monthly."],
  ["Pay Period", "Payroll", "The span of work time covered by a payroll run."],
  ["Pay Schedule", "Payroll", "The recurring calendar that defines pay periods and pay dates."],
  ["Pay Stub", "Payroll", "A wage statement showing earnings, taxes, deductions, and net pay."],
  ["Payroll Deduction", "Payroll", "An amount subtracted from gross pay for taxes, benefits, garnishments, or other items."],
  ["Payroll Register", "Payroll", "A payroll report listing earnings, deductions, taxes, and net pay for a run."],
  ["Payroll Tax", "Payroll Tax", "Taxes related to wages, including income tax withholding, FICA, FUTA, and state taxes."],
  ["Payroll Tax Nexus", "Payroll Tax", "A connection to a jurisdiction that can create payroll tax obligations."],
  ["Payroll Tax Registration", "Payroll Tax", "The process of registering with tax agencies before withholding or paying payroll taxes."],
  ["PEO", "HR", "A Professional Employer Organization that provides HR, payroll, benefits, and compliance support."],
  ["Performance Review", "HR", "A formal evaluation of an employee's work, goals, and development."],
  ["Personnel File", "HR", "An organized employee file containing job, pay, policy, and employment documents."],
  ["Pre-Tax Deduction", "Benefits", "A deduction taken before certain taxes are calculated."],
  ["Professional Exemption", "Compliance", "An FLSA overtime exemption for certain learned or creative professional roles."],
  ["PTO", "Leave", "Paid time off that can be used according to company policy and applicable law."],
  ["Quarterly Tax Filing", "Payroll Tax", "A recurring payroll tax filing due to federal, state, or local agencies."],
  ["Reasonable Accommodation", "Compliance", "A workplace change that helps an employee perform a job or access employment."],
  ["Recruiting Funnel", "Hiring", "The path candidates move through from application to hire."],
  ["Regular Rate of Pay", "Payroll", "The pay rate used to calculate overtime, including certain additional earnings."],
  ["Remote Employee", "HR", "An employee who works away from a company office or central workplace."],
  ["Reporting Location", "HR", "A worksite or location used for HR, payroll, tax, or compliance reporting."],
  ["Rest Break", "Time", "A shorter workday break that may be required and paid under state law."],
  ["Retirement Plan", "Benefits", "An employer-sponsored plan that helps employees save for retirement."],
  ["Retro Pay", "Payroll", "Pay owed for work in a prior period because of a correction or delayed change."],
  ["RSU", "Benefits", "Restricted Stock Unit, an equity award that vests into company shares."],
  ["Salary Basis Test", "Compliance", "An FLSA test used when evaluating certain overtime exemptions."],
  ["Salary Range", "HR", "The minimum and maximum pay for a role, level, or job family."],
  ["Section 125 Plan", "Benefits", "A cafeteria plan that allows certain benefits to be paid pre-tax."],
  ["Semimonthly Payroll", "Payroll", "A pay schedule that pays employees twice per month, usually 24 times per year."],
  ["Severance Pay", "Payroll", "Pay provided to an employee when employment ends, often under an agreement or policy."],
  ["Shift Differential", "Payroll", "Additional pay for working certain shifts, such as nights or weekends."],
  ["Short-Term Disability", "Benefits", "Income replacement coverage for a temporary disability or medical condition."],
  ["Sick Leave", "Leave", "Time off for illness, medical appointments, or covered health reasons."],
  ["Social Security Tax", "Payroll Tax", "The Social Security portion of FICA tax withheld from wages and matched by employers."],
  ["State Income Tax", "Payroll Tax", "Income tax withheld from wages and paid to a state tax agency."],
  ["State Registration", "Payroll Tax", "Employer registration with state agencies for withholding, unemployment, or other payroll taxes."],
  ["Stock Option", "Benefits", "An equity award giving an employee the right to buy shares at a set price."],
  ["SUTA", "Payroll Tax", "State unemployment tax paid by employers, and sometimes employees, depending on the state."],
  ["Taxable Wage Base", "Payroll Tax", "The maximum wages subject to a particular payroll tax."],
  ["Time Clock", "Time", "A tool employees use to record work start, stop, and break times."],
  ["Timesheet", "Time", "A record of hours worked during a pay period."],
  ["Tip Credit", "Payroll", "A wage rule that may allow employers to count tips toward minimum wage obligations."],
  ["Tips Payroll", "Payroll", "Payroll processing that accounts for reported tips, tip credits, and related taxes."],
  ["Total Rewards", "Benefits", "The full value of compensation, benefits, perks, and work experience offered to employees."],
  ["Unemployment Insurance", "Payroll Tax", "A program funded by employer taxes that provides income support to eligible unemployed workers."],
  ["Variable Pay", "Payroll", "Compensation that changes based on performance, sales, goals, or other factors."],
  ["Vesting", "Benefits", "The process of earning ownership rights in employer contributions or equity awards."],
  ["Voluntary Deduction", "Payroll", "A payroll deduction an employee chooses, such as benefits or retirement contributions."],
  ["W-2", "Payroll Tax", "A year-end form reporting an employee's wages and taxes withheld."],
  ["W-4", "Payroll Tax", "An employee form used to determine federal income tax withholding."],
  ["Wage Base", "Payroll Tax", "The amount of wages subject to a specific payroll tax."],
  ["Wage Garnishment", "Payroll", "A court or agency order requiring an employer to withhold wages for a debt."],
  ["Wage Theft Prevention Notice", "Compliance", "A notice required in some states that explains pay rate and employment information."],
  ["Waiting Time Penalty", "Compliance", "A penalty that may apply when final wages are not paid on time."],
  ["Workers Comp", "Benefits", "Insurance that covers work-related injuries and illnesses."],
  ["Workforce Analytics", "Reporting", "Analysis of employee, payroll, hiring, and retention data."],
  ["Work Opportunity Tax Credit", "Payroll Tax", "A federal tax credit for hiring people from certain targeted groups."],
  ["Workweek", "Time", "A fixed seven-day period used for wage and overtime calculations."],
  ["WOTC", "Payroll Tax", "Work Opportunity Tax Credit, a federal credit tied to hiring eligible workers."],
  ["ACA Measurement Period", "Compliance", "A period used to measure employee hours for ACA full-time status."],
  ["Applicant Flow Log", "Hiring", "A record of applicants and hiring decisions used for compliance reporting."],
  ["ATS", "Hiring", "Applicant Tracking System software for managing recruiting workflows."],
  ["Audit Trail", "Security", "A record of system activity showing who did what and when."],
  ["Bank Account Verification", "Payroll", "The process of confirming a bank account before direct deposit or payment."],
  ["Benefits Administration", "Benefits", "The process of managing employee benefit eligibility, enrollment, changes, and deductions."],
  ["Benefits Carrier", "Benefits", "An insurance or benefits provider that administers plan coverage."],
  ["Candidate Scorecard", "Hiring", "A structured form used to evaluate candidates consistently."],
  ["Certified Payroll", "Payroll", "A payroll report required on many government-funded construction projects."],
  ["Change Report", "Reporting", "A report showing changes to employee, pay, benefits, or payroll data."],
  ["Child Support Order", "Payroll", "A legal order requiring wage withholding for child support."],
  ["Compa-Ratio", "Reporting", "A pay comparison metric that divides salary by the midpoint of a range."],
  ["Continuous Feedback", "HR", "Ongoing feedback between employees and managers outside formal review cycles."],
  ["Custom Field", "HR", "A configurable employee data field used to track company-specific information."],
  ["Data Retention", "Security", "Policies that define how long employee and payroll records are kept."],
  ["Deductions in Arrears", "Payroll", "Benefit or other deductions collected after the coverage or obligation period."],
  ["Direct Deposit Authorization", "Payroll", "Employee permission to send wages electronically to a bank account."],
  ["Disparate Impact", "Compliance", "A policy effect that disproportionately affects a protected group."],
  ["Employee Assistance Program", "Benefits", "A support program offering services such as counseling, referrals, or wellbeing resources."],
  ["Employee Consent", "HR", "Documented employee agreement for a policy, deduction, notice, or electronic process."],
  ["Employee Experience", "HR", "The overall journey employees have with workplace tools, culture, and processes."],
  ["Employee Portal", "HR", "A self-service site where employees access pay, benefits, documents, and HR tasks."],
  ["Employee Stock Purchase Plan", "Benefits", "A program allowing employees to buy company stock, often at a discount."],
  ["Executive Exemption", "Compliance", "An FLSA overtime exemption for certain management employees."],
  ["Exit Interview", "HR", "A conversation or survey completed when an employee leaves the company."],
  ["Final Wage Law", "Compliance", "State rules that determine when final wages must be paid after separation."],
  ["Fringe Benefit", "Benefits", "A non-wage benefit provided to employees that may be taxable or non-taxable."],
  ["Geofencing", "Time", "A location boundary used to control or validate mobile clock-ins."],
  ["Health Reimbursement Arrangement", "Benefits", "An employer-funded arrangement that reimburses eligible medical expenses."],
  ["High-Deductible Health Plan", "Benefits", "A health plan with higher deductibles that can pair with an HSA if qualified."],
  ["Holiday Pay", "Payroll", "Pay provided for company holidays or work performed on a holiday."],
  ["Job Requisition", "Hiring", "An internal request or approval to open and hire for a role."],
  ["Knowledge Base", "HR", "A searchable collection of HR policies, guides, and process answers."],
  ["Learning Management System", "HR", "Software used to assign, track, and report employee training."],
  ["LMS", "HR", "Learning Management System software for employee training and development."],
  ["Long-Term Disability", "Benefits", "Income replacement coverage for a disability lasting beyond a short-term period."],
  ["Manager Approval", "HR", "A workflow step where a manager reviews and approves a request or change."],
  ["Mileage Reimbursement", "Payroll", "Payment to employees for business miles driven in a personal vehicle."],
  ["New Hire Onboarding", "HR", "The workflow that prepares a new employee before and during their first days."],
  ["Notice Period", "HR", "The amount of time given before an employee or employer ends employment."],
  ["Offboarding", "HR", "The process of managing an employee's departure from the company."],
  ["Open Role", "Hiring", "A position approved for recruiting and hiring."],
  ["Organizational Chart", "HR", "A diagram showing reporting lines, teams, and organizational structure."],
  ["Pay Transparency", "Compliance", "Rules or practices for sharing pay ranges and compensation information."],
  ["Payroll Approval", "Payroll", "A review step before wages, deductions, and taxes are finalized."],
  ["Payroll Journal", "Reporting", "An accounting report summarizing payroll entries for the general ledger."],
  ["Payroll Reconciliation", "Payroll", "The process of comparing payroll results against records, bank activity, and taxes."],
  ["People Analytics", "Reporting", "Analysis of workforce data to understand trends, risks, and opportunities."],
  ["Pre-Adverse Action", "Hiring", "A notice sent before taking adverse action based on background check information."],
  ["Protected Class", "Compliance", "A legally protected characteristic such as race, sex, age, disability, or religion."],
  ["Reference Check", "Hiring", "A hiring step used to confirm candidate work history or qualifications."],
  ["Rehire Eligibility", "HR", "A status indicating whether a former employee may be hired again."],
  ["Remote I-9 Verification", "Compliance", "A process for completing I-9 document review when employees are not onsite."],
  ["Retention Rate", "Reporting", "The percentage of employees who remain employed over a period of time."],
  ["Role-Based Access Control", "Security", "Permissions that limit system access based on user role."],
  ["Salary History Ban", "Compliance", "A law that restricts asking candidates about past compensation."],
  ["Secure Document Storage", "Security", "Controlled storage for sensitive employee, payroll, and company documents."],
  ["Separation Date", "HR", "The effective date an employee's employment ends."],
  ["Single Sign-On", "Security", "A login method that lets users access systems through one identity provider."],
  ["Skill Matrix", "HR", "A view of employee skills, proficiency, and coverage across a team."],
  ["SOC 2", "Security", "A security and controls framework commonly used for technology service providers."],
  ["Succession Planning", "HR", "Planning for future leadership and critical role coverage."],
  ["Tax Notice", "Payroll Tax", "An agency communication about payroll taxes, filings, rates, or account status."],
  ["Time and Attendance", "Time", "The process of tracking employee work hours, breaks, and attendance."],
  ["Time Off Request", "Leave", "An employee request to use vacation, sick time, PTO, or another leave type."],
  ["Time Tracking", "Time", "Recording employee hours worked for payroll, billing, compliance, or analytics."],
  ["Turnover Rate", "Reporting", "The percentage of employees who leave over a period of time."],
  ["Two-Factor Authentication", "Security", "A login security method requiring a second verification factor."],
  ["Unpaid Leave", "Leave", "Approved time away from work without wage payment."],
  ["User Provisioning", "Security", "The process of creating, updating, and removing system access."],
  ["Vacation Policy", "Leave", "Rules for earning, using, carrying over, and paying out vacation time."],
  ["Voluntary Benefits", "Benefits", "Optional employee-paid benefits such as life, disability, pet, or legal coverage."],
  ["Work Authorization", "Compliance", "Legal permission for a person to work in the United States."],
  ["Workforce Planning", "Reporting", "Planning headcount, skills, budget, and hiring needs for the future."],
  ["Zero-Dollar Payroll", "Payroll", "A payroll run with no net wages, often used for corrections or tax-only adjustments."],
] as const satisfies readonly TermEntry[];

const productPathByCategory: Record<GlossaryCategory, string> = {
  Payroll: "/product/payroll",
  "Payroll Tax": "/product/payroll",
  Compliance: "/product/compliance",
  Benefits: "/product/benefits",
  HR: "/product/hris",
  Hiring: "/product/ats",
  Time: "/product/time",
  Leave: "/product/time",
  Reporting: "/product/analytics",
  Security: "/product/compliance",
};

const baseGlossaryTerms = termEntries
  .map(([term, category, shortDefinition]) => ({
    term,
    slug: slugifyGlossaryTerm(term),
    category,
    shortDefinition,
  }))
  .sort((a, b) => a.term.localeCompare(b.term, "en", { numeric: true }));

export const glossaryTerms: GlossaryTerm[] = baseGlossaryTerms.map((term) => ({
  ...term,
  productPath: productPathByCategory[term.category],
  relatedSlugs: [
    ...baseGlossaryTerms
      .filter((candidate) => candidate.category === term.category && candidate.slug !== term.slug)
      .slice(0, 3),
    ...baseGlossaryTerms
      .filter((candidate) => candidate.category !== term.category && candidate.slug !== term.slug)
      .slice(0, 3),
  ]
    .slice(0, 3)
    .map((candidate) => candidate.slug),
}));

export const glossaryTermCount = glossaryTerms.length;

export function getGlossaryTerm(slug: string) {
  return glossaryTerms.find((term) => term.slug === slug);
}

export function getRelatedGlossaryTerms(term: GlossaryTerm, limit = 4) {
  const relatedFromMetadata = term.relatedSlugs
    .map((slug) => getGlossaryTerm(slug))
    .filter((candidate): candidate is GlossaryTerm => Boolean(candidate));
  const sameCategory = glossaryTerms.filter(
    (candidate) =>
      candidate.category === term.category &&
      candidate.slug !== term.slug &&
      !term.relatedSlugs.includes(candidate.slug),
  );
  const fallback = glossaryTerms.filter(
    (candidate) =>
      candidate.category !== term.category &&
      candidate.slug !== term.slug &&
      !term.relatedSlugs.includes(candidate.slug),
  );

  return [...relatedFromMetadata, ...sameCategory, ...fallback].slice(0, limit);
}

export function getCircleWorksFeature(term: GlossaryTerm) {
  const featureByCategory: Record<GlossaryCategory, string> = {
    Payroll: "CircleWorks Payroll keeps wages, deductions, and pay schedules organized automatically.",
    "Payroll Tax": "CircleWorks handles payroll taxes, filings, and agency-ready records automatically.",
    Compliance: "CircleWorks Compliance keeps required notices, workflows, and audit trails in one place.",
    Benefits: "CircleWorks Benefits syncs eligibility, enrollment, and deductions with payroll.",
    HR: "CircleWorks HRIS keeps employee records, org charts, documents, and workflows synced.",
    Hiring: "CircleWorks Hiring helps teams post roles, track candidates, and move offers forward.",
    Time: "CircleWorks Time turns hours, breaks, and schedules into payroll-ready data.",
    Leave: "CircleWorks Leave tracks balances, requests, approvals, and policy rules automatically.",
    Reporting: "CircleWorks Analytics turns workforce and payroll data into clear reports.",
    Security: "CircleWorks protects employee data with permissions, audit trails, and secure access controls.",
  };

  return featureByCategory[term.category];
}

export function getDefinitionParagraphs(term: GlossaryTerm) {
  const categoryContext: Record<GlossaryCategory, string> = {
    Payroll:
      "In payroll operations, the details affect what employees receive, what employers owe, and how cleanly each pay run closes.",
    "Payroll Tax":
      "For payroll tax, accuracy matters because employers must withhold, deposit, file, and keep records on strict federal, state, and local timelines.",
    Compliance:
      "For HR compliance, the goal is to create repeatable processes that meet legal requirements and leave a clear record when questions come up.",
    Benefits:
      "In benefits administration, the term usually affects eligibility, employee elections, payroll deductions, carrier updates, or plan documentation.",
    HR:
      "For HR teams, the term is part of the operating system for employee records, manager workflows, policy decisions, and employee self-service.",
    Hiring:
      "In hiring, clear definitions help recruiters and managers run a consistent process from job opening to accepted offer.",
    Time:
      "For time and attendance, the term can affect hours worked, overtime, breaks, schedules, and the payroll data sent downstream.",
    Leave:
      "For leave management, the term helps define how employees request time away, how balances are calculated, and how approvals are documented.",
    Reporting:
      "For reporting and analytics, the term helps companies interpret workforce data and make cleaner decisions about cost, risk, and planning.",
    Security:
      "For security, the term helps protect sensitive employee and payroll data while giving people the right level of access.",
  };

  return [
    `${term.term} means: ${term.shortDefinition}`,
    `${categoryContext[term.category]} ${term.term} is important because small mistakes can create payroll errors, compliance risk, employee confusion, or extra manual work for HR and finance teams.`,
    `CircleWorks helps teams manage ${term.term} by connecting payroll, HR, benefits, compliance, time, and reporting data in one workspace, so the definition is not just a policy term but something your team can act on in day-to-day workflows.`,
  ];
}
