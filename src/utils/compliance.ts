import type { CandidateStage } from "@/data/mockAts";

export interface BanTheBoxJurisdiction {
  id: string;
  label: string;
  stateCode: string;
  matchers: string[];
  fairChanceAssessment?: "nyc";
}

export const BAN_THE_BOX_JURISDICTIONS: BanTheBoxJurisdiction[] = [
  { id: "ca-la", label: "Los Angeles, CA", stateCode: "CA", matchers: ["los angeles"] },
  { id: "ca-sf", label: "San Francisco, CA", stateCode: "CA", matchers: ["san francisco", "sf, ca"] },
  { id: "ca", label: "California", stateCode: "CA", matchers: ["california", ", ca"] },
  { id: "nyc", label: "New York City, NY", stateCode: "NY", matchers: ["new york city", "nyc", "manhattan", "brooklyn", "queens", "bronx", "staten island"], fairChanceAssessment: "nyc" },
  { id: "ny", label: "New York", stateCode: "NY", matchers: ["new york", ", ny"] },
  { id: "ma", label: "Massachusetts", stateCode: "MA", matchers: ["massachusetts", ", ma", "boston", "cambridge"] },
  { id: "il-chicago", label: "Chicago, IL", stateCode: "IL", matchers: ["chicago"] },
  { id: "il", label: "Illinois", stateCode: "IL", matchers: ["illinois", ", il"] },
  { id: "nj", label: "New Jersey", stateCode: "NJ", matchers: ["new jersey", ", nj", "newark", "jersey city"] },
  { id: "wa-seattle", label: "Seattle, WA", stateCode: "WA", matchers: ["seattle"] },
  { id: "wa", label: "Washington", stateCode: "WA", matchers: ["washington state", ", wa", "spokane", "tacoma"] },
  { id: "co-denver", label: "Denver, CO", stateCode: "CO", matchers: ["denver"] },
  { id: "co", label: "Colorado", stateCode: "CO", matchers: ["colorado", ", co", "boulder", "aurora"] },
  { id: "pa-philadelphia", label: "Philadelphia, PA", stateCode: "PA", matchers: ["philadelphia"] },
  { id: "dc", label: "Washington, DC", stateCode: "DC", matchers: ["washington, dc", "district of columbia"] },
  { id: "md-baltimore", label: "Baltimore, MD", stateCode: "MD", matchers: ["baltimore"] },
  { id: "or-portland", label: "Portland, OR", stateCode: "OR", matchers: ["portland, or"] },
  { id: "mn", label: "Minnesota", stateCode: "MN", matchers: ["minnesota", ", mn", "minneapolis", "st. paul", "saint paul"] },
  { id: "ct", label: "Connecticut", stateCode: "CT", matchers: ["connecticut", ", ct", "hartford"] },
  { id: "hi", label: "Hawaii", stateCode: "HI", matchers: ["hawaii", ", hi", "honolulu"] },
  { id: "ri", label: "Rhode Island", stateCode: "RI", matchers: ["rhode island", ", ri", "providence"] },
  { id: "vt", label: "Vermont", stateCode: "VT", matchers: ["vermont", ", vt", "burlington"] },
  { id: "nv", label: "Nevada", stateCode: "NV", matchers: ["nevada", ", nv", "las vegas", "reno"] },
  { id: "mo-stl", label: "St. Louis, MO", stateCode: "MO", matchers: ["st. louis", "saint louis"] },
];

export const BACKGROUND_CHECK_ALLOWED_STAGES: CandidateStage[] = ["Offer", "Hired"];

export function getBanTheBoxRule(location: string): BanTheBoxJurisdiction | null {
  const normalized = location.toLowerCase();
  return BAN_THE_BOX_JURISDICTIONS.find((jurisdiction) =>
    jurisdiction.matchers.some((matcher) => normalized.includes(matcher)),
  ) || null;
}

export function getBanTheBoxJurisdiction(location: string): string | null {
  return getBanTheBoxRule(location)?.label ?? null;
}

export function canInitiateBackgroundCheck(location: string, stage: CandidateStage) {
  const jurisdiction = getBanTheBoxRule(location);
  const allowedByStage = BACKGROUND_CHECK_ALLOWED_STAGES.includes(stage);

  return {
    jurisdiction,
    allowed: !jurisdiction || allowedByStage,
    reason: jurisdiction && !allowedByStage
      ? `Background checks in ${jurisdiction.label} can only be initiated after conditional offer`
      : null,
  };
}

export function containsCriminalHistoryQuestion(questions: Array<{ text?: string }>) {
  const restrictedPatterns = [
    /\bcriminal\b/i,
    /\bconvict(ed|ion)?\b/i,
    /\bfelony\b/i,
    /\bmisdemeanor\b/i,
    /\barrest(ed)?\b/i,
    /\bbackground check\b/i,
    /\bcrime\b/i,
  ];

  return questions.some((question) =>
    restrictedPatterns.some((pattern) => pattern.test(question.text || "")),
  );
}
