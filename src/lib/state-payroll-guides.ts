import statesJson from "../../data/states.json";

export type StateIncomeTaxBracket = {
  bracket: string;
  rate: string;
  notes: string;
};

export type StateMinimumWageCity = {
  name: string;
  rate: string;
  note: string;
};

export type StatePayrollSource = {
  label: string;
  url: string;
};

export type StatePayrollAgency = {
  name: string;
  website: string;
};

export type StatePayrollGuide = {
  stateName: string;
  name: string;
  stateCode: string;
  abbreviation: string;
  slug: string;
  dataLastReviewed: string;
  incomeTaxSummary: string;
  incomeTaxRates: StateIncomeTaxBracket[];
  withholdingForm: string;
  minimumWage: {
    statewide: string;
    effectiveDate: string;
    note: string;
    majorCities: StateMinimumWageCity[];
  };
  payFrequencyRules: string;
  suiRateRange: string;
  suiRate: string;
  keyAgencies: StatePayrollAgency[];
  workerCompNotes: string;
  paidLeavePrograms: string;
  newHireReportingDeadline: string;
  finalPayRules: string;
  uniqueRules: string[];
  relatedStates: string[];
  sources: StatePayrollSource[];
};

export const statePayrollGuideMap = statesJson as Record<string, StatePayrollGuide>;

export const statePayrollGuides = Object.values(statePayrollGuideMap).sort((a, b) =>
  a.stateName.localeCompare(b.stateName),
);

export function getStatePayrollGuide(slugOrCode: string) {
  return (
    statePayrollGuides.find((state) => state.slug === slugOrCode) ??
    statePayrollGuideMap[slugOrCode] ??
    statePayrollGuides.find((state) => state.stateCode === slugOrCode)
  );
}

export function getStateGuideSlug(state: Pick<StatePayrollGuide, "slug">) {
  return state.slug;
}

export function getStateGuideHref(state: Pick<StatePayrollGuide, "slug">) {
  return `/guides/${getStateGuideSlug(state)}`;
}

export function getRelatedStateGuides(state: StatePayrollGuide, limit = 3) {
  const configured = state.relatedStates
    .map((stateCode) => statePayrollGuideMap[stateCode])
    .filter((item): item is StatePayrollGuide => Boolean(item));

  if (configured.length >= limit) return configured.slice(0, limit);

  return [
    ...configured,
    ...statePayrollGuides.filter(
      (item) =>
        item.slug !== state.slug &&
        !configured.some((configuredItem) => configuredItem.slug === item.slug),
    ),
  ].slice(0, limit);
}
