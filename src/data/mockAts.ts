import { employees, getEmployeeName } from "@/lib/hris-module-data";

export type JobStatus = "Draft" | "Active" | "Paused" | "Closed";
export type CandidateStage = "New" | "Screening" | "Take-Home" | "Onsite" | "Offer" | "Hired" | "Withdrawn";
export type CandidateSource = "Indeed" | "LinkedIn" | "Referral" | "Direct" | "Agency" | "Manual";
export type OfferStatus = "Pending" | "Accepted" | "Declined" | "Countered";

export interface AtsJob {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "Onsite";
  officeAddress?: string;
  type: string;
  status: JobStatus;
  applicantsCount: number;
  daysOpen: number;
  postedDate: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  interviewStages: CandidateStage[];
  hiringManagerId: string;
  teamMemberIds: string[];
  publishOptions: {
    internalOnly: boolean;
    publicPosting: boolean;
    indeed: boolean;
    linkedIn: boolean;
  };
}

export interface AtsCandidate {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  linkedinUrl?: string;
  source: CandidateSource;
  stage: CandidateStage;
  appliedDate: string;
  aiScore: number;
  rating?: number;
  daysInStage: number;
  resumeSnippet: string;
  resumeUrl?: string;
  reviewers: string[];
  reviewerIds: string[];
  currentTitle: string;
  skills: string[];
  notes: Array<{ author: string; body: string; createdAt: string }>;
  activity: Array<{ label: string; detail: string; createdAt: string }>;
}

export interface AtsInterview {
  id: string;
  jobId: string;
  candidateId: string;
  scheduledAt: string;
  endsAt: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  interviewers: string[];
  interviewerIds: string[];
  type: string;
  meeting: string;
  feedbackStatus: "Pending" | "Submitted";
}

export interface AtsOffer {
  id: string;
  candidateId: string;
  jobId: string;
  offerDate: string;
  salary: number;
  signingBonus: number;
  equity: string;
  startDate: string;
  status: OfferStatus;
  template: string;
  openedAt?: string;
}

export const STAGES: { id: CandidateStage; title: string; color: string }[] = [
  { id: "New", title: "New", color: "bg-blue-500" },
  { id: "Screening", title: "Phone Screen", color: "bg-violet-500" },
  { id: "Take-Home", title: "Take-Home", color: "bg-amber-500" },
  { id: "Onsite", title: "Onsite", color: "bg-cyan-500" },
  { id: "Offer", title: "Offer", color: "bg-emerald-500" },
  { id: "Hired", title: "Hired", color: "bg-green-600" },
  { id: "Withdrawn", title: "Withdrawn", color: "bg-rose-500" },
];

export const JOB_TEMPLATES = [
  {
    id: "tpl-engineering",
    title: "Engineering role",
    department: "Engineering",
    stages: ["New", "Screening", "Take-Home", "Onsite", "Offer"] as CandidateStage[],
    requirements: ["5+ years building production software", "Strong TypeScript and React fluency", "Experience with design systems"],
  },
  {
    id: "tpl-payroll",
    title: "Payroll operations role",
    department: "Payroll",
    stages: ["New", "Screening", "Onsite", "Offer"] as CandidateStage[],
    requirements: ["Payroll domain expertise", "Customer implementation experience", "Strong Excel and reconciliation skills"],
  },
  {
    id: "tpl-people",
    title: "People team role",
    department: "People",
    stages: ["New", "Screening", "Onsite", "Offer"] as CandidateStage[],
    requirements: ["Employee relations experience", "Excellent written communication", "Comfort with HRIS workflows"],
  },
];

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

const reviewer = (employeeId: string) => {
  const employee = employees.find((item) => item.id === employeeId) || employees[0];
  return avatarUrl(getEmployeeName(employee));
};

