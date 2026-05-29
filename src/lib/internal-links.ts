import { glossaryTerms, type GlossaryTerm } from "@/lib/glossary";
import {
  getRelatedStateGuides,
  getStateGuideHref,
  getStateGuideSlug as getCanonicalStateGuideSlug,
  getStatePayrollGuide,
  statePayrollGuides,
  type StatePayrollGuide,
} from "@/lib/state-payroll-guides";

export const SITE_URL = "https://circleworks.com";

type BlogLinkSource = {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
};

export type InternalLink = {
  label: string;
  href: string;
  description?: string;
};

const blogProductPaths: Record<string, InternalLink> = {
  Payroll: {
    label: "CircleWorks Payroll",
    href: "/product/payroll",
    description: "Automate wages, payroll taxes, deductions, filings, and pay runs.",
  },
  Compliance: {
    label: "CircleWorks Compliance",
    href: "/product/compliance",
    description: "Keep HR, payroll, and labor-law workflows audit-ready.",
  },
  "HR Tips": {
    label: "CircleWorks HRIS",
    href: "/product/hris",
    description: "Centralize employee records, workflows, and manager approvals.",
  },
  Benefits: {
    label: "CircleWorks Benefits",
    href: "/product/benefits",
    description: "Keep enrollment, eligibility, and payroll deductions connected.",
  },
  Templates: {
    label: "CircleWorks HRIS",
    href: "/product/hris",
    description: "Turn HR templates into repeatable employee workflows.",
  },
  "State Guides": {
    label: "CircleWorks Payroll",
    href: "/product/payroll",
    description: "Run payroll with built-in support for all 50 states.",
  },
  "Case Studies": {
    label: "CircleWorks Payroll",
    href: "/product/payroll",
    description: "See how connected payroll reduces errors and manual review.",
  },
};

const glossaryResourceLinks: Record<string, InternalLink[]> = {
  Payroll: [
    { label: "The State of US Payroll 2026", href: "/blog/state-of-us-payroll-2026" },
    { label: "California payroll guide", href: "/guides/payroll-california" },
  ],
  "Payroll Tax": [
    { label: "The State of US Payroll 2026", href: "/blog/state-of-us-payroll-2026" },
    { label: "New York payroll guide", href: "/guides/payroll-new-york" },
  ],
  Compliance: [
    { label: "2026 HR compliance checklist", href: "/blog/hr-compliance-checklist-2026" },
    { label: "California payroll guide", href: "/guides/payroll-california" },
  ],
  Benefits: [
    { label: "Benefits that compete", href: "/blog/benefits-that-compete" },
    { label: "Colorado payroll guide", href: "/guides/payroll-colorado" },
  ],
  HR: [
    { label: "Employee handbook template", href: "/blog/employee-handbook-template" },
    { label: "Manager HR tips", href: "/blog/manager-hr-tips" },
  ],
  Hiring: [
    { label: "2026 HR compliance checklist", href: "/blog/hr-compliance-checklist-2026" },
    { label: "California payroll guide", href: "/guides/payroll-california" },
  ],
  Time: [
    { label: "Manager HR tips", href: "/blog/manager-hr-tips" },
    { label: "California payroll guide", href: "/guides/payroll-california" },
  ],
  Leave: [
    { label: "Employee handbook template", href: "/blog/employee-handbook-template" },
    { label: "California payroll guide", href: "/guides/payroll-california" },
  ],
  Reporting: [
    { label: "Payroll errors case study", href: "/blog/case-study-payroll-errors" },
    { label: "The State of US Payroll 2026", href: "/blog/state-of-us-payroll-2026" },
  ],
  Security: [
    { label: "2026 HR compliance checklist", href: "/blog/hr-compliance-checklist-2026" },
    { label: "Employee handbook template", href: "/blog/employee-handbook-template" },
  ],
};

