import { MetadataRoute } from "next";
import { glossaryTerms } from "@/lib/glossary";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://circleworks.vercel.app";
  const routes = [
    "",
    "/pricing",
    "/about",
    "/contact",
    "/blog",
    "/demo",
    "/product/payroll",
    "/product/hris",
    "/product/ats",
    "/product/benefits",
    "/product/onboarding",
    "/product/time",
    "/product/expenses",
    "/product/performance",
    "/product/compliance",
    "/product/analytics",
    "/integrations",
    "/security",
    "/trust",
    "/careers",
    "/glossary",
  ];

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const glossaryRoutes = glossaryTerms.map((term) => ({
    url: `${baseUrl}/glossary/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...glossaryRoutes];
}
