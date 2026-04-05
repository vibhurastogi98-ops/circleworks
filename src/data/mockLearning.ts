
export interface Module {
  id: string;
  title: string;
  type: 'Video' | 'PDF' | 'Quiz' | 'Text';
  duration: string;
  completed?: boolean;
  contentUrl?: string;
  body?: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  duration: string;
  completionRate: number;
  isMandatory: boolean;
  department?: string;
  modules: Module[];
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  employeeName: string;
  employeeAvatar: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
}

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Security & Compliance 101",
    category: "Compliance",
    description: "Essential security practices for modern remote companies. Includes SOC2 and HIPAA overviews.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    duration: "45 mins",
    completionRate: 98,
    isMandatory: true,
    modules: [
      { id: "m1-1", title: "Introduction to Cybersecurity", type: "Video", duration: "10 mins", completed: true },
      { id: "m1-2", title: "Phishing & Social Engineering", type: "Video", duration: "15 mins", completed: true },
      { id: "m1-3", title: "Data Privacy Policy", type: "PDF", duration: "10 mins", completed: false },
      { id: "m1-4", title: "Final Compliance Quiz", type: "Quiz", duration: "10 mins", completed: false }
    ]
  },
  {
    id: "c2",
    title: "Advanced React Patterns",
    category: "Engineering",
    description: "Deep dive into server actions, partialized hydration, and performance optimization.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
    duration: "2 hours",
    completionRate: 45,
    isMandatory: false,
    department: "Engineering",
    modules: [
      { id: "m2-1", title: "State Management in 2024", type: "Video", duration: "30 mins", completed: true },
      { id: "m2-2", title: "Optimizing Web Vitals", type: "Text", duration: "45 mins", completed: false }
    ]
  },
  {
    id: "c3",
    title: "Leadership & Management",
    category: "Professional Development",
    description: "Transitioning from individual contributor to manager. Coaching and empathy skills.",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    duration: "3 hours",
    completionRate: 12,
    isMandatory: false,
    modules: [
      { id: "m3-1", title: "The 1:1 Framework", type: "Video", duration: "40 mins", completed: false }
    ]
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: "a1",
    courseId: "c1",
    courseTitle: "Security & Compliance 101",
    employeeName: "Alex Rivera",
    employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    dueDate: "2024-04-01",
    status: "In Progress",
    progress: 50
  },
  {
    id: "a2",
    courseId: "c1",
    courseTitle: "Security & Compliance 101",
    employeeName: "Sarah Chen",
    employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    dueDate: "2024-04-01",
    status: "Completed",
    progress: 100
  },
  {
    id: "a3",
    courseId: "c3",
    courseTitle: "Leadership & Management",
    employeeName: "Marcus Thorne",
    employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    dueDate: "2024-05-15",
    status: "Not Started",
    progress: 0
  }
];
