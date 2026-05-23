import type { ComponentPropsWithoutRef, ReactNode } from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

import LegalDownloadButton from "@/components/legal/LegalDownloadButton";

interface LegalPageLayoutProps {
  contentFile: "terms.mdx" | "privacy.mdx" | "cookies.mdx";
  eyebrow: string;
  title: string;
  description: string;
  sidebarTitle?: string;
  children?: ReactNode;
}

interface TocItem {
  id: string;
  text: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const extractTOC = (content: string): TocItem[] =>
  Array.from(content.matchAll(/^##\s+(.+)$/gm)).map((match) => {
    const text = match[1].trim();
    return { text, id: slugify(text) };
  });

const extractLastUpdated = (content: string) => {
  const match = content.match(/\*\*Last updated\*\*:\s*(.+)/);
  return match?.[1]?.trim() ?? "April 5, 2026";
};

const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mb-6 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => {
    const text = props.children?.toString() ?? "";
    return (
      <h2
        id={slugify(text)}
        className="scroll-mt-28 pt-8 text-2xl font-black tracking-[-0.02em] text-slate-950"
        {...props}
      />
    );
  },
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 text-lg font-black text-slate-900" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-4 text-base leading-8 text-slate-600" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="font-bold text-blue-600 underline-offset-4 hover:underline" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-slate-600" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-8 text-slate-600" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-black text-slate-950" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-left" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-slate-100 px-5 py-4 text-sm font-medium leading-6 text-slate-700" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-800" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="my-10 border-slate-200" {...props} />,
};

export default function LegalPageLayout({
  contentFile,
  eyebrow,
  title,
  description,
  sidebarTitle = "Contents",
  children,
}: LegalPageLayoutProps) {
  const contentPath = path.join(process.cwd(), "src/content", contentFile);
  const content = fs.readFileSync(contentPath, "utf-8");
  const toc = extractTOC(content);
  const lastUpdated = extractLastUpdated(content);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 print:bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0A1628] text-sm font-black text-blue-600">
              C
            </span>
            <span className="font-black tracking-tight text-slate-950">CircleWorks Legal</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 transition hover:text-blue-600">
            Back to homepage
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[260px_minmax(0,768px)] lg:justify-center lg:py-16">
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{sidebarTitle}</p>
            <nav className="mt-5 space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-xl px-3 py-2 text-sm font-bold leading-5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.text}
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <LegalDownloadButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Last updated: {lastUpdated}</span>
              <div className="w-full sm:w-auto print:hidden">
                <LegalDownloadButton />
              </div>
            </div>
            {children}
          </div>

          <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
            <MDXRemote source={content} components={mdxComponents} />
          </article>
        </main>
      </div>
    </div>
  );
}
