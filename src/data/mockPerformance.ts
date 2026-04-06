
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


export const mockReviewCycles: ReviewCycle[] = [
  { id: "c1", name: "Annual Performance Review 2024", type: "Annual", status: "Active", period: "Jan 1, 2024 - Dec 31, 2024", deadline: "2024-12-15", completion: 65, participants: 142 },
  { id: "c2", name: "Q1 Team Sync Checkpiont", type: "Quarterly", status: "Completed", period: "Jan 1, 2024 - Mar 31, 2024", deadline: "2024-03-31", completion: 100, participants: 128 },
  { id: "c3", name: "Probationary Review: Sarah Chen", type: "Probation", status: "Completed", period: "Feb 1, 2024 - Apr 30, 2024", deadline: "2024-04-30", completion: 100, participants: 1 }
];

export const mockGoals: Goal[] = [
  { id: "g1", title: "Increase Platform Revenue by 25%", type: "Company", status: "On Track", progress: 45, dueDate: "2024-12-31", owner: "Vibhu Rastogi" },
  { id: "g2", title: "Scale Engineering Team", type: "Team", status: "At Risk", progress: 20, dueDate: "2024-06-30", owner: "Marcus Thorne" },
  { id: "g3", title: "Launch Benefits Module", type: "Individual", status: "On Track", progress: 85, dueDate: "2024-04-15", owner: "Sarah Chen" }
];

export const mockFeedbackRequests: FeedbackRequest[] = [
  {
    id: "fr1",
    person: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    title: "Senior Product Designer",
    type: "received",
    status: "Pending",
    date: "2024-03-25",
    isAnonymous: false
  },
  {
    id: "fr2",
    person: "Marcus Thorne",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    title: "Engineering Manager",
    type: "sent",
    status: "Submitted",
    date: "2024-03-20",
    isAnonymous: true
  }
];

export const mockRecognition: Recognition[] = [
  {
    id: "rec-1",
    from: "Alex Rivera",
    fromAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    to: "Sarah Chen",
    toAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    message: "Amazing work on the new dashboard designs! The glassmorphism effects are stunning.",
    timestamp: "2 hours ago",
    category: "Design Excellence"
  },
  {
    id: "rec-2",
    from: "Vibhu Rastogi",
    fromAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vibhu",
    to: "Marcus Thorne",
    toAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    message: "Great leadership during the infrastructure migration last weekend. We stayed 100% up!",
    timestamp: "1 day ago",
    category: "Leadership"
  }
];