const INITIAL_JOBS: AtsJob[] = [
  {
    id: "job-frontend",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote - United States",
    locationType: "Remote",
    type: "Full-Time",
    status: "Active",
    applicantsCount: 0,
    daysOpen: 36,
    postedDate: "2026-04-23",
    salaryMin: 145000,
    salaryMax: 182000,
    hiringManagerId: "2",
    teamMemberIds: ["2", "3", "7"],
    interviewStages: ["New", "Screening", "Take-Home", "Onsite", "Offer"],
    publishOptions: { internalOnly: false, publicPosting: true, indeed: true, linkedIn: true },
    description:
      "Build the employee, payroll, and analytics surfaces that make CircleWorks feel fast, clear, and trustworthy for HR teams.",
    requirements: ["7+ years with React and TypeScript", "Strong product engineering judgment", "Accessibility and testing depth"],
    responsibilities: ["Own complex frontend systems", "Partner with design on polished workflows", "Mentor engineers through reviews"],
  },
  {
    id: "job-payroll-consultant",
    title: "Payroll Implementation Consultant",
    department: "Payroll",
    location: "Chicago, IL",
    locationType: "Hybrid",
    officeAddress: "440 W Lake St, Chicago, IL",
    type: "Full-Time",
    status: "Active",
    applicantsCount: 0,
    daysOpen: 21,
    postedDate: "2026-05-08",
    salaryMin: 98000,
    salaryMax: 126000,
    hiringManagerId: "4",
    teamMemberIds: ["4", "5", "1"],
    interviewStages: ["New", "Screening", "Onsite", "Offer"],
    publishOptions: { internalOnly: false, publicPosting: true, indeed: true, linkedIn: false },
    description:
      "Lead payroll customer launches, reconcile tax and benefits setup, and help new customers reach their first accurate payroll.",
    requirements: ["Multi-state payroll experience", "Implementation or customer onboarding background", "Clear executive communication"],
    responsibilities: ["Run implementation workshops", "Validate payroll configuration", "Coordinate launch readiness"],
  },
  {
    id: "job-people-generalist",
    title: "People Operations Generalist",
    department: "People",
    location: "Seattle, WA",
    locationType: "Hybrid",
    type: "Full-Time",
    status: "Active",
    applicantsCount: 0,
    daysOpen: 14,
    postedDate: "2026-05-15",
    salaryMin: 84000,
    salaryMax: 104000,
    hiringManagerId: "6",
    teamMemberIds: ["6", "8", "1"],
    interviewStages: ["New", "Screening", "Onsite", "Offer"],
    publishOptions: { internalOnly: false, publicPosting: true, indeed: false, linkedIn: true },
    description:
      "Support employee lifecycle operations, manager enablement, and thoughtful policy execution for a distributed team.",
    requirements: ["3+ years in people operations", "Strong HRIS and documentation habits", "Employee relations judgment"],
    responsibilities: ["Support onboarding and offboarding", "Maintain people programs", "Partner with managers on employee questions"],
  },
  {
    id: "job-product-analyst",
    title: "Product Analytics Lead",
    department: "Product",
    location: "New York, NY",
    locationType: "Onsite",
    officeAddress: "55 Water St, New York, NY",
    type: "Full-Time",
    status: "Paused",
    applicantsCount: 0,
    daysOpen: 48,
    postedDate: "2026-04-11",
    salaryMin: 132000,
    salaryMax: 164000,
    hiringManagerId: "1",
    teamMemberIds: ["1", "2"],
    interviewStages: ["New", "Screening", "Take-Home", "Onsite", "Offer"],
    publishOptions: { internalOnly: true, publicPosting: false, indeed: false, linkedIn: false },
    description:
      "Define product health metrics and turn customer workflows into decision-grade analytics for the platform leadership team.",
    requirements: ["SaaS analytics ownership", "SQL and dashboarding depth", "Experience influencing product roadmaps"],
    responsibilities: ["Build product metric systems", "Partner on experiments", "Present insights to leadership"],
  },
  {
    id: "job-design-systems",
    title: "Design Systems Designer",
    department: "Design",
    location: "Remote - United States",
    locationType: "Remote",
    type: "Contract",
    status: "Draft",
    applicantsCount: 0,
    daysOpen: 0,
    postedDate: "2026-05-29",
    salaryMin: 95,
    salaryMax: 125,
    hiringManagerId: "2",
    teamMemberIds: ["2", "3"],
    interviewStages: ["New", "Screening", "Onsite", "Offer"],
    publishOptions: { internalOnly: true, publicPosting: false, indeed: false, linkedIn: false },
    description: "Create durable interaction patterns for dense HR, payroll, and finance workflows.",
    requirements: ["Design systems portfolio", "Figma component expertise", "Experience with operational SaaS"],
    responsibilities: ["Audit component behavior", "Design reusable patterns", "Collaborate with frontend engineering"],
  },
];

