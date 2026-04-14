import { NextResponse } from 'next/server';

const payBandAnalysis = {
  bands: [
    {
      role: 'Software Engineer I',
      department: 'Engineering',
      location: 'Remote',
      bandMin: 85000,
      bandMid: 105000,
      bandMax: 125000,
      avgActual: 102500,
      employees: 42,
      outliers: 2,
    },
    {
      role: 'Software Engineer II',
      department: 'Engineering',
      location: 'Remote',
      bandMin: 110000,
      bandMid: 135000,
      bandMax: 160000,
      avgActual: 141000,
      employees: 35,
      outliers: 5, // Exceeds 20%
    },
    {
      role: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      bandMin: 145000,
      bandMid: 175000,
      bandMax: 205000,
      avgActual: 180000,
      employees: 28,
      outliers: 1,
    },
    {
      role: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      bandMin: 120000,
      bandMid: 145000,
      bandMax: 170000,
      avgActual: 138000,
      employees: 12,
      outliers: 0,
    },
    {
      role: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      bandMin: 70000,
      bandMid: 85000,
      bandMax: 100000,
      avgActual: 82000,
      employees: 18,
      outliers: 3,
    },
  ],
  payGaps: [
    {
      demographic: 'Gender',
      group: 'Female',
      baseline: 'Male',
      differencePercentage: -2.4, // Female earns 2.4% less than Male
      status: 'Monitor',
    },
    {
      demographic: 'Race/Ethnicity',
      group: 'Hispanic/Latino',
      baseline: 'White',
      differencePercentage: -4.1,
      status: 'Action Required',
    },
    {
      demographic: 'Race/Ethnicity',
      group: 'Asian',
      baseline: 'White',
      differencePercentage: +1.2,
      status: 'Compliant',
    },
    {
      demographic: 'Intersectionality',
      group: 'Women of Color',
      baseline: 'White Men',
      differencePercentage: -5.8,
      status: 'Action Required',
    },
  ],
  distributionData: [
    { name: 'SE I', min: 85000, bottom: 95000, top: 110000, max: 125000, avg: 102500, range: [85000, 125000] },
    { name: 'SE II', min: 110000, bottom: 125000, top: 150000, max: 160000, avg: 141000, range: [110000, 160000] },
    { name: 'Sr SE', min: 145000, bottom: 160000, top: 190000, max: 205000, avg: 180000, range: [145000, 205000] },
    { name: 'PM', min: 120000, bottom: 130000, top: 155000, max: 170000, avg: 138000, range: [120000, 170000] },
    { name: 'Mktg', min: 70000, bottom: 75000, top: 90000, max: 100000, avg: 82000, range: [70000, 100000] },
  ],
  alerts: [
    {
      id: 'a1',
      type: 'Law Update',
      message: 'New pay transparency law in Illinois (HB 3129) effective Jan 1, 2025. Update job postings.',
      date: '2024-05-10',
      action: 'Update Postings',
    },
    {
      id: 'a2',
      type: 'Pay Gap Detected',
      message: 'Pay gap detected in Engineering: Women of Color paid 5.8% less than White Men for same roles.',
      date: '2024-05-12',
      action: 'Review Comp',
    },
    {
      id: 'a3',
      type: 'Outlier Warning',
      message: 'Software Engineer II role has 5 outliers (>20% above/below midpoint). Review band alignment.',
      date: '2024-05-13',
      action: 'View Outliers',
    },
    {
      id: 'a4',
      type: 'ATS Warning',
      message: 'Job posting for "Senior Product Designer" (New York) is missing required Pay Range field.',
      date: '2024-05-14',
      action: 'Fix Posting',
    }
  ]
};

export async function GET() {
  return NextResponse.json(payBandAnalysis);
}
