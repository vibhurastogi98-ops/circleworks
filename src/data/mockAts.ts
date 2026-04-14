export type JobStatus = 'Draft' | 'Active' | 'Paused' | 'Closed';
export type CandidateStage = 'New' | 'Screening' | 'Take-Home' | 'Onsite' | 'Offer' | 'Hired' | 'Withdrawn';

export interface AtsJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: JobStatus;
  applicantsCount: number;
  daysOpen: number;
  postedDate: string;
  salaryMin: number;
  salaryMax: number;
}

export interface AtsCandidate {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  source: string;
  stage: CandidateStage;
  appliedDate: string;
  aiScore: number;
  rating?: number;
  daysInStage: number;
  reviewers: string[];
}

export interface AtsInterview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  interviewers: string[];
  type: string;
}

export const STAGES: { id: CandidateStage; title: string; color: string }[] = [
  { id: 'New', title: 'New Applicants', color: 'bg-blue-500' },
  { id: 'Screening', title: 'Phone Screen', color: 'bg-purple-500' },
  { id: 'Take-Home', title: 'Take-Home Test', color: 'bg-orange-500' },
  { id: 'Onsite', title: 'Onsite Interview', color: 'bg-indigo-500' },
  { id: 'Offer', title: 'Offer Stage', color: 'bg-green-500' },
  { id: 'Hired', title: 'Hired', color: 'bg-emerald-600' },
  { id: 'Withdrawn', title: 'Withdrawn / Rejected', color: 'bg-red-500' },
];

// --- INITIAL DATA ---
const INITIAL_JOBS: AtsJob[] = [
  { id: 'job-1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'San Francisco, CA', type: 'Full-Time', status: 'Active', applicantsCount: 42, daysOpen: 14, postedDate: '2024-09-01', salaryMin: 140000, salaryMax: 180000 },
  { id: 'job-2', title: 'Product Manager', department: 'Product', location: 'Remote', type: 'Full-Time', status: 'Active', applicantsCount: 128, daysOpen: 30, postedDate: '2024-08-15', salaryMin: 120000, salaryMax: 150000 },
  { id: 'job-3', title: 'Marketing Coordinator', department: 'Marketing', location: 'New York, NY', type: 'Part-Time', status: 'Paused', applicantsCount: 15, daysOpen: 45, postedDate: '2024-08-01', salaryMin: 60000, salaryMax: 80000 },
];

const INITIAL_CANDIDATES: AtsCandidate[] = [
  { id: 'cand-1', jobId: 'job-1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@example.com', source: 'LinkedIn', stage: 'New', appliedDate: '2024-09-10', aiScore: 92, daysInStage: 2, reviewers: ['https://i.pravatar.cc/150?u=1'] },
  { id: 'cand-2', jobId: 'job-1', firstName: 'John', lastName: 'Doe', email: 'j.doe@example.com', source: 'Indeed', stage: 'Screening', appliedDate: '2024-09-05', aiScore: 75, rating: 4, daysInStage: 4, reviewers: ['https://i.pravatar.cc/150?u=2'] },
  { id: 'cand-3', jobId: 'job-1', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', source: 'Referral', stage: 'Onsite', appliedDate: '2024-09-02', aiScore: 88, rating: 5, daysInStage: 1, reviewers: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=3'] },
  { id: 'cand-4', jobId: 'job-1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', source: 'Direct', stage: 'Take-Home', appliedDate: '2024-09-04', aiScore: 65, daysInStage: 6, reviewers: [] },
  { id: 'cand-5', jobId: 'job-1', firstName: 'Bob', lastName: 'Williams', email: 'bob.w@example.com', source: 'LinkedIn', stage: 'Offer', appliedDate: '2024-08-20', aiScore: 95, rating: 5, daysInStage: 2, reviewers: ['https://i.pravatar.cc/150?u=1'] },
  { id: 'cand-6', jobId: 'job-2', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', source: 'LinkedIn', stage: 'New', appliedDate: '2024-09-12', aiScore: 55, daysInStage: 1, reviewers: [] },
];

// --- STORAGE HELPERS ---
const isClient = typeof window !== 'undefined';

const getStoredJobs = (): AtsJob[] => {
  if (!isClient) return INITIAL_JOBS;
  const stored = localStorage.getItem('circleworks_ats_jobs');
  return stored ? JSON.parse(stored) : INITIAL_JOBS;
};

const saveJobs = (jobs: AtsJob[]) => {
  if (isClient) localStorage.setItem('circleworks_ats_jobs', JSON.stringify(jobs));
};

// --- DATA ACCESS ---
export let mockAtsJobs: AtsJob[] = getStoredJobs();
export const mockAtsCandidates: AtsCandidate[] = INITIAL_CANDIDATES;

export const mockAtsInterviews: AtsInterview[] = [
  { id: 'int-1', candidateId: 'cand-3', scheduledAt: '2024-09-15T14:00:00Z', status: 'Scheduled', interviewers: ['Alex Manager'], type: 'Technical Onsite' },
  { id: 'int-2', candidateId: 'cand-2', scheduledAt: '2024-09-10T10:00:00Z', status: 'Completed', interviewers: ['HR Screen'], type: 'Phone Screen' },
];

export const getJobById = (id: string) => getStoredJobs().find(j => j.id === id);
export const getCandidatesByJob = (jobId: string) => mockAtsCandidates.filter(c => c.jobId === jobId);

export const createJob = (job: Omit<AtsJob, 'id' | 'applicantsCount' | 'daysOpen' | 'postedDate'>) => {
  const currentJobs = getStoredJobs();
  const newJob: AtsJob = {
    ...job,
    id: `job-${Date.now()}`, // use unique ID
    applicantsCount: 0,
    daysOpen: 0,
    postedDate: new Date().toISOString().split('T')[0],
  };
  const updatedJobs = [newJob, ...currentJobs];
  saveJobs(updatedJobs);
  mockAtsJobs = updatedJobs; // sync exported variable
  return newJob;
};

export const deleteJob = (id: string) => {
  const currentJobs = getStoredJobs();
  const updatedJobs = currentJobs.filter(j => j.id !== id);
  saveJobs(updatedJobs);
  mockAtsJobs = updatedJobs; // sync exported variable
};

export const updateJobStatus = (id: string, status: JobStatus) => {
  const currentJobs = getStoredJobs();
  const updatedJobs = currentJobs.map(j => j.id === id ? { ...j, status } : j);
  saveJobs(updatedJobs);
  mockAtsJobs = updatedJobs; // sync exported variable
};
