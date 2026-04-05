export interface BenefitPlan {
  id: string;
  name: string;
  type: 'Medical' | 'Dental' | 'Vision' | 'Life' | 'AD&D' | 'STD' | 'LTD' | 'FSA' | 'HSA' | '401k' | 'WC';
  carrier: string;
  employeePremium: number;
  employerPremium: number;
  enrolled: number;
  eligible: number;
  status: 'Active' | 'Inactive' | 'Pending';
  effectiveStart: string;
  effectiveEnd: string;
  eligibility: string;
}

export interface CobraCase {
  id: string;
  employeeName: string;
  status: 'Eligible' | 'Notified' | 'Elected' | 'Declined' | 'Active' | 'Terminated';
  qualifyingEvent: string;
  noticeSentDate: string | null;
  electionDeadline: string;
  premiumAmount: number;
  paymentStatus: 'Current' | 'Past Due' | 'Unpaid';
}

export interface RetirementAccount {
  employeeName: string;
  contributionRate: number;
  employerMatch: number;
  ytdEmployee: number;
  ytdEmployer: number;
  irsLimit: number;
}

export interface FsaHsaAccount {
  employeeName: string;
  accountType: 'FSA' | 'HSA';
  annualElection: number;
  ytdContributions: number;
  ytdSpent: number;
  balance: number;
  irsLimit: number;
}

export interface LifeDisabilityRecord {
  employeeName: string;
  lifeAmount: number;
  addAmount: number;
  stdStatus: 'Enrolled' | 'Waived';
  ltdStatus: 'Enrolled' | 'Waived';
  beneficiary: string;
  eoiRequired: boolean;
  eoiStatus: 'N/A' | 'Pending' | 'Approved' | 'Denied';
}

export interface WcClaim {
  id: string;
  employeeName: string;
  dateOfInjury: string;
  description: string;
  status: 'Open' | 'Under Review' | 'Approved' | 'Denied' | 'Closed';
  totalPaid: number;
}

// ---------- MOCK DATA ----------

export const mockBenefitPlans: BenefitPlan[] = [
  { id: 'bp-1', name: 'Blue Cross PPO Gold', type: 'Medical', carrier: 'Blue Cross Blue Shield', employeePremium: 250, employerPremium: 650, enrolled: 38, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'Full-Time' },
  { id: 'bp-2', name: 'Blue Cross PPO Silver', type: 'Medical', carrier: 'Blue Cross Blue Shield', employeePremium: 150, employerPremium: 450, enrolled: 7, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'All' },
  { id: 'bp-3', name: 'Delta Dental PPO', type: 'Dental', carrier: 'Delta Dental', employeePremium: 35, employerPremium: 65, enrolled: 40, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'All' },
  { id: 'bp-4', name: 'VSP Choice', type: 'Vision', carrier: 'VSP', employeePremium: 12, employerPremium: 18, enrolled: 32, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'All' },
  { id: 'bp-5', name: 'Basic Life & AD&D', type: 'Life', carrier: 'MetLife', employeePremium: 0, employerPremium: 25, enrolled: 45, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'All' },
  { id: 'bp-6', name: 'Guideline 401(k)', type: '401k', carrier: 'Guideline', employeePremium: 0, employerPremium: 0, enrolled: 35, eligible: 45, status: 'Active', effectiveStart: '2024-01-01', effectiveEnd: '2024-12-31', eligibility: 'After 30 Days' },
];

export const mockCobraCases: CobraCase[] = [
  { id: 'cobra-1', employeeName: 'Derek Lawson', status: 'Notified', qualifyingEvent: 'Voluntary Resignation', noticeSentDate: '2024-09-20', electionDeadline: '2024-11-20', premiumAmount: 1850, paymentStatus: 'Unpaid' },
  { id: 'cobra-2', employeeName: 'Felicia Grant', status: 'Eligible', qualifyingEvent: 'End of Contract', noticeSentDate: null, electionDeadline: '2024-12-30', premiumAmount: 1650, paymentStatus: 'Unpaid' },
  { id: 'cobra-3', employeeName: 'Tom Rivera', status: 'Active', qualifyingEvent: 'Reduction in Hours', noticeSentDate: '2024-06-01', electionDeadline: '2024-08-01', premiumAmount: 1450, paymentStatus: 'Current' },
];

export const mockRetirementAccounts: RetirementAccount[] = [
  { employeeName: 'Sarah Johnson', contributionRate: 6, employerMatch: 4, ytdEmployee: 9200, ytdEmployer: 6133, irsLimit: 23000 },
  { employeeName: 'Mike Chen', contributionRate: 10, employerMatch: 4, ytdEmployee: 14500, ytdEmployer: 5800, irsLimit: 23000 },
  { employeeName: 'Amy Park', contributionRate: 15, employerMatch: 4, ytdEmployee: 19800, ytdEmployer: 5280, irsLimit: 23000 },
  { employeeName: 'Carlos Diaz', contributionRate: 3, employerMatch: 3, ytdEmployee: 3900, ytdEmployer: 3900, irsLimit: 23000 },
];

export const mockFsaHsaAccounts: FsaHsaAccount[] = [
  { employeeName: 'Sarah Johnson', accountType: 'HSA', annualElection: 3850, ytdContributions: 2890, ytdSpent: 1200, balance: 4650, irsLimit: 4150 },
  { employeeName: 'Mike Chen', accountType: 'FSA', annualElection: 3050, ytdContributions: 2288, ytdSpent: 1800, balance: 488, irsLimit: 3200 },
  { employeeName: 'Amy Park', accountType: 'HSA', annualElection: 4150, ytdContributions: 3113, ytdSpent: 650, balance: 8200, irsLimit: 4150 },
  { employeeName: 'Carlos Diaz', accountType: 'FSA', annualElection: 1500, ytdContributions: 1125, ytdSpent: 900, balance: 225, irsLimit: 3200 },
];

export const mockLifeDisability: LifeDisabilityRecord[] = [
  { employeeName: 'Sarah Johnson', lifeAmount: 150000, addAmount: 150000, stdStatus: 'Enrolled', ltdStatus: 'Enrolled', beneficiary: 'Robert Johnson (Spouse)', eoiRequired: false, eoiStatus: 'N/A' },
  { employeeName: 'Mike Chen', lifeAmount: 500000, addAmount: 250000, stdStatus: 'Enrolled', ltdStatus: 'Enrolled', beneficiary: 'Lisa Chen (Spouse)', eoiRequired: true, eoiStatus: 'Approved' },
  { employeeName: 'Amy Park', lifeAmount: 100000, addAmount: 100000, stdStatus: 'Enrolled', ltdStatus: 'Waived', beneficiary: 'David Park (Father)', eoiRequired: false, eoiStatus: 'N/A' },
  { employeeName: 'Carlos Diaz', lifeAmount: 750000, addAmount: 250000, stdStatus: 'Enrolled', ltdStatus: 'Enrolled', beneficiary: 'Maria Diaz (Spouse)', eoiRequired: true, eoiStatus: 'Pending' },
];

export const mockWcClaims: WcClaim[] = [
  { id: 'wc-1', employeeName: 'Jason Mills', dateOfInjury: '2024-07-15', description: 'Slip and fall in warehouse', status: 'Open', totalPaid: 3200 },
  { id: 'wc-2', employeeName: 'Karen White', dateOfInjury: '2024-03-22', description: 'Repetitive stress injury - wrist', status: 'Closed', totalPaid: 8500 },
];