const INITIAL_CANDIDATES: AtsCandidate[] = [
  {
    id: "cand-nia-rivera",
    jobId: "job-frontend",
    firstName: "Nia",
    lastName: "Rivera",
    email: "nia.rivera@example.com",
    phone: "(415) 555-0138",
    location: "Oakland, CA",
    linkedinUrl: "https://linkedin.com/in/niarivera",
    source: "LinkedIn",
    stage: "New",
    appliedDate: "2026-05-26",
    aiScore: 92,
    rating: 5,
    daysInStage: 2,
    currentTitle: "Staff Frontend Engineer",
    skills: ["React", "Design systems", "Accessibility", "Payroll UX"],
    resumeSnippet:
      "Led a React design system migration across payroll, benefits, and reporting workflows with measurable accessibility gains.",
    reviewers: [reviewer("2"), reviewer("3")],
    reviewerIds: ["2", "3"],
    notes: [{ author: "Avery Johnson", body: "Excellent portfolio. Strong regulated-product instincts.", createdAt: "2026-05-27 11:14 AM" }],
    activity: [
      { label: "Applied via LinkedIn", detail: "Resume parsed with 92% AI match", createdAt: "2026-05-26 9:12 AM" },
      { label: "Reviewer added", detail: "Elena Ruiz joined the review loop", createdAt: "2026-05-27 11:14 AM" },
    ],
  },
  {
    id: "cand-owen-park",
    jobId: "job-frontend",
    firstName: "Owen",
    lastName: "Park",
    email: "owen.park@example.com",
    phone: "(512) 555-0119",
    location: "Austin, TX",
    linkedinUrl: "https://linkedin.com/in/owenpark",
    source: "Referral",
    stage: "Screening",
    appliedDate: "2026-05-21",
    aiScore: 84,
    rating: 4,
    daysInStage: 4,
    currentTitle: "Senior UI Engineer",
    skills: ["TypeScript", "TanStack Query", "Frontend architecture"],
    resumeSnippet:
      "Product-minded engineer focused on high-trust dashboards, typed data contracts, and resilient frontend architecture.",
    reviewers: [reviewer("2")],
    reviewerIds: ["2"],
    notes: [{ author: "Elena Ruiz", body: "Referral from a previous teammate. Worth moving quickly.", createdAt: "2026-05-22 3:40 PM" }],
    activity: [
      { label: "Referral submitted", detail: "Referred by Elena Ruiz", createdAt: "2026-05-21 1:20 PM" },
      { label: "Phone screen scheduled", detail: "Avery Johnson for May 30", createdAt: "2026-05-24 2:05 PM" },
    ],
  },
  {
    id: "cand-lena-cho",
    jobId: "job-frontend",
    firstName: "Lena",
    lastName: "Cho",
    email: "lena.cho@example.com",
    phone: "(646) 555-0172",
    location: "Brooklyn, NY",
    source: "Indeed",
    stage: "Take-Home",
    appliedDate: "2026-05-18",
    aiScore: 76,
    rating: 4,
    daysInStage: 3,
    currentTitle: "Frontend Engineer",
    skills: ["React", "Testing Library", "Performance"],
    resumeSnippet:
      "Built accessible analytics modules and reduced dashboard render time by 38% through careful state isolation.",
    reviewers: [reviewer("3")],
    reviewerIds: ["3"],
    notes: [{ author: "Avery Johnson", body: "Take-home due Monday morning.", createdAt: "2026-05-25 9:22 AM" }],
    activity: [
      { label: "Moved to Take-Home", detail: "Assignment sent via candidate email", createdAt: "2026-05-25 9:20 AM" },
    ],
  },
  {
    id: "cand-marcus-green",
    jobId: "job-frontend",
    firstName: "Marcus",
    lastName: "Green",
    email: "marcus.green@example.com",
    phone: "(206) 555-0188",
    location: "Portland, OR",
    source: "Direct",
    stage: "Onsite",
    appliedDate: "2026-05-12",
    aiScore: 88,
    rating: 5,
    daysInStage: 1,
    currentTitle: "Lead Frontend Engineer",
    skills: ["React", "Design systems", "Mentorship"],
    resumeSnippet:
      "Managed a frontend platform team and mentored engineers through accessibility, performance, and API design reviews.",
    reviewers: [reviewer("2"), reviewer("3"), reviewer("7")],
    reviewerIds: ["2", "3", "7"],
    notes: [{ author: "Avery Johnson", body: "Strong onsite loop so far. System design panel tomorrow.", createdAt: "2026-05-28 4:48 PM" }],
    activity: [
      { label: "Onsite loop started", detail: "Three-panel loop created", createdAt: "2026-05-28 10:00 AM" },
    ],
  },
  {
    id: "cand-zoe-miller",
    jobId: "job-frontend",
    firstName: "Zoe",
    lastName: "Miller",
    email: "zoe.miller@example.com",
    phone: "(303) 555-0192",
    location: "Denver, CO",
    source: "Agency",
    stage: "Offer",
    appliedDate: "2026-05-03",
    aiScore: 95,
    rating: 5,
    daysInStage: 2,
    currentTitle: "Principal Frontend Engineer",
    skills: ["React", "Payroll systems", "Frontend platform"],
    resumeSnippet:
      "Principal engineer with payroll-domain experience, polished stakeholder communication, and strong architecture scorecards.",
    reviewers: [reviewer("2"), reviewer("1")],
    reviewerIds: ["2", "1"],
    notes: [{ author: "Maya Patel", body: "Offer approved. Confirm equity range before sending.", createdAt: "2026-05-27 5:02 PM" }],
    activity: [
      { label: "Moved to Offer", detail: "Offer packet drafted", createdAt: "2026-05-27 5:00 PM" },
    ],
  },
  {
    id: "cand-eli-stone",
    jobId: "job-payroll-consultant",
    firstName: "Eli",
    lastName: "Stone",
    email: "eli.stone@example.com",
    phone: "(312) 555-0127",
    location: "Chicago, IL",
    source: "LinkedIn",
    stage: "Screening",
    appliedDate: "2026-05-20",
    aiScore: 89,
    rating: 4,
    daysInStage: 5,
    currentTitle: "Payroll Implementation Manager",
    skills: ["Multi-state payroll", "Customer onboarding", "Tax setup"],
    resumeSnippet:
      "Launched payroll for 60+ mid-market customers and owns a clean implementation checklist for state account setup.",
    reviewers: [reviewer("4"), reviewer("5")],
    reviewerIds: ["4", "5"],
    notes: [{ author: "Noah Kim", body: "Good domain fluency. Ask about failed ACH recovery.", createdAt: "2026-05-24 12:08 PM" }],
    activity: [{ label: "Phone screen completed", detail: "Moved to hiring manager screen", createdAt: "2026-05-24 12:00 PM" }],
  },
  {
    id: "cand-ana-silva",
    jobId: "job-payroll-consultant",
    firstName: "Ana",
    lastName: "Silva",
    email: "ana.silva@example.com",
    phone: "(617) 555-0105",
    location: "Boston, MA",
    source: "Indeed",
    stage: "Offer",
    appliedDate: "2026-05-09",
    aiScore: 82,
    rating: 4,
    daysInStage: 6,
    currentTitle: "Implementation Consultant",
    skills: ["Payroll migration", "Customer training", "Benefits deductions"],
    resumeSnippet:
      "Implementation consultant with strong payroll migration references and crisp customer enablement examples.",
    reviewers: [reviewer("4"), reviewer("1")],
    reviewerIds: ["4", "1"],
    notes: [{ author: "Noah Kim", body: "Offer pending comp calibration.", createdAt: "2026-05-23 3:11 PM" }],
    activity: [{ label: "Offer approval requested", detail: "Maya Patel assigned as approver", createdAt: "2026-05-23 3:10 PM" }],
  },
  {
    id: "cand-ivy-chen",
    jobId: "job-people-generalist",
    firstName: "Ivy",
    lastName: "Chen",
    email: "ivy.chen@example.com",
    phone: "(425) 555-0161",
    location: "Seattle, WA",
    source: "Referral",
    stage: "New",
    appliedDate: "2026-05-28",
    aiScore: 79,
    daysInStage: 1,
    currentTitle: "People Operations Specialist",
    skills: ["Employee relations", "Onboarding", "Policy documentation"],
    resumeSnippet:
      "People ops specialist with polished manager enablement examples and hands-on onboarding program ownership.",
    reviewers: [reviewer("6")],
    reviewerIds: ["6"],
    notes: [{ author: "Chris Wong", body: "Screen this week; good referral signal.", createdAt: "2026-05-28 4:15 PM" }],
    activity: [{ label: "Application received", detail: "Referral from Jordan Lee", createdAt: "2026-05-28 3:54 PM" }],
  },
  {
    id: "cand-tomas-reed",
    jobId: "job-product-analyst",
    firstName: "Tomas",
    lastName: "Reed",
    email: "tomas.reed@example.com",
    phone: "(718) 555-0184",
    location: "New York, NY",
    source: "Direct",
    stage: "Withdrawn",
    appliedDate: "2026-04-17",
    aiScore: 58,
    rating: 2,
    daysInStage: 9,
    currentTitle: "Data Analyst",
    skills: ["SQL", "Amplitude", "Experimentation"],
    resumeSnippet:
      "Strong analytics fundamentals but limited product leadership scope for the current seniority target.",
    reviewers: [reviewer("1")],
    reviewerIds: ["1"],
    notes: [{ author: "Maya Patel", body: "Role paused; candidate asked to be considered later.", createdAt: "2026-05-12 9:30 AM" }],
    activity: [{ label: "Candidate withdrew", detail: "Role timing no longer aligned", createdAt: "2026-05-12 9:30 AM" }],
  },
  {
    id: "cand-hana-yusuf",
    jobId: "job-people-generalist",
    firstName: "Hana",
    lastName: "Yusuf",
    email: "hana.yusuf@example.com",
    phone: "(206) 555-0177",
    location: "Tacoma, WA",
    source: "LinkedIn",
    stage: "Hired",
    appliedDate: "2026-04-29",
    aiScore: 91,
    rating: 5,
    daysInStage: 3,
    currentTitle: "Senior People Ops Generalist",
    skills: ["Employee lifecycle", "Manager coaching", "HRIS workflows"],
    resumeSnippet:
      "Accepted offer after a strong loop; onboarding case is ready for June start.",
    reviewers: [reviewer("6"), reviewer("1")],
    reviewerIds: ["6", "1"],
    notes: [{ author: "Chris Wong", body: "Accepted. Onboarding case created.", createdAt: "2026-05-24 1:00 PM" }],
    activity: [
      { label: "Candidate hired", detail: "Pre-hire created in onboarding", createdAt: "2026-05-24 1:00 PM" },
    ],
  },
];

