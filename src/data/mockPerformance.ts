
import {
  employees as hrisEmployees,
  getEmployeeName,
  getHeadcountEmployees,
} from "@/lib/hris-module-data";

export interface ReviewCycle {
  id: string;
  name: string;
  type: 'Annual' | 'Quarterly' | 'Probation' | 'Project';
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  period: string;
  deadline: string;
  completion: number;
  participants: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'Company' | 'Team' | 'Individual';
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  progress: number;
  dueDate: string;
  owner: string;
  parentId?: string;
  children?: Goal[];
}

export interface FeedbackRequest {
  id: string;
  person: string;
  avatar: string;
  title: string;
  type: 'received' | 'sent';
  status: 'Pending' | 'declined' | 'Submitted';
  date: string;
  isAnonymous: boolean;
}

export interface Recognition {
  id: string;
  from: string;
  fromAvatar: string;
  to: string;
  toAvatar: string;
  message: string;
  timestamp: string;
  category: string;
}

const performanceEmployees = getHeadcountEmployees();
const employeeName = (index: number) => getEmployeeName(hrisEmployees[index] || hrisEmployees[0]);
const avatarFor = (index: number) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(employeeName(index))}`;

export const mockReviewCycles: ReviewCycle[] = [
  { id: "c1", name: "Annual Performance Review 2026", type: "Annual", status: "Active", period: "Jan 1, 2026 - Dec 31, 2026", deadline: "2026-12-15", completion: 65, participants: performanceEmployees.length },
  { id: "c2", name: "Q1 Team Sync Checkpoint", type: "Quarterly", status: "Completed", period: "Jan 1, 2026 - Mar 31, 2026", deadline: "2026-03-31", completion: 100, participants: performanceEmployees.length },
  { id: "c3", name: `Probationary Review: ${employeeName(4)}`, type: "Probation", status: "Completed", period: "Apr 1, 2026 - Jun 30, 2026", deadline: "2026-06-30", completion: 100, participants: 1 }
];

export const mockGoals: Goal[] = [
  { id: "g1", title: "Increase Platform Revenue by 25%", type: "Company", status: "On Track", progress: 45, dueDate: "2024-12-31", owner: "Vibhu Rastogi" },
  { id: "g2", title: "Scale Engineering Team", type: "Team", status: "At Risk", progress: 20, dueDate: "2026-06-30", owner: employeeName(1) },
  { id: "g3", title: "Launch Benefits Module", type: "Individual", status: "On Track", progress: 85, dueDate: "2026-06-15", owner: employeeName(5) }
];

export const mockFeedbackRequests: FeedbackRequest[] = [
  {
    id: "fr1",
    person: employeeName(2),
    avatar: avatarFor(2),
    title: hrisEmployees[2].title,
    type: "received",
    status: "Pending",
    date: "2024-03-25",
    isAnonymous: false
  },
  {
    id: "fr2",
    person: employeeName(1),
    avatar: avatarFor(1),
    title: hrisEmployees[1].title,
    type: "sent",
    status: "Submitted",
    date: "2024-03-20",
    isAnonymous: true
  }
];

export const mockRecognition: Recognition[] = [
  {
    id: "rec-1",
    from: employeeName(0),
    fromAvatar: avatarFor(0),
    to: employeeName(2),
    toAvatar: avatarFor(2),
    message: "Amazing work on the new dashboard designs! The glassmorphism effects are stunning.",
    timestamp: "2 hours ago",
    category: "Design Excellence"
  },
  {
    id: "rec-2",
    from: employeeName(5),
    fromAvatar: avatarFor(5),
    to: employeeName(1),
    toAvatar: avatarFor(1),
    message: "Great leadership during the infrastructure migration last weekend. We stayed 100% up!",
    timestamp: "1 day ago",
    category: "Leadership"
  }
];
