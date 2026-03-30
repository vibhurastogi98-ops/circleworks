export const generateRoleSlug = (title: string, department: string) => {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${department.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/(^-|-$)/g, '');
};

export type Role = {
  id: string;
  title: string;
  department: "Engineering" | "Product" | "Sales" | "CS" | "HR";
  location: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Contract" | "Part-time";
  description: string;
  requirements: string[];
};

export const jobs: Role[] = [
  {
    id: "eng-1",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "We are looking for a Senior Backend Engineer to help us build scalable and reliable systems that process millions of dollars in payroll every day. You will work closely with product managers and frontend engineers to ship new features and improve our core infrastructure.",
    requirements: [
      "5+ years of experience in backend development",
      "Strong proficiency in Node.js, TypeScript, and PostgreSQL",
      "Experience with distributed systems and microservices",
      "Passion for building reliable and scalable software"
    ]
  },
  {
    id: "eng-2",
    title: "Frontend Software Engineer",
    department: "Engineering",
    location: "Hybrid",
    type: "Full-time",
    description: "Join our frontend engineering team to build beautiful and intuitive user interfaces for our HR and payroll platforms.",
    requirements: [
      "3+ years of experience with React and Next.js",
      "Deep understanding of modern CSS and Tailwind",
      "Experience with state management libraries (Zustand, Redux)",
      "Strong eye for design and user experience"
    ]
  },
  {
    id: "prod-1",
    title: "Lead Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description: "Lead the product vision for our core payroll offering. You will work closely with engineering, design, and compliance teams to ensure we build the best payroll product in the market.",
    requirements: [
      "5+ years of product management experience, preferably in B2B SaaS",
      "Experience leading cross-functional teams",
      "Strong analytical and problem-solving skills",
      "Excellent communication and presentation abilities"
    ]
  },
  {
    id: "sales-1",
    title: "Account Executive (Mid-Market)",
    department: "Sales",
    location: "On-site",
    type: "Full-time",
    description: "Drive growth by acquiring new mid-market customers. You will manage the entire sales cycle from outbound prospecting to closing deals.",
    requirements: [
      "3+ years of quota-carrying B2B SaaS sales experience",
      "Track record of consistently exceeding targets",
      "Strong negotiation and presentation skills",
      "Experience selling to HR leaders is a plus"
    ]
  },
  {
    id: "cs-1",
    title: "Implementation Specialist",
    department: "CS",
    location: "Remote",
    type: "Full-time",
    description: "Help new customers successfully launch and adopt CircleWorks. You will guide them through onboarding, data migration, and initial setup.",
    requirements: [
      "2+ years of experience in customer onboarding or implementation",
      "Technical aptitude for software troubleshooting",
      "Excellent written and verbal communication skills",
      "Patience and empathy for customer challenges"
    ]
  },
  {
    id: "hr-1",
    title: "Technical Recruiter",
    department: "HR",
    location: "Hybrid",
    type: "Full-time",
    description: "Drive our talent acquisition efforts to build a world-class engineering and product team. You will source, interview, and close top candidates.",
    requirements: [
      "3+ years of full-cycle technical recruiting experience",
      "Experience sourcing passive candidates via LinkedIn and other platforms",
      "Strong understanding of modern software engineering roles and skills",
      "Ability to build relationships with hiring managers"
    ]
  }
];

export const getJobsByDepartment = () => {
  const grouped: Record<string, Role[]> = {
    Engineering: [],
    Product: [],
    Sales: [],
    CS: [],
    HR: []
  };
  
  jobs.forEach(job => {
    if (grouped[job.department]) {
      grouped[job.department].push(job);
    }
  });
  
  return grouped;
};
