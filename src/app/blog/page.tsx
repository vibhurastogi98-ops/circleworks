import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  getAllBlogPosts,
  getFeaturedPost,
  toBlogSummary,
} from "@/lib/blog";

import BlogIndexClient from "./BlogIndexClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "HR & Payroll Insights for US Companies | CircleWorks Blog",
  description:
    "SEO-first HR, payroll, compliance, benefits, templates, state guides, and case study insights for US companies.",
  alternates: {
    canonical: "https://circleworks.com/blog",
  },
  openGraph: {
    title: "HR & Payroll Insights for US Companies | CircleWorks Blog",
    description:
      "Practical HR and payroll insights for US companies managing compliance, benefits, templates, and state rules.",
    url: "https://circleworks.com/blog",
    type: "website",
    images: [
      {
        url: "/api/og?title=HR%20%26%20Payroll%20Insights%20for%20US%20Companies&category=CircleWorks%20Blog",
        width: 1200,
        height: 630,
        alt: "CircleWorks HR and Payroll Insights",
      },
    ],
  },
};

type BlogPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params?.page || 1) || 1);
  const [posts, featuredPost] = await Promise.all([
    getAllBlogPosts(),
    getFeaturedPost(),
  ]);

  return (
    <>
      <Navbar />
      <BlogIndexClient
        posts={posts.map(toBlogSummary)}
        featuredPost={toBlogSummary(featuredPost)}
        initialPage={currentPage}
      />
      <Footer />
    </>
  );
}
