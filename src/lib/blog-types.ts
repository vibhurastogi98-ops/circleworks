export const BLOG_CATEGORIES = [
  "All",
  "Payroll",
  "Compliance",
  "HR Tips",
  "Benefits",
  "Templates",
  "State Guides",
  "Case Studies",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type BlogPostCategory = Exclude<BlogCategory, "All">;

export type BlogAuthor = {
  name: string;
  role: string;
  initials: string;
  avatarGradient: string;
  bio: string;
  linkedin?: string;
};

export type BlogTocItem = {
  id: string;
  title: string;
  depth: 2 | 3;
};

export type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  displayDate: string;
  author: BlogAuthor;
  category: BlogPostCategory;
  tags: string[];
  coverImage: string;
  readingTime: string;
  featured: boolean;
  popular: boolean;
};

export type BlogPost = BlogPostSummary & {
  content: string;
  toc: BlogTocItem[];
};
