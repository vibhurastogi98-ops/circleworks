"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/lib/glossary";

type GlossaryIndexClientProps = {
  terms: GlossaryTerm[];
};

const alphabet = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function GlossaryIndexClient({ terms }: GlossaryIndexClientProps) {
  const [query, setQuery] = useState("");

  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return terms;

    return terms.filter((term) => {
      const searchable = `${term.term} ${term.category} ${term.shortDefinition}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query, terms]);

  const groupedTerms = useMemo(() => {
    return filteredTerms.reduce<Record<string, GlossaryTerm[]>>((groups, term) => {
      const firstLetter = /^[a-z]/i.test(term.term) ? term.term.charAt(0).toUpperCase() : "#";
      groups[firstLetter] = groups[firstLetter] ?? [];
      groups[firstLetter].push(term);
      return groups;
    }, {});
  }, [filteredTerms]);

  const availableLetters = alphabet.filter((letter) =>
    terms.some((term) => {
      const firstLetter = /^[a-z]/i.test(term.term) ? term.term.charAt(0).toUpperCase() : "#";
      return firstLetter === letter;
    }),
  );

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={22}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search payroll, compliance, benefits, tax..."
              className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {availableLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {letter}
              </a>
            ))}
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Showing {filteredTerms.length} of {terms.length} glossary terms
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          {Object.keys(groupedTerms).length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-black text-slate-900">No glossary terms found</h2>
              <p className="mt-3 text-slate-600">Try a broader payroll, HR, tax, or benefits search.</p>
            </div>
          )}

          {availableLetters.map((letter) => {
            const letterTerms = groupedTerms[letter];
            if (!letterTerms?.length) return null;

            return (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="text-4xl font-black text-slate-900">{letter}</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {letterTerms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="text-lg font-black text-slate-950 group-hover:text-blue-700">
                        {term.term}
                      </div>
                      <div className="mt-2 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-black uppercase text-cyan-700">
                        {term.category}
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {term.shortDefinition}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
