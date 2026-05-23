"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Download, Mail, Search } from "lucide-react";

import {
  BLOG_CATEGORIES,
  type BlogCategory,
  type BlogPost,
} from "./blogData";

function ArticleImage({ post }: { post: BlogPost }) {
  return (
    <div
      className={`relative flex h-full min-h-[220px] items-end overflow-hidden bg-gradient-to-br ${post.image}`}
      aria-label={post.imageAlt}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0)_45%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_28%)]" />
      <div className="relative z-10 p-6">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
          {post.category}
        </span>
      </div>
    </div>
  );
}

function AuthorMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${post.author.avatarGradient} text-xs font-black text-white`}
      >
        {post.author.initials}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-slate-900">{post.author.name}</div>
        <div className="truncate text-xs">
          {post.displayDate} · {post.readingTime}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="aspect-[16/10]">
        <ArticleImage post={post} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-4 w-fit rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700">
          {post.category}
        </span>
        <h3 className="line-clamp-2 text-xl font-black leading-snug text-[#0A1628] transition-colors group-hover:text-blue-600">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">
          {post.excerpt}
        </p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <AuthorMeta post={post} />
          <span className="shrink-0 text-xs font-bold text-slate-400">
            {post.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndexClient({
  posts,
  featuredPost,
}: {
  posts: BlogPost[];
  featuredPost: BlogPost;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BlogCategory>("All");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.excerpt, post.category, post.author.name]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, posts, query]);

  const gridPosts = filteredPosts.filter((post) => post.slug !== featuredPost.slug);
  const popularPosts = posts.filter((post) => post.popular).slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white px-6 pb-14 pt-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            CircleWorks Blog
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#0A1628] md:text-[56px]">
            HR & Payroll Insights for US Companies
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Practical payroll, compliance, benefits, HR, and state-guide content for teams that need clean operations.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="blog-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search payroll, compliance, benefits..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  activeCategory === category
                    ? "border-[#0A1628] bg-[#0A1628] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"
          >
            <ArticleImage post={featuredPost} />
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="mb-5 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">
                Featured · {featuredPost.category}
              </span>
              <h2 className="text-3xl font-black leading-tight text-[#0A1628] transition-colors group-hover:text-blue-600 md:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {featuredPost.excerpt}
              </p>
              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <AuthorMeta post={featuredPost} />
                <span className="inline-flex items-center gap-2 text-sm font-black text-blue-600">
                  Read featured post <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#0A1628]">
                  Latest insights
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Showing {gridPosts.length} posts
                </p>
              </div>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {gridPosts.map((post) => (
                  <motion.div
                    key={post.slug}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {gridPosts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                No articles match that search yet.
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Popular posts
                </h3>
                <div className="mt-5 space-y-5">
                  {popularPosts.map((post, index) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex gap-4"
                    >
                      <span className="text-2xl font-black text-blue-100">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold leading-6 text-slate-800 transition-colors group-hover:text-blue-600">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(event) => event.preventDefault()}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <Mail className="h-6 w-6 text-blue-600" />
                <h3 className="mt-4 text-xl font-black text-[#0A1628]">
                  Weekly HR briefing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  One practical payroll and compliance email every Tuesday.
                </p>
                <input
                  type="email"
                  required
                  placeholder="work@company.com"
                  className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </form>

              <Link
                href="/resources/state-tax-guides"
                className="block rounded-2xl bg-[#0A1628] p-6 text-white shadow-xl"
              >
                <Download className="h-7 w-7 text-cyan-300" />
                <h3 className="mt-4 text-xl font-black">
                  50-State Payroll Guide
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Download the state-by-state checklist for payroll taxes, leave, and wage rules.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
                  Get the guide <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
