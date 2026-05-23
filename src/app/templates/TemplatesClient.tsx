"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_TYPES,
  type TemplateResource,
} from "@/data/templates";
import TemplateDownloadButton from "./TemplateDownloadButton";

type TemplateFilter = (typeof TEMPLATE_CATEGORIES)[number];
type TypeFilter = "All" | (typeof TEMPLATE_TYPES)[number];

function TemplateIcon({ type }: { type: TemplateResource["type"] }) {
  if (type === "Excel (.xlsx)") {
    return <FileSpreadsheet className="h-7 w-7 text-emerald-600" />;
  }

  return (
    <FileText
      className={`h-7 w-7 ${type === "PDF" ? "text-red-600" : "text-blue-600"}`}
    />
  );
}

export default function TemplatesClient({
  initialTemplates,
}: {
  initialTemplates: TemplateResource[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateFilter>("All");
  const [activeType, setActiveType] = useState<TypeFilter>("All");

  const filteredTemplates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return initialTemplates.filter((template) => {
      const matchesSearch =
        !query ||
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "All" || template.category === activeCategory;
      const matchesType = activeType === "All" || template.type === activeType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [activeCategory, activeType, initialTemplates, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="border-b border-slate-800 bg-[#0A1628] px-4 pt-32 pb-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
            Templates & Downloads Library
          </p>
          <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Free HR Templates & Resources
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-slate-300">
            Search, filter, and download practical HR documents for offers,
            onboarding, policies, payroll, and compliance.
          </p>

          <label className="relative mx-auto block max-w-2xl">
            <span className="sr-only">Search templates</span>
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-14 w-full rounded-lg border border-white/10 bg-white pl-12 pr-4 text-base font-semibold text-[#0A1628] shadow-xl outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/25"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#0A1628]">
              <Filter className="h-4 w-4" />
              Categories
            </div>
            <div className="space-y-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                    activeCategory === category
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-black uppercase tracking-widest text-[#0A1628]">
              Type
            </div>
            <div className="space-y-1">
              {(["All", ...TEMPLATE_TYPES] as TypeFilter[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                    activeType === type
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]"
                  }`}
                >
                  {type === "All" ? "All types" : type}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#0A1628]">
                Template library
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Showing {filteredTemplates.length} of {initialTemplates.length}{" "}
                templates
              </p>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h3 className="mb-2 text-xl font-black text-[#0A1628]">
                No templates found
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Try another keyword, category, or file type.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="flex min-h-[300px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <TemplateIcon type={template.type} />
                    </div>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-black leading-tight text-[#0A1628]">
                    <Link
                      href={`/templates/${template.slug}`}
                      className="transition hover:text-blue-700"
                    >
                      {template.title}
                    </Link>
                  </h3>

                  <p className="mb-6 flex-1 text-sm font-medium leading-relaxed text-slate-500">
                    {template.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {template.type}
                    </span>
                    <TemplateDownloadButton
                      template={template}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />
                      Download Free
                    </TemplateDownloadButton>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
