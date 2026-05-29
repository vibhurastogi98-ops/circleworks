import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { mdxComponents } from "@/components/blog/MdxComponents";
import {
  autoLinkGlossaryTerms,
  createBreadcrumbJsonLd,
  getBlogProductLink,
  getBlogStateGuideLinks,
} from "@/lib/internal-links";
import { buildBlogCoverUrl } from "@/lib/blog-cover";
import {
  buildOgImageUrl,
  getAllBlogPosts,
  getBlogPost,
  getPopularPosts,
  getRelatedPosts,
  toBlogSummary,
} from "@/lib/blog";
import type { BlogPostSummary } from "@/lib/blog-types";

import BlogProgress from "./BlogProgress";
import BlogSidebar from "./BlogSidebar";
import ShareButtons from "./ShareButtons";

const siteUrl = "https://circleworks.com";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | CircleWorks",
    };
  }

  const canonical = `${siteUrl}/blog/${post.slug}`;
  const ogImage = buildOgImageUrl(post);

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
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

function RelatedCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
    >
      <div className="aspect-[3/2] overflow-hidden bg-slate-100">
        <img
          src={buildBlogCoverUrl(post)}
          alt={`${post.title} cover`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-6">
        <span className="text-xs font-black uppercase tracking-wider text-blue-600">
          {post.category}
        </span>
        <h3 className="mt-3 text-xl font-black leading-snug text-[#0A1628] group-hover:text-blue-600">
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
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const [relatedPosts, popularPosts] = await Promise.all([
    getRelatedPosts(post.slug),
    getPopularPosts(3),
  ]);
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const linkedContent = autoLinkGlossaryTerms(post.content);
  const productLink = getBlogProductLink(post);
  const stateGuideLinks = getBlogStateGuideLinks(post);
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ]);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${siteUrl}${buildOgImageUrl(post)}`,
    datePublished: post.date,
    dateModified: post.date,
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
        url: `${siteUrl}/favicon.svg`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="px-6 pb-12 pt-32 lg:px-8">
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

            <div className="mt-10 aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <img
                src={buildBlogCoverUrl(post, "wide")}
                alt={`${post.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,70%)_minmax(280px,30%)]">
            <article className="max-w-none text-lg leading-8 text-slate-700 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:bg-blue-50 [&_blockquote]:p-5 [&_blockquote]:font-semibold [&_blockquote]:text-slate-700 [&_h2]:mb-5 [&_h2]:mt-14 [&_h3]:mb-4 [&_h3]:mt-10 [&_li]:mb-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_p]:leading-8 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
              <MDXRemote
                source={linkedContent}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm, remarkToc],
                  },
                }}
              />
            </article>

            <BlogSidebar
              toc={post.toc}
              popularPosts={popularPosts.map(toBlogSummary)}
            />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-black uppercase tracking-wider text-blue-600">
              Related resources
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Link
                href={productLink.href}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition hover:border-blue-200 hover:bg-blue-100"
              >
                <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                  Product
                </span>
                <h2 className="mt-3 text-xl font-black text-slate-950">
                  {productLink.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {productLink.description}
                </p>
              </Link>
              {stateGuideLinks.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    State guide
                  </span>
                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    {guide.label}
                  </h2>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:flex md:items-start md:gap-6">
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
              {post.author.linkedin && (
                <a
                  href={post.author.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-black text-blue-600 hover:text-blue-700"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

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
                <RelatedCard
                  key={relatedPost.slug}
                  post={toBlogSummary(relatedPost)}
                />
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h2 className="text-2xl font-black text-[#0A1628]">
                Comments
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Comments are coming soon. For now, send article questions to the
                CircleWorks editorial team.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
