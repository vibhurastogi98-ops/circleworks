
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
  {
    id: "cycle-1",
    name: "2024 Q1 Performance Review",
    type: "Quarterly",
    status: "Active",
    period: "Jan 1 - Mar 31, 2024",
    deadline: "2024-04-15",
    completion: 65,
    participants: 120
  },
  {
    id: "cycle-2",
    name: "Annual 2023 Calibration",
    type: "Annual",
    status: "Completed",
    period: "Jan 1 - Dec 31, 2023",
    deadline: "2024-01-20",
    completion: 100,
    participants: 115
  },
  {
    id: "cycle-3",
    name: "Engineering Lead Probation",
    type: "Probation",
    status: "Active",
    period: "Feb 1 - May 1, 2024",
    deadline: "2024-05-10",
    completion: 20,
    participants: 2
  }
];

export const mockGoals: Goal[] = [
  {
    id: "g1",
    title: "Scale CircleWorks to $10M ARR",
    type: "Company",
    status: "On Track",
    progress: 45,
    dueDate: "2024-12-31",
    owner: "Vibhu Rastogi",
    children: [
      {
        id: "g1-1",
        title: "Launch Enterprise Tier",
        type: "Team",
        status: "At Risk",
        progress: 30,
        dueDate: "2024-06-30",
        owner: "Product Team",
        parentId: "g1",
        children: [
          {
            id: "g1-1-1",
            title: "OAuth2 & SSO Implementation",
            type: "Individual",
            status: "On Track",
            progress: 80,
            dueDate: "2024-05-15",
            owner: "Alex Rivera",
            parentId: "g1-1"
          }
        ]
      },
      {
        id: "g1-2",
        title: "Reduce Churn to < 2%",
        type: "Team",
        status: "On Track",
        progress: 60,
        dueDate: "2024-12-31",
        owner: "Customer Success",
        parentId: "g1"
      }
    ]
  }
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