const INITIAL_INTERVIEWS: AtsInterview[] = [
  {
    id: "int-frontend-screen",
    jobId: "job-frontend",
    candidateId: "cand-owen-park",
    scheduledAt: "2026-05-29T15:00:00.000Z",
    endsAt: "2026-05-29T15:45:00.000Z",
    status: "Scheduled",
    interviewers: ["Avery Johnson"],
    interviewerIds: ["2"],
    type: "Phone Screen",
    meeting: "Google Meet",
    feedbackStatus: "Pending",
  },
  {
    id: "int-frontend-onsite",
    jobId: "job-frontend",
    candidateId: "cand-marcus-green",
    scheduledAt: "2026-05-30T17:30:00.000Z",
    endsAt: "2026-05-30T18:30:00.000Z",
    status: "Scheduled",
    interviewers: ["Elena Ruiz", "Samira Ndiaye"],
    interviewerIds: ["3", "7"],
    type: "System Design Onsite",
    meeting: "Zoom",
    feedbackStatus: "Pending",
  },
  {
    id: "int-payroll-panel",
    jobId: "job-payroll-consultant",
    candidateId: "cand-eli-stone",
    scheduledAt: "2026-05-28T19:00:00.000Z",
    endsAt: "2026-05-28T20:00:00.000Z",
    status: "Completed",
    interviewers: ["Noah Kim", "Priya Shah"],
    interviewerIds: ["4", "5"],
    type: "Payroll Scenario Panel",
    meeting: "Google Meet",
    feedbackStatus: "Submitted",
  },
];

