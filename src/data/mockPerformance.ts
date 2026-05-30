import {
  employees as hrisEmployees,
  getEmployeeName,
  getHeadcountEmployees,
} from "@/lib/hris-module-data";

export type ReviewCycleType = "Annual" | "Mid-year" | "Quarterly" | "Probationary";
export type ReviewCycleStatus = "Draft" | "Active" | "Completed";
export type ReviewStepStatus = "Not Started" | "In Progress" | "Submitted" | "Complete";
export type OverallReviewStatus = "Not Started" | "Needs Attention" | "On Track" | "Complete";
export type OkrLevel = "Company" | "Department" | "Individual";
export type OkrStatus = "On Track" | "At Risk" | "Behind" | "Completed";
export type FeedbackType = "Praise" | "Constructive" | "Thanks";

export interface ParticipationDatum {
  label: string;
  completed: number;
  total: number;
}

export interface ReviewCycle {
  id: string;
  name: string;
  type: ReviewCycleType;
  status: ReviewCycleStatus;
  period: string;
  startDate: string;
  endDate: string;
  selfReviewDueDate: string;
  managerReviewDueDate: string;
  peerSelectionDeadline: string;
  participants: number;
  completed: number;
  completion: number;
  participation: ParticipationDatum[];
}

export interface ReviewParticipant {
  id: string;
  employeeId: string;
  employee: string;
  title: string;
  department: string;
  manager: string;
  avatar: string;
  selfReviewStatus: ReviewStepStatus;
  managerReviewStatus: ReviewStepStatus;
  peerReviewsCompleted: number;
  peerReviewsRequested: number;
  overallStatus: OverallReviewStatus;
  rating?: number;
  lastUpdated: string;
}

export interface ReviewQuestion {
  id: string;
  prompt: string;
  type: "textarea" | "rating" | "choice";
  minLength?: number;
}

export interface ReviewTask {
  id: string;
  title: string;
  detail: string;
  dueDate: string;
  href: string;
}

export interface KeyResult {
  id: string;
  title: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
}

export interface Okr {
  id: string;
  objective: string;
  level: OkrLevel;
  owner: string;
  dueDate: string;
  status: OkrStatus;
  parentId?: string;
  keyResults: KeyResult[];
  children?: Okr[];
}

export interface FeedbackEntry {
  id: string;
  sender: string;
  recipient: string;
  type: FeedbackType;
  message: string;
  date: string;
  anonymous?: boolean;
}

export interface Recognition {
  id: string;
  from: string;
  to: string;
  message: string;
  date: string;
  reactions: Record<string, number>;
}

