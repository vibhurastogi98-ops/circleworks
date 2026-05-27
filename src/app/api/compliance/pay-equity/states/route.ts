import { NextResponse } from 'next/server';

const stateComplianceData = [
  {
    id: 'CA',
    state: 'California',
    lawName: 'SB 1162 / Equal Pay Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Employers with 15+ employees must include the pay scale in job postings; covered employers also maintain pay data reporting by gender, race, and ethnicity.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'CO',
    state: 'Colorado',
    lawName: 'Equal Pay for Equal Work Act',
    effectiveDate: 'Jan 1, 2021',
    requirements: 'Disclose salary range, benefits, and other compensation in postings; provide job opportunity notices to employees.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'NY',
    state: 'New York',
    lawName: 'Wage Transparency Law',
    effectiveDate: 'Sep 17, 2023',
    requirements: 'Advertisements for roles performed in New York, or reporting to a New York work site, must include a good-faith compensation range and job description if one exists.',
    status: 'Action Required',
    action: 'Update Job Postings',
  },
  {
    id: 'WA',
    state: 'Washington',
    lawName: 'Equal Pay and Opportunities Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Employers with 15+ employees recruiting Washington-based workers must disclose wage scale or salary range, benefits, and other compensation in postings.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'IL',
    state: 'Illinois',
    lawName: 'Equal Pay Act Pay Transparency Amendment',
    effectiveDate: 'Jan 1, 2025',
    requirements: 'Employers with 15+ employees must include pay scale, benefits, and other compensation in covered internal and external postings.',
    status: 'Action Required',
    action: 'Audit Active Postings',
  },
  {
    id: 'NV',
    state: 'Nevada',
    lawName: 'SB 293',
    effectiveDate: 'Oct 1, 2021',
    requirements: 'Provide wage or salary range to applicants after interview and to employees applying for transfer or promotion when conditions are met.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'RI',
    state: 'Rhode Island',
    lawName: 'Pay Equity Act',
    effectiveDate: 'Jan 1, 2023',
    requirements: 'Provide wage range to applicants on request and before compensation discussion; provide ranges for hires, transfers, and current employees.',
    status: 'Compliant',
    action: 'None',
  },
  {
    id: 'MD',
    state: 'Maryland',
    lawName: 'Equal Pay for Equal Work - Wage Range Transparency',
    effectiveDate: 'Oct 1, 2024',
    requirements: 'Public and internal postings for work performed at least partly in Maryland must include wage range, benefits, and other compensation.',
    status: 'Action Required',
    action: 'Update Maryland Templates',
  },
];

export async function GET() {
  return NextResponse.json(stateComplianceData);
}
