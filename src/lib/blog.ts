import { cache } from "react";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import {
  type BlogAuthor,
  type BlogPost,
  type BlogPostCategory,
  type BlogPostSummary,
  type BlogTocItem,
} from "@/lib/blog-types";

const blogDirectory = path.join(process.cwd(), "content", "blog");

const authors: Record<string, BlogAuthor> = {
  "Sarah Thompson": {
    name: "Sarah Thompson",
    role: "Payroll Strategy Lead",
    initials: "ST",
    avatarGradient: "from-blue-600 to-cyan-500",
    bio: "Sarah leads payroll strategy at CircleWorks and writes about multi-state payroll, tax operations, and connected payroll systems for growing US companies.",
    linkedin: "https://www.linkedin.com/company/circleworks",
  },
  "Marcus Reed": {
    name: "Marcus Reed",
    role: "Compliance Counsel",
    initials: "MR",
    avatarGradient: "from-emerald-600 to-teal-500",
    bio: "Marcus turns federal, state, and local HR compliance topics into practical operating playbooks for HR, finance, and people teams.",
    linkedin: "https://www.linkedin.com/company/circleworks",
  },
  "Elena Cruz": {
    name: "Elena Cruz",
    role: "People Operations Advisor",
    initials: "EC",
    avatarGradient: "from-indigo-600 to-blue-500",
    bio: "Elena advises growing companies on onboarding, benefits, performance, and employee experience programs that stay simple as teams scale.",
    linkedin: "https://www.linkedin.com/company/circleworks",
  },
  "Priya Shah": {
    name: "Priya Shah",
    role: "Customer Operations Lead",
    initials: "PS",
    avatarGradient: "from-fuchsia-600 to-rose-500",
    bio: "Priya studies how payroll and HR teams modernize operations, reduce manual work, and improve employee trust with connected systems.",
    linkedin: "https://www.linkedin.com/company/circleworks",
  },
};

const categorySet = new Set<BlogPostCategory>([
  "Payroll",
  "Compliance",
  "HR Tips",
  "Benefits",
  "Templates",
  "State Guides",
  "Case Studies",
]);

type BlogFrontmatter = {
  title?: string;
  description?: string;
  date?: string;
  author?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  readingTime?: string;
  featured?: boolean;
  popular?: boolean;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function fallbackAuthor(name: string): BlogAuthor {
  return {
    name,
    role: "CircleWorks Editorial Team",
    initials: getInitials(name),
    avatarGradient: "from-blue-600 to-indigo-600",
    bio: "The CircleWorks editorial team writes practical guides for payroll, HR, compliance, benefits, and people operations teams.",
    linkedin: "https://www.linkedin.com/company/circleworks",
  };
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripMdx(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_#>~]/g, "")
    .trim();
}

function getToc(content: string): BlogTocItem[] {
  const headings = content.matchAll(/^(##|###)\s+(.+)$/gm);
  const toc: BlogTocItem[] = [];

  for (const heading of headings) {
    const title = stripMdx(heading[2] || "");
    if (!title || title.toLowerCase() === "contents") continue;

    toc.push({
      id: slugifyHeading(title),
      title,
      depth: heading[1] === "##" ? 2 : 3,
    });
  }

  return toc;
}

function getReadingTime(content: string) {
  const words = stripMdx(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 210))} min read`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

function getExcerpt(description: string, content: string) {
  if (description) return description;
  return stripMdx(content).split(/\s+/).slice(0, 32).join(" ");
}

function getCoverImage(frontmatter: BlogFrontmatter) {
  if (frontmatter.coverImage) return frontmatter.coverImage;
  return `/api/og?title=${encodeURIComponent(frontmatter.title || "CircleWorks Blog")}`;
}

async function parsePost(filename: string): Promise<BlogPost> {
  const filePath = path.join(blogDirectory, filename);
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as BlogFrontmatter;
  const slug = filename.replace(/\.mdx$/, "");
  const title = String(frontmatter.title || slug);
  const description = String(frontmatter.description || "");
  const authorName = String(frontmatter.author || "CircleWorks Editorial Team");
  const category = String(frontmatter.category || "Payroll");
  const date = String(frontmatter.date || new Date().toISOString().slice(0, 10));

  if (!categorySet.has(category as BlogPostCategory)) {
    throw new Error(`Invalid blog category "${category}" in ${filename}`);
  }

  return {
    slug,
    title,
    description,
    excerpt: getExcerpt(description, content),
    date,
    displayDate: formatDate(date),
    author: authors[authorName] ?? fallbackAuthor(authorName),
    category: category as BlogPostCategory,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
    coverImage: getCoverImage(frontmatter),
    readingTime: frontmatter.readingTime || getReadingTime(content),
    featured: Boolean(frontmatter.featured),
    popular: Boolean(frontmatter.popular),
    content,
    toc: getToc(content),
  };
}

export const getAllBlogPosts = cache(async () => {
  const files = (await readdir(blogDirectory)).filter((file) =>
    file.endsWith(".mdx"),
  );
  const posts = await Promise.all(files.map(parsePost));

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
});

export async function getBlogPost(slug: string) {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getFeaturedPost() {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.featured) ?? posts[0];
}

export async function getPopularPosts(limit = 3) {
  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.popular).slice(0, limit);
}

export async function getRelatedPosts(slug: string, limit = 3) {
  const posts = await getAllBlogPosts();
  const current = posts.find((post) => post.slug === slug);

  if (!current) return posts.slice(0, limit);

  const scored = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const tagMatches = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const categoryMatch = post.category === current.category ? 3 : 0;
      return { post, score: categoryMatch + tagMatches };
    })
    .sort((a, b) => b.score - a.score || Number(new Date(b.post.date)) - Number(new Date(a.post.date)));

  return scored.slice(0, limit).map((item) => item.post);
}

export function toBlogSummary(post: BlogPost): BlogPostSummary {
  const { content: _content, toc: _toc, ...summary } = post;
  return summary;
}

export function buildOgImageUrl(post: Pick<BlogPostSummary, "title" | "category">) {
  const params = new URLSearchParams({
    title: post.title,
    category: post.category,
  });

  return `/api/og?${params.toString()}`;
}
