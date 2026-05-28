# Sec. 26 — Standard Report Specifications Addendum

All standard reports must define column headers, support sortable columns, expose CSV/PDF/Excel exports, and use a single `Run Report` action with a date range filter.

## Payroll Reports

| Report | Required Contents | Column Headers |
| --- | --- | --- |
| Payroll Summary | Period totals with department split | Period, Total Gross, Taxes, Net Pay, Dept Split |
| Payroll Detail | Per employee view of all earnings, deductions, taxes, and net pay | Employee, Regular Earnings, Overtime Earnings, Bonus Earnings, Pre-Tax Deductions, Post-Tax Deductions, Taxes, Net Pay |
| Tax Liability | Payroll taxes by type across FICA, FUTA, SUTA, federal, and state liabilities | Tax Type, Jurisdiction, Employee Tax, Employer Tax, Total Liability, Due Date |
| GL Journal | Accounting system mapping for GL sync | GL Account, Account Name, Department, Debit, Credit, Payroll Run, Sync Status |
| Year-to-Date Earnings | Employee by month with YTD cumulative totals | Employee, Month, Gross YTD, Tax YTD, Deduction YTD, Net YTD |
| New Hires Report | All new hires in the selected period for state new hire reporting | Employee, Hire Date, State, Department, Job Title, Manager, Reporting Status |
| Terminated Employees | Terminations with final pay amounts | Employee, Termination Date, Reason, Final Pay Date, Final Gross, Final Net |

## HRIS Reports

| Report | Required Contents | Column Headers |
| --- | --- | --- |
| Headcount | Department, location, and employment type as of date | As Of Date, Department, Location, Employment Type, Headcount |
| Turnover | Attrition rate by department and period | Period, Department, Starting Headcount, Terminations, Ending Headcount, Attrition Rate |
| Birthday/Anniversary List | Upcoming events in the next 30/60/90 days | Employee, Event Type, Event Date, Days Away, Department, Manager |
| Org Chart Export | Downloadable PNG/PDF org chart with employee-manager structure | Employee, Manager, Department, Job Title, Location |
| Demographics | EEO-1 categories for EEO filing | EEO-1 Category, Race/Ethnicity, Gender, Department, Location, Employee Count |

## Time & Attendance Reports

| Report | Required Contents | Column Headers |
| --- | --- | --- |
| Timesheet Summary | Hours per employee per period | Employee, Period, Regular Hours, Overtime Hours, PTO Hours, Total Hours |
| Overtime | Employees with OT hours and dollar cost | Employee, Department, Period, OT Hours, OT Rate, OT Dollar Cost |
| PTO Liability | Accrued balance multiplied by hourly rate | Employee, Department, Accrued Balance, Hourly Rate, Dollar Liability |

## Benefits Reports

| Report | Required Contents | Column Headers |
| --- | --- | --- |
| Benefits Enrollment | Plan by enrolled or waived status per employee | Employee, Plan, Plan Type, Enrolled/Waived, Coverage Tier, Effective Date |
| Benefits Cost | Employer vs employee share per plan | Plan, Plan Type, Enrolled Employees, Employer Share, Employee Share, Total Cost |
| COBRA Enrollments | Active COBRA participants and current status | Participant, Qualifying Event, Coverage Start, Coverage End, Status, Monthly Premium |

## Standard Controls

- Every column listed above is sortable in the standard report viewer.
- Every report supports CSV, PDF, and Excel export. Org Chart Export may additionally expose PNG.
- Every report card uses a single `Run Report` button.
- Every standard report exposes a date range filter before running the report.
