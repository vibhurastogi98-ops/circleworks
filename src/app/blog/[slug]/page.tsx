import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  blogPosts,
  getBlogPost,
  getRelatedPosts,
  type BlogPost,
} from "../blogData";
import BlogProgress from "./BlogProgress";
import ShareButtons from "./ShareButtons";

const siteUrl = "https://circleworks.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | CircleWorks",
    };
  }

  const canonical = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | CircleWorks Blog`,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.png"],
    },
  };
}

function ArticleHeroImage({ post }: { post: BlogPost }) {
  return (
    <div
      className={`relative mt-12 aspect-[16/8] overflow-hidden rounded-3xl bg-gradient-to-br ${post.image}`}
      aria-label={post.imageAlt}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0)_45%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_28%)]" />
      <div className="absolute bottom-6 left-6 rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase tracking-wider text-white backdrop-blur">
        {post.category}
      </div>
    </div>
  );
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
    >
      <div className={`h-36 bg-gradient-to-br ${post.image}`} />
      <div className="p-6">
        <span className="text-xs font-black uppercase tracking-wider text-blue-600">
          {post.category}
        </span>
        <h3 className="mt-3 line-clamp-2 text-lg font-black leading-snug text-[#0A1628] group-hover:text-blue-600">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post.slug);
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${siteUrl}/og-image.png`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "CircleWorks",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: canonical,
  };

  return (
    <>
      <BlogProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="px-6 pb-16 pt-32 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to blog
            </Link>

            <div className="mt-10">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">
                {post.category}
              </span>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-[#0A1628] md:text-[56px]">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">
                {post.description}
              </p>

              <div className="mt-8 flex flex-col gap-5 border-y border-slate-200 py-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${post.author.avatarGradient} font-black text-white`}
                  >
                    {post.author.initials}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">
                      {post.author.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {post.displayDate} · {post.readingTime}
                    </div>
                  </div>
                </div>
                <ShareButtons title={post.title} url={canonical} />
              </div>
            </div>

            <ArticleHeroImage post={post} />
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[260px_minmax(0,760px)_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Table of contents
                </h2>
                <nav className="mt-5 space-y-3">
                  {post.toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block border-l-2 border-slate-200 py-1 pl-4 text-sm font-bold leading-6 text-slate-500 transition hover:border-blue-500 hover:text-blue-600"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="prose prose-slate max-w-none prose-headings:text-[#0A1628] prose-h2:mt-14 prose-h2:text-3xl prose-h2:font-black prose-p:text-lg prose-p:leading-8 prose-p:text-slate-700 prose-li:text-slate-700 prose-a:font-bold prose-a:text-blue-600">
              <MDXRemote source={post.content} />
            </article>

            <aside className="hidden xl:block">
              <div className="sticky top-28 rounded-2xl bg-slate-50 p-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Share
                </h3>
                <div className="mt-4">
                  <ShareButtons title={post.title} url={canonical} />
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex md:items-start md:gap-6">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.author.avatarGradient} text-xl font-black text-white`}
            >
              {post.author.initials}
            </div>
            <div className="mt-5 md:mt-0">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                About the author
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#0A1628]">
                {post.author.name}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {post.author.bio}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Keep reading
                </p>
                <h2 className="mt-3 text-3xl font-black text-[#0A1628]">
                  Related posts
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden items-center gap-2 text-sm font-black text-blue-600 md:inline-flex"
              >
                All posts <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <RelatedCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
