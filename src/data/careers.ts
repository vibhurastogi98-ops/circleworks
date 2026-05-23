export const generateRoleSlug = (title: string, department: string) => {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${department.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/(^-|-$)/g, '');
};

export type Role = {
  id: string;
  slug: string;
  title: string;
  department: "Engineering" | "Product" | "Sales" | "CS" | "HR";
  location: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Contract" | "Part-time";
  description: string;
  impact: string;
  requirements: string[];
};

export const jobs: Role[] = [
  {
    id: "eng-1",
    slug: "senior-full-stack-engineer-engineering",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build the product systems that help American companies run payroll, HR, time, benefits, and compliance in one dependable platform.",
    impact: "You will own core workflow surfaces from database model to customer-facing UI, with a special focus on reliability, permissions, and payroll-grade accuracy.",
    requirements: [
      "5+ years building production web applications",
      "Strong TypeScript, React, Node.js, and PostgreSQL experience",
      "Comfort shipping across frontend, backend, and data boundaries",
      "Bias for simple systems, clean interfaces, and measurable customer impact",
    ],
  },
  {
    id: "eng-2",
    title: "Senior Backend Engineer",
    slug: "senior-backend-engineer-engineering",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "We are looking for a Senior Backend Engineer to help us build scalable and reliable systems that process millions of dollars in payroll every day. You will work closely with product managers and frontend engineers to ship new features and improve our core infrastructure.",
    impact: "You will improve the services behind payroll runs, tax calculations, worker classification, audit logs, and reporting exports.",
    requirements: [
      "5+ years of experience in backend development",
      "Strong proficiency in Node.js, TypeScript, and PostgreSQL",
      "Experience with distributed systems and microservices",
      "Passion for building reliable and scalable software"
    ]
  },
  {
    id: "prod-1",
    slug: "product-manager-payroll-product",
    title: "Product Manager, Payroll",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description: "Lead the product vision for our core payroll offering. You will work closely with engineering, design, and compliance teams to ensure we build the best payroll product in the market.",
    impact: "You will turn complex payroll, tax, and employee workflows into crisp product requirements that help small teams move with confidence.",
    requirements: [
      "5+ years of product management experience, preferably in B2B SaaS",
      "Experience leading cross-functional teams",
      "Strong analytical and problem-solving skills",
      "Excellent communication and presentation abilities"
    ]
  },
  {
    id: "sales-1",
    slug: "enterprise-account-executive-sales",
    title: "Enterprise Account Executive",
    department: "Sales",
    location: "Hybrid",
    type: "Full-time",
    description: "Drive growth by acquiring new mid-market customers. You will manage the entire sales cycle from outbound prospecting to closing deals.",
    impact: "You will help founders, finance leaders, and HR teams evaluate CircleWorks as their system of record for payroll and people operations.",
    requirements: [
      "3+ years of quota-carrying B2B SaaS sales experience",
      "Track record of consistently exceeding targets",
      "Strong negotiation and presentation skills",
      "Experience selling to HR leaders is a plus"
    ]
  },
  {
    id: "cs-1",
    slug: "customer-success-manager-cs",
    title: "Customer Success Manager",
    department: "CS",
    location: "Remote",
    type: "Full-time",
    description: "Help new customers successfully launch and adopt CircleWorks. You will guide them through onboarding, data migration, and initial setup.",
    impact: "You will build repeatable playbooks that help customers get payroll-ready faster and spot compliance risks before they become urgent.",
    requirements: [
      "2+ years of experience in customer onboarding or implementation",
      "Technical aptitude for software troubleshooting",
      "Excellent written and verbal communication skills",
      "Patience and empathy for customer challenges"
    ]
  },
  {
    id: "hr-1",
    slug: "people-operations-partner-hr",
    title: "People Operations Partner",
    department: "HR",
    location: "Remote",
    type: "Full-time",
    description: "Design the employee programs and internal people systems that make CircleWorks a thoughtful, high-trust place to do ambitious work.",
    impact: "You will partner with leaders on performance cycles, onboarding, compensation operations, and culture rituals for a distributed team.",
    requirements: [
      "4+ years of HR, people operations, or business partner experience",
      "Experience supporting remote-first or hybrid teams",
      "Strong judgment around employee relations and manager enablement",
      "Comfort building lightweight programs that scale without bureaucracy",
    ],
  },
  {
    id: "hr-2",
    slug: "technical-recruiter-hr",
    title: "Technical Recruiter",
    department: "HR",
    location: "Hybrid",
    type: "Full-time",
    description: "Drive our talent acquisition efforts to build a world-class engineering and product team. You will source, interview, and close top candidates.",
    impact: "You will shape a candidate experience that is clear, respectful, and fast while helping hiring teams calibrate on excellent talent.",
    requirements: [
      "3+ years of full-cycle technical recruiting experience",
      "Experience sourcing passive candidates via LinkedIn and other platforms",
      "Strong understanding of modern software engineering roles and skills",
      "Ability to build relationships with hiring managers"
    ]
  }
];

export const getJobsByDepartment = () => {
  const grouped: Record<Role["department"], Role[]> = {
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

export const getJobBySlug = (slug: string) => jobs.find((job) => job.slug === slug);
