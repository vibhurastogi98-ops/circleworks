import Link from "next/link";
import type { ReactNode } from "react";

import { slugifyHeading } from "@/lib/blog";

type ComponentProps = {
  children?: ReactNode;
  className?: string;
};

function getText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getText).join("");
  }

  if (children && typeof children === "object" && "props" in children) {
    return getText((children as { props?: { children?: ReactNode } }).props?.children);
  }

  return "";
}

function Heading({
  level,
  children,
}: ComponentProps & {
  level: 2 | 3;
}) {
  const id = slugifyHeading(getText(children));
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <Tag
      id={id}
      className={
        level === 2
          ? "scroll-mt-28 text-3xl font-black tracking-tight text-[#0A1628]"
          : "scroll-mt-28 text-2xl font-black tracking-tight text-[#0A1628]"
      }
    >
      {children}
    </Tag>
  );
}

function Code({ className, children }: ComponentProps) {
  const language = className?.replace("language-", "") || "text";

  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-blue-700">
      {language !== "text" ? null : children}
      {language !== "text" ? children : null}
    </span>
  );
}

function Pre({ children }: ComponentProps) {
  return (
    <pre className="my-8 overflow-x-auto rounded-2xl border border-slate-800 bg-[#0A1628] p-5 text-sm leading-7 text-cyan-100 shadow-inner">
      {children}
    </pre>
  );
}

function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "tip";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    tip: "border-emerald-200 bg-emerald-50 text-emerald-950",
  }[type];

  return (
    <aside className={`my-8 rounded-2xl border border-l-4 p-5 ${styles}`}>
      {title && <p className="mb-2 text-sm font-black uppercase tracking-wide">{title}</p>}
      <div className="text-sm font-semibold leading-7">{children}</div>
    </aside>
  );
}

function YouTube({ id, title }: { id: string; title: string }) {
  return (
    <div className="my-8 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Tweet({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="my-8 block rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
    >
      View referenced post on X/Twitter
    </a>
  );
}

function CircleWorksCTA({
  title = "Run payroll and HR from one connected system",
  description = "See how CircleWorks helps US companies simplify payroll, compliance, benefits, and employee operations.",
  href = "/signup",
  cta = "Start free",
}: {
  title?: string;
  description?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="my-10 rounded-3xl bg-[#0A1628] p-7 text-white shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
        CircleWorks
      </p>
      <h3 className="mt-3 text-2xl font-black">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
        {description}
      </p>
      <Link
        href={href}
        className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-500"
      >
        {cta}
      </Link>
    </div>
  );
}

export const mdxComponents = {
  h2: (props: ComponentProps) => <Heading level={2} {...props} />,
  h3: (props: ComponentProps) => <Heading level={3} {...props} />,
  pre: Pre,
  code: Code,
  a: ({ href = "", children }: ComponentProps & { href?: string }) => {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="font-bold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
      >
        {children}
      </a>
    );
  },
  Callout,
  YouTube,
  Tweet,
  CircleWorksCTA,
};
