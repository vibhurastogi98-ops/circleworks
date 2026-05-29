import type { BlogPostSummary } from "@/lib/blog-types";

export type BlogCoverVariant = "card" | "wide";

export function buildBlogCoverUrl(
  post: Pick<BlogPostSummary, "title" | "category">,
  variant: BlogCoverVariant = "card",
) {
  const params = new URLSearchParams({
    title: post.title,
    category: post.category,
    variant,
  });

  return `/api/blog-cover?${params.toString()}`;
}