const genericStateGuideSlugsByCategory: Record<string, string[]> = {
  Payroll: ["payroll-california", "payroll-new-york"],
  Compliance: ["payroll-california", "payroll-new-york"],
  "HR Tips": ["payroll-california", "payroll-texas"],
  Benefits: ["payroll-california", "payroll-colorado"],
  Templates: ["payroll-california", "payroll-new-york"],
  "State Guides": ["payroll-california", "payroll-texas"],
  "Case Studies": ["payroll-illinois", "payroll-texas"],
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stateBySlug(slug: string) {
  return getStatePayrollGuide(slug);
}

function makeStateLink(state: StatePayrollGuide): InternalLink {
  return {
    label: `${state.stateName} payroll guide`,
    href: getStateGuideHref(state),
  };
}

function replaceFirstTextOccurrence(source: string, term: GlossaryTerm) {
  const parts = source.split(/(<[^>]+>)/g);
  const matcher = new RegExp(`(^|[^A-Za-z0-9])(${escapeRegExp(term.term)})(?=$|[^A-Za-z0-9])`, "i");
  let replaced = false;
  let insideAnchor = false;

  const linked = parts.map((part) => {
    if (part.startsWith("<")) {
      if (/^<a\b/i.test(part)) insideAnchor = true;
      if (/^<\/a>/i.test(part)) insideAnchor = false;
      return part;
    }

    if (replaced || insideAnchor || !matcher.test(part)) {
      return part;
    }

    replaced = true;
    return part.replace(
      matcher,
      `$1<a href="/glossary/${term.slug}" className="font-bold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900">$2</a>`,
    );
  });

  return {
    content: linked.join(""),
    linked: replaced,
  };
}

export function getStateGuideSlug(state: Pick<StatePayrollGuide, "slug">) {
  return getCanonicalStateGuideSlug(state);
}

export function getAllStateGuideLinks() {
  return statePayrollGuides.map(makeStateLink);
}

export function getRelatedStateGuideLinks(current: Pick<StatePayrollGuide, "slug">, limit = 3) {
  const state = getStatePayrollGuide(current.slug);
  if (!state) return statePayrollGuides.slice(0, limit).map(makeStateLink);
  return getRelatedStateGuides(state, limit).map(makeStateLink);
}

export function autoLinkGlossaryTerms(source: string, maxLinks = 5) {
  const candidates = glossaryTerms
    .filter((term) => term.term.length >= 4)
    .sort((a, b) => b.term.length - a.term.length);
  let content = source;
  let linkCount = 0;

  for (const term of candidates) {
    if (linkCount >= maxLinks) break;
    const result = replaceFirstTextOccurrence(content, term);
    if (result.linked) {
      content = result.content;
      linkCount += 1;
    }
  }

  return content;
}

export function getBlogProductLink(post: BlogLinkSource) {
  return blogProductPaths[post.category] ?? blogProductPaths.Payroll;
}

export function getBlogStateGuideLinks(post: BlogLinkSource, limit = 2) {
  const searchableText = `${post.title} ${post.description} ${post.content}`;
  const mentionedStates = statePayrollGuides.filter((state) => {
    const namePattern = new RegExp(`(^|[^A-Za-z])${escapeRegExp(state.stateName)}(?=$|[^A-Za-z])`, "i");
    return namePattern.test(searchableText);
  });

  const fallbackStates = (genericStateGuideSlugsByCategory[post.category] ?? genericStateGuideSlugsByCategory.Payroll)
    .map(stateBySlug)
    .filter((state): state is StatePayrollGuide => Boolean(state));

  return [...mentionedStates, ...fallbackStates]
    .filter((state, index, items) => items.findIndex((item) => item.slug === state.slug) === index)
    .slice(0, limit)
    .map(makeStateLink);
}

export function getGlossaryResourceLinks(term: GlossaryTerm, limit = 2) {
  return (glossaryResourceLinks[term.category] ?? glossaryResourceLinks.Payroll).slice(0, limit);
}

export function createBreadcrumbJsonLd(items: InternalLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}
