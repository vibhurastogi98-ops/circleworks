export type CourseCategory = "Compliance" | "Leadership" | "Technical" | "Onboarding" | "Custom";
export type CourseModuleType = "Video" | "Slides" | "Text" | "Quiz";
export type AssignmentStatus = "Assigned" | "In Progress" | "Completed";

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface CourseModule {
  id: string;
  title: string;
  type: CourseModuleType;
  duration: string;
  completed?: boolean;
  embedUrl?: string;
  body?: string;
  quiz?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  description: string;
  duration: string;
  enrolledCount: number;
  completionRate: number;
  thumbnail: string;
  isMandatory: boolean;
  modules: CourseModule[];
}

export interface LearningAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  employeeName: string;
  employeeAvatar: string;
  dueDate: string;
  status: AssignmentStatus;
  progress: number;
  certificateId?: string;
}

export const courseCategories: Array<"All" | CourseCategory> = [
  "All",
  "Compliance",
  "Leadership",
  "Technical",
  "Onboarding",
  "Custom",
];

export const mockCourses: Course[] = [
  {
    id: "security-compliance-101",
    title: "Security and Compliance 101",
    category: "Compliance",
    description: "SOC 2, data privacy, phishing prevention, and secure remote-work habits for every employee.",
    duration: "45 min",
    enrolledCount: 142,
    completionRate: 88,
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    isMandatory: true,
    modules: [
      {
        id: "security-video",
        title: "Recognizing phishing and social engineering",
        type: "Video",
        duration: "12 min",
        completed: true,
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "security-slides",
        title: "SOC 2 control overview",
        type: "Slides",
        duration: "8 min",
        completed: true,
        embedUrl: "https://docs.google.com/presentation/d/e/2PACX-1vQ8be5vB2qf7q/sample/embed?start=false&loop=false&delayms=3000",
      },
      {
        id: "security-policy",
        title: "Data handling standards",
        type: "Text",
        duration: "10 min",
        completed: false,
        body:
          "CircleWorks employees classify customer payroll data as confidential by default. Store sensitive exports only in approved systems, use least-privilege access, and report suspected exposure within one business hour. When in doubt, pause the workflow and ask Security for review.",
      },
      {
        id: "security-quiz",
        title: "Final compliance quiz",
        type: "Quiz",
        duration: "15 min",
        completed: false,
        quiz: [
          {
            id: "q1",
            prompt: "What should you do first when you suspect a phishing email?",
            choices: ["Forward it to a teammate", "Report it through the security workflow", "Reply and ask for context", "Download the attachment"],
            answer: "Report it through the security workflow",
            explanation: "Reporting through the approved workflow preserves headers and lets Security respond quickly.",
          },
          {
            id: "q2",
            prompt: "Which data should be treated as confidential in CircleWorks?",
            choices: ["Only compensation data", "Only customer names", "Payroll, tax, identity, and benefits data", "Only signed documents"],
            answer: "Payroll, tax, identity, and benefits data",
            explanation: "Payroll systems combine multiple high-risk data classes, so access and sharing must stay tightly controlled.",
          },
          {
            id: "q3",
            prompt: "What is the passing threshold for this course?",
            choices: ["60%", "70%", "80%", "100%"],
            answer: "80%",
            explanation: "Compliance courses require at least 80% to generate a completion certificate.",
          },
        ],
      },
    ],
  },
  {
    id: "manager-coaching",
    title: "Manager Coaching Essentials",
    category: "Leadership",
    description: "Run high-signal one-on-ones, give clear feedback, and prepare fair review calibrations.",
    duration: "2 hr",
    enrolledCount: 38,
    completionRate: 63,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    isMandatory: false,
    modules: [
      {
        id: "coaching-text",
        title: "The 1:1 operating system",
        type: "Text",
        duration: "20 min",
        completed: true,
        body:
          "Great one-on-ones are not status meetings. Use them to identify blockers, clarify decisions, and create space for career context. End with one concrete commitment from the manager and one from the employee.",
      },
      {
        id: "coaching-video",
        title: "Delivering constructive feedback",
        type: "Video",
        duration: "25 min",
        completed: false,
        embedUrl: "https://player.vimeo.com/video/76979871",
      },
      {
        id: "coaching-quiz",
        title: "Manager readiness quiz",
        type: "Quiz",
        duration: "10 min",
        completed: false,
        quiz: [
          {
            id: "q1",
            prompt: "Which feedback format is most useful in a performance review?",
            choices: ["A vague impression", "A personality label", "A behavior, impact, and next step", "A compensation hint"],
            answer: "A behavior, impact, and next step",
            explanation: "Specific behavior and impact help the employee understand what to repeat or change.",
          },
          {
            id: "q2",
            prompt: "When should compensation recommendations be discussed?",
            choices: ["In every peer review", "Only in the manager/HR calibration flow", "In public praise", "Before self-reviews"],
            answer: "Only in the manager/HR calibration flow",
            explanation: "Compensation guidance should stay in the restricted manager and HR workflow.",
          },
        ],
      },
    ],
  },
  {
    id: "nextjs-platform-patterns",
    title: "Next.js Platform Patterns",
    category: "Technical",
    description: "Server components, cache boundaries, route handlers, and performance instrumentation for product teams.",
    duration: "90 min",
    enrolledCount: 57,
    completionRate: 41,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
    isMandatory: false,
    modules: [
      {
        id: "rsc-text",
        title: "Server component boundaries",
        type: "Text",
        duration: "18 min",
        completed: true,
        body:
          "Prefer server components for data-heavy screens, then isolate client components around interaction. Keep serialized props small, and avoid pushing whole datasets into a client component when the UI only needs totals.",
      },
      {
        id: "cache-slides",
        title: "Cache tags and invalidation",
        type: "Slides",
        duration: "20 min",
        completed: false,
        embedUrl: "https://docs.google.com/presentation/d/e/2PACX-1vQ8be5vB2qf7q/sample/embed?start=false&loop=false&delayms=3000",
      },
    ],
  },
  {
    id: "new-hire-onboarding",
    title: "CircleWorks New Hire Onboarding",
    category: "Onboarding",
    description: "Company context, security basics, tool access, benefits overview, and first-week expectations.",
    duration: "65 min",
    enrolledCount: 26,
    completionRate: 77,
    thumbnail: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&q=80&w=800",
    isMandatory: true,
    modules: [
      {
        id: "welcome-video",
        title: "Welcome to CircleWorks",
        type: "Video",
        duration: "9 min",
        completed: true,
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "tools-text",
        title: "Your first-week checklist",
        type: "Text",
        duration: "16 min",
        completed: false,
        body:
          "Complete payroll setup, validate identity documents, join your team channels, review the handbook, and schedule your first manager one-on-one before Friday.",
      },
    ],
  },
  {
    id: "custom-sales-playbook",
    title: "Enterprise Payroll Discovery Playbook",
    category: "Custom",
    description: "A custom enablement course for discovery calls with complex multi-state payroll buyers.",
    duration: "55 min",
    enrolledCount: 19,
    completionRate: 52,
    thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800",
    isMandatory: false,
    modules: [
      {
        id: "sales-slides",
        title: "Discovery narrative",
        type: "Slides",
        duration: "20 min",
        completed: false,
        embedUrl: "https://docs.google.com/presentation/d/e/2PACX-1vQ8be5vB2qf7q/sample/embed?start=false&loop=false&delayms=3000",
      },
      {
        id: "sales-quiz",
        title: "Qualification quiz",
        type: "Quiz",
        duration: "10 min",
        completed: false,
        quiz: [
          {
            id: "q1",
            prompt: "Which buyer signal suggests payroll complexity?",
            choices: ["One local office", "No contractors", "Employees in 12 states", "No benefits"],
            answer: "Employees in 12 states",
            explanation: "Multi-state payroll usually creates tax, registration, and compliance complexity.",
          },
        ],
      },
    ],
  },
];

