import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCircleWorksFeature,
  getDefinitionParagraphs,
  getGlossaryFaqs,
  getGlossaryTerm,
  getRelatedGlossaryTerms,
  glossaryTerms,
} from "@/lib/glossary";
import { createBreadcrumbJsonLd, getGlossaryResourceLinks } from "@/lib/internal-links";

const baseUrl = "https://circleworks.com";

export const revalidate = 2592000;

export function generateStaticParams() {
  return glossaryTerms.map((term) => ({ term: term.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: slug } = await params;
  const glossaryTerm = getGlossaryTerm(slug);

  if (!glossaryTerm) {
    return {
      title: "Glossary Term",
      description: "CircleWorks HR and payroll glossary term.",
    };
  }

  const title = `${glossaryTerm.term} Definition & Explanation`;
  const description = `${glossaryTerm.shortDef} Learn what ${glossaryTerm.term} means for US HR, payroll, benefits, and compliance teams.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/glossary/${glossaryTerm.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/glossary/${glossaryTerm.slug}`,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);

  if (!term) {
    notFound();
  }

  const paragraphs = getDefinitionParagraphs(term);
  const relatedTerms = getRelatedGlossaryTerms(term, 6);
  const featureText = getCircleWorksFeature(term);
  const faqs = getGlossaryFaqs(term);
  const resourceLinks = getGlossaryResourceLinks(term);
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: "Home", href: "/" },
    { label: "Glossary", href: "/glossary" },
    { label: term.term, href: `/glossary/${term.slug}` },
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.shortDef,
    url: `${baseUrl}/glossary/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "CircleWorks HR & Payroll Glossary",
      url: `${baseUrl}/glossary`,
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-slate-950">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section
        className="px-6 pb-16 pt-32 lg:pb-20 lg:pt-40"
        style={{ backgroundColor: "#071426" }}
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/glossary"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to glossary
          </Link>

          <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase text-cyan-200">
            {term.category}
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            What is {term.term}?
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-300">
            {term.shortDef}
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="max-w-3xl">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                Quick definition
              </p>
              <p className="mt-3 text-xl font-bold leading-8 text-slate-950">
                {term.shortDef}
              </p>
            </div>

            <h2 className="mt-12 text-3xl font-black text-slate-950">
              {term.term} definition and explanation
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-8 text-slate-700">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <section className="mt-12">
              <h2 className="text-3xl font-black text-slate-950">
                Example
              </h2>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-lg leading-8 text-slate-700">
                {term.example}
              </div>
            </section>

            <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-blue-600" size={24} />
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    How CircleWorks handles {term.term}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    {featureText} CircleWorks automatically calculates, tracks,
                    files, or documents {term.term} wherever it touches payroll
                    and HR workflows.
                  </p>
                  <Link
                    href={term.productPath}
                    className="mt-5 inline-flex items-center gap-2 text-base font-black text-blue-700 transition hover:text-blue-900"
                  >
                    Learn more
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-3xl font-black text-slate-950">
                {term.term} FAQ
              </h2>
              <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {faqs.map((faq) => (
                  <div key={faq.question} className="p-6">
                    <h3 className="text-lg font-black text-slate-950">
                      {faq.question}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-black text-slate-950">Related terms</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedTerms.map((related) => (
                <Link
                  key={related.slug}
                  href={`/glossary/${related.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {related.term}
                </Link>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-black text-slate-950">Further reading</h2>
              <div className="mt-4 space-y-3">
                {resourceLinks.map((resource) => (
                  <Link
                    key={resource.href}
                    href={resource.href}
                    className="block rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {resource.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
