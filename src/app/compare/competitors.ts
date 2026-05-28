export const COMPETITORS = [
  "gusto",
  "rippling",
  "adp",
  "paychex",
  "paycom",
  "bamboohr",
] as const;

export type Competitor = (typeof COMPETITORS)[number];