const INITIAL_OFFERS: AtsOffer[] = [
  {
    id: "offer-zoe",
    candidateId: "cand-zoe-miller",
    jobId: "job-frontend",
    offerDate: "2026-05-27",
    salary: 178000,
    signingBonus: 15000,
    equity: "8,000 options",
    startDate: "2026-06-24",
    status: "Pending",
    template: "Standard US Full-Time",
    openedAt: "2026-05-28 10:04 AM",
  },
  {
    id: "offer-ana",
    candidateId: "cand-ana-silva",
    jobId: "job-payroll-consultant",
    offerDate: "2026-05-23",
    salary: 119000,
    signingBonus: 5000,
    equity: "2,000 options",
    startDate: "2026-06-17",
    status: "Countered",
    template: "Standard US Full-Time",
    openedAt: "2026-05-24 2:42 PM",
  },
  {
    id: "offer-hana",
    candidateId: "cand-hana-yusuf",
    jobId: "job-people-generalist",
    offerDate: "2026-05-21",
    salary: 101000,
    signingBonus: 3000,
    equity: "1,200 options",
    startDate: "2026-06-10",
    status: "Accepted",
    template: "People Team Full-Time",
    openedAt: "2026-05-22 9:15 AM",
  },
];

const isClient = typeof window !== "undefined";
const ATS_VERSION = "v3";
const jobsKey = `circleworks_ats_jobs_${ATS_VERSION}`;
const candidatesKey = `circleworks_ats_candidates_${ATS_VERSION}`;