const performanceEmployees = getHeadcountEmployees();
const employeeAt = (index: number) => performanceEmployees[index % performanceEmployees.length];
const employeeName = (index: number) => getEmployeeName(employeeAt(index));
const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`;

export const performanceKpis = [
  {
    label: "Review Cycle Status",
    value: "34/142",
    detail: "Q2 reviews completed",
    tone: "blue",
  },
  {
    label: "OKR Progress",
    value: "62%",
    detail: "Company average",
    tone: "emerald",
  },
  {
    label: "Feedback Sent",
    value: "286",
    detail: "This quarter",
    tone: "purple",
  },
  {
    label: "Recognition Badges",
    value: "91",
    detail: "Sent this quarter",
    tone: "amber",
  },
] as const;

export const mockReviewCycles: ReviewCycle[] = [
  {
    id: "q2-2026",
    name: "Q2 2026 Performance Reviews",
    type: "Quarterly",
    status: "Active",
    period: "Apr 1, 2026 - Jun 30, 2026",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    selfReviewDueDate: "2026-06-07",
    managerReviewDueDate: "2026-06-14",
    peerSelectionDeadline: "2026-06-03",
    participants: 142,
    completed: 34,
    completion: 24,
    participation: [
      { label: "Engineering", completed: 13, total: 42 },
      { label: "Sales", completed: 8, total: 31 },
      { label: "Customer Success", completed: 7, total: 24 },
      { label: "People", completed: 4, total: 13 },
      { label: "Finance", completed: 2, total: 11 },
    ],
  },
  {
    id: "annual-2025",
    name: "Annual Performance Review 2025",
    type: "Annual",
    status: "Completed",
    period: "Jan 1, 2025 - Dec 31, 2025",
    startDate: "2025-12-01",
    endDate: "2026-01-15",
    selfReviewDueDate: "2025-12-18",
    managerReviewDueDate: "2026-01-07",
    peerSelectionDeadline: "2025-12-10",
    participants: 128,
    completed: 128,
    completion: 100,
    participation: [
      { label: "Engineering", completed: 39, total: 39 },
      { label: "Sales", completed: 28, total: 28 },
      { label: "Customer Success", completed: 22, total: 22 },
    ],
  },
  {
    id: "mid-year-2026",
    name: "Mid-year Growth Check 2026",
    type: "Mid-year",
    status: "Draft",
    period: "Jul 1, 2026 - Jul 31, 2026",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    selfReviewDueDate: "2026-07-10",
    managerReviewDueDate: "2026-07-20",
    peerSelectionDeadline: "2026-07-05",
    participants: 146,
    completed: 0,
    completion: 0,
    participation: [],
  },
  {
    id: "probation-maya",
    name: `Probationary Review: ${employeeName(6)}`,
    type: "Probationary",
    status: "Active",
    period: "May 1, 2026 - Jun 15, 2026",
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    selfReviewDueDate: "2026-06-05",
    managerReviewDueDate: "2026-06-12",
    peerSelectionDeadline: "2026-05-31",
    participants: 1,
    completed: 0,
    completion: 35,
    participation: [{ label: "Product", completed: 0, total: 1 }],
  },
];

const participantStatuses: Array<
  Pick<
    ReviewParticipant,
    | "selfReviewStatus"
    | "managerReviewStatus"
    | "peerReviewsCompleted"
    | "peerReviewsRequested"
    | "overallStatus"
    | "rating"
    | "lastUpdated"
  >
> = [
  {
    selfReviewStatus: "Complete",
    managerReviewStatus: "Complete",
    peerReviewsCompleted: 3,
    peerReviewsRequested: 3,
    overallStatus: "Complete",
    rating: 4.6,
    lastUpdated: "Today",
  },
  {
    selfReviewStatus: "Submitted",
    managerReviewStatus: "In Progress",
    peerReviewsCompleted: 2,
    peerReviewsRequested: 3,
    overallStatus: "On Track",
    rating: 4.1,
    lastUpdated: "Yesterday",
  },
  {
    selfReviewStatus: "In Progress",
    managerReviewStatus: "Not Started",
    peerReviewsCompleted: 1,
    peerReviewsRequested: 3,
    overallStatus: "Needs Attention",
    lastUpdated: "2 days ago",
  },
  {
    selfReviewStatus: "Not Started",
    managerReviewStatus: "Not Started",
    peerReviewsCompleted: 0,
    peerReviewsRequested: 2,
    overallStatus: "Not Started",
    lastUpdated: "Never",
  },
  {
    selfReviewStatus: "Submitted",
    managerReviewStatus: "Submitted",
    peerReviewsCompleted: 3,
    peerReviewsRequested: 3,
    overallStatus: "On Track",
    rating: 3.9,
    lastUpdated: "Today",
  },
  {
    selfReviewStatus: "In Progress",
    managerReviewStatus: "In Progress",
    peerReviewsCompleted: 2,
    peerReviewsRequested: 4,
    overallStatus: "On Track",
    lastUpdated: "3 days ago",
  },
];

export const reviewParticipants: ReviewParticipant[] = participantStatuses.map((status, index) => {
  const employee = employeeAt(index + 1);
  const name = getEmployeeName(employee);

  return {
    id: `participant-${employee.id}`,
    employeeId: employee.id,
    employee: name,
    title: employee.title,
    department: employee.department,
    manager: employee.manager,
    avatar: avatarFor(name),
    ...status,
  };
});

export const selfReviewQuestions: ReviewQuestion[] = [
  {
    id: "impact",
    prompt: "What outcomes are you most proud of this cycle, and what measurable impact did they create?",
    type: "textarea",
    minLength: 100,
  },
  {
    id: "growth",
    prompt: "Where did you grow the most, and where do you want more support next quarter?",
    type: "textarea",
    minLength: 100,
  },
  {
    id: "rating",
    prompt: "How would you rate your overall performance this cycle?",
    type: "rating",
  },
];

export const managerReviewQuestions: ReviewQuestion[] = [
  {
    id: "manager-impact",
    prompt: "Summarize this employee's business impact with specific examples.",
    type: "textarea",
    minLength: 100,
  },
  {
    id: "manager-growth",
    prompt: "What coaching, scope changes, or growth opportunities should happen next?",
    type: "textarea",
    minLength: 100,
  },
  {
    id: "manager-rating",
    prompt: "Overall manager rating",
    type: "choice",
  },
];

export const peerReviewQuestions: ReviewQuestion[] = [
  {
    id: "peer-strengths",
    prompt: "What should this teammate continue doing?",
    type: "textarea",
    minLength: 80,
  },
  {
    id: "peer-growth",
    prompt: "What is one useful growth suggestion?",
    type: "textarea",
    minLength: 80,
  },
  {
    id: "peer-collaboration",
    prompt: "Rate collaboration quality",
    type: "rating",
  },
];

export const reviewTasks: ReviewTask[] = [
  {
    id: "self",
    title: "Complete your self-review",
    detail: "Q2 2026 Performance Reviews",
    dueDate: "2026-06-07",
    href: "/performance/reviews/q2-2026/2",
  },
  {
    id: "reports",
    title: "Review 6 direct reports",
    detail: "Manager reviews open",
    dueDate: "2026-06-14",
    href: "/performance/reviews/q2-2026",
  },
  {
    id: "ack",
    title: "Acknowledge review from manager",
    detail: "Annual 2025 review summary",
    dueDate: "2026-06-18",
    href: "/performance/reviews/annual-2025/3",
  },
];

export const okrTree: Okr[] = [
  {
    id: "okr-company-growth",
    objective: "Build the most trusted payroll and HR platform for modern teams",
    level: "Company",
    owner: "Maya Patel",
    dueDate: "2026-06-30",
    status: "On Track",
    keyResults: [
      { id: "kr-arr", title: "Increase net revenue retention", metric: "NRR", target: 118, current: 111, unit: "%" },
      { id: "kr-launch", title: "Launch two enterprise-ready modules", metric: "Modules launched", target: 2, current: 1, unit: "" },
      { id: "kr-nps", title: "Maintain customer NPS", metric: "NPS", target: 62, current: 58, unit: "" },
    ],
    children: [
      {
        id: "okr-eng-reliability",
        objective: "Make payroll workflows faster and more reliable",
        level: "Department",
        owner: "Avery Johnson",
        dueDate: "2026-06-30",
        status: "On Track",
        parentId: "okr-company-growth",
        keyResults: [
          { id: "kr-close", title: "Reduce payroll close time", metric: "Minutes", target: 18, current: 24, unit: "min" },
          { id: "kr-uptime", title: "Maintain payroll API uptime", metric: "Uptime", target: 99.95, current: 99.98, unit: "%" },
        ],
        children: [
          {
            id: "okr-individual-query",
            objective: "Ship cached payroll run previews",
            level: "Individual",
            owner: employeeName(3),
            dueDate: "2026-06-21",
            status: "At Risk",
            parentId: "okr-eng-reliability",
            keyResults: [
              { id: "kr-preview", title: "Cut preview render time", metric: "Seconds", target: 2, current: 4, unit: "s" },
              { id: "kr-errors", title: "Reduce preview API errors", metric: "Error rate", target: 0.4, current: 0.9, unit: "%" },
            ],
          },
        ],
      },
      {
        id: "okr-people-enablement",
        objective: "Increase manager effectiveness during growth cycles",
        level: "Department",
        owner: "Maya Patel",
        dueDate: "2026-06-30",
        status: "On Track",
        parentId: "okr-company-growth",
        keyResults: [
          { id: "kr-manager-training", title: "Complete manager enablement track", metric: "Managers certified", target: 38, current: 29, unit: "" },
          { id: "kr-reviews", title: "Finish Q2 reviews on time", metric: "Reviews submitted", target: 142, current: 34, unit: "" },
        ],
      },
    ],
  },
];

export const feedbackTimeline: FeedbackEntry[] = [
  {
    id: "fb-1",
    sender: employeeName(1),
    recipient: "Vibhu Rastogi",
    type: "Praise",
    message: "You brought calm structure to a messy payroll migration and helped the team make faster decisions.",
    date: "2026-05-28",
  },
  {
    id: "fb-2",
    sender: "Anonymous",
    recipient: "Vibhu Rastogi",
    type: "Constructive",
    message: "The launch plan was strong. Earlier visibility into tradeoffs would help cross-functional teams prepare.",
    date: "2026-05-18",
    anonymous: true,
  },
  {
    id: "fb-3",
    sender: employeeName(4),
    recipient: "Vibhu Rastogi",
    type: "Thanks",
    message: "Thanks for reviewing the onboarding analytics draft and making the metrics easier to explain.",
    date: "2026-05-09",
  },
];

export const recognitionWall: Recognition[] = [
  {
    id: "rec-1",
    from: employeeName(0),
    to: employeeName(2),
    message: "Handled the Q2 compensation calibration prep with precision and a lot of empathy.",
    date: "2026-05-29",
    reactions: { "👏": 18, "💙": 9, "🚀": 4 },
  },
  {
    id: "rec-2",
    from: employeeName(5),
    to: employeeName(1),
    message: "Kept the engineering review packet moving while still making space for thoughtful manager coaching.",
    date: "2026-05-24",
    reactions: { "👏": 14, "🔥": 7, "🙌": 6 },
  },
];

export function getOkrProgress(okr: Okr) {
  if (!okr.keyResults.length) return 0;
  const total = okr.keyResults.reduce((sum, keyResult) => {
    if (keyResult.target === 0) return sum;
    return sum + Math.min(100, Math.round((keyResult.current / keyResult.target) * 100));
  }, 0);
  return Math.round(total / okr.keyResults.length);
}

export function flattenOkrs(okrs: Okr[]): Okr[] {
  return okrs.flatMap((okr) => [okr, ...flattenOkrs(okr.children || [])]);
}

export function getReviewCycle(cycleId: string) {
  return mockReviewCycles.find((cycle) => cycle.id === cycleId) || mockReviewCycles[0];
}

export function getReviewParticipant(employeeId: string) {
  return (
    reviewParticipants.find((participant) => participant.employeeId === employeeId) ||
    reviewParticipants[0]
  );
}