export const mockAssignments: LearningAssignment[] = [
  {
    id: "assignment-security",
    courseId: "security-compliance-101",
    courseTitle: "Security and Compliance 101",
    employeeName: "Vibhu Rastogi",
    employeeAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Vibhu&backgroundColor=transparent",
    dueDate: "2026-06-07",
    status: "In Progress",
    progress: 58,
  },
  {
    id: "assignment-onboarding",
    courseId: "new-hire-onboarding",
    courseTitle: "CircleWorks New Hire Onboarding",
    employeeName: "Avery Johnson",
    employeeAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Avery&backgroundColor=transparent",
    dueDate: "2026-06-03",
    status: "Assigned",
    progress: 0,
  },
  {
    id: "assignment-coaching",
    courseId: "manager-coaching",
    courseTitle: "Manager Coaching Essentials",
    employeeName: "Maya Patel",
    employeeAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Maya&backgroundColor=transparent",
    dueDate: "2026-06-21",
    status: "In Progress",
    progress: 36,
  },
  {
    id: "assignment-platform",
    courseId: "nextjs-platform-patterns",
    courseTitle: "Next.js Platform Patterns",
    employeeName: "Noah Williams",
    employeeAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=transparent",
    dueDate: "2026-05-20",
    status: "Completed",
    progress: 100,
    certificateId: "CW-CERT-2026-0184",
  },
];

export function getCourse(courseId: string) {
  return mockCourses.find((course) => course.id === courseId) || mockCourses[0];
}

export function getCourseProgress(course: Course) {
  if (!course.modules.length) return 0;
  return Math.round((course.modules.filter((module) => module.completed).length / course.modules.length) * 100);
}
