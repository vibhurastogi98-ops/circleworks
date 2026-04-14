import { NextResponse } from 'next/server';

const stateComplianceData = [
  {
    id: 'CA',
    state: 'California',
    lawName: 'SB 1162 / Equal Pay Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Pay scale in job postings. Pay data reporting by gender, race, ethnicity.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'CO',
    state: 'Colorado',
    lawName: 'Equal Pay for Equal Work Act',
    effectiveDate: 'Jan 1, 2021',
    requirements: 'Salary range and benefits in job postings. Internal promotion notices.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'NY',
    state: 'New York',
    lawName: 'Wage Transparency Law',
    effectiveDate: 'Sep 17, 2023',
    requirements: 'Salary range and job description in job advertisements.',
    status: 'Action Required',
    action: 'Update Job Postings',
  },
  {
    id: 'WA',
    state: 'Washington',
    lawName: 'Equal Pay and Opportunities Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Salary range and benefits in job postings.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'IL',
    state: 'Illinois',
    lawName: 'HB 3129',
    effectiveDate: 'Jan 1, 2025',
    requirements: 'Pay scale and benefits in job postings with 15+ employees.',
    status: 'Action Required',
    action: 'Prepare ATS Integration',
  },
  {
    id: 'NV',
    state: 'Nevada',
    lawName: 'SB 293',
    effectiveDate: 'Oct 1, 2021',
    requirements: 'Wage range provided to applicants after interview, to employees on promotion.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'RI',
    state: 'Rhode Island',
    lawName: 'Pay Equity Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Provide wage range on request to applicants and employees.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'MD',
    state: 'Maryland',
    lawName: 'Equal Pay for Equal Work Law',
    effectiveDate: 'Oct 1, 2020',
    requirements: 'Provide wage range on request to applicants.',
    status: 'Compliant',
    action: 'None',
  },
];

export async function GET() {
  return NextResponse.json(stateComplianceData);
}
