import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import BlogIndexClient from "./BlogIndexClient";
import { blogPosts, getFeaturedPost } from "./blogData";

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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks HR and Payroll Insights",
      },
    ],
  },
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <BlogIndexClient posts={blogPosts} featuredPost={getFeaturedPost()} />
      <Footer />
    </>
  );
}
