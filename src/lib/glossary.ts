import glossaryData from "../../data/glossary.json";

export const glossaryCategories = [
  "Payroll",
  "Payroll Tax",
  "Compliance",
  "Benefits",
  "HR",
  "Hiring",
  "Time",
  "Leave",
  "Reporting",
  "Security",
] as const;

export type GlossaryCategory = (typeof glossaryCategories)[number];

export type GlossaryFaq = {
  question: string;
  answer: string;
};

type GlossaryDataTerm = {
  term: string;
  slug: string;
  letter: string;
  category: GlossaryCategory;
  shortDef: string;
  fullDef: string[];
  example: string;
  relatedSlugs: string[];
  cwFeature: string;
  productPath: string;
};

export type GlossaryTerm = GlossaryDataTerm & {
  shortDefinition: string;
};

export function slugifyGlossaryTerm(term: string) {
  return term
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const glossaryTerms: GlossaryTerm[] = (glossaryData as GlossaryDataTerm[])
  .map((term) => ({
    ...term,
    shortDefinition: term.shortDef,
  }))
  .sort((a, b) => a.term.localeCompare(b.term, "en", { numeric: true }));

export const glossaryTermCount = glossaryTerms.length;

export function getGlossaryTerm(slug: string) {
  return glossaryTerms.find((term) => term.slug === slug);
}

export function getRelatedGlossaryTerms(term: GlossaryTerm, limit = 6) {
  const relatedFromMetadata = term.relatedSlugs
    .map((slug) => getGlossaryTerm(slug))
    .filter((candidate): candidate is GlossaryTerm => Boolean(candidate));
  const sameCategory = glossaryTerms.filter(
    (candidate) =>
      candidate.category === term.category &&
      candidate.slug !== term.slug &&
      !term.relatedSlugs.includes(candidate.slug),
  );
  const fallback = glossaryTerms.filter(
    (candidate) =>
      candidate.category !== term.category &&
      candidate.slug !== term.slug &&
      !term.relatedSlugs.includes(candidate.slug),
  );

  return [...relatedFromMetadata, ...sameCategory, ...fallback].slice(0, limit);
}

export function getCircleWorksFeature(term: GlossaryTerm) {
  return term.cwFeature;
}

export function getDefinitionParagraphs(term: GlossaryTerm) {
  return term.fullDef;
}

export function getGlossaryFaqs(term: GlossaryTerm): GlossaryFaq[] {
  return [
    {
      question: `What is ${term.term} in HR and payroll?`,
      answer: term.shortDef,
    },
    {
      question: `Why does ${term.term} matter for US employers?`,
      answer: `US employers need to understand ${term.term} because it can affect payroll accuracy, employee records, compliance documentation, manager workflows, or tax and benefits reporting.`,
    },
    {
      question: `How does CircleWorks help with ${term.term}?`,
      answer: term.cwFeature,
    },
  ];
}