const withApplicantCounts = (jobs: AtsJob[], candidates = INITIAL_CANDIDATES) =>
  jobs.map((job) => ({
    ...job,
    applicantsCount: candidates.filter((candidate) => candidate.jobId === job.id).length,
  }));

const readStored = <T,>(key: string, fallback: T): T => {
  if (!isClient) return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveStored = <T,>(key: string, value: T) => {
  if (isClient) localStorage.setItem(key, JSON.stringify(value));
};

const getStoredCandidates = (): AtsCandidate[] => readStored(candidatesKey, INITIAL_CANDIDATES);
const saveCandidates = (candidates: AtsCandidate[]) => saveStored(candidatesKey, candidates);
const getStoredJobs = (): AtsJob[] => withApplicantCounts(readStored(jobsKey, INITIAL_JOBS), getStoredCandidates());
const saveJobs = (jobs: AtsJob[]) => saveStored(jobsKey, jobs);

export let mockAtsCandidates: AtsCandidate[] = getStoredCandidates();
export let mockAtsJobs: AtsJob[] = getStoredJobs();
export const mockAtsInterviews: AtsInterview[] = INITIAL_INTERVIEWS;
export const mockAtsOffers: AtsOffer[] = INITIAL_OFFERS;

export const getAtsJobs = () => getStoredJobs();
export const getAtsCandidates = () => getStoredCandidates();
export const getAtsInterviews = () => INITIAL_INTERVIEWS;
export const getAtsOffers = () => INITIAL_OFFERS;

export const getJobById = (id: string) => getStoredJobs().find((job) => job.id === id);
export const getCandidateById = (id: string) => getStoredCandidates().find((candidate) => candidate.id === id);
export const getCandidatesByJob = (jobId: string) => getStoredCandidates().filter((candidate) => candidate.jobId === jobId);
export const getInterviewsByCandidate = (candidateId: string) =>
  INITIAL_INTERVIEWS.filter((interview) => interview.candidateId === candidateId);
export const getOffersByCandidate = (candidateId: string) =>
  INITIAL_OFFERS.filter((offer) => offer.candidateId === candidateId);

export const getCandidateName = (candidate: AtsCandidate) => `${candidate.firstName} ${candidate.lastName}`;

export const getHiringTeam = (job: AtsJob) =>
  job.teamMemberIds
    .map((id) => employees.find((employee) => employee.id === id))
    .filter(Boolean)
    .map((employee) => ({
      id: employee!.id,
      name: getEmployeeName(employee!),
      title: employee!.title,
      avatar: avatarUrl(getEmployeeName(employee!)),
    }));

export const createJob = (job: Omit<AtsJob, "id" | "applicantsCount" | "daysOpen" | "postedDate">) => {
  const currentJobs = getStoredJobs();
  const newJob: AtsJob = {
    ...job,
    id: `job-${Date.now()}`,
    applicantsCount: 0,
    daysOpen: 0,
    postedDate: "2026-05-29",
  };
  const updatedJobs = [newJob, ...currentJobs];
  saveJobs(updatedJobs);
  mockAtsJobs = withApplicantCounts(updatedJobs, getStoredCandidates());
  return newJob;
};

export const deleteJob = (id: string) => {
  const updatedJobs = getStoredJobs().filter((job) => job.id !== id);
  saveJobs(updatedJobs);
  mockAtsJobs = withApplicantCounts(updatedJobs, getStoredCandidates());
};

export const updateJobStatus = (id: string, status: JobStatus) => {
  const updatedJobs = getStoredJobs().map((job) => (job.id === id ? { ...job, status } : job));
  saveJobs(updatedJobs);
  mockAtsJobs = withApplicantCounts(updatedJobs, getStoredCandidates());
};

export const addCandidate = (candidate: Omit<AtsCandidate, "id" | "appliedDate" | "daysInStage" | "aiScore" | "notes" | "activity" | "resumeSnippet" | "location" | "currentTitle" | "skills" | "reviewerIds">) => {
  const currentCandidates = getStoredCandidates();
  const newCandidate: AtsCandidate = {
    ...candidate,
    id: `cand-${Date.now()}`,
    appliedDate: "2026-05-29",
    daysInStage: 0,
    aiScore: 72,
    location: "Remote",
    currentTitle: "Candidate",
    skills: ["Resume review pending"],
    resumeSnippet: "Newly added candidate. Resume parsing is pending.",
    reviewerIds: [],
    notes: [],
    activity: [{ label: "Candidate added", detail: "Added manually by recruiting team", createdAt: "2026-05-29 3:30 PM" }],
  };
  const updatedCandidates = [newCandidate, ...currentCandidates];
  saveCandidates(updatedCandidates);
  mockAtsCandidates = updatedCandidates;
  mockAtsJobs = withApplicantCounts(getStoredJobs(), updatedCandidates);
  return newCandidate;
};

export const updateCandidateStage = (id: string, newStage: CandidateStage) => {
  const updatedCandidates = getStoredCandidates().map((candidate) =>
    candidate.id === id ? { ...candidate, stage: newStage, daysInStage: 0 } : candidate,
  );
  saveCandidates(updatedCandidates);
  mockAtsCandidates = updatedCandidates;
  mockAtsJobs = withApplicantCounts(getStoredJobs(), updatedCandidates);
  return updatedCandidates.find((candidate) => candidate.id === id);
};

export const getAtsOverview = () => {
  const jobs = getStoredJobs();
  const candidates = getStoredCandidates();
  const interviews = getAtsInterviews();
  const offers = getAtsOffers();
  const activeJobs = jobs.filter((job) => job.status === "Active");
  const offersPending = offers.filter((offer) => offer.status === "Pending" || offer.status === "Countered").length;
  return {
    activeJobs: activeJobs.length,
    totalCandidates: candidates.length,
    scheduledToday: interviews.filter((interview) => interview.scheduledAt.startsWith("2026-05-29")).length,
    offersPending,
    timeToHire: 26,
    openReqCount: activeJobs.length,
    jobs,
    candidates,
    interviews,
    offers,
    sourceBreakdown: [
      { label: "LinkedIn", value: candidates.filter((candidate) => candidate.source === "LinkedIn").length, color: "bg-blue-600" },
      { label: "Referral", value: candidates.filter((candidate) => candidate.source === "Referral").length, color: "bg-emerald-500" },
      { label: "Indeed", value: candidates.filter((candidate) => candidate.source === "Indeed").length, color: "bg-cyan-500" },
      { label: "Direct", value: candidates.filter((candidate) => candidate.source === "Direct").length, color: "bg-violet-500" },
    ],
  };
};
