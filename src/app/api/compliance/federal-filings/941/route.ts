import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quarter = searchParams.get('quarter') || 'Q1-2026';

  // Mock data for 941 auto-population from payroll run
  const mock941Data = {
    quarter,
    line1_employees: 42,
    line2_wages: 540000.0,
    line3_federalWithheld: 86400.0,
    line5a_socialSecurity: 33480.0,
    line5c_medicare: 7830.0,
    line13_deposits: 127710.0,
    line14_balanceDue: 0.0, // Or overpayment
    status: 'Draft',
    dueDate: 'April 30, 2026'
  };

  return NextResponse.json(mock941Data);
}
