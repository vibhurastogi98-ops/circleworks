"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import type { BlogPostSummary, BlogTocItem } from "@/lib/blog-types";

export default function BlogSidebar({
  toc,
  popularPosts,
}: {
  toc: BlogTocItem[];
  popularPosts: BlogPostSummary[];
}) {
  const [activeId, setActiveId] = useState(toc[0]?.id || "");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-120px 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Table of Contents
          </h2>
          <nav className="mt-4 space-y-1">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block border-l-2 py-2 text-sm font-bold leading-5 transition ${
                  item.depth === 3 ? "pl-6" : "pl-4"
                } ${
                  activeId === item.id
                    ? "border-blue-600 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </section>

        <form
          onSubmit={subscribe}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5"
        >
          <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-[#0A1628]">
            Weekly HR briefing
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Payroll, compliance, and HR operations tips. No fluff.
          </p>
          <input
            type="email"
            required
            placeholder="work@company.com"
            className="mt-4 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="mt-3 h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Subscribe
          </button>
          <p aria-live="polite" className="mt-3 text-sm font-bold text-blue-700">
            {subscribed ? "You're on the list." : ""}
          </p>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Popular Posts
          </h2>
          <div className="mt-4 space-y-4">
            {popularPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="line-clamp-2 text-sm font-black leading-5 text-[#0A1628] group-hover:text-blue-700">
                  {post.title}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-blue-600">
                  Read <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
