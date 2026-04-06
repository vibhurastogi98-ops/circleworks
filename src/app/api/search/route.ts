import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  // Artificial delay to simulate Elasticsearch network time (< 100ms)
  await new Promise(resolve => setTimeout(resolve, 80));

  // --- MOCKED DATABASE REGISTRY ---
  const allResults = [
    // EMPLOYEES
    { type: 'EMPLOYEES', id: 'emp_1', title: 'Sarah Chen', subtitle: 'Senior Engineer · Engineering', icon: 'User', url: '/employees/sarah-chen' },
    { type: 'EMPLOYEES', id: 'emp_2', title: 'John Doe', subtitle: 'Account Executive · Sales', icon: 'User', url: '/employees/john-doe' },
    { type: 'EMPLOYEES', id: 'emp_3', title: 'Mike Torres', subtitle: 'Product Manager · Product', icon: 'User', url: '/employees/mike-torres' },
    { type: 'EMPLOYEES', id: 'emp_4', title: 'Alice Kim', subtitle: 'HR Director · Human Resources', icon: 'User', url: '/employees/alice-kim' },
    { type: 'EMPLOYEES', id: 'emp_5', title: 'Tom Lee', subtitle: 'Data Scientist · Engineering', icon: 'User', url: '/employees/tom-lee' },

    // RECENT PAYROLL RUNS
    { type: 'RECENT PAYROLL RUNS', id: 'pr_1', title: 'Regular Payroll - Apr 1-15', subtitle: 'Processed · Apr 16, 2026', icon: 'DollarSign', url: '/payroll/run/pr_1' },
    { type: 'RECENT PAYROLL RUNS', id: 'pr_2', title: 'Off-cycle Bonus Run', subtitle: 'Paid · Mar 20, 2026', icon: 'DollarSign', url: '/payroll/run/pr_2' },
    { type: 'RECENT PAYROLL RUNS', id: 'pr_3', title: 'Regular Payroll - Mar 16-31', subtitle: 'Paid · Apr 2, 2026', icon: 'DollarSign', url: '/payroll/run/pr_3' },

    // REPORTS
    { type: 'REPORTS', id: 'rep_1', title: 'Headcount Summary', subtitle: 'Analytics & Reporting', icon: 'FileText', url: '/reports/headcount' },
    { type: 'REPORTS', id: 'rep_2', title: 'Payroll Journal', subtitle: 'Finance & Payroll', icon: 'FileText', url: '/reports/payroll' },
    { type: 'REPORTS', id: 'rep_3', title: 'Time Off Balances', subtitle: 'Time & Attendance', icon: 'FileText', url: '/reports/timeoff' },

    // PAGES
    { type: 'PAGES', id: 'page_1', title: 'Company Settings', subtitle: 'Admin Configuration', icon: 'Settings', url: '/settings/company' },
    { type: 'PAGES', id: 'page_2', title: 'Billing & Plan', subtitle: 'Admin Configuration', icon: 'CreditCard', url: '/settings/billing' },
    { type: 'PAGES', id: 'page_3', title: 'Benefits Dashboard', subtitle: 'Benefits Administration', icon: 'HeartPulse', url: '/benefits' },
    { type: 'PAGES', id: 'page_4', title: 'Compliance Hub', subtitle: 'Tax & Compliance', icon: 'ShieldAlert', url: '/compliance' },

    // ACTIONS
    { type: 'ACTIONS', id: 'act_1', title: 'Run Payroll Now', subtitle: 'Execute regular or off-cycle payroll', icon: 'PlayCircle', url: '/payroll/run' },
    { type: 'ACTIONS', id: 'act_2', title: 'Add New Employee', subtitle: 'Start onboarding workflow', icon: 'UserPlus', url: '/employees/new' },
    { type: 'ACTIONS', id: 'act_3', title: 'Open Compliance Dashboard', subtitle: 'View upcoming deadlines', icon: 'ExternalLink', url: '/compliance' },

    // DOCUMENTS
    { type: 'DOCUMENTS', id: 'doc_1', title: 'Employee Handbook 2026.pdf', subtitle: 'Company Policies', icon: 'File', url: '/documents/handbook' },
    { type: 'DOCUMENTS', id: 'doc_2', title: 'W-4 Tax Form Fillable.pdf', subtitle: 'Onboarding Resources', icon: 'File', url: '/documents/w4' },
    { type: 'DOCUMENTS', id: 'doc_3', title: 'Q1 All-Hands Deck.pptx', subtitle: 'Company Resources', icon: 'File', url: '/documents/q1-deck' },
  ];

  // Map keywords to specific quick actions/pages to provide smart results
  const intentMapping: Record<string, string[]> = {
    'run payroll': ['act_1', 'page_1'],
    'add employee': ['act_2', 'page_1'],
    'compliance': ['act_3', 'page_4'],
    'settings': ['page_1', 'page_2'],
    'report': ['rep_1', 'rep_2', 'rep_3']
  };

  if (!query) {
    // Return empty state or let frontend handle it
    return NextResponse.json({ results: [] });
  }

  // 1. Check for specific exact intents 
  let mappedIds = new Set<string>();
  Object.keys(intentMapping).forEach(keyword => {
    if (keyword.includes(query) || query.includes(keyword)) {
      intentMapping[keyword].forEach(id => mappedIds.add(id));
    }
  });

  // 2. Fuzzy search across title, subtitle, type
  const fuzzyResults = allResults.filter(item => {
    if (mappedIds.has(item.id)) return true;
    return item.title.toLowerCase().includes(query) || 
           item.subtitle.toLowerCase().includes(query) || 
           item.type.toLowerCase().includes(query);
  });

  return NextResponse.json({ results: fuzzyResults });
}
