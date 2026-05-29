"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Search } from "lucide-react";

import {
  BLOG_CATEGORIES,
  type BlogCategory,
  type BlogPostSummary,
} from "@/lib/blog-types";
import { buildBlogCoverUrl, type BlogCoverVariant } from "@/lib/blog-cover";

const POSTS_PER_PAGE = 12;

function AuthorMeta({ post }: { post: BlogPostSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm text-slate-500">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.author.avatarGradient} text-xs font-black text-white`}
      >
        {post.author.initials}
      </div>
      <div className="min-w-0">
        <div className="truncate font-bold text-slate-900">{post.author.name}</div>
        <div className="truncate text-xs">
          {post.displayDate} · {post.readingTime}
        </div>
      </div>
    </div>
  );
}

function CoverImage({
  post,
  ratio = "aspect-[3/2]",
  variant = "card",
}: {
  post: BlogPostSummary;
  ratio?: string;
  variant?: BlogCoverVariant;
}) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${ratio}`}>
      <img
        src={buildBlogCoverUrl(post, variant)}
        alt={`${post.title} cover`}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}

function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
    >
      <CoverImage post={post} />
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-4 w-fit rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700">
          {post.category}
        </span>
        <h3 className="text-xl font-black leading-snug text-[#0A1628] transition-colors group-hover:text-blue-600">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">
          {post.excerpt}
        </p>
        <div className="mt-6">
          <AuthorMeta post={post} />
        </div>
      </div>
    </Link>
  );
}

function FeaturedPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl lg:grid-cols-[1.05fr_0.95fr]"
    >
      <CoverImage post={post} ratio="aspect-video lg:aspect-auto" variant="wide" />
      <div className="flex flex-col justify-center p-8 md:p-10">
        <span className="mb-5 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">
          Featured · {post.category}
        </span>
        <h2 className="text-[28px] font-black leading-tight text-[#0A1628] transition-colors group-hover:text-blue-600">
          {post.title}
        </h2>
        <p className="mt-5 line-clamp-2 text-lg leading-8 text-slate-600">
          {post.excerpt}
        </p>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <AuthorMeta post={post} />
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {post.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function BlogIndexClient({
  posts,
  featuredPost,
  initialPage,
}: {
  posts: BlogPostSummary[];
  featuredPost: BlogPostSummary;
  initialPage: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BlogCategory>("All");
  const [page, setPage] = useState(initialPage);
  const [subscribed, setSubscribed] = useState(false);
  const didMount = useRef(false);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.excerpt, post.category, post.author.name, ...post.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, posts, query]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    setPage(1);
    router.replace("/blog", { scroll: false });
  }, [activeCategory, query, router]);

  const featuredVisible = filteredPosts.some(
    (post) => post.slug === featuredPost.slug,
  );
  const gridPosts = filteredPosts.filter((post) => post.slug !== featuredPost.slug);
  const totalPages = Math.max(1, Math.ceil(gridPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagePosts = gridPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  );

  const goToPage = (nextPage: number) => {
    const normalizedPage = Math.min(Math.max(1, nextPage), totalPages);
    setPage(normalizedPage);
    router.push(normalizedPage === 1 ? "/blog" : `/blog?page=${normalizedPage}`, {
      scroll: false,
    });
  };

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
            Practical payroll, compliance, benefits, HR, templates, case studies,
            and state-guide content for teams that need clean operations.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or tag..."
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

      {featuredVisible && (
        <section className="px-6 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FeaturedPostCard post={featuredPost} />
          </div>
        </section>
      )}

      <section className="bg-slate-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#0A1628]">
                Latest insights
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Showing {pagePosts.length} of {gridPosts.length} posts
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubscribed(true);
              }}
              className="flex w-full gap-2 md:w-auto"
            >
              <label htmlFor="blog-newsletter" className="sr-only">
                Newsletter email
              </label>
              <input
                id="blog-newsletter"
                type="email"
                required
                placeholder="work@company.com"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 md:w-64"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Subscribe
              </button>
            </form>
          </div>
          {subscribed && (
            <p className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-black text-green-700">
              You&apos;re on the list.
            </p>
          )}

          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {pagePosts.map((post) => (
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

          {pagePosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              No articles match that search yet.
            </div>
          )}

          {gridPosts.length > POSTS_PER_PAGE && (
            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
              aria-label="Blog pagination"
            >
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Prev
              </button>
              {getPageNumbers(safePage, totalPages).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  className={`h-10 min-w-10 rounded-full px-3 text-sm font-black transition ${
                    safePage === pageNumber
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
